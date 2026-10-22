# Review & Handoff Report: Architecture, Type & Contract Review of Structure Engine v2

- **Agent**: `reviewer_struct_iter2_1`
- **Role**: `reviewer`, `critic`
- **Date**: 2026-10-17
- **Working Directory**: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/reviewer_struct_iter2_1/`
- **Recipient**: `parent` (`943e3f77-1c06-477c-b2c9-c2dcd1ffd2c9`)
- **Target Deliverable**: Structure Engine v2 (`contracts/structure.ts`, `packages/poem/src/`, `lib/changelog.ts`)
- **Review Verdict**: **APPROVE**

---

## 1. Observation

Direct code examination, type verification, and empirical test execution yielded the following observations:

### 1.1 Type & Contract Conformance (`contracts/structure.ts` & `packages/poem/src/`)
1. **Interface & Function Signatures**:
   - `contracts/structure.ts`:
     - `Form` is `'classical_rhymed' | 'free_verse' | 'colloquial' | 'prose'`.
     - `StructureResult` specifies: `form`, `stanzas`, `beyts?`, `origin`, `confidence`, `flags`, `typos?`, `typeset?`, `colophon?`.
     - `structurePoem(text: string, o?: { poetId?: string }): StructureResult`.
   - `packages/poem/src/structure.ts` lines 257–407 implement `structurePoem(text: string, options?: { poetId?: string; enableLlm?: boolean }): StructureResult`.
   - The returned object strictly conforms:
     - `origin`: only emits values in `'source' | 'separators' | 'rhyme_grid' | 'boundary_model' | 'llm' | 'heuristic' | 'human'`.
     - `confidence`: calibrated in $[0, 1]$ across all stages (S0: `0.95`, S3: $[0.70, 0.98]$, S4: $[0.70, 0.95]$, S5: `0.35`, S6: `0.85`, empty: `1.0`).
     - `flags`: restricted to `'low_confidence' | 'possible_typo' | 'footer_removed'`.
     - `typos`: formatted as `{ token: string; suggestion: string; ratio: number }[]` and emitted as advisory flags only (text in `stanzas` is never mutated).
     - `typeset`: `string[][]` matching the stanza dimensions of `stanzas`.
     - `beyts`: present as `[string, string][]` when `classical_rhymed` and synchronized with `stanzas` (`stanzas = beyts.map(([h1, h2]) => [h1, h2])` in S3; paired lines in S0).

2. **Static Analysis & Typecheck**:
   - Running `bun run --filter @persian-quote/poem typecheck` executed `tsc --noEmit` and exited with returncode 0 in 5.72s with zero type errors.

### 1.2 Inspection of Key Implementation Modules
1. **`packages/poem/src/rhyme-grid.ts`**:
   - Lines 16–21: `'را'` was removed from `RADIF_STOPWORDS`, allowing legitimate radif detection for poems ending with the object marker. Personal pronouns (`'ما', 'من', 'تو', 'او', 'شما', 'آنها'`) remain protected in `RADIF_STOPWORDS`.
   - Lines 272–274: In `snapMidpoint`, the previous soft penalty (`cost += 500`) was replaced by an absolute guard: `if (mask[m] === 0) continue;`.
   - Lines 390–396: Couplet anchor search lattice advances anchors when followed by a forbidden boundary (`while (a + 1 < N && mask[a + 1] === 0) a++;`), cleanly absorbing clitics into line-ends.
2. **`packages/poem/src/typeset.ts`**:
   - Line 1: `TYPESET_SUFFIX_REGEX = /(?<=[\p{L}\u200c])\s+(ی|ها|های|تر|ترین)(?=[^\p{L}\u200c]|$)/gu;`.
   - Single-pass `replace` without loop backtracking.
   - Lookbehind checks exactly 1 preceding character. Suffix list strictly excludes `می`.
   - Adversarial benchmark: `typesetLine("الف".repeat(25000))` executed in **0.503 ms** (down from >47,000 ms), completely resolving the ReDoS vulnerability.
3. **`packages/poem/src/form.ts`**:
   - Lines 155–161: Evaluates prose punctuation density before radif/qafiyeh checks, preventing prose aphorisms with repeated words from entering classical couplet bisection.
   - Lines 70–72: Radif candidates terminating in `FORBIDDEN_LINE_ENDS` are disqualified.
4. **`packages/poem/src/boundary-model.ts`**:
   - Lines 219–229: Dynamic programming objective accumulates negative gap log-probabilities for non-breaks ($\sum \log(1 - p_k)$).
   - Line 242: Applies break transition prior ($\beta = 2.2$) to calibrate the decision threshold.
   - Lines 247–251: Rewards 2–6 word lengths to prevent greedy 10-word line packing.
5. **`packages/poem/src/glue.ts`**:
   - Implements S1 hard glue constraints: `FORBIDDEN_LINE_STARTS` (18 tokens) and `FORBIDDEN_LINE_ENDS` (14 tokens).
   - Preserves compound integrity for `X به X` (`در به در`, `لا به لا`, `روز به روز`), `تو در تو`, immediate repeats `X X`, and ezafe chains.

### 1.3 Empirical Verification Suites
1. **Unit and Contract Test Suite**:
   - `bun test packages/poem`: **42 pass, 0 fail** (819 expect calls, 297 ms).
2. **Monorepo Integration Suite**:
   - `bun test`: **287 pass, 0 fail** (10,543 expect calls, 4.55 s across 38 files).
3. **Acceptance Fixtures**:
   - `bun test tests/e2e/tier1-features/acceptance-fixtures.test.ts`: **6 pass, 0 fail**.
   - Shot #1 (Mehdi Soheili): 100% of couplet-ending hemistichs and 100% of expected rhyming positions end with «هنوز».
   - Shot #4 (Shahriar): Balanced couplets with $|w_1 - w_2| \le 2$ words and $\le 9$ words per line.
   - Shots #2 & #3 (Heydarzadeh & Ahmadi): 0 glue starts, 0 dangling ends, $\le 6$ words per line.
4. **Corpus Invariants (`data/golden/sample300.jsonl`)**:
   - Standalone glue-suffix line starts across 300 works: **0**.
   - Downstream glue start errors: **0**.
   - Downstream dangling end errors: **0**.
   - Letter-fingerprint preservation rate: **100.00%** (300/300 works).
   - Hafez Ghazal 9 (`hafez.ghazaliat.9`): **0 lines starting with «را»**.
   - Median inference runtime: **2.71 ms/poem** (target $\le 5.0$ ms).

### 1.4 Adversarial Integrity Audit
- Scanned codebase for hardcoded fixtures, poem IDs, or test-specific shortcuts: **0 instances found**.
- Verified non-neural frequency lexicon in `typos.ts` is genuine corpus frequency data.
- Verified logistic regression weights in `weights.json` are authentic SGD weights with Platt calibration ($ECE = 0.0164 \le 0.08$).
- Verified `lib/changelog.ts`: Version `"۳.۱۷.۱"` registered with typed `fixed` entries, Persian numerals, and proper compliance with `AGENTS.md` rules.

---

## 2. Logic Chain

1. **Type & Structural Soundness**:
   - All exported structures match `contracts/structure.ts`.
   - `StructureResult` properties (`form`, `stanzas`, `beyts`, `origin`, `confidence`, `flags`, `typeset`, `typos`, `colophon`) are typed and emitted according to spec.
   - When `form === 'classical_rhymed'`, `beyts` and `stanzas` are 1:1 synchronized.

2. **Resolution of Iteration 1 Failure Modes**:
   - ReDoS vulnerability in `typeset.ts` was eliminated by eliminating quantifier overlap and while-loop recursion. Execution is now single-pass linear $O(N)$ with runtime under 1 ms for 25,000 characters.
   - Radif «را» suppression in `rhyme-grid.ts` was eliminated by permitting «را» when backed by a dominant rhyming suffix. Midpoint snapping strictly forbids `mask[m] === 0`, ensuring Ghazal 9 has zero lines starting with «را».
   - Pre-split text with genuine poetic line breaks in S0 is cleaned of OCR suffix detachment while preserving authentic grammar.

3. **Behavioral Acceptance Satisfaction**:
   - All four golden fixtures in `shots.jsonl` meet all specified criteria.
   - Corpus invariants hold with 100% letter-fingerprint preservation and zero standalone suffix line starts.
   - All 287 automated tests pass green.

---

## 3. Caveats

1. **Artificially Flattened Modern Refrains**:
   If an author-formatted modern free-verse poem (e.g. `tahereh-saffarzadeh.general.5`) is artificially stripped of its newlines and processed downstream, a repeating 1-word refrain ("سفره‌") at index 1 can trigger radif detection, creating a 1-word opening couplet. In normal operation, S0 handles this poem via `origin: separators`. For future maintenance, adding an `anchor >= 5` constraint in `detectRadifCandidates` is recommended.
2. **Authentic Source Conjunction Endings**:
   Authentic classical ghazal hemistichs in Divan-e Hafez occasionally end on grammatical conjunctions such as «ولی» (e.g. Ghazal 83). In S0 (`origin: separators`), these are preserved faithfully without synthetic punctuation insertion, satisfying the 100% letter-fingerprint preservation contract.

---

## 4. Conclusion

The Iteration 2 fixes have resolved all Gate 1 defects. Structure Engine v2 strictly conforms to `contracts/structure.ts`, enforces S1 glue constraints across all downstream stages, eliminates catastrophic ReDoS backtracking, preserves 100% letter fingerprints across the corpus, and fulfills all acceptance criteria.

Review Verdict: **APPROVE**.

---

## 5. Verification Method

To independently reproduce this verification:

1. **Run Unit and Property Tests**:
   ```bash
   bun test packages/poem
   ```
   *Expected*: 42 pass, 0 fail.

2. **Run Monorepo Test Suite**:
   ```bash
   bun test
   ```
   *Expected*: 287 pass, 0 fail.

3. **Run TypeScript Typecheck**:
   ```bash
   bun run --filter @persian-quote/poem typecheck
   ```
   *Expected*: `Done`, 0 errors.

4. **Run Adversarial Stress Test Suite**:
   ```bash
   bun run scripts/challenger-verify.ts
   ```
   *Expected*: `OVERALL VERDICT: APPROVE` with 100% fingerprint preservation.
