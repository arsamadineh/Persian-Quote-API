/**
 * DDSketch: a bounded, relative-error sketch for streaming quantile
 * estimation (P50–P99) without unbounded memory growth.
 *
 * Uses logarithmic bucketing with a configurable maximum relative error
 * (gamma). Memory is bounded by a fixed bucket array covering a fixed
 * dynamic range; percentiles are interpolated within the target bucket.
 */
export class DDSketch {
  private readonly gamma: number;
  private readonly alpha: number;
  private readonly numBuckets: number;
  private readonly offset: number;

  private readonly counts: Int32Array;
  private totalCount = 0;
  private sum = 0;
  private minValue = Infinity;
  private maxValue = -Infinity;

  // Dynamic range [minTrack, maxTrack]. Values outside are clamped to edge
  // buckets, keeping memory bounded.
  private readonly minTrack: number;
  private readonly maxTrack: number;

  constructor(options?: { gamma?: number; minTrack?: number; maxTrack?: number }) {
    const gamma = options?.gamma ?? 0.01; // 1% relative error
    this.gamma = gamma;
    this.alpha = (2 * gamma) / (1 - gamma);
    this.minTrack = options?.minTrack ?? 0.001; // 1 microsecond
    this.maxTrack = options?.maxTrack ?? 100000; // 100 seconds
    const logRange = Math.log(this.maxTrack / this.minTrack);
    const logBase = Math.log1p(this.alpha);
    this.numBuckets = Math.ceil(logRange / logBase) + 2;
    this.offset = Math.floor(this.numBuckets / 2);
    this.counts = new Int32Array(this.numBuckets);
  }

  private bucketIndex(value: number): number {
    if (value <= 0) return 0;
    const v = Math.min(Math.max(value, this.minTrack), this.maxTrack);
    const idx = Math.floor(Math.log(v / this.minTrack) / Math.log1p(this.alpha));
    return Math.max(0, Math.min(this.numBuckets - 1, idx + this.offset));
  }

  /** Observes a latency value in milliseconds. */
  add(value: number): void {
    if (!Number.isFinite(value)) return;
    const idx = this.bucketIndex(value);
    this.counts[idx]++;
    this.totalCount++;
    this.sum += value;
    if (value < this.minValue) this.minValue = value;
    if (value > this.maxValue) this.maxValue = value;
  }

  private bucketValue(idx: number): number {
    return this.minTrack * Math.pow(1 + this.alpha, idx - this.offset);
  }

  /**
   * Returns the p-th percentile (0-100) of observed values, or 0 if none.
   * Uses linear interpolation within the target bucket for smoothness.
   */
  percentile(p: number): number {
    if (this.totalCount === 0) return 0;
    if (p <= 0) return this.minValue === Infinity ? 0 : this.minValue;
    if (p >= 100) return this.maxValue === -Infinity ? 0 : this.maxValue;

    const target = (p / 100) * this.totalCount;
    let cum = 0;
    for (let i = 0; i < this.numBuckets; i++) {
      const c = this.counts[i];
      if (c === 0) continue;
      if (cum + c >= target) {
        // Interpolate within bucket between this bucket's value and next.
        const lo = this.bucketValue(i);
        const hi = i + 1 < this.numBuckets ? this.bucketValue(i + 1) : lo * (1 + this.alpha);
        const frac = (target - cum) / c;
        return lo + (hi - lo) * frac;
      }
      cum += c;
    }
    return this.maxValue === -Infinity ? 0 : this.maxValue;
  }

  p50(): number {
    return this.percentile(50);
  }

  p90(): number {
    return this.percentile(90);
  }

  p95(): number {
    return this.percentile(95);
  }

  p99(): number {
    return this.percentile(99);
  }

  get count(): number {
    return this.totalCount;
  }

  get avg(): number {
    return this.totalCount > 0 ? this.sum / this.totalCount : 0;
  }

  reset(): void {
    for (let i = 0; i < this.numBuckets; i++) this.counts[i] = 0;
    this.totalCount = 0;
    this.sum = 0;
    this.minValue = Infinity;
    this.maxValue = -Infinity;
  }
}

/**
 * Lightweight rolling percentile tracker using a bounded DDSketch plus
 * min/max/count/sum for telemetry snapshots.
 */
export class LatencyHistogram {
  private readonly sketch: DDSketch;
  private min = Infinity;
  private max = -Infinity;

  constructor() {
    this.sketch = new DDSketch();
  }

  observe(value: number): void {
    if (!Number.isFinite(value)) return;
    this.sketch.add(value);
    if (value < this.min) this.min = value;
    if (value > this.max) this.max = value;
  }

  get p50(): number {
    return this.sketch.p50();
  }
  get p90(): number {
    return this.sketch.p90();
  }
  get p95(): number {
    return this.sketch.p95();
  }
  get p99(): number {
    return this.sketch.p99();
  }
  get avg(): number {
    return this.sketch.avg;
  }
  get count(): number {
    return this.sketch.count;
  }
  get minValue(): number {
    return this.min === Infinity ? 0 : this.min;
  }
  get maxValue(): number {
    return this.max === -Infinity ? 0 : this.max;
  }

  reset(): void {
    this.sketch.reset();
    this.min = Infinity;
    this.max = -Infinity;
  }
}
