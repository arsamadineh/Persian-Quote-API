# Empirical Challenge Report: packages/persian and packages/schema

**Verdict**: **REJECT** (Blocking defects discovered in `packages/persian`)

---

## 1. Observation

1. **Fast-Check Property Test Failure (`property.test.ts`)**:
   - Command: `bun test packages/persian/test/property.test.ts`
   - Command: `bun test --rerun-each=10 packages/persian/test/property.test.ts`
   - Result: 1 failed out of 10 tests. Verbatim error output:
     ```
     error: Property failed after 12 tests
     { seed: -1431415799, path: "11", endOnFailure: true }
     Counterexample: ["__proto__"]
     Shrunk 0 time(s)
     Got TypeError: Spread syntax requires ...iterable[Symbol.iterator] to be a function
         at finglishQuery (/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/packages/persian/src/finglish.ts:142:16)
         at <anonymous> (/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/packages/persian/test/property.test.ts:125:9)
     ✗ packages/persian: Fast-Check Property-Based Invariants (F055) > Property 8: Crash Resistance across arbitrary Unicode strings [34.49ms]
     ```
   - Monorepo full suite execution (`bun test`):
     ```
     1 tests failed:
     ✗ packages/persian: Fast-Check Property-Based Invariants (F055) > Property 8: Crash Resistance across arbitrary Unicode strings [46.40ms]
      198 pass
      1 fail
     ```

2. **Prototype Pollution / Prototype Lookup Crash in `packages/persian/src/finglish.ts`**:
   - Lines 141–143:
     ```typescript
     if (POET_DICTIONARY[normalized]) {
       return [...POET_DICTIONARY[normalized]!];
     }
     ```
   - Lines 80–86:
     ```typescript
     const lower = word.toLowerCase();
     if (POET_DICTIONARY[lower]) {
       return POET_DICTIONARY[lower]![0]!;
     }
     if (COMMON_WORDS[lower]) {
       return COMMON_WORDS[lower]!;
     }
     ```
   - Verification commands:
     - `bun -e 'import { finglishQuery } from "./packages/persian/src/finglish"; console.log(finglishQuery("__proto__"));'`
       -> `TypeError: Spread syntax requires ...iterable[Symbol.iterator] to be a function at finglishQuery (finglish.ts:142:16)` (exit code 1)
     - `bun -e 'import { finglishQuery } from "./packages/persian/src/finglish"; console.log(finglishQuery("constructor"));'`
       -> `TypeError: Spread syntax requires ...iterable[Symbol.iterator] to be a function at finglishQuery (finglish.ts:142:16)` (exit code 1)
     - `bun -e 'import { transliterateFinglish } from "./packages/persian/src/finglish"; console.log(transliterateFinglish("constructor"));'`
       -> returns `""` because `POET_DICTIONARY["constructor"]` resolves to `[Function: Object]`, accessing index `[0]` yields `undefined`.

3. **Code Coverage Report (`packages/persian`)**:
   - Command: `bun test --coverage packages/persian/test`
   - Result: 67 pass (when seeded without `__proto__`), 0 fail.
   - All files: **100.00% function coverage**, **99.13% line coverage**.
   - Line coverage by file:
     - `bidi.ts`: 100.00%
     - `calendar.ts`: 99.10% (uncovered line: 51)
     - `cleaner.ts`: 100.00%
     - `digits.ts`: 100.00%
     - `finglish.ts`: 95.35% (uncovered lines: 82, 96–98, 109, 111)
     - `fuzzy.ts`: 100.00%
     - `index.ts`: 100.00%
     - `normalizer.ts`: 100.00%
     - `stemmer.ts`: 96.88% (uncovered lines: 57, 76)
     - `tokenizer.ts`: 100.00%
   - Exceeds the >= 90% coverage requirement.

4. **Acceptance Fixture A1 Date Incompatibility in `packages/persian/src/calendar.ts`**:
   - `ORIGINAL_REQUEST.md` Appendix A (A1) defines date: `date_raw: "12/2/1364"` (Little-Endian: Day=12, Month=2, Year=1364).
   - `packages/persian/src/calendar.ts` lines 155–156:
     ```typescript
     const m = s.match(/(?:^|\D)(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:\D|$)/);
     ```
   - Verification command:
     - `bun -e 'import { parseJalaliDate } from "./packages/persian/src/calendar"; console.log(parseJalaliDate("12/2/1364"));'`
       -> returns `null`
     - `bun -e 'import { parseJalaliDate } from "./packages/persian/src/calendar"; console.log(parseJalaliDate("۱۳۶۴/۰۲/۱۲"));'`
       -> returns `null` (Regex `\d` without Persian digit conversion fails to match).
   - In `calendar.test.ts` line 57, the test reordered the fixture to `'تنکابن، 1364/2/12'` instead of matching the original fixture date format.

5. **Linguistic Over-Stemming in `packages/persian/src/stemmer.ts`**:
   - `packages/persian/src/stemmer.ts` lines 27–33:
     Suffix patterns `/^(.*?)(?:‌مان|مان)$/`, `/^(.*?)(?:‌ان|an)$/`, `/^(.*?)(?:‌ام|ام)$/` without boundary checks match root-final letters.
   - Verification command:
     - `bun -e 'import { lightStem } from "./packages/persian/src/stemmer"; console.log(["سلام", "ایران", "باران", "آسمان", "جهان"].map(w => [w, lightStem(w)]));'`
     - Output:
       - `"سلام"` -> `"سل"`
       - `"ایران"` -> `"ایر"`
       - `"باران"` -> `"بار"`
       - `"آسمان"` -> `"آس"`
       - `"جهان"` -> `"جه"`
       - `"زمان"` -> `"زم"`
       - `"داستان"` -> `"داست"`

6. **Rule R4 Letter-Fingerprint Immutability Challenge**:
   - Fuzz test across 10,000 synthetic Persian strings containing letters, digits, ZWNJ, punctuation, brackets, quotes, `*`, `/`:
     `letterFingerprint(cleanLine(s)) === letterFingerprint(s)` passed **10,000 / 10,000**.
   - Discrepancy on formatting/control marks:
     - `cleanLine` correctly removes Tatweel (`\u0640`, per A3), LRM (`\u200e`), RLM (`\u200f`), ZWSP (`\u200b`), and embedding marks (`\u202a-\u202e`).
     - The canonical literal definition `s.replace(/[\s\u200c*\/]+/g, '')` does not strip `\u0640` or `\u200e\u200f`, causing a false mismatch when validating cleaned lines against raw source containing tatweel.
   - `packages/persian` does not export `letterFingerprint`.

7. **Acceptance Fixtures A1 & A2 and Legacy Contracts (`packages/schema`)**:
   - Command: `bun test packages/schema/test/legacy.test.ts`
   - Result: 31 pass, 0 fail (validating all 30 golden contract snapshots).
   - `packages/schema/test/poem.test.ts`: validates Fixture A1 (Salman Harati colophon extraction) and Fixture A2 (Nader Naderpour punctuation and structure meta).
   - Schema Line coverage: **99.50%**, function coverage: **97.62%**.
   - Note on Schema refinement: `PoemSchema` allows `id` to diverge from `${poet_id}.${collection_id}.${number}` (e.g. `hafez.ghazaliat.1` with `poet_id: "saadi"` passes).

8. **Build & Strict Compilation**:
   - `bun x tsc --noEmit`: Exited code 0 (zero type errors).
   - `bun run build`: Exited code 0 (16 static and dynamic routes compiled).
   - `packages/persian/package.json`: 0 runtime dependencies (Rule R10 satisfied).

---

## 2. Logic Chain

1. **Property 8 Crash (Observations 1 & 2)**:
   - Feature F055 requires: "Fast-check property-based tests verifying idempotency, reversibility, and safety with >= 90% branch coverage."
   - In `packages/persian/src/finglish.ts`, `POET_DICTIONARY` and `COMMON_WORDS` are declared as plain JavaScript objects (`{ ... }`), inheriting from `Object.prototype`.
   - Accessing `POET_DICTIONARY[normalized]` looks up prototype properties when `normalized` is a property on `Object.prototype` (notably `"__proto__"` and `"constructor"`).
   - When queried with `"__proto__"`, `POET_DICTIONARY["__proto__"]` evaluates to `Object.prototype`, which is not an iterable.
   - Line 142 executes `[...POET_DICTIONARY[normalized]!]`, attempting to iterate `Object.prototype`, which throws an unhandled `TypeError: Spread syntax requires ...iterable[Symbol.iterator] to be a function`.
   - When fast-check's string generator produces `"__proto__"` during `Property 8: Crash Resistance across arbitrary Unicode strings`, this exception crashes the property test suite.
   - Running `bun test` fails in 1/10 to 2/10 runs whenever fast-check explores prototype property names. This breaks CI reliability and opens an unhandled 500 crash in any search/suggest endpoint accepting Finglish queries.

2. **Date Parsing Fragility (Observation 4)**:
   - Appendix A (A1) and Defect D1 specify the exact colophon string from Salman Harati as `"تنکابن، 12/2/1364"`.
   - `parseJalaliDate` in `calendar.ts` assumes the 4-digit year is prefix-anchored (`YYYY/MM/DD`), returning `null` for Little-Endian `DD/MM/YYYY` (the dominant colophon convention in Persian literature).
   - Furthermore, `\d` without Persian numeral normalization fails when given Persian digits (`۱۳۶۴/۲/۱۲`).
   - This defect causes downstream failure when parsing unnormalized colophons in Phase 2.

3. **Linguistic Stemming Over-Aggression (Observation 5)**:
   - In Persian, `-an` (`ان`), `-man` (`مان`), and `-am` (`ام`) are frequently root-final morphemes rather than plural or possessive affixes.
   - Stripping them with a minimum stem length of only 2 transforms foundational Persian poetic vocabulary into nonsense roots (`سلام -> سل`, `ایران -> ایر`, `آسمان -> آس`, `باران -> بار`, `جهان -> جه`).
   - This directly damages the recall and precision of BM25F search indexing (WS8).

4. **Specification Conformance (Observations 3, 6, 7 & 8)**:
   - Line coverage and function coverage for both packages exceed the 90% threshold.
   - All 30 legacy golden contracts are strictly validated.
   - Next.js build and TypeScript type checking pass cleanly.
   - However, the existence of a reproducible property test failure and runtime crash in `finglishQuery` violates Rule R1 ("Finish what you start - zero broken paths") and F055 ("Property-based testing safety").

---

## 3. Caveats

- Fast-check uses a pseudo-random seed on each run. In some runs where `"__proto__"` or `"constructor"` is not sampled within 100 iterations, `property.test.ts` appears to pass. Running with seed `-1431415799` or running `bun test --rerun-each=10 packages/persian/test/property.test.ts` reproduces the failure deterministically.
- `packages/schema` is structurally sound; all 30 legacy contracts pass without regression. The blocking defects are strictly isolated to `packages/persian`.

---

## 4. Conclusion

**Verdict: REJECT.**

The implementation of `packages/persian` cannot be approved due to a reproducible crash in `finglishQuery` on prototype properties that causes `Property 8: Crash Resistance` in `property.test.ts` to fail during `bun test`.

### Required Remediations for Worker:

1. **Fix Prototype Lookup Bug in `packages/persian/src/finglish.ts`**:
   - Change dictionary lookups to check own properties:
     ```typescript
     if (Object.prototype.hasOwnProperty.call(POET_DICTIONARY, normalized)) {
       return [...POET_DICTIONARY[normalized]!];
     }
     ```
     or initialize `POET_DICTIONARY` and `COMMON_WORDS` with `Object.create(null)` or a `Map<string, string[]>`.
   - Apply the same fix to `POET_DICTIONARY[lower]` and `COMMON_WORDS[lower]` in `transliterateWord`.
   - Verify `finglishQuery("__proto__")` and `finglishQuery("constructor")` return without throwing.

2. **Fix `parseJalaliDate` in `packages/persian/src/calendar.ts`**:
   - Normalize digits to ASCII first (`toAsciiDigits(s)`).
   - Support both `YYYY/MM/DD` and `DD/MM/YYYY` formats (e.g. `/(?:^|\D)(?:(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})|(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4}))(?:\D|$)/`).

3. **Improve Stemmer Conservatism in `packages/persian/src/stemmer.ts`**:
   - Protect words ending in `-an` / `-man` / `-am` unless preceded by ZWNJ or minimum stem length >= 3, or expand stopword protections for core nouns (`سلام`, `ایران`, `باران`, `آسمان`, `جهان`, `داستان`).

4. **Export Canonical `letterFingerprint` from `packages/persian`**:
   - Export `letterFingerprint(s: string): string` stripping whitespace, ZWNJ, Tatweel (`\u0640`), directional marks (`\u200e\u200f`), and delimiters (`*`, `/`).

---

## 5. Verification Method

To independently reproduce the failures and verify the verdict:

1. **Reproduce Property 8 Failure**:
   ```bash
   bun test --rerun-each=10 packages/persian/test/property.test.ts
   ```
   *Observed result*: Exits with code 1, reporting `Counterexample: ["__proto__"]` and `TypeError: Spread syntax requires ...iterable[Symbol.iterator] to be a function`.

2. **Reproduce Direct Runtime Crash**:
   ```bash
   bun -e 'import { finglishQuery } from "./packages/persian/src/finglish"; console.log(finglishQuery("__proto__"));'
   bun -e 'import { finglishQuery } from "./packages/persian/src/finglish"; console.log(finglishQuery("constructor"));'
   ```
   *Observed result*: Both commands exit with code 1 and unhandled `TypeError`.

3. **Reproduce Date Parsing Failure on Fixture A1 Format**:
   ```bash
   bun -e 'import { parseJalaliDate } from "./packages/persian/src/calendar"; console.log(parseJalaliDate("12/2/1364"));'
   ```
   *Observed result*: Prints `null`.

4. **Invalidation Conditions for REJECT Verdict**:
   - `bun test --rerun-each=50 packages/persian/test/property.test.ts` passes 50/50 without any failure.
   - `finglishQuery("__proto__")` returns `["__proto__"]` (or transliterated equivalent) without throwing.
   - `finglishQuery("constructor")` returns `["کانستراکتور"]` without throwing.
   - `parseJalaliDate("12/2/1364")` returns `{ year: 1364, month: 2, day: 12 }`.
