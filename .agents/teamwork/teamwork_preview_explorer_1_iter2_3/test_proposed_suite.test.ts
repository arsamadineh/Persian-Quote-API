import { describe, it, expect } from 'bun:test';
import { cleanLine, assertPersianTypography, letterFingerprint } from './proposed_cleaner';
import { lightStem, PROTECTED_ROOTS } from './proposed_stemmer';

describe('Proposed Stemmer Fixes & Protection', () => {
  it('protects Persian root words ending in "ان" from over-stemming', () => {
    expect(lightStem('ایران')).toBe('ایران');
    expect(lightStem('باران')).toBe('باران');
    expect(lightStem('آسمان')).toBe('آسمان');
    expect(lightStem('جهان')).toBe('جهان');
    expect(lightStem('زمان')).toBe('زمان');
    expect(lightStem('روان')).toBe('روان');
    expect(lightStem('توان')).toBe('توان');
    expect(lightStem('طوفان')).toBe('طوفان');
    expect(lightStem('زندان')).toBe('زندان');
    expect(lightStem('میدان')).toBe('میدان');
    expect(lightStem('پایان')).toBe('پایان');
    expect(lightStem('دیوان')).toBe('دیوان');
  });

  it('protects Persian root words ending in "ام" from over-stemming', () => {
    expect(lightStem('سلام')).toBe('سلام');
    expect(lightStem('کلام')).toBe('کلام');
    expect(lightStem('پیام')).toBe('پیام');
    expect(lightStem('خیام')).toBe('خیام');
    expect(lightStem('تمام')).toBe('تمام');
    expect(lightStem('مقام')).toBe('مقام');
    expect(lightStem('حرام')).toBe('حرام');
    expect(lightStem('آرام')).toBe('آرام');
    expect(lightStem('امام')).toBe('امام');
    expect(lightStem('انتقام')).toBe('انتقام');
  });

  it('protects words ending in "ستان" from suffix mangling', () => {
    expect(lightStem('داستان')).toBe('داستان');
    expect(lightStem('گلستان')).toBe('گلستان');
    expect(lightStem('بوستان')).toBe('بوستان');
    expect(lightStem('زمستان')).toBe('زمستان');
    expect(lightStem('تابستان')).toBe('تابستان');
    expect(lightStem('باستان')).toBe('باستان');
  });

  it('protects Persian nouns ending in "تر", "ها", "اش", and "ات"', () => {
    expect(lightStem('دختر')).toBe('دختر');
    expect(lightStem('دفتر')).toBe('دفتر');
    expect(lightStem('کبوتر')).toBe('کبوتر');
    expect(lightStem('خاکستر')).toBe('خاکستر');
    expect(lightStem('تنها')).toBe('تنها');
    expect(lightStem('پاداش')).toBe('پاداش');
    expect(lightStem('حیات')).toBe('حیات');
    expect(lightStem('نجات')).toBe('نجات');
  });

  it('preserves genuine plural and possessive stemming across suffixes', () => {
    expect(lightStem('درختان')).toBe('درخت');
    expect(lightStem('دوستان')).toBe('دوست');
    expect(lightStem('دستان')).toBe('دست');
    expect(lightStem('مستان')).toBe('مست');
    expect(lightStem('انگشتان')).toBe('انگشت');
    expect(lightStem('مردان')).toBe('مرد');
    expect(lightStem('زنان')).toBe('زن');
    expect(lightStem('شاعران')).toBe('شاعر');
    expect(lightStem('کلمات')).toBe('کلم');
    expect(lightStem('لحظات')).toBe('لحظ');
    expect(lightStem('کتاب‌هایم')).toBe('کتاب');
    expect(lightStem('کتاب‌ام')).toBe('کتاب');
    expect(lightStem('دستشان')).toBe('دست');
    expect(lightStem('دست‌مان')).toBe('دست');
    expect(lightStem('دستمان')).toBe('دست');
    expect(lightStem('خانه‌مان')).toBe('خانه');
    expect(lightStem('کتابتان')).toBe('کتاب');
    expect(lightStem('بهتر')).toBe('به');
    expect(lightStem('زیباترین')).toBe('زیبا');
    expect(lightStem('بزرگ‌تر')).toBe('بزرگ');
  });

  it('preserves verbal prefix stripping', () => {
    expect(lightStem('می‌رود')).toBe('رود');
    expect(lightStem('نمی‌خواهم')).toBe('خواهم');
    expect(lightStem('همی‌گفت')).toBe('گفت');
    expect(lightStem('بی‌دل')).toBe('دل');
  });

  it('maintains idempotency on arbitrary stemmed words', () => {
    const samples = ['سلام', 'ایران', 'باران', 'درختان', 'کتاب‌هایمان', 'زیباترین'];
    for (const w of samples) {
      expect(lightStem(lightStem(w))).toBe(lightStem(w));
    }
  });
});

describe('Proposed Cleaner & letterFingerprint', () => {
  it('letterFingerprint handles empty or falsy strings', () => {
    expect(letterFingerprint('')).toBe('');
  });

  it('letterFingerprint strips spaces, tabs, and ZWNJs', () => {
    expect(letterFingerprint('سلام\u200cها')).toBe('سلامها');
    expect(letterFingerprint('  متن \t با   فاصله  ')).toBe('متنبافاصله');
  });

  it('letterFingerprint strips Tatweel (U+0640) and directional marks', () => {
    expect(letterFingerprint('ســـــلام')).toBe('سلام');
    expect(letterFingerprint('\u200eسلام\u200f')).toBe('سلام');
  });

  it('letterFingerprint strips invisible bidi controls and zero-width spaces', () => {
    expect(letterFingerprint('\u200bسلام\ufeff\u202aدنیا\u202c')).toBe('سلامدنیا');
  });

  it('letterFingerprint strips structural delimiters (*, /)', () => {
    expect(letterFingerprint('بند اول / بند دوم * بند سوم')).toBe('بنداولبنددومبندسوم');
  });

  it('preserves letter-fingerprint immutability across cleanLine (Rule R4)', () => {
    const raw = '\u200eدوش  از  ســـــنگر،  سوی  می‌خانه  آمد  پیرِ  ما / ای  خدا! *';
    const cleaned = cleanLine(raw);
    expect(letterFingerprint(cleaned)).toBe(letterFingerprint(raw));
  });

  it('detects letter alterations', () => {
    expect(letterFingerprint('سلام')).not.toBe(letterFingerprint('سل'));
    expect(letterFingerprint('سلام')).not.toBe(letterFingerprint('کلام'));
  });
});
