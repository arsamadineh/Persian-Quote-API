/**
 * Persian Quote API — TypeScript SDK.
 *
 * Provides a typed client with automatic failover across multiple origin URLs
 * and optional offline data access (load canonical JSONL from a bundle).
 */

export interface Poem {
  id: string;
  title: string;
  poet_name: string;
  poet_id: string;
  collection_id: string;
  collection_title: string;
  form: string;
  stanzas: string[][];
  text_plain: string;
  [key: string]: any;
}

export interface Poet {
  slug: string;
  name_persian: string;
  name_english: string;
  era: string;
  [key: string]: any;
}

export interface SearchOptions {
  q?: string;
  poet?: string;
  collection?: string;
  form?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  items: Poem[];
  count: number;
  total: number;
}

export interface PersianQuoteSDKOptions {
  origins: string[];
  offlineData?: { works: Poem[]; poets: Poet[] };
  timeoutMs?: number;
}

export class PersianQuoteSDK {
  private origins: string[];
  private originIndex = 0;
  private timeoutMs: number;
  private offline: boolean;
  private works: Poem[] = [];
  private poets: Poet[] = [];

  constructor(options: PersianQuoteSDKOptions) {
    this.origins = options.origins;
    this.timeoutMs = options.timeoutMs ?? 5000;
    this.offline = !!options.offlineData;
    if (options.offlineData) {
      this.works = options.offlineData.works;
      this.poets = options.offlineData.poets;
    }
  }

  private currentOrigin(): string {
    return this.origins[this.originIndex % this.origins.length];
  }

  private rotateOrigin(): void {
    this.originIndex = (this.originIndex + 1) % this.origins.length;
  }

  private async fetchWithFailover(path: string, init: RequestInit = {}): Promise<Response> {
    let lastError: any = null;
    for (let i = 0; i < this.origins.length; i++) {
      const url = this.currentOrigin() + path;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
        const res = await fetch(url, { ...init, signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) return res;
        throw new Error(`HTTP ${res.status}`);
      } catch (e) {
        lastError = e;
        this.rotateOrigin();
      }
    }
    throw lastError ?? new Error('All origins failed');
  }

  async health(): Promise<{ status: string }> {
    if (this.offline) return { status: 'ok' };
    const res = await this.fetchWithFailover('/v1/health');
    return res.json();
  }

  async getPoem(id: string): Promise<Poem> {
    if (this.offline) {
      const w = this.works.find((x) => x.id === id);
      if (!w) throw new Error(`Poem ${id} not found`);
      return w;
    }
    const res = await this.fetchWithFailover(`/v1/works/${encodeURIComponent(id)}`);
    return res.json();
  }

  async randomPoem(): Promise<Poem> {
    if (this.offline) {
      const w = this.works[Math.floor(Math.random() * this.works.length)]!;
      return w;
    }
    const res = await this.fetchWithFailover('/v1/works/random');
    return res.json();
  }

  async dailyPoem(): Promise<{ poem: Poem }> {
    if (this.offline) {
      const w = this.works[Math.floor(Math.random() * this.works.length)]!;
      return { poem: w };
    }
    const res = await this.fetchWithFailover('/v1/daily');
    return res.json();
  }

  async falHafez(): Promise<{ poem: Poem }> {
    if (this.offline) {
      const w = this.works.find((x) => x.poet_id === 'hafez')!;
      return { poem: w };
    }
    const res = await this.fetchWithFailover('/v1/fal');
    return res.json();
  }

  async search(opts: SearchOptions = {}): Promise<SearchResult> {
    if (this.offline) {
      const q = (opts.q ?? '').toLowerCase();
      let filtered = this.works.filter((w) => {
        const haystack = `${w.title} ${w.text_plain} ${w.poet_name}`.toLowerCase();
        return !q || haystack.includes(q);
      });
      if (opts.poet) filtered = filtered.filter((w) => w.poet_id === opts.poet);
      if (opts.tag) filtered = filtered.filter((w) => (w.tags as string[]).includes(opts.tag!));
      const total = filtered.length;
      const limit = opts.limit ?? 20;
      const offset = opts.offset ?? 0;
      const items = filtered.slice(offset, offset + limit);
      return { items, count: items.length, total };
    }
    const params = new URLSearchParams();
    if (opts.q) params.set('q', opts.q);
    if (opts.poet) params.set('poet', opts.poet);
    if (opts.collection) params.set('collection', opts.collection);
    if (opts.tag) params.set('tag', opts.tag);
    if (opts.limit) params.set('limit', String(opts.limit));
    if (opts.offset) params.set('offset', String(opts.offset));
    const res = await this.fetchWithFailover(`/v1/search?${params}`);
    return res.json();
  }

  async listPoets(): Promise<Poet[]> {
    if (this.offline) return this.poets;
    const res = await this.fetchWithFailover('/v1/poets');
    const json = await res.json();
    return json.items;
  }

  async close(): Promise<void> {
    // No persistent connections to close.
  }
}

export { PersianQuoteSDK as default };
