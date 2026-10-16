# Task Assignment: Phase 0 Iteration 2 Remediation Worker

## Context
You are subagent `teamwork_preview_worker_0_2` (Type: `teamwork_preview_worker`).
Working directory: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_worker_0_2/`
Project root: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API`
Original request: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md`
Project scope: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_1/PROJECT.md`
Explorer handoffs to consult:
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_iter2_1/handoff.md` (Acceptance Fixtures A1, A2, and letterFingerprint drop-in replacements)
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_iter2_2/handoff.md` (CORS OPTIONS preflight fix in engine.ts)
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_iter2_3/handoff.md` (Corpus Invariant A3 and TEST_INFRA.md updates)

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You exclusively own:
- `tests/e2e/harness.ts`
- `tests/e2e/tier1-features/acceptance-fixtures.test.ts`
- `lib/engine/engine.ts`
- `TEST_INFRA.md`
- `lib/changelog.ts` (if updating changelog for bugfixes)

## Specific Tasks
1. **Fix `tests/e2e/harness.ts`**:
   - Update `letterFingerprint`: `s.replace(/[\s\u200c\u200e\u200f*\/]+/g, "")` (stripping invisible directional marks).
2. **Fix `tests/e2e/tier1-features/acceptance-fixtures.test.ts`**:
   - Apply drop-in replacement for Fixture A1: Use full 43-word Salman Harati poem from "از آسمان سبز", assert `excerpt.cutEnd === true`, assert ellipsis, assert colophon exclusion, document Phase 2 activation contract for `date_jalali`/`date_gregorian`.
   - Apply drop-in replacement for Fixture A2: Assert punctuation spacing on synthetic & real Nader Naderpour poem ("خون و خاکستر"), assert `structure.origin` and `confidence` tracking, assert clean sentence boundary.
   - Apply drop-in replacement for Fixture A3 & A6: Restructure into `T1-FIXTURE-A3-SAMPLE` (testing clean sample) and `T1-FIXTURE-A3-CLASSICAL` (asserting 2 hemistichs per beyt across all 4,185 beyts in `dataset.hafez`).
   - Update A4 to include the 11 bidi poems from `shereno.json` to verify `letterFingerprint` works without false failures.
3. **Fix CORS OPTIONS in `lib/engine/engine.ts`**:
   - In `engine.handle()`, intercept `req.method === 'OPTIONS'` before `this.router.match` line 182, and delegate to `this.middleware.execute(req, ...)`.
   - Add a test verifying `OPTIONS /api/quotes` returns 204 with `Access-Control-Allow-Origin: *`.
4. **Update `TEST_INFRA.md`**:
   - Update documentation to reflect progressive testing structure for A3.
5. **Verify**:
   - Run `bun test` (all tests must pass).
   - Run `bun run tests/e2e/runner.ts` (all 4 tiers must pass).
   - Run `bun x tsc --noEmit` (0 errors).

## Deliverable
Write your completion handoff report to:
`/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_worker_0_2/handoff.md`

## 2026-10-16T02:53:32Z
[Message from parent 36a26c83-596a-4fe8-89a5-2517d3502ad1]
You are teamwork_preview_worker_0_2. Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_worker_0_2/.
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md, /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_1/PROJECT.md, /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_worker_0_2/DISPATCH.md, and the 3 explorer handoffs:
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_iter2_1/handoff.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_iter2_2/handoff.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_iter2_3/handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Execute the remediation:
1. Fix tests/e2e/harness.ts (update letterFingerprint to strip \u200e\u200f).
2. Fix tests/e2e/tier1-features/acceptance-fixtures.test.ts (A1 with full 43-word poem and cutEnd/ellipsis assertions, A2 with origin/confidence, A3 sample scan + classical 4185-beyt 2-hemistich scan, A4 with 11 bidi poems).
3. Fix CORS OPTIONS in lib/engine/engine.ts (intercept method === 'OPTIONS' before line 182 and execute middleware).
4. Add test for OPTIONS /api/quotes in tests/e2e/tier1-features/legacy-engine-health.test.ts.
5. Update TEST_INFRA.md regarding A3 progressive gating.
6. Verify: bun test, bun run tests/e2e/runner.ts, and bun x tsc --noEmit.
Write your handoff report to /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_worker_0_2/handoff.md and report back via send_message.
