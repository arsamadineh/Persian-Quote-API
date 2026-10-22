# Dispatch for teamwork_preview_spec_miner (spec_miner_survey_1)

## Mission
Extract and document the exact specifications and contract requirements for Structure Engine v2.

## Input Files
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md` (read lines 388-446 and Appendix A/D)
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/contracts/structure.ts`
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/data/golden/shots.jsonl`
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/data/golden/sample300.jsonl`
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/AGENTS.md`

## Output Requirements
Write a complete, structured specification analysis report to:
`/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/spec_miner_survey_1/handoff.md`

Cover:
1. `contracts/structure.ts` types, interfaces, options, and return types (`structurePoem`).
2. Behavioral expectations for all 4 shots in `data/golden/shots.jsonl` (Shot 1 Soheili, Shot 2 Heydarzadeh, Shot 3 Ahmadi, Shot 4 Shahriar).
3. Exact constraints S0 to S8.
4. Acceptance criteria: corpus invariants, F1 targets, ECE calibration targets, performance targets (<=5ms/poem).
5. AGENTS.md rules and changelog requirements.


## 2026-10-17T12:18:04Z
You are spec_miner_survey_1.
Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/spec_miner_survey_1/
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/spec_miner_survey_1/DISPATCH.md
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md (specifically lines 388-446 and Appendix A/D)
Investigate:
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/contracts/structure.ts
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/data/golden/shots.jsonl
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/data/golden/sample300.jsonl
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/AGENTS.md

Extract and document all types, options, interfaces, behavioral fixture requirements, corpus invariants, and metrics.
Write your complete report to:
/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/spec_miner_survey_1/handoff.md
When finished, send a completion message with your report path.
