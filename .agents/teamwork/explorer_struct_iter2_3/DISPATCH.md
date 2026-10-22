# Dispatch for teamwork_preview_explorer (explorer_struct_iter2_3)

## Mission
Analyze and formulate the exact code fix for S4 Modern Boundary Model DP decoding (to raise free verse boundary F1 towards >= 0.80) and S8 Typeset layer (to eliminate the polynomial ReDoS vulnerability).

## Context & Inputs
- Authoritative Request: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md` (lines 388-446)
- Gate 1 Failure Feedback:
  - `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/challenger_struct_2/handoff.md`
  - `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/reviewer_struct_1/handoff.md`
- Target Code: `packages/poem/src/boundary-model.ts`, `packages/poem/src/typeset.ts`, `packages/poem/src/heuristic-dp.ts`
- Dataset: `data/golden/sample300.jsonl`, `data/canonical/shereno.jsonl`

## Specific Questions to Solve
1. In `boundary-model.ts`:
   - Reformulate the dynamic programming step score to incorporate negative gap log-probabilities:
     $\text{score}(i, j) = \log(p_j) + \sum_{k=i}^{j-1} \log(1 - p_k)$.
   - Tune threshold / transition penalties so that genuine short verse pauses (2–6 words) are naturally favored instead of greedy 10-word packing.
   - Measure resulting modern verse boundary F1.
2. In `typeset.ts`:
   - Replace the while-loop regex `TYPESET_SUFFIX_REGEX` in `typesetLine` with a single-pass token-based replacement or linear scanner.
   - Verify that `typesetLine("الف".repeat(25000))` executes in < 50 ms (eliminating the 43.9 second ReDoS freeze).
   - Ensure the negative constraint (`می` is NEVER touched with ZWNJ) is strictly preserved.

Write your fix specification and verified code snippets to:
`/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_iter2_3/handoff.md`


## 2026-10-17T14:13:44Z
You are explorer_struct_iter2_3.
Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_iter2_3/
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_iter2_3/DISPATCH.md
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md (lines 388-446)
Read the Gate 1 challenge handoffs:
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/challenger_struct_2/handoff.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/reviewer_struct_1/handoff.md

Investigate and formulate the fix for:
1. S4 Modern Boundary Model DP decoding: incorporate negative gap log-probabilities to accurately segment short verse lines and raise free verse boundary F1 towards >= 0.80.
2. S8 Typeset Layer in packages/poem/src/typeset.ts: replace the while-loop regex with a single-pass token-based replacement to eliminate the 43.9 second ReDoS freeze on long inputs while strictly preserving the negative constraint on «می».

Write your complete fix report to:
/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_iter2_3/handoff.md
When finished, send a message with your report path.
