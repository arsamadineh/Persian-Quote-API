# Forensic Integrity Audit Report: Structure Engine v2

**Auditor**: `auditor_struct_1` (Forensic Auditor / Critic / Specialist)  
**Date**: 2026-10-17  
**Working Directory**: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/auditor_struct_1/`  
**Target Deliverable**: Structure Engine v2 (`packages/poem/src/` and `lib/changelog.ts`)  
**Integrity Mode**: Development (Authoritative request: `ORIGINAL_REQUEST.md` line 393)  

---

## Forensic Audit Report

**Work Product**: `packages/poem/src/` and `lib/changelog.ts`  
**Profile**: General Project (Integrity Forensics)  
**Verdict**: **CLEAN**  

### Phase Results
- **Hardcoded Test Fixture Detection**: **PASS** — Zero fixture strings from `shots.jsonl`, zero poet names, zero titles, and zero conditional cheating hacks found in `packages/poem/src/`.
- **Facade Implementation Detection**: **PASS** — Stages S0 through S8 implemented with genuine computational logic; zero dummy functions, zero placeholder constants, zero `NotImplementedError` stubs.
- **Machine Learning Authenticity (S4)**: **PASS** — `boundary-model.ts` executes authentic 12-feature dot-product inference against SGD-trained weights in `weights.json`, calibrated with Platt scaling ($A = 0.6447, B = -1.4419$), achieving $ECE = 0.0164 \le 0.08$. Zero short-circuiting or simulated probabilities.
- **Letter-Fingerprint Preservation**: **PASS** — Empirical verification demonstrated 100% preservation ($300/300$ works in `sample300.jsonl` and $4/4$ golden shots). S7 typo flags are purely advisory metadata; S8 typeset modifications are strictly isolated to `typeset` without altering canonical `stanzas`.
- **AGENTS.md Compliance**: **PASS** — `lib/changelog.ts` contains valid Persian semver (`"۳.۱۷.۰"`), Gregorian `isoDate` (`"2026-10-17"`), Persian Solar date (`"۲۶ مهر ۱۴۰۵"`), strictly valid change types (`"added"` and `"fixed"`), active-voice Persian text without marketing superlatives or automated clichés, and zero emojis across `packages/poem/` and `lib/changelog.ts`.
- **Independent Test Execution**: **PASS** — All 42 unit/contract tests in `packages/poem` pass green (501 ms), Tier 1 E2E fixtures pass green (1283 ms), and entire monorepo suite (287 tests across 38 files) passes green (7.23 s) with zero typecheck errors.

---

## 1. Observation

### 1.1 Source Code Inspection & Cheating Checks
1. **Zero Fixture Strings in Source**:
   - Grep searches for poet names (`مهدی سهیلی`, `مریم حیدرزاده`, `احمدرضا احمدی`, `شهریار`), titles (`زنده ی مرگ آلود`, `مزاحم همیشگی`, `هفده`), and IDs in `packages/poem/src/` returned zero matches.
   - The only occurrences of poet names were two non-functional developer comments in `rhyme-grid.ts` lines 355 (`// In Qafiyeh mode (e.g. Shot 4 Shahriar):`) and 405 (`// Radif mode (e.g. Shot 1 Mehdi Soheili)`).
   - Zero cheating conditionals (e.g., matching input length, title substring, or author parameter) were found across any file in `packages/poem/src/`.

2. **Genuine Multi-Stage Pipeline Implementation**:
   - `packages/poem/src/glue.ts`: Generates a `Uint8Array` mask of length $N$ where `mask[0] = 0`. Implements `FORBIDDEN_LINE_STARTS` (17 tokens: detached suffixes `ی`, `ها`, `های`, `تر`, `ترین`, clitics `ام`, `ات`, `اش`, `مان`, `تان`, `شان`, copulas `را`, `است`, `ست`, `بود`, `شد`, `نیست`, `هست`) and `FORBIDDEN_LINE_ENDS` (17 tokens: verbal prefixes and conjunctions). Preserves $X\text{ به }X$ and `تو در تو` compounds using algorithmic stem matching (`lightStem`).
   - `packages/poem/src/form.ts`: Dynamically classifies `Form` by scanning colloquial lexemes/copulas (`countColloquialMarkers`), radif periodicity via sliding n-grams ($n \in \{1, 2, 3\}$) with gap coefficient of variation ($CV \le 0.35$), and periodic qafiyeh chains.
   - `packages/poem/src/rhyme-grid.ts`: Identifies radif and qafiyeh periodicity using a dynamic programming lattice chain selector. Bisects skipped intervals ($\ge 22$ tokens) to tolerate occasional OCR typos, and snaps couplet midpoints using `snapMidpoint` constrained by `mask[m] === 1`.
   - `packages/poem/src/boundary-model.ts`: Implements pure-TS logistic regression over 12 lexical/syntactic features with precomputed static gap dot products and a dynamic programming decoder (`Float64Array(N + 1)`). Applies Platt scaling formula `1.0 / (1.0 + Math.exp(-(plattA * z + plattB)))`.
   - `packages/poem/src/heuristic-dp.ts`: Implements a fallback dynamic programming decoder centered at a smooth parabolic length cost $(W - 6.0)^2$ with orphan penalties ($+80.0$ for 1-word lines, $+60.0$ for trailing remainder orphans).
   - `packages/poem/src/llm-pass.ts`: Offline guard fallback to S5 with SHA-256 caching and `letterFingerprint` validation guard.
   - `packages/poem/src/typos.ts`: Non-destructive frequency lexicon with length-bucketed candidate indexing, flagging rare tokens ($count \le 2$) with edit-distance $\le 2$ neighbors having $\ge 50\times$ frequency.
   - `packages/poem/src/typeset.ts`: Idempotent loop attaching standalone suffixes (`ی`, `ها`, `های`, `تر`, `ترین`) to preceding tokens with ZWNJ (`\u200c`), strictly leaving `می` untouched.
   - `packages/poem/src/structure.ts`: Master pipeline orchestrating S0–S8 conforming strictly to frozen `contracts/structure.ts`.

3. **Machine Learning Model Weights (`weights.json`)**:
   - `num_features`: 12.
   - Weights array contains authentic floating point coefficients:
     `[-5.0135, 4.1015, -0.0326, 0.7460, -0.0337, 0.2693, 0.4507, 0.1387, 6.9664, 0.2397, -1.6443, -2.8108]`.
   - Calibration parameters: `A: 0.6447`, `B: -1.4419`, `ece: 0.0164` (strictly $\le 0.08$).

4. **Repository Governance & AGENTS.md Conformance**:
   - `lib/changelog.ts`:
     - Top entry version: `"۳.۱۷.۰"` (Persian digits, valid minor increment from `"۳.۱۶.۰"`).
     - `isoDate`: `"2026-10-17"`.
     - `date`: `"۲۶ مهر ۱۴۰۵"`.
     - Entries typed with `"added"` and `"fixed"`, written in active-voice beginner-friendly Persian.
     - Zero AI buzzwords, zero tool branding, zero marketing superlatives.
   - Emoji Audit: Executed AST regex check across all `.ts` files in `packages/poem/` and `lib/changelog.ts`: exactly **0** emojis found.

### 1.2 Empirical Tool Outputs

1. **Typecheck (`bun run --filter @persian-quote/poem typecheck`)**:
   ```
   @persian-quote/poem typecheck $ tsc --noEmit
   └─ Done in 7.46 s
   ```

2. **Structure Engine Unit & Fixture Tests (`bun test packages/poem`)**:
   ```
   bun test v1.4.3 (c6da4a4d3)
   42 pass
   0 fail
   728 expect() calls
   Ran 42 tests across 2 files. [501.00ms]
   ```

3. **Acceptance Fixtures E2E (`bun test tests/e2e/tier1-features/acceptance-fixtures.test.ts`)**:
   ```
   bun test v1.4.3 (c6da4a4d3)
   6 pass
   0 fail
   8566 expect() calls
   Ran 6 tests across 1 file. [1283.00ms]
   ```

4. **Monorepo Complete Test Suite (`bun test`)**:
   ```
   bun test v1.4.3 (c6da4a4d3)
   287 pass
   0 fail
   10452 expect() calls
   Ran 287 tests across 38 files. [7.23s]
   ```

5. **Empirical Evaluation on `data/golden/sample300.jsonl` (300 benchmark works)**:
   ```
   === EMPIRICAL EVALUATION RESULTS ===
   Evaluated poems: 300
   Glue start violations: 16
   Dangling end violations: 30
   Fingerprint mismatches: 0
   Preservation rate: 100.00%
   Median inference latency: 4.377 ms (Target <= 5.0 ms)
   Mean inference latency: 8.489 ms
   P95 inference latency: 29.863 ms
   ```

---

## 2. Logic Chain

1. **Authenticity of Implementation over Facade (Connecting 1.1.1, 1.1.2, and 1.2.2)**:
   - Observation 1.1.1 confirms zero hardcoded strings from test fixtures in source code.
   - Observation 1.1.2 confirms that each stage (S0 through S8) executes generalized linguistic algorithms (regular grammar sets, Levenshtein distance, n-gram periodicities, dynamic programming matrices).
   - Therefore, the implementation is authentic and non-facade.

2. **Model Integrity & Numerical Inference (Connecting 1.1.3 and 1.2.2)**:
   - Observation 1.1.3 demonstrates that `weights.json` contains 12 non-trivial SGD coefficients and valid Platt scaling parameters.
   - Observation 1.1.2 demonstrates that `boundary-model.ts` evaluates these weights via dot product and passes the result through the sigmoid Platt calibration formula to determine transition probabilities in a DP matrix.
   - Therefore, the ML boundary model is authentic and un-cheated.

3. **Invariance of Text Representation (Connecting 1.1.2 and 1.2.5)**:
   - Observation 1.1.2 confirms that S7 only populates `typos` and S8 only populates `typeset`.
   - Observation 1.2.5 demonstrates empirical 100.00% ($300/300$) letter-fingerprint preservation across the evaluation benchmark.
   - Therefore, the letter-fingerprint preservation invariant is strictly satisfied.

4. **Compliance with Repository Rules (Connecting 1.1.4 and 1.2.4)**:
   - Observation 1.1.4 confirms that `lib/changelog.ts` is updated with version `"۳.۱۷.۰"` adhering strictly to AGENTS.md rules.
   - Observation 1.1.4 confirms zero emojis anywhere in the target work product.
   - Therefore, AGENTS.md governance requirements are fully satisfied.

---

## 3. Caveats & Adversarial Findings

During adversarial stress-testing across `sample300.jsonl` and edge-case fuzzing, 4 specific algorithmic boundary conditions were discovered. These do not constitute integrity violations (cheating/facade), but represent genuine model limitations that must be addressed in subsequent iterations:

1. **Radif Stopwords Collision in S3 (`rhyme-grid.ts:16`)**:
   - `RADIF_STOPWORDS` contains `'را'`. For classical ghazals where the radif is legitimately the single word `«را»` (e.g. Hafez Ghazal 9: *رونق عهد شباب است دگر بستان را*), the radif detector skips `«را»` and detects qafiyeh on `-ان`. The lattice slicer then sets anchors on the rhyming words (`بستان`, `الحان`, `ریحان`), leaving `«را»` at the start of the next line, producing 10 lines starting with `«را»`.
   - *Mitigation*: Allow single-token radif for `«را»` if preceded by a rhyming qafiyeh token with $CV \le 0.35$.

2. **Prose Misclassification Routing in S2 (`form.ts:130`)**:
   - In `classifyForm()`, prose punctuation density check (Step 4) is evaluated *after* radif and qafiyeh periodicity (Steps 2 & 3). Prose texts containing repeated words (e.g. Arthur Schopenhauer's quote repeating `«ملال»` 4 times) trigger qafiyeh periodicity and get misclassified as `classical_rhymed`, resulting in fragmented couplet slicing.
   - *Mitigation*: Evaluate the prose check ($N \ge 30$ and punctuation density $\ge 0.08$) prior to classical lattice detection.

3. **S0 Pre-Structured Filter Sensitivity (`structure.ts:84`)**:
   - `looksStructured()` includes `if (hasGlueViolation(flat)) return false;`. Classical poems that legitimately begin a hemistich with a copula (e.g. *هست خاکی که به آبی نخرد طوفان را*) or end a hemistich with an unpunctuated conjunction (e.g. *خوش باش ولی*) get rejected by S0 and forced into downstream S3/S4/S5 segmenters.
   - *Mitigation*: Restrict `hasGlueViolation` in `looksStructured` to standalone clitic suffixes (`ی`, `ها`, `های`, `تر`, `ترین`) rather than full verbs.

4. **Unicode Combining Mark Canonical Reordering during Fast-Check Fuzzing**:
   - Fuzzing with artificial sequences containing Tatweel (`U+0640`) placed between uncomposed combining tanwins (`U+064C` and `U+064B`) triggers Canonical Combining Class reordering under Unicode NFC when Tatweel is stripped. Real Persian text in the corpus does not contain this artifact.

---

## 4. Conclusion

The Structure Engine v2 implementation in `packages/poem` and documentation in `lib/changelog.ts` is **CLEAN**.

- **Zero hardcoded test fixtures or cheating conditionals**.
- **Authentic algorithmic implementations** across all stages S0 to S8.
- **Authentic machine learning model** with Platt calibration and $ECE = 0.0164 \le 0.08$.
- **100% letter-fingerprint preservation** across all 300 benchmark poems.
- **Strict AGENTS.md compliance** with Persian semver `"۳.۱۷.۰"` and zero emojis.
- All unit, integration, and monorepo regression tests pass green (287/287 pass).

**Final Verdict**: **CLEAN**

---

## 5. Verification Method

To independently reproduce the forensic verification:

```bash
# 1. Verify TypeScript type safety
bun run --filter @persian-quote/poem typecheck

# 2. Run Structure Engine v2 unit and fixture tests
bun test packages/poem

# 3. Run Tier 1 E2E acceptance fixtures
bun test tests/e2e/tier1-features/acceptance-fixtures.test.ts

# 4. Run entire monorepo test suite (verify zero regressions)
bun test

# 5. Verify zero hardcoded test strings in source
bun -e '
import fs from "node:fs";
const files = fs.readdirSync("packages/poem/src").filter(f => f.endsWith(".ts"));
const banned = ["مهدی سهیلی", "مریم حیدرزاده", "احمدرضا احمدی", "شهریار", "مزاحم همیشگی", "زنده ی مرگ آلود"];
for (const f of files) {
  const content = fs.readFileSync(`packages/poem/src/${f}`, "utf8");
  for (const b of banned) {
    if (content.includes(b)) throw new Error(`Found banned fixture ${b} in ${f}`);
  }
}
console.log("PASS: Zero hardcoded fixture strings in packages/poem/src/");
'

# 6. Verify zero emojis across packages/poem and lib/changelog.ts
bun -e '
import fs from "node:fs";
const emojiRegex = /[\p{Extended_Pictographic}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
for (const f of fs.readdirSync("packages/poem/src")) {
  if (emojiRegex.test(fs.readFileSync(`packages/poem/src/${f}`, "utf8"))) throw new Error(`Emoji in ${f}`);
}
if (emojiRegex.test(fs.readFileSync("lib/changelog.ts", "utf8"))) throw new Error("Emoji in changelog.ts");
console.log("PASS: Zero emojis found.");
'
```

### Invalidation Conditions
- Any occurrence of hardcoded fixture strings or conditionals matching specific poem titles or authors in `packages/poem/src/`.
- Any failure in `bun test packages/poem` or `bun test`.
- Any mutation of `letterFingerprint` on canonical verse lines.
- Any presence of emojis in `packages/poem/src/` or `lib/changelog.ts`.
