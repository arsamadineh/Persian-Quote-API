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

/**
 * Computes the canonical letter fingerprint of a Persian string per Rule R4.
 * Strips whitespace, ZWNJ, structural delimiters (*, /), Tatweel (U+0640),
 * and invisible directional/control characters (\u200e, \u200f, \u200b, \ufeff, \u202a-\u202e)
 * to verify that no letters or words were added, removed, or altered during restructuring.
 */
export function letterFingerprint(s: string): string {
  if (!s) return '';
  return s.replace(/[\s\u200c\u200e\u200f\u200b\ufeff\u202a-\u202e\u0640*\/]+/g, '');
}
