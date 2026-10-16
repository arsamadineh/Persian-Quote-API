# Persian Quote API — API Policy

## 1. Access

The API is free, open, and requires no authentication, API key, or registration.
All endpoints are publicly accessible over HTTPS.

## 2. Rate limits

Requests are rate-limited per client IP using the GCRA algorithm. Default limits
are 100 requests per minute (adjustable). Responses include IETF headers
(`RateLimit`, `RateLimit-Policy`, `Retry-After`) and legacy headers
(`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`). Clients
that exceed the limit receive `429 Too Many Requests`.

## 3. Acceptable use

- Do not scrape or crawl at a rate that degrades service.
- Do not attempt to reverse-engineer or disrupt the service.
- Attribution is appreciated but not required.

## 4. Content rights

Classical works (Hafez, Saadi, Rumi, Ferdowsi, etc.) are public domain. Modern
works are provided under educational fair-use (`excerpt` display policy) per the
rights audit (`docs/audit/rights-audit.csv`). See each record's `rights.status`
and `rights.license` fields.

## 5. Caching

Responses include `Cache-Control` and `ETag`. Clients should honor `ETag`
conditional revalidation (`If-None-Match` → `304 Not Modified`) to reduce load.
Randomized responses (`?random=true`, `/v1/daily`, `/v1/fal`) carry
`Cache-Control: no-store` and must not be cached.

## 6. Embedding

The `<persian-quote>` web component and `/api/embed` iframe may be embedded on
third-party sites. The embed endpoint sets
`Content-Security-Policy: frame-ancestors *`.

## 7. Changes

Breaking changes are versioned and recorded in `lib/changelog.ts` (semantic
versioning, Persian). Legacy `/api/**` URLs and response shapes remain
backward-compatible (Rule R6).

## 8. Contact

arsam@arsamadineh.ir
