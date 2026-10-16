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
