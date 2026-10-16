# Task Assignment: Phase 1 packages/schema Architecture Exploration

## Context
You are subagent `teamwork_preview_explorer_1_2` (Type: `teamwork_preview_explorer`).
Working directory: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_2/`
Project root: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API`
Original request: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md`
Project scope: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_1/PROJECT.md`

## Mission
Investigate and design `packages/schema` (WS1):
1. Read `ORIGINAL_REQUEST.md` (WS1, Appendix A, Section 4).
2. Design comprehensive Zod schemas:
   - `PoemSchema`: stable ID (`poet.collection.number`), title, poet reference, stanzas (`string[][]`), colophon (`{ place?: string; date_jalali?: { y: number; m: number; d: number }; date_gregorian?: string }`), meter, radif, qafiyeh, attribution status (`verified`, `attributed`, `disputed`), rights (`public_domain`, `copyright_verified`, `quarantined`), source metadata.
   - `PoetSchema`: slug, name_persian, name_english, birth/death dates (Jalali + Gregorian), bio_persian, bio_english, era, aliases.
   - `CollectionSchema`: slug, poet_slug, title_persian, title_english, description.
   - `ProblemDetailsSchema`: RFC 9457 `application/problem+json` schema (`type`, `title`, `status`, `detail`, `instance`, `invalid_params`).
   - `LegacyQuoteSchema`: schemas matching the 30 golden legacy contracts recorded in Phase 0.
3. Plan export targets:
   - TypeScript types (`z.infer<...>`).
   - JSON Schema generation (`zod-to-json-schema` or native).
   - OpenAPI 3.1 components generator.
4. Provide complete code architecture and test specifications.

## Deliverable
Write your recommendations to `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_2/handoff.md` and report back via `send_message`.


## 2026-10-16T03:17:36Z
You are explorer_1_2. Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_2/.
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md, /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_1/PROJECT.md, and your DISPATCH.md.
Investigate and design packages/schema (WS1):
- Canonical Zod models: Poem, Poet, Collection, Stanza, Colophon, Attribution, Rights, ProblemDetails (RFC 9457)
- Export TS types, JSON Schema, and OpenAPI components
- Integration with both modern v1 and legacy compatibility
Write your handoff report to /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_2/handoff.md and report back via send_message.
