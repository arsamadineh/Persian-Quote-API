# Project: Persian Quote API Complete Rebuild

## Architecture

### System Architecture & Monorepo Layout (Bun Workspaces)
The platform is transitioning from a Next.js prototype with an in-memory single-process JSON store to an academic-grade, modular monorepo powered by Bun workspaces. The hot request execution path remains strictly zero external dependencies.

```
persian-quote-api/
├── apps/
│   ├── web/                    # Next.js 15 App Router UI (home, docs, playground, reader, /sakhtar)
│   └── api/                    # Runtime entry points & adapters (workers, bun, node, docker)
├── packages/
│   ├── core/                   # Tigh v1 engine: router, cache, limiter, circuit breaker, telemetry (ZERO deps)
│   ├── schema/                 # Zod canonical schemas -> TS types, JSON Schema, OpenAPI components
│   ├── persian/                # Persian NLP: normalizer (display vs search), tokenizer, stemmer, digits, bidi, Finglish
│   ├── poem/                   # Structure engine: colophon extraction, signal splitting, excerpt picker, radif/qafiyeh, meter
│   ├── search/                 # Index builder + runtime searcher: BM25F lexical, SymSpell fuzzy, hybrid vector fallback
│   ├── store/                  # DataSource interface, artifact reader/writer, SQLite FTS5 adapter
│   ├── sdk-ts/                 # Fully typed TypeScript client SDK (offline + online)
│   ├── sdk-py/                 # Python client SDK (Pydantic v2 + offline SQLite)
│   ├── mcp/                    # Model Context Protocol server (Streamable HTTP + stdio)
│   └── widget/                 # <persian-quote> standalone Web Component (<= 4 KB gz)
├── pipeline/                   # Reproducible build & evaluation scripts (build-data, eval-structure, eval-search)
├── data/
│   ├── canonical/              # Structured, verified JSON and database artifacts
│   ├── legacy/                 # Byte-identical frozen original datasets with SHA-256 verification
│   ├── quarantine/             # Records failing rights audit or structural validation with reason codes
│   └── golden/                 # Golden contract snapshots and regression fixtures
└── docs/
    ├── adr/                    # Architecture Decision Records (e.g. 0001-storage, 0002-hosting)
    ├── audit/                  # 00-recon.md, rights-audit.csv
    ├── evidence/               # Benchmark logs, Playwright visual screenshots, curl transcripts
    ├── reports/                # Phase completion reports (phase-0.md through phase-7.md, FINAL.md)
    └── runbooks/               # Deployment, disaster recovery, and operation runbooks
```

---

## Feature Inventory

Every feature mapped from survey, `ORIGINAL_REQUEST.md`, `AGENTS.md`, Appendix A, and Appendix D is assigned to an authoritative milestone.

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| **F001** | Rule R1: Zero Incomplete Code | Prohibition of TODO, FIXME, stubs, mock data, or placeholder numbers in committed files. | All Milestones | ORIGINAL_REQUEST.md §2 (R1) |
| **F002** | Rule R2: Empirical Verification | Claims backed by command output, test results, benchmark logs, and Playwright screenshots. | All Milestones | ORIGINAL_REQUEST.md §2 (R2) |
| **F003** | Rule R3: Zero Fabricated Numbers | Measured counts, latencies, accuracy numbers, and hit rates with raw logs preserved. | All Milestones | ORIGINAL_REQUEST.md §2 (R3) |
| **F004** | Rule R4: Letter-Fingerprint Word Immutability | Poem wording never altered from memory; restructuring validated by letter fingerprint. | Milestone 2 | ORIGINAL_REQUEST.md §2 (R4) |
| **F005** | Rule R5: Zero Data Deletion & Quarantine | Byte-identical snapshot in `data/legacy/` with SHA-256; quarantine in `data/quarantine/`. | Milestone 0, 2 | ORIGINAL_REQUEST.md §2 (R5) |
| **F006** | Rule R6: Legacy Route Compatibility | 100% backward compatibility for all 14 existing `/api/**` URLs and parameter behaviors. | Milestone 0, 3 | ORIGINAL_REQUEST.md §2 (R6) |
| **F007** | Rule R7: Autonomous Architecture Decisions | Decisions recorded in Architecture Decision Records (`docs/adr/NNNN-title.md`). | All Milestones | ORIGINAL_REQUEST.md §2 (R7) |
| **F008** | Rule R8: Persistent Progress Tracking | Agent state and metrics continuously logged in `docs/agent/PROGRESS.md`. | All Milestones | ORIGINAL_REQUEST.md §2 (R8) |
| **F009** | Rule R9: Git Branch & Commit Discipline | Development on `rebuild/v1`, small atomic commits, conventional commit syntax, green CI. | Milestone 0, All | ORIGINAL_REQUEST.md §2 (R9) |
| **F010** | Rule R10: Zero-Dependency Hot Path | Runtime request execution hot path has zero external npm dependencies. | Milestone 1, 3 | ORIGINAL_REQUEST.md §2 (R10) |
| **F011** | Rule R11: Security & Privacy by Design | Zero secrets in repository; complete `.env.example`; no PII collected. | All Milestones | ORIGINAL_REQUEST.md §2 (R11) |
| **F012** | Rule R12: Rights & Provenance Tracking | Comprehensive recording of license terms, retrieval dates, source URLs, and transformations. | Milestone 2 | ORIGINAL_REQUEST.md §2 (R12) |
| **F013** | Rule R13: Persian Linguistic Correctness | Full Unicode NFC normalization, ZWNJ preservation, Persian/Arabic/Latin digits, bidi marks. | Milestone 1 | ORIGINAL_REQUEST.md §2 (R13) |
| **F014** | Rule R14: Performance Budget Enforcement | CI regression gating enforcing Appendix D latency, memory, and bundle size budgets. | Milestone 3, 5 | ORIGINAL_REQUEST.md §2 (R14) |
| **F015** | Rule R15: Courageous Refactoring | Mandate to replace legacy engine, schemas, and layouts upon empirical demonstration. | All Milestones | ORIGINAL_REQUEST.md §2 (R15) |
| **F016** | Rule R16: End-of-Phase Reporting | Delivery of comprehensive audit, benchmark, and progress reports (`docs/reports/phase-N.md`). | All Milestones | ORIGINAL_REQUEST.md §2 (R16) |
| **F017** | Rule R17: Strict TypeScript Hygiene | TypeScript strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, no `any`, ESM only. | All Milestones | ORIGINAL_REQUEST.md §2 (R17) |
| **F018** | Rule R18: Visual Regression Safety Net | Capture baseline Playwright screenshots in Phase 0; assert zero UI regressions across viewports. | Milestone 0, 6 | ORIGINAL_REQUEST.md §2 (R18) |
| **F019** | Rule R19: Tool Verification | Automated verification via dev server execution, live site fetching, and browser testing. | All Milestones | ORIGINAL_REQUEST.md §2 (R19) |
| **F020** | Rule R20: Time-Boxed Escalation | Pivot with ADR documentation if an engineering solution fails twice. | All Milestones | ORIGINAL_REQUEST.md §2 (R20) |
| **F021** | Rule R21: Adversarial Self-Review | Hostile reviewer self-audit before closing any phase gate. | All Milestones | ORIGINAL_REQUEST.md §2 (R21) |
| **F022** | Rule R22: Multi-Language Separation | English for code, comments, commits; fluent Persian for UI and public docs. | All Milestones | ORIGINAL_REQUEST.md §2 (R22) |
| **F023** | AGENTS Rule 1: Persian Changelog | Mandatory update of `lib/changelog.ts` on every commit in Persian with semver, dates, typed changes, no emojis. | All Milestones | AGENTS.md §1 |
| **F024** | AGENTS Rule 2: Fluent RTL Persian UI | Natural, fluent Persian UI with RTL layout; English restricted to URLs and technical terms. | Milestone 6 | AGENTS.md §2 |
| **F025** | AGENTS Rule 3: Single Root Footer | Single footer instantiated in `app/layout.tsx` via `components/footer.tsx`; no page duplication. | Milestone 0, 6 | AGENTS.md §3 |
| **F026** | AGENTS Rule 4: Favicon-Only Logo | Logo (`app/icon.svg`) reserved exclusively for favicon use; text title across UI. | Milestone 6 | AGENTS.md §4 |
| **F027** | AGENTS Rule 5: Absolute Emoji Ban | Total prohibition of emojis in production code, UI, commit messages, docs, and changelogs. | All Milestones | AGENTS.md §5 |
| **F028** | AGENTS Rule 6: AI Text Marker Stripping | Removal of AI textual artifacts ("قطعاً", "البته", rhetorical triplets, intro filler) prior to commit. | All Milestones | AGENTS.md §6 |
| **F029** | AGENTS Rule 7: Tool Brand Prohibition | Exclusion of AI tool brand names across codebase, commits, README, and changelogs. | All Milestones | AGENTS.md §7 |
| **F030** | Phase 0: Recon & Safety Net | Full audit, baseline benchmark logging, legacy snapshot in `data/legacy/` with SHA-256, golden contracts, Playwright baselines, `docs/audit/00-recon.md`. | Milestone 0 | ORIGINAL_REQUEST.md §6 |
| **F031** | Phase 1: Foundations | Bun monorepo workspace configuration, `packages/schema` Zod definitions, `packages/persian` with >= 90% branch coverage & property tests. | Milestone 1 | ORIGINAL_REQUEST.md §6 |
| **F032** | Phase 2: Data Pipeline & Processing | WS1 data migration, WS3 poem structure engine, WS4 excerpt/radif/qafiyeh, rights audit (`docs/audit/rights-audit.csv`), fixtures A1, A2, A3 pass. | Milestone 2 | ORIGINAL_REQUEST.md §6 |
| **F033** | Phase 3: Engine, Artifacts & API v1 | WS5 build pipeline, WS6 Tigh v1 zero-dependency core, WS7 API v1 and legacy compatibility layer, OpenAPI 3.1, adapter conformance. | Milestone 3 | ORIGINAL_REQUEST.md §6 |
| **F034** | Phase 4: Search Engine | WS8 hybrid search, rhyme finder, evaluation harness with >= 150 benchmark queries, committed nDCG@10 & MRR@10 baselines, chaos test pass. | Milestone 4 | ORIGINAL_REQUEST.md §6 |
| **F035** | Phase 5: Delivery & Operations | WS9 hosting benchmark ADR, CDN caching verification, multi-origin mirror deployment, Docker containerization, load test (>= 5,000 req/s). | Milestone 5 | ORIGINAL_REQUEST.md §6 |
| **F036** | Phase 6: Experience & Ecosystem | WS10 `<persian-quote>` Web Component, WS11 Web app, WS12 TypeScript and Python SDKs with Jupyter notebooks, WS13 MCP server. | Milestone 6 | ORIGINAL_REQUEST.md §6 |
| **F037** | Phase 7: Governance & Final Audit | WS14/WS15 governance docs, Appendix C self-audit checklist, hostile reviewer adversarial review, `docs/reports/FINAL.md`. | Milestone 7 | ORIGINAL_REQUEST.md §6 |
| **F038** | WS1: Canonical Zod Schemas | Strongly typed schemas (`packages/schema`) for poems, poets, collections, attributions, stanzas, and colophons. | Milestone 1 | ORIGINAL_REQUEST.md §4, §5 |
| **F039** | WS1: Hierarchical Stable IDs | Deterministic, immutable record identifiers formatted as `poet-slug.collection-slug.number`. | Milestone 2 | ORIGINAL_REQUEST.md §5 (WS1) |
| **F040** | WS1: Canonical Poet Registry | Centralized registry containing standardized biographical data, birth/death dates (Jalali + Gregorian), bios, and transliteration aliases. | Milestone 2 | ORIGINAL_REQUEST.md §5 (WS1) |
| **F041** | WS1: Rights Audit & Catalog | Comprehensive copyright and public domain audit across all modern and classical poets in `docs/audit/rights-audit.csv`. | Milestone 2 | ORIGINAL_REQUEST.md §5 (WS1) |
| **F042** | WS1: Migration Pipeline | Deterministic migration scripts converting legacy JSON files into canonical structured records. | Milestone 2 | ORIGINAL_REQUEST.md §5 (WS1) |
| **F043** | WS1: Data Validation CLI | Validation script `bun run data:validate` verifying schema compliance, structural integrity, and no malformed lines. | Milestone 2 | ORIGINAL_REQUEST.md §5 (WS1) |
| **F044** | WS1: Legacy Snapshot & Checksums | Byte-identical snapshot of original source JSON preserved under `data/legacy/` with SHA-256 verification hashes. | Milestone 0 | ORIGINAL_REQUEST.md §2 (R5) |
| **F045** | WS1: Quarantine Pipeline | Automated routing of unverifiable, corrupt, or uncredited records to `data/quarantine/` with structured reason codes. | Milestone 2 | ORIGINAL_REQUEST.md §2 (R5) |
| **F046** | WS2: Dual Persian Normalizer | `normalizeDisplay` preserving typography and diacritics, and `normalizeSearch` folding diacritics, yeh/kaf/alef, and ZWNJ. | Milestone 1 | ORIGINAL_REQUEST.md §5 (WS2) |
| **F047** | WS2: Line Cleaner (`cleanLine`) | Strips LTR/RTL marks, collapses whitespace, eliminates spaces before punctuation (`، ؛ ؟ ! . : ) »`), single trailing space. | Milestone 1 | ORIGINAL_REQUEST.md §5 (WS2) |
| **F048** | WS2: Persian Tokenizer (`tokenize`) | Persian-aware word segmentation handling ZWNJ compound words and morphological boundaries. | Milestone 1 | ORIGINAL_REQUEST.md §5 (WS2) |
| **F049** | WS2: Persian Light Stemmer (`lightStem`) | Rule-based stemmer removing common verbal and nominal affixes (`می-`, `نمی-`, `-ها`, `-تر`, `-ترین`). | Milestone 1 | ORIGINAL_REQUEST.md §5 (WS2) |
| **F050** | WS2: Bidirectional Digit Normalizer | Bidirectional conversion between Persian (`۰-۹`), Arabic (`٠-٩`), and ASCII (`0-9`) numerals. | Milestone 1 | ORIGINAL_REQUEST.md §5 (WS2) |
| **F051** | WS2: Jalali Calendar Converter | Accurate bidirectional date conversion between Solar Hijri (Jalali) and Gregorian calendars. | Milestone 1 | ORIGINAL_REQUEST.md §5 (WS2) |
| **F052** | WS2: Bidi Text Isolator | Bi-directional embedding and isolation utility ensuring mixed Persian-English displays correctly. | Milestone 1 | ORIGINAL_REQUEST.md §5 (WS2) |
| **F053** | WS2: Finglish Query Parser (`finglishQuery`) | Phonetic transliteration parser mapping Latin-script Persian queries to standard Persian orthography. | Milestone 1 | ORIGINAL_REQUEST.md §5 (WS2) |
| **F054** | WS2: Fuzzy Match Utilities | Optimized Levenshtein and Damerau-Levenshtein calculation routines tailored for Persian strings. | Milestone 1 | ORIGINAL_REQUEST.md §5 (WS2) |
| **F055** | WS2: Property-Based NLP Testing | Fast-check property-based tests verifying idempotency, reversibility, and safety with >= 90% branch coverage. | Milestone 1 | ORIGINAL_REQUEST.md §5 (WS2) |
| **F056** | WS3: Colophon Extraction Engine | RegEx and linguistic parser identifying place names and Jalali/Gregorian dates, stripping them from stanzas. | Milestone 2 | ORIGINAL_REQUEST.md §5 (WS3) |
| **F057** | WS3: Structural Signal Splitting | Parser segmenting unstructured poem text using asterisks (`*`), blank lines, multi-spaces, and slashes (` / `). | Milestone 2 | ORIGINAL_REQUEST.md §5 (WS3) |
| **F058** | WS3: Letter-Fingerprint Validation | Verification function `s.replace(/[\s\u200c*\/]+/g, '')` guaranteeing no letter modifications during restructuring. | Milestone 2 | ORIGINAL_REQUEST.md §2 (R4) |
| **F059** | WS3: LLM Structure Inference | LLM-assisted line and stanza segmentation for unstructured verse, gated by 100% letter-fingerprint verification. | Milestone 2 | ORIGINAL_REQUEST.md §5 (WS3) |
| **F060** | WS3: Heuristic Structure Fallback | Algorithmic line breaker targeting median 2–12 words/line (max 22 words) when no explicit signals exist. | Milestone 2 | ORIGINAL_REQUEST.md §5 (WS3) |
| **F061** | WS3: Dual Rendering Contract | Canonical dual representation: structured stanzas/beyts (classical poems having exactly two hemistichs) + clean `text_plain`. | Milestone 2 | ORIGINAL_REQUEST.md §5 (WS3) |
| **F062** | WS3: Boundary F1 Evaluation Harness | Evaluation script `pipeline/eval-structure.ts` benchmarking boundary precision, recall, and F1 score against golden truth. | Milestone 2 | ORIGINAL_REQUEST.md §5 (WS3) |
| **F063** | WS4: Windowed Excerpt Picker (`pickExcerpt`) | Intelligent excerpt selector evaluating sentence boundaries, soft endings, block boundaries, avoiding bad start/end words. | Milestone 2 | ORIGINAL_REQUEST.md §5 (WS4) |
| **F064** | WS4: Radif & Qafiyeh Detection Engine | Phonetic and morphological rhyme engine extracting the rhyme word (qafiyeh) and refrain (radif). | Milestone 2 | ORIGINAL_REQUEST.md §5 (WS4) |
| **F065** | WS4: Aruz Meter Annotation | Poetic meter identification classifying classical works by their traditional prosodic foot and meter name. | Milestone 2 | ORIGINAL_REQUEST.md §5 (WS4) |
| **F066** | WS4: Attribution & Authenticity Flagging | Tri-state attribution classification: verified, attributed, or disputed/apocryphal (`مشکوک` / `منسوب`). | Milestone 2 | ORIGINAL_REQUEST.md §5 (WS4) |
| **F067** | WS4: Literary Taxonomy Review | Hierarchical tagging system categorizing poetry by poetic form, era, movement, thematic tags, and mood. | Milestone 2 | ORIGINAL_REQUEST.md §5 (WS4) |
| **F068** | WS5: Reproducible Data Build | Command `bun run build:data` executing ingestion, structural enrichment, indexing, and artifact generation in one run. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS5) |
| **F069** | WS5: Runtime Store JSON Shards | Precomputed partitioned static JSON chunks optimized for sub-millisecond memory loading. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS5) |
| **F070** | WS5: Prebuilt Search Index Artifact | Serialized BM25F lexical index and SymSpell vocabulary dictionary bundled as static assets. | Milestone 3, 4 | ORIGINAL_REQUEST.md §5 (WS5) |
| **F071** | WS5: Embedded SQLite FTS5 Database | SQLite database artifact with full-text search (FTS5) table containing the entire corpus for local querying. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS5) |
| **F072** | WS5: Bulk Export — Zstandard JSONL | Complete corpus exported as line-delimited JSON compressed with Zstandard (`JSONL.zst`). | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS5) |
| **F073** | WS5: Bulk Export — Apache Parquet | Columnar Apache Parquet dataset (`.parquet`) for big data analytics, Spark, DuckDB, and Python data pipelines. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS5) |
| **F074** | WS5: Bulk Export — CSV | Clean tabular CSV export (`.csv`) for spreadsheets and quick relational import. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS5) |
| **F075** | WS5: Bulk Export — TEI-P5 XML | Scholarly XML export conforming to Text Encoding Initiative (TEI-P5) guidelines for digital humanities research. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS5) |
| **F076** | WS5: Golden Regression Datasets | Curated test fixtures (`data/golden/`) locking expected structural and linguistic outputs. | Milestone 0, 2, 3 | ORIGINAL_REQUEST.md §4, §5 |
| **F077** | WS6: Tigh v1 Zero-Dependency Core | Request execution engine (`packages/core`) operating strictly with zero runtime npm dependencies using Web Standard APIs. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS6) |
| **F078** | WS6: Compiled Radix Tree Router | High-performance radix tree router achieving static route matching in <= 150 ns and parametric matching in <= 400 ns. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS6) |
| **F079** | WS6: S3-FIFO / W-TinyLFU Memory Cache | High-concurrency in-memory cache implementing advanced eviction algorithms, TTL, and byte-size caps (hit time <= 10 µs). | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS6) |
| **F080** | WS6: Request Stampede Coalescing | Single-flight request deduplication ensuring only one backend fetch occurs per cache key under high concurrency. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS6) |
| **F081** | WS6: GCRA Rate Limiter | Generic Cell Rate Algorithm rate limiting with smooth token consumption per IP and client API key. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS6) |
| **F082** | WS6: Circuit Breaker | Adaptive three-state circuit breaker (Closed, Open, Half-Open) protecting search backends and external services. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS6) |
| **F083** | WS6: Bounded In-Memory Telemetry | Ring-buffer telemetry tracking latency percentiles (p50, p90, p95, p99) and request counters without memory growth. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS6) |
| **F084** | WS6: Adapter Conformance Suite | Cross-runtime test suite validating identical engine execution on Node.js, Bun, Cloudflare Workers, and Vercel. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS6) |
| **F085** | WS7: Legacy Compatibility Parity | Full backwards compatibility for all 14 legacy endpoints, query params, and response shapes. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F086** | WS7: Modern Endpoint `GET /v1/works` | Paginated listing of poems with filters for poet, collection, poetic form, meter, tags, and text search. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F087** | WS7: Modern Endpoint `GET /v1/works/{id}` | Detailed retrieval of a poem by canonical stable ID, including stanzas, colophon, meter, rights (CPU <= 50 µs). | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F088** | WS7: Modern Endpoint `GET /v1/works/random` | Random selection of works or excerpts filtered by poet, form, and length constraints. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F089** | WS7: Modern Endpoint `GET /v1/daily` | Deterministic daily poem selection synchronized strictly to Tehran midnight (`Asia/Tehran`). | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F090** | WS7: Modern Endpoint `GET /v1/fal` | Divan-e Hafez divination endpoint accepting an optional user niyyat, returning ghazal, interpretation, and shahed beyt. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F091** | WS7: Modern Endpoint `GET /v1/poets` | Complete catalog of poets with biographies, historical eras, counts, and canonical slugs. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F092** | WS7: Modern Endpoint `GET /v1/poets/{id}` | Single poet profile, detailed biographical information, list of collections, and corpus statistics. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F093** | WS7: Modern Endpoint `GET /v1/collections` | List of poetic collections, divans, books, and anthologies in the platform. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F094** | WS7: Modern Endpoint `GET /v1/collections/{id}` | Detailed collection metadata, compilation dates, poet reference, and contained works. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F095** | WS7: Modern Endpoint `GET /v1/suggest` | Ultra-fast prefix autocomplete/typeahead for poets, titles, and first lines (server time <= 10 ms). | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F096** | WS7: Modern Endpoint `GET /v1/rhymes` | Rhyme search endpoint returning words and verses matching requested rhyme (qafiyeh) and meter patterns. | Milestone 3, 4 | ORIGINAL_REQUEST.md §5 (WS7, WS8) |
| **F097** | WS7: Modern Endpoint `GET /v1/meta` | Platform metadata, corpus counts, version details, and downloadable links for bulk exports. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F098** | WS7: Modern Endpoint `GET /v1/health` | Comprehensive liveness and readiness probe reporting uptime, memory usage, and cache efficiency. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F099** | WS7: RFC 9457 Problem Details | Standardized error payload formatting using `application/problem+json` across all `/v1/**` endpoints. | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F100** | WS7: Content-Addressed ETag & Caching | Deterministic SHA-256 ETag generation and edge `Cache-Control` header tuning for aggressive CDN caching. | Milestone 3 | ORIGINAL_REQUEST.md §3 (D19), §5 |
| **F101** | WS7: Server-Timing Headers | Detailed diagnostic headers emitting millisecond execution durations for routing, cache lookup, and search compute. | Milestone 3 | ORIGINAL_REQUEST.md §3 (D19), §5 |
| **F102** | WS7: Dynamic Precompression | Transparent response compression supporting Brotli (`br`), Gzip (`gzip`), and Zstandard (`zstd`). | Milestone 3 | ORIGINAL_REQUEST.md §3 (D19), §5 |
| **F103** | WS7: OpenAPI 3.1 Specification | Formally generated and synchronized OpenAPI 3.1 documentation (`openapi.yaml` / `openapi.json`). | Milestone 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F104** | WS8: BM25F Lexical Search | Field-weighted BM25F ranking scoring poet (weight 15), title (weight 8), first hemistich (weight 5), and body text (weight 1). | Milestone 4 | ORIGINAL_REQUEST.md §5 (WS8) |
| **F105** | WS8: SymSpell Typo-Tolerant Search | High-speed symmetric delete spelling correction handling spelling variants, missing ZWNJ, and typos. | Milestone 4 | ORIGINAL_REQUEST.md §5 (WS8) |
| **F106** | WS8: Finglish Query Translation | Automatic phonetic conversion of romanized Persian search inputs to Persian search terms. | Milestone 4 | ORIGINAL_REQUEST.md §5 (WS8) |
| **F107** | WS8: Semantic Vector Search | Dense vector semantic search utilizing open Persian embeddings (LaBSE, ParsBERT, or ONNX runtime). | Milestone 4 | ORIGINAL_REQUEST.md §5 (WS8) |
| **F108** | WS8: Hybrid RRF Search Ranking | Hybrid search combining BM25F and vector semantic similarity via Reciprocal Rank Fusion (p95 <= 250 ms). | Milestone 4 | ORIGINAL_REQUEST.md §5 (WS8) |
| **F109** | WS8: Search Graceful Degradation | Automatic circuit-breaker fallback to pure lexical search if semantic search times out or fails (fallback <= 25 ms). | Milestone 4 | ORIGINAL_REQUEST.md §5 (WS8) |
| **F110** | WS8: Search Benchmark & Evaluation Suite | Ground-truth test collection of >= 150 Persian literature queries tracking nDCG@10 and MRR@10 baselines in CI. | Milestone 4 | ORIGINAL_REQUEST.md §5 (WS8) |
| **F111** | WS9: Hosting Benchmark ADR | Measured multi-platform benchmark comparing Cloudflare Workers, Vercel Serverless, and VPS on cold start, latency, cost. | Milestone 5 | ORIGINAL_REQUEST.md §5 (WS9) |
| **F112** | WS9: Edge CDN Caching Verification | Verifiable curl transcripts demonstrating edge cache hits (`CF-Cache-Status: HIT` or `x-vercel-cache: HIT`) with TTFB <= 50 ms. | Milestone 5 | ORIGINAL_REQUEST.md §5 (WS9) |
| **F113** | WS9: Multi-Origin Mirror Infrastructure | Redundant secondary origin and mirror setup ensuring continuous availability for Iranian universities. | Milestone 5 | ORIGINAL_REQUEST.md §3 (D20), §5 |
| **F114** | WS9: Docker Containerization | Minimal, reproducible multi-stage Dockerfile packaging standalone Bun/Node runtime for single-command self-hosting. | Milestone 5 | ORIGINAL_REQUEST.md §5 (WS9) |
| **F115** | WS9: Automated Disaster Recovery Drill | Documented runbook and test script restoring entire platform and search indices from immutable artifacts. | Milestone 5 | ORIGINAL_REQUEST.md §5 (WS9) |
| **F116** | WS9: Operational Cost Model | Formal financial breakdown proving near-zero operating costs under sustained 10M+ requests/month traffic. | Milestone 5 | ORIGINAL_REQUEST.md §5 (WS9) |
| **F117** | WS10: Web Component `<persian-quote>` | Framework-agnostic custom HTML element encapsulated with Shadow DOM, weighing <= 4 KB gzipped. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS10) |
| **F118** | WS10: CSS Custom Property Theming | Dynamic theme configuration using CSS custom properties (`--pq-*`) supporting light, dark, and custom palettes. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS10) |
| **F119** | WS10: Hardened Iframe Embed (`/api/embed`) | Responsive iframe embed with dynamic parent resizing (`ResizeObserver`), strict CSP, and security sandboxing. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS10) |
| **F120** | WS10: Server-Side Share Cards (OG Images) | Automated social preview card generation rendering beautiful Persian typography for any poem ID. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS10) |
| **F121** | WS11: Poem Reader Page (`/p/{id}`) | Dedicated reader view with clean vertical stanza layout, meter badges, attribution, copy button, audio, and citation export. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS11) |
| **F122** | WS11: Poet Profile Page (`/poets/{id}`) | Dedicated biographical page for each poet displaying chronological timeline, collections, and top excerpts. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS11) |
| **F123** | WS11: Instant Search UI | Client-side debounced search interface with instant results, keyword highlighting, and filter chips. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS11) |
| **F124** | WS11: Interactive API Playground | Web console allowing developers to test endpoints interactively, inspect headers, and copy runnable code snippets. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS11) |
| **F125** | WS11: Live Architecture Dashboard (`/sakhtar`) | Public observability page visualizing real-time engine telemetry, cache hit ratios, p95 latencies, and dataset counts. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS11) |
| **F126** | WS11: Interactive Widget Builder | Visual GUI enabling users to configure, preview, and generate embed codes for `<persian-quote>` or iframes. | Milestone 6 | ORIGINAL_REQUEST.md §4, §5 |
| **F127** | WS11: WCAG 2.2 AA Accessibility | Comprehensive accessibility compliance including ARIA landmarks, keyboard navigation, and high contrast. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS11) |
| **F128** | WS11: Optimized Vazirmatn Font Packaging | Subsetted Persian web fonts ensuring total initial client JavaScript bundle remains <= 100 KB gzipped. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS11) |
| **F129** | WS12: Citation Metadata Standard (`CITATION.cff`) | Standardized `CITATION.cff` file enabling researchers to cite the corpus directly in academic papers and BibTeX. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS12) |
| **F130** | WS12: Zenodo DOI Integration | Automated workflow minting persistent Digital Object Identifiers (DOI) on Zenodo for versioned corpus releases. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS12) |
| **F131** | WS12: Bulk Dataset Documentation Cards | Detailed data provenance cards documenting text acquisition methodology, normalization steps, and copyright status. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS12) |
| **F132** | WS12: TypeScript SDK (`packages/sdk-ts`) | Fully typed TypeScript client library supporting browser, Node.js, and edge environments, with offline querying. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS12) |
| **F133** | WS12: Python SDK (`packages/sdk-py`) | Python library (`pip install persian-quote`) with Pydantic v2 schemas, sync/async HTTPX clients, and offline database. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS12) |
| **F134** | WS12: Digital Humanities Jupyter Notebooks | Interactive, runnable Jupyter tutorials covering meter extraction, stylometric comparison, and corpus analysis. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS12) |
| **F135** | WS13: Model Context Protocol (MCP) Server | MCP server (`packages/mcp`) running over Streamable HTTP and stdio transports for Claude Desktop, Gemini, Antigravity. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS13) |
| **F136** | WS13: MCP Tool `get_poem` | MCP tool retrieving a complete poem or excerpt by canonical ID. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS13) |
| **F137** | WS13: MCP Tool `search_poems` | MCP tool executing hybrid search across Persian literature with filters. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS13) |
| **F138** | WS13: MCP Tool `get_daily_poem` | MCP tool fetching today's Tehran midnight featured poem. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS13) |
| **F139** | WS13: MCP Tool `get_hafez_fal` | MCP tool performing Hafez divination for user inquiries. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS13) |
| **F140** | WS13: MCP Tool `find_rhymes` | MCP tool finding rhyming words and verses based on meter and qafiyeh. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS13) |
| **F141** | WS13: MCP Tool `get_poet_info` | MCP tool retrieving historical biographies and bibliography for poets. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS13) |
| **F142** | WS13: Machine-Readable LLM Index (`llms.txt`) | Compact API overview and schema index optimized for LLM context windows. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS13) |
| **F143** | WS13: Full LLM Context (`llms-full.txt`) | Exhaustive documentation, complete OpenAPI specifications, and prompt guidance for AI agents. | Milestone 6 | ORIGINAL_REQUEST.md §5 (WS13) |
| **F144** | WS14: Comprehensive Unit & Fuzz Testing | High-coverage test suite across all monorepo packages, including router fuzzing and property tests. | Milestone 7 | ORIGINAL_REQUEST.md §5 (WS14) |
| **F145** | WS14: Legacy Contract Golden Tests | Automated regression suite verifying exact byte-level response parity for all 14 legacy `/api/**` endpoints. | Milestone 0, 7 | ORIGINAL_REQUEST.md §5 (WS14) |
| **F146** | WS14: Schemathesis Property-Based API Testing | Automated negative and boundary testing of all `/v1/**` endpoints against the OpenAPI 3.1 schema. | Milestone 7 | ORIGINAL_REQUEST.md §5 (WS14) |
| **F147** | WS14: Playwright E2E & Visual Regression | Multi-browser end-to-end user flow testing and visual regression screenshot comparisons. | Milestone 0, 7 | ORIGINAL_REQUEST.md §5 (WS14) |
| **F148** | WS14: Automated Accessibility Auditing | Axe-core accessibility checks integrated into continuous integration pipelines. | Milestone 7 | ORIGINAL_REQUEST.md §5 (WS14) |
| **F149** | WS14: Lighthouse CI Performance Auditing | CI performance budget auditing ensuring performance score >= 95 and LCP / CLS thresholds pass. | Milestone 7 | ORIGINAL_REQUEST.md §5 (WS14) |
| **F150** | WS14: Modernized Contribution Workflow | Pre-commit git hooks, validation CLI, and automated GitHub PR checks for incoming poetry contributions. | Milestone 7 | ORIGINAL_REQUEST.md §5 (WS14) |
| **F151** | WS15: Governance & Policy Documentation | Comprehensive project documentation: `README.md` (EN/FA), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `GOVERNANCE.md`, `ROADMAP.md`, `API-POLICY.md`. | Milestone 7 | ORIGINAL_REQUEST.md §5 (WS15) |
| **F152** | Acceptance Fixture A1: Salman Harati | Extract colophon `{ place: "تنکابن", date_jalali: {y:1364,m:2,d:12}, date_gregorian: "1985-05-02" }`; clean body; line-per-block rendering; excerpt word limit 25 with `cutEnd` ellipsis. | Milestone 2 | ORIGINAL_REQUEST.md App A (A1) |
| **F153** | Acceptance Fixture A2: Nader Naderpour | Punctuation normalization (no space before `،`; single space after `،`); structure strategy recorded; excerpts end on clean sentence boundaries. | Milestone 2 | ORIGINAL_REQUEST.md App A (A2) |
| **F154** | Acceptance Fixture A3: Corpus-Wide Integrity | Scan asserting zero lines with leading/trailing whitespace, zero lines of only punctuation/digits, zero spaces before `، ؛ ؟`, no U+0640 tatweel, no raw ` / `, and exactly 2 hemistichs per classical beyt. | Milestone 2 | ORIGINAL_REQUEST.md App A (A3) |
| **F155** | Performance Budget B1: Static Router Match | Static route matching compute time <= 150 ns. | Milestone 3 | ORIGINAL_REQUEST.md App D |
| **F156** | Performance Budget B2: Parametric Router Match | Parameter route matching compute time <= 400 ns. | Milestone 3 | ORIGINAL_REQUEST.md App D |
| **F157** | Performance Budget B3: Cache-Hit Handler CPU | CPU execution time for cached responses <= 10 µs. | Milestone 3 | ORIGINAL_REQUEST.md App D |
| **F158** | Performance Budget B4: Warm Work Retrieval CPU | CPU execution time for warm `GET /v1/works/{id}` <= 50 µs. | Milestone 3 | ORIGINAL_REQUEST.md App D |
| **F159** | Performance Budget B5: Cold Start First Byte | Cold start to first byte <= 100 ms (current dataset) / <= 250 ms (100x dataset). | Milestone 3 | ORIGINAL_REQUEST.md App D |
| **F160** | Performance Budget B6: Lexical Search Latency | Lexical search p95 compute <= 25 ms (100k records) / <= 80 ms (1M records). | Milestone 4 | ORIGINAL_REQUEST.md App D |
| **F161** | Performance Budget B7: Hybrid Search Latency | Hybrid search p95 compute <= 250 ms with automatic fallback to lexical search. | Milestone 4 | ORIGINAL_REQUEST.md App D |
| **F162** | Performance Budget B8: Typeahead Suggest Latency | Autocomplete `/v1/suggest` server compute time <= 10 ms. | Milestone 3 | ORIGINAL_REQUEST.md App D |
| **F163** | Performance Budget B9: Edge CDN Cached TTFB | Time to first byte for cached requests <= 50 ms p95 globally. | Milestone 5 | ORIGINAL_REQUEST.md App D |
| **F164** | Performance Budget B10: Origin Uncached TTFB | Origin execution time for uncached requests <= 150 ms p99. | Milestone 5 | ORIGINAL_REQUEST.md App D |
| **F165** | Performance Budget B11: Memory Footprint | Total resident memory footprint at 100x dataset scale (~1M poems) <= 128 MB. | Milestone 3, 5 | ORIGINAL_REQUEST.md App D |
| **F166** | Performance Budget B12: Web Application JS Bundle | Initial gzipped JavaScript bundle size for web application <= 100 KB. | Milestone 6 | ORIGINAL_REQUEST.md App D |
| **F167** | Performance Budget B13: Web Component Bundle | Gzipped bundle size for `<persian-quote>` widget core <= 4 KB. | Milestone 6 | ORIGINAL_REQUEST.md App D |
| **F168** | Performance Budget B14: High-Concurrency Throughput | Sustained cached read throughput >= 5,000 requests/second under load testing. | Milestone 5 | ORIGINAL_REQUEST.md App D |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| **M0** | Phase 0: Recon & Safety Net | Git branch `rebuild/v1`, byte-identical snapshot to `data/legacy/` with SHA-256, 30 legacy golden contract snapshots to `data/golden/contracts/`, Playwright visual baselines (36 screenshots across 9 pages), baseline latency & memory measurements, formal `docs/audit/00-recon.md`, CORS preflight fix, acceptance fixtures verified. | none | **DONE** |
| **M1** | Phase 1: Foundations | Monorepo layout with Bun workspaces, `packages/schema` (Zod schemas -> TS types, JSON Schema, OpenAPI), `packages/persian` (normalizer, tokenizer, stemmer, digits, bidi, Finglish) with >=90% branch coverage & property tests, `docs/reports/phase-1.md`. | M0 | **IN_PROGRESS** |
| **M2** | Phase 2: Canonical Data & Structure Engine | WS1 canonical data migration & stable IDs, WS3 structure engine (colophon, signals, letter fingerprint, F1 eval harness), WS4 excerpt picker & rhyme/meter detection, rights audit (`docs/audit/rights-audit.csv`), acceptance fixtures A1, A2, A3 pass, `docs/reports/phase-2.md`. | M1 | **PLANNED** |
| **M3** | Phase 3: Engine, Artifacts & API v1 | WS5 storage benchmark ADR & build pipeline (`JSONL.zst`, Parquet, SQLite FTS5, TEI-P5 XML), WS6 Tigh v1 zero-dependency core (radix router, S3-FIFO cache, GCRA limiter, circuit breaker, telemetry), WS7 modern API v1 + legacy compatibility layer + RFC 9457 + OpenAPI 3.1, adapter conformance suite, `docs/reports/phase-3.md`. | M2 | **PLANNED** |
| **M4** | Phase 4: Hybrid Search Engine | WS8 hybrid search (BM25F, SymSpell fuzzy, Finglish, vector semantic fallback), rhyme finder `/v1/rhymes`, evaluation harness (>= 150 queries, nDCG@10, MRR@10), chaos degradation test, `docs/reports/phase-4.md`. | M3 | **PLANNED** |
| **M5** | Phase 5: Delivery & Operations | WS9 hosting benchmark ADR (Cloudflare vs Vercel vs VPS), CDN caching verification (curl transcripts), multi-origin mirror deployment, Docker containerization, disaster recovery drill, load test (>= 5,000 req/s), `docs/reports/phase-5.md`. | M4 | **PLANNED** |
| **M6** | Phase 6: Experience & Ecosystem | WS10 `<persian-quote>` Web Component (<= 4 KB gz, Shadow DOM, CSS vars), WS11 Web app (reader `/p/{id}`, poet `/poets/{id}`, search UI, playground, `/sakhtar`, WCAG 2.2 AA), WS12 SDKs (TypeScript, Python) & Jupyter notebooks, WS13 MCP server (Streamable HTTP + stdio, `llms.txt`), `docs/reports/phase-6.md`. | M5 | **PLANNED** |
| **M7** | Phase 7: Governance & Final Audit | WS14/WS15 governance docs (`README.md`, `CONTRIBUTING.md`, `SECURITY.md`, etc.), Appendix C self-audit checklist verification, hostile reviewer adversarial review, `docs/reports/FINAL.md`. | M6, E2E | **PLANNED** |
| **E2E** | E2E Testing Track (Parallel) | Independent requirement-driven opaque-box testing suite (`TEST_INFRA.md`). Four test tiers (Tier 1: Feature coverage >=5/feature, Tier 2: Boundary & corner cases >=5/feature, Tier 3: Pairwise combinations, Tier 4: Real-world scenarios). Publishes `TEST_READY.md`. Required for project completion. | M0 | **IN_PROGRESS** |

---

## Code Layout

- Source code boundaries strictly adhere to the Monorepo layout.
- Hot request paths (`packages/core`) must have zero external npm dependencies.
- Build and verification tooling uses Bun v1.4.3.
- Test suites:
  - Unit & property tests: `packages/*/test/**` and `tests/**`
  - End-to-end testing: `tests/e2e/**`
  - Visual regression screenshots: `docs/evidence/phase-0/screenshots/`
  - Performance evidence: `docs/evidence/*/performance/`

---

## Interface Contracts

### 1. `packages/schema` ↔ `packages/store` & `packages/poem`
- `PoemRecord`: Canonical poem schema with stable ID (`poet-slug.collection-slug.number`), poet metadata, structured stanzas (`string[][]`), colophon (`{ place?: string; date_jalali?: { y: number; m: number; d: number }; date_gregorian?: string }`), meter, radif, qafiyeh, rights status (`public_domain`, `copyright_verified`, `quarantined`), and attribution (`verified`, `attributed`, `disputed`).
- `PoetRecord`: Canonical poet schema with slug, name (Persian + English), era, birth/death dates (Jalali + Gregorian), bio, and collections list.

### 2. `packages/core` (Tigh v1) ↔ `apps/api`
- Signature: `fetch(request: Request): Promise<Response>` (Web Standard).
- Zero external runtime imports.
- Sub-millisecond router and cache execution.
- RFC 9457 error responses with `Content-Type: application/problem+json`.
