// packages/arud/src/scan.ts
import { syllabifyHemistich, weightString, type Syllable } from "./syllable";
import { METERS, normalizePattern, type Meter } from "./meters";
import type { ScanResult } from "../../../contracts/arud";

const cache = new Map<string, ScanResult>();

function alignCost(a: string, b: string): number {
  // min-cost alignment (Levenshtein with substitution costs)
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i]![0] = i;
  for (let j = 0; j <= m; j++) dp[0]![j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const ca = a[i - 1]!;
      const cb = b[j - 1]!;
      let sub: number;
      if (ca === "X" || cb === "X") sub = 0.5;
      else if (ca === cb) sub = 0;
      else sub = 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1, // deletion
        dp[i]![j - 1]! + 1, // insertion
        dp[i - 1]![j - 1]! + sub // substitution
      );
    }
  }
  return dp[n]![m]!;
}

function scoreFor(w: string, meter: Meter): number {
  const f = meter.footPattern;
  const flen = f.length;
  if (w.length === 0 || flen === 0) return 0;
  const nFeet = Math.ceil(w.length / flen);
  let matched = 0;
  let covered = 0;
  for (let i = 0; i < nFeet; i++) {
    const chunk = w.slice(i * flen, (i + 1) * flen);
    if (chunk.length < flen) {
      // last partial foot: skip scoring but count as coverage gap
      continue;
    }
    covered++;
    const cost = alignCost(chunk, f);
    if (cost <= 1) matched++;
  }
  if (covered === 0) return 0;
  const matchRatio = matched / covered;
  // coverage penalty for leftover partial foot
  const fullCoverage = (Math.floor(w.length / flen) * flen) / w.length;
  return matchRatio * (0.7 + 0.3 * fullCoverage);
}

export function scanHemistich(h: string): ScanResult {
  const key = h.trim();
  const cached = cache.get(key);
  if (cached) return cached;

  const syllables: Syllable[] = syllabifyHemistich(key);
  const w = weightString(syllables);
  const scored = METERS.map((m) => ({ meter: m.name, score: scoreFor(w, m) })).sort(
    (a, b) => b.score - a.score
  );
  const candidates = scored.slice(0, 3).map((c) => ({ meter: c.meter, score: Number(c.score.toFixed(4)) }));
  const best = scored[0]!;
  const confidence = Number(best.score.toFixed(4));

  // feet: split weight string into foot-sized chunks using best meter's foot length
  const bestMeter = METERS.find((m) => m.name === best.meter)!;
  const flen = bestMeter.footPattern.length;
  const feet: string[] = [];
  for (let i = 0; i < w.length; i += flen) {
    feet.push(w.slice(i, i + flen));
  }

  const meter = confidence >= 0.6 ? best.meter : null;

  const result: ScanResult = {
    meter,
    feet,
    syllables: syllables.map((s) => ({ text: s.text, weight: s.weight })),
    variants: [],
    confidence,
    candidates,
  };
  cache.set(key, result);
  return result;
}

export function scanPoem(beyts: [string, string][]): {
  meter: string | null;
  confidence: number;
  perBeyt: ScanResult[][];
} {
  const perBeyt: ScanResult[][] = [];
  const votes = new Map<string, number>();
  let total = 0;
  for (const [a, b] of beyts) {
    const ra = scanHemistich(a);
    const rb = scanHemistich(b);
    perBeyt.push([ra, rb]);
    for (const r of [ra, rb]) {
      const top = r.candidates[0]?.meter;
      if (top) {
        votes.set(top, (votes.get(top) ?? 0) + 1);
        total++;
      }
    }
  }
  // winner
  let winner: string | null = null;
  let maxVotes = 0;
  for (const [m, v] of votes) {
    if (v > maxVotes) {
      maxVotes = v;
      winner = m;
    }
  }
  const confidence = total === 0 ? 0 : maxVotes / Math.max(1, beyts.length * 2);
  const poemMeter = confidence >= 0.8 ? winner : null;
  return { meter: poemMeter, confidence: Number(confidence.toFixed(4)), perBeyt };
}

export function clearCache(): void {
  cache.clear();
}
