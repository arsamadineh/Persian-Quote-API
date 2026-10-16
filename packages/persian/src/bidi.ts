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
    return s.replace(/([A-Za-z0-9][A-Za-z0-9\s._\-/:@]*[A-Za-z0-9])/g, '\u2066$1\u2069');
  }

  const dir = detectDirection(s);
  if (dir === 'neutral') return s;

  if (mode === 'fsi') return `\u2068${s}\u2069`;
  if (mode === 'lri' || dir === 'ltr') return `\u2066${s}\u2069`;
  return `\u2067${s}\u2069`;
}

export function stripBidiControls(s: string): string {
  if (!s) return '';
  return s.replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '');
}
