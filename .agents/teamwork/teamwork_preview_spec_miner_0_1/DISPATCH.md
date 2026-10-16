# Task Assignment: Specification & Feature Inventory Mining

## Context
You are subagent `teamwork_preview_spec_miner_0_1` (Type: `teamwork_preview_spec_miner`).
Working directory: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_spec_miner_0_1/`
Project root: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API`
Original request: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md`

## Mission
Perform a rigorous specification mining of `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md`:
1. Thoroughly read the entire document.
2. Extract and structure a complete Feature Inventory covering:
   - All 15 workstreams (WS1 to WS15)
   - All 7 phases (Phase 0 to Phase 7) and their specific exit criteria
   - Operating rules R1 to R22 and repository constraints in `AGENTS.md`
   - Acceptance fixtures from Appendix A (A1, A2, A3)
   - Performance budgets from Appendix D
   - API endpoints: legacy (`/api/**`) compatibility contracts and all `/v1/**` endpoints
   - Bulk exports (JSONL, Parquet, SQLite FTS5, TEI-P5 XML), MCP server, Web Component, SDKs
3. Organize into a structured inventory table suitable for inclusion in `PROJECT.md § Feature Inventory` with columns:
   `| # | Feature | Description | Milestone / Workstream | Source |`

## Deliverable
Write your findings to `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_spec_miner_0_1/handoff.md`.
Use `send_message` to notify the orchestrator when finished with a summary and reference to `handoff.md`.


## 2026-10-16T01:47:47Z
[Message] timestamp=2026-10-16T01:47:47Z sender=36a26c83-596a-4fe8-89a5-2517d3502ad1 priority=MESSAGE_PRIORITY_HIGH content=You are teamwork_preview_spec_miner_0_1. Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_spec_miner_0_1/.
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md and /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_spec_miner_0_1/DISPATCH.md.
Mine all requirements and construct a complete Feature Inventory covering:
1. All 15 workstreams (WS1 to WS15) and 7 phases (Phase 0 to Phase 7).
2. Operating rules R1 to R22 and repository rules in AGENTS.md (e.g. Farsi changelog in lib/changelog.ts, no emojis).
3. Acceptance fixtures from Appendix A (A1 Salman Harati, A2 Nader Naderpour, A3 corpus-wide scans).
4. Performance budgets from Appendix D.
5. All endpoints (legacy /api/** compatibility contracts, all /v1/** endpoints).
6. Target deliverables across academic layer, search, MCP server, Web component, SDKs.
Format as a complete, deduplicated Feature Inventory table with columns | # | Feature | Description | Milestone / Workstream | Source |.
Write your findings to /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_spec_miner_0_1/handoff.md and report back via send_message.
