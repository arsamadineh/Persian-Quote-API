# Handoff Report: parseJalaliDate Little-Endian & Persian Digits Support

**Explorer**: `explorer_1_iter2_2`  
**Date**: 2026-10-16  
**Target Files**: `packages/persian/src/calendar.ts`, `packages/persian/test/calendar.test.ts`  
**Status**: COMPLETE (Investigation & Proposed Solution Formulated)

---

## 1. Observation

### 1.1 Existing Implementation of `parseJalaliDate`
In `packages/persian/src/calendar.ts`, lines 153–162:
```typescript
export function parseJalaliDate(s: string): JalaliDate | null {
  if (!s) return null;
  const m = s.match(/(?:^|\D)(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:\D|$)/);
  if (!m || !m[1] || !m[2] || !m[3]) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}
```

### 1.2 Verification of Failures via CLI
Execution command:
```bash
bun -e 'import { parseJalaliDate } from "./packages/persian/src/calendar";
console.log("12/2/1364:", parseJalaliDate("12/2/1364"));
console.log("۱۳۶۴/۰۲/۱۲:", parseJalaliDate("۱۳۶۴/۰۲/۱۲"));
console.log("۱۲/۲/۱۳۶۴:", parseJalaliDate("۱۲/۲/۱۳۶۴"));
console.log("تنکابن، 12/2/1364:", parseJalaliDate("تنکابن، 12/2/1364"));'
```
Output:
```
12/2/1364: null
۱۳۶۴/۰۲/۱۲: null
۱۲/۲/۱۳۶۴: null
تنکابن، 12/2/1364: null
```

### 1.3 Test Suite Masking in `calendar.test.ts`
In `packages/persian/test/calendar.test.ts`, line 57:
```typescript
expect(parseJalaliDate('تنکابن، 1364/2/12')).toEqual({ year: 1364, month: 2, day: 12 });
```
In `ORIGINAL_REQUEST.md` Appendix A (Fixture A1) and Defect D1, the authoritative colophon date is:
```
date_raw: "12/2/1364" (تنکابن، 12/2/1364)
```
The test in `calendar.test.ts` reordered the fixture tokens from Little-Endian `12/2/1364` to Big-Endian `1364/2/12` because `parseJalaliDate` failed on the original fixture format.

### 1.4 Missing Year Range Validation
In `packages/persian/src/calendar.ts`, `jalaliCal` lines 25–38:
```typescript
const breaks = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192,
  2262, 2324, 2394, 2456, 3178,
];
const bl = breaks.length;
const gy = jy + 621;
let leapJ = -14;
let jp = breaks[0]!;
let jm: number;
let jump = 0;

if (jy < jp || jy >= breaks[bl - 1]!) {
  throw new RangeError(`Invalid Jalali year: ${jy}`);
}
```
Currently, `parseJalaliDate` validates only `month < 1 || month > 12 || day < 1 || day > 31`. Year is not checked at all.
Execution command:
```bash
bun -e 'import { parseJalaliDate, jalaliToGregorian } from "./packages/persian/src/calendar";
const d = parseJalaliDate("4000/1/1");
console.log("Parsed:", d);
jalaliToGregorian(d.year, d.month, d.day);'
```
Output:
```
Parsed: { year: 4000, month: 1, day: 1 }
RangeError: Invalid Jalali year: 4000
```
`parseJalaliDate` returns an invalid object that immediately crashes downstream calendar calculations.

---

## 2. Logic Chain

1. **Failure on Persian Numerals (Observation 1.1 & 1.2)**:
   - JavaScript `\d` inside standard RegExp matches only ASCII digits `[0-9]`.
   - Characters like `'۱'` (`U+06F1`) or `'١'` (`U+0661`) fail the `\d` match.
   - Even if regex matched them, `Number("۱۳۶۴")` evaluates to `NaN` in JavaScript.
   - `packages/persian/src/digits.ts` already exports `toAsciiDigits(s: string): string`, converting both Persian (`۰۱۲۳۴۵۶۷۸۹`) and Arabic-Indic (`٠١٢٣٤٥٦٧٨٩`) numerals into ASCII digits `0-9`.
   - Calling `toAsciiDigits(s)` as the very first step in `parseJalaliDate` normalizes all numerals transparently with zero runtime overhead.

2. **Failure on Little-Endian `DD/MM/YYYY` (Observations 1.1, 1.2, 1.3)**:
   - Persian poetry colophons historically and conventionally use Little-Endian date notation (e.g., `"۱۲/۲/۱۳۶۴"` meaning 12 Ordibehesht 1364).
   - In `parseJalaliDate`, the regex `/(?:^|\D)(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:\D|$)/` requires the 4-digit number to appear first.
   - When `"12/2/1364"` is passed, `12` has 2 digits, so `\d{4}` does not match. The function returns `null`.
   - A unified regex supporting both Big-Endian and Little-Endian with non-capturing boundary delimiters resolves this:
     ```typescript
     /(?:^|\D)(?:(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})|(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4}))(?:\D|$)/
     ```
     - If Branch 1 matches: Group 1 = Year, Group 2 = Month, Group 3 = Day.
     - If Branch 2 matches: Group 4 = Day, Group 5 = Month, Group 6 = Year.

3. **Year Range and Date Validity Enforcement (Observation 1.4)**:
   - The astronomical Birashk cycle in `jalaliCal` is defined strictly on the interval `[-61, 3178)`.
   - Any year `year < -61 || year >= 3178` causes `jalaliCal` to throw a `RangeError`.
   - Bounding `parseJalaliDate` with `if (year < -61 || year >= 3178 || month < 1 || month > 12 || day < 1 || day > 31) return null;` guarantees that every `JalaliDate` returned is mathematically valid and safe for downstream consumers.

4. **Strict TypeScript Typing with `noUncheckedIndexedAccess`**:
   - Checking `m[1] !== undefined && m[2] !== undefined && m[3] !== undefined` narrows types cleanly without needing unsafe non-null assertions (`!`).

---

## 3. Caveats

1. **Syntactic Day Validation vs Calendar Day Validation**:
   - The specification requires validating "year range (-61 to 3178), month range (1 to 12), and day range (1 to 31)".
   - Syntactic range `day >= 1 && day <= 31` permits dates like `1364/12/31` at the parser level, while `jalaliToGregorian` enforces the exact month length via `daysInJalaliMonth(jy, jm)`.
   - If strict semantic day validation is desired, `day > daysInJalaliMonth(year, month)` can optionally be checked. We recommend keeping `day < 1 || day > 31` to strictly adhere to the prompt specification and allow historical colophons with month-end approximations to parse structurally.
2. **Upper Year Bound (3177 vs 3178)**:
   - `breaks[bl - 1]` in `jalaliCal` is `3178`. In `calendar.ts:36`: `if (jy < jp || jy >= breaks[bl - 1]!) throw RangeError`.
   - Thus, year 3177 is the highest supported year (`jalaliToGregorian(3177, 1, 1)` succeeds); year 3178 throws.
   - The check `year < -61 || year >= 3178` correctly enforces `[-61, 3178)`.

---

## 4. Conclusion

The exact code modification and test additions are ready for application by the worker.

### 4.1 Recommended Implementation: `packages/persian/src/calendar.ts`

#### Step 1: Add Import at Line 1
```typescript
import { toAsciiDigits } from './digits';
```

#### Step 2: Replace `parseJalaliDate` (Lines 153–162)
```typescript
const JALALI_DATE_REGEX =
  /(?:^|\D)(?:(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})|(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4}))(?:\D|$)/;

export function parseJalaliDate(s: string): JalaliDate | null {
  if (!s) return null;
  const normalized = toAsciiDigits(s);
  const m = normalized.match(JALALI_DATE_REGEX);
  if (!m) return null;

  let year: number;
  let month: number;
  let day: number;

  if (m[1] !== undefined && m[2] !== undefined && m[3] !== undefined) {
    // Big-Endian format: YYYY/MM/DD or YYYY-MM-DD
    year = Number(m[1]);
    month = Number(m[2]);
    day = Number(m[3]);
  } else if (m[4] !== undefined && m[5] !== undefined && m[6] !== undefined) {
    // Little-Endian format: DD/MM/YYYY or DD-MM-YYYY
    day = Number(m[4]);
    month = Number(m[5]);
    year = Number(m[6]);
  } else {
    return null;
  }

  if (year < -61 || year >= 3178 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return { year, month, day };
}
```

### 4.2 Recommended Test Additions: `packages/persian/test/calendar.test.ts`

Replace the existing test block at lines 54–60 with:

```typescript
  it('parses Jalali date strings in Big-Endian and Little-Endian formats with Persian/Arabic digits', () => {
    // Standard Big-Endian (YYYY/MM/DD and YYYY-MM-DD)
    expect(parseJalaliDate('1364/02/12')).toEqual({ year: 1364, month: 2, day: 12 });
    expect(parseJalaliDate('1364-2-12')).toEqual({ year: 1364, month: 2, day: 12 });
    expect(parseJalaliDate('تنکابن، 1364/2/12')).toEqual({ year: 1364, month: 2, day: 12 });

    // Little-Endian (DD/MM/YYYY and DD-MM-YYYY) - Acceptance Fixture A1
    expect(parseJalaliDate('12/2/1364')).toEqual({ year: 1364, month: 2, day: 12 });
    expect(parseJalaliDate('12-2-1364')).toEqual({ year: 1364, month: 2, day: 12 });
    expect(parseJalaliDate('تنکابن، 12/2/1364')).toEqual({ year: 1364, month: 2, day: 12 });

    // Persian Digits (Big-Endian and Little-Endian)
    expect(parseJalaliDate('۱۳۶۴/۰۲/۱۲')).toEqual({ year: 1364, month: 2, day: 12 });
    expect(parseJalaliDate('۱۳۶۴/۲/۱۲')).toEqual({ year: 1364, month: 2, day: 12 });
    expect(parseJalaliDate('۱۲/۲/۱۳۶۴')).toEqual({ year: 1364, month: 2, day: 12 });
    expect(parseJalaliDate('تنکابن، ۱۲/۲/۱۳۶۴')).toEqual({ year: 1364, month: 2, day: 12 });

    // Arabic Digits
    expect(parseJalaliDate('١٣٦٤/٠٢/١٢')).toEqual({ year: 1364, month: 2, day: 12 });
    expect(parseJalaliDate('١٢/٢/١٣٦٤')).toEqual({ year: 1364, month: 2, day: 12 });

    // In-context dates with punctuation and boundaries
    expect(parseJalaliDate('تنکابن، 12/2/1364.')).toEqual({ year: 1364, month: 2, day: 12 });
    expect(parseJalaliDate('(12/2/1364)')).toEqual({ year: 1364, month: 2, day: 12 });
  });

  it('rejects invalid Jalali date strings, out-of-range years, months, and days', () => {
    // Non-dates and empty strings
    expect(parseJalaliDate('invalid date')).toBeNull();
    expect(parseJalaliDate('')).toBeNull();
    expect(parseJalaliDate('   ')).toBeNull();

    // Out-of-range years (-61 to 3177 valid, 3178+ invalid)
    expect(parseJalaliDate('4000/1/1')).toBeNull();
    expect(parseJalaliDate('1/1/4000')).toBeNull();
    expect(parseJalaliDate('3178/1/1')).toBeNull();
    expect(parseJalaliDate('1/1/3178')).toBeNull();

    // Valid boundary years
    expect(parseJalaliDate('3177/12/29')).toEqual({ year: 3177, month: 12, day: 29 });
    expect(parseJalaliDate('0000/1/1')).toEqual({ year: 0, month: 1, day: 1 });

    // Out-of-range months (1 to 12 valid)
    expect(parseJalaliDate('1364/0/12')).toBeNull();
    expect(parseJalaliDate('1364/13/12')).toBeNull();
    expect(parseJalaliDate('12/0/1364')).toBeNull();
    expect(parseJalaliDate('12/13/1364')).toBeNull();

    // Out-of-range days (1 to 31 valid)
    expect(parseJalaliDate('1364/2/0')).toBeNull();
    expect(parseJalaliDate('1364/2/32')).toBeNull();
    expect(parseJalaliDate('0/2/1364')).toBeNull();
    expect(parseJalaliDate('32/2/1364')).toBeNull();

    // Malformed segment lengths
    expect(parseJalaliDate('12345/02/12')).toBeNull();
    expect(parseJalaliDate('12/02/12345')).toBeNull();
    expect(parseJalaliDate('12/1364/02')).toBeNull();
  });

  it('integrates parsed colophon date with jalaliToGregorian conversion for Acceptance Fixture A1', () => {
    const parsed = parseJalaliDate('تنکابن، 12/2/1364');
    expect(parsed).toEqual({ year: 1364, month: 2, day: 12 });
    const greg = jalaliToGregorian(parsed!.year, parsed!.month, parsed!.day);
    expect(greg.year).toBe(1985);
    expect(greg.month).toBe(5);
    expect(greg.day).toBe(2);
    expect(greg.iso).toBe('1985-05-02');
  });
```

---

## 5. Verification Method

### 5.1 Verification Commands
Once applied by the worker:
1. **Run Calendar Module Tests**:
   ```bash
   bun test packages/persian/test/calendar.test.ts
   ```
   *Expected Result*: All calendar tests pass with 0 failures.

2. **Verify Acceptance Fixture A1 Colophon Parsing**:
   ```bash
   bun -e 'import { parseJalaliDate, jalaliToGregorian } from "./packages/persian/src";
   const p = parseJalaliDate("تنکابن، 12/2/1364");
   console.log("Parsed:", p);
   const g = jalaliToGregorian(p.year, p.month, p.day);
   console.log("Gregorian:", g.iso);'
   ```
   *Expected Output*:
   ```
   Parsed: { year: 1364, month: 2, day: 12 }
   Gregorian: 1985-05-02
   ```

3. **Verify Persian & Arabic Numerals**:
   ```bash
   bun -e 'import { parseJalaliDate } from "./packages/persian/src";
   console.log("Persian:", parseJalaliDate("تنکابن، ۱۲/۲/۱۳۶۴"));
   console.log("Arabic:", parseJalaliDate("تنکابن، ١٢/٢/١٣٦٤"));'
   ```
   *Expected Output*:
   ```
   Persian: { year: 1364, month: 2, day: 12 }
   Arabic: { year: 1364, month: 2, day: 12 }
   ```

4. **Run Full Test Suite & Coverage**:
   ```bash
   bun test packages/persian/test/
   bun test --coverage packages/persian/test/
   ```
   *Expected Result*: All tests pass, calendar.ts achieves >= 99% coverage.

5. **Typecheck**:
   ```bash
   bun x tsc --noEmit
   ```
   *Expected Result*: Exits 0 with zero type errors.

### 5.2 Invalidation Conditions
- `parseJalaliDate("12/2/1364")` returns `null`.
- `parseJalaliDate("۱۳۶۴/۰۲/۱۲")` returns `null`.
- `parseJalaliDate("4000/1/1")` returns non-null.
- `bun test packages/persian/test/calendar.test.ts` fails.
