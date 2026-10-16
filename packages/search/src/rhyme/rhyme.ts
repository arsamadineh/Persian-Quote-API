import { normalizeSearch } from '@persian-quote/persian';

/** Persian vowels used for qafiyeh (rhyme) extraction. */
const VOWELS = new Set(['ا', 'آ', 'إ', 'أ', 'و', 'ی', 'ي', 'ى', 'e', 'a', 'o', 'u', 'i']);

/**
 * Extract the qafiyeh (rhyming portion) of a Persian word.
 *
 * The qafiyeh is the rhyming part of the final syllable: starting from the
 * last vowel of the word, take that vowel plus all following consonants,
 * plus the immediately preceding consonant if present.
 *
 * Returns the normalized qafiyeh key, or undefined if no vowel is found.
 */
export function extractQafiyeh(word: string): string | undefined {
  const w = normalizeSearch(word ?? '').replace(/[\p{P}\p{S}]/gu, '');
  if (!w) return undefined;

  const chars = Array.from(w);
  let lastVowel = -1;
  for (let i = chars.length - 1; i >= 0; i--) {
    if (VOWELS.has(chars[i])) {
      lastVowel = i;
      break;
    }
  }
  if (lastVowel === -1) return undefined;

  const start = lastVowel > 0 ? lastVowel - 1 : lastVowel;
  return chars.slice(start).join('');
}

/**
 * Rhyme finder: given a word, returns corpus words and verses sharing its qafiyeh.
 */
export class RhymeFinder {
  // qafiyeh key -> set of words
  private wordMap: Map<string, Set<string>> = new Map();
  // qafiyeh key -> list of {poemId, poet, line}
  private verseMap: Map<string, Array<{ poemId: string; poet: string; line: string }>> = new Map();

  constructor(
    words: string[],
    verses: Array<{ poemId: string; poet: string; line: string }>
  ) {
    for (const w of words) {
      const key = extractQafiyeh(w);
      if (key) {
        if (!this.wordMap.has(key)) this.wordMap.set(key, new Set());
        this.wordMap.get(key)!.add(w);
      }
    }
    for (const v of verses) {
      const wordsInLine = v.line.trim().split(/\s+/).filter(Boolean);
      const lastWord = wordsInLine[wordsInLine.length - 1] ?? '';
      const key = extractQafiyeh(lastWord);
      if (key) {
        if (!this.verseMap.has(key)) this.verseMap.set(key, []);
        this.verseMap.get(key)!.push(v);
      }
    }
  }

  /** Find rhymes for a word. */
  find(word: string, limit = 50): {
    query: string;
    qafiyeh: string | undefined;
    words: string[];
    verses: Array<{ poemId: string; poet: string; line: string }>;
  } {
    const key = extractQafiyeh(word);
    const words = key ? Array.from(this.wordMap.get(key) ?? []).sort() : [];
    const verses = key ? (this.verseMap.get(key) ?? []).slice(0, limit) : [];
    return {
      query: word,
      qafiyeh: key,
      words: words.slice(0, limit),
      verses,
    };
  }
}
