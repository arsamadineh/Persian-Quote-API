# Specification Mining Report: Structure Engine v2

**Author**: `spec_miner_survey_1` (Teamwork Specialist / Specification Miner)  
**Date**: 2026-10-17  
**Target Path**: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/spec_miner_survey_1/handoff.md`  
**Reference Sources**:
- `contracts/structure.ts` (FROZEN Contract)
- `.agents/teamwork/ORIGINAL_REQUEST.md` (lines 388–446, Appendix A, Appendix D)
- `prompts/L1_structure_v2.md` & `prompts/_COMMON.md`
- `data/golden/shots.jsonl` (4 Golden Shots)
- `data/golden/sample300.jsonl` (300 Stratified Benchmark Works)
- `data/golden/legacy30/` (30 Legacy Golden Contracts)
- `docs/adr/0002-structure-signals-colophon.md`
- `packages/poem/src/structure.ts`, `packages/poem/src/colophon.ts`, `packages/poem/src/rhyme.ts`
- `pipeline/eval-structure.ts` & `docs/evidence/phase-2/structure-f1.json`
- `AGENTS.md` & `lib/changelog.ts`

---

## 1. Observation

Direct observations extracted from the authoritative repository files, source code, data fixtures, and test runners:

### 1.1 Interface and Contract Definition (`contracts/structure.ts`)
The contract is explicitly marked `// contracts/structure.ts (FROZEN)`:
```typescript
// contracts/structure.ts (lines 1-15)
export type Form = 'classical_rhymed' | 'free_verse' | 'colloquial' | 'prose';
export interface StructureResult {
  form: Form;
  stanzas: string[][];
  beyts?: [string, string][];
  origin: 'source' | 'separators' | 'rhyme_grid' | 'boundary_model' | 'llm' | 'heuristic' | 'human';
  confidence: number;                                  // calibrated 0..1
  flags: ('low_confidence' | 'possible_typo' | 'footer_removed')[];
  typos?: { token: string; suggestion: string; ratio: number }[];   // flags only, never auto-applied
  typeset?: string[][];                                // derived display layer (ZWNJ-attached suffixes)
  colophon?: { place?: string; raw: string; jalali?: { y: number; m: number; d: number }; gregorian?: string };
}
export declare function structurePoem(text: string, o?: { poetId?: string }): StructureResult;
```

### 1.2 Pipeline Architecture & Stage Specifications (S0–S8)
From `ORIGINAL_REQUEST.md` (lines 397–420) and `prompts/L1_structure_v2.md` (lines 7–33):
- **S0 (Signals & Colophon)**:
  - Extract colophon via existing extraction (`extractColophon`).
  - Strip colophon tokens from poem stanzas; flag `footer_removed` if colophon removed.
  - Split by real separators (`*`, `□`/`■`, blank line `\n\s*\n`, newline `\n`, double-space `\S\s{2,}\S`, spaced slash `\s\/\s`).
  - Filter digits/punctuation-only lines (section numbers, ellipsis, stray dates).
  - Check `looksStructured`: line word count median 2–12 words/line, max <= 22 words/line, >= 2 lines.
  - If valid: `origin: 'separators'`, `confidence: 0.95`, pipeline stops early.
- **S1 (Hard Glue Constraints - applied across all downstream stages)**:
  - **Never START a line with**:
    - Suffixes: `ی`, `ها`, `های`, `تر`, `ترین`, `ام`, `ات`, `اش`, `مان`, `تان`, `شان` (standalone tokens).
    - Particles / Copulas / Auxiliaries: `را`, `است`, `بود`, `شد`, `نیست`, `هست`.
  - **Never END a line (unless followed by punctuation) with**:
    - `ای`, `می`, `نمی`, `بی`, `همی`, `و`, `که`, `تا`, `یا`, `از`, `به`, `در`, `با`, `بر`, `چون`, `اگر`, `ولی`, `اما`.
  - **Keep whole (never break across lines)**:
    - `X به X` compounds (`در به در`, `لا به لا`, `سر به سر`, `روز به روز`).
    - `تو در تو`.
    - Immediate identical repeats `X X`.
    - Ezafe chains up to 3 tokens when the line would otherwise end on a noun + `ِ`.
- **S2 (Form Classifier)**:
  - Classifies into `Form`: `'classical_rhymed' | 'free_verse' | 'colloquial' | 'prose'`.
  - Features: periodicity of repeated line-final n-grams, rhyme regularity, line-length coefficient of variation (CV), punctuation density, colloquial markers (`میاد نمیشه بذار دیگه یه`), mean words/hemistich.
- **S3 (Classical Rhyme Grid)**:
  - Candidate radif: n-gram (1–3 tokens) with >= 3 occurrences whose inter-occurrence gaps (chars) have `CV <= 0.35`; `score = occurrences * n / (1 + CV)`.
  - Candidate qafiyeh: final 2–3 letters shared regularly.
  - **Break rule**: A regularly repeating end-token ENDS a hemistich: the break goes AFTER it, NEVER before.
  - Hypotheses:
    - **H1**: Anchors end every hemistich (masnavi, rubai, matla').
    - **H2**: Anchors end beyts (ghazal, qasida) -> split each interval at its char-midpoint snapped to the best glue-valid boundary.
    - Pick hypothesis whose implied hemistich length lies in prior (22–55 chars, mode 28–42); ties broken by lower hemistich-length variance.
  - Output: `beyts` and `stanzas` (one per beyt). `confidence = 1 - normalized_variance * anchor_coverage`.
- **S4 (Modern Boundary Model for colloquial & free verse)**:
  - Tiny pure-TypeScript logistic regression trained via SGD.
  - Model weights stored in `weights.json` (zero runtime dependencies; inference is a pure dot product).
  - Features per token gap: glue class of left/right token; punctuation at gap; finite-verb-final guess (stem + `م ی د یم ید ند`, auxiliaries); repeat features (left ends repeated n-gram, right starts one, repeat count); chars since last break; z-score vs poet's mean line length; learned `P(token is line-final)` from training; conjunction/preposition flags; sentence-end flag.
  - Evaluation: **leave-poet-out ONLY**.
  - Calibration: Platt scaling or isotonic regression for meaningful `confidence` (0..1).
- **S5 (Heuristic Fallback)**:
  - Dynamic programming enforcing S1 glue constraints.
  - **NO uniform-length target** (replaces legacy `TARGET_LINE_LENGTH = 24` bug).
  - Orphan penalties (penalize 1-word or dangling lines).
  - `origin: 'heuristic'`, `confidence <= 0.4`, flag `low_confidence`.
- **S6 (LLM Pass - Optional Fallback)**:
  - Executed only if `confidence < 0.7`.
  - Batched, disk-cached by content hash, strict budget cap `LLM_BUDGET_USD` (default $5).
  - Letter-fingerprint verification: changes whitespace only; any changed letter causes immediate discard.
  - Skip entirely if offline or unreachable.
- **S7 (Typo Flags - Non-Neural)**:
  - Frequency lexicon from corpus tokens.
  - Flag a token if `count <= 2` and an edit-distance-1/2 neighbor has `>= 50x` count.
  - Stored in `StructureResult.typos` as `{ token: string, suggestion: string, ratio: number }[]`.
  - Add `'possible_typo'` to `flags`. Flags only; never auto-applied to text.
- **S8 (Typeset Layer)**:
  - Derived separate layer stored in `StructureResult.typeset`.
  - Attaches standalone suffixes (`ی`, `ها`, `های`, `تر`, `ترین`) to previous token with ZWNJ (`\u200c`).
  - **Hard prohibition**: NEVER touch `می` (can mean "wine" as a noun).

### 1.3 Behavioral Fixtures (`data/golden/shots.jsonl`)
Inspecting `data/golden/shots.jsonl`:
1. **Shot 1 (`mehdi-soheili.general.142`)**:
   - Poet: مهدی سهیلی | Title: زنده ی مرگ آلود | 108 words, 454 characters.
   - Text contains classical ghazal with 14 hemistichs (7 beyts).
   - Radif «هنوز» occurs at indices [9, 15, 31, 45, 59, 74, 91, 107].
   - Contains detached suffix `بهار ست هنوز` and typos (`مر`, `سارست`, `متظرم`, `لها`, `نا`).
   - Acceptance: `>= 90%` of lines ending a hemistich end with «هنوز»; all lines <= 10 words.
2. **Shot 2 (`maryam-heydarzadeh.general.26`)**:
   - Poet: مریم حیدرزاده | Title: مزاحم همیشگی | 515 words, 2288 characters.
   - Colloquial verse with compounds `در به در` and `لا به لا`.
   - Contains colloquial markers (`یه`, `بذار`, `دیگه`, `میاد`, `نمی شم`) and typos (`پدیاا`, `نیم شم`, `خرین`, `دستگا`).
   - Acceptance: Zero lines start with glue tokens or end dangling; all lines <= 10 words.
3. **Shot 3 (`ahmadreza-ahmadi.general.18`)**:
   - Poet: احمدرضا احمدی | Title: هفده | 163 words, 674 characters.
   - Free verse / موج نو.
   - Contains object marker `را`, copulas `است`, `بود`, prepositions `در`, `به`, `با`.
   - Acceptance: Zero lines start with glue tokens or end dangling; all lines <= 10 words.
4. **Shot 4 (`shahriar.general.72`)**:
   - Poet: شهریار | Title: یار و همسر نگرفتم که گرو بود سرم | 189 words, 797 characters.
   - Classical ghazal with 24 hemistichs (12 beyts) rhyming in `-رم` (سرم, پسرم, جگرم, صاحبنظرم, هنرم, درم, گذرم, دگرم, آبخورم, گهرم).
   - Acceptance: Beyts have 2 hemistichs of near-equal length; all lines <= 10 words.

### 1.4 Acceptance Criteria, Corpus Invariants & Metrics
From `ORIGINAL_REQUEST.md` (lines 427–446) and `prompts/L1_structure_v2.md`:
- **Corpus Invariants**:
  - `0` lines across the entire corpus starting with a standalone glue-suffix token.
  - `0` lines across the entire corpus ending on a dangling token without punctuation.
  - Letter-fingerprint preservation rate: `100%` (`letterFingerprint(s)` invariant).
  - Every classical beyt has exactly two hemistichs (Appendix A3).
  - Zero lines starting/ending with whitespace; zero lines containing only digits or punctuation (Appendix A3).
  - Zero spaces before `، ؛ ؟`; no tatweel `U+0640`; no raw `" / "` inside rendered lines (Appendix A3).
- **Model & Performance Targets**:
  - Leave-poet-out boundary F1 on classical flattened Hafez: `>= 0.97`.
  - Leave-poet-out boundary F1 on free verse and colloquial: target `>= 0.80` (reported honestly).
  - Expected Calibration Error (ECE): `<= 0.08`.
  - Inference runtime: median `<= 5 ms/poem`.
  - All unit and property tests in `packages/poem` pass green (`bun test packages/poem`).

### 1.5 Governance & AGENTS.md Rules
- **Changelog (`lib/changelog.ts`)**:
  - Absolute rule: every change must be documented in `lib/changelog.ts`.
  - Version in Persian digits (e.g. `"۳.۱۷.۰"`), `isoDate: "YYYY-MM-DD"`, `date` in Persian words.
  - Change types: `"added"` | `"changed"` | `"fixed"` | `"removed"`.
  - Descriptive, concise Persian, active voice, beginner-friendly.
  - Strict prohibitions: No emojis, no marketing adjectives, no vendor/tool branding, no automated text markers (e.g. "قطعاً", "البته", "به طور کلی", "لازم به ذکر است").
  - Semantic versioning: MAJOR for breaking changes, MINOR for backwards-compatible features, PATCH for bug fixes.
- **Persian-First & UI**:
  - Fluent Persian text, RTL.
  - Footer managed solely by `app/layout.tsx` and `components/footer.tsx`.
  - Project logo used only for favicon (`app/icon.svg`).

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Contract | `structurePoem` Entrypoint | Main public engine interface conforming to frozen contract | `text: string, o?: { poetId?: string }` | `StructureResult` | Throws on non-string text or returns fallback with `low_confidence` | `contracts/structure.ts:14` |
| 2 | Contract | `Form` Categorization | 4-way classification of poetic form | Verse token stream & style features | `'classical_rhymed' \| 'free_verse' \| 'colloquial' \| 'prose'` | Falls back to `'free_verse'` or `'prose'` if unclassifiable | `contracts/structure.ts:2` |
| 3 | Contract | `StructureResult.origin` | Traceability provenance tag identifying the resolving stage | Pipeline execution context | `'source' \| 'separators' \| 'rhyme_grid' \| 'boundary_model' \| 'llm' \| 'heuristic' \| 'human'` | Mandatory field; must accurately match winning stage | `contracts/structure.ts:7` |
| 4 | Contract | `StructureResult.confidence` | Calibrated metric representing boundary confidence in [0, 1] | Calibration layer output (Platt/isotonic or variance) | `number` (0.0 to 1.0) | Must never exceed 1.0 or fall below 0.0; heuristic capped at <= 0.4 | `contracts/structure.ts:8` |
| 5 | Contract | `StructureResult.flags` | Diagnostic status flags for downstream consumers and UI | Processing anomalies | Array of `'low_confidence' \| 'possible_typo' \| 'footer_removed'` | Empty array if no conditions triggered | `contracts/structure.ts:9` |
| 6 | Contract | `StructureResult.typos` | Non-destructive lexical error suggestions | Typo detector candidate list | `{ token: string, suggestion: string, ratio: number }[]` | Omitted if no typos detected; never mutates text | `contracts/structure.ts:10` |
| 7 | Contract | `StructureResult.typeset` | Aesthetic display layer with ZWNJ-attached suffixes | Cleaned stanzas | `string[][]` with attached suffixes | Never touches `می`; omitted if no typesetting performed | `contracts/structure.ts:11` |
| 8 | Contract | `StructureResult.colophon` | Extracted composition date and place metadata | Trailing date/place patterns in raw text | `{ place?: string, raw: string, jalali?: { y, m, d }, gregorian?: string }` | Omitted if no colophon detected | `contracts/structure.ts:12` |
| 9 | Pipeline (S0) | Colophon Extraction | Extracts colophon metadata from trailing lines | Raw text string | Extracted colophon object & stripped body | Returns untouched body if no colophon found | `packages/poem/src/colophon.ts`, ADR-0002 |
| 10 | Pipeline (S0) | Signal Separation | Splits text by explicit separators (`*`, `□`/`■`, blank lines, newlines, double-spaces, spaced `/`) | Raw body string | `Stanzas \| null` | Returns `null` if no signal markers exist | `packages/poem/src/structure.ts:29` |
| 11 | Pipeline (S0) | `looksStructured` Heuristic | Validates whether signal-split text matches poetic distribution | `stanzas: Stanzas` | `boolean` (true if median 2–12 words, max <= 22, >= 2 lines) | Returns `false` for flat text or prose | `packages/poem/src/structure.ts:62` |
| 12 | Pipeline (S1) | Forbidden Line-Start Glue | Hard constraint: prevents lines from starting with suffixes or clitics | Candidate line-break position | Boolean allow/reject | Line break cannot be placed immediately preceding forbidden token | `prompts/L1_structure_v2.md:10` |
| 13 | Pipeline (S1) | Forbidden Line-End Dangling | Hard constraint: prevents lines from ending on prepositions/conjunctions without punctuation | Candidate line-break position | Boolean allow/reject | Line break cannot be placed immediately following dangling token | `prompts/L1_structure_v2.md:12` |
| 14 | Pipeline (S1) | Compound Preservation | Keeps `X به X` (`در به در`), `تو در تو`, and repeated `X X` unbroken | Token n-grams | Forced contiguous token grouping | Break within compound is prohibited | `prompts/L1_structure_v2.md:13` |
| 15 | Pipeline (S1) | Ezafe Chain Preservation | Keeps ezafe chains up to 3 tokens intact when ending on noun+`ِ` | Token n-grams with ezafe | Forced grouping | Prevents line ending on dangling ezafe | `prompts/L1_structure_v2.md:13` |
| 16 | Pipeline (S2) | Form Classification | Classifies verse form via n-gram periodicity, rhyme regularity, CV, colloquial markers | Token stream, n-gram stats | `Form` | Fallback to `free_verse` or `prose` | `prompts/L1_structure_v2.md:15` |
| 17 | Pipeline (S3) | Radif Detection Grid | Detects repeated 1–3 token end phrases with inter-gap CV <= 0.35 | Token sequence of classical poem | Radif string, occurrences, anchor indices | Returns undefined if CV > 0.35 or count < 3 | `prompts/L1_structure_v2.md:17` |
| 18 | Pipeline (S3) | Epiphora Break Placement | Places hemistich break AFTER the radif token, never before | Radif anchor positions | Line break placement | Prevents radif from starting following line | `prompts/L1_structure_v2.md:19` |
| 19 | Pipeline (S3) | Dual Hypothesis Grid (H1/H2) | Evaluates Masnavi (H1: every hemistich) vs Ghazal (H2: end of beyt + midpoint snapping) | Token intervals between anchors | Selected hypothesis & hemistich boundaries | Prior 22–55 chars; fallback to S5 if variance too high | `prompts/L1_structure_v2.md:20` |
| 20 | Pipeline (S3) | Beyt & Stanza Emission | Generates `beyts: [string, string][]` and `stanzas: string[][]` (one beyt per stanza) | Paired hemistichs | Paired beyt array & stanza array | Emits both structures synchronized | `contracts/structure.ts:5-6` |
| 21 | Pipeline (S4) | Pure-TS Boundary Model | Logistic regression for colloquial and free verse boundary detection | Gap features (glue, punctuation, verb endings, repeats, length z-scores) | Gap probability [0, 1] | Zero external dependencies; dot product inference via `weights.json` | `prompts/L1_structure_v2.md:24` |
| 22 | Pipeline (S4) | Anaphora/Epiphora Direction Learning | Uses left/right repeated n-gram features so model learns repeat directionality | Gap context tokens | Learned break direction | Prevents hard-coding mistakes for repeated phrases | `prompts/L1_structure_v2.md:24` |
| 23 | Pipeline (S4) | Probability Calibration | Calibrates logistic raw scores via Platt or isotonic scaling | Raw dot products | Calibrated confidence score | ECE target <= 0.08 | `prompts/L1_structure_v2.md:24`, `ORIGINAL_REQUEST.md:443` |
| 24 | Pipeline (S5) | Non-Uniform DP Fallback | Dynamic programming line reflow with glue constraints and orphan penalty | Unstructured token sequence | `string[]` lines | No uniform-length target; confidence <= 0.4; flags `low_confidence` | `prompts/L1_structure_v2.md:26` |
| 25 | Pipeline (S6) | Cached/Budget-Capped LLM Pass | Discretionary LLM fallback when confidence < 0.7 | Low-confidence text | Structured whitespace | Skipped if budget exceeded or offline; letter-fingerprint verified | `prompts/L1_structure_v2.md:28`, `_COMMON.md:8` |
| 26 | Pipeline (S7) | Non-Neural Typo Detection | Non-destructive token frequency lexicon comparison (count <= 2, neighbor >= 50x) | Token frequencies & edit distances | `StructureResult.typos` entries | Flags only; original text remains 100% faithful | `prompts/L1_structure_v2.md:30` |
| 27 | Pipeline (S8) | Display Typeset Layer | Derives display representation by attaching standalone suffixes with ZWNJ | Validated stanzas | `string[][]` typeset lines | Attaches `ی ها های تر ترین` to previous word; NEVER touches `می` | `prompts/L1_structure_v2.md:32` |
| 28 | Invariant | Letter-Fingerprint Preservation | Strict verification that text letters remain identical before and after structuring | Raw text vs structured text | Boolean equivalence check | Discard result and fail if letter fingerprint changes | `ORIGINAL_REQUEST.md:380`, `_COMMON.md:17` |

---

## 3. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | S8 Typeset Layer | Token sequence containing `می` as a noun («می ناب», «جام می») | S8 must NEVER attach `می` to adjacent tokens with ZWNJ; `می` must remain a standalone word. |
| 2 | S1 Line-Start Glue | Token sequence where line would start with `ی` («دیوونه ی در به دره») | S1 forbids `ی` from starting a line; the break must precede `دیوونه` or be deferred. |
| 3 | S1 Line-Start Suffixes | Token sequence containing detached verb endings or copulas («بهار ست هنوز») | S1 forbids `ست` or `است` from starting a line; must be glued to the preceding token. |
| 4 | S1 Line-End Glue | Line ending in preposition or conjunction with punctuation («همواره، در امتداد...») | Preposition `در` ending a line is forbidden, but if immediately followed by punctuation (`در،`), it is permitted. |
| 5 | S1 Compound Words | Compound `در به در` or `لا به لا` | S1 prohibits placing a line break between `در`, `به`, and `در`; compound must remain on the same line. |
| 6 | S0 Colophon Extraction | 2-digit Jalali year at end of poem («تنکابن، 14/2/65» or «27/2/88») | Deterministically normalizes `65` to `1365` and `88` to `1388`; strips from body; sets `footer_removed` flag. |
| 7 | S0 Colophon Extraction | Trailing seasonal year («زمستان 1331») | Deterministically extracts Jalali year `1331` and maps season «زمستان» to month `10`; strips from body. |
| 8 | S0 Editorial Signals | Stray line containing only digits or punctuation («(2)», «.....», «*») | S0 filters out signal-only lines; they do not appear in output `stanzas` or count as content. |
| 9 | S3 Radif Break Placement | Classical poem ending lines in radif «هنوز» | S3 places hemistich break AFTER «هنوز», never before it (fixing legacy bug where «هنوز» began lines). |
| 10 | S3 Classical Matla | First beyt of ghazal where both hemistichs end with radif | S3 detects H1 match for matla (both lines anchored), transitioning to H2 for subsequent beyts. |
| 11 | S4 Modern Boundary | Poem with anaphora (repeated phrase at line starts) | S4 uses right-repeat feature to place break BEFORE the repeated phrase, preventing inverted line splits. |
| 12 | S5 Heuristic Fallback | Text without signals where S0–S4 fail to achieve threshold | S5 reflows using DP without fixed length target; emits `origin: 'heuristic'`, `confidence <= 0.4`, and `flags: ['low_confidence']`. |
| 13 | S7 Typo Detection | Typo token `متظر` with high-frequency neighbor `منتظر` (ratio >= 50x) | Adds `{ token: 'متظر', suggestion: 'منتظر', ratio: 52 }` to `typos`; adds `'possible_typo'` to `flags`; does NOT change `متظر` in `stanzas`. |
| 14 | S6 LLM Fallback | LLM response that inadvertently alters or autocorrects a Persian character | `letterFingerprint` validation detects discrepancy; immediately discards LLM output; falls back to S5. |
| 15 | S0 Minimal Input | Empty string, single word, or whitespace-only input | `looksStructured` returns false; returns graceful fallback `stanzas` without uncaught exceptions. |

---

## 4. Logic Chain

The step-by-step reasoning supporting the specification findings:

1. **Observation 1.1 establishes the contract baseline**: `contracts/structure.ts` defines the authoritative types `Form`, `StructureResult`, and function `structurePoem(text: string, o?: { poetId?: string }): StructureResult`. The contract is frozen (`H6`), meaning any implementation in `packages/poem` must conform exactly to these exported types.
2. **Observation 1.2 explains the root cause of legacy failures**: In legacy `packages/poem/src/structure.ts`, `reconstructLines` used a hardcoded `TARGET_LINE_LENGTH = 24` with quadratic penalties (`diff * diff`). This forced lines into artificial 3–6 word blocks regardless of poetic form, split compounds like `در به در`, allowed suffixes (`ی`, `ها`) to start lines, and broke radif phrases (`هنوز`) into line starts.
3. **Connecting 1.2 to 1.3 demonstrates how S0–S8 resolves the 4 golden shots**:
   - **Shot 1 (Soheili)**: The radif «هنوز» occurs at the end of each beyt. S3's rule—that recurring radif tokens end hemistichs and breaks are placed strictly AFTER them—guarantees that >= 90% of rhymed lines end with «هنوز», directly satisfying the Shot 1 acceptance criterion.
   - **Shot 2 (Heydarzadeh)**: The colloquial text contains compounds (`در به در`, `لا به لا`) and detached suffixes (`یه دیوونه ی`). S1's hard constraints forbid line breaks inside `X به X` and forbid lines starting with `ی`. S4's colloquial boundary model handles rhythm without uniform length bias.
   - **Shot 3 (Ahmadi)**: Free verse with copulas and prepositions (`را`, `است`, `در`). S1 ensures zero dangling lines without punctuation and zero lines starting with `را`, meeting the zero-defect criterion.
   - **Shot 4 (Shahriar)**: Classical ghazal with 12 beyts rhyming in `-رم`. S3's H2 hypothesis detects beyt anchors and snaps midpoints to glue-valid boundaries, producing pairs of near-equal hemistichs and emitting both `beyts` and `stanzas`.
4. **Connecting 1.2 and 1.4 to performance and calibration metrics**:
   - S4's requirement for pure-TypeScript SGD logistic regression with `weights.json` ensures zero external dependencies and single-vector dot-product inference, guaranteeing median execution time `<= 5 ms/poem` (well under the budget).
   - Platt or isotonic calibration ensures that `confidence` corresponds to empirical precision, achieving `ECE <= 0.08`.
   - Strict `letterFingerprint` hashing guarantees 100% letter preservation across all pipeline stages.
5. **Connecting 1.5 to repository governance**:
   - Every modification made by any future agent must be recorded in `lib/changelog.ts` with Persian semantic versioning and strict compliance with AGENTS.md (no emojis, no buzzwords, fluent Persian).

---

## 5. Caveats

1. **Frozen Contracts**: `contracts/structure.ts` is frozen. If the implementation requires additional metadata not currently in `StructureResult`, it cannot alter `contracts/structure.ts` directly; it must record a Contract Change Request (CCR) in `STATUS.md`.
2. **LLM Availability**: Stage S6 is strictly optional and budget-capped ($5). In automated test and CI environments, S6 may be unreachable or disabled; all acceptance tests and benchmark evaluations must pass through S0–S5 without requiring S6.
3. **Training Data Separation**: The S4 boundary model must be evaluated strictly using **leave-poet-out** cross-validation. Evaluating on in-sample poets would produce an inflated F1 score violating rule `H4`.
4. **Persian Word «می»**: Under no circumstances should S8 attach «می» with ZWNJ, as it is a common Persian noun meaning "wine" in classical literature.

---

## 6. Conclusion

Structure Engine v2 replaces the flawed, length-targeted DP heuristic with a deterministic 9-stage pipeline (S0–S8) conforming to `contracts/structure.ts`:
1. **S0**: Fast-path for explicitly structured texts via separators and colophon extraction.
2. **S1**: Hard glue constraints enforcing line-start, line-end, compound, and ezafe preservation across all stages.
3. **S2 & S3**: Accurate form classification and rhyme-grid processing for classical verse, guaranteeing break placement after radif and emitting balanced 2-hemistich beyts.
4. **S4 & S5**: Lightweight pure-TS boundary model for modern verse with DP fallback, eliminating artificial line truncation.
5. **S6, S7 & S8**: Safe LLM fallback, non-destructive typo flagging, and aesthetic ZWNJ typesetting that strictly preserves letter fidelity.

All acceptance criteria, fixture requirements (Shots #1–#4), corpus invariants (0 dangling lines, 0 glue-suffix line starts, 100% letter fingerprint), and performance budgets (<= 5 ms/poem, ECE <= 0.08, classical F1 >= 0.97) are unambiguously defined and ready for implementation.

---

## 7. Verification Method

To independently verify the specification and test future implementation:

1. **Unit & Property Tests**:
   ```bash
   bun test packages/poem
   ```
   Must pass all tests green with zero failures.

2. **TypeScript Contract Conformance**:
   ```bash
   bunx tsc --noEmit -p packages/poem/tsconfig.json
   ```
   Ensures complete type compliance with `contracts/structure.ts`.

3. **Behavioral Golden Shots Verification (`data/golden/shots.jsonl`)**:
   Verify against all 4 golden shots:
   - Shot #1 (Soheili): `>= 90%` of lines ending a hemistich end with «هنوز».
   - Shot #4 (Shahriar): Every beyt contains exactly 2 hemistichs of near-equal length.
   - Shots #2 & #3 (Heydarzadeh & Ahmadi): Zero lines start with glue tokens; zero lines end dangling without punctuation.
   - All 4 shots format to `<= 10 words` per line.

4. **Corpus Invariants & Benchmark Evaluation (`pipeline/eval-structure.ts`)**:
   ```bash
   bun run pipeline/eval-structure.ts
   ```
   Verifies:
   - Zero lines starting with standalone glue tokens across the corpus.
   - Zero lines ending dangling without punctuation across the corpus.
   - 100% letter-fingerprint preservation rate (`letterFingerprint(s)`).
   - Leave-poet-out boundary F1 on flattened Hafez >= 0.97; free verse & colloquial >= 0.80.
   - ECE <= 0.08.
   - Median runtime <= 5 ms/poem.

5. **Legacy Golden Contracts Preservation**:
   ```bash
   bun test
   ```
   Verify all 30 golden contract baselines in `data/golden/legacy30/` remain passing.
