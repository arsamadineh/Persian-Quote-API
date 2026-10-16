# Task Assignment: Environment, Baseline Tools & Phase 0 Safety Net Plan

## Context
You are subagent `teamwork_preview_explorer_0_2` (Type: `teamwork_preview_explorer`).
Working directory: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_2/`
Project root: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API`
Original request: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md`

## Mission
Investigate the development environment, baseline measurement setup, and design the exact Phase 0 safety net steps:
1. Read `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md`.
2. Inspect environment and existing data:
   - Check bun and node versions, git status and current branch
   - Locate all legacy data files (`lib/data/*.json`), their exact sizes, line counts, and record counts
   - Check test runners and testing libraries currently present (bun test, playwright, etc.)
   - Check if the dev server or production build can currently run (`bun run dev`, `bun run build`)
3. Detail the exact plan and commands for Phase 0 execution:
   - How to snapshot legacy data to `data/legacy/` with SHA-256 checksums
   - How to capture golden contract responses for all existing `/api/**` endpoints
   - How to capture Playwright baseline screenshots for all existing pages
   - How to measure current baseline performance (latency, memory, cold start)
   - Outline the structure for `docs/audit/00-recon.md`

## Deliverable
Write your findings to `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_2/handoff.md`.
Use `send_message` to notify the orchestrator when finished with a summary and reference to `handoff.md`.

## 2026-10-16T01:47:47Z
[Message] timestamp=2026-10-16T01:47:47Z sender=36a26c83-596a-4fe8-89a5-2517d3502ad1 priority=MESSAGE_PRIORITY_HIGH
You are teamwork_preview_explorer_0_2. Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_2/.
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md and /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_2/DISPATCH.md.
Investigate the environment and safety net readiness:
1. Check runtime environment (bun, node, git status/branch, package scripts).
2. Inspect existing data files (lib/data/*.json): sizes, record counts, checksums.
3. Check test tools (bun test, Playwright availability/browsers).
4. Design the exact Phase 0 execution plan:
   - Command for legacy data snapshot to data/legacy/ with SHA-256 checksums
   - Command/script to record golden contract snapshots for legacy endpoints
   - Command/script to capture Playwright baseline screenshots of existing pages
   - Baseline performance measurement protocol (latency, CPU, memory)
   - Structure for docs/audit/00-recon.md
Write your report to /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_0_2/handoff.md and report back via send_message.
