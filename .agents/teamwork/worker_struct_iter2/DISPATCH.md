# DISPATCH: worker_struct_iter2

## Objective
Apply the verified fixes from Iteration 2 Explorers to eliminate all Gate 1 defects in Structure Engine v2:
1. Allow radif «را» when qafiyeh-supported and eliminate Ghazal 9 line-start violations.
2. Turn S1 glue mask into a strict hard invariant in `snapMidpoint` (skip if mask[m] === 0) and enforce mask on anchor splits.
3. Remove `hasGlueViolation` from `looksStructured` and add `fixLineBreakLeakage` in S0.
4. Move prose check before radif/qafiyeh checks in `classifyForm` and disqualify candidate radifs ending in `FORBIDDEN_LINE_ENDS`.
5. Apply single-pass lookbehind regex in `packages/poem/src/typeset.ts` to eliminate ReDoS while strictly preserving the negative constraint on «می».
6. Apply DP joint log-likelihood with break transition prior in `packages/poem/src/boundary-model.ts`.
7. Update `packages/poem/tests/structure-v2.test.ts` to test length distributions for `looksStructured`.
8. Update `lib/changelog.ts` to version "۳.۱۷.۱" adhering strictly to AGENTS.md.

## Write Ownership
You exclusively own and may edit:
- `packages/poem/src/rhyme-grid.ts`
- `packages/poem/src/structure.ts`
- `packages/poem/src/form.ts`
- `packages/poem/src/typeset.ts`
- `packages/poem/src/boundary-model.ts`
- `packages/poem/tests/structure-v2.test.ts`
- `lib/changelog.ts`

## Explorer References (Read Carefully)
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_iter2_1/handoff.md` (§4.2 drop-in replacement for `rhyme-grid.ts`)
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_iter2_2/handoff.md` (§4.2.A for `structure.ts`, §4.2.B for `form.ts`, §4.2.D for `structure-v2.test.ts`)
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_iter2_3/handoff.md` (§4.1 for `typeset.ts`, §4.2 for `boundary-model.ts`)
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/AGENTS.md`

## Verification Commands
- `bun test packages/poem`
- `bun test tests/e2e/tier1-features/acceptance-fixtures.test.ts`
- `bun test`
- `bun run --filter @persian-quote/poem typecheck`
- Verify 0 glue violations in `data/golden/sample300.jsonl`
- Verify ReDoS eliminated: `typesetLine("الف".repeat(25000))` finishes in < 5ms.

Document changes, test outputs, and verification in `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/worker_struct_iter2/handoff.md`.


## 2026-10-17T14:54:51Z
You are worker_struct_iter2.
Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/worker_struct_iter2/
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/worker_struct_iter2/DISPATCH.md
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md (specifically lines 388-446)
Read the Iteration 2 Explorer fix reports:
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_iter2_1/handoff.md (§4.2 drop-in replacement for rhyme-grid.ts)
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_iter2_2/handoff.md (§4.2.A for structure.ts, §4.2.B for form.ts, §4.2.D for structure-v2.test.ts)
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_iter2_3/handoff.md (§4.1 for typeset.ts, §4.2 for boundary-model.ts)
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/AGENTS.md
