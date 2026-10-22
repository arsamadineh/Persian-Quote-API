# Dispatch for teamwork_preview_worker (worker_struct_1)

## Mission
Implement Structure Engine v2 in `packages/poem` conforming strictly to `contracts/structure.ts` (`structurePoem`), fixing line break leakage, detached prefixes/suffixes, and misaligned radif/rhymes across classical and modern Persian verse.

## Write Ownership
You have exclusive write ownership of:
- `packages/poem/src/glue.ts`
- `packages/poem/src/form.ts`
- `packages/poem/src/rhyme-grid.ts`
- `packages/poem/src/boundary-model.ts`
- `packages/poem/src/weights.json`
- `packages/poem/src/heuristic-dp.ts`
- `packages/poem/src/llm-pass.ts`
- `packages/poem/src/typos.ts`
- `packages/poem/src/typeset.ts`
- `packages/poem/src/structure.ts`
- `packages/poem/src/index.ts`
- `packages/poem/tests/structure-v2.test.ts`
- `lib/changelog.ts`

DO NOT edit any other packages or root contract files (`contracts/structure.ts` is FROZEN).

## Mandatory Reference Documents
Read these before starting:
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md` (specifically lines 388-446)
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_2/PROJECT.md`
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_1/handoff.md` (S0, S1, S2, S7, S8 guides)
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_2/handoff.md` (S3 Rhyme Grid guide)
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_3/handoff.md` (S4, S5, S6 guides)
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/AGENTS.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Detailed Requirements
1. **S0 (Signals & Colophon)**: Extract colophon via `extractColophon`, strip colophon from body, set `footer_removed` in flags, split by separators (`*`, `□■`, blank line, newline, double-space, spaced `/`). If `looksStructured`, set `origin = 'separators'`, `confidence = 0.95`.
2. **S1 (Hard Glue Constraints)**: Implement in `glue.ts`.
   - Never START a line with: standalone `ی`, `ها`, `های`, `تر`, `ترین`, `ام`, `ات`, `اش`, `مان`, `تان`, `شان`, `را`, `است`, `ست`, `بود`, `شد`, `نیست`, `هست`.
   - Never END a line (unless punctuation follows) with: `ای`, `می`, `نمی`, `بی`, `همی`, `و`, `که`, `تا`, `یا`, `از`, `به`, `در`, `با`, `بر`, `چون`, `اگر`, `ولی`, `اما`.
   - Keep whole: `X به X` compounds (`در به در`, `در به دره`, `لا به لا`, `لا به لاش`, `روز به روز`, `سر به سر`), `تو در تو`, immediate repeats `X X`, and ezafe chains.
   - Generate `Uint8Array` mask `isValidBoundary`.
3. **S2 (Form Classifier)**: Implement in `form.ts`. Classify `Form` (`classical_rhymed`, `free_verse`, `colloquial`, `prose`).
4. **S3 (Classical Rhyme Grid)**: Implement in `rhyme-grid.ts`.
   - Radif n-gram detection (gap CV <= 0.35, break strictly AFTER radif).
   - Qafiyeh matching on preceding token.
   - H1 (masnavi) vs H2 (ghazal/qasida) hypothesis selection.
   - S1 midpoint snapping to glue-valid boundaries.
   - Emit synchronized `beyts: [string, string][]` and `stanzas: string[][]`.
5. **S4 (Modern Boundary Model)**: Implement in `boundary-model.ts` and `weights.json`.
   - Pure-TS logistic regression with 12 features. Zero external dependencies.
   - Platt scaling calibration ($A, B$) yielding ECE <= 0.08.
6. **S5 (Heuristic Fallback)**: Implement in `heuristic-dp.ts`.
   - DP segmentation adhering to S1 masks. No uniform 24-character target!
   - Orphan penalties (+80 for 1-word, +60 for dangling ends) and syntactic rewards.
   - Emits `origin = 'heuristic'`, `confidence = 0.35`, `flags: ['low_confidence']`.
7. **S6 (LLM Pass Guard)**: Implement in `llm-pass.ts`.
   - Guarded by 100% letterFingerprint check, SHA-256 caching.
8. **S7 (Typo Flags)**: Implement in `typos.ts`.
   - Non-destructive frequency lexicon check. Sets `typos` and `possible_typo` flag without changing text.
9. **S8 (Typeset Layer)**: Implement in `typeset.ts`.
   - Attaches standalone suffixes (`ی ها های تر ترین`) to previous token with ZWNJ (`\u200c`).
   - NEVER touch `می`.
10. **`structurePoem`**: Master orchestrator in `structure.ts` integrating S0-S8 and conforming to `contracts/structure.ts`.
11. **Tests & Invariants**:
    - Add comprehensive unit and fixture tests in `packages/poem/tests/structure-v2.test.ts`.
    - Verify Shots #1, #2, #3, #4 in `data/golden/shots.jsonl`.
    - Verify 0 glue start violations, 0 dangling end violations, 100% letter-fingerprint preservation, <= 10 words/line.
12. **AGENTS.md Governance**:
    - Update `lib/changelog.ts` with Persian semver digits (`"۳.۸.۲"`), Gregorian isoDate, Persian date, typed change array, active voice, beginner-friendly Persian.
    - Zero emojis anywhere.

## Verification Requirements
You MUST run:
```bash
bun test packages/poem
bun test tests/e2e/tier1-features/acceptance-fixtures.test.ts
bun test
```
Document the exact command outputs in your handoff report:
`/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/worker_struct_1/handoff.md`


## 2026-10-17T12:51:36Z
You are worker_struct_1.
Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/worker_struct_1/
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/worker_struct_1/DISPATCH.md
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md (specifically lines 388-446)
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_2/PROJECT.md
Read the three explorer handoffs:
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_1/handoff.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_2/handoff.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_3/handoff.md
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/AGENTS.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement Structure Engine v2 in packages/poem:
1. S1 Hard glue constraints & boundary mask in packages/poem/src/glue.ts
2. S2 Form classification in packages/poem/src/form.ts
3. S3 Classical rhyme grid in packages/poem/src/rhyme-grid.ts
4. S4 Modern boundary model in packages/poem/src/boundary-model.ts and packages/poem/src/weights.json
5. S5 Heuristic DP fallback in packages/poem/src/heuristic-dp.ts
6. S6 LLM pass guard in packages/poem/src/llm-pass.ts
7. S7 Typo flags in packages/poem/src/typos.ts
8. S8 Typeset layer in packages/poem/src/typeset.ts
9. Master pipeline structurePoem conforming to contracts/structure.ts in packages/poem/src/structure.ts and exported in index.ts
10. Unit and fixture test suite in packages/poem/tests/structure-v2.test.ts verifying Shots #1 to #4, corpus invariants, and properties
11. Update lib/changelog.ts strictly adhering to AGENTS.md rules (Persian digits, Persian date, typed change entries, active voice, zero emoji, no tool branding).

Run build and tests:
- bun test packages/poem
- bun test tests/e2e/tier1-features/acceptance-fixtures.test.ts
- bun test

Document your changes, build/test results, and verification commands in:
/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/worker_struct_1/handoff.md
When complete, send a message with your report path.
