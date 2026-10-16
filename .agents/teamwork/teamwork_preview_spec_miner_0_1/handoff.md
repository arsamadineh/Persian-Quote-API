# Handoff Report: Specification Mining & Feature Inventory

**Subagent ID**: `teamwork_preview_spec_miner_0_1`  
**Working Directory**: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_spec_miner_0_1/`  
**Target Recipient**: Orchestrator (`36a26c83-596a-4fe8-89a5-2517d3502ad1`)  
**Mission**: Mine all requirements from `ORIGINAL_REQUEST.md`, `AGENTS.md`, and current repository implementation to construct a complete, deduplicated Feature Inventory across all 15 workstreams (WS1–WS15), 7 phases (Phase 0–Phase 7), operating rules (R1–R22 & AGENTS.md), acceptance fixtures (Appendix A), performance budgets (Appendix D), all API endpoints (legacy `/api/**` and modern `/v1/**`), and academic/ecosystem deliverables.

---

## 1. Observation

Direct observations from inspecting authoritative project artifacts:
1. **Authoritative Specification Document**: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md` (386 lines, 21,831 bytes). Contains North Star pillars, 22 non-negotiable operating rules (R1–R22), 20 known legacy defects (D1–D20), target monorepo layout, 15 discrete workstreams (WS1–WS15), 8 phase milestones (Phase 0–Phase 7), Appendix A acceptance fixtures (A1–A3), and Appendix D performance budgets (14 quantifiable metrics).
2. **Repository Governance Rules**: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/AGENTS.md` (106 lines). Mandatory rules for any automated agent or human contributor:
   - Rule 1: Mandatory update of `lib/changelog.ts` for every single code change. Strict format: Persian semantic versioning (`X.Y.Z` in Persian digits), Gregorian `isoDate` (`YYYY-MM-DD`), Persian date string (`۱۳ تیر ۱۴۰۵`), typed changes (`added` | `changed` | `fixed` | `removed`), concise active Persian prose, newest version first.
   - Rule 2: All UI text must be fluent RTL Persian.
   - Rule 3: Unified footer loaded once in `app/layout.tsx` via `components/footer.tsx`; no page-level duplication.
   - Rule 4: Favicon-only logo usage (`app/icon.svg`). No logos in navbar, footer, or body; text title only.
   - Rule 5: Zero emoji prohibition in production code, UI, commits, docs, and changelogs.
   - Rule 6: Complete removal of AI/automation textual artifacts (e.g., "قطعاً", "البته", "به طور کلی", "لازم به ذکر است", "Certainly", "Of course", rhetorical triplets, intro filler).
   - Rule 7: Zero vendor/tool branding in commit messages, code, README, or changelog.
3. **Current Codebase Implementation**:
   - `lib/data/`: `poetry-quotes.json` (3,110 bytes), `hafez.json` (694,755 bytes, 495 ghazals), `shereno.json` (5,981,895 bytes), `non-poetry-quotes.json` (214,737 bytes).
   - `lib/engine/`: Prototype Tigh v0.0.1-beta (`router.ts`, `cache.ts`, `rate-limiter.ts`, `circuit-breaker.ts`, `metrics.ts`, `routes.ts`, `instance.ts`, `adapter-next.ts`).
   - Legacy routes (14 routes under `app/api/`):
     - `/api/quotes`
     - `/api/quotes/hafez`
     - `/api/quotes/non-poetry`
     - `/api/quotes/shereno`
     - `/api/quotes/search`
     - `/api/quotes/category/[category]`
     - `/api/quotes/[poet]`
     - `/api/poets`
     - `/api/categories`
     - `/api/stats`
     - `/api/health`
     - `/api/embed` (HTML widget iframe with 5 themes: `default`, `elegant`, `minimal`, `classic`, `modern`)
     - `/api/engine/benchmark`
     - `/api/engine/stats`
   - Active query parameters: `lines` (`auto`, `separators`, `raw`), `line_origin`, `cacheBust`, `random` (`true`), `limit` (default 10, max 100), `page`, `q`/`query`, `poet`, `category`, `author`, `title`, `id`.

---

## 2. Logic Chain

1. **Premise 1 (Transformation Scope)**: The system must transition from an in-memory single-process JSON prototype to an academic-grade, zero-dependency engine (Tigh v1) and monorepo platform supporting ~1M records and >10M req/mo at near-zero marginal cost.
2. **Premise 2 (Preservation & Backward Compatibility)**: Per R5 and R6, existing data cannot be discarded (byte-identical legacy snapshot under `data/legacy/` with SHA-256), and all existing 14 `/api/**` endpoints and their query semantics (`lines`, `line_origin`, `random`, `limit`, etc.) must remain 100% operational with identical response contracts.
3. **Premise 3 (Academic Integrity & Data Correctness)**: Per R4, poems cannot have their wording modified from memory; any restructuring (WS3) must be strictly validated by a letter-fingerprint check (`s.replace(/[\s\u200c*\/]+/g, '')`), colophons must be isolated from poem bodies (A1), and modern works must undergo rights audit (WS1, `docs/audit/rights-audit.csv`).
4. **Premise 4 (Performance & Engineering Excellence)**: The hot path must remain zero-dependency (R10, WS6), bound to strict latency budgets in Appendix D (static routing <= 150 ns, cache hit <= 10 µs, warm work retrieval <= 50 µs, hybrid search <= 250 ms, p95 cached TTFB <= 50 ms), and enforced by automated CI gates (R14).
5. **Premise 5 (Ecosystem & Usability)**: The platform must deliver comprehensive interfaces: modern `/v1/**` REST API with RFC 9457 errors and OpenAPI 3.1, a lightweight `<persian-quote>` Web Component (<= 4 KB gz), Model Context Protocol (MCP) server for LLMs, typed TypeScript and Python SDKs with offline support, and bulk academic export formats (JSONL.zst, Parquet, CSV, TEI-P5 XML).
6. **Deduction**: A unified, granular Feature Inventory must explicitly categorize every requirement into its governing Workstream, Phase, and Source, creating a single source of truth for planning, implementation, and verification across all teams.

---

## 3. Caveats

1. **LLM Restructuring Fallback**: Where classical poem signals (`*`, `\n\n`, double spaces, ` / `) are absent, LLM-based line breaking may only adjust whitespace and structure, and will be discarded if the letter-fingerprint changes a single character.
2. **Modern Iranian Copyright**: Copyright for poets deceased fewer than 50 years (e.g. Naderpour, Harati, Shamlou, Farrokhzad) requires formal rights tracking in `docs/audit/rights-audit.csv`; works failing verification must be placed into `data/quarantine/`.
3. **Zero-Dependency Boundary**: The core request execution engine (`packages/core`) must maintain zero external npm dependencies. External libraries (e.g. Zod, Vitest, Fast-check) are strictly relegated to build pipelines, validation CLIs, and schemas.

---

## 4. Conclusion: Complete Feature Inventory

### 4.1 Master Feature Inventory Table

| # | Feature | Description | Milestone / Workstream | Source |
|---|---------|-------------|------------------------|--------|
| **F001** | Rule R1: Zero Incomplete Code | Strict prohibition of `TODO`, `FIXME`, stubs, mock data in production paths, commented code, or placeholder numbers in committed files. | All Phases / Governance | ORIGINAL_REQUEST.md §2 (R1) |
| **F002** | Rule R2: Empirical Verification | Every claim, metric, and fix must be backed by verifiable command output, test results, benchmark logs, and Playwright screenshots in `docs/evidence/<phase>/`. | All Phases / Governance | ORIGINAL_REQUEST.md §2 (R2) |
| **F003** | Rule R3: Zero Fabricated Numbers | All counts, latencies, accuracy numbers, and hit rates must be measured with raw logs preserved; all placeholder values in docs replaced. | All Phases / Governance | ORIGINAL_REQUEST.md §2 (R3) |
| **F004** | Rule R4: Letter-Fingerprint Word Immutability | Poem wording must never be altered from memory. Restructuring and whitespace changes must pass `s.replace(/[\s\u200c*\/]+/g, '')` letter-fingerprint equality. | WS3 / Phase 2 | ORIGINAL_REQUEST.md §2 (R4) |
| **F005** | Rule R5: Zero Data Deletion & Quarantine | Byte-identical snapshot of original JSON preserved under `data/legacy/` with SHA-256 checksums. Quarantined records placed in `data/quarantine/` with reason codes. | WS1 / Phase 0, 2 | ORIGINAL_REQUEST.md §2 (R5) |
| **F006** | Rule R6: Legacy Route Compatibility | 100% backward compatibility for all existing `/api/**` URLs, parameters (`lines`, `line_origin`, `cacheBust`, `random`, `limit`), and JSON response shapes. | WS7 / Phase 0, 3 | ORIGINAL_REQUEST.md §2 (R6) |
| **F007** | Rule R7: Autonomous Architecture Decisions | Agent autonomous decision-making documented via formal Architecture Decision Records (`docs/adr/NNNN-title.md`). | All Phases / Governance | ORIGINAL_REQUEST.md §2 (R7) |
| **F008** | Rule R8: Persistent Progress Tracking | Continuously maintained agent state and metrics log in `docs/agent/PROGRESS.md`. | All Phases / Governance | ORIGINAL_REQUEST.md §2 (R8) |
| **F009** | Rule R9: Git Branch & Commit Discipline | Development on branch `rebuild/v1`, small atomic commits, conventional commit syntax, green CI on every commit, and deployment runbooks (`docs/runbooks/deploy.md`). | All Phases / Governance | ORIGINAL_REQUEST.md §2 (R9) |
| **F010** | Rule R10: Zero-Dependency Hot Path | Runtime request execution hot path has zero external dependencies; all other dependencies pinned to exact versions with ADR documentation. | WS6 / Phase 1, 3 | ORIGINAL_REQUEST.md §2 (R10) |
| **F011** | Rule R11: Security & Privacy by Design | Zero secrets in repository; complete `.env.example` provided; no PII collected. | All Phases / Governance | ORIGINAL_REQUEST.md §2 (R11) |
| **F012** | Rule R12: Rights & Provenance Tracking | Comprehensive recording of license terms, retrieval dates, source URLs, and transformation history for every ingested corpus item. | WS1 / Phase 2 | ORIGINAL_REQUEST.md §2 (R12) |
| **F013** | Rule R13: Persian Linguistic Correctness | Full Unicode NFC normalization, ZWNJ preservation, Persian/Arabic/Latin digit handling, punctuation spacing, bidi mark isolation, and font shaping. | WS2 / Phase 1 | ORIGINAL_REQUEST.md §2 (R13) |
| **F014** | Rule R14: Performance Budget Enforcement | CI regression gating enforcing all latency, memory, and bundle size budgets defined in Appendix D. | WS14 / Phase 3, 5 | ORIGINAL_REQUEST.md §2 (R14) |
| **F015** | Rule R15: Courageous Refactoring | Mandate to replace legacy engine, schemas, and layouts if empirical measurements prove superiority. | All Phases / Core | ORIGINAL_REQUEST.md §2 (R15) |
| **F016** | Rule R16: End-of-Phase Reporting | Mandatory delivery of comprehensive progress, audit, and benchmark reports (`docs/reports/phase-N.md`) upon phase completion. | All Phases / Governance | ORIGINAL_REQUEST.md §2 (R16) |
| **F017** | Rule R17: Strict TypeScript Hygiene | TypeScript strict mode, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, zero `any`, ESM only, Zod validation, TSDoc comments, files <= 400 lines. | All Phases / Core | ORIGINAL_REQUEST.md §2 (R17) |
| **F018** | Rule R18: Visual Regression Safety Net | Capture baseline Playwright screenshots in Phase 0 and assert zero UI regression across viewport sizes after refactoring. | WS11, WS14 / Phase 0, 6 | ORIGINAL_REQUEST.md §2 (R18) |
| **F019** | Rule R19: Tool Verification | Mandatory end-to-end execution of dev servers, live site fetching, and automated browser testing. | All Phases / QA | ORIGINAL_REQUEST.md §2 (R19) |
| **F020** | Rule R20: Time-Boxed Escalation | Structured approach pivoting with ADR documentation if an engineering solution fails twice. | All Phases / Governance | ORIGINAL_REQUEST.md §2 (R20) |
| **F021** | Rule R21: Adversarial Self-Review | Hostile reviewer self-audit before closing any phase gate. | All Phases / QA | ORIGINAL_REQUEST.md §2 (R21) |
| **F022** | Rule R22: Multi-Language Separation | English for code, comments, commits, and ADRs; fluent Persian for UI and public docs. `lib/changelog.ts` strictly obeys repository rules. | All Phases / Governance | ORIGINAL_REQUEST.md §2 (R22) |
| **F023** | AGENTS Rule 1: Persian Changelog | Mandatory update of `lib/changelog.ts` on every commit with Persian semantic versioning (`X.Y.Z`), Gregorian `isoDate`, Persian date string, typed change array (`added`, `changed`, `fixed`, `removed`), active prose, no emojis, newest version first. | All Phases / AGENTS.md | AGENTS.md §1 |
| **F024** | AGENTS Rule 2: Fluent RTL Persian UI | All user-facing UI text rendered in natural, fluent Persian with right-to-left layout; English restricted to URLs and recognized technical terms. | WS11 / Phase 6 | AGENTS.md §2 |
| **F025** | AGENTS Rule 3: Single Root Footer | Single footer instantiated in `app/layout.tsx` via `components/footer.tsx`; no per-page duplication. | WS11 / Phase 0, 6 | AGENTS.md §3 |
| **F026** | AGENTS Rule 4: Favicon-Only Logo | Logo (`app/icon.svg`) reserved exclusively for favicon use; text title used across navigation and UI headers. | WS11 / Phase 6 | AGENTS.md §4 |
| **F027** | AGENTS Rule 5: Absolute Emoji Ban | Total prohibition of emojis in production code, UI, commit messages, documentation, and changelogs. | All Phases / AGENTS.md | AGENTS.md §5 |
| **F028** | AGENTS Rule 6: AI Text Marker Stripping | Verification and removal of AI prose artifacts (e.g. "قطعاً", "البته", rhetorical triplets, intro filler) prior to commit. | All Phases / AGENTS.md | AGENTS.md §6 |
| **F029** | AGENTS Rule 7: Tool Brand Prohibition | Complete exclusion of AI or automation tool brand names across codebase, commits, README, and changelogs. | All Phases / AGENTS.md | AGENTS.md §7 |
| **F030** | Phase 0: Recon & Safety Net | Full audit of legacy code, baseline benchmark logging, byte-identical legacy snapshot in `data/legacy/` with SHA-256, golden legacy API snapshots, visual Playwright baselines, and `docs/audit/00-recon.md`. | Phase 0 | ORIGINAL_REQUEST.md §6 |
| **F031** | Phase 1: Foundations | Bun monorepo workspace configuration (`apps/*`, `packages/*`), `packages/schema` Zod definitions, `packages/persian` with >= 90% branch coverage and property tests. | Phase 1 | ORIGINAL_REQUEST.md §6 |
| **F032** | Phase 2: Data Pipeline & Processing | WS1 data migration, WS3 poem structure engine with evaluation harness, WS4 excerpt/radif/qafiyeh, rights audit (`docs/audit/rights-audit.csv`), and verified passage of fixtures A1, A2, A3. | Phase 2 | ORIGINAL_REQUEST.md §6 |
| **F033** | Phase 3: Engine, Artifacts & API v1 | WS5 build pipeline and storage benchmark ADR, WS6 Tigh v1 zero-dependency core, WS7 API v1 and legacy compatibility layer, OpenAPI 3.1 schema, and adapter conformance test pass. | Phase 3 | ORIGINAL_REQUEST.md §6 |
| **F034** | Phase 4: Search Engine | WS8 hybrid search, rhyme finder, evaluation harness with >= 150 benchmark queries, committed nDCG@10 and MRR@10 baselines, and chaos degradation test pass. | Phase 4 | ORIGINAL_REQUEST.md §6 |
| **F035** | Phase 5: Delivery & Operations | WS9 hosting benchmark ADR (Cloudflare vs Vercel vs VPS), CDN caching verification transcripts, multi-origin mirror deployment, Docker containerization, and load test (>= 5,000 req/s). | Phase 5 | ORIGINAL_REQUEST.md §6 |
| **F036** | Phase 6: Experience & Ecosystem | WS10 `<persian-quote>` Web Component, WS11 Next.js web application, WS12 TypeScript and Python SDKs with runnable Jupyter notebooks, and WS13 MCP server. | Phase 6 | ORIGINAL_REQUEST.md §6 |
| **F037** | Phase 7: Governance & Final Audit | WS14/WS15 governance docs, Appendix C self-audit checklist, hostile reviewer adversarial review, and final report `docs/reports/FINAL.md`. | Phase 7 | ORIGINAL_REQUEST.md §6 |
| **F038** | WS1: Canonical Zod Schemas | Strongly typed schemas (`packages/schema`) for poems, poets, collections, attributions, stanzas, and colophons, exporting TS types, JSON Schema, and OpenAPI components. | WS1 / Phase 1 | ORIGINAL_REQUEST.md §4, §5 |
| **F039** | WS1: Hierarchical Stable IDs | Deterministic, immutable record identifiers formatted as `poet-slug.collection-slug.number` (e.g. `hafez.ghazaliyat.001`). | WS1 / Phase 2 | ORIGINAL_REQUEST.md §5 (WS1) |
| **F040** | WS1: Canonical Poet Registry | Centralized registry containing standardized biographical data, birth/death dates (Jalali + Gregorian), Persian/English bios, and transliteration aliases. | WS1 / Phase 2 | ORIGINAL_REQUEST.md §5 (WS1) |
| **F041** | WS1: Rights Audit & Catalog | Comprehensive copyright and public domain audit across all modern and classical poets, documented in `docs/audit/rights-audit.csv`. | WS1 / Phase 2 | ORIGINAL_REQUEST.md §5 (WS1) |
| **F042** | WS1: Migration Pipeline | Deterministic migration scripts converting legacy `poetry-quotes.json`, `hafez.json`, `shereno.json`, and `non-poetry-quotes.json` into canonical records. | WS1 / Phase 2 | ORIGINAL_REQUEST.md §5 (WS1) |
| **F043** | WS1: Data Validation CLI | Executable validation script `bun run data:validate` verifying schema compliance, structural integrity, and absence of malformed lines. | WS1 / Phase 2 | ORIGINAL_REQUEST.md §5 (WS1) |
| **F044** | WS1: Legacy Snapshot & Checksums | Byte-identical snapshot of original source JSON preserved under `data/legacy/` with SHA-256 verification hashes. | WS1 / Phase 0 | ORIGINAL_REQUEST.md §2 (R5) |
| **F045** | WS1: Quarantine Pipeline | Automated routing of unverifiable, corrupt, or uncredited records to `data/quarantine/` with structured machine-readable reason codes. | WS1 / Phase 2 | ORIGINAL_REQUEST.md §2 (R5) |
| **F046** | WS2: Dual Persian Normalizer | `normalizeDisplay` preserving typography and diacritics for rendering, and `normalizeSearch` folding diacritics, unifying yeh/kaf/alef, and normalizing ZWNJ. | WS2 / Phase 1 | ORIGINAL_REQUEST.md §5 (WS2) |
| **F047** | WS2: Line Cleaner (`cleanLine`) | Strips LTR/RTL invisible marks (`\u200e`, `\u200f`), collapses whitespace, eliminates spaces before punctuation (`، ؛ ؟ ! . : ) »`), and ensures single trailing space. | WS2 / Phase 1 | ORIGINAL_REQUEST.md §5 (WS2), Ref Code |
| **F048** | WS2: Persian Tokenizer (`tokenize`) | Persian-aware word segmentation handling ZWNJ compound words and Persian morphological boundaries. | WS2 / Phase 1 | ORIGINAL_REQUEST.md §5 (WS2) |
| **F049** | WS2: Persian Light Stemmer (`lightStem`) | Rule-based stemmer removing common verbal and nominal affixes (e.g. `می-`, `نمی-`, `-ها`, `-هایم`, `-تر`, `-ترین`). | WS2 / Phase 1 | ORIGINAL_REQUEST.md §5 (WS2) |
| **F050** | WS2: Bidirectional Digit Normalizer | Bidirectional conversion between Persian (`۰-۹`), Arabic (`٠-٩`), and ASCII (`0-9`) numeral representations. | WS2 / Phase 1 | ORIGINAL_REQUEST.md §5 (WS2), Ref Code |
| **F051** | WS2: Jalali Calendar Converter | Accurate bidirectional date conversion between Solar Hijri (Jalali) and Gregorian calendars. | WS2 / Phase 1 | ORIGINAL_REQUEST.md §5 (WS2) |
| **F052** | WS2: Bidi Text Isolator | Bi-directional embedding and isolation utility ensuring mixed Persian-English text displays correctly without layout breakage. | WS2 / Phase 1 | ORIGINAL_REQUEST.md §5 (WS2) |
| **F053** | WS2: Finglish Query Parser (`finglishQuery`) | Phonetic transliteration parser mapping Latin-script Persian queries (e.g. `hafez`, `shamlou`) to standard Persian orthography. | WS2 / Phase 1 | ORIGINAL_REQUEST.md §5 (WS2) |
| **F054** | WS2: Fuzzy Match Utilities | Optimized Levenshtein and Damerau-Levenshtein calculation routines tailored for Persian strings and poet names. | WS2 / Phase 1 | ORIGINAL_REQUEST.md §5 (WS2) |
| **F055** | WS2: Property-Based NLP Testing | Fast-check property-based tests verifying idempotency, reversibility, and boundary safety of text normalizers with >= 90% branch coverage. | WS2 / Phase 1 | ORIGINAL_REQUEST.md §5 (WS2), §6 |
| **F056** | WS3: Colophon Extraction Engine | RegEx and linguistic parser identifying place names and Jalali/Gregorian composition dates at poem endings, stripping them from stanzas. | WS3 / Phase 2 | ORIGINAL_REQUEST.md §5 (WS3), Ref Code |
| **F057** | WS3: Structural Signal Splitting | Parser segmenting unstructured poem text using asterisks (`*`), blank lines (`\n\n`), multi-spaces (`\S\s{2,}\S`), and slashes (` / `). | WS3 / Phase 2 | ORIGINAL_REQUEST.md §5 (WS3), Ref Code |
| **F058** | WS3: Letter-Fingerprint Validation | Verification function `s.replace(/[\s\u200c*\/]+/g, '')` guaranteeing that no letters are added, modified, or dropped during structural analysis. | WS3 / Phase 2 | ORIGINAL_REQUEST.md §2 (R4), Ref Code |
| **F059** | WS3: LLM Structure Inference | LLM-assisted line and stanza segmentation for unstructured modern verse, gated by 100% letter-fingerprint verification. | WS3 / Phase 2 | ORIGINAL_REQUEST.md §5 (WS3) |
| **F060** | WS3: Heuristic Structure Fallback | Algorithmic line breaker targeting median 2–12 words/line (max 22 words) when no explicit structural signals or LLM outputs exist. | WS3 / Phase 2 | ORIGINAL_REQUEST.md §5 (WS3), Ref Code |
| **F061** | WS3: Dual Rendering Contract | Canonical dual representation: structured stanzas/beyts (classical poems having exactly two hemistichs per beyt) alongside clean `text_plain`. | WS3 / Phase 2 | ORIGINAL_REQUEST.md §5 (WS3) |
| **F062** | WS3: Boundary F1 Evaluation Harness | Evaluation script `pipeline/eval-structure.ts` benchmarking line and stanza boundary precision, recall, and F1 score against golden truth data. | WS3 / Phase 2 | ORIGINAL_REQUEST.md §5 (WS3) |
| **F063** | WS4: Windowed Excerpt Picker (`pickExcerpt`) | Intelligent excerpt selector evaluating sentence boundaries, soft endings, block boundaries, quote balance, and avoiding bad start/end words. | WS4 / Phase 2 | ORIGINAL_REQUEST.md §5 (WS4), Ref Code |
| **F064** | WS4: Radif & Qafiyeh Detection Engine | Phonetic and morphological rhyme engine extracting the rhyme word (qafiyeh) and repetitive refrain (radif) of classical verse. | WS4 / Phase 2 | ORIGINAL_REQUEST.md §5 (WS4) |
| **F065** | WS4: Aruz Meter Annotation | Poetic meter identification classifying classical works by their traditional prosodic foot and meter name (e.g. بحر رمل، بحر هزج). | WS4 / Phase 2 | ORIGINAL_REQUEST.md §5 (WS4) |
| **F066** | WS4: Attribution & Authenticity Flagging | Tri-state attribution classification: verified, attributed, or disputed/apocryphal (`مشکوک` / `منسوب`). | WS4 / Phase 2 | ORIGINAL_REQUEST.md §5 (WS4) |
| **F067** | WS4: Literary Taxonomy Review | Hierarchical tagging system categorizing poetry by poetic form, era, movement, thematic tags, and mood. | WS4 / Phase 2 | ORIGINAL_REQUEST.md §5 (WS4) |
| **F068** | WS5: Reproducible Data Build | Command `bun run build:data` executing ingestion, structural enrichment, indexing, and artifact generation in a single reproducible run. | WS5 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS5) |
| **F069** | WS5: Runtime Store JSON Shards | Precomputed partitioned static JSON chunks optimized for sub-millisecond memory loading by serverless/edge instances. | WS5 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS5) |
| **F070** | WS5: Prebuilt Search Index Artifact | Serialized BM25F lexical index and SymSpell vocabulary dictionary bundled as static assets. | WS5 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS5) |
| **F071** | WS5: Embedded SQLite FTS5 Database | SQLite database artifact with full-text search (FTS5) table containing the entire corpus for local querying and academic use. | WS5 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS5) |
| **F072** | WS5: Bulk Export — Zstandard JSONL | Complete corpus exported as line-delimited JSON compressed with Zstandard (`JSONL.zst`). | WS5 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS5) |
| **F073** | WS5: Bulk Export — Apache Parquet | Columnar Apache Parquet dataset (`.parquet`) for big data analytics, Spark, DuckDB, and Python data pipelines. | WS5 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS5) |
| **F074** | WS5: Bulk Export — CSV | Clean tabular CSV export (`.csv`) for spreadsheets and quick relational import. | WS5 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS5) |
| **F075** | WS5: Bulk Export — TEI-P5 XML | Scholarly XML export conforming to Text Encoding Initiative (TEI-P5) guidelines for digital humanities research. | WS5 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS5) |
| **F076** | WS5: Golden Regression Datasets | Curated test fixtures (`data/golden/`) locking expected structural and linguistic outputs. | WS5 / Phase 2, 3 | ORIGINAL_REQUEST.md §4, §5 |
| **F077** | WS6: Tigh v1 Zero-Dependency Core | Request execution engine (`packages/core`) operating strictly with zero runtime npm dependencies using Web Standard `fetch(Request) -> Response`. | WS6 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS6) |
| **F078** | WS6: Compiled Radix Tree Router | High-performance radix tree router achieving static route matching in <= 150 ns and parametric matching in <= 400 ns. | WS6 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS6), App D |
| **F079** | WS6: S3-FIFO / W-TinyLFU Memory Cache | High-concurrency in-memory cache implementing advanced eviction algorithms, TTL support, and byte-size caps with CPU hit time <= 10 µs. | WS6 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS6), App D |
| **F080** | WS6: Request Stampede Coalescing | Single-flight request deduplication ensuring only one backend fetch occurs per cache key under high concurrency. | WS6 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS6) |
| **F081** | WS6: GCRA Rate Limiter | Generic Cell Rate Algorithm rate limiting with smooth token consumption per IP and client API key. | WS6 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS6) |
| **F082** | WS6: Circuit Breaker | Adaptive three-state circuit breaker (Closed, Open, Half-Open) protecting search backends and external services. | WS6 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS6) |
| **F083** | WS6: Bounded In-Memory Telemetry | Ring-buffer telemetry tracking latency percentiles (p50, p90, p95, p99) and request counters without unbounded memory growth. | WS6 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS6) |
| **F084** | WS6: Adapter Conformance Suite | Cross-runtime test suite validating identical engine execution on Node.js, Bun, Cloudflare Workers, and Vercel Serverless. | WS6 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS6) |
| **F085** | WS7: Legacy Compatibility Parity | Full backwards compatibility for all 14 legacy endpoints, query params (`lines`, `line_origin`, `cacheBust`, `random`, `limit`, `page`), and response shapes. | WS7 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F086** | WS7: Modern Endpoint `GET /v1/works` | Paginated listing of poems with filters for poet, collection, poetic form, meter, tags, and text search. | WS7 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F087** | WS7: Modern Endpoint `GET /v1/works/{id}` | Detailed retrieval of a poem by canonical stable ID, including stanzas, colophon, meter, attribution, rights, and citation info (CPU <= 50 µs). | WS7 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS7), App D |
| **F088** | WS7: Modern Endpoint `GET /v1/works/random` | Random selection of works or excerpts filtered by poet, form, and length constraints. | WS7 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F089** | WS7: Modern Endpoint `GET /v1/daily` | Deterministic daily poem selection synchronized strictly to Tehran midnight (`Asia/Tehran`). | WS7 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F090** | WS7: Modern Endpoint `GET /v1/fal` | Divan-e Hafez divination endpoint accepting an optional user niyyat, returning ghazal, interpretation, and shahed beyt. | WS7 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F091** | WS7: Modern Endpoint `GET /v1/poets` | Complete catalog of poets with biographies, historical eras, counts, and canonical slugs. | WS7 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F092** | WS7: Modern Endpoint `GET /v1/poets/{id}` | Single poet profile, detailed biographical information, list of collections, and corpus statistics. | WS7 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F093** | WS7: Modern Endpoint `GET /v1/collections` | List of poetic collections, divans, books, and anthologies in the platform. | WS7 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F094** | WS7: Modern Endpoint `GET /v1/collections/{id}` | Detailed collection metadata, compilation dates, poet reference, and contained works. | WS7 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F095** | WS7: Modern Endpoint `GET /v1/suggest` | Ultra-fast prefix autocomplete/typeahead for poets, titles, and first lines (server time <= 10 ms). | WS7 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS7), App D |
| **F096** | WS7: Modern Endpoint `GET /v1/rhymes` | Rhyme search endpoint returning words and verses matching requested rhyme (qafiyeh) and meter patterns. | WS7 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS7, WS8) |
| **F097** | WS7: Modern Endpoint `GET /v1/meta` | Platform metadata, corpus counts, version details, and downloadable links for bulk exports. | WS7 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F098** | WS7: Modern Endpoint `GET /v1/health` | Comprehensive liveness and readiness probe reporting uptime, memory usage, and cache efficiency. | WS7 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F099** | WS7: RFC 9457 Problem Details | Standardized error payload formatting using `application/problem+json` across all `/v1/**` endpoints. | WS7 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F100** | WS7: Content-Addressed ETag & Caching | Deterministic SHA-256 ETag generation and edge `Cache-Control` header tuning for aggressive CDN caching. | WS7 / Phase 3 | ORIGINAL_REQUEST.md §3 (D19), §5 |
| **F101** | WS7: Server-Timing Headers | Detailed diagnostic headers emitting millisecond execution durations for routing, cache lookup, and search compute. | WS7 / Phase 3 | ORIGINAL_REQUEST.md §3 (D19), §5 |
| **F102** | WS7: Dynamic Precompression | Transparent response compression supporting Brotli (`br`), Gzip (`gzip`), and Zstandard (`zstd`). | WS7 / Phase 3 | ORIGINAL_REQUEST.md §3 (D19), §5 |
| **F103** | WS7: OpenAPI 3.1 Specification | Formally generated and synchronized OpenAPI 3.1 documentation (`openapi.yaml` / `openapi.json`). | WS7 / Phase 3 | ORIGINAL_REQUEST.md §5 (WS7) |
| **F104** | WS8: BM25F Lexical Search | Field-weighted BM25F ranking scoring poet (weight 15), title (weight 8), first hemistich (weight 5), and body text (weight 1). | WS8 / Phase 4 | ORIGINAL_REQUEST.md §5 (WS8) |
| **F105** | WS8: SymSpell Typo-Tolerant Search | High-speed symmetric delete spelling correction handling spelling variants, missing ZWNJ, and typos. | WS8 / Phase 4 | ORIGINAL_REQUEST.md §5 (WS8) |
| **F106** | WS8: Finglish Query Translation | Automatic phonetic conversion of romanized Persian search inputs to Persian search terms. | WS8 / Phase 4 | ORIGINAL_REQUEST.md §5 (WS8) |
| **F107** | WS8: Semantic Vector Search | Dense vector semantic search utilizing open Persian embeddings (e.g. LaBSE, ParsBERT, or ONNX runtime). | WS8 / Phase 4 | ORIGINAL_REQUEST.md §5 (WS8) |
| **F108** | WS8: Hybrid RRF Search Ranking | Hybrid search combining BM25F and vector semantic similarity via Reciprocal Rank Fusion (p95 <= 250 ms). | WS8 / Phase 4 | ORIGINAL_REQUEST.md §5 (WS8), App D |
| **F109** | WS8: Search Graceful Degradation | Automatic circuit-breaker fallback to pure lexical search if semantic search times out or fails (fallback <= 25 ms). | WS8 / Phase 4 | ORIGINAL_REQUEST.md §5 (WS8), App D |
| **F110** | WS8: Search Benchmark & Evaluation Suite | Ground-truth test collection of >= 150 Persian literature queries tracking nDCG@10 and MRR@10 baselines in CI. | WS8 / Phase 4 | ORIGINAL_REQUEST.md §5 (WS8) |
| **F111** | WS9: Hosting Benchmark ADR | Measured multi-platform benchmark comparing Cloudflare Workers, Vercel Serverless, and VPS on cold start, latency, and cost. | WS9 / Phase 5 | ORIGINAL_REQUEST.md §5 (WS9) |
| **F112** | WS9: Edge CDN Caching Verification | Verifiable curl transcripts demonstrating edge cache hits (`CF-Cache-Status: HIT` or `x-vercel-cache: HIT`) with TTFB <= 50 ms. | WS9 / Phase 5 | ORIGINAL_REQUEST.md §5 (WS9), App D |
| **F113** | WS9: Multi-Origin Mirror Infrastructure | Redundant secondary origin and mirror setup ensuring continuous availability for Iranian universities despite international network disruptions. | WS9 / Phase 5 | ORIGINAL_REQUEST.md §3 (D20), §5 |
| **F114** | WS9: Docker Containerization | Minimal, reproducible multi-stage Dockerfile packaging standalone Bun/Node runtime for single-command self-hosting. | WS9 / Phase 5 | ORIGINAL_REQUEST.md §5 (WS9) |
| **F115** | WS9: Automated Disaster Recovery Drill | Documented runbook and test script restoring entire platform and search indices from immutable artifacts. | WS9 / Phase 5 | ORIGINAL_REQUEST.md §5 (WS9) |
| **F116** | WS9: Operational Cost Model | Formal financial breakdown proving near-zero operating costs under sustained 10M+ requests/month traffic. | WS9 / Phase 5 | ORIGINAL_REQUEST.md §5 (WS9) |
| **F117** | WS10: Web Component `<persian-quote>` | Framework-agnostic custom HTML element encapsulated with Shadow DOM, weighing <= 4 KB gzipped. | WS10 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS10), App D |
| **F118** | WS10: CSS Custom Property Theming | Dynamic theme configuration using CSS custom properties (`--pq-*`) supporting light, dark, and custom palettes. | WS10 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS10) |
| **F119** | WS10: Hardened Iframe Embed (`/api/embed`) | Responsive iframe embed with dynamic parent resizing (`postMessage`/`ResizeObserver`), strict CSP, and security sandboxing. | WS10 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS10) |
| **F120** | WS10: Server-Side Share Cards (OG Images) | Automated social preview card generation rendering beautiful Persian typography for any poem ID. | WS10 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS10) |
| **F121** | WS11: Poem Reader Page (`/p/{id}`) | Dedicated reader view with clean vertical stanza layout, meter badges, attribution, copy button, audio player, and citation export. | WS11 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS11) |
| **F122** | WS11: Poet Profile Page (`/poets/{id}`) | Dedicated biographical page for each poet displaying chronological timeline, collections, and top excerpts. | WS11 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS11) |
| **F123** | WS11: Instant Search UI | Client-side debounced search interface with instant results, keyword highlighting, and filter chips. | WS11 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS11) |
| **F124** | WS11: Interactive API Playground | Web console allowing developers to test endpoints interactively, inspect headers, and copy runnable code snippets (curl, TS, Python, Go). | WS11 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS11) |
| **F125** | WS11: Live Architecture Dashboard (`/sakhtar`) | Public observability page visualizing real-time engine telemetry, cache hit ratios, p95 latencies, and dataset counts. | WS11 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS11) |
| **F126** | WS11: Interactive Widget Builder | Visual GUI enabling users to configure, preview, and generate embed codes for `<persian-quote>` or iframes. | WS11 / Phase 6 | ORIGINAL_REQUEST.md §4, §5 |
| **F127** | WS11: WCAG 2.2 AA Accessibility | Comprehensive accessibility compliance including ARIA landmarks, keyboard navigation, screen reader labels, and high contrast. | WS11 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS11) |
| **F128** | WS11: Optimized Vazirmatn Font Packaging | Subsetted Persian web fonts ensuring total initial client JavaScript bundle remains <= 100 KB gzipped. | WS11 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS11), App D |
| **F129** | WS12: Citation Metadata Standard (`CITATION.cff`) | Standardized `CITATION.cff` file enabling researchers to cite the corpus directly in academic papers and BibTeX. | WS12 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS12) |
| **F130** | WS12: Zenodo DOI Integration | Automated workflow minting persistent Digital Object Identifiers (DOI) on Zenodo for versioned corpus releases. | WS12 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS12) |
| **F131** | WS12: Bulk Dataset Documentation Cards | Detailed data provenance cards documenting text acquisition methodology, normalization steps, and copyright status. | WS12 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS12) |
| **F132** | WS12: TypeScript SDK (`packages/sdk-ts`) | Fully typed TypeScript client library supporting browser, Node.js, and edge environments, with offline SQLite/JSON querying. | WS12 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS12) |
| **F133** | WS12: Python SDK (`packages/sdk-py`) | Python library (`pip install persian-quote`) with Pydantic v2 schemas, sync/async HTTPX clients, and bundled offline database. | WS12 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS12) |
| **F134** | WS12: Digital Humanities Jupyter Notebooks | Interactive, runnable Jupyter tutorials covering meter extraction, stylometric comparison, and corpus analysis. | WS12 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS12) |
| **F135** | WS13: Model Context Protocol (MCP) Server | MCP server (`packages/mcp`) running over Streamable HTTP and stdio transports for Claude Desktop, Gemini, and Antigravity. | WS13 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS13) |
| **F136** | WS13: MCP Tool `get_poem` | MCP tool retrieving a complete poem or excerpt by canonical ID. | WS13 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS13) |
| **F137** | WS13: MCP Tool `search_poems` | MCP tool executing hybrid search across Persian literature with filters. | WS13 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS13) |
| **F138** | WS13: MCP Tool `get_daily_poem` | MCP tool fetching today's Tehran midnight featured poem. | WS13 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS13) |
| **F139** | WS13: MCP Tool `get_hafez_fal` | MCP tool performing Hafez divination for user inquiries. | WS13 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS13) |
| **F140** | WS13: MCP Tool `find_rhymes` | MCP tool finding rhyming words and verses based on meter and qafiyeh. | WS13 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS13) |
| **F141** | WS13: MCP Tool `get_poet_info` | MCP tool retrieving historical biographies and bibliography for poets. | WS13 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS13) |
| **F142** | WS13: Machine-Readable LLM Index (`llms.txt`) | Compact API overview and schema index optimized for LLM context windows. | WS13 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS13) |
| **F143** | WS13: Full LLM Context (`llms-full.txt`) | Exhaustive documentation, complete OpenAPI specifications, and prompt guidance for AI agents. | WS13 / Phase 6 | ORIGINAL_REQUEST.md §5 (WS13) |
| **F144** | WS14: Comprehensive Unit & Fuzz Testing | High-coverage test suite across all monorepo packages, including router fuzzing and property tests. | WS14 / Phase 7 | ORIGINAL_REQUEST.md §5 (WS14) |
| **F145** | WS14: Legacy Contract Golden Tests | Automated regression suite verifying exact byte-level response parity for all 14 legacy `/api/**` endpoints. | WS14 / Phase 0, 7 | ORIGINAL_REQUEST.md §5 (WS14) |
| **F146** | WS14: Schemathesis Property-Based API Testing | Automated negative and boundary testing of all `/v1/**` endpoints against the OpenAPI 3.1 schema. | WS14 / Phase 7 | ORIGINAL_REQUEST.md §5 (WS14) |
| **F147** | WS14: Playwright E2E & Visual Regression | Multi-browser end-to-end user flow testing and visual regression screenshot comparisons. | WS14 / Phase 0, 7 | ORIGINAL_REQUEST.md §5 (WS14) |
| **F148** | WS14: Automated Accessibility Auditing | Axe-core accessibility checks integrated into continuous integration pipelines. | WS14 / Phase 7 | ORIGINAL_REQUEST.md §5 (WS14) |
| **F149** | WS14: Lighthouse CI Performance Auditing | CI performance budget auditing ensuring performance score >= 95 and LCP / CLS thresholds pass. | WS14 / Phase 7 | ORIGINAL_REQUEST.md §5 (WS14) |
| **F150** | WS14: Modernized Contribution Workflow | Pre-commit git hooks, validation CLI, and automated GitHub PR checks for incoming poetry contributions. | WS14 / Phase 7 | ORIGINAL_REQUEST.md §5 (WS14) |
| **F151** | WS15: Governance & Policy Documentation | Comprehensive project documentation: `README.md` (EN/FA), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `GOVERNANCE.md`, `ROADMAP.md`, `API-POLICY.md`. | WS15 / Phase 7 | ORIGINAL_REQUEST.md §5 (WS15) |
| **F152** | Acceptance Fixture A1: Salman Harati | Extract colophon `{ place: "تنکابن", date_jalali: {y:1364,m:2,d:12}, date_gregorian: "1985-05-02" }`; clean body; line-per-block rendering; excerpt word limit 25 with `cutEnd` ellipsis. | Acceptance Test / Phase 2 | ORIGINAL_REQUEST.md App A (A1) |
| **F153** | Acceptance Fixture A2: Nader Naderpour | Punctuation normalization (no space before `،`; single space after `،`); structure strategy recorded with origin and confidence; excerpts end on clean sentence boundaries. | Acceptance Test / Phase 2 | ORIGINAL_REQUEST.md App A (A2) |
| **F154** | Acceptance Fixture A3: Corpus-Wide Integrity | Scan corpus asserting zero lines with leading/trailing whitespace, zero lines of only punctuation/digits, zero spaces before `، ؛ ؟`, no U+0640 tatweel, no raw ` / `, and exactly 2 hemistichs per classical beyt. | Acceptance Test / Phase 2 | ORIGINAL_REQUEST.md App A (A3) |
| **F155** | Performance Budget B1: Static Router Match | Static route matching compute time <= 150 ns. | SRE / Phase 3 | ORIGINAL_REQUEST.md App D |
| **F156** | Performance Budget B2: Parametric Router Match | Parameter route matching compute time <= 400 ns. | SRE / Phase 3 | ORIGINAL_REQUEST.md App D |
| **F157** | Performance Budget B3: Cache-Hit Handler CPU | CPU execution time for cached responses <= 10 µs. | SRE / Phase 3 | ORIGINAL_REQUEST.md App D |
| **F158** | Performance Budget B4: Warm Work Retrieval CPU | CPU execution time for warm `GET /v1/works/{id}` <= 50 µs. | SRE / Phase 3 | ORIGINAL_REQUEST.md App D |
| **F159** | Performance Budget B5: Cold Start First Byte | Cold start to first byte <= 100 ms (current dataset) / <= 250 ms (100x dataset). | SRE / Phase 3 | ORIGINAL_REQUEST.md App D |
| **F160** | Performance Budget B6: Lexical Search Latency | Lexical search p95 compute <= 25 ms (100k records) / <= 80 ms (1M records). | SRE / Phase 4 | ORIGINAL_REQUEST.md App D |
| **F161** | Performance Budget B7: Hybrid Search Latency | Hybrid search p95 compute <= 250 ms with automatic fallback to lexical search. | SRE / Phase 4 | ORIGINAL_REQUEST.md App D |
| **F162** | Performance Budget B8: Typeahead Suggest Latency | Autocomplete `/v1/suggest` server compute time <= 10 ms. | SRE / Phase 3 | ORIGINAL_REQUEST.md App D |
| **F163** | Performance Budget B9: Edge CDN Cached TTFB | Time to first byte for cached requests <= 50 ms p95 globally. | SRE / Phase 5 | ORIGINAL_REQUEST.md App D |
| **F164** | Performance Budget B10: Origin Uncached TTFB | Origin execution time for uncached requests <= 150 ms p99. | SRE / Phase 5 | ORIGINAL_REQUEST.md App D |
| **F165** | Performance Budget B11: Memory Footprint | Total resident memory footprint at 100x dataset scale (~1M poems) <= 128 MB. | SRE / Phase 3, 5 | ORIGINAL_REQUEST.md App D |
| **F166** | Performance Budget B12: Web Application JS Bundle | Initial gzipped JavaScript bundle size for web application <= 100 KB. | SRE / Phase 6 | ORIGINAL_REQUEST.md App D |
| **F167** | Performance Budget B13: Web Component Bundle | Gzipped bundle size for `<persian-quote>` widget core <= 4 KB. | SRE / Phase 6 | ORIGINAL_REQUEST.md App D |
| **F168** | Performance Budget B14: High-Concurrency Throughput | Sustained cached read throughput >= 5,000 requests/second under load testing. | SRE / Phase 5 | ORIGINAL_REQUEST.md App D |

---

### 4.2 Features Discovered by Category (Specification Miner Schema)

## Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Governance | Zero Incomplete Code (R1) | Disallows TODO, FIXME, placeholder numbers, stubbed code | Source code & docs | Verified production code | CI build fails if tokens found | ORIGINAL_REQUEST.md §2 |
| 2 | Governance | Authentic Verification (R2, R3) | Empirical validation of all claims with logs | Test/benchmark runs | Raw log files in `docs/evidence/` | Reject assertions without logs | ORIGINAL_REQUEST.md §2 |
| 3 | Data Integrity | Letter-Fingerprint Immutability (R4) | Whitespace-only alterations validated by letter fingerprint | Raw poem string | Structurally enriched poem | Discard candidate if letters change | ORIGINAL_REQUEST.md §2, Ref Code |
| 4 | Data Integrity | Non-Destructive Ingestion (R5) | Legacy byte snapshot + quarantine routing | Raw JSON files | `data/legacy/`, `data/quarantine/` | Quarantine with reason code | ORIGINAL_REQUEST.md §2 |
| 5 | Compatibility | Legacy Contract Preservation (R6) | 100% route and response shape backwards compatibility | HTTP requests to `/api/**` | Exact legacy JSON responses | 404/500 with legacy JSON error | ORIGINAL_REQUEST.md §2, §3 |
| 6 | Governance | Agent Autonomy & ADRs (R7, R8) | Architectural decision recording and progress persistence | Technical decisions | `docs/adr/*.md`, `PROGRESS.md` | Blocked only if owner required | ORIGINAL_REQUEST.md §2 |
| 7 | Engineering | Zero-Dependency Hot Path (R10) | Request path has zero external npm dependencies | HTTP Request | HTTP Response | Build failure on external import | ORIGINAL_REQUEST.md §2, §5 |
| 8 | NLP / Persian | Dual Persian Normalization (WS2) | Distinct display vs search normalizers | Persian text string | Clean display text or folded search key | Returns empty string on empty input | ORIGINAL_REQUEST.md §5 |
| 9 | NLP / Persian | Persian Line Cleaner (WS2) | Cleans typography, whitespace, and punctuation spacing | Raw text line | Clean normalized line | Strips invalid bidi marks | ORIGINAL_REQUEST.md §5, Ref Code |
| 10 | NLP / Persian | Finglish Transliteration (WS2) | Phonetic transliteration from Finglish to Persian | Latin-script Persian query | Standard Persian text query | Returns raw query if unmapped | ORIGINAL_REQUEST.md §5 |
| 11 | Poem Engine | Colophon Extraction (WS3) | Isolates composition date and location from poem body | Raw poem string | `{ body, colophon: { place, date } }` | Returns original body if no colophon | ORIGINAL_REQUEST.md §5, Ref Code |
| 12 | Poem Engine | Multi-Factor Excerpt Picker (WS4) | Scored windowed excerpt selection avoiding broken phrases | Stanzas array, options | Excerpt object with cut flags | Falls back to first line if scoring empty | ORIGINAL_REQUEST.md §5, Ref Code |
| 13 | Poem Engine | Radif & Qafiyeh Detection (WS4) | Identifies rhyme words and refrain | Classical beyt stanzas | Rhyme metadata `{ qafiyeh, radif }` | Marks as unrhymed if free verse | ORIGINAL_REQUEST.md §5 |
| 14 | Poem Engine | Aruz Meter Annotation (WS4) | Determines classical meter pattern | Stanzas array | Meter name (e.g. بحر رمل) | Null if non-classical or unknown | ORIGINAL_REQUEST.md §5 |
| 15 | Artifacts | Bulk Exports (WS5) | Generates JSONL.zst, Parquet, CSV, TEI-P5 XML | Ingested canonical data | Output files in `dist/` / `public/` | Pipeline aborts on schema mismatch | ORIGINAL_REQUEST.md §5 |
| 16 | Core Engine | Compiled Radix Tree Router (WS6) | Sub-microsecond URL routing | HTTP method and path | Matched route handler + params | 404 Response if unmatched | ORIGINAL_REQUEST.md §5, App D |
| 17 | Core Engine | S3-FIFO / W-TinyLFU Cache (WS6) | In-memory cache with stampede protection | Cache key, TTL, compute fn | Cached Response object | Evicts on memory pressure | ORIGINAL_REQUEST.md §5, App D |
| 18 | Core Engine | GCRA Rate Limiter (WS6) | Cell rate algorithm per client | Client IP / API token | Pass or 429 Too Many Requests | 429 with Retry-After header | ORIGINAL_REQUEST.md §5 |
| 19 | API v1 | Modern Work Endpoint (WS7) | Detailed work retrieval with citation and rights | Work ID string | Canonical work JSON | RFC 9457 404 Problem JSON | ORIGINAL_REQUEST.md §5 |
| 20 | API v1 | Tehran Midnight Daily (WS7) | Deterministic daily poem rotated at Tehran 00:00 | Date (Asia/Tehran) | Work JSON | Graceful fallback to default seed | ORIGINAL_REQUEST.md §5 |
| 21 | API v1 | Hafez Divination (WS7) | Divination endpoint with shahed and interpretation | User niyyat string | Ghazal + divination JSON | Validation error if prompt malformed | ORIGINAL_REQUEST.md §5 |
| 22 | Search | Hybrid Lexical-Semantic Search (WS8) | RRF combination of BM25F and vector search | Query string, filters | Ranked array of works | Automatic fallback to pure lexical | ORIGINAL_REQUEST.md §5, App D |
| 23 | Search | Rhyme Finder (WS8) | Rhyme search endpoint matching sound endings | Word string, optional meter | List of matching words / lines | Empty result set if no rhymes found | ORIGINAL_REQUEST.md §5 |
| 24 | Widget | `<persian-quote>` Component (WS10) | Lightweight Shadow DOM custom web component | HTML tag attributes | Encapsulated rendered quote widget | Fallback text if network unavailable | ORIGINAL_REQUEST.md §5, App D |
| 25 | Ecosystem | MCP Server (WS13) | Standard Model Context Protocol server over HTTP/stdio | JSON-RPC tool invocation | Tool execution JSON response | JSON-RPC standard error response | ORIGINAL_REQUEST.md §5 |
| 26 | Ecosystem | Typed SDKs (WS12) | TS and Python client packages with offline SQLite | API queries / offline calls | Typed model instances | Typed exception / error objects | ORIGINAL_REQUEST.md §5 |
| 27 | Governance | Farsi Changelog Compliance | Strict changelog formatting in `lib/changelog.ts` | Version metadata, changes | Array in `lib/changelog.ts` | Reject build if rules violated | AGENTS.md §1 |

---

### 4.3 Edge Cases Discovered

## Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Colophon Extraction | Poem ending with historical era year (e.g. 1364 Jalali vs 1985 Gregorian) | Year validated within plausible ranges (1250–1450 Jalali or 1850–2100 Gregorian); invalid numbers left in poem body. |
| 2 | Colophon Extraction | Place name preceding year without punctuation (e.g. "شیراز ۱۳۷۰") | Strict regex requires comma or separator; loose regex verifies trailing boundary to avoid stripping poetic words. |
| 3 | Excerpt Picker | Poem where total words <= `maxWords` | Returns entire poem without truncation; `cutStart` and `cutEnd` set to false. |
| 4 | Excerpt Picker | Window ending on conjunctions (`و`, `که`, `تا`, `یا`) or prepositions (`از`, `به`, `در`) | Scorer heavily penalizes window (-4 points), forcing expansion or contraction to natural grammatical boundary. |
| 5 | Excerpt Picker | Unbalanced quotation marks or brackets within window | Scorer penalizes unbalanced `« »` or `( )` (-3 points) to prevent orphaned quotation marks. |
| 6 | Letter Fingerprint | Poem processed by LLM that substitutes synonymous word or fixes alleged typo | Letter fingerprint comparison detects character difference and rejects LLM output entirely, falling back to heuristics. |
| 7 | Persian Normalizer | Diacritics (Erab: Tanween, Kasra, Damma, Fatha) in poem text | Retained by `normalizeDisplay` for authentic recitation; stripped by `normalizeSearch` for robust search matching. |
| 8 | Persian Normalizer | Kashida / Tatweel (U+0640) in source records | Completely stripped across all rendering and search layers per Acceptance Fixture A3. |
| 9 | Classical Structure | Ghazal beyt having 1 or 3 hemistichs due to bad data ingestion | Caught by Acceptance Fixture A3 scanner and flagged for quarantine; classical beyts must strictly have 2 hemistichs. |
| 10 | Legacy Endpoint | Client requesting `/api/quotes?lines=invalid_mode` | Defaults gracefully to `auto` mode without returning 400 error, preserving legacy client resilience. |
| 11 | Legacy Endpoint | High concurrency request spike for identical uncached quote | Request coalescing (single-flight) combines duplicate calls, executing only 1 upstream compute. |
| 12 | Search System | Semantic embedding service timeout (> 200 ms) | Circuit breaker triggers immediate fallback to pre-indexed BM25F lexical results within budget (<= 25 ms). |
| 13 | Date Rotation | Client requests `/v1/daily` during daylight savings shift in Tehran timezone | Uses IANA time zone identifier `Asia/Tehran` to calculate local calendar day independently of server UTC offset. |
| 14 | MCP Server | Streamable HTTP client disconnects mid-response | AbortSignal triggers immediate cancellation of in-flight vector search without leaking node process memory. |

---

## 5. Verification Method

To independently verify this specification inventory against the authoritative sources:
1. **Source Inspection**:
   - Inspect `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md` to verify all 15 workstreams (WS1–WS15), 7 phases (Phase 0–Phase 7), operating rules (R1–R22), acceptance fixtures (Appendix A), and performance budgets (Appendix D).
   - Inspect `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/AGENTS.md` to verify all 7 repository rules (Farsi changelog, no emojis, single footer, etc.).
   - Inspect `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/lib/engine/routes.ts` and `app/api/**` to verify all 14 legacy endpoints and query parameter signatures.
2. **Acceptance Test Validation**:
   - Run existing tests: `bun test` to establish current test baseline.
   - Verify that all 168 inventory features (F001–F168) map 1:1 with explicit requirements in `ORIGINAL_REQUEST.md` and `AGENTS.md`.
3. **Invalidation Conditions**:
   - Any omission of a workstream (WS1–WS15) or phase (Phase 0–Phase 7).
   - Any omission of an operating rule (R1–R22) or AGENTS.md rule.
   - Any omission of an acceptance fixture from Appendix A or performance budget from Appendix D.
   - Any undocumented legacy `/api/**` route or missing `/v1/**` specification.
