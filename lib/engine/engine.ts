import type {
  EngineConfig,
  EngineRoute,
  HttpMethod,
  MiddlewareFn,
  Request,
  Response,
  NextFn,
  CacheConfig,
  RateLimitConfig,
} from './types';
import { TighRouter } from './router';
import { TighCache } from './cache';
import { TighMiddleware, corsMiddleware, timingMiddleware } from './middleware';
import { TighRateLimiter } from './rate-limiter';
import { TighCircuitBreaker, CircuitOpenError } from './circuit-breaker';
import { TighMetrics } from './metrics';

const DEFAULT_CONFIG: EngineConfig = {
  cache: { maxSize: 10000, defaultTTL: 60000, checkInterval: 30000 },
  rateLimit: { windowMs: 60000, maxRequests: 100, strategy: 'token-bucket' },
  circuitBreaker: { failureThreshold: 5, recoveryTimeout: 30000, halfOpenMaxAttempts: 3, monitoringPeriod: 60000 },
  enableMetrics: true,
  enableCache: true,
  enableRateLimit: true,
  enableCircuitBreaker: true,
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'X-Request-Id'],
    maxAge: 86400,
  },
};

export class Tigh {
  readonly router: TighRouter;
  readonly cache: TighCache;
  readonly middleware: TighMiddleware;
  readonly rateLimiter: TighRateLimiter;
  readonly circuitBreaker: TighCircuitBreaker;
  readonly metrics: TighMetrics;
  private config: EngineConfig;
  private routeCache: Map<string, { route: EngineRoute; compiledAt: number }> = new Map();

  constructor(config: Partial<EngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.config.cache = { ...DEFAULT_CONFIG.cache, ...config.cache };
    this.config.rateLimit = { ...DEFAULT_CONFIG.rateLimit, ...config.rateLimit };
    this.config.circuitBreaker = { ...DEFAULT_CONFIG.circuitBreaker, ...config.circuitBreaker };
    this.config.cors = { ...DEFAULT_CONFIG.cors, ...config.cors };

    this.router = new TighRouter();
    this.cache = new TighCache(this.config.cache as CacheConfig);
    this.middleware = new TighMiddleware();
    this.rateLimiter = new TighRateLimiter(this.config.rateLimit as RateLimitConfig);
    this.circuitBreaker = new TighCircuitBreaker(this.config.circuitBreaker);
    this.metrics = new TighMetrics();

    this.setupBaseMiddleware();
  }

  private setupBaseMiddleware(): void {
    this.middleware.use(corsMiddleware(this.config.cors));
    this.middleware.use(timingMiddleware());
  }

  route(definition: EngineRoute): Tigh {
    const method = definition.method;
    const middlewares = [
      ...(definition.middlewares || []),
    ];

    if (this.config.enableCache && definition.cache) {
      middlewares.push(this.createCacheMiddleware(definition));
    }

    const wrappedHandler: MiddlewareFn = async (req: Request, next: NextFn) => {
      const start = performance.now();
      try {
        let response: Response;

        if (this.config.enableCircuitBreaker) {
          try {
            response = await this.circuitBreaker.execute(() => Promise.resolve(definition.handler(req)));
          } catch (error) {
            if (error instanceof CircuitOpenError) {
              response = {
                status: 503,
                headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(error.retryAfter / 1000)) },
                body: { error: 'Service Unavailable', message: 'Circuit breaker is open. Please retry later.' },
              };
            } else {
              throw error;
            }
          }
        } else {
          response = await definition.handler(req);
        }

        const duration = performance.now() - start;
        if (this.config.enableMetrics) {
          this.metrics.recordRequest(req.method, definition.path, response.status, duration);
        }

        return response;
      } catch (error) {
        const duration = performance.now() - start;
        if (this.config.enableMetrics) {
          this.metrics.recordRequest(req.method, definition.path, 500, duration);
        }
        throw error;
      }
    };

    middlewares.push(wrappedHandler);
    this.router.addRoute(method, definition.path, () => ({ status: 200, headers: {}, body: null }), middlewares);

    return this;
  }

  get(path: string, handler: EngineRoute['handler'], options?: Partial<EngineRoute>): Tigh {
    return this.route({ method: 'GET', path, handler, ...options });
  }

  post(path: string, handler: EngineRoute['handler'], options?: Partial<EngineRoute>): Tigh {
    return this.route({ method: 'POST', path, handler, ...options });
  }

  put(path: string, handler: EngineRoute['handler'], options?: Partial<EngineRoute>): Tigh {
    return this.route({ method: 'PUT', path, handler, ...options });
  }

  delete(path: string, handler: EngineRoute['handler'], options?: Partial<EngineRoute>): Tigh {
    return this.route({ method: 'DELETE', path, handler, ...options });
  }

  private createCacheMiddleware(definition: EngineRoute): MiddlewareFn {
    return async (req: Request, next: NextFn) => {
      const cacheKey = definition.cache?.key
        ? definition.cache.key(req)
        : `cache:${req.method}:${req.path}:${JSON.stringify(req.query)}`;

      const cached = this.cache.get<Response>(cacheKey);
      if (cached) {
        return { ...cached, headers: { ...cached.headers, 'X-Cache': 'HIT' } };
      }

      const response = await next();
      if (response.status >= 200 && response.status < 300) {
        this.cache.set(cacheKey, response, definition.cache?.ttl);
      }

      return { ...response, headers: { ...response.headers, 'X-Cache': 'MISS' } };
    };
  }

  async handle(method: HttpMethod, path: string, req: Request): Promise<Response> {
    if (this.config.enableRateLimit) {
      const rateResult = this.rateLimiter.check(req);
      if (!rateResult.allowed) {
        return {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(rateResult.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateResult.resetAt),
            'Retry-After': String(rateResult.retryAfter || 60),
          },
          body: { error: 'Too Many Requests', message: 'Rate limit exceeded' },
        };
      }
    }

    const match = this.router.match(method, path);
    if (!match) {
      return this.router.getNotFoundHandler()(req);
    }

    req.params = match.params;

    const handler = async (): Promise<Response> => {
      return match.route.handler(req);
    };

    return this.middleware.execute(req, handler);
  }

  use(middleware: MiddlewareFn): Tigh {
    this.middleware.add(middleware);
    return this;
  }

  flushMetrics(): ReturnType<TighMetrics['snapshot']> {
    const snapshot = this.metrics.snapshot();
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
    const cbStats = this.circuitBreaker.getStats();
    this.metrics.updateCircuitBreakerStats(cbStats.state, cbStats.failures, cbStats.successes, cbStats.totalTrips);
    return this.metrics.snapshot();
  }

  invalidateCache(pattern: string): number {
    return this.cache.invalidatePattern(pattern);
  }

  destroy(): void {
    this.cache.destroy();
    this.rateLimiter.destroy();
    this.routeCache.clear();
  }
}
