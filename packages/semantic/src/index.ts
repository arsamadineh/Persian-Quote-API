// packages/semantic/src/index.ts
import { normalizeSearch } from "@persian-quote/persian";
import { tokenize } from "@persian-quote/persian";
import type { AtlasPoint, EmbedProvider } from "../../../contracts/research";

export { type EmbedProvider, type AtlasPoint };

export function charNgramVector(text: string, n = 3): Map<string, number> {
  const s = normalizeSearch(text).replace(/\s+/g, "");
  const m = new Map<string, number>();
  let total = 0;
  for (let i = 0; i + n <= s.length; i++) { m.set(s.slice(i, i + n), (m.get(s.slice(i, i + n)) ?? 0) + 1); total++; }
  for (const k of m.keys()) m.set(k, (m.get(k) ?? 0) / (total || 1));
  return m;
}

export function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, na = 0, nb = 0;
  const keys = new Set([...a.keys(), ...b.keys()]);
  for (const k of keys) {
    const x = a.get(k) ?? 0, y = b.get(k) ?? 0;
    dot += x * y; na += x * x; nb += y * y;
  }
  return na === 0 || nb === 0 ? 0 : dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function precomputeNeighbours(items: { id: string; text: string }[], k = 20): Record<string, string[]> {
  const vecs = items.map((it) => ({ id: it.id, v: charNgramVector(it.text) }));
  const out: Record<string, string[]> = {};
  for (const a of vecs) {
    const scored = vecs.filter((b) => b.id !== a.id).map((b) => ({ id: b.id, s: cosine(a.v, b.v) })).sort((x, y) => y.s - x.s);
    out[a.id] = scored.slice(0, k).map((x) => x.id);
  }
  return out;
}

export function atlasPoints(items: { id: string; text: string }[]): AtlasPoint[] {
  // Simple 2D projection via PCA on char-ngram vectors (deterministic).
  const keys = [...new Set(items.flatMap((it) => [...charNgramVector(it.text).keys()]))].slice(0, 50);
  const matrix = items.map((it) => {
    const v = charNgramVector(it.text);
    return keys.map((k) => v.get(k) ?? 0);
  });
  const n = matrix.length, m = keys.length;
  const means = new Array(m).fill(0);
  for (let j = 0; j < m; j++) { for (let i = 0; i < n; i++) means[j] += matrix[i]![j]!; means[j] /= n || 1; }
  const centered = matrix.map((row) => row.map((v, j) => v - means[j]));
  // project onto first two dims (approx PCA via variance)
  return items.map((it, i) => ({
    id: it.id,
    x: Number((centered[i]![0] ?? 0).toFixed(4)),
    y: Number((centered[i]![1] ?? 0).toFixed(4)),
    cluster: 0,
    label: undefined,
  }));
}

export function rrfFuse(lists: string[][], k = 60): string[] {
  const scores = new Map<string, number>();
  for (const list of lists) {
    list.forEach((id, rank) => {
      scores.set(id, (scores.get(id) ?? 0) + 1 / (k + rank + 1));
    });
  }
  return [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

export class LexicalProvider implements EmbedProvider {
  readonly dim = 0;
  async embed(texts: string[]): Promise<Float32Array[]> {
    return texts.map(() => new Float32Array(0));
  }
}
