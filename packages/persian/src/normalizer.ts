import { toAsciiDigits } from './digits';

export interface SearchNormalizeOptions {
  preserveZwnj?: boolean;
}

/**
 * Normalizes text for visual display and reading.
 * - Enforces Unicode NFC.
 * - Preserves diacritics (harakat), ezafe, and tanwin for poetic meter/rhyme.
 * - Corrects Persian letterforms (Arabic Yeh -> ی, Arabic Kaf -> ک, ۀ -> هٔ).
 * - Strips tatweel (ـ), BOM, and invisible bidi marks.
 * - Cleans punctuation spacing according to Persian typography rules.
 */
export function normalizeDisplay(s: string): string {
  if (!s) return '';
  return s
    .normalize('NFC')
    .replace(/‚/g, '،')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ۀ/g, 'هٔ')
    .replace(/ة/g, 'ه')
    .replace(/[\u25a1\uf071]/g, '') // Junk OCR glyphs
    .replace(/[\u200e\u200f\u200b\ufeff\u202a-\u202e]/g, '')
    .replace(/\u0640/g, '') // Tatweel
    .replace(/\u00a0/g, ' ')
    .replace(/\s+([،؛؟!.:)»])/g, '$1')
    .replace(/([(«])\s+/g, '$1')
    .replace(/([،؛؟])(?=[^\s\d)»"'،؛؟!.:])/gu, '$1 ')
    .replace(/[ \t]+$/gm, '')
    .replace(/\u200c{2,}/g, '\u200c')
    .replace(/([ \t])\u200c+/g, '$1')
    .replace(/\u200c+([ \t])/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Normalizes text for search indexing, matching, and autocomplete.
 * - Enforces Unicode NFC and lowercases Latin.
 * - Folds alef forms (آ, أ, إ, ٱ -> ا).
 * - Folds yeh forms (ي, ى, ئ -> ی).
 * - Folds kaf forms (ك -> ک).
 * - Folds waw forms (ؤ -> و).
 * - Folds heh forms (ة, ۀ, هٔ -> ه).
 * - Strips all diacritics / harakat / tanwin / shadda.
 * - Converts all Persian and Arabic digits to ASCII.
 * - Unifies or removes ZWNJ based on options.
 */
export function normalizeSearch(s: string, options: SearchNormalizeOptions = {}): string {
  if (!s) return '';
  const { preserveZwnj = false } = options;

  let text = s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/[يىئ]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ؤ/g, 'و')
    .replace(/[ةۀ]/g, 'ه')
    .replace(/هٔ/g, 'ه')
    .replace(/[\u064B-\u065F\u0670]/g, '') // Diacritics/Harakat
    .replace(/\u0640/g, '') // Tatweel
    .replace(/[\u200e\u200f\u200b\ufeff\u202a-\u202e]/g, '');

  text = toAsciiDigits(text);

  if (preserveZwnj) {
    text = text
      .replace(/\u200c{2,}/g, '\u200c')
      .replace(/^[\u200c\s]+|[\u200c\s]+$/g, '');
    return text
      .replace(/[^\p{L}\p{N}\u200c]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  text = text.replace(/\u200c/g, '');
  return text
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
