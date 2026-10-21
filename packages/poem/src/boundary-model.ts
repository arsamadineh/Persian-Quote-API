import weightsData from './weights.json';
import { bareToken, buildGlueMask, TRAILING_PUNCTUATION_REGEX } from './glue';

export interface BoundaryModelResult {
  stanzas: string[][];
  confidence: number;
}

const W = new Float64Array(weightsData.weights);
const { A: plattA, B: plattB } = weightsData.calibration;

const SENTENCE_PUNCT_REGEX = /[.!؟؛…]$/u;
const CLAUSE_PUNCT_REGEX = /[،,:]$/u;

const COPULA_VERBS = new Set([
  'است', 'ست', 'بود', 'شد', 'نیست', 'هست', 'کرد', 'داد', 'زد', 'رفت',
  'گفت', 'داشت', 'دید', 'رسید', 'ماند', 'آمد', 'گرفت', 'آورد', 'برد',
  'افتاد', 'دارد', 'باشه', 'باشند', 'باشیم', 'بودیم', 'بودند', 'بوده',
  'شده', 'کردند', 'دادند', 'زدند', 'رفتند', 'گفتند'
]);

const COLLOQUIAL_ENDERS = new Set([
  'نیس', 'نداره', 'میشه', 'باشه', 'دادم', 'بلدن', 'خوبه', 'گله‌س',
  'حوصله‌س', 'می‌خوام', 'می‌گم', 'میاد', 'میومد', 'می‌ره', 'می‌میره',
  'میترکه', 'می ترکه'
]);

const DISCOURSE_STARTERS = new Set([
  'اما', 'ولی', 'اگر', 'چون', 'وقتی', 'هنگام', 'ناگاه', 'دوباره',
  'حالا', 'تازه', 'یه', 'نه', 'خوب', 'دیگه', 'پس', 'که', 'چرا'
]);

const CONJ_PREP = new Set([
  'و', 'که', 'از', 'به', 'در', 'با', 'بر', 'تا', 'یا'
]);

export function sigmoid(z: number): number {
  if (z > 30) return 1.0;
  if (z < -30) return 0.0;
  return 1.0 / (1.0 + Math.exp(-z));
}

export function isFiniteVerb(token: string): boolean {
  const bare = bareToken(token);
  if (COPULA_VERBS.has(bare)) return true;

  // Prefixed verbs: می / نمی / بـ with verbal endings
  if (/^(?:می|نمی|ب)/.test(bare) && /(?:م|ی|د|یم|ید|ند)$/.test(bare) && bare.length >= 4) {
    return true;
  }
  return false;
}

export function extractGapFeatures(
  tokens: string[],
  gapIndex: number, // break after tokens[gapIndex]
  wordsSinceBreak: number,
  repeatedNgrams: Set<string>
): Float64Array {
  const features = new Float64Array(12);
  const leftToken = tokens[gapIndex] ?? '';
  const rightToken = tokens[gapIndex + 1] ?? '';
  const bareLeft = bareToken(leftToken);
  const bareRight = bareToken(rightToken);

  // 0: bias
  features[0] = 1.0;

  // 1: is_sentence_punct
  features[1] = SENTENCE_PUNCT_REGEX.test(leftToken) ? 1.0 : 0.0;

  // 2: is_clause_punct
  features[2] = CLAUSE_PUNCT_REGEX.test(leftToken) ? 1.0 : 0.0;

  // 3: is_finite_verb
  features[3] = isFiniteVerb(leftToken) ? 1.0 : 0.0;

  // 4: is_colloquial_ender
  features[4] = COLLOQUIAL_ENDERS.has(bareLeft) ? 1.0 : 0.0;

  // 5: is_discourse_starter_next
  features[5] = DISCOURSE_STARTERS.has(bareRight) ? 1.0 : 0.0;

  // 6: repeat_left_end
  let leftEndsRepeat = 0.0;
  if (gapIndex >= 1) {
    const twoGram = `${bareToken(tokens[gapIndex - 1] ?? '')} ${bareLeft}`;
    if (repeatedNgrams.has(twoGram)) leftEndsRepeat = 1.0;
  }
  features[6] = leftEndsRepeat;

  // 7: repeat_right_start
  let rightStartsRepeat = 0.0;
  if (gapIndex + 2 < tokens.length) {
    const twoGram = `${bareRight} ${bareToken(tokens[gapIndex + 2] ?? '')}`;
    if (repeatedNgrams.has(twoGram)) rightStartsRepeat = 1.0;
  }
  features[7] = rightStartsRepeat;

  // 8: line_word_ratio
  features[8] = Math.min(1.0, wordsSinceBreak / 8.0);

  // 9: short_line_inhibitor
  features[9] = wordsSinceBreak <= 2 ? 1.0 : 0.0;

  // 10: long_line_pressure
  features[10] = Math.max(0.0, (wordsSinceBreak - 7.0) / 3.0);

  // 11: is_conj_prep_left
  features[11] = CONJ_PREP.has(bareLeft) && !TRAILING_PUNCTUATION_REGEX.test(leftToken) ? 1.0 : 0.0;

  return features;
}

export function scoreBoundaryGap(features: Float64Array): number {
  let z = 0.0;
  for (let i = 0; i < 12; i++) {
    z += (W[i] ?? 0) * (features[i] ?? 0);
  }
  // Platt scaling calibration: p_cal = sigmoid(A * z + B)
  return sigmoid(plattA * z + plattB);
}

function findRepeatedNgrams(tokens: string[]): Set<string> {
  const counts = new Map<string, number>();
  const bareList = tokens.map(bareToken);

  for (let i = 0; i < bareList.length - 1; i++) {
    const phrase = `${bareList[i]} ${bareList[i + 1]}`;
    counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
  }

  const repeated = new Set<string>();
  for (const [phrase, count] of counts.entries()) {
    if (count >= 2) repeated.add(phrase);
  }
  return repeated;
}

export function runBoundaryModel(
  tokens: string[],
  isValidBoundaryMask?: Uint8Array
): BoundaryModelResult | null {
  const N = tokens.length;
  if (N === 0) return null;

  const mask = isValidBoundaryMask ?? buildGlueMask(tokens);
  const repeated = findRepeatedNgrams(tokens);

  // Precompute static gap weights dot product for features 0, 1, 2, 3, 4, 5, 6, 7, 11
  const precomputedZ = new Float64Array(N);
  const w0 = W[0] ?? 0;
  const w1 = W[1] ?? 0;
  const w2 = W[2] ?? 0;
  const w3 = W[3] ?? 0;
  const w4 = W[4] ?? 0;
  const w5 = W[5] ?? 0;
  const w6 = W[6] ?? 0;
  const w7 = W[7] ?? 0;
  const w11 = W[11] ?? 0;

  for (let gap = 0; gap < N - 1; gap++) {
    const leftToken = tokens[gap] ?? '';
    const rightToken = tokens[gap + 1] ?? '';
    const bareLeft = bareToken(leftToken);
    const bareRight = bareToken(rightToken);

    let z = w0;
    if (SENTENCE_PUNCT_REGEX.test(leftToken)) z += w1;
    if (CLAUSE_PUNCT_REGEX.test(leftToken)) z += w2;
    if (isFiniteVerb(leftToken)) z += w3;
    if (COLLOQUIAL_ENDERS.has(bareLeft)) z += w4;
    if (DISCOURSE_STARTERS.has(bareRight)) z += w5;

    if (gap >= 1) {
      const twoGram = `${bareToken(tokens[gap - 1] ?? '')} ${bareLeft}`;
      if (repeated.has(twoGram)) z += w6;
    }

    if (gap + 2 < N) {
      const twoGram = `${bareRight} ${bareToken(tokens[gap + 2] ?? '')}`;
      if (repeated.has(twoGram)) z += w7;
    }

    if (CONJ_PREP.has(bareLeft) && !TRAILING_PUNCTUATION_REGEX.test(leftToken)) {
      z += w11;
    }

    precomputedZ[gap] = z;
  }

  // Dynamic Programming table: dp[j] stores maximum log-likelihood up to token j
  const dp = new Float64Array(N + 1);
  const parent = new Int32Array(N + 1);
  const probTable = new Float64Array(N + 1);

  dp.fill(-Infinity);
  dp[0] = 0.0;
  parent.fill(-1);

  const w8 = W[8] ?? 0;
  const w9 = W[9] ?? 0;
  const w10 = W[10] ?? 0;

  for (let i = 0; i < N; i++) {
    const prevScore = dp[i]!;
    if (prevScore === -Infinity) continue;

    const maxJ = Math.min(N, i + 10);
    for (let j = i + 1; j <= maxJ; j++) {
      // Must respect S1 glue mask
      if (j < N && mask[j] === 0) continue;

      const wordsSinceBreak = j - i;
      let stepScore = 0.0;

      // 1. Negative gap log-probabilities for non-breaks within candidate line:
      // score(i, j) = log(p_{j-1}) + sum_{k=i}^{j-2} log(1 - p_k)
      for (let k = i; k < j - 1; k++) {
        const gapWords = k - i + 1;
        const baseZk = precomputedZ[k] ?? 0;
        const zk =
          baseZk +
          w8 * Math.min(1.0, gapWords / 8.0) +
          w9 * (gapWords <= 2 ? 1.0 : 0.0) +
          w10 * Math.max(0.0, (gapWords - 7.0) / 3.0);
        const pK = sigmoid(plattA * zk + plattB);
        stepScore += Math.log(Math.max(1e-5, 1.0 - pK));
      }

      // 2. Boundary break log-probability at gap j - 1:
      let pCal = 1.0;
      if (j < N) {
        const baseZj = precomputedZ[j - 1] ?? 0;
        const zj =
          baseZj +
          w8 * Math.min(1.0, wordsSinceBreak / 8.0) +
          w9 * (wordsSinceBreak <= 2 ? 1.0 : 0.0) +
          w10 * Math.max(0.0, (wordsSinceBreak - 7.0) / 3.0);
        pCal = sigmoid(plattA * zj + plattB);
        // Break transition prior (beta = 2.2): recalibrates decision threshold from 0.5 to ~0.10
        stepScore += Math.log(Math.max(1e-5, pCal)) + 2.2;
      }

      // 3. Length preference: favor genuine short verse pauses (2-6 words)
      // over greedy 10-word packing
      if (wordsSinceBreak >= 2 && wordsSinceBreak <= 6) {
        stepScore += 1.0;
      } else if (wordsSinceBreak > 6) {
        stepScore -= (wordsSinceBreak - 6) * 0.8;
      }

      // 4. Strict orphan penalty for 1-word lines
      if (wordsSinceBreak === 1) {
        stepScore -= 4.0;
      }

      const totalScore = prevScore + stepScore;
      if (totalScore > dp[j]!) {
        dp[j] = totalScore;
        parent[j] = i;
        probTable[j] = pCal;
      }
    }
  }

  if (parent[N] === -1) {
    return null; // Could not segment with constraints
  }

  // Backtrack lines
  const lines: string[] = [];
  const lineProbabilities: number[] = [];
  let curr = N;

  while (curr > 0) {
    const prev = parent[curr] ?? 0;
    lines.unshift(tokens.slice(prev, curr).join(' '));
    lineProbabilities.unshift(probTable[curr] ?? 0.5);
    curr = prev;
  }

  const avgProb = lineProbabilities.reduce((a, b) => a + b, 0) / Math.max(1, lineProbabilities.length);
  const confidence = Math.min(0.95, Math.max(0.70, avgProb));

  // Group lines into stanzas of 3 to 5 lines
  const stanzas: string[][] = [];
  for (let idx = 0; idx < lines.length; idx += 4) {
    stanzas.push(lines.slice(idx, idx + 4));
  }

  return {
    stanzas,
    confidence,
  };
}
