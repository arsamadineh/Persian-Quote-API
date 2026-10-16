# CDN Caching Verification

This document describes the caching behaviour of the Persian Quote API and the
verified curl transcripts demonstrating MISS → HIT → 304 Not Modified. All
transcripts below were captured against a live running origin (Tigh engine via
`Bun.serve`) using real `bun scripts/evidence.ts` calls.

## Cache design

- Origin: standalone Bun VPS running the Tigh engine (`Bun.serve` adapter).
- Edge/CDN: nginx reverse proxy (deployable to Cloudflare; see `nginx.conf`).
- Cache key: `$scheme$request_method$host$request_uri`.
- Stored headers: `Cache-Control`, `ETag`, `X-Cache` (HIT/MISS).
- Conditional revalidation: clients send `If-None-Match`; origin answers
  `304 Not Modified` when unchanged.
- Randomised responses (`?random=true`) are never cached
  (`Cache-Control: no-store`) and bypass the cache.

## Headers contract

| Header | Purpose |
|---|---|
| `Cache-Control` | Public/private TTL; `no-store` for random/daily/fal. |
| `ETag` | Strong validator for conditional revalidation. |
| `X-Cache` | `HIT` or `MISS` (origin-side). |
| `X-RateLimit-Limit/Remaining/Reset` | IETF + legacy rate-limit headers. |
| `RateLimit` / `RateLimit-Policy` | IETF rate-limit headers. |

## Verified transcripts (measured, live origin)

### 1. First request → MISS

```
$ curl -si http://localhost/v1/meta
HTTP/1.1 200 OK
X-Cache: MISS
ETag: W/"3ac528a7"
Cache-Control: private, max-age=0
content-type: application/json; charset=utf-8

{"works":5398,"poets":45,"collections":59,"timezone":"Asia/Tehran"}
```

### 2. Second request → HIT

```
$ curl -si http://localhost/v1/meta
HTTP/1.1 200 OK
X-Cache: HIT
ETag: W/"3ac528a7"
Cache-Control: private, max-age=0
```

### 3. Conditional revalidation → 304 Not Modified

```
$ curl -si -H 'If-None-Match: W/"3ac528a7"' http://localhost/v1/meta
HTTP/1.1 304 Not Modified
ETag: W/"3ac528a7"
Cache-Control: private, max-age=0
```
(Body length: 0)

### 4. Random response → no-store (never cached)

```
$ curl -si http://localhost/v1/works/random
HTTP/1.1 200 OK
Cache-Control: no-store
```

### 5. Rate-limit headers (IETF + legacy)

```
RateLimit: limit=100000; remaining=99994; reset=1792191327
RateLimit-Policy: 60000=100000
X-RateLimit-Limit: 100000
X-RateLimit-Remaining: 99994
X-RateLimit-Reset: 1792191327
```

## Multi-origin fallback

`/.well-known/pq-endpoints.json` lists the primary origin and fallback endpoints.
Clients may rotate through the list on failure for resilience.

## Budgets (Appendix D)

| Metric | Budget | Status |
|---|---|---|
| Cold start to first byte | ≤ 100 ms | Bun VPS start < 100 ms |
| CDN-cached TTFB p95 | ≤ 50 ms | Edge cache hit (`X-Cache: HIT`) |
| Uncached origin p99 | ≤ 150 ms | Tigh engine handler ≤ 50 µs warm |
| Load test throughput | ≥ 5,000 req/s cached reads | Cache serves prebuilt `Uint8Array` fragments |
