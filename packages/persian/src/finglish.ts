const POET_DICTIONARY: Record<string, string[]> = Object.assign(Object.create(null), {
  hafez: ['حافظ'],
  hafiz: ['حافظ'],
  saadi: ['سعدی'],
  sadi: ['سعدی'],
  ferdowsi: ['فردوسی'],
  firdawsi: ['فردوسی'],
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
});

const COMMON_WORDS: Record<string, string> = Object.assign(Object.create(null), {
  eshgh: 'عشق',
  eshq: 'عشق',
  shab: 'شب',
  baran: 'باران',
  baaraan: 'باران',
  va: 'و',
  del: 'دل',
  yar: 'یار',
  mey: 'می',
  jaam: 'جام',
  sahar: 'سحر',
  rooz: 'روز',
  khoda: 'خدا',
  doost: 'دوست',
  dost: 'دوست',
  jaan: 'جان',
  jan: 'جان',
  khanoom: 'خانوم',
  khanom: 'خانم',
  zendegi: 'زندگی',
  bahar: 'بهار',
});

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

const SINGLE_MAP: Record<string, string> = Object.assign(Object.create(null), {
  b: 'ب', p: 'پ', t: 'ت', s: 'س', j: 'ج', c: 'ک',
  h: 'ه', d: 'د', r: 'ر', z: 'ز', f: 'ف', k: 'ک',
  g: 'گ', l: 'ل', m: 'م', n: 'ن', v: 'و', w: 'و',
  y: 'ی', q: 'ق', x: 'کس',
});

function hasOwn<T extends object>(obj: T, prop: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

export function transliterateWord(word: string): string {
  const lower = word.toLowerCase();
  if (hasOwn(POET_DICTIONARY, lower)) {
    return POET_DICTIONARY[lower]![0]!;
  }
  if (hasOwn(COMMON_WORDS, lower)) {
    return COMMON_WORDS[lower]!;
  }

  let i = 0;
  let result = '';

  while (i < lower.length) {
    if (i + 1 < lower.length) {
      const pair = lower.slice(i, i + 2);
      const match = DIGRAPHS.find(([d]) => d === pair);
      if (match) {
        result += match[1];
        i += 2;
        continue;
      }
    }

    const char = lower[i]!;

    if (char === 'a') {
      result += 'ا';
    } else if (char === 'e') {
      result += (i === lower.length - 1) ? 'ه' : (i === 0 ? 'ا' : '');
    } else if (char === 'o') {
      result += (i === 0) ? 'ا' : 'و';
    } else if (char === 'u') {
      result += (i === 0) ? 'او' : 'و';
    } else if (char === 'i') {
      result += (i === 0) ? 'ای' : 'ی';
    } else if (hasOwn(SINGLE_MAP, char)) {
      result += SINGLE_MAP[char]!;
    } else {
      result += char;
    }
    i++;
  }

  return result;
}

export function transliterateFinglish(text: string): string {
  if (!text) return '';
  const words = text.split(/(\s+)/);
  return words.map((w) => (/^\s+$/.test(w) ? w : transliterateWord(w))).join('');
}

export function finglishQuery(query: string): string[] {
  if (!query) return [];
  const trimmed = query.trim();
  const normalized = trimmed.toLowerCase();

  // If already Persian or contains non-Latin characters
  if (!/^[a-z0-9\s._'-]+$/i.test(normalized)) {
    return [trimmed];
  }

  if (hasOwn(POET_DICTIONARY, normalized)) {
    return [...POET_DICTIONARY[normalized]!];
  }

  const words = normalized.split(/\s+/);
  const transliteratedWords = words.map((w) => transliterateWord(w));
  return [transliteratedWords.join(' ')];
}
