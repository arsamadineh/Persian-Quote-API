# 00-recon.md — Phase 0 Repository Reconnaissance & Safety Net Baseline

## 1. Executive Summary & Audit Scope

This document establishes the empirical reconnaissance baseline and safety net for the comprehensive rebuild of Persian-Quote-API (`pq.arsamadineh.ir`). In accordance with rules R1 through R22 in `ORIGINAL_REQUEST.md`, no production engine or architecture code is modified prior to establishing verifiable baselines, immutable dataset snapshots, golden contract recordings, visual regression baselines, and performance benchmarks.

The project is transitioning from a single-process, in-memory Next.js prototype (`my-v0-project`, Tigh engine v0.0.1-beta) into an academic-grade, modular monorepo (Bun workspaces) featuring a zero-dependency core engine (Tigh v1), Persian linguistic normalization, structured poem modeling with letter-fingerprint immutability, BM25F and semantic hybrid search, and persistent data artifacts.

All observations in this document have been empirically measured and validated on the target execution environment.

---

## 2. Environment & Toolchain Census

- **Host Operating System**: Linux x86_64
- **Runtime Engines**:
  - Bun: `1.4.3` (Commit `c6da4a4d3`)
  - Node.js: `v26.3.0` (npm compatible)
- **Git State**:
  - Baseline Branch: `rebuild/v1` (forked from `main`)
- **Package Identity (`package.json`)**:
  - Legacy Name: `my-v0-project`
  - Version: `0.1.0`
  - Framework: Next.js `15.2.8` with React `19.0.0`
  - Styling: Tailwind CSS v4 (`@tailwindcss/postcss: ^4.1.9`, `tailwindcss: ^4.1.9`)
  - TypeScript: v5, Target `ES6`, Module `ESNext`, path alias `@/*` -> `./*`
- **Compiler Configuration Anomalies (`next.config.mjs`)**:
  - `eslint.ignoreDuringBuilds: true` (masks code hygiene issues during builds)
  - `typescript.ignoreBuildErrors: true` (masks type mismatches during builds)
  - `headers()`: Applies `X-Frame-Options: SAMEORIGIN` across all routes, conflicting with intended iframe embed functionality (`/embed` and `/api/embed`).
- **Browser Automation Infrastructure**:
  - Playwright CLI: `1.64.1`
  - Browser Binary: Google Chrome `155.0.8059.79` (`/usr/bin/google-chrome-stable`)
  - Test Automation: 30 test cases executed via `bun test` in `tests/` across 3 test suites (`engine.test.ts`, `poem-lines.test.ts`, `store.test.ts`).

---

## 3. Dataset Audit & Provenance Verification

### 3.1 Census of Legacy Datasets (`lib/data/*.json`)

Direct measurements of the four legacy JSON datasets:

| File Path | Byte Size | Line Count | Raw Record Count | Active Store Count | SHA-256 Checksum | Top-Level Record Keys |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `lib/data/hafez.json` | 694,755 | 20,221 | 497 | 497 | `d1bba4d76fc191150da6114cabd6b6eb94338ea08ce61e31b72fba1510064572` | `id`, `title`, `poet`, `verses` |
| `lib/data/non-poetry-quotes.json` | 214,737 | 2,472 | 494 | 492 | `e8649722cec2a8cc3dbb9da035989643973d5922e406e6b7f3e60fd3a746dd25` | `id`, `body`, `author` |
| `lib/data/poetry-quotes.json` | 3,110 | 73 | 7 | 7 | `90e007c504cf94f18bb153a79416ac9fd8cb0db492ad3d437d62b0e72083c7f9` | `id`, `text_persian`, `text_english`, `poet`, `poet_english`, `source`, `category`, `tags` |
| `lib/data/shereno.json` | 5,981,895 | 1 | 4,400 | 4,400 | `fe0818cd5ea807c39e131bdca3780828bee3da7827b3eed8a185d512f4ce606b` | `id`, `poem`, `poet`, `title`, `book` |
| **Total** | **6,894,497** | **22,767** | **5,398** | **5,396** | N/A | Total records: 5,398 raw / 5,396 active |

### 3.2 Data Anomalies and Deduplication

1. **Non-Poetry Deduplication Drop**:
   `lib/data/store.ts` (lines 92–96 and 184–189) discards 2 records from `non-poetry-quotes.json` during in-memory load: 1 record with duplicate body and 1 malformed record. This results in 492 active records out of 494 raw records.
2. **Discrepancy in `poetry-quotes.json` Documentation**:
   `ARCHITECTURE.md` (line 26) claims `poetry-quotes.json` contains over 4,100 couplets and classical quotes ("بیش از ۴۱۰۰ بیت و گزیده‌شعر کلاسیک"). In reality, the file contains exactly 7 items (`id: 1` through `id: 7`).
3. **Inconsistent Representation of Poem Text**:
   - `hafez.json`: couplets stored as arrays of two strings in `verses` (`string[][]`). Joined at runtime with raw `" / "` (`store.ts:344-346`).
   - `shereno.json`: entire poems stored as unsegmented strings with arbitrary whitespace, asterisks (`*`), or newlines in `poem`.
   - `non-poetry-quotes.json`: prose stored in `body`.
   - `poetry-quotes.json`: classical couplets stored in `text_persian` and `text_english`.
4. **Data Freeze Safety Net**:
   Per rule R5, exact byte-identical copies have been frozen under `data/legacy/` with `data/legacy/SHA256SUMS` and `data/legacy/manifest.json`. File permissions have been set to read-only (`0444`).

---

## 4. API Surface & Contract Specification

The legacy routing surface consists of 14 active endpoints under `app/api/**` managed by `lib/engine/instance.ts` and `lib/engine/adapter-next.ts` (plus `app/api/embed/route.tsx` standalone):

| # | Route | Method | Key Parameters | Observed Response Contract | Status Code |
|---|---|---|---|---|---|
| 1 | `/api/quotes` | GET | `lines`, `limit`, `page`, `random`, `poet` | `{ success: true, data: [...], count, total, page, limit, line_mode }` | 200 |
| 2 | `/api/quotes/[poet]` | GET | `lines`, `limit`, `page`, `random` | `{ success: true, data: [...], count, total, page, limit, line_mode, poet }` | 200 |
| 3 | `/api/quotes/category/[category]` | GET | `lines`, `limit`, `page`, `random` | `{ success: true, data: [...], count, total, page, limit, line_mode, category }` | 200 |
| 4 | `/api/quotes/hafez` | GET | `id`, `q`, `lines`, `limit`, `page`, `random` | `{ success: true, data: [...], count, total, page, limit, line_mode }` | 200 |
| 5 | `/api/quotes/shereno` | GET | `poet`, `title`, `lines`, `limit`, `page`, `random` | `{ success: true, data: [...], count, total, page, limit, line_mode, meta: { note } }` | 200 |
| 6 | `/api/quotes/non-poetry` | GET | `author`, `lines`, `limit`, `page`, `random` | `{ success: true, data: [...], count, total, page, limit, line_mode, meta: { raw, dropped, note } }` | 200 |
| 7 | `/api/quotes/search` | GET | `q`/`query`, `lines`, `limit`, `page`, `random` | `{ success: true, data: [...], count, total, page, limit, line_mode, query }` | 200 |
| 8 | `/api/poets` | GET | none | `{ success: true, data: [...], count }` (no pagination) | 200 |
| 9 | `/api/categories` | GET | none | `{ success: true, data: [...], count }` (no pagination) | 200 |
| 10 | `/api/stats` | GET | none | `{ success: true, data: {...}, engine: {...}, dataIntegrity: {...} }` | 200 |
| 11 | `/api/health` | GET | none | `{ success: true, data: { status: "ok", engine: "تیغ/0.0.1-beta", ... } }` | 200 |
| 12 | `/api/engine/stats` | GET | none | `{ success: true, engine: "تیغ", version, metrics: {...} }` | 200 |
| 13 | `/api/engine/benchmark` | GET | `iterations` | `{ success: true, engine: "تیغ", version, benchmark: {...} }` | 200 |
| 14 | `/api/embed` | GET | `theme`, `size`, `poet`, `category`, `english` | Standalone HTML document (`Content-Type: text/html; charset=utf-8`) | 200 / 404 |

### Golden Contract Recordings (`data/golden/contracts/`)
All 30 contract test cases specified in the survey have been recorded against the production build, including request paths, status codes, response headers, and exact payload bodies. The catalog is tracked in `data/golden/contracts/index.json`.

---

## 5. Web Surface & Visual Baselines

The client web interface consists of 9 public Next.js pages:
1. `/` (Home): Hero quote card, search/filter controls, interactive API playground preview, architecture badge.
2. `/docs`: API documentation, endpoint catalogs, code snippets in cURL, JavaScript, and Python.
3. `/examples`: Integration recipes for React, Vue, Vanilla JS, and Telegram bot.
4. `/embed`: Visual widget configurator and iframe embed code generator.
5. `/sakhtar`: Live observability dashboard visualizing memory, engine metrics, latency percentiles, and cache hit ratios.
6. `/contribute`: Poetry contribution form generating SQL statements.
7. `/changelog`: Project version history and change logs.
8. `/privacy`: Privacy policy.
9. `/terms`: Terms of service.

### Baseline Screenshot Matrix
Playwright baseline screenshots were captured using local Google Chrome across Desktop (1280x800) and Mobile (390x844) viewports in both Light and Dark color schemes (36 screenshots total) under `docs/evidence/phase-0/screenshots/`, documented in `docs/evidence/phase-0/screenshots/gallery.md`.

---

## 6. Systematic Audit of Known Defects (D1–D20)

Every defect cataloged in Section 3 of `ORIGINAL_REQUEST.md` has been directly verified in the codebase:

### D1: Footer Leaks into Poem Body
- **Location**: `lib/data/poem-lines.ts:87-128`, `lib/data/shereno.json:4160`
- **Evidence**: Poem ID 4160 (Salman Harati) concludes with `"مزردشت، تنکابن، 1/1/1363"`. Running `layoutPoem(p.poem, "auto")` returns lines array where the final line is `"مزردشت، تنکابن، 1/1/1363"`. Over 25 poems in `shereno.json` exhibit this colophon leak.
- **Root Cause**: Absence of colophon extraction before stanza and line segmentation.

### D2: Raw Gaps Inside Rendered Lines (Double Spaces Survive)
- **Location**: `lib/data/store.ts:375-410`, `lib/data/non-poetry-quotes.json`
- **Evidence**: 21 quotes in `presentQuote` contain raw double spaces, e.g. `np-80`: `"مانند آسمان باش، یا با خورشید و روز یا با  ماه و شب..."`.
- **Root Cause**: Whitespace collapsing is only applied during shereno line reconstruction, leaving prose and classical datasets uncleaned.

### D3: Punctuation Spacing (Space Before Comma)
- **Location**: `lib/data/store.ts:375-410`, `lib/data/non-poetry-quotes.json:169`
- **Evidence**: 9 quotes contain spaces before Persian commas (`،`), e.g. `np-169`: `"برای بهترین ایده منتظر نمان ، ایده بهتر را انجام بده ،..."`.
- **Root Cause**: Lack of automated punctuation normalization rules in the data presentation pipeline.

### D4: Guessing Line Breaks with ~24 Chars/Line Target
- **Location**: `lib/data/poem-lines.ts:135`
- **Evidence**: `const TARGET_LINE_LENGTH = 24; const MIN_LINE_LENGTH = 8; const MAX_LINE_LENGTH = 64;` used in DP penalty calculation: `cost = base + (length - TARGET_LINE_LENGTH) ** 2`.
- **Root Cause**: Arbitrary fixed character targets artificially break naturally structured poetic verses.

### D5: Naive Widget Truncation
- **Location**: `app/api/embed/route.tsx:8-20` (`trimPoem`)
- **Evidence**: `trimPoem` truncates lines strictly by character count (`used + line.length > maxChars`) and appends an ellipsis (`…`). It fails to inspect grammatical phrase boundaries, causing lines to end on prepositions or conjunctions.
- **Root Cause**: Absence of windowed excerpt selection (`pickExcerpt`).

### D6: Serverless State Is Per-Instance
- **Location**: `lib/engine/instance.ts:4`, `lib/engine/metrics.ts:118`
- **Evidence**: Singleton instance `engine = new Tigh(...)` stores cache, rate limits, and metrics in local process memory (`collectionScope: 'process-instance'`).
- **Root Cause**: In multi-instance serverless deployments (Vercel), state is fragmented across instances without synchronization or edge persistence.

### D7: Substring Search Only
- **Location**: `lib/data/store.ts:702, 739, 790`
- **Evidence**: Search queries are executed via linear scan: `item.search.indexOf(term)` and `data.filter(g => g.search.includes(q))`.
- **Root Cause**: No inverted index, tokenization, BM25 scoring, or vector semantic retrieval.

### D8: Inconsistent Response Shapes
- **Location**: `lib/engine/routes.ts:70-192`, `app/api/embed/route.tsx:48-57`
- **Evidence**: `/api/quotes` returns `line_mode`; `/api/quotes/non-poetry` injects `meta: { raw, dropped, note }`; `/api/quotes/search` injects `query`; `/api/poets` returns integer IDs (`id: 1`) without pagination, whereas quote items use prefixed strings (`id: "p-1"`).
- **Root Cause**: Ad hoc endpoint handler implementations without unified Zod response schemas.

### D9: Over-Aggressive Normalization Destroying Display Fidelity
- **Location**: `lib/data/store.ts:151-155, 185`, `tests/store.test.ts:18-20`
- **Evidence**: `store.ts:155` deletes ZWNJ (`\u200c` -> `""`), `store.ts:152` maps `ۀ` to `ه`, and `NON_TOKEN_RE` strips all punctuation. `tests/store.test.ts:19` explicitly asserts `expect(normalizeText("می‌روم")).toBe("میروم")`.
- **Root Cause**: Conflating search normalization with text storage and display normalization.

### D10: Blanket "Public Domain" Claim Unverified for Modern Poets
- **Location**: `README.md:239`, `app/terms/layout.tsx:9, 16`, `app/llms.txt.ts:37`
- **Evidence**: Blanket claim that all dataset content is "Public Domain" (`مالکیت عمومی`). The dataset contains 20th-century poets protected under Iranian 50-year copyright: Salman Harati (d. 1986), Sohrab Sepehri (d. 1980), Mehdi Akhavan-Sales (d. 1990), Ahmad Shamlou (d. 2000), Yadollah Royaee (d. 2022).
- **Root Cause**: Lack of copyright and provenance audit.

### D11: Contribution Flow Builds SQL for Nonexistent Database
- **Location**: `app/contribute/page.tsx:61-78`
- **Evidence**: Frontend generates SQL `INSERT INTO public.poets...` and writes to `scripts/contributions/quote_[timestamp].sql`. No PostgreSQL database exists; the entire application runs off static JSON.
- **Root Cause**: Legacy placeholder workflow disconnected from repository architecture.

### D12: Placeholder and Obsolete Tags in HTML Head
- **Location**: `app/layout.tsx:199-203, 215-217, 228-231`
- **Evidence**: Contains `verification_token_placeholder`, `bing_verification_token_placeholder`, `yandex_verification_token_placeholder`. References non-existent icons (`favicon-32x32.png`, `apple-icon.svg`). Obsolete tags: `HandheldFriendly`, `MobileOptimized`.
- **Root Cause**: Leftover boilerplate from initial template scaffolding.

### D13: Personal Paths Hardcoded in Docs Prompts
- **Location**: `components/ai-prompts.tsx:31, 67`, `lib/docs-index.ts:404`, `scripts/extract_quotes.py:5-6`
- **Evidence**: Hardcoded local filesystem path `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API` exposed in documentation and AI prompts.
- **Root Cause**: Unsanitized local paths committed into source files.

### D14: Fake/Stale Latency Numbers
- **Location**: `ARCHITECTURE.md:13`, `lib/changelog.ts:67, 230`
- **Evidence**: Documentation claims sub-millisecond responses ("زمان پاسخ به زیر یک میلی‌ثانیه برسد") and changelog claims "کاهش از ۱۵۵ میلی‌ثانیه به کسر میلی‌ثانیه" without empirical benchmark logs or reproduction methodology.
- **Root Cause**: Marketing claims committed without empirical measurement evidence.

### D15: Documentation Inaccuracies
- **Location**: `ARCHITECTURE.md:26, 112`, `README.md:72-88`, `app/layout.tsx:319`
- **Evidence**: `ARCHITECTURE.md` claims `poetry-quotes.json` has 4,100+ items (actual: 7). Claims cache is a doubly-linked list LRU (actual: `Array.splice` with an O(N) re-indexing loop). Layout claims app version `3.1.2` (actual: `0.1.0`).
- **Root Cause**: Drift between documentation drafts and implementation reality.

### D16: Missing Stable IDs, Versioning, and Citation
- **Location**: `lib/data/store.ts:320, 348, 392, 433`
- **Evidence**: Record IDs are transient scraped strings (`p-1`, `h-1`, `np-1`, `sn-1`). No hierarchical identifiers (`poet.collection.number`). No API version prefix (`/v1/`). No `CITATION.cff` or DOI.
- **Root Cause**: Prototype designed for simple frontend display rather than scholarly citation.

### D17: Inadequate Pagination Contract
- **Location**: `lib/data/store.ts:639-658, 835-893`
- **Evidence**: Pagination returns `count` and `total`, but lacks `has_more`, `next_cursor`, or `total_pages`. Returns invalid `page` numbers when `random=true`. `/api/poets` and `/api/categories` lack pagination entirely.
- **Root Cause**: Minimal pagination helper without cursor support or standardized metadata.

### D18: Ad Hoc Error Format
- **Location**: `lib/engine/router.ts:23-27`, `lib/engine/engine.ts:100-103, 177`, `app/api/embed/route.tsx:48-57`
- **Evidence**: Errors return arbitrary JSON schemas (`{ error, message }` vs `{ error: string }`). No RFC 9457 `application/problem+json` support.
- **Root Cause**: Missing centralized error handling contract.

### D19: Missing ETag, Server-Timing, and Precompression
- **Location**: `lib/engine/routes.ts`, `lib/engine/middleware.ts:99-155`
- **Evidence**: Repository search for `ETag` and `Server-Timing` returns 0 occurrences in route handlers. `compressMiddleware` in `middleware.ts` is never registered or invoked.
- **Root Cause**: Omission of HTTP caching and diagnostic header pipelines in Tigh v0.0.1-beta.

### D20: Single Origin Reachability Issues for Iranian Universities
- **Location**: `next.config.mjs`, `app/layout.tsx:19`
- **Evidence**: Sole deployment is `pq.arsamadineh.ir` hosted on Vercel Anycast edge. Vercel Anycast IPs frequently suffer DNS poisoning, severe throttling, or complete reachability drops inside Iranian university campus networks (.ac.ir) and NIN.
- **Root Cause**: Lack of domestic secondary origin or mirror infrastructure.

---

## 7. Performance & Resource Baseline Measurements

Measurements captured via `scripts/measure-baseline-perf.ts` against local production server (saved to `docs/evidence/phase-0/performance/baseline.json`):

### 7.1 Cold Start Latency
- **Server Launch to Health First Byte**: `5,600.61 ms` (includes Next.js server initialization and in-memory JSON parsing of 6.57 MB).
- **First Dataset Query Latency (`/api/quotes/hafez?limit=1`)**: `15.86 ms`.
- **Target Budget (Appendix D)**: Cold start <= 100 ms (current scale) / <= 250 ms (100x scale). *Requires transition to precompiled static shards or embedded SQLite.*

### 7.2 Warm Latency Distributions (500 Serial Requests per Endpoint)

| Endpoint | Avg (ms) | Min (ms) | Max (ms) | p50 (ms) | p90 (ms) | p95 (ms) | p99 (ms) |
|---|---|---|---|---|---|---|---|
| `/api/health` | 4.659 | 1.216 | 103.315 | 2.887 | 9.013 | 11.046 | 24.291 |
| `/api/stats` | 4.251 | 1.006 | 72.849 | 2.353 | 8.764 | 11.027 | 32.629 |
| `/api/quotes/hafez?limit=5` | 6.913 | 1.072 | 169.204 | 3.769 | 14.054 | 19.795 | 56.256 |
| `/api/quotes/shereno?limit=5` | 2.359 | 1.010 | 12.002 | 1.649 | 4.273 | 5.988 | 10.812 |
| `/api/quotes/search?q=عشق&limit=5` | 2.566 | 0.932 | 98.455 | 1.634 | 4.667 | 6.196 | 9.690 |
| `/api/poets` | 2.309 | 0.867 | 20.590 | 1.447 | 5.017 | 6.669 | 11.737 |

### 7.3 Memory Profile
- **Process Resident Set Size (RSS)**: `50,270,208 bytes` (~47.9 MB).
- **V8/Bun Heap Used**: `790,574 bytes` (~0.75 MB).
- **Budget Target (Appendix D)**: Memory at 100x data <= 128 MB.

### 7.4 Engine Microbenchmarks (Tigh v0.0.1-beta)
- **Router Match Operations**: `15,000` operations, `374.19 ns/op` average.
  - Appendix D Target: Static <= 150 ns, Parametric <= 400 ns.
- **Cache Eviction and Access Flaw**:
  - `cacheSetNsPerOp`: `2,926 ns`
  - `cacheGetNsPerOp`: `559,721 ns` (~560 µs).
  - Appendix D Target: Cache-hit handler CPU <= 10 µs.
  - *Observation*: The measured `560 µs` per cache lookup confirms the O(N) `Array.splice` flaw documented in D15 and explorer_0_1 report, validating the requirement to replace the cache with S3-FIFO / W-TinyLFU in Phase 3.

---

## 8. Target Architecture & Workstream Roadmaps (WS1–WS15)

The target architecture organizes the codebase into a clean Bun workspaces monorepo:

```
persian-quote-api/
├── apps/
│   ├── web/                    # Next.js 15 UI (home, docs, playground, reader, sakhtar)
│   └── api/                    # Runtime entry points & adapters (workers, bun, node, docker)
├── packages/
│   ├── core/                   # Tigh v1 zero-dependency engine (radix router, S3-FIFO, GCRA, telemetry)
│   ├── schema/                 # Canonical Zod schemas -> TS types, JSON Schema, OpenAPI components
│   ├── persian/                # Persian NLP: normalizers, tokenizer, stemmer, digits, bidi, Finglish
│   ├── poem/                   # Structure engine: colophon extraction, signals, excerpt picker, meter
│   ├── search/                 # Index builder + runtime searcher: BM25F lexical, SymSpell, hybrid fallback
│   ├── store/                  # DataSource interface, artifact reader/writer, SQLite FTS5 adapter
│   ├── sdk-ts/                 # TypeScript client library (browser, edge, node, offline)
│   ├── sdk-py/                 # Python client library (Pydantic v2 + offline SQLite)
│   ├── mcp/                    # Model Context Protocol server (Streamable HTTP + stdio)
│   └── widget/                 # <persian-quote> standalone Web Component (<= 4 KB gz)
├── pipeline/                   # Reproducible build scripts (build-data, eval-structure, eval-search)
├── data/                       # canonical, legacy, quarantine, golden
└── docs/                       # adr, audit, evidence, reports, runbooks, agent/PROGRESS.md
```

### Workstream Execution Matrix
- **WS1 (Canonical Data)**: Canonical Zod schemas, hierarchical stable IDs (`poet.collection.number`), poet registry, rights audit (`docs/audit/rights-audit.csv`), validation CLI (`bun run data:validate`).
- **WS2 (Persian Text)**: Dual normalization (`normalizeDisplay` vs `normalizeSearch`), `cleanLine`, tokenizer, light stemmer, digit normalizer, Jalali date converter, bidi isolator, Finglish query parser.
- **WS3 (Poem Structure)**: Colophon extraction, signal splitting, letter-fingerprint verification (`s.replace(/[\s\u200c*\/]+/g, '')`), LLM structure inference, heuristic fallback, boundary F1 evaluation harness (`pipeline/eval-structure.ts`).
- **WS4 (Excerpts & Poetics)**: Windowed excerpt picker (`pickExcerpt`), radif and qafiyeh rhyme engine, aruz meter annotation, attribution flagging (`verified`, `attributed`, `disputed`).
- **WS5 (Build & Artifacts)**: Reproducible `bun run build:data` generating static JSON shards, search index artifacts, SQLite FTS5 database, bulk exports (`JSONL.zst`, Parquet, CSV, TEI-P5 XML).
- **WS6 (Tigh v1 Core)**: Zero external runtime dependencies, compiled radix router, S3-FIFO / W-TinyLFU cache, GCRA rate limiter, circuit breaker, ring-buffer telemetry.
- **WS7 (API v1 & Compatibility)**: Backward compatibility for 14 legacy endpoints, modern `/v1/**` endpoints, RFC 9457 problem details, ETag caching, Server-Timing, OpenAPI 3.1.
- **WS8 (Hybrid Search)**: BM25F lexical, SymSpell typo tolerance, Finglish query translation, vector semantic search with automatic fallback, >= 150 test queries tracking nDCG@10 and MRR@10.
- **WS9 (Delivery & Ops)**: Hosting benchmark ADR, edge CDN caching verification, multi-origin mirror setup for Iranian academic networks, Docker containerization, disaster recovery drill.
- **WS10 (Widget)**: `<persian-quote>` Web Component (<= 4 KB gz, Shadow DOM, CSS custom props), hardened iframe embed, server-side share cards.
- **WS11 (Web Experience)**: Reader page (`/p/{id}`), poet profile (`/poets/{id}`), instant search UI, interactive playground, live `/sakhtar` telemetry, WCAG 2.2 AA accessibility.
- **WS12 (Academic Layer)**: `CITATION.cff`, Zenodo DOI integration, bulk dataset cards, TypeScript & Python SDKs, runnable Jupyter tutorials.
- **WS13 (AI-Native Surface)**: MCP server (`packages/mcp`), `llms.txt`, `llms-full.txt`.
- **WS14 (Quality Engineering)**: Monorepo test suites, legacy golden contract tests, Schemathesis API tests, Playwright visual regression, axe accessibility, Lighthouse CI.
- **WS15 (Governance)**: Comprehensive documentation (`README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `GOVERNANCE.md`, `ROADMAP.md`, `API-POLICY.md`).

---

## 9. Phase 0 Verification Checklist

- [x] Switched to git branch `rebuild/v1`
- [x] Legacy JSON datasets snapshotted to `data/legacy/` (`hafez.json`, `non-poetry-quotes.json`, `poetry-quotes.json`, `shereno.json`)
- [x] `data/legacy/SHA256SUMS` generated and verified with `sha256sum -c`
- [x] `data/legacy/manifest.json` generated with accurate metadata and locked read-only (`0444`)
- [x] 30 legacy contract test cases recorded to `data/golden/contracts/` and verified with `index.json`
- [x] 36 Playwright baseline visual screenshots captured across 9 pages (Desktop + Mobile, Light + Dark) to `docs/evidence/phase-0/screenshots/`
- [x] Visual gallery generated at `docs/evidence/phase-0/screenshots/gallery.md`
- [x] Performance baselines measured (cold start, warm percentiles, memory, router microbenchmark) and saved to `docs/evidence/phase-0/performance/baseline.json`
- [x] Defects D1 through D20 verified with code and empirical evidence
- [x] Phase 0 exit criteria satisfied
