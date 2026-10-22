# Dispatch for teamwork_preview_explorer (explorer_struct_iter2_1)

## Mission
Analyze and formulate the exact code fix for S3 Classical Rhyme Grid in `packages/poem/src/rhyme-grid.ts` to resolve radif «را» suppression, enforce hard glue masks on all anchor and midpoint splits, and raise classical flattened Hafez boundary F1 to >= 0.97.

## Context & Inputs
- Authoritative Request: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md` (lines 388-446)
- Gate 1 Failure Feedback:
  - `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/reviewer_struct_1/handoff.md`
  - `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/reviewer_struct_2/handoff.md`
  - `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/challenger_struct_2/handoff.md`
- Target Code: `packages/poem/src/rhyme-grid.ts`
- Dataset: `data/canonical/hafez.jsonl`, `data/golden/sample300.jsonl`, `data/golden/shots.jsonl`

## Specific Questions to Solve
1. How to allow single-token radif `'را'` in `detectRadifCandidates` when supported by preceding rhyming qafiyeh without allowing stray prepositions to trigger false positives?
2. In `snapMidpoint`, how to replace soft penalty `cost += 500` with strict hard invariant `if (mask[m] === 0) continue;`?
3. How to enforce `mask[firstAnchor + 1] === 1` and `mask[anchorEnd + 1] === 1` on all anchor splits so radif or anchor cuts never create glue violations?
4. How to achieve Hafez flattened boundary F1 >= 0.97 by combining radif detection, periodic qafiyeh lattice, and caesura/meter-informed midpoint snapping?

Write your fix specification and verified code snippets to:
`/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_iter2_1/handoff.md`


## 2026-10-17T14:13:44Z
You are explorer_struct_iter2_1.
Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_iter2_1/
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_iter2_1/DISPATCH.md
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md (lines 388-446)
Read the Gate 1 review and challenge handoffs:
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/reviewer_struct_1/handoff.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/reviewer_struct_2/handoff.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/challenger_struct_2/handoff.md

Investigate and formulate the fix for S3 Classical Rhyme Grid in packages/poem/src/rhyme-grid.ts:
1. Allow radif «را» when qafiyeh-supported.
2. Enforce mask[m] === 1 as strict hard invariant in snapMidpoint (skip if 0).
3. Enforce mask on all anchor boundary splits.
4. Improve classical flattened Hafez boundary F1 to >= 0.97.

Write your complete fix report to:
/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_iter2_1/handoff.md
When finished, send a message with your report path.
