export function cleanLine(s: string): string {
  if (!s) return '';
  return s
    .normalize('NFC')
    .replace(/[\u200e\u200f\u200b\ufeff\u202a-\u202e]/g, '')
    .replace(/\u0640/g, '') // Strip Tatweel / Kashida
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\s+([،؛؟!.:)»\]])/g, '$1')
    .replace(/([(«\[])\s+/g, '$1')
    .replace(/([،؛؟])(?=[^\s\d)»"'\]،؛؟!.:])/gu, '$1 ')
    .replace(/([!:])(?=[^\s\d)»"'\]،؛؟!.:])/gu, '$1 ')
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
