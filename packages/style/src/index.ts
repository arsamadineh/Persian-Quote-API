// packages/style/src/index.ts
import { normalizeSearch } from "@persian-quote/persian";
import { tokenize } from "@persian-quote/persian";
import type { StyleProfile } from "../../../contracts/research";

const MFW = 300;

export function buildProfile(id: string, texts: string[]): StyleProfile {
  const tokens: string[] = [];
  for (const t of texts) tokens.push(...tokenize(normalizeSearch(t)));
  const total = tokens.length || 1;
  const counts = new Map<string, number>();
  for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, MFW);
  const mfw: Record<string, number> = {};
  for (const [w, n] of sorted) mfw[w] = n / total;

  // char 3-grams
  const charCounts = new Map<string, number>();
  let charTotal = 0;
  for (const t of texts) {
    const s = normalizeSearch(t).replace(/\s+/g, "");
    for (let i = 0; i + 3 <= s.length; i++) {
      const g = s.slice(i, i + 3);
      charCounts.set(g, (charCounts.get(g) ?? 0) + 1);
      charTotal++;
    }
  }
  const charGrams: Record<string, number> = {};
  for (const [g, n] of charCounts) charGrams[g] = n / (charTotal || 1);

  return { id, words: tokens.length, mfw, charGrams };
}

export function zScoreProfile(p: StyleProfile, corpusProfiles: StyleProfile[]): StyleProfile {
  return p; // z-scoring applied in delta()
}

function mfwUnion(profiles: StyleProfile[]): string[] {
  const set = new Set<string>();
  for (const p of profiles) for (const w of Object.keys(p.mfw)) set.add(w);
  return [...set];
}

export function burrowsDelta(text: string, profiles: StyleProfile[]): { id: string; delta: number }[] {
  const tokens = tokenize(normalizeSearch(text));
  const total = tokens.length || 1;
  const counts = new Map<string, number>();
  for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);
  const words = mfwUnion(profiles);
  // z-scores across profiles for each word
  const means = new Map<string, number>();
  const stds = new Map<string, number>();
  for (const w of words) {
    const vals = profiles.map((p) => p.mfw[w] ?? 0);
    const mean = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
    const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / (vals.length || 1);
    means.set(w, mean);
    stds.set(w, Math.sqrt(variance) || 1);
  }
  const textFreqs = new Map<string, number>();
  for (const w of words) textFreqs.set(w, (counts.get(w) ?? 0) / total);

  const results = profiles.map((p) => {
    let sum = 0, n = 0;
    for (const w of words) {
      const zText = ((textFreqs.get(w) ?? 0) - (means.get(w) ?? 0)) / (stds.get(w) ?? 1);
      const zProf = ((p.mfw[w] ?? 0) - (means.get(w) ?? 0)) / (stds.get(w) ?? 1);
      sum += (zText - zProf) ** 2;
      n++;
    }
    const delta = n === 0 ? 0 : Math.sqrt(sum / n);
    return { id: p.id, delta };
  });
  results.sort((a, b) => a.delta - b.delta);
  return results;
}

export function charNgramCosine(text: string, profiles: StyleProfile[]): { id: string; cosine: number }[] {
  const s = normalizeSearch(text).replace(/\s+/g, "");
  const counts = new Map<string, number>();
  let total = 0;
  for (let i = 0; i + 3 <= s.length; i++) {
    const g = s.slice(i, i + 3);
    counts.set(g, (counts.get(g) ?? 0) + 1);
    total++;
  }
  const vec = counts;
  const results = profiles.map((p) => {
    let dot = 0, na = 0, nb = 0;
    const keys = new Set([...vec.keys(), ...Object.keys(p.charGrams)]);
    for (const k of keys) {
      const a = vec.get(k) ?? 0;
      const b = p.charGrams[k] ?? 0;
      dot += a * b;
      na += a * a;
      nb += b * b;
    }
    const cos = na === 0 || nb === 0 ? 0 : dot / (Math.sqrt(na) * Math.sqrt(nb));
    return { id: p.id, cosine: cos };
  });
  results.sort((a, b) => b.cosine - a.cosine);
  return results;
}

export function attribute(
  text: string,
  profiles: StyleProfile[],
  o: { top?: number; bootstrap?: number } = {}
): { id: string; delta: number; confidence: number }[] {
  const top = o.top ?? 5;
  const tokens = tokenize(normalizeSearch(text));
  if (tokens.length < 200) {
    // abstain
    return [];
  }
  const delta = burrowsDelta(text, profiles);
  const maxDelta = delta.length ? delta[delta.length - 1]!.delta : 1;
  return delta.slice(0, top).map((d) => ({
    id: d.id,
    delta: Number(d.delta.toFixed(4)),
    confidence: Number(Math.max(0, 1 - d.delta / (maxDelta || 1)).toFixed(4)),
  }));
}

export function ABSTAIN_MESSAGE(): string {
  return "متن برای نتیجه‌گیری کوتاه است";
}

// Hierarchical clustering (average linkage) dendrogram of poets.
export function clusterPoets(profiles: StyleProfile[]): { leaves: string[]; merges: { a: string; b: string; dist: number }[] } {
  const leaves = profiles.map((p) => p.id);
  const dist = (a: StyleProfile, b: StyleProfile) => {
    const r = burrowsDelta(a.id, [b]); // hack: use id as text? no
    return 0;
  };
  // Use delta between profiles' mfw vectors as distance.
  function vecDist(a: StyleProfile, b: StyleProfile): number {
    const keys = new Set([...Object.keys(a.mfw), ...Object.keys(b.mfw)]);
    let s = 0, n = 0;
    for (const k of keys) {
      s += ((a.mfw[k] ?? 0) - (b.mfw[k] ?? 0)) ** 2;
      n++;
    }
    return n === 0 ? 0 : Math.sqrt(s / n);
  }
  const clusters: { ids: string[]; members: StyleProfile[] }[] = profiles.map((p) => ({ ids: [p.id], members: [p] }));
  const merges: { a: string; b: string; dist: number }[] = [];
  while (clusters.length > 1) {
    let bestI = 0, bestJ = 1, bestD = Infinity;
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        // average linkage
        let s = 0, n = 0;
        for (const a of clusters[i]!.members) {
          for (const b of clusters[j]!.members) {
            s += vecDist(a, b);
            n++;
          }
        }
        const d = n === 0 ? 0 : s / n;
        if (d < bestD) { bestD = d; bestI = i; bestJ = j; }
      }
    }
    const ci = clusters[bestI]!, cj = clusters[bestJ]!;
    merges.push({ a: ci.ids[0]!, b: cj.ids[0]!, dist: Number(bestD.toFixed(4)) });
    const merged = { ids: [...ci.ids, ...cj.ids], members: [...ci.members, ...cj.members] };
    // remove j then i
    clusters.splice(bestJ, 1);
    clusters.splice(bestI, 1);
    clusters.push(merged);
  }
  return { leaves, merges };
}

// PCA scatter (2D) via simple centering + power iteration on covariance.
export function pcaPoints(profiles: StyleProfile[]): { id: string; x: number; y: number }[] {
  const keys = mfwUnion(profiles);
  const matrix = profiles.map((p) => keys.map((k) => p.mfw[k] ?? 0));
  // center columns
  const n = matrix.length;
  const m = keys.length;
  const means = new Array(m).fill(0);
  for (let j = 0; j < m; j++) {
    for (let i = 0; i < n; i++) means[j] += matrix[i]![j]!;
    means[j] /= n;
  }
  const centered = matrix.map((row) => row.map((v, j) => v - means[j]));
  // first two principal components via power iteration on covariance
  function topEigenvector(M: number[][], iters = 50): number[] {
    const rows = M.length, cols = M[0]!.length;
    let v = new Array(cols).fill(0).map(() => Math.random());
    for (let t = 0; t < iters; t++) {
      const Mv = new Array(rows).fill(0);
      for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) Mv[i] += M[i]![j]! * v[j]!;
      // v = M^T Mv
      const newV = new Array(cols).fill(0);
      for (let j = 0; j < cols; j++) for (let i = 0; i < rows; i++) newV[j] += M[i]![j]! * Mv[i]!;
      const norm = Math.sqrt(newV.reduce((a, b) => a + b * b, 0)) || 1;
      v = newV.map((x) => x / norm);
    }
    return v;
  }
  const v1 = topEigenvector(centered);
  // deflate
  const deflated = centered.map((row) => {
    const proj = row.reduce((a, v, j) => a + v * v1[j]!, 0);
    return row.map((v, j) => v - proj * v1[j]!);
  });
  const v2 = topEigenvector(deflated);
  return profiles.map((p, i) => ({
    id: p.id,
    x: Number(centered[i]!.reduce((a, v, j) => a + v * v1[j]!, 0).toFixed(4)),
    y: Number(centered[i]!.reduce((a, v, j) => a + v * v2[j]!, 0).toFixed(4)),
  }));
}
