import { describe, it, expect } from 'bun:test';
import {
  toAsciiDigits,
  toPersianDigits,
  toArabicDigits,
  PERSIAN_DIGITS,
  ARABIC_DIGITS,
  ASCII_DIGITS,
} from '../src';

describe('packages/persian: Digits Module', () => {
  it('converts Persian and Arabic digits to ASCII', () => {
    expect(toAsciiDigits('۱۲۳۴۵۶۷۸۹۰')).toBe('1234567890');
    expect(toAsciiDigits('١٢٣٤٥٦٧٨٩٠')).toBe('1234567890');
    expect(toAsciiDigits('سال ۱۳۶۴')).toBe('سال 1364');
    expect(toAsciiDigits('12345')).toBe('12345');
    expect(toAsciiDigits('')).toBe('');
  });

  it('converts ASCII and Arabic digits to Persian digits', () => {
    expect(toPersianDigits('1234567890')).toBe('۱۲۳۴۵۶۷۸۹۰');
    expect(toPersianDigits('١٢٣٤٥٦٧٨٩٠')).toBe('۱۲۳۴۵۶۷۸۹۰');
    expect(toPersianDigits('Page 42')).toBe('Page ۴۲');
    expect(toPersianDigits('')).toBe('');
  });

  it('converts ASCII and Persian digits to Arabic digits', () => {
    expect(toArabicDigits('1234567890')).toBe('١٢٣٤٥٦٧٨٩٠');
    expect(toArabicDigits('۱۲۳۴۵۶۷۸۹۰')).toBe('١٢٣٤٥٦٧٨٩٠');
    expect(toArabicDigits('')).toBe('');
  });

  it('preserves text without digits unchanged', () => {
    const text = 'حافظ شیرازی';
    expect(toAsciiDigits(text)).toBe(text);
    expect(toPersianDigits(text)).toBe(text);
    expect(toArabicDigits(text)).toBe(text);
  });
});
