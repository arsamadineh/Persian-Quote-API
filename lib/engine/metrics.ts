import type { MetricsSnapshot, CircuitState } from './types';

export class TighMetrics {
  private requestCount = 0;
  private methodCounts: Map<string, number> = new Map();
  private statusCounts: Map<string, number> = new Map();
  private pathCounts: Map<string, number> = new Map();
  private latencies: Float64Array;
  private latencyIndex = 0;
  private latencyCount = 0;
  private maxLatenciesTracked = 10000;
  private startTime = Date.now();

  private cacheStats = { hits: 0, misses: 0, size: 0, memoryBytes: 0 };
  private rateLimitStats: { totalRequests: number; rejected: number; byKey: Record<string, { allowed: number; rejected: number }> } = { totalRequests: 0, rejected: 0, byKey: {} };
  private circuitBreakerStats: { state: CircuitState; failures: number; successes: number; totalTrips: number } = {
    state: 'closed',
    failures: 0,
    successes: 0,
    totalTrips: 0,
  };

  constructor() {
    this.latencies = new Float64Array(this.maxLatenciesTracked);
  }

  recordRequest(method: string, path: string, status: number, latencyMs: number): void {
    this.requestCount++;

    this.methodCounts.set(method, (this.methodCounts.get(method) || 0) + 1);
    this.statusCounts.set(String(status), (this.statusCounts.get(String(status)) || 0) + 1);
    this.pathCounts.set(path, (this.pathCounts.get(path) || 0) + 1);

    this.latencies[this.latencyIndex] = latencyMs;
    this.latencyIndex = (this.latencyIndex + 1) % this.maxLatenciesTracked;
    if (this.latencyCount < this.maxLatenciesTracked) {
      this.latencyCount++;
    }
  }

  updateCacheStats(hits: number, misses: number, size: number, memoryBytes: number): void {
    this.cacheStats = { hits, misses, size, memoryBytes };
  }

  updateRateLimitStats(totalRequests: number, rejected: number, byKey: Record<string, { allowed: number; rejected: number }> | Map<string, { allowed: number; rejected: number }>): void {
    const record: Record<string, { allowed: number; rejected: number }> = {};
    if (byKey instanceof Map) {
      for (const [k, v] of byKey) record[k] = { ...v };
    } else {
      for (const [k, v] of Object.entries(byKey)) record[k] = { ...v };
    }
    this.rateLimitStats = { totalRequests, rejected, byKey: record };
  }

  updateCircuitBreakerStats(state: CircuitState, failures: number, successes: number, totalTrips: number): void {
    this.circuitBreakerStats = { state, failures, successes, totalTrips };
  }

  private percentile(sorted: Float64Array, length: number, p: number): number {
    if (length === 0) return 0;
    const idx = Math.ceil((p / 100) * length) - 1;
    return sorted[Math.max(0, idx)];
  }

  snapshot(): MetricsSnapshot {
    const view = this.latencyCount < this.maxLatenciesTracked
      ? this.latencies.slice(0, this.latencyCount)
      : this.latencies;
    const sorted = Float64Array.from(view).sort();
    const total = sorted.length;
    let sum = 0;
    for (let i = 0; i < total; i++) sum += sorted[i];

    const rateLimitByKey: Record<string, { allowed: number; rejected: number }> = {};
    for (const [key, val] of Object.entries(this.rateLimitStats.byKey)) {
      rateLimitByKey[key] = { ...val };
    }

    const byPath: Record<string, number> = {};
    const sortedPaths = [...this.pathCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50);
    for (const [path, count] of sortedPaths) {
      byPath[path] = count;
    }

    return {
      requests: {
        total: this.requestCount,
        byMethod: Object.fromEntries(this.methodCounts),
        byStatus: Object.fromEntries(this.statusCounts),
        byPath,
      },
      latency: {
        p50: this.percentile(sorted, total, 50),
        p90: this.percentile(sorted, total, 90),
        p95: this.percentile(sorted, total, 95),
        p99: this.percentile(sorted, total, 99),
        avg: total > 0 ? sum / total : 0,
        min: sorted[0] || 0,
        max: sorted[total - 1] || 0,
      },
      cache: {
        ...this.cacheStats,
        hitRate: this.cacheStats.hits + this.cacheStats.misses > 0
          ? this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses)
          : 0,
      },
      rateLimit: {
        totalRequests: this.rateLimitStats.totalRequests,
        rejected: this.rateLimitStats.rejected,
        byKey: rateLimitByKey,
      },
      circuitBreaker: { ...this.circuitBreakerStats },
      uptime: Date.now() - this.startTime,
      timestamp: Date.now(),
    };
  }

  reset(): void {
    this.requestCount = 0;
    this.methodCounts.clear();
    this.statusCounts.clear();
    this.pathCounts.clear();
    this.latencyIndex = 0;
    this.latencyCount = 0;
    this.startTime = Date.now();
  }
}
