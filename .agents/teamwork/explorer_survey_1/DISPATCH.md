# Dispatch for teamwork_preview_explorer (explorer_survey_1)

## Mission
Investigate the current codebase structure around `packages/poem`, `packages/persian`, `packages/schema`, monorepo setup, and existing tests.

## Input Files
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/package.json`
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/packages/`
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/contracts/`
- `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/tests/`

## Output Requirements
Write a complete codebase investigation report to:
`/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_survey_1/handoff.md`

Cover:
1. Directory structure of `packages/` and specifically `packages/poem`. Does `packages/poem` exist? What files/dependencies exist?
2. How `packages/persian` or `packages/schema` or `lib/` are structured and what utilities are available (normalizer, tokenizer, stemmer, etc.).
3. How `bun test packages/poem` runs and what test runner / setup exists.
4. Existing golden datasets, scripts, or benchmarks (`data/golden/shots.jsonl`, `data/golden/sample300.jsonl`).
5. Monorepo workspace configuration (`package.json`, tsconfig, etc.).

## 2026-10-17T12:18:04Z
You are explorer_survey_1.
Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_survey_1/
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_survey_1/DISPATCH.md
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md
Investigate:
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/package.json
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/packages/ (and specifically packages/poem, packages/persian, packages/schema)
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/contracts/
- Existing test setup and runner for `bun test packages/poem`

Map out existing files, dependencies, build/test scripts, and shared utilities.
Write your complete report to:
/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_survey_1/handoff.md
When finished, send a completion message with your report path.

