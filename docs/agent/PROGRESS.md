# Project Progress & State Log

**Project**: Persian Quote API Complete Rebuild (`pq.arsamadineh.ir`)  
**Current Phase**: Milestone M2 (Phase 2: Data Pipeline) Complete -> Entering M3  
**Last Updated**: 2026-10-16T21:15:00Z  
**Branch**: `rebuild/v1`  

---

## 1. Milestone Status Overview

| Milestone | Name | Status | Completion Date | Evidence |
|---|---|---|---|---|
| **M0** | Phase 0: Recon & Safety Net | **COMPLETE** | 2026-10-16 | `docs/reports/phase-0.md`, `docs/audit/00-recon.md` |
| **M1** | Phase 1: Foundations (Monorepo, Schema, Persian NLP) | **COMPLETE** | 2026-10-16 | `docs/reports/phase-1.md` |
| **M2** | Phase 2: Data Pipeline, Poem Structure, Rights Audit | **COMPLETE** | 2026-10-16 | `docs/reports/phase-2.md`, `docs/evidence/phase-2/` |
| **M3** | Phase 3: Tigh v1 Engine, Storage Build, API v1 | NEXT | — | — |
| **M4** | Phase 4: Hybrid Search Engine & Evaluation | PLANNED | — | — |
| **M5** | Phase 5: Delivery, Edge Caching, Multi-Origin | PLANNED | — | — |
| **M6** | Phase 6: Experience, Web Component, SDKs, MCP | PLANNED | — | — |
| **M7** | Phase 7: Academic Hardening, Governance, Final Audit | PLANNED | — | — |
| **E2E** | Independent E2E Testing Track | ACTIVE | 2026-10-16 | `TEST_INFRA.md` (86 tests passing) |

---

## 2. Phase 1 Detailed Checklist

- [x] Configured Bun workspaces in root `package.json` (`"workspaces": ["apps/*", "packages/*"]`)
- [x] Configured relative path aliases in root `tsconfig.json` (`@persian-quote/schema`, `@persian-quote/persian`, `@/*`)
- [x] Configured `transpilePackages: ["@persian-quote/schema", "@persian-quote/persian"]` in `next.config.mjs`
- [x] Scaffolded `apps/web/package.json`
- [x] Ran `bun install` to establish symlinks in `node_modules/@persian-quote/`
- [x] Implemented `packages/schema` (`@persian-quote/schema`):
  - [x] `src/common/id.ts`: `StableIdSchema`, parser, formatter (`poet-slug.collection-slug.number`)
  - [x] `src/common/dates.ts`: `JalaliDateSchema`, `GregorianDateStringSchema`, `HistoricalDateSchema`
  - [x] `src/common/colophon.ts`: `ColophonSchema`
  - [x] `src/common/rights.ts`: `RightsSchema`, `RightsStatusEnum`
  - [x] `src/common/attribution.ts`: `AttributionSchema`, `AttributionStatusEnum`
  - [x] `src/common/meter.ts`: `MeterSchema`
  - [x] `src/models/poem.ts`: `PoemSchema`, `StanzaSchema`, `ExcerptSchema`, `StructureMetaSchema`, `SourceMetadataSchema`, `PoeticFormEnum`
  - [x] `src/models/poet.ts`: `PoetSchema`, `HistoricalEraEnum`
  - [x] `src/models/collection.ts`: `CollectionSchema`
  - [x] `src/api/problem-details.ts`: RFC 9457 `ProblemDetailsSchema` and factory function `createProblemDetails`
  - [x] `src/api/legacy/quotes.ts`, `catalogs.ts`, `stats.ts`: Legacy schemas validating the 30 golden contracts
  - [x] `src/generators/json-schema.ts`: Native AST walker for JSON Schema Draft 2020-12
  - [x] `src/generators/openapi.ts`: Native OpenAPI 3.1 generator
  - [x] `src/validators/helpers.ts`: Typed validation helpers
- [x] Implemented tests for `packages/schema`: 46 pass, 0 fail (validating Acceptance Fixtures A1/A2 and all 30 legacy contracts)
- [x] Implemented `packages/persian` (`@persian-quote/persian`) with zero runtime dependencies:
  - [x] `src/digits.ts`: `toAsciiDigits`, `toPersianDigits`, `toArabicDigits`
  - [x] `src/cleaner.ts`: `cleanLine` (preserving letter fingerprint R4), `assertPersianTypography`
  - [x] `src/normalizer.ts`: `normalizeDisplay` (preserves diacritics & ZWNJ), `normalizeSearch`
  - [x] `src/tokenizer.ts`: `tokenize` with ZWNJ compound word support
  - [x] `src/stemmer.ts`: `lightStem` without over-stemming
  - [x] `src/calendar.ts`: Native Birashk cycle algorithm (`jalaliToGregorian`, `gregorianToJalali`, `daysInJalaliMonth`, `isJalaliLeapYear`, `parseJalaliDate`)
  - [x] `src/bidi.ts`: `bidiIsolate`, `detectDirection`, `stripBidiControls`
  - [x] `src/finglish.ts`: `finglishQuery`, `transliterateFinglish`
  - [x] `src/fuzzy.ts`: `levenshteinDistance`, `fuzzyMatch`
- [x] Implemented tests for `packages/persian`: 67 pass, 0 fail
  - [x] Fast-check property-based tests in `property.test.ts` (10 mathematical invariants, 100 runs each)
  - [x] Line coverage: 99.05%, function coverage: 100.00%
- [x] Verified complete test suite: `bun test` passes 199/199 tests across 31 files
- [x] Verified TypeScript typecheck: `bun x tsc --noEmit` exits with 0 errors
- [x] Verified Next.js production build: `bun run build` generates 16 routes with exit code 0
- [x] Authored Phase 1 report `docs/reports/phase-1.md`
- [x] Updated `lib/changelog.ts` following AGENTS.md rules

---

## 3. Phase 0 Detailed Checklist

- [x] Switched to dedicated branch `rebuild/v1` (Rule R9)
- [x] Created `data/legacy/` snapshot with byte-identical original JSON files (Rule R5):
  - [x] `hafez.json` (694,755 B, 497 records, SHA-256: `d1bba4d76fc191150da6114cabd6b6eb94338ea08ce61e31b72fba1510064572`)
  - [x] `non-poetry-quotes.json` (214,737 B, 494 records, SHA-256: `e8649722cec2a8cc3dbb9da035989643973d5922e406e6b7f3e60fd3a746dd25`)
  - [x] `poetry-quotes.json` (3,110 B, 7 records, SHA-256: `90e007c504cf94f18bb153a79416ac9fd8cb0db492ad3d437d62b0e72083c7f9`)
  - [x] `shereno.json` (5,981,895 B, 4,400 records, SHA-256: `fe0818cd5ea807c39e131bdca3780828bee3da7827b3eed8a185d512f4ce606b`)
- [x] Generated and validated `data/legacy/SHA256SUMS` with `sha256sum -c`
- [x] Created `data/legacy/manifest.json` and set read-only permissions (`0444`)
- [x] Recorded golden contract responses for all 30 legacy contract cases to `data/golden/contracts/` with `index.json` (Rule R6)
- [x] Captured Playwright baseline screenshots for all 9 pages across Desktop and Mobile viewports, Light and Dark modes (36 screenshots) to `docs/evidence/phase-0/screenshots/` (Rule R18)
- [x] Generated screenshot gallery at `docs/evidence/phase-0/screenshots/gallery.md`
- [x] Measured empirical baseline performance metrics to `docs/evidence/phase-0/performance/baseline.json` (Rules R2, R3, R14)
- [x] Authored comprehensive reconnaissance report `docs/audit/00-recon.md` incorporating evidence for defects D1 through D20
- [x] Authored Phase 0 completion report `docs/reports/phase-0.md`
- [x] Initialized living state log `docs/agent/PROGRESS.md` (Rule R8)
- [x] Updated `lib/changelog.ts` following repository AGENTS.md rules
- [x] Verified test suite passes: `bun test` passes 30/30 tests

---

## 4. Measured Empirical Numbers Baseline

All metrics measured on Linux x86_64, Bun 1.4.3:

### 4.1 Corpus Census
- Raw JSON Files: 4
- Total Raw File Size: 6,894,497 bytes (~6.57 MB)
- Total Raw Records: 5,398
- Active Loaded Records: 5,396 (2 records dropped by legacy loader during normalization)

### 4.2 Performance Baselines (`docs/evidence/phase-0/performance/baseline.json`)
- **Cold Start**:
  - Boot to `/api/health` first byte: `5,600.61 ms`
  - First dataset query (`/api/quotes/hafez?limit=1`): `15.86 ms`
- **Warm Latency Distributions (500 requests per endpoint)**:
  - `/api/health`: p50 = 2.89 ms, p90 = 9.01 ms, p95 = 11.05 ms, p99 = 24.29 ms
  - `/api/stats`: p50 = 2.35 ms, p90 = 8.76 ms, p95 = 11.03 ms, p99 = 32.63 ms
  - `/api/quotes/hafez?limit=5`: p50 = 3.77 ms, p90 = 14.05 ms, p95 = 19.80 ms, p99 = 56.26 ms
  - `/api/quotes/shereno?limit=5`: p50 = 1.65 ms, p90 = 4.27 ms, p95 = 5.99 ms, p99 = 10.81 ms
  - `/api/quotes/search?q=عشق&limit=5`: p50 = 1.63 ms, p90 = 4.67 ms, p95 = 6.20 ms, p99 = 9.69 ms
  - `/api/poets`: p50 = 1.45 ms, p90 = 5.02 ms, p95 = 6.67 ms, p99 = 11.74 ms
- **Tigh v0.0.1-beta Engine Microbenchmark**:
  - Router match average: `374.19 ns/op` (Static budget target: <= 150 ns)
  - Cache set average: `2,926 ns/op`
  - Cache lookup average: `559,721 ns/op` (~560 µs) — reveals severe O(N) array splice eviction bottleneck (Budget target: <= 10 µs)
- **Memory Footprint**:
  - Process RSS: `50,270,208 bytes` (~47.9 MB)
  - Heap Used: `790,574 bytes` (~0.75 MB)

---

## 5. Key Architecture Decisions

- **ADR-0000**: Development branch `rebuild/v1` designated for monorepo rebuild.
- **ADR-0001**: Canonical JSONL storage with stable hierarchical IDs and `legacy_index` disambiguation (`docs/adr/0001-canonical-jsonl-stable-ids.md`).
- **ADR-0002**: Structure signals (`□■`), digits-only filtering, 2-digit year mapping, NFC (`docs/adr/0002-structure-signals-colophon.md`).
- **ADR-0003**: Partial beyt allowlist for three Hafez fragments (`docs/adr/0003-partial-beyt-allowlist.md`).
- **ADR-0001 (Planned)**: Data storage format and retrieval strategy benchmark (SQLite FTS5 vs JSON shards vs DuckDB).
- **ADR-0002 (Planned)**: Production hosting infrastructure evaluation (Cloudflare Workers vs Vercel Serverless vs Standalone VPS).

---

## 6. Phase 2 Detailed Checklist

- [x] Fixed empty hemistich handling in `pipeline/migrate-legacy.ts` with trim and filter
- [x] Ran migration: 5398 works, 45 poets, 59 collections, 5398 id-maps, 4 quarantine events (`docs/evidence/phase-2/migrate.log`)
- [x] Created `pipeline/validate-data.ts` and wired `bun run data:validate` (passes, zero violations)
- [x] Created `pipeline/eval-structure.ts` and wired `bun run eval:structure` (line F1 1.0, stanza F1 1.0, `docs/evidence/phase-2/structure-f1.json`)
- [x] Verified `bun test tests/e2e/tier1-features/acceptance-fixtures.test.ts` 6 pass (A1/A2/A3)
- [x] Wrote `docs/reports/phase-2.md` and updated `lib/changelog.ts` to `۳.۱۰.۰`
- [x] Verified `bun test` 216 pass, `bun x tsc --noEmit` 0 errors

---

## 7. Owner Questions & Blockers

- Currently zero blocking questions. Phase 2 is complete. Ready to proceed to Phase 3 (Tigh v1 Engine, Storage Build, API v1).
