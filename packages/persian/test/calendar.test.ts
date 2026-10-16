import { describe, it, expect } from 'bun:test';
import {
  jalaliToGregorian,
  gregorianToJalali,
  isJalaliLeapYear,
  isGregorianLeapYear,
  daysInJalaliMonth,
  parseJalaliDate,
} from '../src';

describe('packages/persian: Calendar Module', () => {
  it('correctly converts Acceptance Fixture A1 colophon date: 1364/2/12 -> 1985-05-02', () => {
    const g = jalaliToGregorian(1364, 2, 12);
    expect(g.year).toBe(1985);
    expect(g.month).toBe(5);
    expect(g.day).toBe(2);
    expect(g.iso).toBe('1985-05-02');

    const j = gregorianToJalali(1985, 5, 2);
    expect(j.year).toBe(1364);
    expect(j.month).toBe(2);
    expect(j.day).toBe(12);
  });

  it('correctly determines Jalali leap years', () => {
    expect(isJalaliLeapYear(1395)).toBe(true);
    expect(isJalaliLeapYear(1399)).toBe(true);
    expect(isJalaliLeapYear(1403)).toBe(true);
    expect(isJalaliLeapYear(1404)).toBe(false);
  });

  it('correctly determines Gregorian leap years', () => {
    expect(isGregorianLeapYear(2020)).toBe(true);
    expect(isGregorianLeapYear(2024)).toBe(true);
    expect(isGregorianLeapYear(2023)).toBe(false);
    expect(isGregorianLeapYear(2000)).toBe(true);
    expect(isGregorianLeapYear(1900)).toBe(false);
  });

  it('returns exact days in Jalali months for standard and leap years', () => {
    expect(daysInJalaliMonth(1402, 1)).toBe(31);
    expect(daysInJalaliMonth(1402, 6)).toBe(31);
    expect(daysInJalaliMonth(1402, 7)).toBe(30);
    expect(daysInJalaliMonth(1402, 11)).toBe(30);
    // Non-leap Esfand
    expect(daysInJalaliMonth(1402, 12)).toBe(29);
    // Leap Esfand (1403 is leap)
    expect(daysInJalaliMonth(1403, 12)).toBe(30);

    expect(() => daysInJalaliMonth(1403, 0)).toThrow();
    expect(() => daysInJalaliMonth(1403, 13)).toThrow();
  });

  it('parses Jalali date strings in various formats', () => {
    expect(parseJalaliDate('1364/02/12')).toEqual({ year: 1364, month: 2, day: 12 });
    expect(parseJalaliDate('1364-2-12')).toEqual({ year: 1364, month: 2, day: 12 });
    expect(parseJalaliDate('تنکابن، 1364/2/12')).toEqual({ year: 1364, month: 2, day: 12 });
    expect(parseJalaliDate('invalid date')).toBeNull();
    expect(parseJalaliDate('')).toBeNull();
  });

  it('throws RangeError for invalid dates or out-of-range years', () => {
    expect(() => jalaliToGregorian(1402, 12, 31)).toThrow();
    expect(() => jalaliToGregorian(1402, 13, 1)).toThrow();
    expect(() => gregorianToJalali(2024, 2, 35)).toThrow();
    expect(() => gregorianToJalali(2024, 0, 1)).toThrow();
    expect(() => jalaliToGregorian(4000, 1, 1)).toThrow();
  });
});
