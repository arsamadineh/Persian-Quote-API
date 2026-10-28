// packages/arud/src/scan.ts
import { syllabifyHemistich, weightString, type Syllable } from "./syllable";
import { METERS, type Meter } from "./meters";
import type { ScanResult } from "../../../contracts/arud";

const cache = new Map<string, ScanResult>();

function alignCost(a: string, b: string): number {
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
      if (ca === cb || ca === "X" || cb === "X") {
        sub = 0;
      } else {
        sub = 1;
      }
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + sub
      );
    }
  }
  return dp[n]![m]!;
}

function scoreFor(w: string, meter: Meter): number {
  if (w.length === 0) return 0;

  // 1. Score against full classical hemistich templates if present
  let bestFullScore = 0;
  if (meter.fullPatterns && meter.fullPatterns.length > 0) {
    for (const fullPat of meter.fullPatterns) {
      const maxLen = Math.max(w.length, fullPat.length);
      const cost = alignCost(w, fullPat);
      const sim = Math.max(0, 1 - cost / maxLen);
      if (sim > bestFullScore) bestFullScore = sim;
    }
  }

  // 2. Score against repeating foot pattern
  const f = meter.footPattern;
  const flen = f.length;
  let footScore = 0;
  if (flen > 0) {
    const nFeet = Math.ceil(w.length / flen);
    let totalSim = 0;
    let covered = 0;
    for (let i = 0; i < nFeet; i++) {
      const chunk = w.slice(i * flen, (i + 1) * flen);
      if (chunk.length === 0) continue;
      covered++;
      const target = chunk.length < flen ? f.slice(0, chunk.length) : f;
      const cost = alignCost(chunk, target);
      const sim = Math.max(0, 1 - cost / Math.max(chunk.length, target.length));
      totalSim += sim;
    }
    if (covered > 0) {
      footScore = totalSim / covered;
    }
  }

  return Math.max(bestFullScore, footScore * 0.92);
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
  const candidates = scored
    .slice(0, 3)
    .map((c) => ({ meter: c.meter, score: Number(c.score.toFixed(4)) }));
  const best = scored[0]!;
  const confidence = Number(best.score.toFixed(4));

  const bestMeter = METERS.find((m) => m.name === best.meter)!;

  // Resolve non-final flexible (X) syllables using the matched full pattern when lengths align
  const matchedFull = bestMeter.fullPatterns?.find((fp) => fp.length === syllables.length);
  if (matchedFull) {
    for (let i = 0; i < syllables.length - 1; i++) {
      if (syllables[i]!.weight === "X") {
        const targetW = matchedFull[i];
        if (targetW === "L" || targetW === "S") {
          syllables[i]!.weight = targetW;
        }
      }
    }
  }

  const resolvedW = weightString(syllables);
  const flen = Math.min(4, Math.max(3, bestMeter.footPattern.length));
  const feet: string[] = [];
  for (let i = 0; i < resolvedW.length; i += flen) {
    feet.push(resolvedW.slice(i, i + flen));
  }

  const meter = confidence >= 0.55 ? best.meter : null;

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

export function scanBeyt(beyt: [string, string]): [ScanResult, ScanResult] {
  return [scanHemistich(beyt[0]), scanHemistich(beyt[1])];
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
  let winner: string | null = null;
  let maxVotes = 0;
  for (const [m, v] of votes) {
    if (v > maxVotes) {
      maxVotes = v;
      winner = m;
    }
  }
  const confidence = total === 0 ? 0 : maxVotes / Math.max(1, beyts.length * 2);
  const poemMeter = confidence >= 0.7 ? winner : null;
  return { meter: poemMeter, confidence: Number(confidence.toFixed(4)), perBeyt };
}

export function clearCache(): void {
  cache.clear();
}
