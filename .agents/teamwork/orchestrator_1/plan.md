# Project Plan: Persian Quote API Complete Rebuild

## Executive Summary
Rebuild `pq.adicon.ir` from an in-memory JSON prototype into a reference open, university-grade Persian literature platform across 7 phases, 15 workstreams, R1-R22 non-negotiable operating rules, and AGENTS.md requirements.

## Architecture & Tracks
1. **Implementation Track**:
   - Phase 0: Recon & Safety Net (legacy snapshots, baseline measurements, Playwright screenshots, `docs/audit/00-recon.md`)
   - Phase 1: Foundations (monorepo layout, `packages/schema`, `packages/persian` with >=90% branch coverage and property tests)
   - Phase 2: Data & Structure (WS1 canonical model & migration, WS3 structure engine & eval harness, WS4 excerpt/radif/qafiyeh, rights audit, acceptance fixtures A1-A3)
   - Phase 3: Engine, Artifacts, API (WS5 build pipeline & artifacts, WS6 Tigh v1 zero-dependency core, WS7 API v1 + legacy compatibility + OpenAPI 3.1)
   - Phase 4: Search (WS8 hybrid search, BM25F, SymSpell fuzzy, Finglish query, rhyme finder, >=150 query eval set with nDCG@10 & MRR@10)
   - Phase 5: Delivery & Operations (WS9 hosting benchmark ADR, CDN caching verification, multi-origin mirrors, Docker, load test)
   - Phase 6: Experience & Ecosystem (WS10 Web Component, WS11 Web app, WS12 SDKs & notebooks, WS13 MCP server)
   - Phase 7: Governance & Academic Hardening (WS14/WS15 governance docs, Appendix C self-audit, docs/reports/FINAL.md)

2. **E2E Testing Track (Parallel)**:
   - Independent requirement-driven opaque-box testing suite (`TEST_INFRA.md`).
   - Four test tiers:
     - Tier 1: Feature coverage (>=5 per feature)
     - Tier 2: Boundary & corner cases (>=5 per feature)
     - Tier 3: Pairwise cross-feature combinations
     - Tier 4: Real-world application scenarios
   - Publication of `TEST_READY.md`.
   - Final milestone gate: 100% pass rate on Tiers 1-4, followed by Tier 5 adversarial hardening.

## Current Stage: Phase 0 (Recon & Safety Net)
- Step 0.1: Survey existing codebase, specs, and environment (3 subagents in progress: `explorer_0_1`, `spec_miner_0_1`, `explorer_0_2`).
- Step 0.2: Merge findings into `PROJECT.md` and feature inventory.
- Step 0.3: Execute safety net actions via Phase 0 Worker:
  - Snapshot legacy data with SHA-256 to `data/legacy/`
  - Capture legacy API golden contracts
  - Capture Playwright baseline visual screenshots
  - Measure baseline performance
  - Produce `docs/audit/00-recon.md`
- Step 0.4: Review, challenge, and forensic audit of Phase 0.
