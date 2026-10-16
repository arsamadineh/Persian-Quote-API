import { describe, it, expect } from 'bun:test';
import { levenshteinDistance, fuzzyMatch } from '../src';

describe('packages/persian: Fuzzy Module', () => {
  it('computes Levenshtein distance accurately for Persian strings', () => {
    expect(levenshteinDistance('حافظ', 'حافظ')).toBe(0);
    expect(levenshteinDistance('حافظ', 'حافط')).toBe(1); // single substitution
    expect(levenshteinDistance('سعدی', 'سعد')).toBe(1);  // single deletion
    expect(levenshteinDistance('مولانا', 'مولوی')).toBe(3); // substitution of 2 + deletion of 1
    expect(levenshteinDistance('شعر', 'شعرها')).toBe(2);
    expect(levenshteinDistance('', 'خیام')).toBe(4);
    expect(levenshteinDistance('خیام', '')).toBe(4);
  });

  it('prunes early when maxDistance threshold is exceeded', () => {
    const dist = levenshteinDistance('حافظ', 'فردوسی طوسی بزرگ', { maxDistance: 2 });
    expect(dist).toBeGreaterThan(2);
  });

  it('computes normalized fuzzy match scores', () => {
    expect(fuzzyMatch('حافظ', 'حافظ')).toBe(1.0);
    expect(fuzzyMatch('', '')).toBe(1.0);
    expect(fuzzyMatch('حافظ', '')).toBe(0.0);
    expect(fuzzyMatch('حافظ', 'حافط')).toBe(0.75);
    expect(fuzzyMatch('الفبای فارسی', 'کاملا متفاوت')).toBeLessThan(0.3);
  });
});
