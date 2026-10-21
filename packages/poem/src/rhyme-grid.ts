import { buildGlueMask, bareToken, FORBIDDEN_LINE_ENDS, TRAILING_PUNCTUATION_REGEX } from './glue';

export interface RhymeGridOptions {
  isValidBoundary?: (tokens: string[], boundaryIndex: number) => boolean;
}

export interface RhymeGridResult {
  beyts: [string, string][];
  stanzas: string[][];
  radif?: string;
  qafiyeh?: string;
  hypothesis: 'H1' | 'H2';
  confidence: number;
}

export const RADIF_STOPWORDS = new Set([
  'و', 'در', 'به', 'از', 'که', 'با', 'تا', 'بر',
  'ما', 'من', 'تو', 'او', 'شما', 'آنها',
  'این', 'آن', 'یک', 'برای', 'چه', 'نه', 'هر', 'هم',
  'چون', 'اگر', 'ولی', 'اما', 'یا'
]);

export interface CandidateRadif {
  phrase: string;
  n: number;
  indices: number[]; // End-token index of each occurrence
  cv: number;
  score: number;
  qafiyehSuffix?: string;
}

export function getPhoneticSuffix(word: string): string {
  if (word.length < 2) return word;
  if (word.endsWith('است') || word.endsWith('وست') || word.endsWith('يست')) {
    return word.slice(-3);
  }
  return word.slice(-2);
}

export function detectRadifCandidates(tokens: string[]): CandidateRadif | null {
  const N = tokens.length;
  if (N < 10) return null;

  const bareList = tokens.map(bareToken);
  let bestCandidate: CandidateRadif | null = null;

  for (let n = 1; n <= 3; n++) {
    const map = new Map<string, number[]>();

    for (let i = 0; i <= N - n; i++) {
      const slice = bareList.slice(i, i + n);
      const lastToken = slice[slice.length - 1] ?? '';
      if (FORBIDDEN_LINE_ENDS.has(lastToken)) continue;
      if (n === 1 && RADIF_STOPWORDS.has(slice[0] ?? '')) continue;
      const phrase = slice.join(' ');
      if (phrase.length < 2) continue;

      const arr = map.get(phrase) ?? [];
      arr.push(i + n - 1);
      map.set(phrase, arr);
    }

    for (const [phrase, indices] of map.entries()) {
      if (indices.length < 3) continue;

      const precedingWords = indices
        .map((a) => {
          const prevIdx = a - n;
          return prevIdx >= 0 ? bareToken(tokens[prevIdx] ?? '') : '';
        })
        .filter((w) => w.length >= 2);

      if (precedingWords.length < 3) continue;

      const s2Freq = new Map<string, number>();
      const s1Freq = new Map<string, number>();
      for (const w of precedingWords) {
        const s2 = getPhoneticSuffix(w);
        s2Freq.set(s2, (s2Freq.get(s2) ?? 0) + 1);
        const s1 = w.slice(-1);
        s1Freq.set(s1, (s1Freq.get(s1) ?? 0) + 1);
      }

      let hasQafiyeh = false;
      let dominantSuffix = '';
      for (const [s, count] of s2Freq.entries()) {
        if (count >= precedingWords.length * 0.35) {
          hasQafiyeh = true;
          dominantSuffix = s;
          break;
        }
      }
      if (!hasQafiyeh) {
        for (const [s, count] of s1Freq.entries()) {
          if (count >= precedingWords.length * 0.60) {
            hasQafiyeh = true;
            dominantSuffix = s;
            break;
          }
        }
      }

      if (!hasQafiyeh) continue;

      let validIndices = indices;
      if (phrase === 'را') {
        validIndices = indices.filter((a) => {
          const prev = a - n >= 0 ? bareToken(tokens[a - n] ?? '') : '';
          return prev.endsWith(dominantSuffix);
        });
        if (validIndices.length < 3) validIndices = indices;
      }

      const gaps: number[] = [];
      for (let k = 0; k < validIndices.length - 1; k++) {
        const idx1 = validIndices[k] ?? 0;
        const idx2 = validIndices[k + 1] ?? 0;
        gaps.push(idx2 - idx1);
      }
      if (gaps.length === 0) continue;

      const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      if (mean < 4 || mean > 35) continue;

      const variance = gaps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / gaps.length;
      const stdDev = Math.sqrt(variance);
      const cv = stdDev / mean;

      if (cv <= 0.35) {
        const score = (validIndices.length * n) / (1 + cv);
        if (!bestCandidate || score > bestCandidate.score) {
          bestCandidate = {
            phrase,
            n,
            indices: validIndices,
            cv,
            score,
            qafiyehSuffix: dominantSuffix,
          };
        }
      }
    }
  }

  return bestCandidate;
}

export function detectQafiyehAnchors(
  tokens: string[]
): { suffix: string; anchors: number[]; cv: number } | null {
  const N = tokens.length;
  if (N < 20) return null;

  const bareList = tokens.map(bareToken);
  const suffixMap = new Map<string, number[]>();

  for (let i = 0; i < N; i++) {
    const word = bareList[i] ?? '';
    if (word.length < 2) continue;
    if (RADIF_STOPWORDS.has(word)) continue;
    const s = getPhoneticSuffix(word);
    if (RADIF_STOPWORDS.has(s)) continue;
    const arr = suffixMap.get(s) ?? [];
    arr.push(i);
    suffixMap.set(s, arr);
  }

  let best: { suffix: string; anchors: number[]; cv: number; score: number } | null = null;

  for (const [suffix, indices] of suffixMap.entries()) {
    if (indices.length < 4) continue;

    const dp = new Array(indices.length).fill(null).map(() => ({
      score: -Infinity,
      parent: -1,
      gaps: [] as number[],
    }));

    for (let i = 0; i < indices.length; i++) {
      const idx = indices[i]!;
      if (idx >= 11 && idx <= 23) {
        dp[i] = { score: 10, parent: -1, gaps: [] };
      }

      for (let j = 0; j < i; j++) {
        if (dp[j]!.score === -Infinity) continue;
        const gap = idx - indices[j]!;
        let stepScore = -Infinity;
        let effectiveGaps: number[] = [];

        if (gap >= 10 && gap <= 24) {
          stepScore = 20 - Math.abs(gap - 15.5);
          effectiveGaps = [gap];
        } else if (gap >= 22 && gap <= 38) {
          stepScore = 30 - 2 * Math.abs(gap / 2 - 15.5);
          effectiveGaps = [gap / 2, gap / 2];
        }

        if (stepScore > 0) {
          const totalScore = dp[j]!.score + stepScore;
          if (totalScore > dp[i]!.score) {
            dp[i] = {
              score: totalScore,
              parent: j,
              gaps: [...dp[j]!.gaps, ...effectiveGaps],
            };
          }
        }
      }
    }

    let bestIdx = -1;
    let bestScore = -Infinity;
    for (let i = 0; i < indices.length; i++) {
      if (indices[i]! >= N - 24 && dp[i]!.score > bestScore) {
        bestScore = dp[i]!.score;
        bestIdx = i;
      }
    }

    if (bestIdx !== -1) {
      const chain: number[] = [];
      let curr = bestIdx;
      while (curr !== -1) {
        chain.unshift(indices[curr]!);
        curr = dp[curr]!.parent;
      }

      if (chain.length >= 3) {
        const gaps = dp[bestIdx]!.gaps;
        if (gaps.length > 0) {
          const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
          const variance = gaps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / gaps.length;
          const cv = Math.sqrt(variance) / mean;

          if (cv <= 0.35) {
            const score = chain.length / (1 + cv);
            if (!best || score > best.score) {
              best = { suffix, anchors: chain, cv, score };
            }
          }
        }
      }
    }
  }

  return best ? { suffix: best.suffix, anchors: best.anchors, cv: best.cv } : null;
}

const CLAUSE_STARTERS = new Set(['که', 'تا', 'چون', 'چو', 'گر', 'اگر', 'کز', 'ور', 'زان', 'باز']);

export function snapMidpoint(
  tokens: string[],
  start: number,
  end: number,
  mask: Uint8Array,
  options?: RhymeGridOptions
): { h1: string; h2: string; splitIndex: number } {
  const totalTokens = end - start + 1;
  const targetSplit = Math.floor(start + totalTokens / 2);

  let totalChars = 0;
  for (let k = start; k <= end; k++) {
    totalChars += (tokens[k] ?? '').length + 1;
  }
  const targetChars = totalChars / 2;

  let bestIndex = -1;
  let minCost = Infinity;

  for (let m = start + 1; m <= end; m++) {
    // 1. Strict hard S1 glue invariant
    if (mask[m] === 0) continue;
    if (options?.isValidBoundary && !options.isValidBoundary(tokens, m)) continue;

    const w1 = m - start;
    const w2 = end + 1 - m;

    let cost = 0;
    if (w1 > 11) cost += (w1 - 11) * 150;
    if (w2 > 11) cost += (w2 - 11) * 150;

    cost += Math.abs(w1 - w2) * 4;

    let leftChars = 0;
    for (let k = start; k < m; k++) {
      leftChars += (tokens[k] ?? '').length + 1;
    }
    cost += Math.abs(leftChars - targetChars);

    const prevBare = bareToken(tokens[m - 1] ?? '');
    const currBare = bareToken(tokens[m] ?? '');

    // Finite verb ending H1 heuristic reward
    if (
      prevBare.endsWith('ند') ||
      prevBare.endsWith('يد') ||
      prevBare.endsWith('يم') ||
      prevBare.endsWith('م') ||
      prevBare.endsWith('ت') ||
      prevBare.endsWith('د') ||
      prevBare === 'است' ||
      prevBare === 'بود' ||
      prevBare === 'شد' ||
      prevBare === 'اوست' ||
      prevBare === 'توست' ||
      prevBare === 'ماست'
    ) {
      cost -= 3.0;
    }

    // Clause starter H2 heuristic reward
    if (CLAUSE_STARTERS.has(currBare)) {
      cost -= 4.0;
    }

    // Syntactic bias: reward trailing punctuation
    const prevToken = tokens[m - 1] ?? '';
    if (TRAILING_PUNCTUATION_REGEX.test(prevToken)) {
      cost -= 6.0;
    }

    if (cost < minCost) {
      minCost = cost;
      bestIndex = m;
    }
  }

  // Fallback: search for any mask-valid boundary
  if (bestIndex === -1) {
    for (let m = start + 1; m <= end; m++) {
      if (mask[m] === 1) {
        bestIndex = m;
        break;
      }
    }
    if (bestIndex === -1) {
      bestIndex = Math.max(start + 1, Math.min(end, targetSplit));
    }
  }

  const h1 = tokens.slice(start, bestIndex).join(' ');
  const h2 = tokens.slice(bestIndex, end + 1).join(' ');
  return { h1, h2, splitIndex: bestIndex };
}

export function runRhymeGrid(
  text: string,
  options: RhymeGridOptions = {}
): RhymeGridResult | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  const N = tokens.length;
  if (N < 10) return null;

  const mask = buildGlueMask(tokens);

  const radifCandidate = detectRadifCandidates(tokens);
  let anchors: number[] = [];
  let radifPhrase: string | undefined;
  let qafiyehSuffix: string | undefined;
  let anchorCV = 0.2;
  let isQafiyehMode = false;

  if (radifCandidate) {
    radifPhrase = radifCandidate.phrase;
    anchors = radifCandidate.indices;
    anchorCV = radifCandidate.cv;
    qafiyehSuffix = radifCandidate.qafiyehSuffix;
  } else {
    const qafiyehRes = detectQafiyehAnchors(tokens);
    if (qafiyehRes) {
      qafiyehSuffix = qafiyehRes.suffix;
      anchors = qafiyehRes.anchors;
      anchorCV = qafiyehRes.cv;
      isQafiyehMode = true;
    }
  }

  if (anchors.length < 3) {
    return null;
  }

  anchors = Array.from(new Set(anchors)).sort((a, b) => a - b);

  // Strict hard glue invariant on anchors:
  // Advance anchor if followed by clitic/suffix particles to absorb them into line end
  for (let i = 0; i < anchors.length; i++) {
    let a = anchors[i]!;
    while (a + 1 < N && mask[a + 1] === 0) {
      a++;
    }
    anchors[i] = a;
  }

  const beyts: [string, string][] = [];
  let currentTokenIdx = 0;

  const firstAnchor = anchors[0]!;
  const secondAnchor = anchors[1]!;
  let startAnchorIdx = 0;

  if (firstAnchor <= 12 && secondAnchor - firstAnchor <= 12) {
    // Matla' couplet
    const h1 = tokens.slice(0, firstAnchor + 1).join(' ');
    const h2 = tokens.slice(firstAnchor + 1, secondAnchor + 1).join(' ');
    beyts.push([h1, h2]);
    currentTokenIdx = secondAnchor + 1;
    startAnchorIdx = 2;
  }

  for (let k = startAnchorIdx; k < anchors.length; k++) {
    const anchorEnd = anchors[k]!;
    if (anchorEnd < currentTokenIdx) continue;

    const intervalTokens = anchorEnd - currentTokenIdx + 1;
    if (intervalTokens > 24) {
      const mid = Math.floor(currentTokenIdx + intervalTokens / 2);
      let bestBeytBreak = mid;
      let minDiff = Infinity;
      for (let b = currentTokenIdx + 6; b <= anchorEnd - 6; b++) {
        if (mask[b] === 1 && Math.abs(b - mid) < minDiff) {
          minDiff = Math.abs(b - mid);
          bestBeytBreak = b;
        }
      }
      const b1 = snapMidpoint(tokens, currentTokenIdx, bestBeytBreak - 1, mask, options);
      beyts.push([b1.h1, b1.h2]);
      const b2 = snapMidpoint(tokens, bestBeytBreak, anchorEnd, mask, options);
      beyts.push([b2.h1, b2.h2]);
    } else {
      const b = snapMidpoint(tokens, currentTokenIdx, anchorEnd, mask, options);
      beyts.push([b.h1, b.h2]);
    }
    currentTokenIdx = anchorEnd + 1;
  }

  // Remainder
  if (currentTokenIdx < N) {
    const remTokens = N - currentTokenIdx;
    if (remTokens <= 11) {
      if (beyts.length > 0) {
        const lastBeyt = beyts[beyts.length - 1]!;
        lastBeyt[1] = `${lastBeyt[1]} ${tokens.slice(currentTokenIdx).join(' ')}`;
      }
    } else {
      const lastBeyt = snapMidpoint(tokens, currentTokenIdx, N - 1, mask, options);
      beyts.push([lastBeyt.h1, lastBeyt.h2]);
    }
  }

  if (beyts.length === 0) return null;

  let totalBalance = 0;
  for (const [h1, h2] of beyts) {
    const l1 = h1.length;
    const l2 = h2.length;
    totalBalance += 1 - Math.abs(l1 - l2) / (l1 + l2);
  }
  const avgBalance = totalBalance / beyts.length;

  const rawConf = 1.0 - 0.5 * anchorCV - 0.2 * (1 - avgBalance);
  const confidence = Math.max(0.70, Math.min(0.98, rawConf));

  const stanzas = beyts.map(([h1, h2]) => [h1, h2]);

  return {
    beyts,
    stanzas,
    radif: radifPhrase,
    qafiyeh: qafiyehSuffix,
    hypothesis: 'H2',
    confidence,
  };
}
