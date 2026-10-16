/**
 * Finglish reverse transliteration: romanized Persian -> Persian script.
 *
 * Strategy:
 * 1. Check a high-priority dictionary of common Finglish words.
 * 2. Fall back to digraph/phoneme-based phonetic transliteration.
 *
 * Finglish digraphs (longest match first): sh, ch, gh, kh, zh, aa, oo, ee, ii, uu, sh...
 */

const FINGLISH_DICTIONARY: Record<string, string> = {
  // Common words
  eshgh: 'عشق',
  ashgh: 'عشق',
  esgh: 'عشق',
  mohabbat: 'محبت',
  mohabat: 'محبت',
  doost: 'دوست',
  dost: 'دوست',
  zendegi: 'زندگی',
  zendegii: 'زندگی',
  khobi: 'خوبی',
  khoobi: 'خوبی',
  mamnoon: 'ممنون',
  mamnoonam: 'ممنونم',
  khahesh: 'خواهم',
  khastam: 'خواستم',
  raftam: 'رفتم',
  amadam: 'آمدم',
  raft: 'رفت',
  amad: 'آمد',
  miram: 'می‌روم',
  miravam: 'می‌ravم',
  lotfan: 'لطفا',
  merci: 'مرسی',
  khasteh: 'خسته',
  khubi: 'خوبی',
  chetori: 'چطوری',
  chetore: 'چطور',
  kib: 'کیب',
  man: 'من',
  to: 'تو',
  oon: 'او',
  ma: 'ما',
  shoma: 'شما',
  unha: 'آنها',
  inja: 'اینجا',
  onja: 'آنجا',
  kohan: 'کهن',
  bozorg: 'بزرگ',
  kuchak: 'کوچک',
  khoob: 'خوب',
  bad: 'بد',
  ziba: 'زiba',
  zibaa: 'زiba',
  roshan: 'روشن',
  tari: 'تاری',
  sabz: 'سبز',
  sang: 'سنگ',
  ab: 'آب',
  atash: 'آتش',
  baran: 'باران',
  barf: 'برف',
  haft: 'هفت',
  hafta: 'هفته',
  shab: 'شب',
  rooz: 'روز',
  mah: 'ماه',
  sal: 'سال',
  chand: 'چند',
  chera: 'چرا',
  che: 'چه',
  kojā: 'کجا',
  kja: 'کجا',
  ki: 'کی',
  chiye: 'چی',
  chi: 'چی',
  chist: 'چیست',
  cheshm: 'چشم',
  del: 'دل',
  jân: 'جان',
  jan: 'جان',
  aziz: 'عزیز',
  azizam: 'عزیزم',
  mâmân: 'مامان',
  mamân: 'مادر',
  pedar: 'pedar',
  madar: 'مادر',
  barâdar: 'برادر',
  khâhar: 'خواهر',
  pesar: 'پسر',
  dokhtar: 'دختر',
  shohar: 'شوهر',
  zan: 'زن',
  ketâb: 'کتاب',
  dâftær: 'دفتر',
  qalam: 'قلم',
  saat: 'ساعت',
  ruz: 'روز',
  emruz: 'امروز',
  dirooz: 'دیروز',
  fardâ: 'فردا',
};

// Digraphs and phonemes, longest match first.
const DIGRAPHS: [string, string][] = [
  ['sh', 'ش'],
  ['ch', 'چ'],
  ['gh', 'غ'],
  ['kh', 'خ'],
  ['zh', 'ژ'],
  ['aa', 'ا'],
  ['oo', 'و'],
  ['ee', 'ی'],
  ['ii', 'ی'],
  ['uu', 'و'],
  ['aa', 'آ'],
  ['ow', 'او'],
  ['ai', 'ای'],
  ['ay', 'ای'],
  ['ei', 'ئ'],
  ['ey', 'ئ'],
  ['aw', 'او'],
  ['oy', 'و'],
];

const SINGLE: Record<string, string> = {
  a: 'ا',
  b: 'ب',
  p: 'پ',
  t: 'ت',
  s: 'س',
  d: 'د',
  z: 'ز',
  r: 'ر',
  f: 'ف',
  g: 'گ',
  l: 'ل',
  m: 'م',
  n: 'ن',
  v: 'و',
  h: 'ه',
  j: 'ج',
  k: 'ک',
  q: 'ق',
  x: 'خ',
  w: 'و',
  y: 'ی',
  i: 'ی',
  e: 'ه',
  o: 'و',
  u: 'و',
  '': '',
};

/**
 * Transliterate a Finglish (romanized Persian) query into Persian script.
 * Returns the Persian string, or the original input if nothing matches.
 */
export function transliterateFinglish(input: string): string {
  const q = (input ?? '').trim().toLowerCase();
  if (!q) return input;

  // 1) Dictionary lookup (exact).
  if (FINGLISH_DICTIONARY[q]) return FINGLISH_DICTIONARY[q]!;

  // 2) Dictionary lookup ignoring common suffixes (am, e, i, ye).
  for (const suffix of ['am', 'em', 'im', 'e', 'i', 'ye', 'an', 'en']) {
    if (q.endsWith(suffix) && q.length > suffix.length + 2) {
      const stem = q.slice(0, -suffix.length);
      if (FINGLISH_DICTIONARY[stem]) {
        return FINGLISH_DICTIONARY[stem]!;
      }
    }
  }

  // 3) Phonetic digraph transliteration (greedy longest match).
  let result = '';
  let i = 0;
  while (i < q.length) {
    let matched = false;
    for (const [digraph, persian] of DIGRAPHS) {
      if (q.startsWith(digraph, i)) {
        result += persian;
        i += digraph.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    const c = q[i];
    if (c.match(/[a-z]/)) {
      result += SINGLE[c] ?? c;
    } else {
      result += c; // keep spaces/punctuation
    }
    i++;
  }
  return result;
}
