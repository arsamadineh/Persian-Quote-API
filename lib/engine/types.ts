export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface RouteParams {
  [key: string]: string;
}

export interface Request {
  method: HttpMethod;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  params: RouteParams;
  body?: unknown;
  ip?: string;
  timestamp: number;
}

export interface Response {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  stream?: AsyncGenerator<Uint8Array>;
}

export type NextFn = () => Promise<Response>;
export type MiddlewareFn = (req: Request, next: NextFn) => Promise<Response> | Response;

export interface RouteHandler {
  (req: Request): Promise<Response> | Response;
}

export interface Route {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
  middlewares: MiddlewareFn[];
}

export interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
  size: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  checkInterval: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  strategy: 'fixed-window' | 'sliding-window' | 'token-bucket';
  keyGenerator?: (req: Request) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
  retryAfter?: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  halfOpenMaxAttempts: number;
  monitoringPeriod: number;
}

export type CircuitState = 'closed' | 'open' | 'half-open';

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
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
    memoryBytes: number;
  };
  rateLimit: {
    totalRequests: number;
    rejected: number;
    byKey: Record<string, { allowed: number; rejected: number }>;
  };
  circuitBreaker: {
    state: CircuitState;
    failures: number;
    successes: number;
    totalTrips: number;
  };
  uptime: number;
  timestamp: number;
}

export interface EngineConfig {
  cache: Partial<CacheConfig>;
  rateLimit: Partial<RateLimitConfig>;
  circuitBreaker: Partial<CircuitBreakerConfig>;
  enableMetrics: boolean;
  enableCache: boolean;
  enableRateLimit: boolean;
  enableCircuitBreaker: boolean;
  cors: {
    origin: string | string[];
    methods: string[];
    headers: string[];
    maxAge: number;
  };
}

export interface EngineRoute {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
  middlewares?: MiddlewareFn[];
  cache?: {
    ttl: number;
    key?: (req: Request) => string;
  };
  rateLimit?: Partial<RateLimitConfig>;
}
