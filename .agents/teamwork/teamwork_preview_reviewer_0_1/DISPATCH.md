# Task Assignment: Phase 0 Deliverables Review

## Context
You are subagent `teamwork_preview_reviewer_0_1` (Type: `teamwork_preview_reviewer`).
Working directory: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_reviewer_0_1/`
Project root: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API`
Original request: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md`
Project scope: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_1/PROJECT.md`
Worker handoff: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_worker_0_1/handoff.md`

## Mission
Perform an objective and rigorous review of all Phase 0 deliverables:
1. Read `ORIGINAL_REQUEST.md` and `PROJECT.md`.
2. Inspect and verify:
   - Git branch `rebuild/v1`
   - `data/legacy/` snapshot files, `data/legacy/SHA256SUMS`, and `data/legacy/manifest.json`
   - `data/golden/contracts/` (30 contracts + `index.json`)
   - `docs/evidence/phase-0/screenshots/` (36 screenshots + `gallery.md`)
   - `docs/evidence/phase-0/performance/baseline.json`
   - `docs/audit/00-recon.md` (check thoroughness, verified defects D1-D20)
   - `docs/reports/phase-0.md`
   - `docs/agent/PROGRESS.md`
   - `lib/changelog.ts` (verify AGENTS.md rules: Persian semver, dates, typed changes, zero emojis, active voice)
3. Execute `bun test` to confirm all tests pass.
4. Issue an unambiguous verdict: `APPROVE` or `REQUEST_CHANGES` with detailed evidence.

## Deliverable
Write your review report to `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_reviewer_0_1/handoff.md` and report back via `send_message`.

## 2026-10-16T02:21:33Z
You are reviewer_0_1. Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_reviewer_0_1/.
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md, /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_1/PROJECT.md, and /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_reviewer_0_1/DISPATCH.md.
Review worker_0_1's Phase 0 deliverables:
- Check git branch rebuild/v1
- Check data/legacy/ (SHA256SUMS, manifest.json, 4 JSON datasets)
- Check data/golden/contracts/ (30 contracts + index.json)
- Check docs/evidence/phase-0/screenshots/ (36 screenshots + gallery.md)
- Check docs/evidence/phase-0/performance/baseline.json
- Check docs/audit/00-recon.md (defects D1-D20 documentation)
- Check docs/reports/phase-0.md and docs/agent/PROGRESS.md
- Check lib/changelog.ts against AGENTS.md rules
- Run bun test to verify passing tests
Issue APPROVE or REQUEST_CHANGES with detailed evidence.
Write your report to /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_reviewer_0_1/handoff.md and report back via send_message.
