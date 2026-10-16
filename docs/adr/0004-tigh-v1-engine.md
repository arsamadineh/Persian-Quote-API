# ADR-0004: Tigh v1 Engine — Radix Router, Prebuilt Cache & GCRA Rate Limiter

Date: 2026-10-17
Status: Accepted

## Context

The legacy Tigh v0 engine (`lib/engine`) used an LRU cache with O(N) array-splice eviction (~560 µs lookup) and a token-bucket rate limiter without IETF headers. WS5/WS6 require a zero-dependency, high-performance engine meeting Appendix D budgets (router ≤150 ns static / ≤400 ns param, cache-hit CPU ≤10 µs, handler ≤50 µs).

## Decision

- **Router**: Compiled radix (Patricia) trie per HTTP method (`TighRadixRouter`). Static segments stored as compressed edges; dynamic `[name]` params and `*` wildcards as separate child pointers. Zero-allocation param extraction; NFC-decoded Persian paths. Mid-segment edge splits handled correctly during matching.
- **Cache**: Prebuilt response cache (`PrebuiltCache`) storing pre-serialized `Uint8Array` fragments. S3-FIFO with three queues (`in`, `probation`, `main`) and W-TinyLFU admission via a bounded ghost ledger. Single-flight request coalescing (`withSingleFlight`). Hot path never calls `JSON.stringify` or `JSON.parse`.
- **Rate limiter**: Generic Cell Rate Algorithm (GCRA / virtual clock leaky bucket). Emits IETF `RateLimit`, `RateLimit-Policy`, `Retry-After` plus legacy `X-RateLimit-*` on every response.
- **Circuit breaker**: Closed/open/half-open with failure threshold, recovery timeout, half-open max attempts.
- **Telemetry**: Bounded DDSketch for P50–P99 latency; no unbounded memory growth.
- **Server**: `TighEngine.fetch(Request): Promise<Response>` Web-standard boundary; internal `TighRequest`/`TighResponse` avoid clashes with Web `Request`/`Response`.
- **Adapters**: Conformance-tested adapters for Next.js, Cloudflare Workers, Bun.serve, Node.js running the same engine.

## Consequences

- Hot-path cache hits store and return bytes directly (no re-serialization).
- GCRA provides smooth rate limiting with IETF-standard headers.
- Adapters allow identical behavior across runtimes for conformance testing (WS6).
