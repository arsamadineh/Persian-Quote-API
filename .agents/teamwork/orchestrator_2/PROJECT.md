# PROJECT: Structure Engine v2

## Architecture
Structure Engine v2 is a deterministic, multi-stage Persian verse segmentation and structuring pipeline located in `packages/poem/src/`. It conforms strictly to the frozen contract in `contracts/structure.ts` (`structurePoem(text: string, o?: { poetId?: string }): StructureResult`).

```
                    Raw Input Text
                          │
                          ▼
            ┌───────────────────────────┐
            │ S0: Colophon & Signals    │
            │ - Colophon extraction     │
            │ - Real separators split   │
            └─────────────┬─────────────┘
                          │
             looksStructured == true?
            ┌─────────────┴─────────────┐
      Yes   │                           │ No
            ▼                           ▼
   Origin: 'separators'       ┌───────────────────────────┐
   Confidence: 0.95           │ S1: Hard Glue Filter      │
            │                 │ - Build isValidBoundary[] │
            │                 └─────────────┬─────────────┘
            │                               │
            │                 ┌─────────────▼─────────────┐
            │                 │ S2: Form Classifier       │
            │                 │ - classical_rhymed        │
            │                 │ - free_verse              │
            │                 │ - colloquial              │
            │                 │ - prose                   │
            │                 └─────────────┬─────────────┘
            │                               │
            │           ┌───────────────────┴───────────────────┐
            │  Form == classical?                      Form != classical?
            │           │                                       │
            │           ▼                                       ▼
            │┌───────────────────────┐              ┌───────────────────────┐
            ││ S3: Rhyme Grid        │              │ S4: Boundary Model    │
            ││ - Radif Gap (CV<=0.35)│              │ - Logistic Regr. (SGD)│
            ││ - Qafiyeh Match       │              │ - Platt Calibrated    │
            ││ - H1 vs H2 Hypotheses │              └───────────┬───────────┘
            ││ - Midpoint Snapping   │                          │
            │└──────────┬────────────┘                 conf >= 0.70?
            │           │                           ┌───────────┴───────────┐
            │     conf >= 0.70?                Yes  │                       │ No
            │     ┌─────┴─────┐                     ▼                       ▼
            │Yes  │           │ No        Origin: 'boundary_model' ┌─────────────────┐
            │     ▼           │           Confidence: p_cal        │ S5: Heuristic DP│
            │Origin:          │                     │              │ - S1 Masks      │
            │'rhyme_grid'     │                     │              │ - Orphan Penalty│
            │                 │                     │              │ - No Uniform Len│
            │                 └───────────┬─────────┘              └────────┬────────┘
            │                             ▼                                 │
            │                  ┌─────────────────────┐                      ▼
            │                  │ S6: LLM Pass        │              Origin: 'heuristic'
            │                  │ (if enabled & <0.70)│              Confidence: 0.35
            │                  └──────────┬──────────┘              Flag: 'low_conf'
            │                             │                                 │
            └─────────────────────────────┼─────────────────────────────────┘
                                          ▼
                              ┌───────────────────────────┐
                              │ S7: Typo Flags            │
                              │ - Lexicon frequency check │
                              │ - Dist 1/2, ratio >= 50x  │
                              │ - Non-destructive flags   │
                              └─────────────┬─────────────┘
                                          │
                              ┌─────────────▼─────────────┐
                              │ S8: Typeset Layer         │
                              │ - Attach standalone suffix│
                              │   with ZWNJ (\u200c)      │
                              │ - Never touch می          │
                              └─────────────┬─────────────┘
                                          │
                                          ▼
                                   StructureResult
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | S0 Colophon Extraction | Extract place, Jalali date, Gregorian date from trailing lines | M-STRUCT | Survey / ADR-0002 |
| 2 | S0 Signal Splitting | Split text by explicit separators (*, blank line, \n, double-space, spaced /) | M-STRUCT | Survey |
| 3 | S0 looksStructured Filter | Validate median word count 2-12, max <= 22, >= 2 lines | M-STRUCT | Survey |
| 4 | S1 Forbidden Starts | Mask boundaries starting with standalone suffixes (ی ها های تر ترین ام ات اش مان تان شان) or copulas (را است بود شد نیست هست) | M-STRUCT | Survey / R1 |
| 5 | S1 Forbidden Ends | Mask boundaries ending in dangling tokens (ای می نمی بی همی و که تا یا از به در با بر چون اگر ولی اما) without punctuation | M-STRUCT | Survey / R1 |
| 6 | S1 Compound Preservation | Keep X به X (در به در, لا به لا, سر به سر, روز به روز), تو در تو, and X X intact | M-STRUCT | Survey / R1 |
| 7 | S1 Ezafe Chain Preservation | Keep ezafe chains up to 3 tokens intact when ending on noun + ezafe | M-STRUCT | Survey / R1 |
| 8 | S2 Form Classification | Classify classical_rhymed, free_verse, colloquial, prose via periodicity, rhyme, CV, colloquial markers | M-STRUCT | Survey / R2 |
| 9 | S3 Radif Detection | Detect recurring end-tokens with gap CV <= 0.35; place hemistich break strictly AFTER radif | M-STRUCT | Survey / R2 |
| 10 | S3 Qafiyeh & Hypotheses | Match qafiyeh ravi; evaluate H1 (hemistich) vs H2 (beyt midpoint snapping to S1-valid boundaries) | M-STRUCT | Survey / R2 |
| 11 | S3 Beyt & Stanza Output | Emit synchronized beyts [string, string][] and stanzas string[][] | M-STRUCT | Survey / contracts/structure.ts |
| 12 | S4 Modern Boundary Model | Pure-TS 12-feature logistic regression (weights in weights.json), zero runtime deps | M-STRUCT | Survey / R3 |
| 13 | S4 Probability Calibration | Platt scaling calibration layer achieving ECE <= 0.08 | M-STRUCT | Survey / R3 |
| 14 | S5 Heuristic DP Fallback | Dynamic programming with S1 mask, orphan penalties (+80 1-word, +60 dangling ending), no uniform-length target | M-STRUCT | Survey / R3 |
| 15 | S6 LLM Pass Guard | Conditional fallback (<0.70 confidence), cached, budget-capped, 100% letterFingerprint invariant | M-STRUCT | Survey / R3 |
| 16 | S7 Typo Flags | Non-destructive frequency lexicon flags for rare tokens (<=2 count) with >=50x neighbors | M-STRUCT | Survey / R4 |
| 17 | S8 Typeset Layer | Derived display layer attaching standalone suffixes (ی ها های تر ترین) with ZWNJ; never touch می | M-STRUCT | Survey / R4 |
| 18 | Golden Fixture Shot #1 | Soheili: >= 90% lines ending hemistich end with «هنوز», all lines <= 10 words | M-STRUCT | Acceptance Criteria |
| 19 | Golden Fixture Shot #2 | Heydarzadeh: 0 glue start, 0 dangling end, all lines <= 10 words | M-STRUCT | Acceptance Criteria |
| 20 | Golden Fixture Shot #3 | Ahmadi: 0 glue start, 0 dangling end, all lines <= 10 words | M-STRUCT | Acceptance Criteria |
| 21 | Golden Fixture Shot #4 | Shahriar: 2 hemistichs of near-equal length per beyt, all lines <= 10 words | M-STRUCT | Acceptance Criteria |
| 22 | Corpus Invariant 1 | 0 lines starting with standalone glue-suffix across corpus | M-STRUCT | Acceptance Criteria |
| 23 | Corpus Invariant 2 | 0 lines ending on dangling token without punctuation across corpus | M-STRUCT | Acceptance Criteria |
| 24 | Corpus Invariant 3 | 100% letter-fingerprint preservation rate across all evaluated works | M-STRUCT | Acceptance Criteria |
| 25 | Performance Metric | Median inference runtime <= 5 ms/poem | M-STRUCT | Acceptance Criteria |
| 26 | Model F1 Metric | Classical Hafez F1 >= 0.97, modern verse F1 >= 0.80 | M-STRUCT | Acceptance Criteria |
| 27 | AGENTS.md Governance | Update lib/changelog.ts with Persian semver, no emojis, active voice | M-STRUCT | AGENTS.md |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M-STRUCT | Structure Engine v2 | Implement S0-S8 pipeline in packages/poem, weights.json, unit/fixture tests, verify acceptance criteria, update changelog | none | DONE |

## Interface Contracts
### `contracts/structure.ts`
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

## Code Layout
- `packages/poem/src/`
  - `glue.ts`: S1 Hard Glue constraints and boundary validation masks.
  - `form.ts`: S2 Form classification logic.
  - `rhyme-grid.ts`: S3 Classical rhyme grid (radif detection, qafiyeh, H1/H2 hypotheses, beyt/stanza emission).
  - `boundary-model.ts`: S4 Modern boundary model (logistic regression dot product, Platt calibration).
  - `weights.json`: S4 Trained weights and calibration constants.
  - `heuristic-dp.ts`: S5 Dynamic programming fallback with orphan penalties.
  - `llm-pass.ts`: S6 LLM fallback with letter-fingerprint guard.
  - `typos.ts`: S7 Non-destructive typo detection via frequency lexicon.
  - `typeset.ts`: S8 Visual typeset layer attaching standalone suffixes with ZWNJ.
  - `structure.ts`: Master orchestrator integrating S0-S8 and exporting `structurePoem`.
  - `index.ts`: Re-exporting `structurePoem` and auxiliary utilities.
- `packages/poem/tests/`
  - `structure-v2.test.ts`: Complete unit and behavioral test suite for S0-S8 and Golden Shots #1-#4.
- `lib/changelog.ts`: Project changelog updated strictly according to AGENTS.md.
