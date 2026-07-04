import type { CacheConfig, CacheEntry } from './types';

const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 10000,
  defaultTTL: 60000,
  checkInterval: 30000,
};

export class TighCache {
  private store: Map<string, CacheEntry> = new Map();
  private accessOrder: string[] = [];
  private accessIndex: Map<string, number> = new Map();
  private config: CacheConfig;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;
  private stats = { hits: 0, misses: 0 };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCleanup();
  }

  private startCleanup(): void {
    if (this.config.checkInterval > 0) {
      this.cleanupTimer = setInterval(() => this.evictExpired(), this.config.checkInterval);
    }
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) {
        this.delete(key);
      }
    }
  }

  private evictLRU(): void {
    while (this.store.size >= this.config.maxSize && this.accessOrder.length > 0) {
      const oldest = this.accessOrder.shift()!;
      this.accessIndex.delete(oldest);
      this.store.delete(oldest);
    }
  }

  private touch(key: string): void {
    const idx = this.accessIndex.get(key);
    if (idx !== undefined) {
      this.accessOrder.splice(idx, 1);
      for (let i = idx; i < this.accessOrder.length; i++) {
        this.accessIndex.set(this.accessOrder[i], i);
      }
    }
    this.accessOrder.push(key);
    this.accessIndex.set(key, this.accessOrder.length - 1);
  }

  private estimateSize(value: unknown): number {
    try {
      return JSON.stringify(value).length * 2;
    } catch {
      return 64;
    }
  }

  get<T = unknown>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    if (entry.expiresAt <= Date.now()) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }
    this.touch(key);
    this.stats.hits++;
    return entry.value as T;
  }

  set<T = unknown>(key: string, value: T, ttl?: number): void {
    const effectiveTTL = ttl ?? this.config.defaultTTL;
    const size = this.estimateSize(value);

    if (this.store.has(key)) {
      this.touch(key);
      const existing = this.store.get(key)!;
      existing.value = value;
      existing.expiresAt = Date.now() + effectiveTTL;
      existing.size = size;
      return;
    }

    this.evictLRU();
    this.store.set(key, {
      value,
      expiresAt: Date.now() + effectiveTTL,
      size,
    });
    this.accessOrder.push(key);
    this.accessIndex.set(key, this.accessOrder.length - 1);
  }

  delete(key: string): boolean {
    const idx = this.accessIndex.get(key);
    if (idx !== undefined) {
      this.accessOrder.splice(idx, 1);
      for (let i = idx; i < this.accessOrder.length; i++) {
        this.accessIndex.set(this.accessOrder[i], i);
      }
      this.accessIndex.delete(key);
    }
    return this.store.delete(key);
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (entry.expiresAt <= Date.now()) {
      this.delete(key);
      return false;
    }
    return true;
  }

  clear(): void {
    this.store.clear();
    this.accessOrder = [];
    this.accessIndex.clear();
  }

  get size(): number {
    return this.store.size;
  }

  get memoryBytes(): number {
    let total = 0;
    for (const entry of this.store.values()) {
      total += entry.size;
    }
    return total;
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      size: this.store.size,
      memoryBytes: this.memoryBytes,
    };
  }

  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let count = 0;
    for (const key of [...this.store.keys()]) {
      if (regex.test(key)) {
        this.delete(key);
        count++;
      }
    }
    return count;
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}
