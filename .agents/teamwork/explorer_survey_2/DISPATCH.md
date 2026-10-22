# Dispatch for teamwork_preview_explorer (explorer_survey_2)

## Mission
Investigate algorithmic details and implementation architecture for Structure Engine v2 pipeline (stages S0 to S8) and acceptance testing.

## Input Files
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md` (lines 388-446)
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/contracts/structure.ts`
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/data/golden/shots.jsonl`
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/data/golden/sample300.jsonl`
- Existing structure code (if any) in `lib/engine/`, `packages/poem/`, `tests/e2e/harness.ts`

## Output Requirements
Write a complete algorithmic and architectural design report to:
`/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_survey_2/handoff.md`

Cover:
1. S0 (Signals & Colophon) logic & criteria (`looksStructured`, separators, colophon extraction).
2. S1 Hard Glue constraints (start tokens, end tokens, whole compounds X به X, تو در تو, ezafe chains).
3. S2 Form Classification algorithm & metrics (classical_rhymed, free_verse, colloquial, prose).
4. S3 Classical Rhyme Grid: radif candidate detection (gap CV <= 0.35), qafiyeh, H1 (masnavi/rubai) vs H2 (ghazal/qasida) hypothesis testing, beyt/stanza emission.
5. S4 Modern Boundary Model: Pure-TypeScript logistic regression, SGD training, feature vector extraction, weights in `weights.json`, leave-poet-out validation, Platt/isotonic calibration, ECE <= 0.08.
6. S5 Heuristic Fallback (DP with S1 constraints, orphan penalties, confidence <= 0.4).
7. S6 LLM Pass architecture (optional, batched, cached, fingerprint-verified).
8. S7 Typo Flags (frequency lexicon, edit-distance-1/2, count <= 2 vs 50x) and S8 Typeset Layer (ZWNJ attachment for standalone suffixes).
9. Performance strategies to satisfy median runtime <= 5 ms/poem.


## 2026-10-17T12:18:04Z
You are explorer_survey_2.
Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_survey_2/
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_survey_2/DISPATCH.md
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md (lines 388-446)
Investigate algorithmic details and implementation requirements for Structure Engine v2:
- S0 Signals & Colophon (looksStructured, separators)
- S1 Hard Glue Constraints (start tokens, end tokens, compound phrases, ezafe chains)
- S2 Form Classification (classical_rhymed, free_verse, colloquial, prose)
- S3 Classical Rhyme Grid (radif gap CV <= 0.35, qafiyeh, H1/H2 hypothesis testing, beyt/stanza emission)
- S4 Modern Boundary Model (pure TypeScript logistic regression, SGD training, weights.json, leave-poet-out validation, Platt/isotonic calibration, ECE <= 0.08)
- S5 Heuristic Fallback (DP with S1 constraints, orphan penalties, confidence <= 0.4)
- S6 LLM Pass architecture (optional, batched, cached, fingerprint-verified)
- S7 Typo Flags (frequency lexicon flags) and S8 Typeset Layer (standalone suffixes + ZWNJ)
- Performance strategies to guarantee median latency <= 5ms/poem.

Write your complete architectural and algorithmic design report to:
/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_survey_2/handoff.md
When finished, send a completion message with your report path.
