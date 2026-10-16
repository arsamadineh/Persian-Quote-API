export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

/**
 * Internal request representation used by the router and handlers. Distinct
 * from the Web-standard `Request` to avoid name clashes at the fetch boundary.
 */
export interface TighRequest {
  method: HttpMethod;
  path: string;
  url: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  params: Record<string, string>;
  body: unknown;
  ip: string;
  timestamp: number;
}

/**
 * Internal response representation. Carries a pre-serialized `Uint8Array`
 * body so the cache and hot path never re-serialize JSON.
 */
export interface TighResponse {
  status: number;
  headers: Record<string, string>;
  body: Uint8Array | null;
}

export type NextFn = () => Promise<TighResponse>;

export type MiddlewareFn = (req: TighRequest, next: NextFn) => Promise<TighResponse>;

export type RouteHandler = (req: TighRequest) => Promise<TighResponse> | TighResponse;

export interface Route {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
  middlewares: MiddlewareFn[];
}

export type RouteParams = Record<string, string>;

export interface RouteCacheConfig {
  key?: (req: TighRequest) => string;
  ttl?: number;
}

export interface EngineRoute {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
  middlewares?: MiddlewareFn[];
  cache?: RouteCacheConfig;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  checkInterval: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  strategy: 'token-bucket' | 'sliding-window' | 'fixed-window' | 'gcra';
  keyGenerator?: (req: TighRequest) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
  retryAfter?: number;
}

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  halfOpenMaxAttempts: number;
  monitoringPeriod: number;
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  totalTrips: number;
}

export interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
  size: number;
}

export interface MetricsSnapshot {
  requests: {
    total: number;
    byMethod: Record<string, number>;
    byStatus: Record<string, number>;
    byPath: Record<string, number>;
  };
  latency: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
    avg: number;
    min: number;
    max: number;
    sampleSize: number;
  };
  cache: {
    hits: number;
    misses: number;
    size: number;
    memoryBytes: number;
    hitRate: number;
  };
  rateLimit: {
    totalRequests: number;
    rejected: number;
    byKey: Record<string, { allowed: number; rejected: number }>;
  };
  circuitBreaker: CircuitBreakerStats;
  uptime: number;
  startedAt: string;
  instanceId: string;
  timestamp: number;
}

export interface EngineConfig {
  cache: CacheConfig;
  rateLimit: RateLimitConfig;
  circuitBreaker: CircuitBreakerConfig;
  enableMetrics: boolean;
  enableCache: boolean;
  enableRateLimit: boolean;
  enableCircuitBreaker: boolean;
  cors: {
    origin: string;
    methods: string[];
    headers: string[];
    maxAge: number;
  };
}

export interface Engine {
  route(definition: EngineRoute): Engine;
  get(path: string, handler: RouteHandler, options?: Partial<EngineRoute>): Engine;
  post(path: string, handler: RouteHandler, options?: Partial<EngineRoute>): Engine;
  put(path: string, handler: RouteHandler, options?: Partial<EngineRoute>): Engine;
  delete(path: string, handler: RouteHandler, options?: Partial<EngineRoute>): Engine;
  options(path: string, handler: RouteHandler, options?: Partial<EngineRoute>): Engine;
  use(middleware: MiddlewareFn): Engine;
  handle(method: HttpMethod, path: string, req: TighRequest): Promise<TighResponse>;
  flushMetrics(): MetricsSnapshot;
  invalidateCache(pattern: string): number;
  destroy(): void;
  // Web-standard boundary per R10 / WS6.
  fetch(request: Request): Promise<Response>;
}

export interface CreateEngineConfig extends Partial<EngineConfig> {}
