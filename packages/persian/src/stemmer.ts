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
      if (candidate.length >= minStemLength) {
        stem = candidate;
        break;
      }
    }
  }

  // Strip suffixes
  for (const suffixPattern of NOMINAL_SUFFIXES) {
    const match = stem.match(suffixPattern);
    if (match && match[1]) {
      let candidate = match[1].replace(/[\u200c]+$/, '');

      // Handle words where root ends in 'ت' followed by plural 'ان' (e.g. درختان -> درخت, دوستان -> دوست)
      const matchedSuffix = stem.slice(match[1].length);
      if (matchedSuffix === 'تان' && /[خسشف]$/.test(candidate)) {
        candidate = candidate + 'ت';
      }

      if (candidate.length >= minStemLength) {
        stem = candidate;
        break;
      }
    }
  }

  return stem.replace(/[\u200c]+$/, '');
}
