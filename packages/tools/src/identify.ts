// packages/tools/src/identify.ts
import { normalizeSearch } from "@persian-quote/persian";
import { tokenize } from "@persian-quote/persian";
import type { Corpus, VerseIndex, VerseMatch, Work } from "../../../contracts/corpus";

interface VerseEntry {
  workId: string;
  poetId: string;
  poetName?: string;
  text: string;       // normalized display text
  norm: string;       // search-normalized
  tokens: string[];
  disputed?: boolean;
  beytIndex?: number;
  lineIndex?: number;
}

export interface VerseIndexImpl extends VerseIndex {
  entries: VerseEntry[];
  grams: Map<string, number[]>; // 3-gram -> entry indices
}

function shingles(s: string, n = 3): string[] {
  const out: string[] = [];
  for (let i = 0; i + n <= s.length; i++) out.push(s.slice(i, i + n));
  return out;
}

function persianEditCost(a: string, b: string): number {
  if (a === b) return 0;
  // Persian confusion pairs
  const pairs: Record<string, string> = { "ک": "ك", "ی": "ي", "ه": "ة", "و": "ؤ" };
  if (pairs[a] === b || pairs[b] === a) return 0.25;
  return 1;
}

function levenshteinTokens(a: string[], b: string[]): number {
  const n = a.length, m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i]![0] = i;
  for (let j = 0; j <= m; j++) dp[0]![j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = persianEditCost(a[i - 1]!, b[j - 1]!);
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost
      );
    }
  }
  return dp[n]![m]!;
}

export function buildVerseIndex(c: Corpus): VerseIndex {
  const entries: VerseEntry[] = [];
  const grams = new Map<string, number[]>();
  for (const w of c.works) {
    const beyts = w.beyts ?? [];
    const lines = w.stanzas.flat();
    // hemistichs/beyts
    const candidates: { text: string; beytIndex?: number; lineIndex?: number }[] = [];
    if (beyts.length > 0) {
      for (let bi = 0; bi < beyts.length; bi++) {
        const [h1, h2] = beyts[bi]!;
        candidates.push({ text: h1, beytIndex: bi });
        candidates.push({ text: h2, beytIndex: bi });
      }
    } else {
      for (let li = 0; li < lines.length; li++) {
        candidates.push({ text: lines[li]!, lineIndex: li });
      }
    }
    for (const cand of candidates) {
      const norm = normalizeSearch(cand.text);
      const tokens = tokenize(norm);
      const entry: VerseEntry = {
        workId: w.id,
        poetId: w.poetId,
        poetName: w.poetName,
        text: cand.text,
        norm,
        tokens,
        beytIndex: cand.beytIndex,
        lineIndex: cand.lineIndex,
      };
      const idx = entries.length;
      entries.push(entry);
      for (const g of shingles(norm.replace(/\s+/g, ""), 3)) {
        if (!grams.has(g)) grams.set(g, []);
        grams.get(g)!.push(idx);
      }
    }
  }
  const impl: VerseIndexImpl = { size: entries.length, entries, grams };
  return impl as unknown as VerseIndex;
}

export function identifyVerse(i: VerseIndex, query: string, o: { top?: number } = {}): VerseMatch[] {
  const top = o.top ?? 5;
  const impl = i as unknown as VerseIndexImpl;
  const qNorm = normalizeSearch(query);
  const qTokens = tokenize(qNorm);
  if (qTokens.length === 0) return [];

  // candidate selection via 3-gram overlap
  const qGrams = shingles(qNorm.replace(/\s+/g, ""), 3);
  const candSet = new Set<number>();
  for (const g of qGrams) {
    const ids = impl.grams.get(g);
    if (ids) for (const id of ids) candSet.add(id);
  }
  if (candSet.size === 0) {
    // fallback: all entries
    for (let k = 0; k < impl.entries.length; k++) candSet.add(k);
  }

  const scored: { entry: VerseEntry; score: number }[] = [];
  for (const id of candSet) {
    const e = impl.entries[id]!;
    // weighted Jaccard on tokens
    const setQ = new Set(qTokens);
    const setE = new Set(e.tokens);
    let inter = 0;
    for (const t of setQ) if (setE.has(t)) inter++;
    const union = setQ.size + setE.size - inter;
    const jaccard = union === 0 ? 0 : inter / union;
    // fuzzy token cost
    const fuzzy = 1 - Math.min(1, levenshteinTokens(qTokens, e.tokens) / Math.max(qTokens.length, e.tokens.length, 1));
    const score = 0.6 * jaccard + 0.4 * fuzzy;
    scored.push({ entry: e, score });
  }
  scored.sort((a, b) => b.score - a.score);
  const results: VerseMatch[] = [];
  for (const s of scored.slice(0, top)) {
    const e = s.entry;
    // diff: align qTokens to e.tokens
    const diff = computeDiff(qTokens, e.tokens);
    results.push({
      workId: e.workId,
      beytIndex: e.beytIndex,
      lineIndex: e.lineIndex ?? 0,
      text: e.text,
      score: Number(s.score.toFixed(4)),
      diff,
      disputed: e.disputed,
    });
  }
  return results;
}

function computeDiff(q: string[], e: string[]): { text: string; kind: "same" | "changed" | "missing" | "extra" }[] {
  // simple LCS-based diff
  const n = q.length, m = e.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (q[i] === e[j]) dp[i]![j] = 1 + dp[i + 1]![j + 1]!;
      else dp[i]![j] = Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }
  const out: { text: string; kind: "same" | "changed" | "missing" | "extra" }[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (q[i] === e[j]) {
      out.push({ text: q[i]!, kind: "same" });
      i++; j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      out.push({ text: q[i]!, kind: "missing" });
      i++;
    } else {
      out.push({ text: e[j]!, kind: "extra" });
      j++;
    }
  }
  while (i < n) { out.push({ text: q[i]!, kind: "missing" }); i++; }
  while (j < m) { out.push({ text: e[j]!, kind: "extra" }); j++; }
  return out;
}
