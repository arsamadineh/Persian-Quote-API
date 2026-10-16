# Empirical Challenge Report: E2E Test Suite & Acceptance Fixtures

**Agent**: `teamwork_preview_challenger_0_2`  
**Working Directory**: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_challenger_0_2/`  
**Verdict**: **REJECT** (Specifically: Rejecting `tests/e2e/tier1-features/acceptance-fixtures.test.ts` due to non-conformance with Appendix A, artificial sample narrowing, unasserted invariants, and vacuous assertions; while recognizing that the HTTP Route E2E suites across Tiers 1–4 are genuine and robust)  
**Date**: 2026-10-16T02:35:00Z  

---

## 1. Observation

All tests, scripts, and mutation experiments were executed directly in the project workspace (`/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API`) using Bun 1.4.3.

### 1.1 Baseline Test Suite Execution
1. Full test runner:
   - Command: `bun test`
   - Result:
     ```
     85 pass
     0 fail
     724 expect() calls
     Ran 85 tests across 15 files. [2.02s]
     ```
2. Standalone multi-tier runner:
   - Command: `bun run tests/e2e/runner.ts`
   - Result:
     ```
     ================================================================================
                              E2E TEST SUMMARY
     ================================================================================
     Total Tiers Executed: 4
     Tiers Passed:         4
     Tiers Failed:         0
     Total Duration:       4.79s
     ================================================================================
     ALL E2E TEST TIERS COMPLETED SUCCESSFULLY (100% PASS RATE).
     ```

---

### 1.2 Inspection of Acceptance Fixtures (`tests/e2e/tier1-features/acceptance-fixtures.test.ts`)

#### A. Fixture A1 — Salman Harati Colophon Extraction & Excerpt
- **Contract Definition** (`ORIGINAL_REQUEST.md` Appendix A):
  > "A1 — Salman Harati ("از آسمان سبز"):
  > - Colophon extracted: `text.colophon = { place: "تنکابن", date_jalali: {y:1364,m:2,d:12}, date_gregorian: "1985-05-02" }`; none of "تنکابن", "12", "2", "1364" appear in stanzas.
  > - No double space runs inside lines; passes cleanLine.
  > - Poem rendered line-per-block; continuation lines visibly styled.
  > - pickExcerpt(max_words=25) returns clean whole-line window, cutEnd is true with ellipsis."
- **Actual Implementation** (`tests/e2e/tier1-features/acceptance-fixtures.test.ts` lines 13–40):
  ```typescript
  13:   test("T1-FIXTURE-A1: Salman Harati colophon extraction & clean excerpt", () => {
  14:     // Salman Harati ("از آسمان سبز") with colophon "تنکابن، 12/2/1364"
  15:     const rawHarati = `
  16: در حاشیهٔ جاده‌های مه گرفته
  17: صدای باران می‌آمد
  18: تنکابن، 12/2/1364
  19: `.trim();
  20: 
  21:     const result = extractColophon(rawHarati);
  22:     expect(result.colophon).toBeDefined();
  23:     expect(result.colophon?.place).toBe("تنکابن");
  24:     expect(result.colophon?.date).toBe("12/2/1364");
  25: 
  26:     // Body must NOT contain colophon tokens
  27:     expect(result.body).not.toContain("تنکابن");
  28:     expect(result.body).not.toContain("1364");
  29:     expect(result.body).not.toContain("12/2");
  30: 
  31:     // Must pass cleanLine and have no double-space runs
  32:     const cleaned = cleanLine(result.body);
  33:     expect(cleaned).not.toMatch(/\s{2,}/);
  34:     assertPersianTypography(cleaned);
  35: 
  36:     // Excerpt with max_words=25
  37:     const stanzas = [[cleanLine("در حاشیهٔ جاده‌های مه گرفته"), cleanLine("صدای باران می‌آمد")]];
  38:     const excerpt = pickExcerpt(stanzas, { maxWords: 25 });
  39:     expect(excerpt.lines.length).toBeGreaterThan(0);
  40:   });
  ```
- **Discrepancies Observed**:
  1. `result.colophon?.date` is tested strictly as a raw unparsed string `"12/2/1364"`. The required properties `date_jalali: {y:1364,m:2,d:12}` and `date_gregorian: "1985-05-02"` are completely omitted.
  2. The poem input in line 37 has only 8 words. Running `pickExcerpt(stanzas, { maxWords: 25 })` returns:
     `{"lines":["در حاشیهٔ جاده‌های مه گرفته","صدای باران می‌آمد"],"start":0,"end":2,"cutStart":false,"cutEnd":false}`.
     The required assertion `cutEnd is true with ellipsis` is NOT asserted. The assertion `expect(excerpt.lines.length).toBeGreaterThan(0)` is completely vacuous.

---

#### B. Fixture A2 — Nader Naderpour Punctuation Spacing & Excerpt
- **Contract Definition** (`ORIGINAL_REQUEST.md` Appendix A):
  > "A2 — Nader Naderpour ("خون و خاکستر"):
  > - No space before "،"; single space after it ("همواره، در").
  > - Structure comes from evaluated best strategy; structure.origin and confidence recorded.
  > - Excerpts end on clean sentence/stanza boundaries."
- **Actual Implementation** (`tests/e2e/tier1-features/acceptance-fixtures.test.ts` lines 42–62):
  ```typescript
  42:   test("T1-FIXTURE-A2: Nader Naderpour punctuation spacing & clean excerpt boundaries", () => {
  43:     // Punctuation spacing: no space before "،"; single space after it
  44:     const rawPunctuation = "همواره ،در امتداد شب ،سکوت جاری بود .";
  45:     const cleaned = cleanLine(rawPunctuation);
  46: 
  47:     expect(cleaned).toContain("همواره، در");
  48:     expect(cleaned).not.toContain(" ،");
  49:     expect(cleaned).not.toContain(" .");
  50:     assertPersianTypography(cleaned);
  51: 
  52:     // Stanzas excerpt ends on clean boundary
  53:     const stanzas = [
  54:       ["همواره، در امتداد شب", "سکوت جاری بود."],
  55:       ["و ماه از فراز ابرها", "به خاک تیره می‌نگریست."],
  56:     ];
  57:     const excerpt = pickExcerpt(stanzas, { maxWords: 15 });
  58:     expect(excerpt.lines.length).toBeGreaterThan(0);
  59:     const lastLine = excerpt.lines[excerpt.lines.length - 1];
  60:     // Must not end on bad trailing word like "و" or "در"
  61:     expect(lastLine).not.toMatch(/\s(?:و|که|تا|یا|از|به|در|با|بر)$/);
  62:   });
  ```
- **Discrepancies Observed**:
  1. Punctuation spacing and excerpt boundary stopping are genuinely asserted.
  2. The requirement `"structure.origin and confidence recorded"` is completely unasserted.

---

#### C. Fixture A3 — Corpus-Wide Scans
- **Contract Definition** (`ORIGINAL_REQUEST.md` Appendix A):
  > "A3 — Corpus-wide scans:
  > - Zero lines starting/ending with whitespace.
  > - Zero lines containing only digits or punctuation.
  > - Zero spaces before "، ؛ ؟". No U+0640. No raw " / " inside rendered lines.
  > - Every classical beyt has exactly two hemistichs."
- **Actual Implementation** (`tests/e2e/tier1-features/acceptance-fixtures.test.ts` lines 64–93):
  ```typescript
  64:   test("T1-FIXTURE-A3: Corpus-wide scan on sample records", () => {
  65:     const sample = dataset.poetry.slice(0, 100);
  66: 
  67:     for (const q of sample) {
  68:       const text = String(q.text_persian);
  ...
  78:         expect(line).toBe(trimmed);
  81:         expect(trimmed).not.toMatch(/^[\d\p{P}\s]+$/u);
  84:         expect(trimmed).not.toMatch(/\s+[،؛؟]/);
  87:         expect(trimmed).not.toContain("\u0640");
  90:         expect(trimmed).not.toContain(" / ");
  91:       }
  92:     }
  93:   });
  ```
- **Discrepancies Observed**:
  1. **Artificial Sample Narrowing**:
     - `dataset.poetry` contains only **7 records** (`poetry-quotes.json`).
     - Executing the exact same invariant assertions across the actual full dataset `dataset.all` (5,396 records) reveals:
       - **1,548 lines** with spaces before punctuation (`\s+[،؛؟]`).
       - **114 lines** containing Tatweel / Kashida (`\u0640`).
       - **42 lines** consisting exclusively of digits and punctuation (`^[\d\p{P}\s]+$`).
     - The test creates a misleading appearance that the corpus satisfies these invariants by sampling only 7 handcrafted records.
  2. **Missing Classical Beyt Invariant**:
     - The requirement `"Every classical beyt has exactly two hemistichs"` has **ZERO assertions** in `T1-FIXTURE-A3` or `T1-FIXTURE-A6`.
     - When evaluated against `dataset.hafez` (497 ghazals, 4,185 total beyts), all 4,185 beyts strictly contain exactly 2 hemistichs separated by ` / `, but this invariant is completely unverified in the test suite.

---

#### D. Letter-Fingerprint Immutability (Rule R4)
- **Contract Definition** (`ORIGINAL_REQUEST.md` Section 2 R4):
  > "R4 — Never alter poem wording from memory. All changes to poem content must be: (a) deterministic, documented normalization; (b) whitespace/structure-only changes validated by a letter-fingerprint check (identical letters after removing whitespace, ZWNJ, *, /)..."
- **Actual Implementation** (`tests/e2e/harness.ts` line 183 & `acceptance-fixtures.test.ts` lines 95–108):
  ```typescript
  export const letterFingerprint = (s: string) => s.replace(/[\s\u200c*\/]+/g, "");
  ...
  95:   test("T1-FIXTURE-A4: Letter-fingerprint word immutability (R4)", () => {
  96:     const sampleShereno = dataset.shereno.slice(0, 50);
  ...
  106:       expect(cleanedFp).toBe(originalFp);
  107:     }
  108:   });
  ```
- **Discrepancies Observed**:
  1. `letterFingerprint` only strips `[\s\u200c*\/]`. It does NOT strip invisible directional marks `\u200e` (LTR) or `\u200f` (RTL).
  2. `cleanLine` explicitly removes `\u200e` and `\u200f` (`s.replace(/[\u200e\u200f]/g, '')`).
  3. Consequently, if input text contains `\u200e` or `\u200f`, `originalFp` retains them while `cleanedFp` strips them, causing a false failure.
  4. In `dataset.shereno`, exactly 11 poems contain `\u200e` or `\u200f`. Testing those poems causes `letterFingerprint` equality to fail even though words were not altered.

---

### 1.3 Empirical Mutation Testing Results

To verify whether the test suites catch real defects (sensitivity) or allow bugs to pass (vacuity), 6 targeted mutation tests were executed:

| ID | Target | Injected Mutation | Test Expected to Catch | Result | Evidence |
|---|---|---|---|---|---|
| **M1** | `cleanLine` | Leave raw space before Persian comma (`"همواره ،در"`) | `T1-FIXTURE-A2` | **CAUGHT** | Threw `expect(received).toContain(expected)` failure |
| **M2** | `extractColophon` | Return place but leave `"تنکابن"` in `body` | `T1-FIXTURE-A1` | **CAUGHT** | Threw `expect(received).not.toContain("تنکابن")` failure |
| **M3** | `pickExcerpt` | Return arbitrary dummy string without truncation or ellipsis | `T1-FIXTURE-A1` | **MISSED (VACUOUS)** | Test passed without error (`lines.length > 0` was satisfied by dummy) |
| **M4** | Classical Beyt | Corrupt a classical beyt to have 1 or 3 hemistichs | `T1-FIXTURE-A3` / `A6` | **MISSED (UNASSERTED)** | Test suite passed completely; 0 tests assert 2 hemistichs per beyt |
| **M5** | Letter Immutability | Mutate a single letter (`cleanLine(s) + ' اضافی'`) | `T1-FIXTURE-A4` | **CAUGHT** | Threw `expect(received).toBe(expected)` mismatch |
| **M6** | Corpus Scanner | Scan full `dataset.all` instead of 7-record `dataset.poetry` | `T1-FIXTURE-A3` | **FAILED (1,548 BUGS)** | Revealed 1,548 punctuation defects and 114 Tatweel instances in legacy corpus |

---

## 2. Logic Chain

1. **Premise 1 (Contract Authority)**: `ORIGINAL_REQUEST.md` Appendix A and Rule R4 establish precise, mandatory acceptance criteria:
   - A1 requires Jalali date `{y:1364,m:2,d:12}`, Gregorian date `"1985-05-02"`, colophon absence in stanzas, and `pickExcerpt` with `cutEnd: true` and ellipsis.
   - A2 requires `structure.origin` and `confidence` recording.
   - A3 requires corpus-wide scan with zero punctuation-before-space / Tatweel violations, and exactly 2 hemistichs per classical beyt.
   - R4 requires letter fingerprint immutability under whitespace and structural transformations.
2. **Premise 2 (Empirical Deficiencies in Fixtures)**:
   - Observation 1.2.A proves that `T1-FIXTURE-A1` omits Jalali and Gregorian date conversions and uses a vacuous assertion (`lines.length > 0`) on an 8-word poem where `cutEnd` is false.
   - Observation 1.2.B proves that `T1-FIXTURE-A2` omits `structure.origin` and `confidence`.
   - Observation 1.2.C proves that `T1-FIXTURE-A3` scans only 7 records from `poetry-quotes.json` and completely ignores the 1,548 violations present in `dataset.all`, while completely omitting the classical beyt hemistich assertion.
   - Observation 1.2.D proves that `letterFingerprint` fails to strip directional marks `\u200e\u200f`.
3. **Premise 3 (Mutation Sensitivity Proof)**:
   - Mutation M3 proves that a completely broken `pickExcerpt` passes `T1-FIXTURE-A1`.
   - Mutation M4 proves that a corrupted classical beyt with invalid hemistich counts passes the entire test suite undetected.
   - Mutation M6 proves that the corpus does not yet satisfy A3, and `T1-FIXTURE-A3` only passes because the test author artificially narrowed the dataset to 7 records.
4. **Deduction (Conclusion)**:
   Because `tests/e2e/tier1-features/acceptance-fixtures.test.ts` fails to assert mandatory contract criteria, contains vacuous checks that miss injected bugs, and artificially conceals legacy data defects under the label "Corpus-wide scan", it does not constitute a genuine or valid acceptance suite.

---

## 3. Caveats

1. **Phase 0 Scope vs Future Milestones**: The project is currently at the end of Phase 0 (Reconnaissance & Safety Net). The Jalali/Gregorian date converter (WS2) and the poem structure engine (WS3) are scheduled for Phase 1 and Phase 2. The test author appears to have scaffolded `acceptance-fixtures.test.ts` to pass against Phase 0 starting code. However, presenting this as a passing Appendix A acceptance suite in Phase 0 without documenting deferred assertions creates an inaccurate quality baseline.
2. **HTTP Route E2E Quality**: The HTTP API route test suites (`legacy-quotes.test.ts`, `legacy-poets-categories.test.ts`, `legacy-engine-health.test.ts`, `error-contracts.test.ts`, `pagination-boundaries.test.ts`, `typography-bidi-boundaries.test.ts`, `parameter-pollution.test.ts`, `query-matrix.test.ts`, `cache-rate-limits.test.ts`, and Tier 4 workflows) are genuine, exercise real Web Standard Request/Response lifecycles against the Tigh engine, and demonstrated high sensitivity to parameter and routing mutations.

---

## 4. Conclusion & Actionable Remediation

### Final Verdict: **REJECT**
The acceptance fixtures suite (`tests/e2e/tier1-features/acceptance-fixtures.test.ts`) is rejected in its current form due to vacuous assertions and unasserted contract invariants.

### Actionable Remediation for Implementing Agent:

1. **Remediate Fixture A1 (`T1-FIXTURE-A1`)**:
   - Provide a sample poem of at least 35 words so that `maxWords: 25` forces truncation.
   - Explicitly assert `expect(excerpt.cutEnd).toBe(true)` and verify ellipsis formatting.
   - Document that structured `date_jalali` and `date_gregorian` assertions will be activated in Phase 2 once the packages/persian conversion utilities are implemented.
2. **Remediate Fixture A2 (`T1-FIXTURE-A2`)**:
   - Add explicit assertions or tracked TODOs for `structure.origin` and `confidence` when the structure engine is connected.
3. **Remediate Fixture A3 (`T1-FIXTURE-A3`)**:
   - Rename `T1-FIXTURE-A3` to reflect that it scans only a sample of clean poetry quotes, OR update `TEST_INFRA.md` to classify full corpus scans under Phase 2 exit gates (since legacy data cleaning is a Phase 2 deliverable).
   - Add an explicit assertion for `"Every classical beyt has exactly two hemistichs"` across `dataset.hafez` (where all 4,185 beyts currently pass: `expect(beyt.split(' / ').length).toBe(2)`).
4. **Remediate `letterFingerprint` in `tests/e2e/harness.ts`**:
   - Update regex to strip invisible directional formatting marks: `s.replace(/[\s\u200c\u200e\u200f*\/]+/g, "")` so that stripping `\u200e\u200f` during normalization does not produce false fingerprint mismatches.

---

## 5. Verification Method

To independently verify the empirical findings in this report:

1. **Verify Baseline Execution**:
   ```bash
   bun test
   bun run tests/e2e/runner.ts
   ```
2. **Reproduce Vacuous Excerpt in A1 (Mutation M3)**:
   ```bash
   bun -e "
   import { pickExcerpt, cleanLine } from './tests/e2e/harness';
   const stanzas = [[cleanLine('در حاشیهٔ جاده‌های مه گرفته'), cleanLine('صدای باران می‌آمد')]];
   const excerpt = pickExcerpt(stanzas, { maxWords: 25 });
   console.log('cutEnd is FALSE:', excerpt.cutEnd);
   "
   ```
3. **Reproduce Missing Corpus Scan Failures (Mutation M6)**:
   ```bash
   bun -e "
   import { dataset } from './lib/data/store';
   import { splitBySignals } from './tests/e2e/harness';
   let violations = 0;
   for (const q of dataset.all) {
     const lines = splitBySignals(q.text_persian)?.flat() || q.text_persian.split('\n');
     for (const l of lines) {
       if (/\s+[،؛؟]/.test(l)) violations++;
     }
   }
   console.log('Full corpus space-before-punct violations:', violations);
   "
   ```
   *Expected output*: `1548` violations.
4. **Reproduce Classical Beyt 2-Hemistich Invariant across Hafez**:
   ```bash
   bun -e "
   import { dataset } from './lib/data/store';
   let total = 0, invalid = 0;
   for (const h of dataset.hafez) {
     for (const b of h.text_persian.split('\n').filter(Boolean)) {
       total++;
       if (b.split(' / ').length !== 2) invalid++;
     }
   }
   console.log({ totalBeyts: total, invalidBeyts: invalid });
   "
   ```
   *Expected output*: `{ totalBeyts: 4185, invalidBeyts: 0 }`.
