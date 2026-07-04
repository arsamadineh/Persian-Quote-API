import type { RateLimitConfig, RateLimitResult, Request } from './types';

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

interface SlidingWindow {
  timestamps: number[];
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60000,
  maxRequests: 100,
  strategy: 'token-bucket',
};

export class TighRateLimiter {
  private config: RateLimitConfig;
  private buckets: Map<string, TokenBucket> = new Map();
  private windows: Map<string, SlidingWindow> = new Map();
  private stats = { totalRequests: 0, rejected: 0, byKey: new Map<string, { allowed: number; rejected: number }>() };
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cleanupTimer = setInterval(() => this.cleanup(), this.config.windowMs * 2);
  }

  private getKey(req: Request): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req);
    }
    return req.ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'anonymous';
  }

  private refillBucket(bucket: TokenBucket): void {
    const now = Date.now();
    const elapsed = now - bucket.lastRefill;
    const refillRate = this.config.maxRequests / this.config.windowMs;
    const tokensToAdd = elapsed * refillRate;
    bucket.tokens = Math.min(this.config.maxRequests, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  private checkTokenBucket(key: string): RateLimitResult {
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { tokens: this.config.maxRequests, lastRefill: Date.now() };
      this.buckets.set(key, bucket);
    }

    this.refillBucket(bucket);

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetAt: bucket.lastRefill + this.config.windowMs,
        limit: this.config.maxRequests,
      };
    }

    const retryAfter = Math.ceil((1 - bucket.tokens) / (this.config.maxRequests / this.config.windowMs));
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.lastRefill + this.config.windowMs,
      limit: this.config.maxRequests,
      retryAfter,
    };
  }

  private checkSlidingWindow(key: string): RateLimitResult {
    let window = this.windows.get(key);
    if (!window) {
      window = { timestamps: [] };
      this.windows.set(key, window);
    }

    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    window.timestamps = window.timestamps.filter((ts) => ts > windowStart);

    if (window.timestamps.length < this.config.maxRequests) {
      window.timestamps.push(now);
      return {
        allowed: true,
        remaining: this.config.maxRequests - window.timestamps.length,
        resetAt: window.timestamps[0] + this.config.windowMs,
        limit: this.config.maxRequests,
      };
    }

    const oldestInWindow = window.timestamps[0];
    const retryAfter = Math.ceil((oldestInWindow + this.config.windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: oldestInWindow + this.config.windowMs,
      limit: this.config.maxRequests,
      retryAfter: Math.max(1, retryAfter),
    };
  }

  private checkFixedWindow(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = Math.floor(now / this.config.windowMs) * this.config.windowMs;
    const windowKey = `${key}:${windowStart}`;

    const count = this.buckets.get(windowKey)?.tokens ?? this.config.maxRequests;

    if (count > 0) {
      this.buckets.set(windowKey, { tokens: count - 1, lastRefill: now });
      return {
        allowed: true,
        remaining: count - 1,
        resetAt: windowStart + this.config.windowMs,
        limit: this.config.maxRequests,
      };
    }

    return {
      allowed: false,
      remaining: 0,
      resetAt: windowStart + this.config.windowMs,
      limit: this.config.maxRequests,
      retryAfter: Math.ceil((windowStart + this.config.windowMs - now) / 1000),
    };
  }

  check(req: Request): RateLimitResult {
    this.stats.totalRequests++;
    const key = this.getKey(req);

    let result: RateLimitResult;
    switch (this.config.strategy) {
      case 'token-bucket':
        result = this.checkTokenBucket(key);
        break;
      case 'sliding-window':
        result = this.checkSlidingWindow(key);
        break;
      case 'fixed-window':
        result = this.checkFixedWindow(key);
        break;
    }

    const keyStats = this.stats.byKey.get(key) || { allowed: 0, rejected: 0 };
    if (result.allowed) {
      keyStats.allowed++;
    } else {
      keyStats.rejected++;
      this.stats.rejected++;
    }
    this.stats.byKey.set(key, keyStats);

    return result;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, bucket] of this.buckets) {
      if (now - bucket.lastRefill > this.config.windowMs * 3) {
        this.buckets.delete(key);
      }
    }
    for (const [key, window] of this.windows) {
      window.timestamps = window.timestamps.filter((ts) => ts > now - this.config.windowMs);
      if (window.timestamps.length === 0) {
        this.windows.delete(key);
      }
    }
  }

  getStats() {
    const byKey: Record<string, { allowed: number; rejected: number }> = {};
    for (const [key, val] of this.stats.byKey) {
      byKey[key] = { ...val };
    }
    return {
      totalRequests: this.stats.totalRequests,
      rejected: this.stats.rejected,
      byKey,
    };
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.buckets.clear();
    this.windows.clear();
  }
}
