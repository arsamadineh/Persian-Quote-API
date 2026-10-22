# Dispatch for teamwork_preview_explorer (explorer_struct_2)

## Mission
Analyze implementation strategy for S3 Classical Rhyme Grid (radif gap CV <= 0.35, qafiyeh ravi alignment, H1/H2 hypothesis testing, midpoint snapping to S1-valid boundaries, beyt and stanza emission).

## Context & Inputs
- Authoritative User Request: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md` (lines 388-446)
- Project Plan: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_2/PROJECT.md`
- Survey Findings:
  - `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/spec_miner_survey_1/handoff.md`
  - `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_survey_2/handoff.md`
- Data Fixtures:
  - `data/golden/shots.jsonl` (Shot 1 Soheili with radif «هنوز», Shot 4 Shahriar with ghazal rhyme)
- Target code: `packages/poem/src/rhyme-grid.ts`

## Output Requirements
Produce a concrete implementation guide for the Worker in:
`/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_2/handoff.md`

Include:
1. Exact radif detection algorithm: n-gram scanning, gap CV calculation, threshold <= 0.35, placing break AFTER radif.
2. Qafiyeh matching algorithm: trailing phonetics (ravi) on preceding token.
3. H1 (masnavi) vs H2 (ghazal/qasida) hypothesis selection, midpoint calculation, and snapping to S1 glue-valid boundaries.
4. Data structure and synchronization for `beyts: [string, string][]` and `stanzas: string[][]`.
5. Confidence scoring formula and unit test recommendations.


## 2026-10-17T12:35:46Z
From: 943e3f77-1c06-477c-b2c9-c2dcd1ffd2c9
Content:
You are explorer_struct_2.
Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_2/
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_2/DISPATCH.md
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md (specifically lines 388-446)
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_2/PROJECT.md

Investigate implementation strategy for S3 Classical Rhyme Grid:
- Radif candidate detection (inter-occurrence gap CV <= 0.35)
- Qafiyeh matching on preceding token
- Break placement strictly AFTER repeating radif
- H1 (masnavi) vs H2 (ghazal/qasida) hypothesis testing, midpoint snapping to S1-valid boundaries
- Beyt [string, string][] and Stanza string[][] output generation
- Verify behavior against Shot 1 (Soheili) and Shot 4 (Shahriar) in data/golden/shots.jsonl

Write a concrete implementation guide to:
/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_2/handoff.md
When finished, send a completion message with your report path.
