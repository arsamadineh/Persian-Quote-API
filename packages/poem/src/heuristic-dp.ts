import { bareToken, buildGlueMask, TRAILING_PUNCTUATION_REGEX } from './glue';
import { isFiniteVerb } from './boundary-model';

export interface HeuristicDpResult {
  stanzas: string[][];
  confidence: number;
}

const AWKWARD_SUBORDINATORS = new Set([
  'وقتی', 'هنگام', 'ناگاه', 'چرا', 'تازه', 'خیلی', 'چه', 'این', 'آن', 'یک'
]);

const DISCOURSE_STARTERS = new Set([
  'اما', 'ولی', 'اگر', 'چون', 'وقتی', 'هنگام', 'ناگاه', 'دوباره',
  'حالا', 'تازه', 'یه', 'نه', 'خوب', 'دیگه', 'پس', 'که', 'چرا'
]);

const SENTENCE_PUNCT_REGEX = /[.!؟؛…]$/u;
const CLAUSE_PUNCT_REGEX = /[،,:]$/u;

export function runHeuristicDp(
  tokens: string[],
  isValidBoundaryMask?: Uint8Array
): HeuristicDpResult {
  const N = tokens.length;
  if (N === 0) {
    return { stanzas: [], confidence: 0.35 };
  }

  const mask = isValidBoundaryMask ?? buildGlueMask(tokens);

  const dp = new Float64Array(N + 1);
  const parent = new Int32Array(N + 1);

  dp.fill(Infinity);
  dp[0] = 0.0;
  parent.fill(-1);

  for (let i = 0; i < N; i++) {
    const curCost = dp[i];
    if (curCost === Infinity || curCost === undefined) continue;

    for (let j = i + 1; j <= Math.min(N, i + 10); j++) {
      // S1 Hard constraint: boundary must be valid
      if (j < N && mask[j] === 0) continue;

      const W = j - i;
      const leftToken = tokens[j - 1] ?? '';
      const rightToken = j < N ? (tokens[j] ?? '') : '';
      const bareLeft = bareToken(leftToken);
      const bareRight = bareToken(rightToken);

      // 1. Length cost: smooth parabola centered at 6 words
      let stepCost = Math.pow(W - 6.0, 2);

      // 2. Orphan penalties
      if (W === 1) {
        stepCost += 80.0;
      } else if (W === 2 && !TRAILING_PUNCTUATION_REGEX.test(leftToken)) {
        stepCost += 25.0;
      }

      // Remainder orphan penalty: avoid leaving 1 or 2 trailing tokens
      const rem = N - j;
      if (rem === 1 || rem === 2) {
        stepCost += 60.0;
      }

      // 3. Awkward ending penalty
      if (AWKWARD_SUBORDINATORS.has(bareLeft) && !TRAILING_PUNCTUATION_REGEX.test(leftToken)) {
        stepCost += 40.0;
      }

      // 4. Syntactic rewards
      if (SENTENCE_PUNCT_REGEX.test(leftToken)) {
        stepCost -= 25.0;
      } else if (CLAUSE_PUNCT_REGEX.test(leftToken)) {
        stepCost -= 15.0;
      }

      if (isFiniteVerb(leftToken)) {
        stepCost -= 15.0;
      }

      if (j < N && DISCOURSE_STARTERS.has(bareRight)) {
        stepCost -= 12.0;
      }

      const totalCost = curCost + stepCost;
      const bestCost = dp[j] ?? Infinity;
      if (totalCost < bestCost) {
        dp[j] = totalCost;
        parent[j] = i;
      }
    }
  }

  // Backtrack lines
  const lines: string[] = [];
  let curr = N;

  // Fallback if no valid path was found (e.g. extreme mask constraints)
  if (parent[N] === -1) {
    // Greedy fallback respecting mask where possible
    let start = 0;
    while (start < N) {
      let end = Math.min(N, start + 8);
      // Try to find a valid break in range
      for (let k = end; k > start + 2; k--) {
        if (k === N || mask[k] === 1) {
          end = k;
          break;
        }
      }
      lines.push(tokens.slice(start, end).join(' '));
      start = end;
    }
  } else {
    while (curr > 0) {
      const prev = parent[curr] ?? 0;
      lines.unshift(tokens.slice(prev, curr).join(' '));
      curr = prev;
    }
  }

  // Group lines into stanzas of 3 to 4 lines
  const stanzas: string[][] = [];
  for (let idx = 0; idx < lines.length; idx += 4) {
    stanzas.push(lines.slice(idx, idx + 4));
  }

  return {
    stanzas,
    confidence: 0.35,
  };
}
