import { describe, it, expect } from 'bun:test';
import * as fc from 'fast-check';
import {
  normalizeDisplay,
  normalizeSearch,
  cleanLine,
  toAsciiDigits,
  toPersianDigits,
  toArabicDigits,
  tokenize,
  lightStem,
  jalaliToGregorian,
  gregorianToJalali,
  daysInJalaliMonth,
  bidiIsolate,
  detectDirection,
  stripBidiControls,
  finglishQuery,
  levenshteinDistance,
  fuzzyMatch,
} from '../src';

describe('packages/persian: Fast-Check Property-Based Invariants (F055)', () => {
  it('Property 1: Idempotency of normalizeDisplay', () => {
    fc.assert(
      fc.property(fc.fullUnicodeString(), (s) => {
        const first = normalizeDisplay(s);
        const second = normalizeDisplay(first);
        return first === second;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 2: Idempotency of normalizeSearch', () => {
    fc.assert(
      fc.property(fc.fullUnicodeString(), (s) => {
        const first = normalizeSearch(s);
        const second = normalizeSearch(first);
        return first === second;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 3: Idempotency of cleanLine', () => {
    fc.assert(
      fc.property(fc.fullUnicodeString(), (s) => {
        const first = cleanLine(s);
        const second = cleanLine(first);
        return first === second;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 4: Idempotency of toAsciiDigits and toPersianDigits', () => {
    fc.assert(
      fc.property(fc.fullUnicodeString(), (s) => {
        const a1 = toAsciiDigits(s);
        const a2 = toAsciiDigits(a1);
        const p1 = toPersianDigits(s);
        const p2 = toPersianDigits(p1);
        return a1 === a2 && p1 === p2;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 5: Idempotency of lightStem', () => {
    fc.assert(
      fc.property(fc.string(), (w) => {
        const s1 = lightStem(w);
        const s2 = lightStem(s1);
        return s1 === s2;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 6: Bidirectional Calendar Reversibility', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1200, max: 1500 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 28 }),
        (y, m, d) => {
          const maxDays = daysInJalaliMonth(y, m);
          const validDay = Math.min(d, maxDays);
          const g = jalaliToGregorian(y, m, validDay);
          const j = gregorianToJalali(g.year, g.month, g.day);
          return j.year === y && j.month === m && j.day === validDay;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 7: Digit Invertibility for non-negative integers', () => {
    fc.assert(
      fc.property(fc.nat(), (n) => {
        const str = String(n);
        const persian = toPersianDigits(str);
        const backToAscii = toAsciiDigits(persian);
        return backToAscii === str;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 8: Crash Resistance across arbitrary Unicode strings', () => {
    fc.assert(
      fc.property(fc.fullUnicodeString(), (s) => {
        normalizeDisplay(s);
        normalizeSearch(s);
        cleanLine(s);
        toAsciiDigits(s);
        toPersianDigits(s);
        toArabicDigits(s);
        tokenize(s);
        lightStem(s);
        detectDirection(s);
        bidiIsolate(s);
        stripBidiControls(s);
        finglishQuery(s);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('Property 9: Levenshtein Metric Space Invariants', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), fc.string(), (a, b, c) => {
        // Identity of indiscernibles
        const dAA = levenshteinDistance(a, a);
        if (dAA !== 0) return false;

        // Symmetry
        const dAB = levenshteinDistance(a, b);
        const dBA = levenshteinDistance(b, a);
        if (dAB !== dBA) return false;

        // Triangle inequality
        const dBC = levenshteinDistance(b, c);
        const dAC = levenshteinDistance(a, c);
        return dAC <= dAB + dBC;
      }),
      { numRuns: 50 }
    );
  });

  it('Property 10: CleanLine Punctuation Spacing Invariant', () => {
    fc.assert(
      fc.property(fc.fullUnicodeString(), (s) => {
        const cleaned = cleanLine(s);
        return !/\s+[،؛؟!.:)»]/.test(cleaned);
      }),
      { numRuns: 100 }
    );
  });
});
