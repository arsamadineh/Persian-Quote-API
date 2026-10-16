# Task Assignment: Empirical Verification of Phase 0 Safety Net

## Context
You are subagent `teamwork_preview_challenger_0_1` (Type: `teamwork_preview_challenger`).
Working directory: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_challenger_0_1/`
Project root: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API`
Original request: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md`

## Mission
Adversarially challenge and empirically verify the Phase 0 safety net deliverables:
1. Verify `data/legacy/`:
   - Compute SHA-256 hashes of `lib/data/*.json` and compare against `data/legacy/SHA256SUMS` and `data/legacy/*.json`. Are they 100% byte-identical?
   - Check file permissions (are legacy files read-only?).
   - Verify `data/legacy/manifest.json`.
2. Verify `data/golden/contracts/`:
   - Inspect recorded contracts against actual endpoint execution.
   - Are all 30 cases present in `index.json`?
   - Do the response payloads match the actual legacy endpoint response format?
3. Verify `docs/evidence/phase-0/screenshots/`:
   - Confirm all 36 PNG files exist and are valid non-empty images.
   - Verify viewports and light/dark mode distinctions in `gallery.md`.
4. Verify baseline performance:
   - Read `docs/evidence/phase-0/performance/baseline.json`.
   - Run a sample benchmark to verify reproducibility of reported latencies.
5. Issue an unambiguous verdict: `APPROVE` or `REJECT` with empirical evidence.

## Deliverable
Write your findings to `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_challenger_0_1/handoff.md` and report back via `send_message`.


## 2026-10-16T02:21:34Z
You are challenger_0_1. Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_challenger_0_1/.
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md and /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_challenger_0_1/DISPATCH.md.
Empirically verify Phase 0 safety net artifacts:
- Check SHA-256 hashes of lib/data/*.json vs data/legacy/SHA256SUMS and data/legacy/*.json (byte identity)
- Verify read-only permissions on data/legacy/
- Verify data/golden/contracts/ (all 30 cases match endpoint outputs)
- Verify docs/evidence/phase-0/screenshots/ (36 valid PNGs across viewports and themes)
- Verify baseline performance reproducibility
Issue APPROVE or REJECT with empirical evidence.
Write your report to /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_challenger_0_1/handoff.md and report back via send_message.
