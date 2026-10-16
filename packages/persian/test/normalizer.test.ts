import { describe, it, expect } from 'bun:test';
import { normalizeDisplay, normalizeSearch } from '../src';

describe('packages/persian: Normalizer Module', () => {
  describe('normalizeDisplay', () => {
    it('preserves diacritics (harakat), ezafe, and tanwin', () => {
      const withHarakat = 'پیرِ ما با شمعِ مُرده دوش مِی‌خوار شد؛ کِتاباً مَّوْقُوتاً';
      const normalized = normalizeDisplay(withHarakat);
      expect(normalized).toContain('پیرِ');
      expect(normalized).toContain('مُرده');
      expect(normalized).toContain('مِی‌خوار');
      expect(normalized).toContain('کِتاباً');
    });

    it('corrects Arabic yeh and kaf to Persian characters', () => {
      const arabic = 'كتاب يار على';
      expect(normalizeDisplay(arabic)).toBe('کتاب یار علی');
    });

    it('corrects heh yeh ligature (ۀ) to standard (هٔ)', () => {
      const ligature = 'خانۀ من نامۀ دوست';
      expect(normalizeDisplay(ligature)).toBe('خانهٔ من نامهٔ دوست');
    });

    it('replaces Arabic teh marbuta (ة) with heh (ه)', () => {
      const marbuta = 'سفینة النجاة';
      expect(normalizeDisplay(marbuta)).toBe('سفینه النجاه');
    });

    it('cleans OCR glyphs and tatweel', () => {
      const ocr = 'شعرـ\u25a1زیبا\uf071';
      expect(normalizeDisplay(ocr)).toBe('شعرزیبا');
    });

    it('normalizes comma typo and punctuation spacing', () => {
      const typo = 'سلام‚ دنیا ، خوب ؟';
      expect(normalizeDisplay(typo)).toBe('سلام، دنیا، خوب؟');
    });

    it('collapses excessive line breaks and strips edge whitespace', () => {
      const multiLine = 'بیت اول\n\n\n\n\nبیت دوم   \n\nبیت سوم';
      expect(normalizeDisplay(multiLine)).toBe('بیت اول\n\nبیت دوم\n\nبیت سوم');
    });

    it('handles empty string gracefully', () => {
      expect(normalizeDisplay('')).toBe('');
    });
  });

  describe('normalizeSearch', () => {
    it('folds alef forms (آ, أ, إ, ٱ -> ا)', () => {
      expect(normalizeSearch('آسمان أز إبتدا ٱلحمد')).toBe('اسمان از ابتدا الحمد');
    });

    it('folds yeh forms (ي, ى, ئ -> ی)', () => {
      expect(normalizeSearch('حتی علی رئیس')).toBe('حتی علی رییس');
    });

    it('folds kaf (ك -> ک) and waw hamza (ؤ -> و)', () => {
      expect(normalizeSearch('كتاب مؤلف')).toBe('کتاب مولف');
    });

    it('folds heh forms (ة, ۀ, هٔ -> ه)', () => {
      expect(normalizeSearch('خانۀ نامهٔ سفینة')).toBe('خانه نامه سفینه');
    });

    it('strips all diacritics and harakat completely', () => {
      expect(normalizeSearch('پیرِ ما با شمعِ مُرده')).toBe('پیر ما با شمع مرده');
    });

    it('converts Persian and Arabic digits to ASCII in search strings', () => {
      expect(normalizeSearch('غزل ۱۲۳ بیت ٤٥')).toBe('غزل 123 بیت 45');
    });

    it('strips ZWNJ by default for high-recall index matching', () => {
      expect(normalizeSearch('می‌رود خانه‌ها')).toBe('میرود خانهها');
    });

    it('preserves ZWNJ when preserveZwnj option is true', () => {
      expect(normalizeSearch('می‌رود خانه‌ها', { preserveZwnj: true })).toBe('می‌رود خانه‌ها');
    });

    it('handles empty string gracefully', () => {
      expect(normalizeSearch('')).toBe('');
    });
  });
});
