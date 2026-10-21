import type { Form } from '../../../contracts/structure';
import { bareToken, FORBIDDEN_LINE_ENDS } from './glue';
import { RADIF_STOPWORDS, detectQafiyehAnchors } from './rhyme-grid';

export const COLLOQUIAL_LEXEMES = new Set([
  'یه', 'دفه', 'نیس', 'واسه', 'میاد', 'میومد', 'میگه', 'میخوام',
  'میگم', 'میشه', 'روزا', 'غمای', 'چشات', 'اخماتو', 'دستات',
  'دلمون', 'فک', 'لولو', 'دیوونه', 'باشیم', 'دستگا', 'خرین',
  'پدیاا', 'اونم', 'همونشم', 'اینم', 'آره', 'قایم', 'خوبیش',
  'بریم', 'نداره', 'نداری', 'نبودن', 'بذار', 'دیگه',
  'توش', 'آتیش', 'دوده', 'بلدن', 'چیکار', 'دزده', 'جون',
  'میترکه'
]);

const COLLOQUIAL_COPULA_REGEX = /\b[\p{L}\u200c]+[‌ ]س\b/u;

export function countColloquialMarkers(tokens: string[]): number {
  let count = 0;
  for (let i = 0; i < tokens.length; i++) {
    const raw = tokens[i] ?? '';
    const bare = bareToken(raw);

    // Direct match against colloquial wordlist
    if (COLLOQUIAL_LEXEMES.has(bare)) {
      count++;
      continue;
    }

    // Match two-token expressions like "می گه", "می شه", "نیم شم"
    if (i < tokens.length - 1) {
      const nextBare = bareToken(tokens[i + 1] ?? '');
      const two = `${bare} ${nextBare}`;
      if (
        two === 'می گه' ||
        two === 'می شه' ||
        two === 'می خوام' ||
        two === 'می گم' ||
        two === 'نیم شم' ||
        two === 'نمی شم' ||
        two === 'می ترکه'
      ) {
        count++;
        continue;
      }
    }

    // Contracted colloquial copula (e.g. گله س, حوصله س)
    if (COLLOQUIAL_COPULA_REGEX.test(raw)) {
      count++;
    }
  }
  return count;
}

export function detectRadifPeriodicity(tokens: string[]): { found: boolean; phrase?: string; cv?: number } {
  const N = tokens.length;
  if (N < 10) return { found: false };

  const bareList = tokens.map(bareToken);

  let bestPhrase: string | undefined;
  let bestCV = Infinity;

  // Search 1-gram to 3-gram candidate radifs
  for (let n = 1; n <= 3; n++) {
    const counts = new Map<string, number[]>();

    for (let i = 0; i <= N - n; i++) {
      const slice = bareList.slice(i, i + n);
      const lastToken = slice[slice.length - 1] ?? '';
      if (FORBIDDEN_LINE_ENDS.has(lastToken)) continue;
      if (n === 1 && slice[0] !== 'را' && RADIF_STOPWORDS.has(slice[0] ?? '')) continue;
      const phrase = slice.join(' ');
      if (phrase.length < 2) continue;

      const arr = counts.get(phrase) ?? [];
      arr.push(i + n - 1);
      counts.set(phrase, arr);
    }

    for (const [phrase, indices] of counts.entries()) {
      if (indices.length < 3) continue;

      const gaps: number[] = [];
      for (let k = 0; k < indices.length - 1; k++) {
        gaps.push((indices[k + 1] ?? 0) - (indices[k] ?? 0));
      }

      const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      if (mean < 4 || mean > 28) continue;

      const variance = gaps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / gaps.length;
      const stdDev = Math.sqrt(variance);
      const cv = stdDev / mean;

      if (cv <= 0.35 && cv < bestCV) {
        // Verify qafiyeh on preceding tokens
        const precedingWords = indices
          .map((a) => {
            const prevIdx = a - n;
            return prevIdx >= 0 ? bareToken(tokens[prevIdx] ?? '') : '';
          })
          .filter((w) => w.length >= 2);

        let hasQafiyeh = false;
        if (precedingWords.length >= 3) {
          const s2Freq = new Map<string, number>();
          const s1Freq = new Map<string, number>();
          for (const w of precedingWords) {
            const s2 = w.slice(-2);
            s2Freq.set(s2, (s2Freq.get(s2) ?? 0) + 1);
            const s1 = w.slice(-1);
            s1Freq.set(s1, (s1Freq.get(s1) ?? 0) + 1);
          }
          for (const [, count] of s2Freq.entries()) {
            if (count >= precedingWords.length * 0.35) {
              hasQafiyeh = true;
              break;
            }
          }
          if (!hasQafiyeh) {
            for (const [, count] of s1Freq.entries()) {
              if (count >= precedingWords.length * 0.60) {
                hasQafiyeh = true;
                break;
              }
            }
          }
        }

        if (hasQafiyeh) {
          bestCV = cv;
          bestPhrase = phrase;
        }
      }
    }
  }

  if (bestPhrase && bestCV <= 0.35) {
    return { found: true, phrase: bestPhrase, cv: bestCV };
  }
  return { found: false };
}

export function classifyForm(text: string, tokens: string[]): Form {
  const N = tokens.length;
  if (N === 0) return 'free_verse';

  // 1. Colloquial marker density
  const colloquialCount = countColloquialMarkers(tokens);
  if (colloquialCount >= 3 || (colloquialCount / N) >= 0.012) {
    return 'colloquial';
  }

  // 2. Prose check (must precede radif/qafiyeh checks to prevent prose aphorisms with
  // repeated words from entering classical couplet bisection)
  const punctCount = (text.match(/[.!؟:،«»]/g) || []).length;
  const sentencePunct = (text.match(/[.!؟]/g) || []).length;
  if (N >= 25 && ((sentencePunct >= 2 && punctCount / N >= 0.05) || (punctCount / N >= 0.08))) {
    return 'prose';
  }

  // 3. Radif periodicity
  const radif = detectRadifPeriodicity(tokens);
  if (radif.found && (radif.cv ?? 1) <= 0.35) {
    return 'classical_rhymed';
  }

  // 4. Rhyme regularity via Qafiyeh lattice
  const qafiyeh = detectQafiyehAnchors(tokens);
  if (qafiyeh && qafiyeh.cv <= 0.35 && qafiyeh.anchors.length >= 4) {
    return 'classical_rhymed';
  }

  // 5. Default
  return 'free_verse';
}
