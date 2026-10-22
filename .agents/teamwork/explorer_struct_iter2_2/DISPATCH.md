# Dispatch for teamwork_preview_explorer (explorer_struct_iter2_2)

## Mission
Analyze and formulate the exact code fix for S0 `looksStructured` and S1 Hard Glue constraints across all pipeline stages to guarantee 0 glue start violations and 0 dangling end violations across `sample300.jsonl` and the entire corpus.

## Context & Inputs
- Authoritative Request: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md` (lines 388-446)
- Gate 1 Failure Feedback:
  - `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/reviewer_struct_1/handoff.md`
  - `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/reviewer_struct_2/handoff.md`
- Target Code: `packages/poem/src/structure.ts`, `packages/poem/src/glue.ts`, `packages/poem/src/form.ts`
- Dataset: `data/golden/sample300.jsonl`, `data/golden/shots.jsonl`

## Specific Questions to Solve
1. In S0 `structure.ts`: Remove `hasGlueViolation(flat)` from `looksStructured` so that authentic Persian verse with valid length distribution (median 2–12, max <= 22) is not falsely rejected.
2. In S2 `form.ts`: Fix prose classification order (prose check should evaluate before radif/qafiyeh checks) to prevent prose aphorisms with repeated words from entering classical couplet bisection.
3. In S1 `glue.ts`: Ensure `buildGlueMask` comprehensively covers all standalone clitic suffixes, copulas, particles, prepositions, conjunctions, compounds (`X به X`, `تو در تو`, `X X`), and ezafe chains.
4. Verify that running `structurePoem` across `data/golden/sample300.jsonl` produces strictly **0** glue start violations and **0** dangling end violations.

Write your fix specification and verified code snippets to:
`/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_iter2_2/handoff.md`

## 2026-10-17T14:13:44Z
You are explorer_struct_iter2_2.
Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_iter2_2/
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_iter2_2/DISPATCH.md
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md (lines 388-446)
Read the Gate 1 review handoffs:
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/reviewer_struct_1/handoff.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/reviewer_struct_2/handoff.md

Investigate and formulate the fix for S0 looksStructured and S1 Hard Glue constraints across all stages:
1. Remove hasGlueViolation(flat) from looksStructured in packages/poem/src/structure.ts.
2. Fix prose classification in packages/poem/src/form.ts so prose checks precede radif/qafiyeh checks.
3. Formulate strict enforcement of buildGlueMask across all downstream stages to guarantee 0 glue start violations and 0 dangling end violations across sample300.jsonl and the corpus.

Write your complete fix report to:
/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_iter2_2/handoff.md
When finished, send a message with your report path.
