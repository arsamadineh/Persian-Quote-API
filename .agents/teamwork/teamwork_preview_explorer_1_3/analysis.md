# packages/persian Architecture & Property Testing Analysis (WS2)

## 1. Overview and Design Principles

The `packages/persian` package constitutes Workstream 2 (WS2) of the Persian Quote API rebuild. It serves as the authoritative, zero-external-dependency Persian natural language processing and calendar computation engine for the entire platform (used by `packages/poem`, `packages/search`, `packages/core`, and `apps/*`).

### Core Design Invariants:
1. **Zero External Runtime Dependencies (R10)**: All algorithms operate solely via Web Standards and native JavaScript/TypeScript.
2. **Defect D9 Resolution**: Eliminates destructive over-normalization. `normalizeDisplay` faithfully preserves poetic diacritics, pronunciation marks (harakat), and ezafe while correcting typographic defects, while `normalizeSearch` performs aggressive folding for lexical indexing.
3. **Appendix A & AGENTS.md Conformance**:
   - Strips tatweel (`\u0640`) in cleanLine and display normalization (Appendix A3).
   - Zero spaces before `، ؛ ؟ ! . : ) »`, single space after punctuation when followed by non-space/digit/punctuation (Appendix A2, A3).
   - No directional marks (`\u200e\u200f`) survive in cleaned verse.
   - Letter-fingerprint word immutability (R4): normalization and cleaning never mutate lexical letters.
4. **Fast-Check Property Testing (F055)**: Invariants tested mathematically across arbitrary Unicode strings (idempotency, reversibility, crash-resistance).
5. **>= 90% Branch Coverage**: Deterministic boundary tests for every branch, condition, and edge case.

---

## 2. Complete Module Specifications & Implementation

### 2.1 File Tree
```
packages/persian/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts               # Public entry point re-exporting all APIs
│   ├── normalizer.ts          # normalizeDisplay, normalizeSearch
│   ├── cleaner.ts             # cleanLine, assertPersianTypography
│   ├── tokenizer.ts           # tokenize, TokenizeOptions
│   ├── stemmer.ts             # lightStem, StemOptions
│   ├── digits.ts              # toAsciiDigits, toPersianDigits, toArabicDigits
│   ├── calendar.ts            # jalaliToGregorian, gregorianToJalali, leap years, days in month
│   ├── bidi.ts                # bidiIsolate, detectDirection, stripBidiControls
│   ├── finglish.ts            # finglishQuery, transliterateFinglish
│   └── fuzzy.ts               # levenshteinDistance, fuzzyMatch
└── test/
    ├── normalizer.test.ts
    ├── cleaner.test.ts
    ├── tokenizer.test.ts
    ├── stemmer.test.ts
    ├── digits.test.ts
    ├── calendar.test.ts
    ├── bidi.test.ts
    ├── finglish.test.ts
    ├── fuzzy.test.ts
    └── property.test.ts
```

---

### 2.2 `src/digits.ts`
Bidirectional numeral conversions between Persian (`۰-۹`), Arabic (`٠-٩`), and ASCII (`0-9`).

```typescript
export const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
export const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
export const ASCII_DIGITS = '0123456789';

const ASCII_MAP: Record<string, string> = {};
const PERSIAN_MAP: Record<string, string> = {};
const ARABIC_MAP: Record<string, string> = {};

for (let i = 0; i < 10; i++) {
  const a = ASCII_DIGITS[i]!;
  const p = PERSIAN_DIGITS[i]!;
  const ar = ARABIC_DIGITS[i]!;
  ASCII_MAP[p] = a;
  ASCII_MAP[ar] = a;
  PERSIAN_MAP[a] = p;
  PERSIAN_MAP[ar] = p;
  ARABIC_MAP[a] = ar;
  ARABIC_MAP[p] = ar;
}

const TO_ASCII_REGEX = /[۰-۹٠-٩]/g;
const TO_PERSIAN_REGEX = /[0-9٠-٩]/g;
const TO_ARABIC_REGEX = /[0-9۰-۹]/g;

export function toAsciiDigits(s: string): string {
  if (!s) return '';
  return s.replace(TO_ASCII_REGEX, (c) => ASCII_MAP[c] ?? c);
}

export function toPersianDigits(s: string): string {
  if (!s) return '';
  return s.replace(TO_PERSIAN_REGEX, (c) => PERSIAN_MAP[c] ?? c);
}

export function toArabicDigits(s: string): string {
  if (!s) return '';
  return s.replace(TO_ARABIC_REGEX, (c) => ARABIC_MAP[c] ?? c);
}
```

---

### 2.3 `src/cleaner.ts`
Enforces Appendix A and AGENTS.md punctuation spacing, strips invisible marks, and collapses whitespace.

```typescript
export function cleanLine(s: string): string {
  if (!s) return '';
  return s
    .replace(/[\u200e\u200f\u200b\ufeff\u202a-\u202e]/g, '')
    .replace(/\u0640/g, '') // Strip Tatweel / Kashida
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\s+([،؛؟!.:)»])/g, '$1')
    .replace(/([(«])\s+/g, '$1')
    .replace(/([،؛؟])(?=[^\s\d)»"'،؛؟!.:])/gu, '$1 ')
    .replace(/([!:])(?=[^\s\d)»"'،؛؟!.:])/gu, '$1 ')
    .replace(/^[\u200c\s]+|[\u200c\s]+$/g, '')
    .trim();
}

export function assertPersianTypography(text: string): void {
  if (/\s+[،؛؟!.:)]/.test(text)) {
    throw new Error(`Persian typography violation: space before punctuation in "${text}"`);
  }
  if (text.includes('\u0640')) {
    throw new Error(`Persian typography violation: Tatweel (U+0640) found in "${text}"`);
  }
  if (text.includes('\u200e') || text.includes('\u200f')) {
    throw new Error(`Persian typography violation: Directional marks found in "${text}"`);
  }
}
```

---

### 2.4 `src/normalizer.ts`
Separates `normalizeDisplay` (faithful rendering, diacritics preserved) and `normalizeSearch` (lexical search folding).

```typescript
import { cleanLine } from './cleaner';
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
  } else {
    text = text.replace(/\u200c/g, '');
  }

  return text
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
```

---

### 2.5 `src/tokenizer.ts`
Persian-aware word segmentation respecting internal ZWNJ compound words.

```typescript
export interface TokenizeOptions {
  includePunctuation?: boolean;
}

const WORD_TOKEN_REGEX = /[\p{L}\p{M}\p{N}]+(?:\u200c[\p{L}\p{M}\p{N}]+)*/gu;
const WORD_OR_PUNCT_REGEX = /[\p{L}\p{M}\p{N}]+(?:\u200c[\p{L}\p{M}\p{N}]+)*|[^\s\p{L}\p{M}\p{N}\u200c]+/gu;

export function tokenize(s: string, options: TokenizeOptions = {}): string[] {
  if (!s) return [];
  const { includePunctuation = false } = options;
  const regex = includePunctuation ? WORD_OR_PUNCT_REGEX : WORD_TOKEN_REGEX;
  const matches = s.normalize('NFC').match(regex);
  if (!matches) return [];

  return matches.map((token) => {
    return token.replace(/^[\u200c]+|[\u200c]+$/g, '');
  }).filter((t) => t.length > 0);
}
```

---

### 2.6 `src/stemmer.ts`
Rule-based Persian light stemmer removing verbal and nominal affixes with strict root length guards.

```typescript
export interface StemOptions {
  minStemLength?: number;
}

const VERBAL_PREFIXES = [
  /^نمی‌/,
  /^نمی\u200c/,
  /^می‌/,
  /^می\u200c/,
  /^همی‌/,
  /^همی\u200c/,
  /^بی‌/,
  /^بی\u200c/,
];

const NOMINAL_SUFFIXES = [
  // Compound plurals & clitics (longest first)
  /^(.*?)(?:‌هایمان|هایمان)$/,
  /^(.*?)(?:‌هایتان|هایتان)$/,
  /^(.*?)(?:‌هایشان|هایشان)$/,
  /^(.*?)(?:‌هایم|هایم)$/,
  /^(.*?)(?:‌هایت|هایت)$/,
  /^(.*?)(?:‌هایش|هایش)$/,
  /^(.*?)(?:‌ترین|ترین)$/,
  /^(.*?)(?:‌ها|ها)$/,
  /^(.*?)(?:‌تر|تر)$/,
  /^(.*?)(?:‌جات|جات)$/,
  /^(.*?)(?:‌مان|مان)$/,
  /^(.*?)(?:‌تان|تان)$/,
  /^(.*?)(?:‌شان|شان)$/,
  /^(.*?)(?:‌ام|ام)$/,
  /^(.*?)(?:‌ات|ات)$/,
  /^(.*?)(?:‌اش|اش)$/,
  /^(.*?)(?:‌ان|ان)$/,
];

const STOPWORDS = new Set([
  'می', 'نمی', 'ما', 'او', 'آن', 'این', 'هم', 'تن', 'جان', 'سر', 'دل',
  'در', 'بر', 'با', 'ماه', 'بهار', 'تیر', 'دست', 'شاه', 'پای', 'نام'
]);

export function lightStem(word: string, options: StemOptions = {}): string {
  if (!word) return '';
  const { minStemLength = 2 } = options;
  let stem = word.trim().replace(/^[\u200c]+|[\u200c]+$/g, '');

  if (stem.length <= minStemLength || STOPWORDS.has(stem)) {
    return stem;
  }

  // Strip prefixes
  for (const prefix of VERBAL_PREFIXES) {
    if (prefix.test(stem)) {
      const candidate = stem.replace(prefix, '').replace(/^[\u200c]+/, '');
      if (candidate.length >= minStemLength && !STOPWORDS.has(candidate)) {
        stem = candidate;
        break;
      }
    }
  }

  // Strip suffixes
  for (const suffixPattern of NOMINAL_SUFFIXES) {
    const match = stem.match(suffixPattern);
    if (match && match[1]) {
      const candidate = match[1].replace(/[\u200c]+$/, '');
      if (candidate.length >= minStemLength) {
        stem = candidate;
        break;
      }
    }
  }

  return stem.replace(/[\u200c]+$/, '');
}
```

---

### 2.7 `src/calendar.ts`
Bidirectional Jalali (Solar Hijri) <-> Gregorian calendar conversion using astronomical day arithmetic without external libraries.

```typescript
export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

export interface GregorianDate {
  year: number;
  month: number;
  day: number;
  iso: string;
}

// Birashk 2820-year cycle algorithm
export function isJalaliLeapYear(jy: number): boolean {
  return jalaliCal(jy).leap === 0;
}

export function isGregorianLeapYear(gy: number): boolean {
  return (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
}

export function daysInJalaliMonth(jy: number, jm: number): number {
  if (jm < 1 || jm > 12) throw new RangeError(`Invalid Jalali month: ${jm}`);
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeapYear(jy) ? 30 : 29;
}

interface JalaliCalResult {
  leap: number;
  gy: number;
  march: number;
}

function jalaliCal(jy: number): JalaliCalResult {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192,
    2262, 2324, 2394, 2456, 3178
  ];
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0]!;

  if (jy < jp || jy >= breaks[bl - 1]!) {
    throw new RangeError(`Invalid Jalali year: ${jy}`);
  }

  let jump = 0;
  for (let i = 1; i < bl; i++) {
    const jm = breaks[i]!;
    jump = jm - jp;
    if (jy < jm) break;
    leapJ += Math.floor(jump / 33) * 8 + Math.floor(((jump % 33) + 3) / 4);
    jp = jm;
  }
  const n = jy - jp;

  leapJ += Math.floor(n / 33) * 8 + Math.floor(((n % 33) + 3) / 4);
  if ((jump % 33) === 4 && jump - n === 4) {
    leapJ += 1;
  }

  const leapG = Math.floor(gy / 4) - Math.floor(((gy / 100) + 1) * 3 / 4) - 150;
  const march = 20 + leapJ - leapG;

  let leap = ((n % 33) % 4);
  if (jump - n < 6) n - jump + ((jump + 4) % 33);

  return { leap, gy, march };
}

function j2d(jy: number, jm: number, jd: number): number {
  const r = jalaliCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - Math.floor(jm / 7) * (jm - 7) + jd - 1;
}

function d2j(jdn: number): JalaliDate {
  const gy = d2g(jdn).year;
  let jy = gy - 621;
  const r = jalaliCal(jy);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;
  let jm: number;
  let jd: number;

  if (k >= 0) {
    if (k <= 185) {
      jm = 1 + Math.floor(k / 31);
      jd = (k % 31) + 1;
      return { year: jy, month: jm, day: jd };
    } else {
      k -= 186;
    }
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  jm = 7 + Math.floor(k / 30);
  jd = (k % 30) + 1;
  return { year: jy, month: jm, day: jd };
}

function g2d(gy: number, gm: number, gd: number): number {
  let d = Math.floor((gy + Math.floor((gm - 8) / 6) + 100100) * 1461 / 4)
    + Math.floor((153 * ((gm + 9) % 12) + 2) / 5) + gd - 34840408;
  d = d - Math.floor(Math.floor((gy + 100100 + Math.floor((gm - 8) / 6)) / 100) * 3 / 4) + 752;
  return d;
}

function d2g(jdn: number): { year: number; month: number; day: number } {
  let j = 4 * jdn + 139361631;
  j = j + Math.floor(Math.floor((4 * jdn + 183187720) / 146097) * 3 / 4) * 4 - 3908;
  const i = Math.floor((j % 1461) / 4) * 5 + 308;
  const gd = Math.floor((i % 153) / 5) + 1;
  const gm = (Math.floor(i / 153) % 12) + 1;
  const gy = Math.floor(j / 1461) - 100100 + Math.floor((8 - gm) / 6);
  return { year: gy, month: gm, day: gd };
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): GregorianDate {
  if (jm < 1 || jm > 12 || jd < 1 || jd > daysInJalaliMonth(jy, jm)) {
    throw new RangeError(`Invalid Jalali date: ${jy}/${jm}/${jd}`);
  }
  const jdn = j2d(jy, jm, jd);
  const g = d2g(jdn);
  const iso = `${g.year.toString().padStart(4, '0')}-${g.month.toString().padStart(2, '0')}-${g.day.toString().padStart(2, '0')}`;
  return { year: g.year, month: g.month, day: g.day, iso };
}

export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  if (gm < 1 || gm > 12 || gd < 1 || gd > 31) {
    throw new RangeError(`Invalid Gregorian date: ${gy}/${gm}/${gd}`);
  }
  const jdn = g2d(gy, gm, gd);
  return d2j(jdn);
}

export function parseJalaliDate(s: string): JalaliDate | null {
  if (!s) return null;
  const m = s.match(/(?:^|\D)(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:\D|$)/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}
```

---

### 2.8 `src/bidi.ts`
Bidirectional text isolation and detection to prevent directional leakage.

```typescript
export type TextDirection = 'rtl' | 'ltr' | 'neutral';

const RTL_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const LTR_REGEX = /[A-Za-z\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF]/;

export function detectDirection(s: string): TextDirection {
  if (!s) return 'neutral';
  for (const char of s) {
    if (RTL_REGEX.test(char)) return 'rtl';
    if (LTR_REGEX.test(char)) return 'ltr';
  }
  return 'neutral';
}

export interface BidiIsolateOptions {
  mode?: 'rli' | 'lri' | 'fsi' | 'embed_ltr';
}

export function bidiIsolate(s: string, options: BidiIsolateOptions = {}): string {
  if (!s) return '';
  const { mode = 'rli' } = options;

  if (mode === 'embed_ltr') {
    // Wrap embedded Latin/numeric sequences in LRI...PDI
    return s.replace(/([A-Za-z0-9][A-Za-z0-9\s._\-/:@]*[A-Za-z0-9])/g, '\u2066$1\u2069');
  }

  const dir = detectDirection(s);
  if (dir === 'neutral') return s;

  if (mode === 'fsi') return `\u2068${s}\u2069`;
  if (mode === 'lri' || dir === 'ltr') return `\u2066${s}\u2069`;
  return `\u2067${s}\u2069`; // RLI ... PDI
}

export function stripBidiControls(s: string): string {
  if (!s) return '';
  return s.replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '');
}
```

---

### 2.9 `src/finglish.ts`
Phonetic transliterator converting romanized Persian search queries to Persian orthography.

```typescript
const POET_DICTIONARY: Record<string, string[]> = {
  hafez: ['حافظ'],
  hafiz: ['حافظ'],
  saadi: ['سعدی'],
  sadi: ['سعدی'],
  ferdowsi: ['فردوسی'],
  ferdowsi: ['فردوسی'],
  molana: ['مولانا'],
  molavi: ['مولانا'],
  rumi: ['مولانا'],
  mevlana: ['مولانا'],
  khayyam: ['خیام'],
  khayam: ['خیام'],
  attar: ['عطار'],
  nezami: ['نظامی'],
  nizami: ['نظامی'],
  sohrab: ['سهراب'],
  sepehri: ['سپهری'],
  forough: ['فروغ'],
  farrokhzad: ['فرخزاد'],
  shamloo: ['شاملو'],
  shamlou: ['شاملو'],
  nima: ['نیما'],
  youshij: ['یوشیج'],
  shahriar: ['شهریار'],
  shahriyar: ['شهریار'],
  ebtehaj: ['ابتهاج'],
  sayeh: ['سایه'],
  simin: ['سیمین'],
  behbahani: ['بهبهانی'],
};

const DIGRAPHS: Array<[string, string]> = [
  ['kh', 'خ'],
  ['sh', 'ش'],
  ['ch', 'چ'],
  ['zh', 'ژ'],
  ['gh', 'ق'],
  ['ph', 'ف'],
  ['th', 'ث'],
  ['ee', 'ی'],
  ['oo', 'و'],
  ['ou', 'و'],
  ['aa', 'ا'],
  ['ck', 'ک'],
];

const SINGLE_MAP: Record<string, string> = {
  b: 'ب', p: 'پ', t: 'ت', s: 'س', j: 'ج', c: 'ک',
  h: 'ه', d: 'د', r: 'ر', z: 'ز', f: 'ف', k: 'ک',
  g: 'گ', l: 'ل', m: 'م', n: 'ن', v: 'و', w: 'و',
  y: 'ی', q: 'ق', x: 'کس',
};

export function finglishQuery(query: string): string[] {
  if (!query) return [];
  const normalized = query.trim().toLowerCase();
  if (!/^[a-z0-9\s._'-]+$/i.test(normalized)) {
    return [query.trim()]; // Already Persian or mixed
  }

  // Check dictionary
  if (POET_DICTIONARY[normalized]) {
    return [...POET_DICTIONARY[normalized]!];
  }

  const words = normalized.split(/\s+/);
  const transliteratedWords = words.map((w) => transliterateWord(w));
  return [transliteratedWords.join(' ')];
}

function transliterateWord(word: string): string {
  if (POET_DICTIONARY[word]) {
    return POET_DICTIONARY[word]![0]!;
  }

  let i = 0;
  let result = '';

  while (i < word.length) {
    // Try digraph
    if (i + 1 < word.length) {
      const pair = word.slice(i, i + 2);
      const match = DIGRAPHS.find(([d]) => d === pair);
      if (match) {
        result += match[1];
        i += 2;
        continue;
      }
    }

    const char = word[i]!;

    if (char === 'a') {
      result += (i === 0) ? 'ا' : 'ا';
    } else if (char === 'e') {
      result += (i === word.length - 1) ? 'ه' : (i === 0 ? 'ا' : '');
    } else if (char === 'o') {
      result += (i === 0) ? 'ا' : 'و';
    } else if (char === 'u') {
      result += (i === 0) ? 'او' : 'و';
    } else if (char === 'i') {
      result += (i === 0) ? 'ای' : 'ی';
    } else if (SINGLE_MAP[char]) {
      result += SINGLE_MAP[char];
    } else {
      result += char;
    }
    i++;
  }

  return result;
}
```

---

### 2.10 `src/fuzzy.ts`
Optimized Levenshtein distance and fuzzy matching calculation for Persian strings.

```typescript
export interface FuzzyOptions {
  maxDistance?: number;
  phoneticTolerance?: boolean;
}

export function levenshteinDistance(a: string, b: string, options: FuzzyOptions = {}): number {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const { maxDistance = Infinity } = options;
  if (Math.abs(a.length - b.length) > maxDistance) {
    return maxDistance + 1;
  }

  const s1 = a.length <= b.length ? a : b;
  const s2 = a.length <= b.length ? b : a;
  const m = s1.length;
  const n = s2.length;

  let prev = new Int32Array(m + 1);
  let curr = new Int32Array(m + 1);

  for (let i = 0; i <= m; i++) prev[i] = i;

  for (let j = 1; j <= n; j++) {
    curr[0] = j;
    const char2 = s2.charCodeAt(j - 1);
    let minInRow = curr[0]!;

    for (let i = 1; i <= m; i++) {
      const char1 = s1.charCodeAt(i - 1);
      const cost = char1 === char2 ? 0 : 1;
      const val = Math.min(
        prev[i]! + 1,      // deletion
        curr[i - 1]! + 1,  // insertion
        prev[i - 1]! + cost // substitution
      );
      curr[i] = val;
      if (val < minInRow) minInRow = val;
    }

    if (minInRow > maxDistance) return maxDistance + 1;

    const tmp = prev;
    prev = curr;
    curr = tmp;
  }

  return prev[m]!;
}

export function fuzzyMatch(a: string, b: string, options: FuzzyOptions = {}): number {
  if (!a && !b) return 1.0;
  if (!a || !b) return 0.0;
  if (a === b) return 1.0;

  const maxLen = Math.max(a.length, b.length);
  const dist = levenshteinDistance(a, b, options);
  if (dist > maxLen) return 0.0;
  return Math.max(0, 1 - dist / maxLen);
}
```

---

## 3. Fast-Check Property-Based Test Strategy

The property test suite runs over hundreds of arbitrary Unicode, Persian, and numeric combinations using `fast-check`.

### 3.1 Key Properties Tested:
1. **Idempotency Property (`f(f(x)) === f(x)`)**:
   - `normalizeDisplay(normalizeDisplay(s)) === normalizeDisplay(s)`
   - `normalizeSearch(normalizeSearch(s)) === normalizeSearch(s)`
   - `cleanLine(cleanLine(s)) === cleanLine(s)`
   - `toAsciiDigits(toAsciiDigits(s)) === toAsciiDigits(s)`
   - `toPersianDigits(toPersianDigits(s)) === toPersianDigits(s)`
   - `lightStem(lightStem(w)) === lightStem(w)`
   - `stripBidiControls(stripBidiControls(s)) === stripBidiControls(s)`

2. **Bidirectional Calendar Reversibility**:
   - For all valid Jalali years `1200 <= y <= 1500`, months `1 <= m <= 12`, and valid days:
     `gregorianToJalali(jalaliToGregorian(y, m, d)) === { year: y, month: m, day: d }`

3. **Digit Reversibility**:
   - For any integer `n >= 0`:
     `Number(toAsciiDigits(toPersianDigits(String(n)))) === n`

4. **Crash-Resistance Invariant**:
   - For any string from `fc.fullUnicodeString()` and `fc.string()`:
     All 10 modules execute synchronously without throwing unhandled exceptions.

5. **Punctuation Spacing Invariant**:
   - In `cleanLine(s)`: no spaces precede `، ؛ ؟ ! . : ) »`.

6. **Metric Space Invariants (Levenshtein)**:
   - `dist(a, a) === 0`
   - `dist(a, b) === dist(b, a)`
   - `dist(a, c) <= dist(a, b) + dist(b, c)`

---

## 4. Branch Coverage Strategy (>= 90%)

### 4.1 Branch Analysis & Target Coverage:
| Module | Target Functions | Conditional Branches | Test Approach |
|--------|------------------|----------------------|---------------|
| `digits.ts` | `toAsciiDigits`, `toPersianDigits`, `toArabicDigits` | Empty string check, digit match lookup fallback | Test Persian, Arabic, ASCII, empty, and non-digit strings (100% branch) |
| `cleaner.ts` | `cleanLine`, `assertPersianTypography` | Empty string guard, regex replacements, assertion throws | Test empty string, punctuation before/after, tatweel, directional marks, error throwing (100% branch) |
| `normalizer.ts` | `normalizeDisplay`, `normalizeSearch` | Empty string, option flags (`preserveZwnj`), replacement branches | Test display vs search, NFC, diacritic preservation, ZWNJ options (>= 95% branch) |
| `tokenizer.ts` | `tokenize` | Empty string guard, `includePunctuation` flag, null match fallback | Test empty string, with/without punctuation, compound ZWNJ, mixed script (100% branch) |
| `stemmer.ts` | `lightStem` | Empty word, short length, stopword set, prefix loop breaks, suffix match branches | Test word < 2 chars, stopwords, each verbal prefix, each nominal suffix, words without affixes (>= 92% branch) |
| `calendar.ts` | `jalaliToGregorian`, `gregorianToJalali`, `daysInJalaliMonth`, `isJalaliLeapYear`, `parseJalaliDate` | Month validation, leap year branches, jump calculations, string format matching | Test months 1-12, leap years (1395, 1399, 1403), out-of-range throws, date string formats (>= 95% branch) |
| `bidi.ts` | `detectDirection`, `bidiIsolate`, `stripBidiControls` | Empty string, neutral/rtl/ltr detection, isolation modes (`rli`, `lri`, `fsi`, `embed_ltr`) | Test empty string, pure RTL, pure LTR, neutral, each isolation mode (100% branch) |
| `finglish.ts` | `finglishQuery`, `transliterateWord` | Empty string, non-Latin check, poet dictionary hits, digraph matches, vowel position branches | Test dictionary terms, all digraphs, vowels at start/middle/end, Persian passthrough (>= 92% branch) |
| `fuzzy.ts` | `levenshteinDistance`, `fuzzyMatch` | Identical check, empty checks, max distance pruning, matrix loops | Test identical, empty, max distance prune, single edit, complete mismatch (100% branch) |

---

## 5. Worker Implementation Guide & Verification

1. Worker creates `packages/persian/` directory.
2. Worker sets up `packages/persian/package.json` and `tsconfig.json`.
3. Worker writes the 10 source files under `packages/persian/src/`.
4. Worker adds `fast-check` to root `package.json` devDependencies.
5. Worker creates unit and property tests under `packages/persian/test/`.
6. Worker executes `bun test --coverage packages/persian/test` and confirms:
   - All tests pass (0 failures).
   - Branch and line coverage >= 90%.
