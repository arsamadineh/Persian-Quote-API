# Forensic Integrity Audit Report: Structure Engine v2 (Iteration 2)

**Auditor**: `auditor_struct_iter2_1` (Forensic Integrity Auditor / Critic / Specialist)  
**Date**: 2026-10-17  
**Working Directory**: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/auditor_struct_iter2_1/`  
**Target Deliverable**: Structure Engine v2 (`packages/poem/src/` and `lib/changelog.ts`)  
**Integrity Mode**: Development (Ground-truth authority: `ORIGINAL_REQUEST.md` line 393)  

---

## Forensic Audit Report

**Work Product**: `packages/poem/src/` and `lib/changelog.ts`  
**Profile**: General Project (Integrity Forensics)  
**Verdict**: **CLEAN**

### Phase Results
- **Hardcoded Test Fixture Detection**: **PASS** — Zero fixture strings from `data/golden/shots.jsonl`, zero poet names, zero titles, and zero conditional sniffing or cheating branches in `packages/poem/src/`.
- **Genuine Algorithmic Pipeline Implementation (S0–S8)**: **PASS** — Stages S0 through S8 are fully implemented with generalized, computational logic (linear lookbehind regex in S8, DP lattice anchor search in S3, logistic regression DP decoder in S4, heuristic DP with parabolic length and orphan penalty in S5, Levenshtein frequency ratio matching in S7). Zero facades, zero stubs, zero dummy mocks.
- **Model & Weight Authenticity (S4)**: **PASS** — `boundary-model.ts` evaluates real 12-feature dot products against SGD-trained weights in `weights.json` and calibrates them with Platt scaling formula `1.0 / (1.0 + Math.exp(-(plattA * z + plattB)))` where $ECE = 0.0164 \le 0.08$. Zero bypasses or simulated probabilities.
- **Letter-Fingerprint Invariant**: **PASS** — 100.00% letter preservation across all 300 benchmark works in `data/golden/sample300.jsonl` and all 4 golden shots. Typeset modifications are strictly isolated to `typeset` without altering canonical `stanzas`.
- **AGENTS.md Governance**: **PASS** — `lib/changelog.ts` has valid Persian semver `"۳.۱۷.۱"`, Gregorian `isoDate` `"2026-10-17"`, Persian date in words `"۲۶ مهر ۱۴۰۵"`, typed `fixed` entries, active-voice concise Persian descriptions, zero emojis anywhere in `packages/poem/` or `lib/changelog.ts`, and zero marketing fluff or tool branding.
- **Independent Test Suite Execution**: **PASS** — 42/42 tests pass in `packages/poem` (332 ms), 6/6 pass in `tier1-features/acceptance-fixtures.test.ts` (676 ms), and all 287 tests pass across 38 files in the full monorepo suite (5.17 s).

---

## 1. Observation

### 1.1 Source Code Inspection & Cheating Checks
1. **Zero Fixture Strings and Conditionals in Source**:
   - Case-insensitive search across `packages/poem/src/` for poet names (`مهدی سهیلی`, `مریم حیدرزاده`, `احمدرضا احمدی`, `شهریار`), titles (`زنده ی مرگ آلود`, `مزاحم همیشگی`, `هفده`), and IDs returned **zero** occurrences.
   - Grep search for environment sniffing (`process.env.NODE_ENV === 'test'`) returned **zero** occurrences in `packages/poem/src/`.
   - Grep search for test filenames or words (`golden`, `shots`, `sample300`, `fixture`) in `packages/poem/src/` returned zero matches, except `"training_samples": 37036` as training metadata in `weights.json`.
   - Inspected all conditional branches in `packages/poem/src/structure.ts`, `rhyme-grid.ts`, `boundary-model.ts`, `form.ts`, and `glue.ts`. Every branch is a general linguistic check (e.g., word count distribution, glue mask lookups, n-gram periodicities, punctuation checks).

2. **Stage-by-Stage Implementation Authenticity (S0–S8)**:
   - **S0 (Signals & Leakage Repair)** (`structure.ts:38–114`):
     - `splitBySignals`: Parses asterisks, square bullets, newlines, double spaces, and spaced slashes.
     - `looksStructured`: Evaluates line length distribution (median 2–12 words, max $\le 22$).
     - `fixLineBreakLeakage`: Iteratively reattaches detached clitics (`DETACHED_SUFFIXES`: `ی`, `ها`, `های`, `تر`, `ترین`, `ام`, `ات`, `اش`, `مان`, `تان`, `شان`, `ست`, `را`) to preceding lines and detached verbal prefixes (`DETACHED_PREFIXES`: `می`, `نمی`, `بی`, `همی`) to succeeding lines, preserving 100% letter fingerprints.
   - **S1 (Hard Glue Constraints)** (`glue.ts:39–100`):
     - `buildGlueMask`: Returns a `Uint8Array` of length $N$ where `mask[0] = 0`.
     - Enforces `FORBIDDEN_LINE_STARTS` (17 tokens), `FORBIDDEN_LINE_ENDS` (17 tokens without trailing punctuation), Ezafe endings, identical repeats $X\ X$, and compounds $X\text{ به }X$ and `تو در تو`.
   - **S2 (Form Classifier)** (`form.ts:145–177`):
     - Checks colloquial marker density ($\ge 3$ or ratio $\ge 0.012$).
     - Checks prose density ($N \ge 25$ and punctuation density $\ge 0.05$ or $0.08$) **prior** to radif/qafiyeh checks to prevent prose aphorisms with repeating words from misclassifying.
     - Calculates radif periodicity across 1-gram to 3-gram candidates ($CV \le 0.35$).
     - Evaluates qafiyeh regularity via lattice DP ($CV \le 0.35$).
   - **S3 (Classical Rhyme Grid)** (`rhyme-grid.ts:16–477`):
     - `RADIF_STOPWORDS` excludes `'را'` to permit legitimate radif detection when supported by dominant qafiyeh (`dominantSuffix`).
     - Anchor clitic absorption (`rhyme-grid.ts:388–396`): Advances anchors while `mask[a + 1] === 0` to absorb clitic and suffix particles into hemistich endings.
     - `snapMidpoint` (`rhyme-grid.ts:272–274`): Strictly skips boundaries where `mask[m] === 0`, guaranteeing zero glue violations during midpoint bisection.
   - **S4 (Modern Boundary Model)** (`boundary-model.ts:9–296`):
     - Evaluates pure-TS logistic regression across 12 lexical/syntactic features with precomputed static gap dot products.
     - DP decoding incorporates negative gap log-probabilities for non-breaks within lines ($\sum \log(1 - p_k)$), break transition prior ($\beta = 2.2$), 2–6 word length preference, and orphan penalty ($-4.0$ for 1-word lines).
     - Calibrated via Platt scaling: `sigmoid(plattA * z + plattB)`.
   - **S5 (Heuristic Fallback DP)** (`heuristic-dp.ts:21–136`):
     - Parabolic length penalty $(W - 6.0)^2$ with $+80.0$ orphan penalty for 1-word lines and $+60.0$ remainder orphan penalty.
   - **S6 (LLM Pass Guard)** (`llm-pass.ts:18–42`):
     - SHA-256 caching and `executeLlmPassGuard` asserting identical letter fingerprints.
   - **S7 (Typo Flags)** (`typos.ts:31–114`):
     - Advisory metadata flagging rare tokens ($count \le 2$) matching frequency lexicon neighbors ($ratio \ge 50$) at Levenshtein distance $\le 2$. Text is never mutated.
   - **S8 (Typeset Layer)** (`typeset.ts:1–21`):
     - `TYPESET_SUFFIX_REGEX = /(?<=[\p{L}\u200c])\s+(ی|ها|های|تر|ترین)(?=[^\p{L}\u200c]|$)/gu`.
     - Single-pass linear execution eliminates ReDoS backtracking while preserving the negative constraint on `«می»`.

3. **Machine Learning Model Authenticity (`weights.json`)**:
   - `weights.json` contains:
     - `num_features`: 12
     - `weights`: `[-5.0135, 4.1015, -0.0326, 0.7460, -0.0337, 0.2693, 0.4507, 0.1387, 6.9664, 0.2397, -1.6443, -2.8108]`
     - `calibration`: `A: 0.6447`, `B: -1.4419`, `ece: 0.0164` (strictly $\le 0.08$)
     - `metrics`: `training_samples: 37036`, `num_poets: 38`, `validation: "leave_poet_out"`.

4. **AGENTS.md Governance & Emoji Scan**:
   - `lib/changelog.ts` lines 26–48:
     - `version`: `"۳.۱۷.۱"` (Persian digits, valid patch increment from `"۳.۱۷.۰"`).
     - `isoDate`: `"2026-10-17"`.
     - `date`: `"۲۶ مهر ۱۴۰۵"`.
     - All 3 entries typed as `fixed`, written in active-voice Persian, no superlatives, no tool names.
   - Emoji Scan: Full AST scan of all 380 files in repository found **zero** true emojis. In `packages/poem/src/` and `lib/changelog.ts`: exactly **0** emojis.

### 1.2 Verbatim Empirical Tool Outputs

1. **Packages/poem Unit & Contract Suite**:
   ```
   bun test packages/poem
   bun test v1.4.3 (c6da4a4d3)
   42 pass
   0 fail
   819 expect() calls
   Ran 42 tests across 2 files. [332.00ms]
   ```

2. **Tier 1 Acceptance Fixtures Test**:
   ```
   bun test tests/e2e/tier1-features/acceptance-fixtures.test.ts
   bun test v1.4.3 (c6da4a4d3)
   6 pass
   0 fail
   8566 expect() calls
   Ran 6 tests across 1 file. [676.00ms]
   ```

3. **Full Monorepo Test Suite**:
   ```
   bun test
   bun test v1.4.3 (c6da4a4d3)
   287 pass
   0 fail
   10543 expect() calls
   Ran 287 tests across 38 files. [5.17s]
   ```

4. **TypeScript Typecheck**:
   ```
   bun run --filter @persian-quote/poem typecheck
   @persian-quote/poem typecheck $ tsc --noEmit
   Done in 5.40 s
   ```

5. **Empirical Forensic Audit Script (Golden Shots, Benchmark, ReDoS, Hafez Ghazal 9)**:
   ```
   === EMPIRICAL FORENSIC AUDIT SCRIPT ===
   Loaded 4 golden shots.
   Shot mehdi-soheili.general.142 (مهدی سهیلی): form=classical_rhymed, origin=rhyme_grid, lines=14, words<=10: PASS, fpMatch: PASS
   Shot maryam-heydarzadeh.general.26 (مریم حیدرزاده): form=colloquial, origin=boundary_model, lines=94, words<=10: PASS, fpMatch: PASS
   Shot ahmadreza-ahmadi.general.18 (احمدرضا احمدی): form=free_verse, origin=boundary_model, lines=33, words<=10: PASS, fpMatch: PASS
   Shot shahriar.general.72 (شهریار): form=classical_rhymed, origin=rhyme_grid, lines=24, words<=10: PASS, fpMatch: PASS
   Shot 1 هنوز count: 8/14 (expect 8/14 in 7 couplets matla)
   Shots 2 & 3 glue invariants: PASS (0 glue starts, 0 dangling ends)
   Shot 4 beyts count: 12
   Shot 4 hemistich balance (abs diff <= 3): PASS
   Hafez Ghazal 9: form=classical_rhymed, origin=separators, beyts=10
   Hafez Ghazal 9 lines starting with «را»: 0 (target: 0)
   Evaluating benchmark sample300 (300 works)...
   sample300 Results:
   - Downstream Glue starts: 0
   - Downstream Dangling ends: 0
   - Fingerprint errors: 0 (Preservation: 100.00%)
   - Median latency: 0.001 ms (target <= 5.0 ms)
   - Typeset ReDoS test (25k chars): 2.545 ms (target < 50 ms)
   ```

6. **Flat Hafez Ghazal 9 (Unstructured Rhyme Grid Execution)**:
   ```
   Flat Hafez Ghazal 9: form=classical_rhymed, origin=rhyme_grid, beyts=10
   Flat Hafez Ghazal 9 lines starting with «را»: 0
   ```

---

## 2. Logic Chain

1. **Absence of Hardcoded Cheating (Observations 1.1.1 & 1.2.5)**:
   - Observation 1.1.1 demonstrates zero matches for poet names, titles, test conditions, or environment variables in `packages/poem/src/`.
   - Observation 1.2.5 demonstrates that Shot #1 through Shot #4, Hafez Ghazal 9, and the 300 benchmark works pass their behavioral and invariant checks dynamically.
   - Therefore, the codebase contains zero hardcoded fixtures, sniffing, or cheating shortcuts.

2. **Genuine Algorithmic Pipeline Implementation (Observations 1.1.2 & 1.2.1)**:
   - Observation 1.1.2 confirms that S0–S8 are implemented with complete mathematical and algorithmic formulations (DP matrices, regular languages, Levenshtein distance, Platt scaling).
   - Observation 1.2.1 confirms that all 42 unit and property-based tests in `packages/poem` pass green.
   - Therefore, the pipeline represents an authentic, genuine implementation without facades.

3. **Authenticity of Model S4 (Observations 1.1.3, 1.1.2, & 1.2.5)**:
   - Observation 1.1.3 confirms the presence of non-trivial SGD coefficients and valid Platt scaling parameters in `weights.json`.
   - Observation 1.1.2 confirms that `boundary-model.ts` evaluates these weights via dot product and Platt sigmoid inference to construct transition probabilities in a dynamic programming decoder.
   - Therefore, the S4 logistic regression model is authentic and unbypassed.

4. **Preservation of Canonical Text (Observations 1.1.2, 1.2.5, & 1.2.2)**:
   - Observation 1.1.2 shows that S7 stores typo suggestions exclusively in `typos` and S8 creates a distinct `typeset` field while leaving `stanzas` containing the original canonical words.
   - Observation 1.2.5 verifies that the letter-fingerprint preservation rate across all 300 benchmark works and all 4 golden shots is exactly 100.00% (0 mismatches).
   - Therefore, the letter-fingerprint preservation invariant is strictly satisfied.

5. **AGENTS.md Governance & Quality Compliance (Observations 1.1.4 & 1.2.4)**:
   - Observation 1.1.4 verifies that `lib/changelog.ts` has version `"۳.۱۷.۱"`, Gregorian ISO date, Solar Hijri date, typed entries, active voice, and zero emojis.
   - Observation 1.1.4 confirms zero emojis across `packages/poem/` and `lib/changelog.ts`.
   - Therefore, AGENTS.md rules are fully satisfied.

---

## 3. Caveats

No caveats. All edge cases and boundary conditions identified in Iteration 1 (radif «را», typeset ReDoS, prose aphorisms with repeated words, and OCR-detached prefixes/suffixes) have been empirically verified as fully resolved in Iteration 2.

---

## 4. Conclusion

The Structure Engine v2 implementation in `packages/poem/src/` and `lib/changelog.ts` is authentic, robust, free of hardcoded shortcuts or facades, preserves 100.00% letter fingerprints, and complies strictly with AGENTS.md rules.

Final Forensic Verdict: **CLEAN**

---

## 5. Verification Method

To independently reproduce the forensic audit results:

1. **Verify Packages Unit Tests**:
   ```bash
   bun test packages/poem
   ```
   *Expected*: 42 pass, 0 fail.

2. **Verify Acceptance Fixtures E2E**:
   ```bash
   bun test tests/e2e/tier1-features/acceptance-fixtures.test.ts
   ```
   *Expected*: 6 pass, 0 fail.

3. **Verify Full Monorepo Test Suite**:
   ```bash
   bun test
   ```
   *Expected*: 287 pass, 0 fail across 38 test files.

4. **Verify TypeScript Types**:
   ```bash
   bun run --filter @persian-quote/poem typecheck
   ```
   *Expected*: Zero errors, exit code 0.

5. **Verify Typeset ReDoS Performance**:
   ```bash
   bun -e '
   import { typesetLine } from "./packages/poem/src/typeset";
   const t0 = performance.now();
   typesetLine("الف".repeat(25000));
   console.log("25k char time:", (performance.now() - t0).toFixed(3), "ms");
   '
   ```
   *Expected*: Runtime $\le 5$ ms (well below 50 ms limit).

6. **Verify Golden Shots and Benchmark Invariants**:
   ```bash
   bun -e '
   import fs from "node:fs";
   import { structurePoem, letterFingerprint } from "./packages/poem/src";
   const sample = fs.readFileSync("./data/golden/sample300.jsonl", "utf8").trim().split("\n").map(l => JSON.parse(l));
   let err = 0;
   for (const s of sample) {
     const t = s.text || s.text_persian;
     const r = structurePoem(t);
     if (letterFingerprint(t) !== letterFingerprint(r.stanzas.flat().join(" "))) err++;
   }
   console.log("Fingerprint errors (expect 0):", err);
   '
   ```
   *Expected*: Exactly 0 errors.
