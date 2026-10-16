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

interface SuffixRule {
  pattern: RegExp;
  minStem: number;
}

const NOMINAL_SUFFIXES: SuffixRule[] = [
  // Plural + pronominal clitics with or without ZWNJ
  { pattern: /^(.*?)(?:‌هایمان|هایمان)$/, minStem: 2 },
  { pattern: /^(.*?)(?:‌هایتان|هایتان)$/, minStem: 2 },
  { pattern: /^(.*?)(?:‌هایشان|هایشان)$/, minStem: 2 },
  { pattern: /^(.*?)(?:‌هایم|هایم)$/, minStem: 2 },
  { pattern: /^(.*?)(?:‌هایت|هایت)$/, minStem: 2 },
  { pattern: /^(.*?)(?:‌هایش|هایش)$/, minStem: 2 },
  { pattern: /^(.*?)(?:‌ترین|ترین)$/, minStem: 2 },
  { pattern: /^(.*?)(?:‌ها|ها)$/, minStem: 2 },
  { pattern: /^(.*?)(?:‌تر|تر)$/, minStem: 2 },
  { pattern: /^(.*?)(?:‌جات|جات)$/, minStem: 2 },
  // Pronominal clitics: require ZWNJ or minStem >= 3 to protect short roots
  { pattern: /^(.*?)‌مان$/, minStem: 2 },
  { pattern: /^(.*?)مان$/, minStem: 3 },
  { pattern: /^(.*?)‌تان$/, minStem: 2 },
  { pattern: /^(.*?)تان$/, minStem: 2 },
  { pattern: /^(.*?)‌شان$/, minStem: 2 },
  { pattern: /^(.*?)شان$/, minStem: 3 },
  // 1st/2nd/3rd person singular clitics: strictly require ZWNJ
  // In standard Persian orthography, possessives without ZWNJ are written -م / -ش (not -ام / -اش).
  // Matching -ام without ZWNJ mutilates سلام, پیام, کلام, تمام, خیام, etc.
  { pattern: /^(.*?)‌ام$/, minStem: 2 },
  { pattern: /^(.*?)‌ات$/, minStem: 2 },
  { pattern: /^(.*?)‌اش$/, minStem: 2 },
  // Arabic sound feminine plural -ات without ZWNJ requires minStem >= 3 (protecting نجات, حیات, نبات)
  { pattern: /^(.*?)ات$/, minStem: 3 },
  // Plural -ان for animate and literary nouns
  { pattern: /^(.*?)(?:‌ان|ان)$/, minStem: 2 },
];

const STOPWORDS = new Set([
  'می', 'نمی', 'ما', 'او', 'آن', 'این', 'هم', 'تن', 'جان', 'سر', 'دل',
  'در', 'بر', 'با', 'ماه', 'بهار', 'تیر', 'دست', 'شاه', 'پای', 'نام'
]);

/**
 * Core Persian root vocabulary protected from over-stemming.
 * Contains common non-plural monomorphemic nouns, proper names,
 * and roots ending in character sequences identical to affixes (-ان, -مان, -تان, -ام, -ات, -تر, -ها).
 */
export const PROTECTED_ROOTS = new Set([
  // Proper names & Geography ending in ان / مان / تان
  'ایران', 'توران', 'تهران', 'اصفهان', 'کرمان', 'گیلان', 'شیروان', 'خراسان', 'آذربایجان', 'همدان', 'کاشان', 'سمنان', 'آلمان', 'یونان', 'لبنان', 'عمان',
  // Core classical & modern Persian nouns ending in ان
  'باران', 'آسمان', 'جهان', 'زمان', 'روان', 'توان', 'طوفان', 'زندان', 'میدان', 'پایان', 'دکان', 'کاروان', 'مکان', 'امکان', 'بحران', 'قرآن', 'سلطان', 'دیوان',
  'پیمان', 'فرمان', 'درمان', 'سامان', 'دامان', 'گریبان', 'ایوان', 'عنوان', 'پهلوان', 'پاسبان', 'دیدبان', 'باغبان', 'ساربان',
  'دهان', 'دندان', 'زبان', 'استخوان', 'پستان',
  // Words ending in ستان
  'داستان', 'بوستان', 'گلستان', 'زمستان', 'تابستان', 'باستان', 'استان', 'کوهستان', 'دبستان', 'شبستان', 'قبرستان', 'گورستان',
  // Adjectives, adverbs, and pronouns ending in ان
  'مهربان', 'نگران', 'حیران', 'ویران', 'پنهان', 'آسان', 'یکسان', 'چندان', 'همان', 'چنان', 'خزان',
  'درخشان', 'پریشان', 'افشان', 'نشان',
  // Words ending in مان
  'ساختمان', 'سازمان', 'قهرمان', 'مهمان', 'پژمان', 'دودمان', 'چیدمان', 'گفتمان', 'یادمان',
  // Words ending in ام
  'سلام', 'کلام', 'پیام', 'خیام', 'تمام', 'مقام', 'حرام', 'آرام', 'امام', 'انتقام', 'مدام', 'بادام', 'بهرام', 'سام', 'جام', 'دام', 'کام', 'شام', 'بام', 'اندام', 'فرجام', 'سرانجام', 'هنگام', 'انجام', 'طعام', 'قوام', 'دوام', 'نظام',
  // Words ending in ات
  'نجات', 'حیات', 'نبات', 'ثبات', 'وفات', 'جهات', 'بیات', 'برات', 'ذات', 'خرابات', 'مناجات', 'ملاقات', 'مجازات', 'مکافات',
  // Words ending in تر / ترین
  'دختر', 'دفتر', 'کبوتر', 'انگشتر', 'خاکستر', 'اختر',
  // Words ending in ها / اش
  'تنها', 'اشتها', 'انتها', 'پاداش', 'خراش', 'تلاش', 'نقاش'
]);

export function lightStem(word: string, options: StemOptions = {}): string {
  if (!word) return '';
  const { minStemLength = 2 } = options;
  let stem = word.trim().replace(/^[\u200c]+|[\u200c]+$/g, '');

  if (stem.length <= minStemLength || STOPWORDS.has(stem) || PROTECTED_ROOTS.has(stem)) {
    return stem;
  }

  // Strip prefixes
  for (const prefix of VERBAL_PREFIXES) {
    if (prefix.test(stem)) {
      const candidate = stem.replace(prefix, '').replace(/^[\u200c]+/, '');
      if (candidate.length >= minStemLength) {
        stem = candidate;
        break;
      }
    }
  }

  if (PROTECTED_ROOTS.has(stem)) {
    return stem;
  }

  // Strip suffixes
  for (const { pattern, minStem } of NOMINAL_SUFFIXES) {
    const match = stem.match(pattern);
    if (match && match[1]) {
      let candidate = match[1].replace(/[\u200c]+$/, '');

      // Handle words where root ends in 'ت' followed by plural 'ان' (e.g. درختان -> درخت, دوستان -> دوست)
      const matchedSuffix = stem.slice(match[1].length);
      if (matchedSuffix === 'تان' && /[خسشف]$/.test(candidate)) {
        candidate = candidate + 'ت';
      }

      const requiredMin = Math.max(minStemLength, minStem);
      if (candidate.length >= requiredMin) {
        stem = candidate;
        break;
      }
    }
  }

  return stem.replace(/[\u200c]+$/, '');
}
