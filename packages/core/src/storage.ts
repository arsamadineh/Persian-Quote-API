import fs from 'node:fs';
import path from 'node:path';
import type { Poem, Poet, Collection } from '@persian-quote/schema';

export interface CanonicalStore {
  works: Map<string, Poem>;
  worksBySlug: Map<string, Poem>;
  poets: Map<string, Poet>;
  collections: Map<string, Collection>;
  counts: {
    works: number;
    poets: number;
    collections: number;
  };
}

let store: CanonicalStore | null = null;
let loading = false;

const ROOT = process.cwd();
const CANONICAL_DIR = path.join(ROOT, 'data', 'canonical');

function readJsonl<T>(file: string): T[] {
  const raw = fs.readFileSync(file, 'utf-8');
  if (!raw.trim()) return [];
  return raw
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l) as T);
}

/**
 * Loads canonical JSONL into memory. Safe to call multiple times; loads once.
 */
export function loadCanonicalStore(): CanonicalStore {
  if (store) return store;
  if (loading) {
    // Synchronous loader: wait briefly for concurrent load.
    const start = Date.now();
    while (!store && Date.now() - start < 5000) {
      // Atomics-style spin is not available; yield via a tiny loop check.
      // In single-threaded Bun this resolves immediately after load completes.
    }
    if (!store) throw new Error('Canonical store load timed out');
    return store;
  }
  loading = true;

  const worksRaw = readJsonl<Poem>(path.join(CANONICAL_DIR, 'works.jsonl'));
  const poetsRaw = readJsonl<Poet>(path.join(CANONICAL_DIR, 'poets.jsonl'));
  const collectionsRaw = readJsonl<Collection>(path.join(CANONICAL_DIR, 'collections.jsonl'));

  const works = new Map<string, Poem>();
  const worksBySlug = new Map<string, Poem>();
  for (const w of worksRaw) {
    works.set(w.id, w);
    // slug derived: poet_id from id prefix
    const slug = w.id.split('.')[0]!;
    worksBySlug.set(slug, w);
  }
  const poets = new Map<string, Poet>();
  for (const p of poetsRaw) {
    poets.set(p.slug, p);
    if (Array.isArray(p.aliases)) {
      for (const a of p.aliases) {
        if (!poets.has(a)) poets.set(a, p);
      }
    }
  }
  const collections = new Map<string, Collection>();
  for (const c of collectionsRaw) collections.set(c.slug, c);

  store = {
    works,
    worksBySlug,
    poets,
    collections,
    counts: {
      works: worksRaw.length,
      poets: poetsRaw.length,
      collections: collectionsRaw.length,
    },
  };
  loading = false;
  return store;
}

/** Reset the store (mainly for tests). */
export function resetCanonicalStore(): void {
  store = null;
  loading = false;
}

/** Pick a deterministic poem of the day in Asia/Tehran timezone. */
export function poemOfTheDay(works: Map<string, Poem>): Poem {
  const now = new Date();
  // Asia/Tehran = UTC+3:30 (no DST in Iran currently).
  const tehranOffsetMs = 3 * 60 * 60 * 1000 + 30 * 60 * 1000;
  const tehranMs = now.getTime() + tehranOffsetMs;
  const tehranDate = new Date(tehranMs);
  const dayIndex = Math.floor(tehranMs / (24 * 60 * 60 * 1000));
  const ids = Array.from(works.keys()).sort();
  const id = ids[dayIndex % ids.length]!;
  return works.get(id)!;
}

/** Deterministic Fal-e Hafez: seeded by date + a stable index. */
export function falHafez(works: Map<string, Poem>): Poem {
  const ghazals: Poem[] = [];
  for (const w of works.values()) {
    if (w.poet_id === 'hafez' && w.collection_id === 'ghazaliat') ghazals.push(w);
  }
  ghazals.sort((a, b) => a.number - b.number);
  const now = new Date();
  const tehranOffsetMs = 3 * 60 * 60 * 1000 + 30 * 60 * 1000;
  const tehranMs = now.getTime() + tehranOffsetMs;
  const dayIndex = Math.floor(tehranMs / (24 * 60 * 60 * 1000));
  const seed = dayIndex % ghazals.length;
  return ghazals[seed]!;
}
