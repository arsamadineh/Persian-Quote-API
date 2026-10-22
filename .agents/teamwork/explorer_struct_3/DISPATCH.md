# Dispatch for teamwork_preview_explorer (explorer_struct_3)

## Mission
Analyze implementation strategy for S4 Modern Boundary Model (pure TS logistic regression, weights.json, Platt calibration), S5 Heuristic DP Fallback with orphan penalties, and S6 LLM Pass guard.

## Context & Inputs
- Authoritative User Request: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md` (lines 388-446)
- Project Plan: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_2/PROJECT.md`
- Survey Findings:
  - `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/spec_miner_survey_1/handoff.md`
  - `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_survey_2/handoff.md`
- Data Fixtures:
  - `data/golden/shots.jsonl` (Shot 2 Heydarzadeh, Shot 3 Ahmadi)
  - `data/golden/sample300.jsonl`
- Target code: `packages/poem/src/boundary-model.ts`, `packages/poem/src/weights.json`, `packages/poem/src/heuristic-dp.ts`, `packages/poem/src/llm-pass.ts`

## Output Requirements
Produce a concrete implementation guide for the Worker in:
`/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_3/handoff.md`

Include:
1. Exact feature extraction vector for S4 (12 features, zero runtime dependencies, dot-product inference).
2. Format and concrete values for `weights.json` (trained weights and Platt calibration parameters A, B ensuring ECE <= 0.08).
3. S5 Dynamic Programming segmentation state, transitions, cost function, orphan penalties (+80 1-word, +60 dangling), and syntactic bonuses.
4. S6 LLM fallback guard (letter-fingerprint check, caching).
5. Unit and fixture test recommendations.

## 2026-10-17T12:35:46Z
You are explorer_struct_3.
Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_3/
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_3/DISPATCH.md
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md (specifically lines 388-446)
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_2/PROJECT.md

Investigate implementation strategy for:
- S4 Modern Boundary Model (pure TS logistic regression, weights.json schema and concrete trained weights, leave-poet-out validation, Platt calibration ensuring ECE <= 0.08)
- S5 Heuristic DP Fallback with orphan penalties and S1 glue masks, confidence <= 0.4, low_confidence flag
- S6 LLM pass guard (letter-fingerprint check)
- Verify behavior against Shot 2 (Heydarzadeh) and Shot 3 (Ahmadi) in data/golden/shots.jsonl

Write a concrete implementation guide to:
/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_3/handoff.md
When finished, send a completion message with your report path.
