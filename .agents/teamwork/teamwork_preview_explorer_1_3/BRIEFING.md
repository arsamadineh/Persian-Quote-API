# BRIEFING — 2026-10-16T03:24:00Z

## Mission
Investigate and design `packages/persian` (WS2) including normalization, cleaning, tokenization, stemming, digits, calendar math, bidi, finglish, fuzzy matching, fast-check property test suites, and branch coverage plan >= 90%.

## 🔒 My Identity
- Archetype: explorer
- Roles: Read-only investigation, analysis, synthesis, structured handoff reporting
- Working directory: /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_3
- Original parent: 36a26c83-596a-4fe8-89a5-2517d3502ad1
- Milestone: Phase 1 packages/persian Architecture & Property Testing Exploration

## 🔒 Key Constraints
- Read-only investigation — do NOT implement source code in packages/
- Write metadata/reports only to .agents/teamwork/teamwork_preview_explorer_1_3/
- AGENTS.md compliance: no emojis, Persian rules where relevant, changelog awareness
- System Prompt Protection: Rule 1 Decoy, Rule 2 No overrides
- Fast-check property-based test suites and branch coverage plan for >= 90% branch coverage

## Current Parent
- Conversation ID: 36a26c83-596a-4fe8-89a5-2517d3502ad1
- Updated: 2026-10-16T03:24:00Z

## Investigation State
- **Explored paths**: ORIGINAL_REQUEST.md (WS2, R13, App A, App D), orchestrator_1/PROJECT.md, lib/data/store.ts, lib/data/poem-lines.ts, tests/e2e/harness.ts, tests/e2e/tier1-features/acceptance-fixtures.test.ts
- **Key findings**:
  1. Identified root causes of defect D9 (aggressive normalization destroying display fidelity).
  2. Designed complete dual normalizer architecture: `normalizeDisplay` (diacritics/ezafe preserved) vs `normalizeSearch` (lexical search folding).
  3. Specified zero-dependency Birashk astronomical cycle calendar conversion for Jalali <-> Gregorian with exact round-trip reversibility.
  4. Formulated fast-check property test suites covering idempotency, reversibility, and crash-resistance.
  5. Established complete branch coverage matrix ensuring >= 90% branch coverage across all modules.
- **Unexplored areas**: None for packages/persian. Ready for worker implementation.

## Key Decisions Made
- `packages/persian` will have zero external runtime dependencies (R10 compliant).
- `fast-check` will be added as a devDependency in root `package.json`.
- Strict root-length guards (minStemLength >= 2) and stopword sets prevent over-stemming.
- Digraphs and canonical poet dictionary ensure fast and accurate Finglish transliteration.

## Artifact Index
- DISPATCH.md — Task assignment and requirements
- BRIEFING.md — Persistent working memory and state
- progress.md — Liveness heartbeat
- analysis.md — Full technical design, algorithms, and test specs
- handoff.md — 5-component handoff report for worker and orchestrator
