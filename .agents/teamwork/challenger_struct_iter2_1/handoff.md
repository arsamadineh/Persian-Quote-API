# Handoff Report: Empirical Challenge & Verification of Structure Engine v2

- **Agent**: `challenger_struct_iter2_1`
- **Role**: `critic`, `specialist`
- **Date**: 2026-10-17
- **Working Directory**: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/challenger_struct_iter2_1/`
- **Recipient**: `parent` (`943e3f77-1c06-477c-b2c9-c2dcd1ffd2c9`)
- **Status**: COMPLETE (Hard Handoff)
- **Verdict**: APPROVE

---

## 1. Observation

Empirical testing was executed across the four golden behavioral fixtures (`data/golden/shots.jsonl`), the stratified evaluation benchmark (`data/golden/sample300.jsonl`), and a 20-case adversarial stress suite.

### 1.1 Golden Behavioral Fixtures (`data/golden/shots.jsonl`)

Commands executed:
```bash
bun -e '
import { structurePoem } from "./packages/poem/src";
import fs from "node:fs";
const shots = fs.readFileSync("data/golden/shots.jsonl", "utf8").trim().split("\n").map(l => JSON.parse(l));
// Evaluated both shot.text and shot.flat_text
'
```

Observed measurements:
1. **Shot #1 (Mehdi Soheili - `mehdi-soheili.general.142`)**:
   - `origin: rhyme_grid`, `form: classical_rhymed`, `confidence: 0.8655`.
   - Total couplets (beyts): 7; total formatted lines: 14.
   - Couplet-ending hemistichs ending with «هنوز»: 7 out of 7 (100.0%, exceeding target >= 90%).
   - Total hemistichs ending with «هنوز»: 8 out of 14 (100% of expected rhyming positions, including matla' hemistich 1).
   - Maximum words per line: 10 words (Line 1: 10 words, Line 2: 6 words, Line 5: 7 words, Line 11: 9 words, Line 12: 8 words, Line 13: 8 words, Line 14: 8 words). Zero lines exceed 10 words.
2. **Shot #4 (Shahriar - `shahriar.general.72`)**:
   - `origin: rhyme_grid`, `form: classical_rhymed`, `confidence: 0.9434`.
   - Total couplets (beyts): 12; total lines: 24.
   - Hemistich balance: Across all 12 couplets, the maximum word count difference between hemistich 1 and hemistich 2 is 2 words (e.g. 7 vs 9, 8 vs 8, 8 vs 7).
   - Maximum words per line: 9 words. Zero lines exceed 10 words.
3. **Shot #2 (Maryam Heydarzadeh - `maryam-heydarzadeh.general.26`)**:
   - `origin: boundary_model`, `form: colloquial`, `confidence: 0.7000`.
   - Total lines: 94; maximum words per line: 6 words.
   - Forbidden line-start violations (`FORBIDDEN_LINE_STARTS`): 0.
   - Unpunctuated dangling line-end violations (`FORBIDDEN_LINE_ENDS`): 0.
4. **Shot #3 (Ahmadreza Ahmadi - `ahmadreza-ahmadi.general.18`)**:
   - `origin: boundary_model`, `form: free_verse`, `confidence: 0.7000`.
   - Total lines: 33; maximum words per line: 6 words.
   - Forbidden line-start violations: 0.
   - Unpunctuated dangling line-end violations: 0.

### 1.2 Corpus Invariants across Benchmark (`data/golden/sample300.jsonl`)

Evaluated on 300 works:
1. **Letter-Fingerprint Preservation Rate**:
   - Formula: `letterFingerprint(s) = normalize(s).replace(/[\s\u200c*\/]+/g, '')`.
   - Result: 300 out of 300 works preserved 100.00% letter fingerprint.
2. **Standalone Glue-Suffix Starts**:
   - Set: `{ی, ها, های, تر, ترین, ام, ات, اش, مان, تان, شان}`.
   - Result: 0 lines start with a standalone glue-suffix token across all 300 works.
3. **Starts with «را» (specifically Hafez Ghazal 9 - `hafez.ghazaliat.9`)**:
   - `hafez.ghazaliat.9` with `text_plain`: 0 lines start with «را».
   - `hafez.ghazaliat.9` with `flat_text`: 0 lines start with «را». Generated 10 couplets via `rhyme_grid` where each second hemistich ends with radif «را».
   - Across all 300 works in `sample300.jsonl`: 0 lines start with «را».
4. **Dangling Ends across Corpus**:
   - When parsed from `text_plain` (origin: `separators`), 38 lines end on conjunctions without punctuation (e.g. Hafez Ghazal 83: "از سخن چينان ملالت‌ها پديد آمد ولی"). These are verified verbatim authentic hemistich endings present in the source canon.
   - When all 300 works are forcibly flattened and processed downstream through `rhyme_grid` and `boundary_model`, 5,827 out of 5,828 generated lines contain zero unpunctuated dangling ends.
   - 1 single line in `tahereh-saffarzadeh.general.5` produced `"در"` as a 1-word hemistich when forcibly flattened because the modern refrain word "سفره‌" was selected as candidate radif at token index 1 with preceding preposition "در" treated as rhyming suffix.
5. **Inference Latency**:
   - Median runtime: 2.40 ms/poem (target <= 5.0 ms/poem).
   - 95th percentile runtime: 11.80 ms/poem.

### 1.3 Stress and Edge Case Battery

Executed 20 adversarial cases and property tests:
1. Empty string (`""`) and whitespace (`" \n\t "`): Output 0 lines, `origin: source`, 0 crashes.
2. Single Persian word (`"تنهایی"`), single forbidden start (`"را"`), single forbidden end (`"و"`): Output 1 line, `origin: boundary_model`, 100% fingerprint preserved.
3. Mixed script input (Persian, Latin, Chinese): Output 2 lines, 100% fingerprint preserved.
4. Extreme glue sequences (10 start tokens in a row, 14 end tokens in a row): Handled via `heuristic` DP without crash, 100% fingerprint preserved.
5. Unbroken long strings: 1,000 words without punctuation and 5,000-character unspaced Persian string handled without memory leaks or crashes.
6. ReDoS vulnerability regression: `typesetLine("الف".repeat(50000))` completed in 0.474 ms (down from >47,000 ms).
7. Fast-check randomized property fuzzing: 300 randomized inputs passed with zero exceptions and 100% letter-fingerprint preservation.
8. Prose aphorisms (`general.aphorisms.*` in `sample300.jsonl`): 50 out of 50 evaluated; 0 misclassified as `classical_rhymed` (17 classified as `prose`, 31 as `free_verse`, 2 as `colloquial`).

---

## 2. Logic Chain

1. **Golden Behavioral Fixture Conformance**:
   - Observation 1.1 confirms Shot #1 satisfies the radif ending constraint: 100.0% of couplet-ending hemistichs and 100% of expected radif positions end with «هنوز». Max line length is 10 words.
   - Observation 1.1 confirms Shot #4 satisfies the hemistich balance constraint: maximum word count delta between hemistichs is 2 words, with all lines <= 9 words.
   - Observation 1.1 confirms Shots #2 and #3 satisfy the glue and length constraints: zero glue starts, zero dangling ends, max 6 words per line.
   - Therefore, all four behavioral fixtures defined in lines 429-434 of `ORIGINAL_REQUEST.md` pass.

2. **Corpus Invariant Conformance**:
   - Observation 1.2 confirms 100.00% letter-fingerprint preservation across all 300 benchmark works.
   - Observation 1.2 confirms zero lines start with standalone glue suffixes across the corpus.
   - Observation 1.2 confirms zero lines start with «را» in Hafez Ghazal 9 and across the evaluated works.
   - Therefore, the core corpus invariants defined in lines 435-438 of `ORIGINAL_REQUEST.md` pass.

3. **ReDoS Elimination & Performance**:
   - Observation 1.3 demonstrates linear time complexity on the typesetting layer (0.474 ms on 50,000 characters), confirming the lookbehind regex refactor successfully resolved the catastrophic backtracking defect.
   - Observation 1.2 confirms median inference latency of 2.40 ms per poem, meeting the <= 5.0 ms requirement.

4. **Adversarial Robustness**:
   - Observations 1.2 and 1.3 demonstrate that prose aphorisms with repeated words are no longer misclassified as classical verse due to the prose classification precedence in `form.ts`.
   - The test harness confirms stability across empty, single-token, compound, and multivariable scripts.

---

## 3. Caveats

1. **Forced-Flattening Rhyme Grid Edge Case**:
   When an inherently modern nimaee poem (`tahereh-saffarzadeh.general.5`) is artificially flattened to strip all original newlines, the word "سفره‌" appearing at index 1 and index 49 with preceding preposition "در" (index 0 and 48) triggers radif candidate detection. Because index 1 is accepted as an anchor, a 1-word couplet `["در", "سفره‌"]` is generated, where `"در"` ends without punctuation. In standard canonical pipeline operation, this poem contains author line breaks and is parsed via S0 (`origin: separators`), completely avoiding this path. However, adding a minimum token threshold (`anchor >= 5`) in `detectRadifCandidates` is recommended as an enhancement for future iterations.
2. **Ground Truth Conjunction Ends**:
   Authentic classical ghazal hemistichs in Divan-e Hafez occasionally end on grammatical conjunctions such as «ولی» (e.g., Ghazal 83, 9, 247, 49, 230). In S0 (`origin: separators`), these are preserved faithfully without synthetic punctuation insertion, which satisfies the letter-fingerprint preservation contract.

---

## 4. Conclusion

Structure Engine v2 satisfies all four Golden Behavioral Fixtures in `data/golden/shots.jsonl`, maintains 100.00% letter-fingerprint preservation across `data/golden/sample300.jsonl`, enforces zero standalone suffix line-starts, resolves the Hafez Ghazal 9 line-start defect, eliminates the typesetting ReDoS vulnerability, and completes inference within the required latency envelope.

Empirical Challenge Verdict: **APPROVE**.

---

## 5. Verification Method

To independently reproduce and verify all observations:

1. **Execute Monorepo Unit and E2E Test Suites**:
   ```bash
   bun test packages/poem
   bun test tests/e2e/tier1-features/acceptance-fixtures.test.ts
   bun test
   ```
   *Expected*: All 287 tests pass with 0 failures.

2. **Execute Full Challenger Verification Harness**:
   ```bash
   bun scripts/challenger-verify.ts
   ```
   *Expected*: Outputs `OVERALL VERDICT: APPROVE` with 100% letter-fingerprint preservation on 300 works.

3. **Verify Typeset ReDoS Benchmark**:
   ```bash
   bun -e '
   import { typesetLine } from "./packages/poem/src/typeset";
   const t0 = performance.now();
   typesetLine("الف".repeat(50000));
   console.log("50k runtime:", (performance.now() - t0).toFixed(3), "ms");
   '
   ```
   *Expected*: Runtime under 2.0 ms.
