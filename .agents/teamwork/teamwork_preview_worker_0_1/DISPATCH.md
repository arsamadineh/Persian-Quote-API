# Task Assignment: Phase 0 Safety Net & Recon Execution

## Context
You are subagent `teamwork_preview_worker_0_1` (Type: `teamwork_preview_worker`).
Working directory: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_worker_0_1/`
Project root: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API`
Original request: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md`
Project scope: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_1/PROJECT.md`
Survey reports to consult:
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_1/handoff.md` (Codebase & Defect audit)
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_2/handoff.md` (Exact scripts, hashes, commands, and 00-recon.md outline)

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You exclusively own:
- `data/legacy/**` (legacy snapshots and SHA256SUMS, manifest.json)
- `data/golden/contracts/**` (golden contract recordings)
- `docs/evidence/phase-0/**` (screenshots and performance baseline logs)
- `docs/audit/00-recon.md`
- `docs/reports/phase-0.md`
- `docs/agent/PROGRESS.md`
- `lib/changelog.ts` (adhering strictly to AGENTS.md rules)
- Temporary scripts used to record baselines: `scripts/record-golden-contracts.ts`, `scripts/capture-baseline-screenshots.ts`, `scripts/measure-baseline-perf.ts`

## Specific Instructions
1. Switch/create git branch `rebuild/v1` per R9.
2. Execute legacy dataset snapshot:
   - Copy `hafez.json`, `non-poetry-quotes.json`, `poetry-quotes.json`, `shereno.json` to `data/legacy/`.
   - Generate and verify `SHA256SUMS`.
   - Create `data/legacy/manifest.json`.
3. Capture golden contracts:
   - Implement and execute `scripts/record-golden-contracts.ts` (querying local server or direct execution across all 30 legacy contract cases from explorer_0_2 handoff).
   - Save contract files and `data/golden/contracts/index.json`.
4. Capture Playwright visual baselines:
   - Implement and execute `scripts/capture-baseline-screenshots.ts` using local Chrome `/usr/bin/google-chrome-stable` across all 9 pages, desktop + mobile, light + dark (36 screenshots).
   - Save to `docs/evidence/phase-0/screenshots/` and generate `gallery.md`.
5. Measure baseline performance:
   - Implement and execute `scripts/measure-baseline-perf.ts` measuring cold start, warm latency percentiles (p50, p90, p95, p99), memory usage, and router microbenchmark.
   - Save to `docs/evidence/phase-0/performance/baseline.json`.
6. Author `docs/audit/00-recon.md` following the detailed structure in explorer_0_2 handoff, incorporating all code evidence of defects D1–D20 from explorer_0_1 handoff.
7. Author `docs/reports/phase-0.md` detailing Phase 0 execution, measurements, and verification.
8. Initialize `docs/agent/PROGRESS.md` per R8.
9. Update `lib/changelog.ts` with entry for Phase 0 (in fluent Persian, semver, no emojis, newest first).
10. Run tests (`bun test`) to ensure everything remains green.

## Deliverable
Write your completion handoff to:
`/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_worker_0_1/handoff.md`
and notify the orchestrator via `send_message`.


## 2026-10-16T02:00:03Z
[Message] timestamp=2026-10-16T02:00:03Z sender=36a26c83-596a-4fe8-89a5-2517d3502ad1 priority=MESSAGE_PRIORITY_HIGH content=You are teamwork_preview_worker_0_1. Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_worker_0_1/.
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md, /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_1/PROJECT.md, and /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_worker_0_1/DISPATCH.md.
Also read the survey reports:
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_1/handoff.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_2/handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Execute the Phase 0 safety net and recon tasks:
1. Create/checkout git branch rebuild/v1.
2. Snapshot legacy data to data/legacy/ with SHA-256 verification (hafez.json, non-poetry-quotes.json, poetry-quotes.json, shereno.json) and manifest.json.
3. Record golden contract responses for all 30 legacy contract cases to data/golden/contracts/.
4. Capture Playwright baseline screenshots for all 9 pages (desktop/mobile, light/dark) using local Chrome to docs/evidence/phase-0/screenshots/ and generate gallery.md.
5. Measure baseline performance (cold start, warm percentiles, memory, router microbenchmarks) to docs/evidence/phase-0/performance/baseline.json.
6. Author docs/audit/00-recon.md following the detailed structure in explorer_0_2 handoff and including code evidence for defects D1-D20 from explorer_0_1 handoff.
7. Author docs/reports/phase-0.md.
8. Initialize docs/agent/PROGRESS.md.
9. Update lib/changelog.ts strictly adhering to repository AGENTS.md rules (Persian semver, dates, typed changes, no emojis, newest first).
10. Ensure bun test passes.
Write your handoff report to /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_worker_0_1/handoff.md and notify via send_message.
