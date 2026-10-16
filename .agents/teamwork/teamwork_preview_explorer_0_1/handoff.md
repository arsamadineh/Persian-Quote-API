# Handoff Report: Persian-Quote-API Codebase & Architecture Survey

## 1. Observation

### 1.1 Repository Structure, Tooling, and Configuration

- **Package Identity & Environment**:
  - `package.json:2`: `"name": "my-v0-project"`, `"version": "0.1.0"`.
  - Next.js version: `15.2.8` (`package.json:52`).
  - React version: `^19` (`package.json:55, 58`).
  - Runtime & Testing: `bun test` v1.4.3 (`package.json:10`).
  - Tailwind CSS: v4 (`@tailwindcss/postcss: ^4.1.9`, `tailwindcss: ^4.1.9`).
  - TypeScript: v5, Target: ES6, Module: ESNext (`tsconfig.json:5, 10`). Path alias `@/*` -> `./*` (`tsconfig.json:22`).
- **Build Configurations (`next.config.mjs`)**:
  - `eslint: { ignoreDuringBuilds: true }` (`next.config.mjs:3-5`).
  - `typescript: { ignoreBuildErrors: true }` (`next.config.mjs:6-8`).
  - `headers()`: Applies `X-Frame-Options: SAMEORIGIN` across `/(.*)` (`next.config.mjs:20`). This conflicts with cross-origin iframe embedding via `/embed` and `/api/embed`.
  - `redirects()`: Redirects `/robots.txt` to `/robots` (`next.config.mjs:57`).
- **Directory Layout**:
  - `app/`: Next.js App Router containing 9 main pages (`/`, `/docs`, `/examples`, `/embed`, `/sakhtar`, `/contribute`, `/changelog`, `/privacy`, `/terms`) and 14 API route handlers (`app/api/**`).
  - `components/`: UI components (`ui/` with 13 Radix primitives), `quote-cards/` (`quote-card.tsx`, `quote-widget.tsx`), `command-bar.tsx`, `ai-prompts.tsx`, `code-block.tsx`, `navbar.tsx`, `footer.tsx`.
  - `public/`: 13 assets including SVGs (`banner.svg`, `og-image.svg`, `twitter-card.svg`, `engine-*.svg`), raw data files (`hafez.txt`, `shereno.csv`), and placeholder files (`placeholder-logo.png`, `placeholder-logo.svg`, `placeholder-user.jpg`, `placeholder.jpg`, `placeholder.svg`). Missing referenced icons: `favicon-32x32.png`, `favicon-16x16.png`, `apple-icon.svg`.
  - `lib/data/`: Static JSON datasets (`hafez.json`, `shereno.json`, `poetry-quotes.json`, `non-poetry-quotes.json`), unified store (`store.ts`), line reconstruction (`poem-lines.ts`).
  - `lib/engine/`: Custom Tigh engine (v0.0.1-beta) with router, cache, rate limiter, circuit breaker, metrics, middleware, and Next.js adapter.
  - `tests/`: 3 Bun test files (`engine.test.ts`, `poem-lines.test.ts`, `store.test.ts`) covering 30 passing tests.
  - `scripts/`: Data ingestion scripts (`parse_hafez.py`, `convert-shereno.py`, `extract_quotes.py`) and benchmark script (`bench-search.ts`).

---

### 1.2 Data Store Architecture (`lib/data/store.ts` & JSON Datasets)

- **Dataset Counts Measured via Runtime Inspection**:
  - `hafez.json`: 497 items (complete ghazals, each with an array of couplets `verses`). File size: 679 KB.
  - `shereno.json`: 4,400 items (`id`, `poem`, `poet`, `title`, `book`). File size: 5.8 MB.
  - `non-poetry-quotes.json`: 494 raw items (`id`, `body`, `author`, `author_english`, `category`, `tags`). On load, 2 items are dropped (1 duplicate, 1 missing required field) -> 492 active items (`store.ts:370-410`). File size: 210 KB.
  - `poetry-quotes.json`: Exactly 7 items (`id` 1 to 7: Rumi, Hafez, Saadi, Ferdowsi). File size: 3.1 KB.
  - **Total active records loaded into memory**: 497 + 4,400 + 492 + 7 = **5,396 records** (5,398 raw).
  - *Discrepancy*: `ARCHITECTURE.md:26` claims `poetry-quotes.json` contains "over 4,100 couplets and classical quotes" ("بیش از ۴۱۰۰ بیت و گزیده‌شعر کلاسیک"). In reality, the file contains only 7 items.
- **Normalization Logic (`store.ts:145-188`)**:
  - Strips ZWNJ (نیم‌فاصله `\u200c` -> `""`, line 155).
  - Strips zero-width space `\u200b`, directional marks `\u200e`, `\u200f`, `\u202a-\u202e` (lines 154-163).
  - Normalizes `ي` and `ى` to `ی`, `ك` to `ک`, `ة` and `ۀ` to `ه` (lines 148-152).
  - Normalizes Persian (`۰-۹`) and Arabic (`٠-٩`) digits to ASCII `0-9` (lines 170-173).
  - Replaces all non-letter, non-digit punctuation with spaces: `replace(NON_TOKEN_RE, " ")` (`store.ts:185`).
  - Search fields are stored non-enumerably on `NormalizedQuote` via `Symbol("scoreFields")` containing `headLength`, `authorTarget`, `titleTarget`.
- **Display Layer Presentation (`store.ts:481-495`)**:
  - `presentQuote(quote, mode)`: Removes internal `search` field. Calls `layoutFor(quote, mode)`.
  - `layoutFor` operates **only** on `quote.kind === "shereno"`. For `poetry`, `hafez`, and `non-poetry`, `layoutFor` returns `null`.
  - For `hafez`, lines in `store.ts:344-346` are created as `verses.map(v => v.join(" / ")).join("\n")`, leaving raw `" / "` inside the string.
  - For `non-poetry`, raw strings are returned without whitespace collapse or punctuation cleanup.
- **Poem Line Engine (`lib/data/poem-lines.ts`)**:
  - `analyzePoem(raw)`: Identifies stanzas by `STANZA_RUN = /\s*\*+\s*/g` and lines by `WIDE_SPACE_RUN = /[ \t\u00a0]{2,}/g`.
  - `reconstructLines(text)`: Dynamic programming algorithm minimizing `(length - TARGET_LINE_LENGTH)^2` where `TARGET_LINE_LENGTH = 24`, `MIN_LINE_LENGTH = 8`, `MAX_LINE_LENGTH = 64` (lines 135-139). Enforces that lines do not end on `INSEPARABLE_END = ["می", "نمی", "بی"]` or start on `INSEPARABLE_START = ["را", "است", "هست", "نیست", "بود", "شد", "تر", "می", "نمی", "بی"]`. Penalizes `AWKWARD_LINE_END = ["و", "که", "به", "از", "در", ...]` and rewards punctuation ends.
  - In `WeakMap` cache (`layoutCache`), layout is computed lazily per quote and line mode (`auto`, `separators`, `raw`).

---

### 1.3 Engine Architecture (`lib/engine/` — Tigh v0.0.1-beta)

- **Router (`lib/engine/router.ts`)**:
  - Method-keyed Trie (`Map<HttpMethod, TrieNode>`).
  - Supports static segments, parameter segments (`[param]`), and wildcards (`*`).
  - Does not pre-compile regexes or radix tables; splits path on `/` on every match request (`router.ts:68`).
- **Cache (`lib/engine/cache.ts`)**:
  - Configured with `maxSize: 5000`, `defaultTTL: 30000ms`, `checkInterval: 15000ms` in `instance.ts:9-13`.
  - Cache touch eviction: `touch(key)` performs `accessOrder.splice(idx, 1)` followed by an `O(N)` loop updating indices in `this.accessIndex` (`cache.ts:46-55`).
  - *Discrepancy*: `ARCHITECTURE.md:112` states the cache is a "doubly-linked list LRU" ("جدول درهم‌سازی متصل به لیست پیوندی دوطرفه"). The actual implementation uses `Array.splice` with an `O(N)` re-indexing loop.
- **Rate Limiter (`lib/engine/rate-limiter.ts`)**:
  - Supports 3 strategies: `token-bucket` (default in instance), `sliding-window`, `fixed-window`.
  - Configured to 120 requests per 60,000 ms per IP key (`instance.ts:15-18`).
  - Cleans up stale buckets every 2x window.
- **Circuit Breaker (`lib/engine/circuit-breaker.ts`)**:
  - 3-state state machine: `closed`, `open`, `half-open`.
  - Threshold: 5 consecutive failures trips circuit to `open`. Recovery timeout: 30,000 ms. Half-open attempts: 3.
  - When open, throws `CircuitOpenError` returning HTTP 503 with `Retry-After` header.
- **Metrics (`lib/engine/metrics.ts`)**:
  - Ring buffer of 10,000 latencies using `Float64Array`. Calculates P50, P90, P95, P99, avg, min, max.
  - Counts requests by method, HTTP status, and path.
  - Tracks cache hit/miss ratio, memory bytes, and rate-limit reject counts.
  - Scope: Explicitly scoped to a single process instance (`collectionScope: 'process-instance'`, line 118).
- **Middleware & Pipeline (`lib/engine/middleware.ts`)**:
  - `corsMiddleware`: Handles `OPTIONS` (204) and injects `Access-Control-Allow-Origin: *`.
  - `timingMiddleware`: Calculates execution duration and sets `X-Response-Time` and `X-Request-Id`.
  - `compressMiddleware`: Defines Gzip compression using `CompressionStream`. **However**, this middleware is never registered or called in `engine.ts` or `instance.ts`.
- **Next.js Adapter (`lib/engine/adapter-next.ts`)**:
  - `createNextHandler(engine)` wraps Next.js App Router Request/Response, passes method, query parameters, path, headers, and client IP (`x-forwarded-for` / `x-real-ip`) to `engine.handle()`.

---

### 1.4 API Endpoints Inventory & Contracts

All endpoints live under `app/api/**` and delegate to `engine` via `createNextHandler(engine)` (except `app/api/embed/route.tsx`, which implements a standalone handler).

| Endpoint | Method | Query Parameters | Response Body Structure | Caching Headers | Error Response |
|---|---|---|---|---|---|
| `/api/quotes` | GET | `poet`, `lines` (`auto`, `separators`, `raw`), `limit` (default 10, max 100), `page` (default 1), `random` (`true`/`false`) | `{ success: true, data: [...], count, total, page, limit, line_mode }`. If `poet` is omitted, returns only 7 quotes from `poetry`. | `public, s-maxage=60, stale-while-revalidate=300` (or `no-store` if `random=true`) | 404/503 from engine |
| `/api/quotes/[poet]` | GET | `lines`, `limit`, `page`, `random` | `{ success: true, data: [...], count, total, page, limit, line_mode, poet }` | `s-maxage=60, stale-while-revalidate=300` | 404/503 |
| `/api/quotes/category/[category]` | GET | `lines`, `limit`, `page`, `random` | `{ success: true, data: [...], count, total, page, limit, line_mode, category }` (if category is "عرفان" or "عشق", appends top 50 hafez ghazals) | `s-maxage=60, stale-while-revalidate=300` | 404/503 |
| `/api/quotes/hafez` | GET | `id` (integer), `q`/`query` (substring search), `lines`, `limit`, `page`, `random` | `{ success: true, data: [...], count, total, page, limit, line_mode }` | `s-maxage=60, stale-while-revalidate=300` | 404/503 |
| `/api/quotes/shereno` | GET | `poet`, `title`, `lines`, `limit`, `page`, `random` | `{ success: true, data: [...], count, total, page, limit, line_mode, meta: { note } }` | `s-maxage=60, stale-while-revalidate=300` | 404/503 |
| `/api/quotes/non-poetry` | GET | `author`, `lines`, `limit`, `page`, `random` | `{ success: true, data: [...], count, total, page, limit, line_mode, meta: { raw, dropped, note } }` | `s-maxage=60, stale-while-revalidate=300` | 404/503 |
| `/api/quotes/search` | GET | `q`/`query`, `lines`, `limit`, `page`, `random` | `{ success: true, data: [...], count, total, page, limit, line_mode, query }` | `s-maxage=60, stale-while-revalidate=300` | 404/503 |
| `/api/poets` | GET | none | `{ success: true, data: [{ id: number, name_persian, name_english, birth_year, death_year, biography_persian, biography_english, image_url, quote_count }], count }` (No pagination support) | `s-maxage=60, stale-while-revalidate=300` | 404/503 |
| `/api/categories` | GET | none | `{ success: true, data: [{ id: number, name_persian, name_english, description_persian, description_english, quote_count }], count }` (Derived only from 7 poetry items; no pagination) | `s-maxage=60, stale-while-revalidate=300` | 404/503 |
| `/api/stats` | GET | none | `{ success: true, data: { poetry, hafez, nonPoetry, nonPoetryRaw, nonPoetryDropped, shereno, total }, engine: {...}, dataIntegrity: {...} }` | `no-store` | 404/503 |
| `/api/health` | GET | none | `{ success: true, data: { status: "ok", engine: "تیغ/0.0.1-beta", instanceId, uptimeMs, datasets: {...}, cache: {...}, timestamp } }` | `no-store` | 404/503 |
| `/api/engine/stats` | GET | none | Live breakdown of instance metrics, latency percentiles, cache, rate limits | `no-store`, `X-Engine: tigh/0.0.1-beta` | 404/503 |
| `/api/engine/benchmark` | GET | `iterations` (1-10000, default 1000) | Microbenchmark of router match and synthetic cache set/get ns/op | `no-store`, `X-Engine: tigh/0.0.1-beta` | 404/503 |
| `/api/embed` | GET | `theme`, `size`, `poet`, `category`, `english`, `source`, `category_badge`, `auto_refresh`, `refresh_interval` | Full standalone HTML page with inline CSS and `<script>` reload | `Content-Type: text/html; charset=utf-8` | 404 JSON `{ error: "شاعر یا دسته‌بندی مورد نظر یافت نشد" }` |

---

### 1.5 Verification of Known Defects D1 – D20

Every defect listed in Section 3 of `ORIGINAL_REQUEST.md` was investigated and verified directly in the codebase:

| Defect ID | Description | Code Location | Direct Evidence / Verification | Status |
|---|---|---|---|---|
| **D1** | Footer leaks into poem body (تنکابن، 12/2/1364 rendered as poem lines) | `lib/data/poem-lines.ts:87-128`, `lib/data/shereno.json:4160, 4164` | In poem id 4160 (Salman Harati), poem text ends in `"مزردشت، تنکابن، 1/1/1363"`. `layoutPoem(p.poem, "auto")` returns lines array ending in `LAYOUT lines tail: [ ..., "مزردشت، تنکابن، 1/1/1363" ]`. 25+ poems in `shereno.json` exhibit this leak. | **Verified** |
| **D2** | Raw gaps inside rendered lines (double spaces survive) | `lib/data/store.ts:375-410`, `lib/data/non-poetry-quotes.json` | 21 quotes in `presentQuote` contain raw double spaces, e.g. `np-80`: `"مانند آسمان باش، یا با خورشید و روز یا با  ماه و شب..."`. No whitespace collapse is performed outside of shereno reconstruction. | **Verified** |
| **D3** | Punctuation spacing (space before comma) | `lib/data/store.ts:375-410`, `lib/data/non-poetry-quotes.json:169` | 9 quotes contain space before comma in `presentQuote`, e.g. `np-169`: `"برای بهترین ایده منتظر نمان ، ایده بهتر را انجام بده ،..."`. `cleanLine` is not run on classical or prose texts. | **Verified** |
| **D4** | Line breaks are guessed with ~24 chars/line target | `lib/data/poem-lines.ts:135` | `const TARGET_LINE_LENGTH = 24; const MIN_LINE_LENGTH = 8; const MAX_LINE_LENGTH = 64;` used in DP cost calculation: `cost = base + (length - TARGET_LINE_LENGTH) ** 2`. Artificially fragments unstructured poetry. | **Verified** |
| **D5** | Widget truncation is naive (can start mid-sentence, end on dangling word) | `app/api/embed/route.tsx:8-20` (`trimPoem`) | Line 8: `trimPoem(text, maxLines, maxChars)` cuts off at `kept.length >= maxLines \|\| used + line.length > maxChars`. Returns `kept.join("\n") + "…"`. Blindly truncates from beginning; can terminate on conjunctions or dangling prepositions. | **Verified** |
| **D6** | Serverless state is per-instance | `lib/engine/instance.ts:4`, `lib/engine/metrics.ts:118` | In-memory singleton `engine = new Tigh(...)`. Metrics explicitly return `collectionScope: 'process-instance'`. When deployed on Vercel serverless, each execution container has isolated cache, rate limiters, and metrics. | **Verified** |
| **D7** | Substring search only | `lib/data/store.ts:790`, `lib/data/store.ts:702, 739` | Search is evaluated via `item.search.indexOf(term)` (`store.ts:790`) and `data.filter(g => g.search.includes(q))` (`store.ts:702`). No inverted index, no tokenization, no BM25 or semantic embeddings. | **Verified** |
| **D8** | Inconsistent response shapes | `lib/engine/routes.ts:70-192`, `app/api/embed/route.tsx:48-57` | `/api/quotes` has `line_mode`; `/api/quotes/non-poetry` adds `meta: { raw, dropped, note }`; `/api/quotes/search` adds `query`; `/api/poets` omits `total`/`page`/`limit` and uses integer IDs (`1`) whereas quotes use string IDs (`"p-1"`). Embed returns non-standard error JSON. | **Verified** |
| **D9** | Over-aggressive normalization destroying display fidelity | `lib/data/store.ts:151-155, 185`, `tests/store.test.ts:18-20` | `store.ts:155` maps `"\u200c": ""` (deleting ZWNJ). `store.ts:152` maps `"ۀ": "ه"` (destroying ezafe). `NON_TOKEN_RE` deletes all punctuation. `tests/store.test.ts:19` explicitly tests and asserts this flaw: `expect(normalizeText("می‌روم")).toBe("میروم")`. | **Verified** |
| **D10** | Blanket "Public Domain" claim unverified for modern poets | `README.md:239`, `app/terms/layout.tsx:9, 16`, `app/llms.txt.ts:37` | Unconditionally claims all dataset content is "Public Domain" (`مالکیت عمومی`), while corpus includes 20th-century poets protected under 50-year copyright (Salman Harati d. 1986, Sohrab Sepehri d. 1980, Mehdi Akhavan-Sales d. 1990, Ahmad Shamlou d. 2000, Yadollah Royaee d. 2022). | **Verified** |
| **D11** | Contribution flow builds SQL for nonexistent database | `app/contribute/page.tsx:61-78` | Generates SQL statements `INSERT INTO public.poets...` and `INSERT INTO public.persian_quotes...` directed at `scripts/contributions/quote_[timestamp].sql`. No PostgreSQL/Supabase database exists; the entire platform runs on static JSON files. | **Verified** |
| **D12** | Placeholder and obsolete tags in HTML head | `app/layout.tsx:199-203, 215-217, 228-231` | `google-site-verification: verification_token_placeholder`, `msvalidate.01: bing_verification_token_placeholder`, `yandex-verification: yandex_verification_token_placeholder`. Obsolete tags: `HandheldFriendly`, `MobileOptimized`. Icons `favicon-32x32.png` and `apple-icon.svg` return 404. | **Verified** |
| **D13** | Personal paths hardcoded in docs prompts | `components/ai-prompts.tsx:31, 67`, `lib/docs-index.ts:404`, `scripts/extract_quotes.py:5-6` | Local developer filesystem path `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API` is hardcoded into user-facing AI prompts and copy. | **Verified** |
| **D14** | Fake/stale latency numbers | `ARCHITECTURE.md:13`, `lib/changelog.ts:67, 230` | Docs claim "زمان پاسخ به زیر یک میلی‌ثانیه برسد" and changelog claims "کاهش از ۱۵۵ میلی‌ثانیه به کسر میلی‌ثانیه" without benchmark environments, hardware parameters, or repeatable artifacts. | **Verified** |
| **D15** | Docs inaccuracies | `ARCHITECTURE.md:26, 112`, `README.md:72-88`, `app/layout.tsx:319` | Architecture claims `poetry-quotes.json` has 4,100+ items (actual: 7). README shows mock response with integer `id: 1` (actual: `"p-1"` with extra fields). Architecture claims doubly-linked list LRU cache (actual: `Array.splice`). Layout claims software version `3.1.2` (actual: `0.1.0`). | **Verified** |
| **D16** | No stable IDs, no versioning, no citation | `lib/data/store.ts:320, 348, 392, 433` | Record IDs are transient scraped row prefixes (`p-1`, `h-1`, `np-1`, `sn-1`). No hierarchical canonical IDs (`poet.work.number`). No `/v1/` route prefix. No `CITATION.cff`, BibTeX, or Zenodo DOI metadata. | **Verified** |
| **D17** | Inadequate pagination contract | `lib/data/store.ts:639-658, 835-893` | `paginate` returns `count` (current slice length) and `total`, but lacks `has_more`, `next_cursor`, or `total_pages`. Returns invalid `page` metadata during random sampling. `/api/poets` and `/api/categories` lack pagination entirely. | **Verified** |
| **D18** | Ad hoc error format | `lib/engine/router.ts:23-27`, `lib/engine/engine.ts:100-103, 177`, `app/api/embed/route.tsx:48-57` | No RFC 9457 `application/problem+json`. Endpoints return conflicting error schemas (`{ error, message }` vs `{ error }`). | **Verified** |
| **D19** | No ETag, Server-Timing, or precompression | `lib/engine/routes.ts`, `lib/engine/middleware.ts:99-155` | Search for `ETag` and `Server-Timing` yields 0 matches in the repository. `compressMiddleware` exists as unused dead code in `middleware.ts`. | **Verified** |
| **D20** | Single origin reachability issues for Iranian universities | `next.config.mjs`, `app/layout.tsx:19` | Sole deployment target is `pq.arsamadineh.ir` on Vercel Anycast edge. Vercel IPs frequently experience DNS filtering and routing degradation in Iranian academic (.ac.ir) and NIN networks; no domestic or secondary origin mirrors exist. | **Verified** |

---

## 2. Logic Chain

1. **Premise 1 (Data Layer Fragility)**: Observations in 1.2 demonstrate that data is loaded synchronously into JavaScript heap from four disparate JSON files without schema enforcement (Zod), validation, or formal indexing. One file (`poetry-quotes.json`) is essentially a stub of 7 items despite documentation claiming 4,100+ items.
2. **Premise 2 (Persian Text Incoherence)**: Observations in 1.2 and D9 show that text normalization is currently monolithic. By deleting ZWNJ (`\u200c`), substituting `ۀ` with `ه`, and stripping all punctuation, the current normalizer destroys display typography and grammatical structure (confirmed by test `store.test.ts:19`).
3. **Premise 3 (Poem Structure and Colophon Leakage)**: Observations in 1.2, D1, and D4 demonstrate that `poem-lines.ts` relies on arbitrary heuristics (`TARGET_LINE_LENGTH = 24`) and lacks colophon parsing. When modern poems conclude with date and location lines (e.g. `مزردشت، تنکابن، 1/1/1363`), these metadata tokens are parsed as stanza lines.
4. **Premise 4 (Engine Scaling Limits)**: Observations in 1.3 show that `Tigh`'s LRU cache uses `Array.splice` with an `O(N)` loop on every cache touch. Under high traffic, cache access degrades linearly. Furthermore, metrics, rate limits, and circuit breaker states are held strictly in process memory (`collectionScope: 'process-instance'`), breaking state consistency in serverless environments (D6).
5. **Premise 5 (Search Scalability)**: Observations in 1.4, D7, and runtime benchmark results show that search is an in-memory linear scan using `indexOf` and `includes` over all 5,396 records (averaging 4.03 ms). At 100x scale (~540,000 records), this naive approach will take >400 ms, violating the Appendix D latency budget of <= 25 ms.
6. **Premise 6 (Academic & Extensibility Deficits)**: Observations in D8, D10, D16, D17, and D18 show that the current API lacks stable IDs, RFC 9457 errors, cursor pagination, OpenAPI 3.1 specifications, rights audits, and academic citation infrastructure.
7. **Synthesis / Conclusion**: The existing repository is an in-memory prototype built on top of a Next.js v0 template (`my-v0-project`) that successfully proved the concept of a free Persian quote service. However, its architectural bottlenecks, data discrepancies, typographic corruption, and serverless isolation make it unsuitable for university-grade use or 100x scaling without the comprehensive restructuring specified in `ORIGINAL_REQUEST.md`.

---

## 3. Caveats

- **Vercel Serverless Production Logs**: Exploration was conducted within the local repository environment. Live production request logs, Vercel edge deployment metrics, and real-time traffic statistics from `pq.arsamadineh.ir` could not be inspected directly via shell.
- **Python Ingestion Scripts**: Scripts in `scripts/` (`convert-shereno.py`, `parse_hafez.py`, `extract_quotes.py`) reflect historical one-off data extraction and were not re-run against their original remote upstream data sources.
- **Copyright Legal Audits**: The assessment of copyright expiration in D10 is based on Iranian statutory copyright law (50-year term post-mortem). Formal rights classification for all individual poets must be executed during the WS1 Rights Audit.

---

## 4. Conclusion

The current Persian-Quote-API codebase represents a functional initial prototype with 5,396 active records, an in-memory processing engine (Tigh 0.0.1-beta), and a responsive Next.js frontend. However:
1. All 20 defects (D1 through D20) documented in Section 3 of `ORIGINAL_REQUEST.md` have been confirmed with exact file, line, and runtime evidence.
2. The current data layer conflates search normalization with display normalization, stripping critical Persian orthographic elements (ZWNJ, ezafe) and leaking colophons into poem lines.
3. The engine architecture lacks multi-worker synchronization, precompression, ETags, and true O(1) cache eviction, while search is bound to linear substring scans.
4. The repo structure still reflects its prototype scaffold (`my-v0-project`), suppressing type and lint errors during build.

The path forward requires the complete execution of Phase 0 (contract snapshots, legacy data archiving, Playwright visual baselines) and the phased rollout of the target monorepo architecture (packages/core, packages/schema, packages/persian, packages/poem, packages/search, packages/store).

---

## 5. Verification Method

To independently reproduce and verify all observations and defects documented in this report:

1. **Verify Test Suite**:
   ```bash
   bun test
   ```
   *Expected outcome*: 30 tests pass across 3 files. Observe `tests/store.test.ts:19` asserting that ZWNJ is stripped (`"می‌روم"` -> `"میروم"`).
2. **Verify Dataset Counts**:
   ```bash
   bun -e '
   console.log("hafez:", JSON.parse(await Bun.file("lib/data/hafez.json").text()).length);
   console.log("shereno:", JSON.parse(await Bun.file("lib/data/shereno.json").text()).length);
   console.log("poetry-quotes:", JSON.parse(await Bun.file("lib/data/poetry-quotes.json").text()).length);
   console.log("non-poetry-quotes:", JSON.parse(await Bun.file("lib/data/non-poetry-quotes.json").text()).length);
   '
   ```
   *Expected outcome*: `hafez: 497`, `shereno: 4400`, `poetry-quotes: 7`, `non-poetry-quotes: 494`.
3. **Verify Defect D1 (Footer Leak)**:
   ```bash
   bun -e '
   import { layoutPoem } from "./lib/data/poem-lines";
   const data = JSON.parse(await Bun.file("lib/data/shereno.json").text());
   const p = data.find(d => d.id === 4160);
   const layout = layoutPoem(p.poem, "auto");
   console.log("Tail lines:", layout.lines.slice(-3));
   '
   ```
   *Expected outcome*: Last line is `"مزردشت، تنکابن، 1/1/1363"`.
4. **Verify Defect D2 & D3 (Whitespace and Punctuation Gaps)**:
   ```bash
   bun -e '
   import { dataset, presentQuote } from "./lib/data/store";
   console.log("Double spaces:", dataset.all.filter(q => /  /.test(presentQuote(q).text_persian)).length);
   console.log("Space before comma:", dataset.all.filter(q => /\s+،/.test(presentQuote(q).text_persian)).length);
   '
   ```
   *Expected outcome*: 21 double spaces, 9 spaces before comma.
5. **Verify Defect D19 (Missing ETag and Server-Timing)**:
   ```bash
   rg -i "etag" lib/ app/
   rg -i "server-timing" lib/ app/
   ```
   *Expected outcome*: 0 results returned.
6. **Verify Search Latency & Performance Baseline**:
   ```bash
   bun scripts/bench-search.ts
   ```
   *Expected outcome*: Search averages ~4 ms across the 5,396 items; cold layout reconstruction averages ~65 ms for 120 poems.
