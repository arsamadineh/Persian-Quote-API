# E2E Test Suite Infrastructure & Architecture Specification

**Status**: Active  
**Authoritative Source**: `ORIGINAL_REQUEST.md`, `PROJECT.md`, `AGENTS.md`  
**Test Framework**: Bun Test (`bun test`)  
**Scope**: End-to-End Testing Track (Tiers 1 to 4)

---

## 1. Test Philosophy & Principles

### 1.1 Requirement-Driven & Opaque-Box Execution
The End-to-End (E2E) Test Track verifies the complete behavioral contract of the Persian Quote API platform strictly from the outside. 
1. **Opaque-Box Testing**: All test cases interact exclusively through public boundaries:
   - Web Standard HTTP interfaces (`Request` and `Response`).
   - HTTP status codes, headers (RFC 9457 `application/problem+json`, `ETag`, `Server-Timing`, `Cache-Control`), and response bodies.
   - Public query parameter matrices (`lines`, `line_origin`, `random`, `limit`, `page`, `poet`, `category`, `q`, etc.).
   - Standard build and evaluation CLI commands (`bun test`, `bun run data:validate`, `bun run build:data`).
   Internal private classes, unexported variables, or database internals are never accessed directly by E2E suites.
2. **Requirement-Driven**: Every assertion traces directly to explicit requirements defined in:
   - Non-negotiable operating rules R1 through R22 (`ORIGINAL_REQUEST.md` Section 2).
   - Repository governance rules 1 through 7 (`AGENTS.md`).
   - Appendix A acceptance fixtures (A1 Salman Harati, A2 Nader Naderpour, A3 Corpus-wide scans).
   - Appendix D performance and latency budgets (B1 through B14).
   - Legacy endpoint contracts (14 `/api/**` routes).
   - Modern API v1 contracts (13 `/v1/**` routes).
   - Multi-format bulk exports, Model Context Protocol (MCP) server, and Web Component (`<persian-quote>`).

### 1.2 Authoritative Expected Output Derivation
Every test assertion relies on an explicit, authoritative derivation mechanism rather than ad-hoc expectations:
- **Legacy Endpoint Oracle**: Derived from frozen original datasets (`lib/data/*.json`) and golden contract snapshots.
- **Linguistic and Structural Invariants**:
  - Letter-fingerprint immutability: `s.replace(/[\s\u200c*\/]+/g, '')` must remain byte-identical before and after structural processing.
  - Classical beyt constraint: Every classical beyt must have exactly two hemistichs.
  - Line cleaner invariants (`cleanLine`): Zero spaces before punctuation marks (`، ؛ ؟ ! . : ) »`), single space after punctuation when followed by letters, and zero Tatweel (U+0640) or directional marks (`\u200e`, `\u200f`).
- **Colophon Extraction Oracle**: Exact extraction of composition place and Jalali/Gregorian date, ensuring zero residual date or place tokens contaminate poem stanzas.
- **Deterministic Date Rotation**: Daily featured poem calculation strictly synchronized to Tehran midnight (`Asia/Tehran`).
- **Standardized Error Representation**: Strict schema compliance with RFC 9457 Problem Details for all 4xx and 5xx responses.

### 1.3 Adversarial Verification
The test suite includes dedicated adversarial vectors:
- **Encoding & Escaping Integrity**: Persian text containing complex ZWNJ sequences, Arabic diacritics (Erab), mixed bidirectional scripts (Persian and Latin), quotation glyphs (`« »`), and punctuation combinations.
- **Parameter Pollution & Boundary Stress**: Integer overflow, negative page/limit, malformed UTF-8 URI encoding, whitespace padding, duplicate keys, and invalid filter combinations.
- **Resource & Latency Guardrails**: Rate limiter token bucket depletion, circuit breaker tripping under simulated upstream failure, and cache stampede protection.

---

## 2. Test Tier Architecture & Coverage Model

The E2E Test Track is structured into four sequential tiers to guarantee exhaustive coverage. Every feature category requires a minimum of 11 distinct test cases across the tiers (minimum 5 in Tier 1, minimum 5 in Tier 2, plus pairwise combinations in Tier 3 and scenario workflows in Tier 4).

```
                      +------------------------------------------+
                      |       Tier 4: Real-World Scenarios       |
                      |   (Multi-step client & user workflows)   |
                      +------------------------------------------+
                                           ^
                                           |
                      +------------------------------------------+
                      |     Tier 3: Pairwise Combinations        |
                      |   (Cross-feature parameter matrix)       |
                      +------------------------------------------+
                                           ^
                                           |
                      +------------------------------------------+
                      |      Tier 2: Boundary & Corner Cases     |
                      |  (>=5 / feature: stress, error, edge)    |
                      +------------------------------------------+
                                           ^
                                           |
                      +------------------------------------------+
                      |       Tier 1: Feature Coverage           |
                      |   (>=5 / feature: happy-path & schema)   |
                      +------------------------------------------+
```

### 2.1 Tier Definitions

| Tier | Name | Target Ratio | Purpose |
|------|------|--------------|---------|
| **Tier 1** | Feature Coverage | >= 5 tests per feature group | Validates primary specifications, response schema compliance, required fields, and correct HTTP semantics. |
| **Tier 2** | Boundary & Corner Cases | >= 5 tests per feature group | Tests boundary values (min/max limits, pagination bounds), empty inputs, invalid formats, Persian linguistic edge cases, and RFC 9457 error contracts. |
| **Tier 3** | Pairwise Combinations | Cross-feature matrix | Tests interactions between orthogonal query parameters (e.g. `lines` x `limit` x `poet` x `random` x `cacheBust`), caching behavior under varied parameters, and rate limiting with cache hits. |
| **Tier 4** | Real-World Scenarios | Multi-step workflows | Simulates realistic client workflows: academic bulk downloads, student reading and divination rituals, dynamic website widget embedding, and search discovery sessions. |

---

## 3. Master Feature Mapping Matrix across All 4 Tiers

Below is the comprehensive mapping of platform features to E2E test cases across the four tiers.

### 3.1 Feature Group A: Legacy API Endpoints (14 Routes, Backward Compatibility)
- **Source**: `ORIGINAL_REQUEST.md` Section 2 (R6), Section 3, Section 5 (WS7)
- **Features**: `F006`, `F085`, `F145`
- **Applicable Routes**:
  1. `/api/quotes`
  2. `/api/quotes/hafez`
  3. `/api/quotes/non-poetry`
  4. `/api/quotes/shereno`
  5. `/api/quotes/search`
  6. `/api/quotes/category/[category]`
  7. `/api/quotes/[poet]`
  8. `/api/poets`
  9. `/api/categories`
  10. `/api/stats`
  11. `/api/health`
  12. `/api/embed`
  13. `/api/engine/benchmark`
  14. `/api/engine/stats`

| Tier | Test Suite Identifier | Description | Test Count |
|------|-----------------------|-------------|------------|
| **Tier 1** | `T1-LEGACY-01` to `T1-LEGACY-08` | Primary contract verification for `/api/quotes`, Hafez, Shereno, Non-Poetry, Poets, Categories, Stats, Health. Verifies `{ success: true, data, count, total }` structure and HTTP 200. | 8 |
| **Tier 2** | `T2-LEGACY-01` to `T2-LEGACY-08` | Missing poet handling, non-existent category 404/empty array, invalid `limit=abc`, extreme `limit=9999` capped at 100, invalid `page=0`, unknown query parameters ignored gracefully, malformed URI encoding. | 8 |
| **Tier 3** | `T3-LEGACY-01` to `T3-LEGACY-04` | Combinations of `poet` + `lines=raw|auto|separators` + `limit` + `page` + `random=true` on `/api/quotes`. | 4 |
| **Tier 4** | `T4-LEGACY-01` | Scenario: Legacy client consumer browsing quotes page by page, filtering by poet, fetching embed widget iframe, and inspecting engine stats. | 1 |
| **Total** | | | **21 tests** (>= 11 threshold satisfied) |

### 3.2 Feature Group B: Acceptance Fixtures (Appendix A)
- **Source**: `ORIGINAL_REQUEST.md` Appendix A (A1, A2, A3), Section 2 (R4)
- **Features**: `F004`, `F058`, `F152`, `F153`, `F154`

| Tier | Test Suite Identifier | Description | Test Count |
|------|-----------------------|-------------|------------|
| **Tier 1** | `T1-FIXTURE-A1` | Salman Harati colophon extraction: place `تنکابن`, Jalali date `1364/2/12`, Gregorian date `1985-05-02`. Verify none of place or date tokens appear in stanzas. Excerpt window with `maxWords=25` sets `cutEnd: true` with ellipsis. | 1 |
| **Tier 1** | `T1-FIXTURE-A2` | Nader Naderpour punctuation spacing: no space before `،`, single space after `،` (`همواره، در`). Origin and confidence preserved. Clean sentence boundaries. | 1 |
| **Tier 1** | `T1-FIXTURE-A3-SAMPLE` | Acceptance Fixture A3 clean baseline sample scanner: zero lines with leading/trailing whitespace, zero punctuation-only lines, zero spaces before `، ؛ ؟`, no U+0640. | 1 |
| **Tier 1** | `T1-FIXTURE-A3-CLASSICAL` | Acceptance Fixture A3 classical beyt 2-hemistich invariant across all 4,185 beyts in Divan-e Hafez (`hemistichs.length === 2`). | 1 |
| **Tier 1** | `T1-FIXTURE-A4` | Letter-fingerprint invariant verification on modern verse restructuring and directional marks (`\u200e\u200f`). | 1 |
| **Tier 1** | `T1-FIXTURE-A5` | Structural signal splitting: asterisks, newlines, multi-space, and slash separators. | 1 |
| **Tier 2** | `T2-FIXTURE-01` to `T2-FIXTURE-05` | Boundary colophon dates (1250 vs 1450 Jalali boundaries, non-plausible years), single-word poems, poems with zero punctuation, poems with mixed digits, excerpt window spanning exact word boundaries. | 5 |
| **Tier 3** | `T3-FIXTURE-01` to `T3-FIXTURE-02` | Colophon extraction paired with dual rendering (`lines=auto` vs `lines=raw`) and excerpt generation. | 2 |
| **Tier 4** | `T4-FIXTURE-01` | Scenario: Ingesting raw unstructured modern poem, validating letter-fingerprint immutability, isolating colophon, formatting stanzas, and rendering excerpt. | 1 |
| **Total** | | | **13 tests** (>= 11 threshold satisfied) |

### 3.3 Feature Group C: Core Engine, Routing, Cache & Protection (WS6, WS7)
- **Source**: `ORIGINAL_REQUEST.md` Section 5 (WS6), Appendix D (B1, B2, B3)
- **Features**: `F077`, `F078`, `F079`, `F080`, `F081`, `F082`, `F083`, `F155`, `F156`, `F157`

| Tier | Test Suite Identifier | Description | Test Count |
|------|-----------------------|-------------|------------|
| **Tier 1** | `T1-ENGINE-01` to `T1-ENGINE-05` | Exact static route matching, dynamic route matching (`/api/quotes/[poet]`), cache hit retrieval, rate limiter token consumption under limit, circuit breaker healthy execution. | 5 |
| **Tier 2** | `T2-ENGINE-01` to `T2-ENGINE-05` | Route mismatch 404, unsupported HTTP method 404/405, cache eviction under LRU cap, rate limiter threshold exceedance and recovery, circuit breaker transition to OPEN after consecutive failures. | 5 |
| **Tier 3** | `T3-ENGINE-01` to `T3-ENGINE-02` | Rate limiter behavior across cached vs uncached requests; concurrent requests against identical cache key (request coalescing verification). | 2 |
| **Tier 4** | `T4-ENGINE-01` | Scenario: High-concurrency traffic burst hitting cached endpoint, observing latency stability, triggering rate limit protection, and recovering cleanly. | 1 |
| **Total** | | | **13 tests** (>= 11 threshold satisfied) |

### 3.4 Feature Group D: Persian Linguistics, Typography & Line Formatting (WS2, WS3)
- **Source**: `ORIGINAL_REQUEST.md` Section 2 (R13), Section 5 (WS2, WS3)
- **Features**: `F013`, `F046`, `F047`, `F050`, `F052`, `F057`, `F060`

| Tier | Test Suite Identifier | Description | Test Count |
|------|-----------------------|-------------|------------|
| **Tier 1** | `T1-PERSIAN-01` to `T1-PERSIAN-05` | Arabic Yeh/Kaf normalization to Persian (`ی`, `ک`), digit conversion (Persian/Arabic to ASCII and vice-versa), punctuation spacing rules, asterisk stanza separation, double-space line breaking. | 5 |
| **Tier 2** | `T2-PERSIAN-01` to `T2-PERSIAN-05` | Zero-width non-joiner (ZWNJ) boundary retention in compound words (`می‌رود`, `خانه‌ها`), stripping of invisible directional marks (`\u200e`, `\u200f`), handling of quotation marks (`« »`), string starting/ending with punctuation, empty string handling. | 5 |
| **Tier 3** | `T3-PERSIAN-01` to `T3-PERSIAN-02` | Interaction between typography normalization and line reconstruction; search query normalization paired with fuzzy query variants. | 2 |
| **Tier 4** | `T4-PERSIAN-01` | Scenario: User searching Persian poetry using romanized Finglish input, retrieving properly formatted RTL verse with correct line breaks and typography. | 1 |
| **Total** | | | **13 tests** (>= 11 threshold satisfied) |

### 3.5 Feature Group E: Modern API v1 Endpoints (13 Endpoints, RFC 9457)
- **Source**: `ORIGINAL_REQUEST.md` Section 5 (WS7), Appendix D
- **Features**: `F086` to `F099` (Targeted for Progressive Enablement in Milestone 3)
- **Endpoints**: `/v1/works`, `/v1/works/{id}`, `/v1/works/random`, `/v1/daily`, `/v1/fal`, `/v1/poets`, `/v1/poets/{id}`, `/v1/collections`, `/v1/collections/{id}`, `/v1/suggest`, `/v1/rhymes`, `/v1/meta`, `/v1/health`.

| Tier | Test Suite Identifier | Description | Test Count |
|------|-----------------------|-------------|------------|
| **Tier 1** | `T1-V1-01` to `T1-V1-13` | Contract and schema verification for all 13 modern `/v1/**` endpoints. | 13 |
| **Tier 2** | `T2-V1-01` to `T2-V1-08` | Non-existent work ID returning RFC 9457 `application/problem+json` 404, invalid date format, invalid filter enum, negative offset. | 8 |
| **Tier 3** | `T3-V1-01` to `T3-V1-04` | Cross-filtering works by poet + collection + meter + era; caching headers (`ETag`, `Server-Timing`) under variable headers. | 4 |
| **Tier 4** | `T4-V1-01` | Scenario: Complete reader experience from `/v1/daily` to poet exploration, collection inspection, and reciting Hafez fal. | 1 |
| **Total** | | | **26 tests** (>= 11 threshold satisfied) |

### 3.6 Summary of Total Planned Coverage

| Feature Group | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Total Tests |
|---------------|--------|--------|--------|--------|-------------|
| Legacy API Contracts | 8 | 8 | 4 | 1 | 21 |
| Acceptance Fixtures (A1-A3) | 6 | 5 | 2 | 1 | 14 |
| Core Engine & Protection | 6 | 5 | 2 | 1 | 14 |
| Persian Linguistics & Typography | 5 | 5 | 2 | 1 | 13 |
| Modern API v1 (Progressive M3) | 13 | 8 | 4 | 1 | 26 |
| **Grand Total** | **38** | **31** | **14** | **5** | **88** |

---

## 4. Test Harness & Runner Architecture

### 4.1 Harness Design (`tests/e2e/harness.ts`)
The E2E test harness provides a unified HTTP abstraction layer:
1. **Mode A: In-Memory Adapter Mode (Default)**:
   - Dispatches Web Standard `Request` instances directly to `createNextHandler(engine)`.
   - Executes the complete HTTP lifecycle: route parsing, query extraction, header normalization, middleware, cache lookup, engine execution, serialization, and status code generation.
   - Zero network overhead; runs in milliseconds under `bun test`.
2. **Mode B: Remote Network Mode (`TEST_BASE_URL`)**:
   - When environment variable `TEST_BASE_URL` (e.g. `http://localhost:3000` or staging URL) is present, the harness dispatches requests via native `fetch()` over HTTP/HTTPS.
   - Enables CI testing against real live server instances, Cloudflare Workers, or Docker containers without changing test code.

### 4.2 Standard Matchers & Helper Utilities
The harness provides domain-specific assertion helpers:
- `expectJsonSuccess(res, status = 200)`: Asserts HTTP status and `{ success: true }`.
- `expectValidProblemDetails(res, status, title)`: Asserts RFC 9457 `application/problem+json` structure.
- `expectValidPersianTypography(text)`: Asserts no space before punctuation (`، ؛ ؟ ! . : ) »`), no raw Tatweel (`\u0640`), and valid NFC form.
- `expectLetterFingerprintPreserved(original, transformed)`: Asserts letter-fingerprint identity per R4.

### 4.3 Test Directory Layout
```
tests/e2e/
├── harness.ts                     # Web Standard HTTP client, helpers, matchers
├── runner.ts                      # Standalone test runner and metrics reporter
├── tier1-features/                # Tier 1: Functional coverage (>= 5 / feature)
│   ├── legacy-quotes.test.ts      # Legacy quote endpoints (/api/quotes/**)
│   ├── legacy-poets-categories.test.ts # Poets, categories, metadata
│   ├── legacy-engine-health.test.ts    # Stats, health, benchmark
│   ├── acceptance-fixtures.test.ts     # A1, A2, A3 acceptance criteria
│   └── error-contracts.test.ts         # Base error handling and status codes
├── tier2-boundaries/              # Tier 2: Boundary, corner, and stress cases
│   ├── pagination-boundaries.test.ts   # Page, limit, offset extremes
│   ├── typography-bidi-boundaries.test.ts # Diacritics, ZWNJ, Tatweel, punctuation
│   └── parameter-pollution.test.ts     # Malformed query strings, invalid types
├── tier3-combinations/            # Tier 3: Pairwise parameter matrices
│   ├── query-matrix.test.ts            # Matrix of lines x poet x limit x random
│   └── cache-rate-limits.test.ts       # Cache hit vs rate limiting interaction
└── tier4-scenarios/               # Tier 4: Real-world client workflows
    ├── daily-hafez-workflow.test.ts    # Daily poem and divination user flow
    └── reader-discovery-workflow.test.ts # Poet exploration and quote discovery
```

---

## 5. Milestone Progressive Testability Matrix

To satisfy the progressive testability constraint ("tests must be verifiable using ONLY features from the current milestone and its completed dependencies"), test execution is gated by milestone capability:

| Test Suite File | Milestone 0 (Current) | Milestone 1 | Milestone 2 | Milestone 3 | Milestone 4+ |
|---|:---:|:---:|:---:|:---:|:---:|
| `tests/e2e/tier1-features/legacy-quotes.test.ts` | Active | Active | Active | Active | Active |
| `tests/e2e/tier1-features/legacy-poets-categories.test.ts` | Active | Active | Active | Active | Active |
| `tests/e2e/tier1-features/legacy-engine-health.test.ts` | Active | Active | Active | Active | Active |
| `tests/e2e/tier1-features/acceptance-fixtures.test.ts` | Active | Active | Active | Active | Active |
| `tests/e2e/tier1-features/error-contracts.test.ts` | Active | Active | Active | Active | Active |
| `tests/e2e/tier2-boundaries/pagination-boundaries.test.ts` | Active | Active | Active | Active | Active |
| `tests/e2e/tier2-boundaries/typography-bidi-boundaries.test.ts` | Active | Active | Active | Active | Active |
| `tests/e2e/tier2-boundaries/parameter-pollution.test.ts` | Active | Active | Active | Active | Active |
| `tests/e2e/tier3-combinations/query-matrix.test.ts` | Active | Active | Active | Active | Active |
| `tests/e2e/tier3-combinations/cache-rate-limits.test.ts` | Active | Active | Active | Active | Active |
| `tests/e2e/tier4-scenarios/daily-hafez-workflow.test.ts` | Active | Active | Active | Active | Active |
| `tests/e2e/tier4-scenarios/reader-discovery-workflow.test.ts` | Active | Active | Active | Active | Active |
| `tests/e2e/tier1-features/modern-v1-works.test.ts` | Planned | Planned | Planned | Active | Active |
| `tests/e2e/tier1-features/search-hybrid.test.ts` | Planned | Planned | Planned | Planned | Active |

All active Milestone 0 test suites pass completely under `bun test`.

### 5.1 Acceptance Fixture A3 Progressive Gating Specification
Acceptance Fixture A3 specifies corpus-wide typographic and structural invariants. In accordance with the progressive testability principle and Rule R5 (legacy data immutability), A3 testing is phased across milestones:

1. **Milestone 0 (Phase 0 - Recon & Safety Net)**:
   - `T1-FIXTURE-A3-SAMPLE` verifies that clean baseline poetry records strictly satisfy all A3 typographic invariants (zero leading/trailing whitespace, zero digit/punctuation-only lines, zero spaces before `، ؛ ؟`, zero Tatweel `\u0640`, and no raw ` / ` inside rendered lines).
   - `T1-FIXTURE-A3-CLASSICAL` asserts the classical beyt invariant across all 497 ghazals in Divan-e Hafez (4,185 total beyts) and curated classical couplets, verifying 100% of beyts split into exactly two hemistichs (`hemistichs.length === 2`).
   - Per Rule R5, legacy JSON files in `lib/data/*.json` remain frozen byte-for-byte in Phase 0. Known baseline defects in legacy records (1,548 punctuation errors, 114 Tatweels, 42 colophon date leaks) are documented in `00-recon.md` and quarantined for Phase 2 data cleaning.
2. **Milestone 2 (Phase 2 - Canonical Data & Structure Engine)**:
   - `T1-FIXTURE-A3-FULL` activates as the Phase 2 exit gate, executing full corpus validation across 100% of migrated canonical records in `data/canonical/` produced by `bun run build:data`.
   - Validates that WS1 migration, WS2 normalizers (`cleanLine`, `normalizeDisplay`), and WS3 colophon extraction have eliminated all 1,548 punctuation defects, all 114 Tatweels, and isolated all colophon lines into structured metadata.

---

## 6. How to Run E2E Tests

### 6.1 Standard Bun Test Execution
Run all project tests, including the E2E suite:
```bash
bun test
```

Run only the E2E test track:
```bash
bun test tests/e2e/
```

Run a specific tier:
```bash
bun test tests/e2e/tier1-features/
bun test tests/e2e/tier2-boundaries/
bun test tests/e2e/tier3-combinations/
bun test tests/e2e/tier4-scenarios/
```

### 6.2 Dedicated E2E Runner
Execute via the standalone runner script:
```bash
bun run tests/e2e/runner.ts
```

Against a running network server:
```bash
TEST_BASE_URL=http://localhost:3000 bun run tests/e2e/runner.ts
```
