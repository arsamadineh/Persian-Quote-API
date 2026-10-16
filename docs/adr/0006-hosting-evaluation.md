# ADR-0006: Hosting Infrastructure Evaluation

Date: 2026-10-17
Status: Accepted

## Context

WS9 requires a hosting decision for the Persian Quote API platform. Candidates: Cloudflare Workers, Vercel Serverless, and standalone Bun VPS. The platform must meet Appendix D budgets (cold start ≤ 100 ms, cached TTFB p95 ≤ 50 ms, cached throughput ≥ 5,000 req/s, memory ≤ 128 MB) and run the Tigh v1 engine (`fetch(Request): Promise<Response>`) which is runtime-agnostic.

## Options

### A. Cloudflare Workers
- **Pros**: Edge execution close to users (low TTFB), native `fetch` API, zero cold start for small scripts, built-in KV/cache, generous free tier, global PoP coverage.
- **Cons**: 10 ms CPU limit per request on free tier (risky for cold cache/search), Workers KV eventual consistency, limited Node.js compatibility, V8 isolate constraints.

### B. Vercel Serverless (Next.js)
- **Pros**: Native Next.js App Router support, automatic scaling, edge + regional functions, built-in caching headers, easy CI/CD.
- **Cons**: Serverless cold starts, function duration limits, vendor lock-in, higher cost at high request volume, less control over cache layer.

### C. Standalone Bun VPS
- **Pros**: Full control, Bun's fast runtime (low cold start), no function duration/cpu limits, cheap, direct nginx/CDN in front, matches `bun.serve` adapter.
- **Cons**: Manual ops/scaling, single region unless multi-VPS, self-managed CDN/cache invalidation.

## Decision

**Standalone Bun VPS behind a CDN (nginx + Bun.serve)** for the origin, with Cloudflare as the DNS/CDN edge.

Rationale:
- Tigh engine is runtime-agnostic (`fetch` boundary), so Bun VPS runs it natively with the Bun.serve adapter (zero cold start, no CPU limits).
- Bun's runtime is fast and memory-efficient (well under 128 MB budget).
- A CDN in front provides edge caching (MISS → HIT → 304) and DDoS protection, satisfying cached TTFB ≤ 50 ms and throughput ≥ 5,000 req/s.
- Avoids serverless cold-start and duration risks for uncached search workloads (uncached origin p99 ≤ 150 ms).
- Multi-origin fallback via `/.well-known/pq-endpoints.json` for resilience.

## Consequences

- Origin: Bun VPS running `packages/core` via `createBunHandler(engine)` + `Bun.serve`.
- CDN: Cloudflare caching with `Cache-Control`, `ETag`, `304 Not Modified`.
- Multi-origin: `/.well-known/pq-endpoints.json` lists origin + fallback endpoints.
- Production: Docker multi-stage build + docker-compose.
