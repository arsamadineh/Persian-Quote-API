# Task Assignment: Phase 0 Iteration 2 Fix Strategy (Corpus Invariant Scans & Phase Boundaries)

## Context
You are subagent `teamwork_preview_explorer_0_iter2_3` (Type: `teamwork_preview_explorer`).
Working directory: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_iter2_3/`
Project root: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API`
Original request: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md`
Project scope: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_1/PROJECT.md`
Challenger handoff: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_challenger_0_2/handoff.md`

## Problem Statement
`challenger_0_2` discovered that `T1-FIXTURE-A3` was labeled "Corpus-wide scan on sample records" but only scanned 7 records from `poetry-quotes.json`.
When run against the full 5,396 records in `dataset.all`, 1,548 space-before-punctuation violations and 114 Tatweels were found because legacy data has not yet undergone Phase 2 canonical data migration and cleaning.

## Mission
Investigate how to accurately structure `T1-FIXTURE-A3` and `TEST_INFRA.md` for milestone progression:
1. Review the requirement for Appendix A (A3):
   - A3 is an acceptance fixture specifically scheduled as an exit gate for Phase 2 ("Phase 2 — Data: WS1 migration, WS3 structure engine... acceptance fixtures A1, A2, A3 pass").
   - In Phase 0, how should the test suite test this progressively?
   - Should `acceptance-fixtures.test.ts` test:
     a) The clean sample quotes currently in `poetry-quotes.json` (explicitly documenting that this tests the clean sample, while full corpus validation executes upon Phase 2 migration)?
     b) The classical beyt 2-hemistich invariant across all 497 Hafez ghazals (4,185 beyts), where 100% of beyts currently pass?
2. Recommend an exact, unambiguous test implementation that is both rigorous and strictly truthful.

## Deliverable
Write your recommendations to `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_iter2_3/handoff.md` and report back via `send_message`.


## 2026-10-16T02:45:18Z
[Message] timestamp=2026-10-16T02:45:18Z sender=36a26c83-596a-4fe8-89a5-2517d3502ad1 priority=MESSAGE_PRIORITY_HIGH content=You are explorer_0_iter2_3. Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_iter2_3/.
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md, /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_1/PROJECT.md, /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_challenger_0_2/handoff.md, and your DISPATCH.md.
Investigate Fixture A3 (corpus-wide scans) and progressive milestone testability:
1. Examine why full dataset.all currently fails (1548 punctuation violations in legacy JSON).
2. Detail how A3 should be structured for Phase 0 (testing clean samples + testing Hafez 2-hemistich invariant across all 4,185 beyts) vs Phase 2 (full corpus exit gate after WS1 cleaning).
Write your recommendations to /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_iter2_3/handoff.md and report back via send_message.
