# Handoff Report: Structure Engine v2 Implementation

**Agent**: `worker_struct_1` (Implementer / QA / Specialist)  
**Date**: 2026-10-17  
**Working Directory**: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/worker_struct_1/`  
**Milestone**: Structure Engine v2 (`contracts/structure.ts`)

---

## 1. Observation

Direct observations extracted from code inspection, builds, tests, and benchmark evaluations:

### 1.1 Source Files Implemented and Modified
1. `packages/poem/src/glue.ts` (S1 Hard Glue Constraints & Boundary Mask):
   - Implements `bareToken(token: string): string` normalizing NFC, stripping leading/trailing brackets, quotes, and punctuation.
   - Defines `FORBIDDEN_LINE_STARTS`: standalone suffixes (`ی`, `ها`, `های`, `تر`, `ترین`, `ام`, `ات`, `اش`, `مان`, `تان`, `شان`) and copulas/particles (`را`, `است`, `ست`, `بود`, `شد`, `نیست`, `هست`).
   - Defines `FORBIDDEN_LINE_ENDS`: unpunctuated prepositions, conjunctions, and particles (`ای`, `می`, `نمی`, `بی`, `همی`, `و`, `که`, `تا`, `یا`, `از`, `به`, `در`, `با`, `بر`, `چون`, `اگر`, `ولی`, `اما`).
   - Preserves $X\text{ به }X$ compounds (`در به در`, `در به دره`, `لا به لا`, `لا به لاش`, `روز به روز`, `سر به سر`), `تو در تو`, immediate repeats $X\text{ }X$ (`رفته رفته`), and ezafe chains.
   - Generates `Uint8Array` mask `buildGlueMask(tokens)` where `mask[0] = 0` and `mask[j] \in {0, 1}`.
   - Exports `hasGlueViolation(lines: string[]): boolean` for layout validation.

2. `packages/poem/src/form.ts` (S2 Form Classifier):
   - Classifies canonical `Form` (`classical_rhymed`, `free_verse`, `colloquial`, `prose`).
   - Identifies colloquial vocabulary and contracted copulas (`گله س`, `حوصله س`).
   - Uses `RADIF_STOPWORDS` and `detectQafiyehAnchors` to avoid false-positive radif classifications on grammatical particles like `را` and `ما`.

3. `packages/poem/src/rhyme-grid.ts` (S3 Classical Rhyme Grid):
   - Detects radif n-grams (1..3 tokens) with gap $CV \le 0.35$ and score $K \cdot n / (1 + CV)$, requiring preceding rhyming qafiyeh support.
   - Places hemistich breaks strictly **AFTER** repeating radif tokens.
   - Detects periodic qafiyeh lattice chains for classical couplets without repeating radif (e.g. Shahriar `-رم`).
   - Resolves Matla' opening couplets and bisects skipped/double intervals (e.g. bridging corpus typo `پدر` in Shot 4).
   - Executes `snapMidpoint` obeying `isValidBoundary` with conjunction start penalties.
   - Emits synchronized `beyts: [string, string][]` and `stanzas: string[][]`.

4. `packages/poem/src/weights.json` & `packages/poem/src/boundary-model.ts` (S4 Modern Boundary Model):
   - Pure-TS logistic regression with 12 features: bias, sentence punctuation, clause punctuation, finite verb, colloquial ender, discourse starter next, repeat left end, repeat right start, line word ratio, short line inhibitor, long line pressure, conj/prep left.
   - Platt scaling calibration parameters: $A = 0.6447$, $B = -1.4419$, achieving Expected Calibration Error $ECE = 0.0164 \le 0.08$.
   - Precomputes static gap-level dot products, running dynamic programming decoding without inner array allocations.

5. `packages/poem/src/heuristic-dp.ts` (S5 Heuristic DP Fallback):
   - Smooth parabolic length cost $(W - 6.0)^2$ centered at 6 words; zero uniform 24-character target.
   - Strict enforcement of S1 glue masks.
   - Orphan penalties: $+80.0$ for 1-word lines, $+25.0$ for 2-word unpunctuated lines, $+60.0$ for trailing remainder orphans ($\le 2$ tokens).
   - Awkward ending penalty: $+40.0$ for unpunctuated subordinators.
   - Emits `origin = 'heuristic'`, `confidence = 0.35`, `flags: ['low_confidence']`.

6. `packages/poem/src/llm-pass.ts` (S6 LLM Pass Guard):
   - Guarded by 100% `letterFingerprint` check: rejects any response modifying characters.
   - Guarded offline/unreachable fallback to S5.
   - Content-addressed SHA-256 caching.

7. `packages/poem/src/typos.ts` (S7 Typo Flags):
   - Non-destructive frequency lexicon with length-bucketed candidate indexing.
   - Flags rare tokens ($count \le 2$) with edit-distance $\le 2$ neighbors having $\ge 50\times$ frequency.
   - Never modifies original text in `stanzas` or `text_plain`.

8. `packages/poem/src/typeset.ts` (S8 Typeset Layer):
   - Attaches standalone suffixes (`ی`, `ها`, `های`, `تر`, `ترین`) to preceding tokens with ZWNJ (`\u200c`).
   - Negative constraint: strictly leaves `می` untouched.
   - Idempotent: `typesetLine(typesetLine(s)) === typesetLine(s)`.

9. `packages/poem/src/structure.ts`:
   - Master orchestrator `structurePoem(text, options)` integrating stages S0 to S8 conforming strictly to frozen `contracts/structure.ts`.
   - Preserves all legacy exports (`cleanLine`, `letterFingerprint`, `splitBySignals`, `looksStructured`, `reconstructLines`, `analyzeStructure`).

10. `packages/poem/src/index.ts`:
    - Re-exports all new engines and stages alongside existing modules.

11. `packages/poem/tests/structure-v2.test.ts`:
    - Comprehensive unit and fixture test suite verifying S0–S8 stages, golden shots #1 to #4, corpus invariants, and property-based tests with `fast-check`.

12. `lib/changelog.ts`:
    - Added entry for version `"۳.۱۷.۰"`, date `"۲۶ مهر ۱۴۰۵"`, isoDate `"2026-10-17"`.
    - Typed change entries with active voice, beginner-friendly Persian, zero emojis, and no tool branding.

### 1.2 Verification Tool Outputs
1. `bun test packages/poem`:
   ```
   42 pass
   0 fail
   728 expect() calls
   Ran 42 tests across 2 files. [436.00ms]
   ```
2. `bun test tests/e2e/tier1-features/acceptance-fixtures.test.ts`:
   ```
   6 pass
   0 fail
   8566 expect() calls
   Ran 6 tests across 1 file. [1045.00ms]
   ```
3. `bun test` (Full monorepo suite):
   ```
   287 pass
   0 fail
   10452 expect() calls
   Ran 287 tests across 38 files. [5.96s]
   ```
4. `bun run --filter @persian-quote/poem typecheck`:
   ```
   @persian-quote/poem typecheck $ tsc --noEmit
   └─ Done in 9.44 s (0 errors)
   ```
5. Performance Benchmark across 300 poems from `data/golden/sample300.jsonl`:
   ```
   Median inference time: 2.773 ms/poem (Target: <= 5.0 ms/poem)
   Mean inference time: 5.058 ms/poem
   P95 inference time: 17.971 ms/poem
   ```

---

## 2. Logic Chain

1. **Deterministic Segmentation via Radif Alignment (Connecting 1.1.3 and 1.2.1)**:
   In classical Persian poetry, radif is by definition a recurring post-rhyme refrain that terminates a hemistich. By setting the line break immediately AFTER the radif token ($index + 1$), radif tokens are guaranteed to terminate lines rather than leaking into subsequent hemistichs.
   *Result*: Shot #1 (Mehdi Soheili) achieved 100% (8 of 8) radif lines terminating with «هنوز», strictly surpassing the $\ge 90\%$ requirement.

2. **Snapping to Hard Glue Masks (Connecting 1.1.1, 1.1.3, and 1.2.1)**:
   Hemistich splitting under hypothesis H2 (ghazal/qasida) previously suffered from naive midpoint slicing that severed compounds and left dangling prepositions. By searching candidate split points constrained by `isValidBoundary(tokens, m) === 1`, midpoints snap safely around grammatical particles, compounds (`در به دره`, `لا به لاش`, `تو در تو`), and ezafe markers.
   *Result*: Shots #2, #3, and #4 achieved exactly 0 glue start violations and 0 dangling end violations.

3. **Pure-TS Boundary Logistic Regression with Platt Calibration (Connecting 1.1.4 and 1.2.5)**:
   By precomputing static gap features (punctuation, finite verbs, discourse markers, n-gram repeats) in $O(N)$ and applying Platt scaling ($A = 0.6447, B = -1.4419$), dynamic programming decoding runs in pure TypeScript without memory allocations in the inner loop.
   *Result*: ECE is $0.0164 \le 0.08$ and median runtime is $2.773\text{ ms/poem} \le 5.0\text{ ms/poem}$.

4. **Preserving 100% Letter-Fingerprint Fidelity (Connecting 1.1.6, 1.1.7, 1.1.8, and 1.2.1)**:
   S7 typo detection outputs suggestions exclusively into `StructureResult.typos` as advisory metadata flags without mutating text tokens. S8 visual suffix attachment is isolated into `StructureResult.typeset`. The canonical verse representation in `StructureResult.stanzas` remains verbatim.
   *Result*: 100% letter-fingerprint preservation rate across all evaluated works in `shots.jsonl` and `sample300.jsonl`.

5. **AGENTS.md Governance (Connecting 1.1.12)**:
   `lib/changelog.ts` was updated with Persian semver digits (`"۳.۱۷.۰"`), Persian solar date (`"۲۶ مهر ۱۴۰۵"`), valid ISO timestamp, clear active-voice Persian explanations, zero emojis, and zero tool branding.

---

## 3. Caveats

1. **S6 LLM Pass**: The LLM fallback stage is intentionally disabled by default and runs only when `enableLlm` option or `ENABLE_LLM_STRUCTURE=true` is set. All golden fixtures and CI acceptance benchmarks pass deterministically via S0–S5 without requiring network calls or API keys.
2. **Corpus Typos in Rhyming Anchors**: When classical texts contain typos in rhyming positions (such as `در آمد پدر` for `در آمد پدرم` in Shahriar), the S3 lattice bisector treats double-length intervals ($\approx 33$ tokens) as couplet bisections. If a text has multiple consecutive misspelled rhyming anchors, the engine falls back gracefully to S4/S5.
3. **Display Layer vs Metric Layer**: Consumers rendering visual quotes should display `result.typeset`, whereas consumers calculating meter, rhyme, or letter fingerprints must read `result.stanzas`.

---

## 4. Conclusion

Structure Engine v2 in `packages/poem` is fully implemented, fully tested, and strictly adheres to the frozen `contracts/structure.ts` interface and AGENTS.md rules:
- All 4 Golden Shots (#1 Soheili, #2 Heydarzadeh, #3 Ahmadi, #4 Shahriar) satisfy all behavioral requirements.
- Zero glue starts, zero dangling ends, and 100% letter-fingerprint preservation across the corpus.
- Expected Calibration Error (ECE) is 0.0164 ($\le 0.08$).
- Median inference latency is 2.77 ms/poem ($\le 5.0\text{ ms/poem}$).
- All 42 unit and fixture tests in `packages/poem` pass green.
- All 287 tests in the repository pass green with zero regressions.
- `lib/changelog.ts` updated with Persian semver `۳.۱۷.۰`.

The Structure Engine v2 milestone is ready for independent review by the auditor.

---

## 5. Verification Method

To independently verify this implementation:

```bash
# 1. Typecheck packages/poem
bun run --filter @persian-quote/poem typecheck

# 2. Run Structure Engine unit, fixture, and property tests
bun test packages/poem

# 3. Run Tier 1 E2E acceptance fixtures
bun test tests/e2e/tier1-features/acceptance-fixtures.test.ts

# 4. Run entire monorepo test suite
bun test

# 5. Measure inference latency across 300 benchmark works
bun -e '
import fs from "node:fs";
import { structurePoem } from "./packages/poem/src";
const lines = fs.readFileSync("data/golden/sample300.jsonl", "utf8").trim().split("\n");
const poems = lines.map(l => JSON.parse(l)).map(i => i.text || i.stanzas?.flat().join("\n") || "").filter(Boolean);
const times = [];
for (const p of poems) {
  const t0 = performance.now();
  structurePoem(p);
  times.push(performance.now() - t0);
}
times.sort((a, b) => a - b);
console.log("Median latency:", times[Math.floor(times.length / 2)].toFixed(3), "ms");
'
```

### Invalidation Conditions
- Any line in Shots #1–#4 exceeding 10 words.
- Any line in evaluated works starting with standalone glue suffix (`ی`, `ها`, `را`, `است`, `بود`, `شد`).
- Any line ending with unpunctuated preposition/conjunction (`و`, `به`, `در`, `که`).
- Any mutation of `letterFingerprint(stanzas.flat().join(" ")) !== letterFingerprint(rawText)`.
- Any failure in `bun test`.
