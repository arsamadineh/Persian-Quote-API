import { normalizeSearch } from '@persian-quote/persian';

/**
 * Persian-specific character confusion weights used by the fuzzy corrector.
 * Lower cost = more likely confusion. Applies to substitution candidates.
 */
const PERSIAN_CONFUSION: Record<string, string[]> = {
  ی: ['ي', 'ئ'],
  ي: ['ی', 'ئ'],
  ک: ['ك'],
  ك: ['ک'],
  ه: ['ة', 'ھ'],
  ة: ['ه', 'ھ'],
  ا: ['آ', 'أ', 'إ', 'ٱ'],
  آ: ['ا', 'أ', 'إ'],
  أ: ['ا', 'آ', 'إ'],
  إ: ['ا', 'آ', 'أ'],
  س: ['ص', 'ث'],
  ص: ['س', 'ث'],
  ث: ['س', 'ص'],
  ت: ['ط', 'ٹ'],
  ط: ['ت', 'ٹ'],
  ز: ['ذ', 'ض', 'ظ'],
  ذ: ['ز', 'ض', 'ظ'],
  ض: ['ز', 'ذ', 'ظ'],
  ظ: ['ز', 'ذ', 'ض'],
};

/** Confusion cost between two single characters (0 = same, 1 = confused, 2 = unrelated). */
function confusionCost(a: string, b: string): number {
  if (a === b) return 0;
  const conf = PERSIAN_CONFUSION[a];
  if (conf && conf.includes(b)) return 1;
  return 2;
}

/**
 * SymSpell-style fuzzy corrector.
 *
 * Builds a frequency dictionary from index terms. For an out-of-vocabulary term,
 * generates candidate corrections at edit distance 1 and 2 (deletes, transposes,
 * replaces, inserts) restricted to dictionary terms, scores them by frequency and
 * Persian confusion weights, and returns the best candidates.
 */
export class SymSpellCorrector {
  private dictionary: Map<string, number> = new Map();
  private maxEditDistance = 2;

  buildDictionary(terms: Iterable<string>): void {
    const freq = new Map<string, number>();
    for (const t of terms) {
      const norm = normalizeSearch(t);
      if (!norm) continue;
      freq.set(norm, (freq.get(norm) ?? 0) + 1);
    }
    this.dictionary = freq;
  }

  /** Returns up to `limit` corrected candidates for `term`, best first. */
  correct(term: string, limit = 5): string[] {
    const norm = normalizeSearch(term);
    if (!norm) return [];
    if (this.dictionary.has(norm)) return [norm];

    const candidates = new Map<string, number>(); // candidate -> score
    const edits1 = this.edits1(norm);
    for (const e of edits1) {
      if (this.dictionary.has(e)) {
        const freq = this.dictionary.get(e) ?? 1;
        candidates.set(e, freq + this.editDistanceCost(norm, e));
      }
    }
    if (candidates.size === 0 && this.maxEditDistance >= 2) {
      const edits2 = new Set<string>();
      for (const e1 of edits1) {
        for (const e2 of this.edits1(e1)) {
          if (this.dictionary.has(e2)) edits2.add(e2);
        }
      }
      for (const e of edits2) {
        const freq = this.dictionary.get(e) ?? 1;
        candidates.set(e, freq + this.editDistanceCost(norm, e) + 1); // penalty for distance 2
      }
    }

    return Array.from(candidates.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fa'))
      .slice(0, limit)
      .map(([c]) => c);
  }

  private edits1(word: string): string[] {
    const result = new Set<string>();
    const letters = Array.from(new Set([...this.dictionary.keys()].flatMap((t) => [...t])));
    const splits: [string, string][] = [];
    for (let i = 0; i <= word.length; i++) splits.push([word.slice(0, i), word.slice(i)]);

    // Deletes
    for (const [L, R] of splits) if (R) result.add(L + R.slice(1));

    // Transposes
    for (const [L, R] of splits) if (R.length > 1) result.add(L + R[1] + R[0] + R.slice(2));

    // Replaces
    for (const [L, R] of splits) {
      if (!R) continue;
      for (const c of letters) result.add(L + c + R.slice(1));
      // Persian confusion substitutions
      const conf = PERSIAN_CONFUSION[R[0]];
      if (conf) for (const c of conf) result.add(L + c + R.slice(1));
    }

    // Inserts
    for (const [L, R] of splits) {
      for (const c of letters) result.add(L + c + R);
    }

    return Array.from(result);
  }

  /** Cost of turning `from` into `to` (edit distance weighted by confusion). */
  private editDistanceCost(from: string, to: string): number {
    // Simplified: length difference + confusion-based char cost.
    const n = from.length;
    const m = to.length;
    const dp: number[][] = [];
    for (let i = 0; i <= n; i++) dp[i] = new Array(m + 1).fill(0);
    for (let i = 0; i <= n; i++) dp[i][0] = i;
    for (let j = 0; j <= m; j++) dp[0][j] = j;
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const cost = confusionCost(from[i - 1], to[j - 1]);
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // delete
          dp[i][j - 1] + 1, // insert
          dp[i - 1][j - 1] + cost // substitute
        );
      }
    }
    return dp[n][m];
  }
}

/** Singleton corrector built lazily from index terms. */
let corrector: SymSpellCorrector | null = null;
let correctorTerms: string[] = [];

export function buildCorrector(terms: string[]): SymSpellCorrector {
  const c = new SymSpellCorrector();
  c.buildDictionary(terms);
  corrector = c;
  correctorTerms = terms;
  return c;
}

export function symSpellCorrect(term: string): string[] {
  if (!corrector) return [term];
  return corrector.correct(term);
}
