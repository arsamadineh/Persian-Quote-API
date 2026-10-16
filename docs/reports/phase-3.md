# Phase 3: Tigh v1 Engine, Storage Build & API v1 Implementation Report

## 1. Executive Summary

Phase 3 (WS5/WS6/WS7) is complete and verified. A zero-dependency Tigh v1 engine (`@persian-quote/core`) was built with a compiled radix router, prebuilt-response S3-FIFO/W-TinyLFU cache, GCRA rate limiter, circuit breaker, DDSketch telemetry, and canonical JSONL storage. All 13 `/v1` routes and all legacy `/api/**` routes are implemented over the engine. Backward compatibility is preserved: all 30 legacy golden contract tests still pass.

Measured on Linux x86_64, Bun 1.4.3:
- `bun test`: 240 pass, 0 fail (was 216; +24 core engine tests)
- `bun x tsc --noEmit`: 0 errors
- Engine: `fetch(Request) -> Promise<Response>` (Web standard, R10)
- Cache: pre-serialized `Uint8Array` fragments, no `JSON.stringify` on hot path
- Rate limiter: GCRA with IETF `RateLimit`/`RateLimit-Policy` + legacy `X-RateLimit-*`
- Circuit breaker: closed/open/half-open with `Retry-After`
- Telemetry: DDSketch P50–P99, bounded memory

## 2. WS5 & WS6 — Tigh v1 Engine Core (`packages/core`)

### Modules (`packages/core/src/`)
- `types.ts` — `TighRequest`/`TighResponse` (internal, distinct from Web `Request`/`Response`), `Engine` interface, all config types.
- `server.ts` — `TighEngine` implementing `fetch(Request): Promise<Response>`. Rate limit → OPTIONS fast-path → radix router match → middleware chain (metrics, cache, circuit breaker, handler). NFC-decodes Persian paths per R13.
- `router/radix-router.ts` — Compiled radix (Patricia) trie per HTTP method. Zero-allocation dynamic parameter extraction (`[name]` segments), wildcard `*`, correct mid-segment split handling. Static/param match.
- `cache/prebuilt-cache.ts` — Prebuilt response cache storing `Uint8Array` fragments. S3-FIFO (`in`/`probation`/`main` queues) + W-TinyLFU admission via ghost ledger + TinyLFU frequency comparison. Single-flight coalescing (`withSingleFlight`). No `JSON.stringify` on hot path.
- `rate-limiter/gcra.ts` — Generic Cell Rate Algorithm (virtual clock / leaky bucket). IETF `RateLimit`, `RateLimit-Policy`, `Retry-After` + legacy `X-RateLimit-*`.
- `circuit-breaker/circuit-breaker.ts` — Closed/open/half-open, failure threshold, recovery timeout, half-open max attempts, `CircuitOpenError`.
- `telemetry/ddsketch.ts` — Bounded DDSketch for P50–P99 without unbounded memory growth; `LatencyHistogram`.
- `telemetry/metrics.ts` — `TighMetrics` aggregating per-path DDSketch snapshots, cache/rate-limit/circuit-breaker stats.
- `storage.ts` — Canonical JSONL in-memory store (`loadCanonicalStore`), deterministic `poemOfTheDay` (Asia/Tehran), `falHafez`.
- `routes.ts` — All `/v1` and legacy `/api` handlers.
- `app.ts` — `createAppEngine` registering all routes with cache TTLs.
- `adapters/{next,cloudflare,bun,node}.ts` — Conformance adapters for Next.js, Cloudflare Workers, Bun.serve, Node.js.

### Routes registered
`GET /v1/health`, `/v1/meta`, `/v1/works` (cursor + `Link`), `/v1/works/random` (no-store), `/v1/daily`, `/v1/fal`, `/v1/works/[id]` (`view=full|excerpt|lines|text`, format suffix), `/v1/poets`, `/v1/poets/[id]`, `/v1/collections`, `/v1/collections/[id]`, `/v1/forms`, `/v1/meters`, `/v1/tags`, `/v1/suggest`, `/v1/rhymes`.
Legacy: `/api/quotes`, `/api/quotes/hafez`, `/api/quotes/stats`, `/api/health` (all unchanged response shapes).

### Next.js wiring
- `app/v1/**/route.ts` — 16 route files, each delegating to `createNextHandler(engine)`.
- `app/lib/core-engine.ts` — Singleton `engine = createAppEngine()`.
- `next.config.mjs` — `@persian-quote/core` added to `transpilePackages`.
- `tsconfig.json` — `@persian-quote/core` path alias.

## 3. WS7 — Legacy Compatibility (R6)
All legacy `/api/**` endpoints rewritten over the new engine. Response shapes preserved (`{success, data, count, total, page, limit}` etc.). All 30 golden contract tests pass unchanged (verified in full `bun test`).

## 4. Verification Matrix

| Target | Command | Result |
|---|---|---|
| Typecheck | `bun x tsc --noEmit` | 0 errors |
| Full suite | `bun test` | 240 pass, 0 fail |
| Core engine | `bun test packages/core/` | 24 pass, 0 fail |
| Legacy regression | `bun test tests/` | 216 pass, 0 fail (unchanged) |

## 5. Decisions
- ADR-0001: JSONL canonical storage with stable IDs (Phase 2).
- ADR-0002: Radix router + S3-FIFO/W-TinyLFU prebuilt cache (Phase 3).
- ADR-0003: Partial beyt allowlist (Phase 2).
- New: GCRA chosen over token bucket for smooth, burst-tolerant rate limiting with IETF headers.

## 6. Next
Phase 4 (Hybrid Search: `packages/search`, BM25F, SymSpell, Finglish, rhyme finder, `pipeline/eval-search.ts`).
