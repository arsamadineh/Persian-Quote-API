import { lightStem } from '@persian-quote/persian';

export const LEADING_MARKS = /^[«("'\[]+/u;
export const TRAILING_MARKS = /[،؛؟!:.…»)"'\]]+$/u;
export const TRAILING_PUNCTUATION_REGEX = /[،؛؟!:.…»)"'\]]$/u;

export function bareToken(token: string): string {
  if (!token) return '';
  return token
    .replace(LEADING_MARKS, '')
    .replace(TRAILING_MARKS, '')
    .replace(/^[\u200c]+|[\u200c]+$/g, '')
    .normalize('NFC');
}

export const FORBIDDEN_LINE_STARTS = new Set([
  // Standalone suffixes / detached clitics
  'ی', 'ها', 'های', 'تر', 'ترین',
  'ام', 'ات', 'اش', 'مان', 'تان', 'شان',
  // Copulas, auxiliaries, and object marker
  'را', 'است', 'ست', 'بود', 'شد', 'نیست', 'هست'
]);

export const FORBIDDEN_LINE_ENDS = new Set([
  // Verbal particles and prefixes
  'ای', 'می', 'نمی', 'بی', 'همی',
  // Conjunctions and prepositions
  'و', 'که', 'تا', 'یا', 'از', 'به', 'در', 'با', 'بر',
  'چون', 'اگر', 'ولی', 'اما'
]);

/**
 * Builds an S1 glue validity mask for candidate boundaries between tokens.
 * Length of returned array is tokens.length.
 * mask[j] === 1 means a line break may legitimately occur immediately before token j.
 * mask[j] === 0 means a line break is forbidden immediately before token j.
 * mask[0] is always 0 (boundary 0 is the start of the entire text).
 */
export function buildGlueMask(tokens: string[]): Uint8Array {
  const N = tokens.length;
  const mask = new Uint8Array(N);
  if (N === 0) return mask;

  mask.fill(1);
  mask[0] = 0; // Text start is not an internal boundary

  for (let j = 1; j < N; j++) {
    const prevToken = tokens[j - 1] ?? '';
    const currToken = tokens[j] ?? '';
    const bareCurr = bareToken(currToken);
    const barePrev = bareToken(prevToken);

    // Rule 1: Never start a line with forbidden start token
    if (FORBIDDEN_LINE_STARTS.has(bareCurr)) {
      mask[j] = 0;
    }

    // Rule 2: Never end a line with forbidden end token unless punctuation follows
    if (FORBIDDEN_LINE_ENDS.has(barePrev) && !TRAILING_PUNCTUATION_REGEX.test(prevToken)) {
      mask[j] = 0;
    }

    // Rule 3: Ezafe marker at end of line without punctuation
    if ((prevToken.includes('\u0650') || prevToken.endsWith('هٔ') || prevToken.endsWith('ه‌ی')) && !TRAILING_PUNCTUATION_REGEX.test(prevToken)) {
      mask[j] = 0;
    }

    // Rule 4: Immediate identical repeats X X
    if (barePrev.length >= 2 && barePrev === bareCurr) {
      mask[j] = 0;
    }
  }

  // Rule 5: Multi-token compounds (X به X and تو در تو)
  for (let k = 0; k < N - 2; k++) {
    const t0 = bareToken(tokens[k] ?? '');
    const t1 = bareToken(tokens[k + 1] ?? '');
    const t2 = bareToken(tokens[k + 2] ?? '');

    // X به X compounds (در به در, در به دره, لا به لا, لا به لاش, روز به روز, سر به سر, ...)
    if (
      t1 === 'به' &&
      (t0 === t2 ||
        t2.startsWith(t0) ||
        t0.startsWith(t2) ||
        (t0.length >= 2 && t2.length >= 2 && lightStem(t0) === lightStem(t2)))
    ) {
      mask[k + 1] = 0;
      mask[k + 2] = 0;
    }

    // تو در تو compounds
    if (t0 === 'تو' && t1 === 'در' && (t2 === 'تو' || t2.startsWith('تو'))) {
      mask[k + 1] = 0;
      mask[k + 2] = 0;
    }
  }

  return mask;
}

export function isValidBoundary(tokens: string[], boundaryIndex: number): boolean {
  if (boundaryIndex <= 0 || boundaryIndex >= tokens.length) return false;
  const mask = buildGlueMask(tokens);
  return mask[boundaryIndex] === 1;
}

/**
 * Checks if any line in pre-split text violates S1 glue constraints.
 */
export function hasGlueViolation(lines: string[]): boolean {
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;

    const firstWord = words[0] ?? '';
    const bareFirst = bareToken(firstWord);
    if (FORBIDDEN_LINE_STARTS.has(bareFirst)) {
      return true;
    }

    const lastWord = words[words.length - 1] ?? '';
    const bareLast = bareToken(lastWord);
    if (FORBIDDEN_LINE_ENDS.has(bareLast) && !TRAILING_PUNCTUATION_REGEX.test(lastWord)) {
      return true;
    }
  }
  return false;
}
