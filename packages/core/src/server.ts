import type {
  Engine,
  EngineConfig,
  EngineRoute,
  HttpMethod,
  MiddlewareFn,
  NextFn,
  RouteCacheConfig,
  RouteHandler,
  RouteParams,
  TighRequest,
  TighResponse,
} from './types';
import { TighRadixRouter } from './router/radix-router';
import { PrebuiltCache, withSingleFlight } from './cache/prebuilt-cache';
import { TighGcraRateLimiter } from './rate-limiter/gcra';
import { TighCircuitBreaker, CircuitOpenError } from './circuit-breaker/circuit-breaker';
import { TighMetrics } from './telemetry/metrics';

const DEFAULT_CONFIG: EngineConfig = {
  cache: { maxSize: 2000, defaultTTL: 60000, checkInterval: 30000 },
  rateLimit: { windowMs: 60000, maxRequests: 100, strategy: 'gcra' },
  circuitBreaker: {
    failureThreshold: 5,
    recoveryTimeout: 30000,
    halfOpenMaxAttempts: 3,
    monitoringPeriod: 60000,
  },
  enableMetrics: true,
  enableCache: true,
  enableRateLimit: true,
  enableCircuitBreaker: true,
  cors: {
    origin: '*',
    methods: ['GET', 'OPTIONS', 'HEAD'],
    headers: ['Content-Type', 'Accept', 'X-Requested-With'],
    maxAge: 86400,
  },
};

function parseBool(v: string | undefined): boolean {
  return v === '1' || v === 'true' || v === 'yes';
}

function sortQuery(query: Record<string, string>): string {
  return Object.keys(query)
    .sort()
    .map((k) => `${k}=${encodeURIComponent(query[k])}`)
    .join('&');
}

/**
 * Builds an engine response with a pre-serialized Uint8Array body so the
 * cache stores bytes and the hot path never re-serializes JSON.
 */
export function jsonBody(
  value: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
): TighResponse {
  const body = typeof value === 'string' ? value : JSON.stringify(value);
  const bytes = new TextEncoder().encode(body);
  const etag = `W/"${simpleHash(body)}"`;
  return {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'private, max-age=0',
      etag,
      ...extraHeaders,
    },
    body: bytes,
  };
}

/** Simple djb2 hash for ETag generation (deterministic, no dependencies). */
function simpleHash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16);
}

export function textBody(value: string, status = 200): TighResponse {
  const bytes = new TextEncoder().encode(value);
  const etag = `W/"${simpleHash(value)}"`;
  return {
    status,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'private, max-age=0',
      etag,
    },
    body: bytes,
  };
}

export function emptyBody(status = 204): TighResponse {
  return { status, headers: {}, body: null };
}

export function problemResponse(
  status: number,
  title: string,
  detail?: string,
  type = 'https://pq.adicon.ir/problems/generic'
): TighResponse {
  const body = JSON.stringify({ type, title, status, detail });
  return {
    status,
    headers: {
      'content-type': 'application/problem+json; charset=utf-8',
      'cache-control': 'no-store',
    },
    body: new TextEncoder().encode(body),
  };
}

/**
 * Converts an internal TighResponse to a Web-standard Response.
 */
export function toWebResponse(res: TighResponse): globalThis.Response {
  const body = res.body === null ? null : res.body;
  return new globalThis.Response(body, {
    status: res.status,
    headers: res.headers as Record<string, string>,
  });
}

/**
 * Converts a Web-standard Request to an internal TighRequest.
 */
export function toTighRequest(request: Request): TighRequest {
  const url = new URL(request.url);
  const pathname = url.pathname;
  // NFC-decode Persian path per R13 / router requirement.
  const path = pathname
    .split('/')
    .map((s) => decodeURIComponent(s).normalize('NFC'))
    .join('/');

  const query: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    query[k] = v.normalize('NFC');
  });

  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => {
    headers[k] = v;
  });

  let body: unknown = undefined;
  const ct = headers['content-type'] || '';
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    if (ct.includes('application/json')) {
      try {
        body = (request as unknown as { json: () => Promise<unknown> }).json();
      } catch {
        body = undefined;
      }
    } else {
      body = (request as unknown as { text: () => Promise<string> }).text();
    }
  }

  return {
    method: request.method as HttpMethod,
    path,
    url: request.url,
    headers,
    query,
    params: {},
    body,
    ip: headers['x-forwarded-for'] || headers['x-real-ip'] || 'anonymous',
    timestamp: Date.now(),
  };
}

export class TighEngine implements Engine {
  readonly router: TighRadixRouter;
  readonly cache: PrebuiltCache;
  readonly rateLimiter: TighGcraRateLimiter;
  readonly circuitBreaker: TighCircuitBreaker;
  readonly metrics: TighMetrics;
  private readonly config: EngineConfig;

  private routeDefs: Map<string, EngineRoute> = new Map(); // key: "METHOD path"
  private middlewares: MiddlewareFn[] = [];

  constructor(config: Partial<EngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.router = new TighRadixRouter();
    this.cache = new PrebuiltCache(this.config.cache);
    this.rateLimiter = new TighGcraRateLimiter(this.config.rateLimit);
    this.circuitBreaker = new TighCircuitBreaker(this.config.circuitBreaker);
    this.metrics = new TighMetrics();
  }

  private routeKey(method: HttpMethod, path: string): string {
    return `${method} ${path}`;
  }

  route(definition: EngineRoute): Engine {
    this.router.addRoute(definition.method, definition.path, definition.handler, []);
    this.routeDefs.set(this.routeKey(definition.method, definition.path), definition);
    return this;
  }

  get(path: string, handler: RouteHandler, options?: Partial<EngineRoute>): Engine {
    return this.register('GET', path, handler, options);
  }
  post(path: string, handler: RouteHandler, options?: Partial<EngineRoute>): Engine {
    return this.register('POST', path, handler, options);
  }
  put(path: string, handler: RouteHandler, options?: Partial<EngineRoute>): Engine {
    return this.register('PUT', path, handler, options);
  }
  delete(path: string, handler: RouteHandler, options?: Partial<EngineRoute>): Engine {
    return this.register('DELETE', path, handler, options);
  }
  options(path: string, handler: RouteHandler, options?: Partial<EngineRoute>): Engine {
    return this.register('OPTIONS', path, handler, options);
  }

  private register(
    method: HttpMethod,
    path: string,
    handler: RouteHandler,
    options?: Partial<EngineRoute>
  ): Engine {
    const def: EngineRoute = {
      method,
      path,
      handler,
      middlewares: options?.middlewares,
      cache: options?.cache,
    };
    return this.route(def);
  }

  use(middleware: MiddlewareFn): Engine {
    this.middlewares.push(middleware);
    return this;
  }

  private async executeRouteChain(
    def: EngineRoute,
    req: TighRequest
  ): Promise<TighResponse> {
    const middlewares: MiddlewareFn[] = [
      ...(this.middlewares as MiddlewareFn[]),
      ...(def.middlewares || []),
    ];

    // Metrics middleware.
    if (this.config.enableMetrics) {
      middlewares.push(async (r, next) => {
        const started = performance.now();
        try {
          const response = await next();
          this.metrics.recordRequest(r.method, def.path, response.status, performance.now() - started);
          return response;
        } catch (error) {
          this.metrics.recordRequest(r.method, def.path, 500, performance.now() - started);
          throw error;
        }
      });
    }

    // Cache middleware (prebuilt cache, single-flight).
    if (this.config.enableCache && def.cache) {
      const cacheKey = def.cache.key ? def.cache.key(req) : `GET:${req.path}?${sortQuery(req.query)}`;
      const skipRandom = parseBool(req.query.random);
      middlewares.push(async (r, next) => {
        if (skipRandom) return next();
        const cached = this.cache.get(cacheKey);
        if (cached) {
          return {
            ...jsonBody(new TextDecoder().decode(cached), 200, { 'X-Cache': 'HIT' }),
            body: cached,
          };
        }
        const response = await next();
        if (response.status >= 200 && response.status < 300) {
          const bytes =
            response.body !== null ? response.body : new TextEncoder().encode(String(response.body));
          await withSingleFlight(this.cache, cacheKey, () => Promise.resolve(bytes), def.cache!.ttl);
        }
        return { ...response, headers: { ...response.headers, 'X-Cache': 'MISS' } };
      });
    }

    // Circuit breaker around the real handler.
    const wrappedHandler = async (r: TighRequest): Promise<TighResponse> => {
      if (this.config.enableCircuitBreaker) {
        return this.circuitBreaker.execute(() => def.handler(r));
      }
      return def.handler(r);
    };

    middlewares.push(wrappedHandler);

    let index = 0;
    const next: NextFn = async (): Promise<TighResponse> => {
      if (index < middlewares.length) {
        const mw = middlewares[index++]!;
        return mw(req, next);
      }
      return emptyBody(204);
    };
    return next();
  }

  async handle(method: HttpMethod, path: string, req: TighRequest): Promise<TighResponse> {
    // Rate limit (always emit IETF + legacy headers per WS6).
    let rateHeaders: Record<string, string> = {};
    if (this.config.enableRateLimit) {
      const rateResult = this.rateLimiter.check(req);
      rateHeaders = this.rateLimiter.headers(rateResult);
      if (!rateResult.allowed) {
        if (this.config.enableMetrics) {
          this.metrics.recordRequest(method, path, 429, 0);
        }
        return jsonBody(
          { error: 'Too Many Requests', message: 'Rate limit exceeded' },
          429,
          rateHeaders
        );
      }
    }

    // OPTIONS fast-path before router match.
    if (method === 'OPTIONS') {
      return { ...emptyBody(204), headers: { ...emptyBody(204).headers, ...rateHeaders } };
    }

    const matchMethod = method === 'HEAD' ? 'GET' : method;
    const match = this.router.match(matchMethod, path);
    if (!match) {
      const res = problemResponse(404, 'Not Found', `No route for ${method} ${path}`);
      if (this.config.enableMetrics) this.metrics.recordRequest(method, path, 404, 0);
      return { ...res, headers: { ...res.headers, ...rateHeaders } };
    }

    req.params = match.params;
    const def = this.routeDefs.get(this.routeKey(match.route.method, match.route.path))!;

    let response: TighResponse;
    try {
      response = await this.executeRouteChain(def, req);
    } catch (error) {
      const err = error as Error;
      if (err instanceof CircuitOpenError) {
        response = jsonBody(
          { error: 'Service Unavailable', message: 'Circuit breaker is open. Please retry later.' },
          503,
          { ...rateHeaders, 'Retry-After': String(err.retryAfter) }
        );
      } else {
        response = problemResponse(500, 'Internal Server Error', err.message);
      }
    }

    // HEAD requests return headers only, no body.
    if (method === 'HEAD') {
      response = { ...response, body: null };
    }

    if (parseBool(req.query.random)) {
      response = {
        ...response,
        headers: { ...response.headers, 'cache-control': 'no-store' },
      };
    }

    // Conditional revalidation: 304 Not Modified when If-None-Match matches.
    const inm = req.headers['if-none-match'];
    if (inm && inm === response.headers.etag) {
      response = {
        status: 304,
        headers: {
          etag: response.headers.etag,
          'cache-control': response.headers['cache-control'] ?? 'private, max-age=0',
        },
        body: null,
      };
    }

    return { ...response, headers: { ...response.headers, ...rateHeaders } };
  }

  async fetch(request: Request): Promise<globalThis.Response> {
    const ourReq = toTighRequest(request);
    const res = await this.handle(ourReq.method, ourReq.path, ourReq);
    return toWebResponse(res);
  }

  flushMetrics(): import('./types').MetricsSnapshot {
    this.metrics.updateCacheStats(
      this.cache.getStats().hits,
      this.cache.getStats().misses,
      this.cache.getStats().size,
      this.cache.getStats().memoryBytes
    );
    this.metrics.updateRateLimitStats(
      this.rateLimiter.getStats().totalRequests,
      this.rateLimiter.getStats().rejected,
      this.rateLimiter.getStats().byKey
    );
    this.metrics.updateCircuitBreakerStats(this.circuitBreaker.getStats());
    return this.metrics.snapshot();
  }

  invalidateCache(pattern: string): number {
    return this.cache.invalidatePattern(pattern);
  }

  destroy(): void {
    this.cache.destroy();
    this.rateLimiter.destroy();
    this.circuitBreaker.reset();
    this.routeDefs.clear();
    this.metrics.reset();
  }
}
