import type { RateLimitConfig, RateLimitResult, TighRequest } from '../types';

/**
 * Generic Cell Rate Algorithm (GCRA) rate limiter, aka "leaky bucket" as a
 * virtual clock. Tracks a Theoretical Arrival Time (TAT) per key; a request
 * is allowed if now >= TAT - tolerance, otherwise it leaks toward the next
 * cell emission time.
 *
 * Emits both IETF headers (`RateLimit`, `RateLimit-Policy`) and legacy
 * `X-RateLimit-*` headers alongside `Retry-After`.
 */
export class TighGcraRateLimiter {
  private readonly config: RateLimitConfig;
  private readonly tat: Map<string, number> = new Map();
  private readonly stats = {
    totalRequests: 0,
    rejected: 0,
    byKey: new Map<string, { allowed: number; rejected: number }>(),
  };
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      windowMs: 60000,
      maxRequests: 100,
      strategy: 'gcra',
      ...config,
    };
    if (this.config.windowMs! > 0) {
      this.cleanupTimer = setInterval(() => this.cleanup(), this.config.windowMs! * 2);
    }
  }

  private getKey(req: TighRequest): string {
    if (this.config.keyGenerator) return this.config.keyGenerator(req);
    return (
      req.ip ||
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      'anonymous'
    );
  }

  check(req: TighRequest): RateLimitResult {
    this.stats.totalRequests++;
    const key = this.getKey(req);
    const now = Date.now();

    const limit = this.config.maxRequests!;
    const windowMs = this.config.windowMs!;
    // Interval between permitted cells (ms per request).
    const interval = windowMs / limit;
    // Tolerance (burst allowance): one cell.
    const tolerance = interval;

    const previousTAT = this.tat.get(key) ?? now;
    // Theoretical arrival time for this cell.
    const tat = Math.max(previousTAT, now) + interval;

    let result: RateLimitResult;
    if (now >= tat - tolerance) {
      // Allowed: cell fits. Update TAT.
      this.tat.set(key, tat);
      const remaining = Math.floor((tat - now) / interval);
      result = {
        allowed: true,
        remaining: Math.max(0, remaining),
        resetAt: tat,
        limit,
        retryAfter: undefined,
      };
    } else {
      // Rejected: do not advance TAT (it already reflects the next cell).
      const retryAfter = Math.ceil((tat - tolerance - now) / 1000);
      result = {
        allowed: false,
        remaining: 0,
        resetAt: tat,
        limit,
        retryAfter: Math.max(1, retryAfter),
      };
    }

    const keyStats = this.stats.byKey.get(key) ?? { allowed: 0, rejected: 0 };
    if (result.allowed) keyStats.allowed++;
    else {
      keyStats.rejected++;
      this.stats.rejected++;
    }
    this.stats.byKey.set(key, keyStats);

    return result;
  }

  /** Build IETF + legacy rate-limit headers from a check result. */
  headers(result: RateLimitResult): Record<string, string> {
    const retryAfterSec = Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1000));
    const headers: Record<string, string> = {
      // IETF RateLimit header: RateLimit: limit=100; remaining=50; reset=173...
      'RateLimit': `limit=${result.limit}; remaining=${result.remaining}; reset=${Math.floor(
        result.resetAt / 1000
      )}`,
      // IETF RateLimit-Policy header.
      'RateLimit-Policy': `${windowMsOf(this.config)}=${result.limit}`,
      'Retry-After': String(Math.max(1, retryAfterSec)),
      // Legacy headers.
      'X-RateLimit-Limit': String(result.limit),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(Math.floor(result.resetAt / 1000)),
    };
    if (!result.allowed && result.retryAfter) {
      headers['Retry-After'] = String(result.retryAfter);
    }
    return headers;
  }

  getStats() {
    const byKey: Record<string, { allowed: number; rejected: number }> = {};
    for (const [k, v] of this.stats.byKey) byKey[k] = { ...v };
    return {
      totalRequests: this.stats.totalRequests,
      rejected: this.stats.rejected,
      byKey,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const windowMs = this.config.windowMs!;
    for (const [key, t] of this.tat) {
      if (now - t > windowMs * 3) this.tat.delete(key);
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.tat.clear();
  }
}

function windowMsOf(config: RateLimitConfig): number {
  return config.windowMs ?? 60000;
}
