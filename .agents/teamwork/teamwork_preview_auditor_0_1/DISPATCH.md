# Task Assignment: Phase 0 Forensic Integrity Audit

## Context
You are subagent `teamwork_preview_auditor_0_1` (Type: `teamwork_preview_auditor`).
Working directory: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_auditor_0_1/`
Project root: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API`
Original request: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md`

## Mission
Conduct a rigorous forensic integrity audit of all Phase 0 work products:
1. Integrity Forensics:
   - Check for cheating: Are test results fabricated or hardcoded?
   - Are there dummy/facade implementations producing correct-looking outputs without genuine logic?
   - Are there TODOs, FIXMEs, stubs, mock data in production paths, commented code, or placeholder numbers (R1 violation)?
   - Are numbers fabricated, or are they empirically measured (R2, R3 violation)?
   - Did any poem wording get altered from memory (R4 violation)?
   - Was any data deleted or lost from the legacy datasets (R5 violation)?
   - Are legacy contracts preserved byte-identically (R6 violation)?
2. Repository Governance (AGENTS.md):
   - Rule 1: Check `lib/changelog.ts` for strict compliance (Persian semver, valid dates, typed changes, active voice, newest first).
   - Rule 5: Zero emojis anywhere in code, commits, comments, docs, or changelogs.
   - Rule 6: Removal of AI text clichés ("قطعاً", "البته", "به طور کلی", rhetorical triplets, intro filler).
   - Rule 7: Zero tool/vendor brand names in commit messages, code, README, or changelog.
3. Git Discipline & Safety Net:
   - Branch `rebuild/v1` used?
   - `data/legacy/` checksums verified?
   - `docs/audit/00-recon.md` genuine and detailed?
4. Binary Verdict:
   - If ANY cheating, hardcoding, R1-R6 violations, or AGENTS.md violations are detected: issue `INTEGRITY VIOLATION` (with exhaustive evidence).
   - If fully clean: issue `CLEAN`.

## Deliverable
Write your audit report to `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_auditor_0_1/handoff.md` and report back via `send_message`.


## 2026-10-16T02:21:34Z
You are auditor_0_1. Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_auditor_0_1/.
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md and /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_auditor_0_1/DISPATCH.md.
Perform a forensic integrity audit on all Phase 0 work products:
- Check for cheating: hardcoded test results, dummy/facade implementations, fake numbers (R1, R2, R3)
- Check poem wording immutability (R4)
- Check data preservation (R5, data/legacy/)
- Check legacy route compatibility (R6, data/golden/contracts/)
- Check AGENTS.md compliance:
  - lib/changelog.ts (Persian semver, dates, typed changes, zero emojis, active voice)
  - Zero emojis across all code, commits, comments, docs, changelogs
  - No AI prose clichés ("قطعاً", "البته", rhetorical triplets, filler)
  - No tool/vendor brand names
Issue a binary verdict: CLEAN or INTEGRITY VIOLATION (with exhaustive evidence).
Write your report to /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_auditor_0_1/handoff.md and report back via send_message.
