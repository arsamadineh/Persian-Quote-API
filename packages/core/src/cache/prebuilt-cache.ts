import type { CacheConfig, CacheEntry } from '../types';

/**
 * Frequency-bounded ghost ledger used by the W-TinyLFU admission filter.
 * Evicted keys keep their access frequency for a bounded time so that
 * repeat-but-evicted items can be re-admitted on sight.
 */
class GhostLedger {
  private map: Map<string, number> = new Map();
  private order: string[] = [];
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: string): number | undefined {
    return this.map.get(key);
  }

  set(key: string, freq: number): void {
    if (this.map.has(key)) {
      this.map.set(key, freq);
      return;
    }
    if (this.order.length >= this.maxSize) {
      const evict = this.order.shift()!;
      this.map.delete(evict);
    }
    this.map.set(key, freq);
    this.order.push(key);
  }

  delete(key: string): void {
    if (this.map.delete(key)) {
      const idx = this.order.indexOf(key);
      if (idx >= 0) this.order.splice(idx, 1);
    }
  }

  size(): number {
    return this.map.size;
  }
}

interface CacheItem {
  value: Uint8Array;
  expiresAt: number;
  size: number;
  freq: number;
}

/**
 * Prebuilt response cache.
 *
 * Stores pre-serialized JSON `Uint8Array` fragments so the hot path never
 * calls `JSON.stringify`. Implements S3-FIFO with a W-TinyLFU admission
 * filter: new entries land in the `in` FIFO; on pressure they flow to
 * `probation`, and are promoted to `main` only on re-access. A TinyLFU
 * filter compares access frequencies before admitting to `main`, protecting
 * the cache from one-time scans.
 *
 * Single-flight request coalescing is performed by callers via
 * `withSingleFlight`.
 */
export class PrebuiltCache {
  private readonly maxSize: number;
  private readonly defaultTTL: number;
  private readonly inMax: number;
  private readonly probationMax: number;
  private readonly mainMax: number;

  // S3-FIFO queues (insertion-ordered Maps).
  private readonly inQueue: Map<string, CacheItem> = new Map();
  private readonly probation: Map<string, CacheItem> = new Map();
  private readonly main: Map<string, CacheItem> = new Map();

  private ghost = new GhostLedger(2000);
  private readonly freq = new Map<string, number>();

  private stats = { hits: 0, misses: 0 };
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    const cfg = { maxSize: 2000, defaultTTL: 60000, checkInterval: 30000, ...config };
    this.maxSize = cfg.maxSize;
    this.defaultTTL = cfg.defaultTTL;
    // Queue size ratios: in 25%, probation 25%, main 50%.
    this.inMax = Math.max(1, Math.floor(this.maxSize * 0.25));
    this.probationMax = Math.max(1, Math.floor(this.maxSize * 0.25));
    this.mainMax = Math.max(1, this.maxSize - this.inMax - this.probationMax);
    if (cfg.checkInterval > 0) {
      this.cleanupTimer = setInterval(() => this.evictExpired(), cfg.checkInterval);
    }
  }

  /** Returns the pre-serialized fragment or null on miss. No JSON.parse on hot path. */
  get(key: string): Uint8Array | null {
    const now = Date.now();

    let item = this.main.get(key);
    if (item) {
      if (item.expiresAt <= now) {
        this.main.delete(key);
        this.freq.delete(key);
      } else {
        this.stats.hits++;
        this.freq.set(key, (this.freq.get(key) || 0) + 1);
        return item.value;
      }
    }

    item = this.probation.get(key);
    if (item) {
      if (item.expiresAt <= now) {
        this.probation.delete(key);
        this.freq.delete(key);
      } else {
        this.stats.hits++;
        this.freq.set(key, (this.freq.get(key) || 0) + 1);
        this.promoteToMain(key, item);
        return item.value;
      }
    }

    item = this.inQueue.get(key);
    if (item) {
      if (item.expiresAt <= now) {
        this.inQueue.delete(key);
        this.freq.delete(key);
      } else {
        this.stats.hits++;
        this.freq.set(key, (this.freq.get(key) || 0) + 1);
        return item.value;
      }
    }

    this.stats.misses++;
    return null;
  }

  /** Stores a pre-serialized fragment. Returns true if admitted. */
  set(key: string, value: Uint8Array, ttl?: number): void {
    const now = Date.now();
    const effectiveTTL = ttl ?? this.defaultTTL;
    const size = value.byteLength;
    const expiresAt = now + effectiveTTL;

    // Refresh if already present.
    let item = this.main.get(key);
    if (item) {
      item.value = value;
      item.expiresAt = expiresAt;
      item.size = size;
      this.freq.set(key, (this.freq.get(key) || 0) + 1);
      return;
    }
    item = this.probation.get(key);
    if (item) {
      this.promoteToMain(key, { value, expiresAt, size, freq: (this.freq.get(key) || 0) + 1 });
      return;
    }
    item = this.inQueue.get(key);
    if (item) {
      item.value = value;
      item.expiresAt = expiresAt;
      item.size = size;
      this.freq.set(key, (this.freq.get(key) || 0) + 1);
      return;
    }

    // New entry: ghost frequency reflects prior sightings.
    const ghostFreq = this.ghost.get(key) ?? 0;
    const entry: CacheItem = { value, expiresAt, size, freq: Math.max(1, ghostFreq + 1) };

    this.admit(key, entry);
  }

  private admit(key: string, entry: CacheItem): void {
    // Drain inQueue when full: front item moves to probation.
    if (this.inQueue.size >= this.inMax) {
      const [victimKey, victim] = this.inQueue.entries().next().value as [string, CacheItem];
      this.inQueue.delete(victimKey);
      this.ghost.set(victimKey, victim.freq);
      this.freq.delete(victimKey);

      if (this.probation.size >= this.probationMax) {
        // Probation full: TinyLFU admission filter.
        const [probVictimKey, probVictim] = this.probation.entries().next().value as [
          string,
          CacheItem,
        ];
        this.probation.delete(probVictimKey);
        this.ghost.set(probVictimKey, probVictim.freq);
        this.freq.delete(probVictimKey);

        const candidateFreq = entry.freq;
        const victimFreq = this.ghost.get(probVictimKey) ?? probVictim.freq;

        if (candidateFreq >= victimFreq) {
          // Admit candidate to main; evict main LRU if full.
          if (this.main.size >= this.mainMax) {
            const [mainVictimKey, mainVictim] = this.main.entries().next().value as [
              string,
              CacheItem,
            ];
            this.main.delete(mainVictimKey);
            this.ghost.set(mainVictimKey, mainVictim.freq);
            this.freq.delete(mainVictimKey);
          }
          this.main.set(key, entry);
          this.freq.set(key, entry.freq);
        }
        // Else: candidate is dropped (not cached). Probation victim is evicted.
      } else {
        this.probation.set(victimKey, victim);
      }
    }

    this.inQueue.set(key, entry);
    this.freq.set(key, entry.freq);
  }

  private promoteToMain(key: string, item: CacheItem): void {
    this.probation.delete(key);
    if (this.main.size >= this.mainMax) {
      const [mainVictimKey, mainVictim] = this.main.entries().next().value as [
        string,
        CacheItem,
      ];
      this.main.delete(mainVictimKey);
      this.ghost.set(mainVictimKey, mainVictim.freq);
      this.freq.delete(mainVictimKey);
    }
    this.main.set(key, item);
    this.freq.set(key, item.freq);
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.main.delete(key);
    this.probation.delete(key);
    this.inQueue.delete(key);
    this.freq.delete(key);
    this.ghost.delete(key);
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const map of [this.main, this.probation, this.inQueue]) {
      for (const [key, item] of map) {
        if (item.expiresAt <= now) {
          map.delete(key);
          this.freq.delete(key);
          this.ghost.set(key, item.freq);
        }
      }
    }
  }

  clear(): void {
    this.main.clear();
    this.probation.clear();
    this.inQueue.clear();
    this.freq.clear();
    this.ghost = new GhostLedger(2000);
    this.stats = { hits: 0, misses: 0 };
  }

  size(): number {
    return this.main.size + this.probation.size + this.inQueue.size;
  }

  memoryBytes(): number {
    let total = 0;
    for (const item of this.main.values()) total += item.size;
    for (const item of this.probation.values()) total += item.size;
    for (const item of this.inQueue.values()) total += item.size;
    return total;
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      size: this.size(),
      memoryBytes: this.memoryBytes(),
    };
  }

  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let count = 0;
    for (const map of [this.main, this.probation, this.inQueue]) {
      for (const key of [...map.keys()]) {
        if (regex.test(key)) {
          map.delete(key);
          this.freq.delete(key);
          count++;
        }
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

/**
 * Executes a factory with single-flight request coalescing. Concurrent
 * callers with the same `key` share a single in-flight promise; the result
 * is cached as a pre-serialized fragment.
 */
export async function withSingleFlight<T>(
  cache: PrebuiltCache,
  key: string,
  factory: () => Promise<Uint8Array>,
  ttl?: number
): Promise<Uint8Array> {
  const cached = cache.get(key);
  if (cached) return cached;

  // Single-flight map is stored on the cache instance via a symbol-like
  // WeakMap keyed by cache instance. We attach it lazily.
  let inflight = (inflightMap.get(cache) ?? new Map<string, Promise<Uint8Array>>());
  inflightMap.set(cache, inflight);

  const existing = inflight.get(key);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const value = await factory();
      cache.set(key, value, ttl);
      return value;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}

const inflightMap = new WeakMap<object, Map<string, Promise<Uint8Array>>>();
