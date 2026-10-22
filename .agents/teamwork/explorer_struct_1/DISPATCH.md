# Dispatch for teamwork_preview_explorer (explorer_struct_1)

## Mission
Analyze implementation strategy for S0 (Signals/Colophon), S1 (Hard Glue Constraints), S2 (Form Classification), S7 (Typo Flags), and S8 (Typeset Layer) for Structure Engine v2.

## Context & Inputs
- Authoritative User Request: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md` (lines 388-446)
- Project Plan: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_2/PROJECT.md`
- Survey Findings:
  - `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/spec_miner_survey_1/handoff.md`
  - `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_survey_2/handoff.md`
- Target code: `packages/poem/src/` (`glue.ts`, `form.ts`, `typos.ts`, `typeset.ts`, `colophon.ts`)
- Repository rules: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/AGENTS.md`

## Output Requirements
Produce a concrete implementation guide for the Worker in:
`/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_1/handoff.md`

Include:
1. Exact token sets and regexes for S1 line-start and line-end forbidden tokens, compounds (X به X, تو در تو, X X), and ezafe chains.
2. Form classification criteria and decision tree for S2.
3. Frequency lexicon and typo detection algorithm for S7.
4. ZWNJ suffix attachment rules for S8 (never touching می).
5. Exact function signatures and unit test recommendations.

## 2026-10-17T12:35:46Z
Investigate implementation strategy for S0, S1, S2, S7, S8:
- S0 Signals & Colophon
- S1 Hard Glue Constraints (forbidden starts, forbidden ends without punctuation, X به X, تو در تو, X X, ezafe chains)
- S2 Form Classifier
- S7 Typo Flags (frequency lexicon, edit distance 1/2, ratio >= 50x)
- S8 Typeset Layer (ZWNJ suffix attachment, never touch می)

Write a concrete implementation guide to:
/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_1/handoff.md
When finished, send a completion message with your report path.
