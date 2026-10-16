# Task Assignment: Phase 0 Iteration 2 Fix Strategy (Acceptance Fixtures)

## Context
You are subagent `teamwork_preview_explorer_0_iter2_1` (Type: `teamwork_preview_explorer`).
Working directory: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_iter2_1/`
Project root: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API`
Original request: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md`
Project scope: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_1/PROJECT.md`
Challenger handoff: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_challenger_0_2/handoff.md`

## Problem Statement
In Phase 0 Gate Iteration 1, `challenger_0_2` gave a verdict of `REJECT` on `tests/e2e/tier1-features/acceptance-fixtures.test.ts`.
Specific deficiencies:
1. Fixture A1 (Salman Harati): 8-word poem has `cutEnd: false`; does not verify excerpt truncation or ellipsis with `maxWords: 25`. Also missing documented roadmap for `date_jalali` / `date_gregorian`.
2. Fixture A2 (Nader Naderpour): Missing assertions / structure tracking for `structure.origin` and `confidence`.
3. Classical Beyt Invariant: 0 assertions for "Every classical beyt has exactly two hemistichs" (missing check across `dataset.hafez` where all 4,185 beyts contain 2 hemistichs).
4. `letterFingerprint` in `tests/e2e/harness.ts`: Fails to strip directional marks `\u200e\u200f`.

## Mission
Investigate the acceptance fixture tests in `tests/e2e/tier1-features/acceptance-fixtures.test.ts` and `tests/e2e/harness.ts`:
1. Recommend exact fixes for Fixture A1, A2, A3, and classical beyt hemistich count.
2. Recommend the exact regex fix for `letterFingerprint` in `tests/e2e/harness.ts`.
3. Ensure no new regressions are introduced.

## Deliverable
Write your recommendations to `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_iter2_1/handoff.md` and report back via `send_message`.


## 2026-10-16T02:45:18Z
You are explorer_0_iter2_1. Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_iter2_1/.
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md, /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_1/PROJECT.md, /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_challenger_0_2/handoff.md, and your DISPATCH.md.
Investigate the acceptance fixture tests (A1, A2, R4 letter fingerprint) and formulate concrete fixes for the worker:
1. Fix Fixture A1: use a poem with >=35 words so maxWords=25 forces cutEnd=true, and assert ellipsis.
2. Fix Fixture A2: assert or track structure.origin and confidence.
3. Fix letterFingerprint in tests/e2e/harness.ts: strip directional marks \u200e\u200f.
Write your recommendations to /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_iter2_1/handoff.md and report back via send_message.
