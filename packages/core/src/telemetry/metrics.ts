import type {
  CircuitBreakerStats,
  MetricsSnapshot,
} from '../types';
import { DDSketch } from './ddsketch';

interface PathStats {
  count: number;
  sketch: DDSketch;
}

export class TighMetrics {
  private requestCount = 0;
  private readonly methodCounts = new Map<string, number>();
  private readonly statusCounts = new Map<string, number>();
  private readonly pathStats = new Map<string, PathStats>();
  private readonly sketch: DDSketch;
  private startTime = Date.now();
  private instanceId: string;

  private minLatency = Infinity;
  private maxLatency = -Infinity;

  private cacheStats = { hits: 0, misses: 0, size: 0, memoryBytes: 0 };
  private rateLimitStats = {
    totalRequests: 0,
    rejected: 0,
    byKey: {} as Record<string, { allowed: number; rejected: number }>,
  };
  private circuitBreakerStats: CircuitBreakerStats = {
    state: 'closed',
    failures: 0,
    successes: 0,
    totalTrips: 0,
  };

  constructor() {
    this.sketch = new DDSketch({ gamma: 0.01 });
    this.instanceId = `${this.startTime.toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }

  private getSketch(path: string): DDSketch {
    let ps = this.pathStats.get(path);
    if (!ps) {
      ps = { count: 0, sketch: new DDSketch() };
      this.pathStats.set(path, ps);
    }
    return ps.sketch;
  }

  recordRequest(method: string, path: string, status: number, latencyMs: number): void {
    this.requestCount++;
    this.methodCounts.set(method, (this.methodCounts.get(method) || 0) + 1);
    this.statusCounts.set(String(status), (this.statusCounts.get(String(status)) || 0) + 1);

    if (latencyMs < this.minLatency) this.minLatency = latencyMs;
    if (latencyMs > this.maxLatency) this.maxLatency = latencyMs;

    const ps = this.pathStats.get(path);
    if (ps) {
      ps.count++;
      ps.sketch.add(latencyMs);
    } else {
      const s = new DDSketch();
      s.add(latencyMs);
      this.pathStats.set(path, { count: 1, sketch: s });
    }

    this.sketch.add(latencyMs);
  }

  updateCacheStats(hits: number, misses: number, size: number, memoryBytes: number): void {
    this.cacheStats = { hits, misses, size, memoryBytes };
  }

  updateRateLimitStats(
    totalRequests: number,
    rejected: number,
    byKey: Record<string, { allowed: number; rejected: number }>
  ): void {
    this.rateLimitStats = { totalRequests, rejected, byKey: { ...byKey } };
  }

  updateCircuitBreakerStats(stats: CircuitBreakerStats): void {
    this.circuitBreakerStats = { ...stats };
  }

  snapshot(): MetricsSnapshot {
    // Global latency percentiles from the combined sketch.
    const total = this.sketch.count;
    const p = (p: number) => this.sketch.percentile(p);

    const byPath: Record<string, number> = {};
    const sortedPaths = [...this.pathStats.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 50);
    for (const [path, ps] of sortedPaths) {
      byPath[path] = ps.count;
    }

    let sum = 0;
    // Approximate sum via avg * count isn't exact; recompute from per-path isn't stored.
    // Use sketch avg as proxy for avg latency.
    const avg = this.sketch.avg;

    return {
      requests: {
        total: this.requestCount,
        byMethod: Object.fromEntries(this.methodCounts),
        byStatus: Object.fromEntries(this.statusCounts),
        byPath,
      },
      latency: {
        p50: p(50),
        p90: p(90),
        p95: p(95),
        p99: p(99),
        avg,
        min: total > 0 ? this.minLatency === Infinity ? 0 : this.minLatency : 0,
        max: total > 0 ? this.maxLatency === -Infinity ? 0 : this.maxLatency : 0,
        sampleSize: total,
      },
      cache: {
        ...this.cacheStats,
        hitRate:
          this.cacheStats.hits + this.cacheStats.misses > 0
            ? this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses)
            : 0,
      },
      rateLimit: this.rateLimitStats,
      circuitBreaker: { ...this.circuitBreakerStats },
      uptime: Date.now() - this.startTime,
      startedAt: new Date(this.startTime).toISOString(),
      instanceId: this.instanceId,
      timestamp: Date.now(),
    };
  }

  reset(): void {
    this.requestCount = 0;
    this.methodCounts.clear();
    this.statusCounts.clear();
    this.pathStats.clear();
    this.sketch.reset();
    this.cacheStats = { hits: 0, misses: 0, size: 0, memoryBytes: 0 };
    this.rateLimitStats = { totalRequests: 0, rejected: 0, byKey: {} };
    this.circuitBreakerStats = {
      state: 'closed',
      failures: 0,
      successes: 0,
      totalTrips: 0,
    };
    this.startTime = Date.now();
    this.instanceId = `${this.startTime.toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }
}
