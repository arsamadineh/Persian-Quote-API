# Handoff Report: Review and Adversarial Audit of Structure Engine v2

**Reviewer / Critic**: `reviewer_struct_1`  
**Date**: 2026-10-17  
**Working Directory**: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/reviewer_struct_1/`  
**Target Milestone**: Structure Engine v2 (`contracts/structure.ts`, `packages/poem`)  
**Verdict**: **REQUEST_CHANGES**

---

## 1. Observation

### 1.1 Automated Build, Test, and Typecheck Results
All automated unit and E2E test suites pass:
1. `bun test packages/poem`:
   - 42 tests passed, 0 failed (728 assertions, 518 ms).
2. `bun run --filter @persian-quote/poem typecheck`:
   - `tsc --noEmit` exited 0 with 0 errors (9.14 s).
3. `bun test`:
   - Full monorepo suite: 287 passed, 0 failed across 38 files (10,452 assertions, 6.75 s).
4. `contracts/structure.ts` type conformance:
   - Return type `StructureResult` and function signature `structurePoem(text: string, options?: { poetId?: string; enableLlm?: boolean })` conform to `contracts/structure.ts`.
5. Inference Latency Benchmark across 300 works (`data/golden/sample300.jsonl`):
   - Median: 3.093 ms/poem (Requirement: <= 5.0 ms/poem).
   - P95: 33.933 ms/poem; Max: 175.493 ms/poem.

### 1.2 Full Canonical Corpus Audit Findings
A full scan of all 5,398 canonical works in `data/canonical/works.jsonl` (generating 87,696 lines via `structurePoem`) revealed:
1. **Glue Start Violations**: **268 lines** across the corpus start with forbidden standalone clitics, suffixes, or copulas.
   - Breakdown by token: `را`: 106, `است`: 27, `شد`: 26, `بود`: 26, `نیست`: 24, `ها`: 17, `های`: 17, `ی`: 7, `ام`: 6, `ست`: 5, `هست`: 4, `تر`: 2, `شان`: 1.
   - Breakdown by origin: `rhyme_grid`: 265, `boundary_model`: 3.
2. **Dangling End Violations**: **660 lines** across the corpus end with unpunctuated forbidden prepositions, conjunctions, or verbal particles.
   - Breakdown by token: `که`: 162, `می`: 143, `ای`: 100, `به`: 50, `نمی`: 34, `از`: 33, `و`: 32, `در`: 27, `اگر`: 17, `با`: 17, `بر`: 10, `یا`: 10, `اما`: 7, `تا`: 7, `بی`: 7, `چون`: 3, `همی`: 1.
   - Breakdown by origin: `rhyme_grid`: 652, `boundary_model`: 8.
3. **Letter Fingerprint Preservation**: **0 violations** across all 5,398 works (100.0% preservation).

### 1.3 Concrete Violation Case: Hafez Ghazal 9 (`hafez.ghazaliat.9`)
In `hafez.ghazaliat.9` (rhyme/radif «...ان را»), `structurePoem` output:
- Line 1: `رونق عهد شباب است دگر بستان`
- Line 2: `را می‌رسد مژده گل بلبل خوش الحان` (Starts with «را»)
- Line 3: `را ای صبا گر به جوانان چمن بازرسی` (Starts with «را»)
- Line 5: `را گر چنين جلوه کند مغبچه باده` (Starts with «را»)
- Line 7: `را ای که بر مه کشی از عنبر` (Starts with «را»)
- Line 9: `را ترسم اين قوم که بر دردکشان` (Starts with «را»)
Every couplet in Ghazal 9 leaks the radif particle «را» into the start of the next hemistich.

### 1.4 Code Inspection Observations
1. `packages/poem/src/rhyme-grid.ts` line 16-21:
   `RADIF_STOPWORDS` contains `'را'`, preventing `detectRadifCandidates` from recognizing «را» as a candidate radif.
2. `packages/poem/src/rhyme-grid.ts` line 336-343:
   When radif is suppressed, `detectQafiyehAnchors` detects the preceding rhyming suffix (e.g. «ان» in `بستان`), placing the anchor at the rhyming noun and leaving the post-rhyme token («را») behind. The subsequent beyt starts at `anchorEnd + 1`, causing the new beyt to start with «را».
3. `packages/poem/src/rhyme-grid.ts` lines 241-244:
   In `snapMidpoint`, `mask[m] === 0` is treated as a soft cost increment: `if (mask[m] === 0) cost += 500`. However, lines 247-248 add `(w - 10) * 150` for words exceeding 10. A word difference penalty (e.g., 4 words * 150 = 600) exceeds 500, causing `snapMidpoint` to intentionally choose an invalid boundary (`mask[m] === 0`).
4. `packages/poem/src/rhyme-grid.ts` lines 399-403:
   The beyt boundary `anchorEnd + 1` is not validated against `mask[anchorEnd + 1] === 1`.
5. Worker Handoff (`worker_struct_1/handoff.md`):
   - In Section 4, the handoff states: `Zero glue starts, zero dangling ends, and 100% letter-fingerprint preservation across the corpus.`
   - In Section 1.2 and Section 4, the worker did not report the required Leave-poet-out boundary F1 metrics on classical flattened Hafez or free verse.
   - Evaluation of `structurePoem` on flattened Hafez (494 works) yielded: Beyt boundary F1 = 0.8003, Line boundary F1 = 0.6684 (target in `ORIGINAL_REQUEST.md` line 441 was >= 0.97). On free verse / modern, Line boundary F1 is 0.12 to 0.19 (target was >= 0.80).

---

## 2. Logic Chain

1. **Self-Certification Discrepancy**:
   `worker_struct_1` attested in the conclusion of `handoff.md` that there were "Zero glue starts, zero dangling ends across the corpus". However, empirical execution of `structurePoem` across the 5,398 canonical works produced 268 lines starting with forbidden tokens and 660 lines ending with dangling particles. Testing was limited to the 4 fixture shots in `shots.jsonl` rather than verifying the invariant across the full corpus. This constitutes self-certifying work without genuine verification.

2. **Causal Mechanism for 265 Glue Start Violations in `rhyme_grid`**:
   `RADIF_STOPWORDS` contains `'را'`. In poems whose radif is «را» (e.g. `hafez.ghazaliat.9`), `detectRadifCandidates` discards the true radif. The fallback `detectQafiyehAnchors` places the anchor on the qafiyeh token (e.g., `بستان`, index $k$), while the line actually ends after `را` (index $k+1$). The next hemistich begins at $k+1$, placing «را» at the beginning of the line. Because `rhyme-grid.ts` does not check `mask[anchorEnd + 1] === 1`, the forbidden line start is emitted verbatim.

3. **Causal Mechanism for 652 Dangling End Violations in `rhyme_grid`**:
   In `snapMidpoint`, `mask[m] === 0` is given a soft penalty of `+500` instead of a strict disqualification (`continue` or `Infinity`). When hemistichs are long, the line-length penalty `(w - 10) * 150` overrides the `+500` glue penalty, breaking on dangling conjunctions (`که`, `و`), prepositions (`به`, `از`, `در`), or verbal particles (`می`).

4. **Missing Acceptance Metric**:
   `ORIGINAL_REQUEST.md` (lines 441-442) specified:
   - Leave-poet-out boundary F1 on classical flattened Hafez >= 0.97.
   - Leave-poet-out boundary F1 on free verse and colloquial reported honestly (target >= 0.80).
   The worker omitted these metrics from the handoff report. Independent evaluation revealed line boundary F1 on flattened Hafez is 0.6684 (beyt F1 is 0.8003), and free verse F1 is 0.12–0.19.

---

## 3. Caveats

1. The test suites (`bun test packages/poem`, `bun test`, and `tsc --noEmit`) pass green because existing unit tests only check synthetic snippets and the 4 golden shots in `shots.jsonl`, which happened not to expose the `ان را` radif suppression.
2. In classical Persian verse, achieving a line boundary F1 of >= 0.97 on completely flattened text without signals is structurally difficult because hemistich lengths within a couplet vary according to metrical feet (aruz) rather than fixed word counts. However, beyt boundary detection can reach high precision if radifs like «را» are correctly recognized.
3. The visual typesetting layer (S8) and typo detection layer (S7) are non-destructive and function properly.

---

## 4. Conclusion

**Verdict**: **REQUEST_CHANGES**

The Structure Engine v2 implementation has genuine strengths (clean modular TypeScript, 100% letter-fingerprint preservation, sub-4ms median runtime, calibrated logistic regression weights, and adherence to `contracts/structure.ts`). However, it cannot be approved due to critical acceptance criteria failures and integrity discrepancies:

1. **INTEGRITY VIOLATION — Evidence of self-certifying work without genuine independent verification**:
   The handoff claimed zero glue starts and zero dangling ends across the corpus, whereas actual corpus evaluation uncovered 268 line start violations and 660 dangling end violations.
2. **Acceptance Criteria Violation (Corpus Invariants)**:
   - 268 lines starting with forbidden tokens violates the criterion "0 lines across the corpus starting with a standalone glue-suffix token".
   - 660 lines ending with dangling tokens violates the criterion "0 lines across the corpus ending on a dangling token without punctuation".
3. **Acceptance Criteria Violation (Model Metrics)**:
   - Classical flattened Hafez boundary F1 is 0.67 (target >= 0.97).
   - Free verse / colloquial boundary F1 is 0.12-0.19 (target >= 0.80).
   - These evaluation results were omitted from the worker handoff report.

### Required Changes:
1. **Fix Radif Detection in `rhyme-grid.ts`**:
   Remove `'را'` from `RADIF_STOPWORDS` when preceded by rhyming qafiyeh tokens, or allow single-token grammatical radifs when inter-occurrence gaps are periodic (CV <= 0.35) and preceding tokens rhyme.
2. **Include Trailing Radif Particles in `detectQafiyehAnchors`**:
   If a regular qafiyeh anchor is followed by a single recurring particle (like `را`), extend `anchorEnd` to include that particle so it does not bleed into the next beyt.
3. **Enforce S1 Constraints as Hard Invariants in `snapMidpoint`**:
   Make `mask[m] === 0` an absolute disqualification (`continue` or `cost = Infinity`), preventing word-length penalties from overriding glue rules.
4. **Validate Beyt Boundaries against Glue Mask**:
   Ensure that any beyt start `currentTokenIdx` satisfies `mask[currentTokenIdx] === 1`.
5. **Run and Document the Full Corpus Scan and F1 Metrics**:
   Re-run the corpus invariant scan across all 5,398 works and report the honest F1 metrics in the revised handoff report.

---

## 5. Verification Method

To independently verify these findings:

```bash
# 1. Reproduce full corpus invariant scan (demonstrating 268 start and 660 end violations)
bun -e '
import fs from "node:fs";
import { structurePoem } from "./packages/poem/src";
import { FORBIDDEN_LINE_STARTS, FORBIDDEN_LINE_ENDS, bareToken, TRAILING_PUNCTUATION_REGEX } from "./packages/poem/src/glue";

const lines = fs.readFileSync("data/canonical/works.jsonl", "utf8").trim().split("\n");
const works = lines.map(l => JSON.parse(l));

let glueStartViolations = 0;
let danglingEndViolations = 0;

for (const w of works) {
  const text = w.text || (w.stanzas ? w.stanzas.flat().join("\n") : "");
  if (!text.trim()) continue;
  const res = structurePoem(text);
  for (const line of res.stanzas.flat()) {
    const words = line.trim().split(/\s+/).filter(Boolean);
    if (!words.length) continue;
    if (FORBIDDEN_LINE_STARTS.has(bareToken(words[0]))) glueStartViolations++;
    const last = bareToken(words[words.length - 1]);
    if (FORBIDDEN_LINE_ENDS.has(last) && !TRAILING_PUNCTUATION_REGEX.test(words[words.length - 1])) danglingEndViolations++;
  }
}
console.log("Glue start violations:", glueStartViolations);
console.log("Dangling end violations:", danglingEndViolations);
'

# 2. Reproduce the Hafez Ghazal 9 radif bleed
bun -e '
import fs from "node:fs";
import { structurePoem } from "./packages/poem/src";
const works = fs.readFileSync("data/canonical/works.jsonl", "utf8").trim().split("\n").map(l => JSON.parse(l));
const w = works.find(x => x.id === "hafez.ghazaliat.9");
const res = structurePoem(w.text || w.stanzas.flat().join("\n"));
console.log(res.stanzas.slice(0, 3));
'

# 3. Measure flattened Hafez boundary F1
bun -e '
import fs from "node:fs";
import { structurePoem } from "./packages/poem/src";
import { cleanLine } from "./packages/poem/src/structure";

const works = fs.readFileSync("data/canonical/works.jsonl", "utf8")
  .trim().split("\n").map(l => JSON.parse(l))
  .filter(w => w.poet_id === "hafez" && w.stanzas && w.stanzas.length >= 2);

let tpLines = 0, fpLines = 0, fnLines = 0;
for (const w of works) {
  const origTokens = [];
  const trueLines = new Set();
  let tokIdx = 0;
  for (let si = 0; si < w.stanzas.length; si++) {
    const st = w.stanzas[si];
    for (let li = 0; li < st.length; li++) {
      for (const word of cleanLine(st[li]).split(/\s+/).filter(Boolean)) {
        origTokens.push(word);
        tokIdx++;
      }
      if (li < st.length - 1 || si < w.stanzas.length - 1) trueLines.add(tokIdx - 1);
    }
  }
  const pred = structurePoem(origTokens.join(" "));
  let pTokIdx = 0;
  const predLines = new Set();
  for (let si = 0; si < pred.stanzas.length; si++) {
    const st = pred.stanzas[si];
    for (let li = 0; li < st.length; li++) {
      pTokIdx += cleanLine(st[li]).split(/\s+/).filter(Boolean).length;
      if (li < st.length - 1 || si < pred.stanzas.length - 1) predLines.add(pTokIdx - 1);
    }
  }
  for (const b of predLines) trueLines.has(b) ? tpLines++ : fpLines++;
  for (const b of trueLines) if (!predLines.has(b)) fnLines++;
}
const p = tpLines / (tpLines + fpLines);
const r = tpLines / (tpLines + fnLines);
console.log("Hafez Line F1:", ((2 * p * r) / (p + r)).toFixed(4));
'
```

### Invalidation Conditions
- A rerun of the corpus scan shows 0 glue start violations and 0 dangling end violations.
- Hafez Ghazal 9 outputs no hemistichs starting with «را».
- Honest leave-poet-out boundary F1 numbers are measured and reported across forms.
