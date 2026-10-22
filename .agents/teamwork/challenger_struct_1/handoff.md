# Empirical Challenge & Verification Report: Structure Engine v2 Golden Fixtures

**Agent**: `challenger_struct_1`  
**Milestone**: Structure Engine v2 Golden Behavioral Fixture & Corpus Invariant Verification  
**Date**: 2026-10-17  
**Verdict**: **APPROVE**

---

## 1. Observation

Direct observations obtained by running tests and inspection commands on the repository:

### 1.1 Test Suite Execution
- **Command**: `bun test packages/poem`
- **Output**:
  ```text
  bun test v1.4.3 (c6da4a4d3)
  packages/poem/tests/poem.test.ts: 15 pass
  packages/poem/tests/structure-v2.test.ts: 27 pass
  42 pass, 0 fail, 728 expect() calls [367.00ms]
  ```

### 1.2 Golden Behavioral Fixture Verification (`data/golden/shots.jsonl`)
Executed via `bun scripts/challenger-verify.ts` across both raw `text` and `flat_text` inputs:

1. **Shot #1 (`mehdi-soheili.general.142` - Mehdi Soheili: "زنده ی مرگ آلود")**:
   - `res.form`: `classical_rhymed`
   - `res.origin`: `rhyme_grid`, confidence: `0.865`
   - `beyts`: 7 couplets (14 lines total)
   - **Radif hemistichs ending with «هنوز»**: Exactly 8 out of 8 rhyming hemistichs (matla' h1 & h2, and h2 of couplets 2-7) end with «هنوز» (100.0% >= 90% threshold).
   - **Line word count**: Word counts per line are `[8, 8, 9, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9]`. 0 lines exceed 10 words.

2. **Shot #4 (`shahriar.general.72` - Shahriar: "یار و همسر نگرفتم که گرو بود سرم")**:
   - `res.form`: `classical_rhymed`
   - `res.origin`: `rhyme_grid`, confidence: `0.945`
   - `beyts`: 12 couplets (24 lines total)
   - **Hemistich length symmetry**:
     - Word count differences between h1 and h2 per beyt: `[1, 3, 1, 0, 0, 1, 0, 0, 1, 0, 0, 2]`. Average difference is `0.75` words; maximum difference is `3` words.
     - Maximum character length imbalance ratio `|c1 - c2| / max(c1, c2)` is 25.0%.
   - **Line word count**: Range 6 to 9 words per line. 0 lines exceed 10 words.

3. **Shot #2 (`maryam-heydarzadeh.general.26` - Maryam Heydarzadeh: "مزاحم همیشگی")**:
   - `res.form`: `colloquial`
   - `res.origin`: `boundary_model`, confidence: `0.70`
   - Lines: 62 lines
   - **Glue start violations** (`ی ها های تر ترین ام ات اش مان تان شان را است بود شد نیست هست`): 0 violations.
   - **Dangling end violations** (`ای می نمی بی همی و که تا یا از به در با بر چون اگر ولی اما` unpunctuated): 0 violations.
   - **Line word count**: Maximum word count on any line is 10 words. 0 lines exceed 10 words.

4. **Shot #3 (`ahmadreza-ahmadi.general.18` - Ahmadreza Ahmadi: "هفده")**:
   - `res.form`: `free_verse`
   - `res.origin`: `boundary_model`, confidence: `0.70`
   - Lines: 20 lines
   - **Glue start violations**: 0 violations.
   - **Dangling end violations**: 0 violations.
   - **Line word count**: Range 2 to 9 words per line. 0 lines exceed 10 words.

### 1.3 Corpus Invariants
1. **Letter-Fingerprint Preservation**:
   - All 4 golden shots preserved 100% letter-fingerprint:
     - Shot 1: inLen=383, outLen=383 (100% match)
     - Shot 2: inLen=1364, outLen=1364 (100% match)
     - Shot 3: inLen=446, outLen=446 (100% match)
     - Shot 4: inLen=734, outLen=734 (100% match)
   - Both raw stanzas and typeset layer (`res.typeset`) maintain 100% identical letter fingerprint.
   - Evaluation on 300 works in `data/golden/sample300.jsonl`: 300/300 works (100.0%) preserve letter fingerprint.
   - Inference latency on `sample300.jsonl`: median = 4.78 ms/poem (target <= 5.0 ms/poem), p95 = 28.57 ms/poem.

### 1.4 Adversarial Stress & Fuzzing
- **Edge cases tested**: Empty string, whitespace-only, single word, two words, punctuation-only, digits/symbols, 500-character token without spaces, 50-word identical repetition, colophon-only date/place, alternating glue tokens.
- **Results**: 0 unhandled exceptions or crashes across all edge cases.
- **Property-based testing**: 300 runs of fast-check with random Persian poetry strings passed with 0 crashes, 100% letter fingerprint preservation, and 100% lines <= 10 words.

---

## 2. Logic Chain

1. **Premise 1**: Acceptance criteria in `ORIGINAL_REQUEST.md` (lines 428-439) require:
   - Shot 1: >= 90% lines ending hemistich end with «هنوز», <= 10 words/line.
   - Shot 4: Beyts have 2 hemistichs of near-equal length, <= 10 words/line.
   - Shots 2 & 3: 0 glue start violations, 0 dangling end violations, <= 10 words/line.
   - Corpus invariants: 100% letter-fingerprint preservation rate.
2. **Observation Alignment**:
   - Direct empirical execution confirms Shot 1 achieves 100.0% radif hemistich ending with «هنوز» (exceeding 90%) and 0 lines > 10 words.
   - Direct empirical execution confirms Shot 4 achieves near-equal hemistich length (word delta <= 3, char delta <= 25%) and 0 lines > 10 words.
   - Direct empirical execution confirms Shots 2 & 3 have 0 glue start violations, 0 dangling end violations, and 0 lines > 10 words.
   - Direct empirical execution confirms 100% letter-fingerprint preservation across all 4 shots and across all 300 works in `sample300.jsonl`.
3. **Inferential Step**: Because all four golden behavioral fixtures and core corpus invariants empirically satisfy the required metrics under direct test execution without modification of implementation code, the fixtures and engine implementation are empirically validated.
4. **Conclusion**: The candidate implementation satisfies the acceptance criteria for this milestone. Verdict is **APPROVE**.

---

## 3. Caveats & Adversarial Findings

While the Golden Behavioral Fixtures pass with 100% compliance, adversarial stress-testing identified 4 specific edge-case failure modes in `packages/poem/src/rhyme-grid.ts` that the team should be aware of for future hardening:

1. **Multi-Token Radif Stopword Bypass**:
   - *Location*: `packages/poem/src/form.ts` line 70 and `packages/poem/src/rhyme-grid.ts` line 43.
   - *Issue*: `if (n === 1 && RADIF_STOPWORDS.has(slice[0])) continue;` only checks stop words when candidate length $n = 1$. When $n = 2$, phrases whose final word is in `FORBIDDEN_LINE_ENDS` (e.g. `"آیی و"`) can be detected as radif, causing lines to terminate on dangling conjunctions.
   - *Mitigation*: Check whether `FORBIDDEN_LINE_ENDS.has(bareToken(slice[n - 1]))` for all candidate radifs regardless of length $n$.

2. **Unchecked Beyt Anchor Boundaries in Rhyme Grid**:
   - *Location*: `packages/poem/src/rhyme-grid.ts` lines 378-444.
   - *Issue*: `currentTokenIdx = anchorEnd + 1` sets the start of the next beyt immediately after the anchor without checking `mask[anchorEnd + 1] === 1`. If the token following the radif is in `FORBIDDEN_LINE_STARTS` (e.g., `"را"` as observed in Bertrand Russell aphorism `general.aphorisms.442`), a glue start violation is created.
   - *Mitigation*: Verify `mask[anchorEnd + 1] === 1` before splitting; if forbidden, search $\pm 1$ token or fall back to boundary model.

3. **Remainder Word Count Inflation in Rhyme Grid**:
   - *Location*: `packages/poem/src/rhyme-grid.ts` line 452.
   - *Issue*: `lastBeyt[1] = `${lastBeyt[1]} ${tokens.slice(currentTokenIdx).join(' ')}`` unconditionally appends remaining tokens (when $\le 10$) to the last hemistich, which can push the line length beyond 10 words.
   - *Mitigation*: Only append if `wordCount(lastBeyt[1]) + remTokens <= 10`; otherwise, call `snapMidpoint`.

4. **Soft Mask in `snapMidpoint`**:
   - *Location*: `packages/poem/src/rhyme-grid.ts` line 243.
   - *Issue*: `if (mask[m] === 0) cost += 500;` assigns a finite penalty of 500 rather than `Infinity`, allowing the DP to violate hard glue constraints under extreme imbalance penalties.
   - *Mitigation*: Increase penalty to `Infinity` or `50000`.

---

## 4. Conclusion

**Verdict: APPROVE**

Structure Engine v2 satisfies all 4 Golden Behavioral Fixture requirements in `data/golden/shots.jsonl`:
- Shot 1 (Soheili): 100% radif hemistichs ending in «هنوز», <= 10 words/line.
- Shot 4 (Shahriar): Balanced couplets (average delta 0.75 words), <= 10 words/line.
- Shots 2 & 3 (Heydarzadeh & Ahmadi): 0 glue starts, 0 dangling ends, <= 10 words/line.
- Letter-fingerprint preservation: 100% across all golden shots and sample300 benchmark.
- Median inference runtime: 4.78 ms/poem (within 5.0 ms budget).

---

## 5. Verification Method

To independently verify all findings in this report, execute the following commands from repository root:

```bash
# 1. Run all unit, contract, and fixture tests in packages/poem
bun test packages/poem

# 2. Run standalone empirical verification harness covering all 4 shots, sample300, and stress cases
bun scripts/challenger-verify.ts
```

### Invalidation Conditions
This approval would be invalidated if:
1. Any line in Shot 1 or Shot 4 exceeds 10 words.
2. Any line in Shot 2 or Shot 3 starts with a token in `FORBIDDEN_LINE_STARTS` or ends with an unpunctuated token in `FORBIDDEN_LINE_ENDS`.
3. Letter-fingerprint comparison `letterFingerprint(input) === letterFingerprint(stanzas.flat().join(' '))` evaluates to false on any of the 4 shots.
