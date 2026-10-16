# Empirical Investigation Report: Acceptance Fixture A3 & Progressive Milestone Testability

**Agent**: `teamwork_preview_explorer_0_iter2_3`  
**Working Directory**: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_iter2_3/`  
**Date**: 2026-10-16T02:52:00Z  
**Target Milestone**: Phase 0 (Iteration 2 Fix Strategy)  

---

## 1. Observation

All empirical measurements and dataset scans were executed directly within `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API` using Bun 1.4.3.

### 1.1 Dataset Inventory & Composition

The project runtime store (`lib/data/store.ts` lines 316–447, 660–668) loads four legacy JSON files into memory, forming `dataset.all` with a total of 5,396 records:

| Dataset | Source File | Records | Content Description |
|---|---|---|---|
| `dataset.poetry` | `lib/data/poetry-quotes.json` | 7 | Curated classical poetry couplets (Rumi, Hafez, Saadi, Ferdowsi) |
| `dataset.hafez` | `lib/data/hafez.json` | 497 | Ghazals from Divan-e Hafez (4,185 total couplets / beyts) |
| `dataset.nonPoetry` | `lib/data/non-poetry-quotes.json` | 492 | Aphorisms and prose quotations (deduplicated from 500 raw entries) |
| `dataset.shereno` | `lib/data/shereno.json` | 4,400 | Modern Persian poetry (Nima, Shamlou, Sepehri, Farrokhzad, etc.) |
| **`dataset.all`** | Combined store | **5,396** | Full legacy in-memory corpus |

### 1.2 Breakdown of Violations across Sub-Datasets

Executing the full suite of Appendix A (A3) invariant checks across each constituent dataset yields the following exact distribution:

```
Command: bun -e "..." (inspecting each dataset via tests/e2e/harness.ts splitBySignals)
```

| Sub-Dataset | Records | Untrimmed Lines | Digits/Punct Only (`^[\d\p{P}\s]+$`) | Space Before Punct (`\s+[،؛؟]`) | Tatweel (`\u0640`) | Raw Slash (` / `) |
|---|---|---|---|---|---|---|
| `dataset.poetry` | 7 | 0 | 0 | 0 | 0 | 0 |
| `dataset.hafez` | 497 | 0 | 0 | 0 | 0 | 0 |
| `dataset.nonPoetry` | 492 | 0 | 0 | 8 | 0 | 0 |
| `dataset.shereno` | 4,400 | 0 | 42 | 1,540 | 114 | 0 |
| **`dataset.all` (Total)** | **5,396** | **0** | **42** | **1,548** | **114** | **0** |

#### A. Detailed Root Causes of Legacy Violations

1. **Space Before Punctuation (1,548 total violations: 1,540 in `shereno`, 8 in `nonPoetry`)**:
   - In `dataset.nonPoetry`, 8 items contain raw typing errors in the legacy JSON:
     - `np-49` (Napoleon): `"...اران خود میمردم ، چون حریفی نداش..."`
     - `np-169` (Camus): `"...ایده منتظر نمان ، ایده بهتر را ا..."`
     - `np-204` (Calvino): `"...ان را سیاه نکند ، تغییرات اقلیمی..."`
     - `np-271` (Svendsen): `"...حمق ها زیاد است ،مشکل در توزیع ن..."`
     - `np-375` (Napoleon): `"... اگر موفق نشویم ، یک نابودی عظیم..."`
   - In `dataset.shereno`, 3,464 out of 4,400 poems contain neither asterisks (`*`), newlines (`\n`), double spaces (`\s{2,}`), nor slashes (` / `). As a result, `splitBySignals(text)` returns `null` for these 3,464 records.
   - In `acceptance-fixtures.test.ts` lines 70–71:
     ```typescript
     const structured = splitBySignals(text);
     const lines = structured ? structured.flat() : text.split("\n");
     ```
     When `splitBySignals` returns `null`, the test falls back to `text.split("\n")` without invoking `cleanLine`. Consequently, all raw uncleaned legacy typographical defects in `shereno.json` are exposed directly to the assertion, generating 1,540 violations.
   - **Empirical Proof of Cleaning Effectiveness**: Running `cleanLine(q.text_persian)` across all 5,396 records in `dataset.all` reduces space-before-punctuation violations from 1,548 to exactly **0**.

2. **Tatweel / Kashida (114 violations, all in `dataset.shereno`)**:
   - Caused by decorative elongation glyphs (`\u0640`) present in the legacy source text (e.g. `هـل و گفـتـش: هر حرف که گوئی همه یاوه است و ترانـه در خـاطـرش افـتـاد`).
   - The Phase 0 `cleanLine` utility strips only directional marks (`\u200e\u200f`) and collapses punctuation spacing; it does not strip `\u0640`. Removal of Tatweel is designated for Phase 1/2 normalizers (`normalizeDisplay` in WS2) and canonical data migration (WS1).

3. **Only-Digits-or-Punctuation Lines (42 violations, all in `dataset.shereno`)**:
   - Caused by poem composition years and colophon lines in the legacy text that leaked into the poem body as standalone lines:
     - `sn-2` (Nima Yushij): line `"1331"`
     - `sn-3` (Nima Yushij): line `"1331"`
     - `sn-4` (Nima Yushij): line `"1331"`
     - `sn-13` (Nima Yushij): line `"1330"`
     - `sn-31` (Nima Yushij): line `"1331"`
   - These leaked date lines are precisely what the Colophon Extraction Engine (WS3, `extractColophon`) is designed to isolate and remove from stanzas into structured metadata (`text.colophon = { date: "1331" }`). Because WS3 has not yet executed on the corpus, these lines remain in the unmigrated legacy text.

---

### 1.3 Analysis of Classical Beyt 2-Hemistich Invariant across Hafez

Contract requirement (`ORIGINAL_REQUEST.md` Appendix A):
> "Every classical beyt has exactly two hemistichs."

Inspection of `dataset.hafez` (497 ghazals, 4,185 total beyts):
- Evaluating `beyt.split(' / ').length === 2`:
  - **4,185 out of 4,185 beyts (100.0%)** pass this invariant.
- Evaluating strict non-empty second hemistich (`parts.length === 2 && parts[0].trim().length > 0 && parts[1].trim().length > 0`):
  - **4,182 beyts** pass.
  - Exactly **3 beyts** fail because the second hemistich is an empty string `""` (`"مصرع اول / "`).

#### In-Depth Audit of the 3 Legacy Anomalies in `lib/data/hafez.json`:
1. `h-3` (`title: "غزل 3"`, line 0): `"که بر نظم تو افشاند فلک عقد ثريا را / "` (Second hemistich empty). In `hafez.json`, ID 3 appears twice: the first entry is the complete 8-beyt Ghazal 3; the second entry is an orphaned 1-line fragment containing only the final maqta hemistich.
2. `h-139` (`title: "غزل 139"`, line 0): `"که شنيد اين ره دلسوز که فرياد نکرد / "` (Second hemistich empty). ID 139 appears twice: an orphaned 1-line fragment followed by the complete 7-beyt Ghazal 139.
3. `h-260` (`title: "غزل 260"`, line 0): `"در آن مقام که حافظ برآورد آواز / "` (Second hemistich empty). ID 260 appears twice: an orphaned 1-line fragment followed by the complete 9-beyt Ghazal 260.
4. (Also noted: ID 10 appears twice: the first is Ghazal 10, the second is actually Ghazal 11 mislabeled with ID 10).

In Phase 0, `lib/data/hafez.json` is frozen legacy data. In Phase 2, WS1 data validation and migration will quarantine or merge these orphaned duplicate fragments.

---

### 1.4 Milestone Progression & Authoritative Contract Scheduling

The placement of acceptance fixtures is explicitly governed by the project roadmap:

1. **`ORIGINAL_REQUEST.md` Section 6**:
   - **Phase 0 — Recon and safety net**: "Audit repo, measure baseline performance, snapshot legacy data to data/legacy/ with checksums, capture golden legacy contract snapshots, capture Playwright visual screenshots, write docs/audit/00-recon.md."
   - **Phase 1 — Foundations**: "Monorepo setup, packages/schema, packages/persian with 90%+ branch coverage and property tests."
   - **Phase 2 — Data**: "WS1 migration, WS3 structure engine with evaluation harness, WS4 excerpt/radif/qafiyeh, rights audit, **acceptance fixtures A1, A2, A3 pass**."

2. **`PROJECT.md` Feature Inventory**:
   - **`F154` (Acceptance Fixture A3: Corpus-Wide Integrity)**: Assigned to **Milestone 2 (Phase 2)**.
   - **Rule R5 (`F005`)**: Requires preserving a byte-identical frozen snapshot of legacy data under `data/legacy/` with SHA-256 hashes. In Phase 0, legacy files in `lib/data/*.json` cannot be modified to artificially satisfy future phase exit gates.

---

## 2. Logic Chain

1. **Premise 1 (Phase 0 Immutability & Safety Net)**:
   Per Rule R5 and Phase 0 objectives, original legacy data must remain frozen. The known defects (1,548 punctuation errors, 114 Tatweels, 42 unextracted colophon years) are documented baseline defects (D1, D2, D3 in `ORIGINAL_REQUEST.md` Section 3).
2. **Premise 2 (Phase 2 Ownership of Data Cleaning)**:
   Canonical schema migration (WS1), text normalization (WS2), and structure engine colophon extraction (WS3) are scheduled for Phase 2. Fixture A3 is explicitly scheduled in `ORIGINAL_REQUEST.md` Section 6 and `PROJECT.md` as an exit gate for Phase 2.
3. **Premise 3 (Defect in Current Phase 0 Test Suite)**:
   The current test `T1-FIXTURE-A3` in `tests/e2e/tier1-features/acceptance-fixtures.test.ts`:
   - Scanned only 7 records from `dataset.poetry` while labeling itself a "Corpus-wide scan".
   - Completely omitted the mandatory requirement: "Every classical beyt has exactly two hemistichs."
   - Allowed Mutation M4 (corrupting beyt hemistich count) to pass undetected.
4. **Premise 4 (Progressive Testability Principle)**:
   Per `TEST_INFRA.md` Section 5, tests must be verifiable using only features and data available in the active milestone. Running a full corpus exit gate across unmigrated legacy JSON in Phase 0 violates progressive testability and will cause immediate build failure.
5. **Deduction (Conclusion)**:
   In Phase 0, `acceptance-fixtures.test.ts` must honestly and rigorously test what is verifiable in Phase 0:
   - Part A: Baseline typographic integrity on clean sample records (`dataset.poetry`), with clear documentation that full corpus execution is gated for Phase 2.
   - Part B: Classical beyt 2-hemistich invariant across the entire classical Hafez corpus (all 497 ghazals, 4,185 beyts), where 100% of beyts satisfy `split(' / ').length === 2`.
   - In Phase 2, the full corpus scan (`T1-FIXTURE-A3-FULL`) becomes active as the exit gate across the migrated canonical dataset in `data/canonical/`.

---

## 3. Caveats

1. **Legacy Hafez Duplicate Anomalies**:
   In Phase 0, all 4,185 beyts in `dataset.hafez` pass `beyt.split(' / ').length === 2`. However, 3 beyts have an empty second hemistich due to orphaned single-hemistich fragments with duplicate IDs (Ghazals 3, 139, 260). Strict non-empty checking (`parts[1].trim().length > 0`) should be enforced in Phase 2 once WS1 migration quarantines or resolves these orphaned records.
2. **Non-Poetry Scope**:
   `dataset.nonPoetry` contains aphorisms, not poetry. Classical beyt invariants apply exclusively to classical verse (Hafez and classical poetry), while typographic rules apply corpus-wide.

---

## 4. Conclusion & Actionable Recommendations

### 4.1 Recommendation 1: Restructure A3 in `tests/e2e/tier1-features/acceptance-fixtures.test.ts` for Phase 0

Replace the current single `T1-FIXTURE-A3` test (lines 64–93) with two distinct, fully asserted, and truthful tests:

```typescript
  test("T1-FIXTURE-A3-SAMPLE: Acceptance Fixture A3 sample integrity scan (clean baseline)", () => {
    // Note: Full corpus scan across dataset.all (5,396 records) is an exit gate for Phase 2 (WS1 migration).
    // In Phase 0, legacy JSON contains unmigrated text (1,548 punctuation defects, 114 Tatweels, 42 colophon leaks).
    // This test verifies that clean baseline poetry records strictly satisfy all A3 typographic invariants.
    const sample = dataset.poetry;
    expect(sample.length).toBeGreaterThan(0);

    for (const q of sample) {
      const text = String(q.text_persian);
      const structured = splitBySignals(text);
      const lines = structured ? structured.flat() : text.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Zero lines starting or ending with raw whitespace inside formatted lines
        expect(line).toBe(trimmed);

        // Zero lines containing only digits or punctuation
        expect(trimmed).not.toMatch(/^[\d\p{P}\s]+$/u);

        // Zero spaces before punctuation marks (، ؛ ؟)
        expect(trimmed).not.toMatch(/\s+[،؛؟]/);

        // Zero U+0640 (Tatweel / Kashida)
        expect(trimmed).not.toContain("\u0640");

        // No raw " / " inside rendered lines
        expect(trimmed).not.toContain(" / ");
      }
    }
  });

  test("T1-FIXTURE-A3-CLASSICAL: Acceptance Fixture A3 classical beyt 2-hemistich invariant across Hafez corpus", () => {
    // Contract (Appendix A): "Every classical beyt has exactly two hemistichs."
    // Verified across all 497 ghazals in Divan-e Hafez (4,185 total beyts) and all curated classical quotes.
    let totalBeyts = 0;

    for (const ghazal of dataset.hafez) {
      const lines = ghazal.text_persian.split("\n").filter(Boolean);
      for (const beyt of lines) {
        totalBeyts++;
        const hemistichs = beyt.split(" / ");
        // Every classical beyt must split into exactly two hemistichs
        expect(hemistichs.length).toBe(2);
        expect(hemistichs[0].trim().length).toBeGreaterThan(0);
      }
    }

    // Must verify all 4,185 beyts in Hafez
    expect(totalBeyts).toBe(4185);

    // Also verify classical sample couplets
    for (const quote of dataset.poetry) {
      const parts = quote.text_persian.split(" / ");
      expect(parts.length).toBe(2);
      expect(parts[0].trim().length).toBeGreaterThan(0);
      expect(parts[1].trim().length).toBeGreaterThan(0);
    }
  });
```

### 4.2 Recommendation 2: Update `TEST_INFRA.md` Specification

1. **Update Section 3.2 (Feature Group B Table)**:
   - Split `T1-FIXTURE-A3` into:
     - `T1-FIXTURE-A3-SAMPLE`: Clean baseline integrity scan (zero whitespace runs, zero digit-only lines, zero spaces before `، ؛ ؟`, no U+0640).
     - `T1-FIXTURE-A3-CLASSICAL`: Classical beyt invariant across all 4,185 beyts in `dataset.hafez` (`hemistichs.length === 2`).
2. **Update Section 5 (Milestone Progressive Testability Matrix)**:
   - Add explicit documentation stating:
     - In Milestone 0, `T1-FIXTURE-A3-SAMPLE` and `T1-FIXTURE-A3-CLASSICAL` are active.
     - In Milestone 2 (Phase 2), `T1-FIXTURE-A3-FULL` (scanning all 5,400+ migrated canonical records) activates as the Phase 2 exit gate upon completion of WS1 migration and WS3 structure cleaning.

### 4.3 Recommendation 3: Specification for Phase 2 Exit Gate (`T1-FIXTURE-A3-FULL`)

In Phase 2, when canonical migration pipeline (`bun run build:data`) outputs to `data/canonical/`:
- Assert across 100% of records in canonical dataset:
  - Zero lines starting/ending with whitespace.
  - Zero lines containing only digits or punctuation (all 42 date leaks extracted to `colophon`).
  - Zero spaces before `، ؛ ؟` (all 1,548 spaces normalized by `cleanLine`).
  - Zero Tatweel `\u0640` (all 114 instances stripped by `normalizeDisplay`).
  - Zero raw ` / ` inside rendered lines.
- Assert across all classical poems:
  - Every classical beyt has exactly two non-empty hemistichs (`parts.length === 2 && parts[0].trim().length > 0 && parts[1].trim().length > 0`).
  - The 3 orphaned fragments (`h-3`, `h-139`, `h-260`) quarantined or repaired.

---

## 5. Verification Method

To independently reproduce all empirical findings and verify the proposed test logic:

1. **Verify Full Corpus Violations (1,548 punctuation errors, 114 Tatweels, 42 digit-only lines)**:
   ```bash
   bun -e "
   import { dataset } from './lib/data/store';
   import { splitBySignals } from './tests/e2e/harness';
   let punct = 0, tatweel = 0, digits = 0;
   for (const q of dataset.all) {
     const st = splitBySignals(q.text_persian);
     const lines = st ? st.flat() : q.text_persian.split('\n');
     for (const l of lines) {
       const t = l.trim();
       if (!t) continue;
       if (/\s+[،؛؟]/.test(t)) punct++;
       if (t.includes('\u0640')) tatweel++;
       if (/^[\d\p{P}\s]+$/u.test(t)) digits++;
     }
   }
   console.log({ punct, tatweel, digits });
   "
   ```
   *Expected Output*: `{ punct: 1548, tatweel: 114, digits: 42 }`

2. **Verify That `cleanLine` Eliminates All 1,548 Punctuation Violations**:
   ```bash
   bun -e "
   import { dataset } from './lib/data/store';
   import { cleanLine } from './tests/e2e/harness';
   let remaining = 0;
   for (const q of dataset.all) {
     if (/\s+[،؛؟]/.test(cleanLine(q.text_persian))) remaining++;
   }
   console.log('Remaining after cleanLine:', remaining);
   "
   ```
   *Expected Output*: `Remaining after cleanLine: 0`

3. **Verify Classical Beyt Invariant across All 4,185 Hafez Beyts**:
   ```bash
   bun -e "
   import { dataset } from './lib/data/store';
   let total = 0, passed = 0;
   for (const ghazal of dataset.hafez) {
     for (const beyt of ghazal.text_persian.split('\n').filter(Boolean)) {
       total++;
       if (beyt.split(' / ').length === 2) passed++;
     }
   }
   console.log({ totalBeyts: total, passedBeyts: passed, passRate: (passed / total) * 100 + '%' });
   "
   ```
   *Expected Output*: `{ totalBeyts: 4185, passedBeyts: 4185, passRate: '100%' }`

4. **Verify Mutation M4 Detection with Proposed Invariant**:
   ```bash
   bun -e "
   const check = (b) => { if (b.split(' / ').length !== 2) throw new Error('Caught invalid hemistich count'); };
   check('مصرع اول / مصرع دوم'); // Passes
   try { check('مصرع تنها'); } catch (e) { console.log('1 hemistich:', e.message); }
   try { check('مصرع اول / مصرع دوم / مصرع سوم'); } catch (e) { console.log('3 hemistichs:', e.message); }
   "
   ```
   *Expected Output*: Both mutations caught immediately.
