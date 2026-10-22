# Handoff Report: Codebase Survey for Structure Engine v2

## 1. Observation

Direct inspection of the repository revealed the following structural, dependency, and test findings:

### 1.1 Monorepo Workspace Configuration
- **Root `package.json`**:
  - Defines Bun workspaces: `"workspaces": ["apps/*", "packages/*"]`.
  - Defines package test and evaluation scripts:
    - `"test": "bun test"`
    - `"test:packages": "bun test packages/"`
    - `"typecheck": "tsc --noEmit"`
    - `"build:data": "bun pipeline/migrate-legacy.ts"`
    - `"data:validate": "bun pipeline/validate-data.ts"`
    - `"eval:structure": "bun pipeline/eval-structure.ts"`
    - `"eval:search": "bun pipeline/eval-search.ts"`
  - Lists workspace dependencies under `devDependencies`:
    `@persian-quote/persian`, `@persian-quote/poem`, `@persian-quote/schema`, `@persian-quote/core`, `@persian-quote/search`, `@persian-quote/widget`, `@persian-quote/mcp`, `@persian-quote/sdk-ts`.
- **Root `tsconfig.json`**:
  - Configures path aliases for all packages:
    - `@persian-quote/poem` -> `./packages/poem/src/index.ts`
    - `@persian-quote/persian` -> `./packages/persian/src/index.ts`
    - `@persian-quote/schema` -> `./packages/schema/src/index.ts`
    - `@persian-quote/core` -> `./packages/core/src/index.ts`
    - `@persian-quote/search` -> `./packages/search/src/index.ts`
    - `@persian-quote/widget` -> `./packages/widget/src/index.ts`
    - `@persian-quote/mcp` -> `./packages/mcp/src/index.ts`
    - `@persian-quote/sdk-ts` -> `./packages/sdk-ts/src/index.ts`

### 1.2 `packages/poem` Structure and State
- **Path**: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/packages/poem`
- **Configuration**:
  - `package.json`: Name `@persian-quote/poem`, version `1.0.0`, dependencies: `"@persian-quote/persian": "workspace:*"`, `"@persian-quote/schema": "workspace:*"`. Scripts: `"test": "bun test"`, `"typecheck": "tsc --noEmit"`.
  - `tsconfig.json`: Targets `ESNext`, paths mapped to `../persian/src/index.ts` and `../schema/src/index.ts`.
- **Source Files in `packages/poem/src/`**:
  - `index.ts`: Re-exports `colophon`, `structure`, `excerpt`, `rhyme`, `meter`, `attribution`.
  - `structure.ts` (207 lines): Contains v1 implementation:
    - `cleanLine(s: string): string`
    - `letterFingerprint(s: string): string`
    - `splitBySignals(raw: string): Stanzas | null`
    - `looksStructured(stanzas: Stanzas): boolean`
    - `reconstructLines(text: string): string[]` (dynamic programming line wrap targeting 24 characters)
    - `analyzeStructure(raw: string): AnalyzedStructure`
    - Note: It does NOT export `structurePoem(text: string, o?: { poetId?: string }): StructureResult`.
  - `colophon.ts` (224 lines): Implements `extractColophon(raw: string)` extracting place, Jalali date (`{y, m, d}`), Gregorian ISO date, and stripped body. Passes Acceptance Fixture A1 (Salman Harati).
  - `excerpt.ts` (175 lines): Implements `pickExcerpt(stanzas, opts)` scoring window boundaries and avoiding dangling tokens.
  - `rhyme.ts` (111 lines): Implements `detectRadifAndQafiyeh(stanzas)`.
  - `meter.ts` (95 lines): Implements `detectMeter(stanzas, form)`.
  - `attribution.ts` (35 lines): Implements `determineAttribution(poetSlug, sourceBook, category)`.
- **Tests in `packages/poem/tests/`**:
  - `poem.test.ts` (236 lines): 15 tests covering Fixture A1, Fixture A2, Fixture A3, `reconstructLines`, `analyzeStructure`, `pickExcerpt`, `detectRadifAndQafiyeh`, `detectMeter`, `determineAttribution`, fast-check property idempotency, and letter-fingerprint preservation.
  - Output of `bun test packages/poem`:
    `15 pass, 0 fail, 255 expect() calls, 116.00ms`.

### 1.3 `packages/persian` and `packages/schema` Utilities
- **`packages/persian/src/`**:
  - `cleaner.ts`: `cleanLine(s: string)` (strips tatweel, directional marks, fixes spacing around punctuation, trims ZWNJ); `assertPersianTypography(text: string)`.
  - `normalizer.ts`: `normalizeDisplay(s: string)` (NFC, fixes Arabic forms while preserving diacritics/harakat/tanwin); `normalizeSearch(s: string, options)` (folds alef/yeh/kaf/heh, strips harakat and tatweel, converts digits to ASCII).
  - `tokenizer.ts`: `tokenize(s: string, options)` (word tokenization preserving internal ZWNJ).
  - `stemmer.ts`: `lightStem(word: string, options)` (strips verbal prefixes like می/نمی/بی and nominal suffixes like هایمان/ترین/ها/تر/ام/ات/اش).
  - `digits.ts`: `toAsciiDigits`, `toPersianDigits`, `toArabicDigits`.
  - `calendar.ts`: Jalali to Gregorian conversion (`jalaliToGregorian`), `gregorianToJalali`, `daysInJalaliMonth`, `parseJalaliDate`.
  - `bidi.ts`: Text direction detection, isolate wrapping.
  - `finglish.ts`: Finglish query transliteration.
  - `fuzzy.ts`: Levenshtein distance calculation for Persian.
  - Test suite: `packages/persian/test/` runs 69 tests across 10 files with 100% pass rate.
- **`packages/schema/src/`**:
  - `models/poem.ts`: Defines `PoeticFormEnum` (12 classical/modern forms), `StanzaSchema`, `StanzasSchema`, `ExcerptSchema`, `StructureOriginEnum` (`separators`, `inferred`, `manual`, `unstructured`), `StructureMetaSchema`, `PoemSchema`.
  - `common/`: `StableIdSchema`, `ColophonSchema`, `RightsSchema`, `AttributionSchema`, `MeterSchema`.
  - `api/`: `problem-details.ts` (RFC 9457), `legacy.ts`.
  - Test suite: `packages/schema/test/` runs 46 tests across 6 files with 100% pass rate.

### 1.4 Frozen Contracts (`contracts/`)
- **`contracts/structure.ts`**:
  ```typescript
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
- **Other Contracts in `contracts/`**:
  - `contracts/corpus.ts`: Shared types (`WorkRef`, `Work`, `Corpus`, `KwicRow`, `VerseMatch`, `VerseIndex`, `CollationTable`, `Quiz`).
  - `contracts/arud.ts`: `scanHemistich`, `scanPoem`.
  - `contracts/review.ts`: `ReviewItem`, `HumanPatch`, `validatePatch`.
  - `contracts/tools.ts`: `kwic`, `wordFreq`, `buildVerseIndex`, `identifyVerse`, `collate`, `cite`, `makeQuiz`.
  - `contracts/workbench.ts`: `CorpusHandle`, `WorkbenchCtx`, `TabDef`.
  - `contracts/research.ts`: `Echo`, `StyleProfile`, `attribute`, `EmbedProvider`, `AtlasPoint`, `QueryFilters`, `parseQuery`.

### 1.5 Benchmarks and Golden Datasets
- **`data/golden/shots.jsonl`**:
  Contains 4 verified behavioral reference poems:
  1. `mehdi-soheili.general.142` (Mehdi Soheili, Shot #1): classical radif «هنوز» ending hemistichs.
  2. `maryam-heydarzadeh.general.26` (Maryam Heydarzadeh, Shot #2): colloquial verse, testing S1 glue constraints (no glue start, no dangling end, ezafe/compound preservation).
  3. `ahmadreza-ahmadi.general.18` (Ahmadreza Ahmadi, Shot #3): free verse, testing S1 glue constraints.
  4. `shahriar.general.72` (Shahriar, Shot #4): classical ghazal ("یار و همسر نگرفتم که گرو بود سرم"), testing 2-hemistich beyts of balanced length.
- **`data/golden/sample300.jsonl`**:
  Contains 300 stratified canonical works representing all forms and eras for T1 evaluation.
- **`data/golden/legacy30/`**:
  Contains 30 golden contract response files ensuring backward compatibility.
- **`pipeline/eval-structure.ts`**:
  Evaluates 1,437 canonical works across 5-fold leave-poet-out cross validation with honest flattening (no signal leakage).
- **`STATUS.md`**:
  Records Wave 0.2 baseline on naive DP line reconstruction:
  - Line boundary F1: 0.1423 (Precision: 0.1008, Recall: 0.2422).
  - Stanza boundary F1: 0.0000.
  - Per-form Line F1: ghazal 0.1851, nimaee 0.1203, sepid 0.0913.

### 1.6 Overall Monorepo Test Status
Executing `bun test packages/` tests all 8 packages:
`174 pass, 0 fail, 968 expect() calls, 4.73s`.

---

## 2. Logic Chain

1. **Workspace and Dependencies**:
   - `package.json` and `tsconfig.json` establish that `@persian-quote/poem` is an isolated Bun workspace package referencing `@persian-quote/persian` and `@persian-quote/schema`.
   - Any new code in `packages/poem` can import utilities directly from `@persian-quote/persian` (e.g., `cleanLine`, `normalizeDisplay`, `tokenize`, `lightStem`, `toAsciiDigits`, `jalaliToGregorian`) and types from `@persian-quote/schema` or `contracts/structure.ts`.

2. **Existing Implementation vs Target Requirements**:
   - `packages/poem` currently contains baseline v1 utilities: `analyzeStructure`, `extractColophon`, `reconstructLines`, `splitBySignals`, `looksStructured`, `pickExcerpt`, `detectRadifAndQafiyeh`, `detectMeter`, `determineAttribution`.
   - `contracts/structure.ts` defines the canonical frozen contract: `structurePoem(text: string, o?: { poetId?: string }): StructureResult`.
   - Currently, `structurePoem` is NOT implemented in `packages/poem/src/structure.ts`.
   - Therefore, implementers must implement `structurePoem` in `packages/poem` conforming strictly to `contracts/structure.ts`.

3. **Stage Breakdown for Implementation**:
   - **S0 (Footer + Signals)**: Reuses `extractColophon` from `./colophon.ts`, then checks `splitBySignals` and `looksStructured`. If structured, returns origin `"separators"` and confidence 0.95.
   - **S1 (Hard Glue Constraints)**: Needs token-level validation rules:
     - Disallowed starting tokens: `ی`, `ها`, `های`, `تر`, `ترین`, `ام`, `ات`, `اش`, `مان`, `تان`, `شان`, `را`, `است`, `بود`, `شد`, `نیست`, `هست`.
     - Disallowed ending tokens (without punctuation): `ای`, `می`, `نمی`, `بی`, `همی`, `و`, `که`, `تا`, `یا`, `از`, `به`, `در`, `با`, `بر`, `چون`, `اگر`, `ولی`, `اما`.
     - Preserved compounds: `X به X` (e.g. `در به در`, `لا به لا`), `تو در تو`, `X X`, and ezafe chains.
   - **S2 (Form Classifier)**: Distinguishes `classical_rhymed`, `free_verse`, `colloquial`, and `prose`.
   - **S3 (Classical Rhyme Grid)**: Detects radif candidate n-grams and qafiyeh; ensures breaks are placed AFTER repeating end-tokens (not before); generates beyts with equal hemistichs.
   - **S4 (Modern Boundary Model)**: Pure-TypeScript logistic regression with SGD and weights export; leave-poet-out evaluation.
   - **S5 (Heuristic Fallback)**: Dynamic programming adhering to S1 glue constraints with orphan penalties, confidence <= 0.4.
   - **S6 (LLM Pass)**: Optional, cached, fingerprint-verified.
   - **S7 (Typo Flags)**: Non-neural frequency lexicon flagging rare tokens.
   - **S8 (Typeset Layer)**: Attaches standalone suffixes (`ی`, `ها`, etc.) with ZWNJ while never touching `می`.

4. **Testing and Verification Architecture**:
   - `bun test packages/poem` runs fast (< 150ms) using Bun's built-in test runner.
   - All tests in `packages/` currently pass green.
   - Golden test files (`data/golden/shots.jsonl`, `sample300.jsonl`, `legacy30/`) and evaluation scripts (`pipeline/eval-structure.ts`) are already set up and ready to validate new stages.

---

## 3. Caveats

1. `contracts/structure.ts` is explicitly marked `(FROZEN)`. No changes should be made to `contracts/structure.ts`.
2. Existing tests in `packages/poem/tests/poem.test.ts` test `analyzeStructure` and existing helper functions. New tests for `structurePoem` should be added to `packages/poem/tests/` without breaking existing test coverage.
3. In `pipeline/eval-structure.ts`, evaluation currently calls `analyzeStructure(flatText)`. When Structure Engine v2 is implemented, the evaluation pipeline should be updated to evaluate `structurePoem(flatText)`.
4. Production constraints requirerequest paths to remain zero-dependency (no external npm runtime packages beyond workspace dependencies).

---

## 4. Conclusion

The repository is healthy, properly configured as a Bun monorepo with 8 workspace packages, and all existing 174 package tests pass green.

For the implementation of Structure Engine v2:
- `@persian-quote/poem` has all necessary workspace linkages to `@persian-quote/persian` and `@persian-quote/schema`.
- High quality Persian NLP utilities (tokenization, stemmer, cleaner, normalizer, Jalali calendar) are already implemented and tested in `@persian-quote/persian`.
- Frozen contracts (`contracts/structure.ts`), specifications (`prompts/L1_structure_v2.md`), and golden benchmark datasets (`data/golden/shots.jsonl`, `sample300.jsonl`) are in place.
- The next step is for the implementation lane (L1) to build the 9 stages (S0-S8) of `structurePoem` in `packages/poem` conforming strictly to `contracts/structure.ts`.

---

## 5. Verification Method

To independently verify the survey findings:

1. **Verify Root Workspaces and Dependencies**:
   ```bash
   cat package.json | grep -A 4 '"workspaces"'
   cat tsconfig.json | grep -A 20 '"paths"'
   ```

2. **Verify `packages/poem` Configuration and Current Tests**:
   ```bash
   bun test packages/poem
   ```
   Expected output: 15 tests pass green in ~100-150ms.

3. **Verify All Workspace Package Tests**:
   ```bash
   bun test packages/
   ```
   Expected output: 174 tests pass across 22 files in ~4-5s.

4. **Verify Existing Golden Datasets**:
   ```bash
   wc -l data/golden/shots.jsonl
   wc -l data/golden/sample300.jsonl
   ls -la contracts/structure.ts
   ```
   Expected output:
   - `shots.jsonl`: 4 records (plus blank line).
   - `sample300.jsonl`: 300 records.
   - `contracts/structure.ts`: exists with `structurePoem` declaration.
