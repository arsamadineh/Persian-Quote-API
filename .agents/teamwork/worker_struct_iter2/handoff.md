# Handoff Report: Structure Engine v2 Iteration 2 Implementation & Verification

- **Agent**: `worker_struct_iter2`
- **Role**: `implementer`, `qa`, `specialist`
- **Date**: 2026-10-17
- **Working Directory**: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/worker_struct_iter2/`
- **Recipient**: `parent` (`943e3f77-1c06-477c-b2c9-c2dcd1ffd2c9`)
- **Status**: COMPLETE (Hard Handoff)

---

## 1. Observation

Prior to modifications, automated investigation and evaluation across `data/canonical/works.jsonl` and `data/golden/sample300.jsonl` revealed:
1. **ReDoS Vulnerability in Typeset Layer (`packages/poem/src/typeset.ts`)**:
   - `TYPESET_SUFFIX_REGEX = /([\p{L}\u200c]+)\s+(ی|ها|های|تر|ترین)(?=[^\p{L}\u200c]|$)/gu` executed inside a `while (curr !== prev)` loop exhibited $O(N^2)$ catastrophic backtracking on unspaced input (`typesetLine("الف".repeat(25000))`), timing out beyond 47,000 ms.
2. **Radif Suppression & Line-Start Violations in S3 (`packages/poem/src/rhyme-grid.ts`)**:
   - `RADIF_STOPWORDS` included `'را'`, preventing single-token radif detection on poems such as Hafez Ghazal 9 (`hafez.ghazaliat.9`).
   - Couplet slicing after qafiyeh nouns without verifying `mask[anchorEnd + 1] === 1` caused 10 couplets in Ghazal 9 to start with `«را»`.
   - In `snapMidpoint`, soft cost `mask[m] === 0 ? 500 : 0` was overridden when word count penalties exceeded 500, leading to cuts on dangling conjunctions and prepositions.
3. **S0 Pre-Split Rejection (`packages/poem/src/structure.ts`)**:
   - `looksStructured` rejected pre-split text containing authentic Persian lines starting with copulas/verbs (`هست`, `بود`, `شد`) or ending with conjunctions (`ولی`), falling through to S3.
   - S0 had no mechanism to repair OCR/editorial line-break leakage where suffixes (`ها`, `ی`) or prefixes (`می`) were detached across newlines.
4. **S2 Form Classification Inversions (`packages/poem/src/form.ts`)**:
   - Prose checks evaluated after radif periodicity caused prose aphorisms with repeating words to be misclassified as `classical_rhymed`.
   - Multi-word refrains ending in conjunctions/prepositions were accepted as candidate radifs.
5. **S4 Boundary Model Greediness (`packages/poem/src/boundary-model.ts`)**:
   - DP step scoring omitted negative gap log-probabilities for non-breaks within candidate lines, greedily packing 8–10 words per line on modern free verse.

---

## 2. Logic Chain

1. **S8 Linear Execution**:
   Replacing `([\p{L}\u200c]+)\s+` with a fixed 1-character lookbehind `(?<=[\p{L}\u200c])\s+` checks only the single character preceding the whitespace. Disjoint character classes eliminate backtracking entirely, achieving guaranteed single-pass $O(N)$ execution. The negative constraint on `«می»` is preserved as `می` is not in the suffix group.
2. **S3 Hard Glue Invariant & Radif «را»**:
   - Removing `'را'` from `RADIF_STOPWORDS` while requiring dominant qafiyeh support enables legitimate radif `'را'` detection while preventing stray occurrences from forming false chains.
   - Retaining personal pronouns (`'ما', 'من', 'تو', 'او', 'شما', 'آنها'`) in `RADIF_STOPWORDS` and excluding stopwords from `detectQafiyehAnchors` prevents free-verse direct address tokens from creating false couplet anchor chains.
   - Enforcing `idx >= 11` for the initial anchor in `detectQafiyehAnchors` ensures anchors mark couplet (beyt) endings rather than matla hemistich endings.
   - In `snapMidpoint`, replacing `cost += 500` with `if (mask[m] === 0) continue;` guarantees zero glue violations during midpoint bisection. Advancing anchors while `mask[a + 1] === 0` absorbs clitics into the preceding hemistich.
3. **S0 Normalization & Leakage Repair**:
   - Removing `hasGlueViolation` from `looksStructured` restores adherence to specification (median 2–12, max $\le 22$).
   - Implementing `fixLineBreakLeakage` with iterative reattachment resolves OCR-detached suffixes (`ها را`, `ست`) and detached verbal prefixes (`می`, `نمی`) while preserving 100% letter fingerprints.
4. **S2 Pipeline Order & Radif Disqualification**:
   - Evaluating prose density before radif/qafiyeh checks routes punctuated prose aphorisms to `prose`.
   - Disqualifying candidate radifs whose final token is in `FORBIDDEN_LINE_ENDS` ensures lines never terminate on unpunctuated conjunctions or prepositions.
5. **S4 DP Joint Likelihood Formulation**:
   - Accumulating negative gap log-probabilities $\sum \log(1 - p_k)$, adding the break transition prior ($\beta = 2.2$), and rewarding 2–6 word lengths enables the boundary model to align line breaks with genuine clause pauses.

---

## 3. Caveats

1. **Separators in S0 vs Downstream Generation**:
   In S0 (`origin: 'separators'`), ground truth authentic poetry lines starting with grammatical verbs (e.g., Hafez Ghazal 9: `هست خاکی که به آبی نخرد طوفان را`) are preserved exactly as written. The corpus constraint for zero glue starts applies to standalone glue-suffix tokens (`ی`, `ها`, `های`, `تر`, `ترین`, `ام`, `ات`, `اش`, `مان`, `تان`, `شان`), where 0 violations exist across the corpus.
2. **Downstream Glue Conformance**:
   Across all downstream stages (`rhyme_grid`, `boundary_model`, `heuristic`), 0 start errors and 0 dangling end errors exist across the benchmark corpus.

---

## 4. Conclusion

All Gate 1 defects identified in Iteration 2 have been resolved and verified across the codebase:
- **`packages/poem/src/rhyme-grid.ts`**: Classical rhyme grid drop-in with radif «را» allowed when supported by qafiyeh, personal pronouns retained in `RADIF_STOPWORDS`, strict `mask[m] === 0 continue` in `snapMidpoint`, stopword filtering in `detectQafiyehAnchors`, and couplet anchor search lattice calibrated.
- **`packages/poem/src/structure.ts`**: `looksStructured` simplified to word distribution checks; `fixLineBreakLeakage` added to reattach detached suffixes and prefixes.
- **`packages/poem/src/form.ts`**: Prose check placed before radif/qafiyeh; candidate radifs ending in `FORBIDDEN_LINE_ENDS` disqualified.
- **`packages/poem/src/typeset.ts`**: Single-pass lookbehind regex eliminates ReDoS while preserving the negative constraint on «می».
- **`packages/poem/src/boundary-model.ts`**: DP step score uses negative gap log-probabilities, break transition prior ($\beta = 2.2$), and 2–6 word length preference.
- **`packages/poem/tests/structure-v2.test.ts`**: Updated `looksStructured` test to assert length distributions.
- **`lib/changelog.ts`**: Added version `۳.۱۷.۱` with typed `fixed` entries following AGENTS.md rules.

---

## 5. Verification Method

### 5.1 Verification Commands and Results

1. **Unit and Contract Tests (`packages/poem`)**:
   ```bash
   bun test packages/poem
   ```
   *Result*: **42 pass, 0 fail** (819 expect calls, runtime ~330ms).

2. **Acceptance Fixtures Test**:
   ```bash
   bun test tests/e2e/tier1-features/acceptance-fixtures.test.ts
   ```
   *Result*: **6 pass, 0 fail** (8,566 expect calls, runtime ~730ms).

3. **Full Monorepo Test Suite**:
   ```bash
   bun test
   ```
   *Result*: **287 pass, 0 fail** (10,543 expect calls, runtime ~4.0s).

4. **TypeScript Typecheck**:
   ```bash
   bun run --filter @persian-quote/poem typecheck
   ```
   *Result*: `Done in 4.73s`, zero errors.

5. **Typeset ReDoS Benchmark**:
   ```bash
   bun -e '
   import { typesetLine } from "./packages/poem/src/typeset";
   const t0 = performance.now();
   typesetLine("الف".repeat(25000));
   console.log("25k char time:", (performance.now() - t0).toFixed(3), "ms");
   '
   ```
   *Result*: **0.503 ms** (down from >47,000 ms, well below 50 ms limit).

6. **Comprehensive Corpus Audit across `data/golden/sample300.jsonl`**:
   - Downstream glue start errors: **0**
   - Downstream glue dangling end errors: **0**
   - Corpus standalone glue-suffix line starts: **0**
   - Letter-fingerprint preservation rate: **100.00%** (300/300)
   - Median inference latency: **2.711 ms/poem** (target $\le 5.0$ ms)
   - Hafez Ghazal 9 lines starting with `«را»`: **0**
