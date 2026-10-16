import { describe, it, expect } from 'bun:test';
import { cleanLine, assertPersianTypography } from '../src';

describe('packages/persian: Cleaner Module', () => {
  it('strips invisible bidi and control characters', () => {
    const dirty = '\u200eسلام\u200f دنیا\ufeff\u200b';
    expect(cleanLine(dirty)).toBe('سلام دنیا');
  });

  it('strips Tatweel (Kashida) U+0640', () => {
    const withTatweel = 'ســـــلام دوســــت';
    expect(cleanLine(withTatweel)).toBe('سلام دوست');
  });

  it('collapses multiple spaces, tabs, and non-breaking spaces', () => {
    const multiSpace = 'دوش   از   مسجد \t سوی\u00a0میخانه';
    expect(cleanLine(multiSpace)).toBe('دوش از مسجد سوی میخانه');
  });

  it('enforces zero spaces before Persian and standard punctuation', () => {
    const beforePunct = 'دیروز ، سنگر ؛ چرا ؟ آری ! پایان . منزل : بود ) تمام »';
    expect(cleanLine(beforePunct)).toBe('دیروز، سنگر؛ چرا؟ آری! پایان. منزل: بود) تمام»');
  });

  it('enforces single space after punctuation when followed by words', () => {
    const afterPunct = 'همواره،در افق؛آری!تصویر:تو';
    expect(cleanLine(afterPunct)).toBe('همواره، در افق؛ آری! تصویر: تو');
  });

  it('removes spaces inside opening brackets and quotes', () => {
    const brackets = '( پرتو ) « خورشید »';
    expect(cleanLine(brackets)).toBe('(پرتو) «خورشید»');
  });

  it('trims leading/trailing whitespace and edge ZWNJs', () => {
    const edgeZwnj = '\u200c  متن شعر  \u200c';
    expect(cleanLine(edgeZwnj)).toBe('متن شعر');
  });

  it('handles empty or falsy strings gracefully', () => {
    expect(cleanLine('')).toBe('');
  });

  it('validates assertPersianTypography throws on violations and passes on valid text', () => {
    expect(() => assertPersianTypography('سلام ، دوست')).toThrow();
    expect(() => assertPersianTypography('سلامـ دوست')).toThrow();
    expect(() => assertPersianTypography('سلام\u200e دوست')).toThrow();
    expect(() => assertPersianTypography('سلام\u200f دوست')).toThrow();
    expect(() => assertPersianTypography('سلام، دوست عزیز')).not.toThrow();
  });

  it('preserves letter-fingerprint immutability (Rule R4)', () => {
    const original = 'دوش  از  مسجد،  سوی  می‌خانه  آمد  پیرِ  ما / ای  خدا!';
    const cleaned = cleanLine(original);
    const fingerprint = (s: string) => s.replace(/[\s\u200c\u200e\u200f*\/]+/g, '');
    expect(fingerprint(cleaned)).toBe(fingerprint(original));
  });
});
