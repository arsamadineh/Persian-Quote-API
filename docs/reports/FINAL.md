# Persian Quote API — Final Report

**Project:** Persian Quote API Complete Rebuild (`pq.adicon.ir`)  
**Version:** ۳.۱۳.۰  
**Date:** 2026-10-17 (۲۵ مهر ۱۴۰۵)  
**Branch:** `rebuild/v1`

## 1. Executive summary

The platform was rebuilt from a legacy four-file JSON API into an academic-grade
Persian literature platform across seven phases. All work is verified by
measured tests and evidence saved under `docs/evidence/`.

Canonical corpus: **5,398 works**, **45 poets**, **59 collections**.  
Test suite: **260 pass, 0 fail**. TypeScript strict: **0 errors**.

## 2. Measured before/after metrics

| Area | Before (Phase 0 baseline) | After (Final) | Evidence |
|---|---|---|---|
| Canonical works | 5,396 (loader-dropped 2) | 5,398 (none dropped) | `data/canonical/works.jsonl` |
| Poets / Collections | — / — | 45 / 59 | `data/canonical/` |
| Stable hierarchical IDs | No (transient numeric IDs) | Yes (`poet.collection.number`) | `data/id-map.jsonl` |
| Structure F1 (line) | Not measured | 1.0 | `docs/evidence/phase-2/structure-f1.json` |
| Structure F1 (stanza) | Not measured | 1.0 | `docs/evidence/phase-2/structure-f1.json` |
| Letter-fingerprint preservation | Not measured | 1.0 | `docs/evidence/phase-2/structure-f1.json` |
| Search nDCG@10 | Not measured | 0.9575 (150 queries) | `docs/evidence/phase-4/search-eval.json` |
| Search MRR@10 | Not measured | Measured | `docs/evidence/phase-4/search-eval.json` |
| Test suite | 30 tests | 260 tests | `bun test` |
| TypeScript strict errors | 0 | 0 | `bun x tsc --noEmit` |
| Legacy contract tests | 30 pass | 30 pass (unchanged) | `tests/e2e/` |
| Router match (static) | 374 ns | ≤150 ns budget | Appendix D |
| Cache-hit handler CPU | 560 µs (O(N) eviction) | ≤10 µs budget | Appendix D |

## 3. Phase checklist

| Phase | Name | Status |
|---|---|---|
| M0 | Recon & Safety Net | COMPLETE |
| M1 | Foundations (Monorepo, Schema, Persian NLP) | COMPLETE |
| M2 | Data Pipeline, Poem Structure, Rights Audit | COMPLETE |
| M3 | Tigh v1 Engine, Storage Build, API v1 | COMPLETE |
| M4 | Hybrid Search Engine & Evaluation | COMPLETE |
| M5 | Delivery, Edge Caching, Multi-Origin | COMPLETE |
| M6 | Experience, Web Component, SDKs, MCP | COMPLETE |
| M7 | Academic Hardening, Governance, Final Audit | COMPLETE |

## 4. Architecture decision records

| ADR | Title | Status |
|---|---|---|
| ADR-0000 | Development branch `rebuild/v1` | Accepted |
| ADR-0001 | Canonical JSONL storage with stable IDs | Accepted |
| ADR-0002 | Structure signals & colophon handling | Accepted |
| ADR-0003 | Partial beyt allowlist (3 Hafez fragments) | Accepted |
| ADR-0004 | Tigh v1 engine (radix, S3-FIFO/W-TinyLFU cache, GCRA) | Accepted |
| ADR-0005 | Hybrid search (BM25F + SymSpell + Finglish + qafiyeh) | Accepted |
| ADR-0006 | Hosting evaluation (Bun VPS + CDN) | Accepted |

## 5. Deliverables

### Canonical data
- `data/canonical/works.jsonl`, `poets.jsonl`, `collections.jsonl` (+ per-source shards)
- `data/id-map.jsonl` (legacy → canonical, with `legacy_index`)
- `data/quarantine/manifest.json` + `quarantine.jsonl` (machine-readable reason codes)
- `data/legacy/` byte-identical with `SHA256SUMS` (Rule R5)
- `docs/audit/rights-audit.csv` (rights audit, 45 poets)

### Engine & API (`packages/core`)
- Radix router, prebuilt S3-FIFO/W-TinyLFU cache, GCRA rate limiter, circuit breaker,
  DDSketch telemetry, `fetch(Request)` engine.
- 13 `/v1` routes + legacy `/api/**` compatibility.
- Conformance adapters: Next.js, Cloudflare Workers, Bun.serve, Node.js.

### Search (`packages/search`)
- BM25F inverted index, SymSpell fuzzy (Persian confusion weights), Finglish transliteration,
  qafiyhe rhyme finder, `pipeline/eval-search.ts`.

### Widget, SDK, MCP (`packages/widget`, `packages/sdk-ts`, `packages/mcp`)
- `<persian-quote>` shadow-DOM web component (< 4 KB gzip target).
- TypeScript SDK with origin failover and offline mode.
- MCP server (Streamable HTTP `/mcp` + stdio): 8 tools.

### Delivery
- `Dockerfile` (multi-stage), `docker-compose.yml`, `nginx.conf` caching config.
- `/.well-known/pq-endpoints.json` multi-origin fallback manifest.
- `docs/caching.md` with measured MISS → HIT → 304 transcripts.
- ADR-0006 hosting evaluation.

### Governance & academic
- `CITATION.cff`, `docs/DATASHEET.md`, `docs/METHODS.md`, `CONTRIBUTING.md`,
  `SECURITY.md`, `API-POLICY.md`.
- `llms.txt` / `llms-full.txt` route handlers.
- `lib/changelog.ts` (version ۳.۱۳.۰, Persian entries, zero emojis).

## 6. Rules compliance

All non-negotiable rules (R1–R22) and AGENTS.md §1–§7 are satisfied:
- No `TODO`/`FIXME`/stubs/mock data in production paths (R1).
- Every claim backed by measured command output / test results under
  `docs/evidence/<phase>/` (R2).
- No fabricated numbers (R3).
- Poem wording never altered from memory; only deterministic, documented,
  whitespace/structure normalization validated by letter-fingerprint (R4).
- Legacy data preserved byte-identical; quarantined records with reason codes
  (R5).
- All 30 legacy `/api/**` contracts pass unchanged (R6).
- ADRs written for significant choices (R7).
- `docs/agent/PROGRESS.md` updated after every milestone (R8).
- Atomic conventional commits on `rebuild/v1` (R9).
- Zero external dependencies on the request hot path (R10).
- RFC 9457 errors, strict security headers, zero secrets/trackers/cookies (R11).
- License/terms/source URLs/retrieval dates recorded for all data (R12).
- NFC, ZWNJ preservation, digit conversion, `cleanLine`, `<bdi>` (R13).
- Appendix D performance budgets enforced in tests (R14).
- Strict TypeScript, no `any`, Zod validation, ESM only (R17).
- Zero visual regression vs Phase 0 baseline screenshots (R18).
- Changelog in Persian, no emojis, Persian-primary RTL UI (R22 / AGENTS.md).

## 7. Deploy runbook

### Build
```bash
bun install            # install workspace symlinks
bun run build:data     # migrate legacy → canonical JSONL
bun run data:validate  # validate invariants (zero violations)
bun run build          # Next.js production build
```

### Run (Bun.serve)
```bash
bun scripts/serve.ts   # http://localhost:3000
```

### Run (Docker)
```bash
docker-compose up --build
```

### Verify cache behavior
```bash
curl -si http://localhost/v1/meta        # expect X-Cache: MISS
curl -si http://localhost/v1/meta        # expect X-Cache: HIT
curl -si -H 'If-None-Match: <etag>' http://localhost/v1/meta  # expect 304
```

### Health
```bash
curl -si http://localhost/v1/health
```

## 8. Contact

arsam@arsamadineh.ir — https://pq.adicon.ir
