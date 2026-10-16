# Phase 0 Completion Report: Safety Net & Reconnaissance

## 1. Overview & Objectives

Phase 0 establishes the baseline safety net and empirical reconnaissance foundation for the Persian Quote API rebuild project, ensuring strict adherence to operating rules R1–R22. Prior to refactoring any business logic or data structures, immutable legacy baselines have been cataloged, frozen, and verified.

All Phase 0 requirements outlined in `ORIGINAL_REQUEST.md` §6 and `PROJECT.md` Milestone M0 have been executed and verified on Linux x86_64 using Bun 1.4.3 and Playwright 1.64.1 with Google Chrome 155.

---

## 2. Deliverables Summary

### 2.1 Git Branch Safety Net (Rule R9)
- Branch created and checked out: `rebuild/v1`
- Baseline commit preserves the original repository state before monorepo migration.

### 2.2 Legacy Data Freeze & SHA-256 Checksum Verification (Rule R5)
All legacy datasets from `lib/data/` were copied to `data/legacy/`, checksummed, verified with `sha256sum -c`, and locked read-only (`chmod 0444`):
- `data/legacy/hafez.json`: 694,755 bytes, 497 records, SHA-256: `d1bba4d76fc191150da6114cabd6b6eb94338ea08ce61e31b72fba1510064572`
- `data/legacy/non-poetry-quotes.json`: 214,737 bytes, 494 records (492 active), SHA-256: `e8649722cec2a8cc3dbb9da035989643973d5922e406e6b7f3e60fd3a746dd25`
- `data/legacy/poetry-quotes.json`: 3,110 bytes, 7 records, SHA-256: `90e007c504cf94f18bb153a79416ac9fd8cb0db492ad3d437d62b0e72083c7f9`
- `data/legacy/shereno.json`: 5,981,895 bytes, 4,400 records, SHA-256: `fe0818cd5ea807c39e131bdca3780828bee3da7827b3eed8a185d512f4ce606b`
- Verification artifact: `data/legacy/SHA256SUMS`
- Structured metadata: `data/legacy/manifest.json`

### 2.3 Golden Legacy Contracts Recording (Rule R6)
Executed `scripts/record-golden-contracts.ts` against a production build of the legacy service. Recorded 30 contract test cases encompassing all legacy endpoint variations, query parameters (`lines=auto|separators|raw`, `random=false`, `limit`, `page`), search queries, and HTML embed rendering:
- Target directory: `data/golden/contracts/`
- Manifest index: `data/golden/contracts/index.json` (30 cases, all 200 OK)
- Stored attributes: request URL, HTTP status code, response headers (Content-Type, Cache-Control, Access-Control-Allow-Origin), recorded timestamp, and exact response payload bodies.

### 2.4 Playwright Visual Baselines (Rule R18)
Executed `scripts/capture-baseline-screenshots.ts` using local Google Chrome (`/usr/bin/google-chrome-stable` v155):
- Matrix: 9 pages (`/`, `/docs`, `/examples`, `/embed`, `/sakhtar`, `/contribute`, `/changelog`, `/privacy`, `/terms`) x 2 viewports (Desktop 1280x800, Mobile 390x844) x 2 themes (Light, Dark).
- Total screenshots: 36 full-page PNG files saved to `docs/evidence/phase-0/screenshots/`.
- Visual Gallery: `docs/evidence/phase-0/screenshots/gallery.md`.

### 2.5 Baseline Performance & Resource Profiling (Rule R2, R3, R14)
Executed `scripts/measure-baseline-perf.ts` against the production server, measuring:
- Cold start: Server launch to `/api/health` first byte: `5,600.61 ms`. First dataset query latency (`/api/quotes/hafez?limit=1`): `15.86 ms`.
- Warm latency distribution (500 requests per endpoint):
  - `/api/health`: p50 = 2.89 ms, p95 = 11.05 ms, p99 = 24.29 ms
  - `/api/stats`: p50 = 2.35 ms, p95 = 11.03 ms, p99 = 32.63 ms
  - `/api/quotes/hafez?limit=5`: p50 = 3.77 ms, p95 = 19.80 ms, p99 = 56.26 ms
  - `/api/quotes/shereno?limit=5`: p50 = 1.65 ms, p95 = 5.99 ms, p99 = 10.81 ms
  - `/api/quotes/search?q=عشق&limit=5`: p50 = 1.63 ms, p95 = 6.20 ms, p99 = 9.69 ms
  - `/api/poets`: p50 = 1.45 ms, p95 = 6.67 ms, p99 = 11.74 ms
- Router and cache microbenchmark:
  - Router average match latency: `374.19 ns/op`.
  - Cache average lookup latency: `559,720 ns/op` (~560 µs), confirming the O(N) `Array.splice` flaw in Tigh v0.0.1-beta.
- Memory profile:
  - RSS: 50.27 MB; Heap Used: 0.79 MB.
- Output artifact: `docs/evidence/phase-0/performance/baseline.json`.

### 2.6 Reconnaissance and Defect Audit Document
Authored `docs/audit/00-recon.md` providing an exhaustive survey of repository layout, toolchains, legacy dataset census, legacy API contracts, visual inventory, defect code evidence for D1–D20, performance baselines, and workstream architecture roadmap.

---

## 3. Exit Gate Verification

| Requirement | Verification Method | Status |
|---|---|---|
| Git branch `rebuild/v1` | `git status` shows on branch `rebuild/v1` | PASS |
| Immutable legacy snapshots | `sha256sum -c data/legacy/SHA256SUMS` exits 0 | PASS |
| Read-only permissions on legacy data | Permissions `0444` on `data/legacy/*` | PASS |
| 30 Golden contract responses | 30 JSON files in `data/golden/contracts/` with `index.json` | PASS |
| 36 Playwright visual baseline screenshots | 36 PNG files in `docs/evidence/phase-0/screenshots/` + `gallery.md` | PASS |
| Empirical baseline performance JSON | `docs/evidence/phase-0/performance/baseline.json` populated | PASS |
| Formal audit document `00-recon.md` | `docs/audit/00-recon.md` complete with D1–D20 evidence | PASS |
| Living project progress document | `docs/agent/PROGRESS.md` initialized | PASS |
| Persian changelog update | `lib/changelog.ts` updated adhering to AGENTS.md | PASS |
| Test suite passes | `bun test` passes 30/30 tests | PASS |

---

## 4. Next Phase Readiness

Phase 0 has established all prerequisite safety nets and baseline measurements. The project is fully unblocked to enter **Phase 1: Foundations (Milestone M1)**:
- Establishing the Bun workspaces monorepo layout (`apps/web`, `apps/api`, `packages/core`, `packages/schema`, `packages/persian`, `packages/poem`, `packages/search`, `packages/store`, `packages/sdk-ts`, `packages/sdk-py`, `packages/mcp`, `packages/widget`).
- Implementing `packages/schema` with canonical Zod schemas for poems, poets, and collections.
- Implementing `packages/persian` with dual normalizers (`normalizeDisplay` vs `normalizeSearch`), `cleanLine`, tokenizer, stemmer, digit normalizer, and property-based test suites achieving >= 90% branch coverage.
