import { createAppEngine } from '../packages/core/src/app.ts';

const engine = createAppEngine({
  rateLimit: { windowMs: 60000, maxRequests: 100000, strategy: 'gcra' },
});

async function fetch(path: string, init: RequestInit = {}): Promise<Response> {
  return engine.fetch(new Request(`http://localhost${path}`, init));
}

async function main() {
  const out: string[] = [];
  out.push('========== CACHE EVIDENCE (real engine calls) ==========');

  // 1. First request -> MISS
  const r1 = await fetch('/v1/meta');
  out.push('--- 1. First /v1/meta (expect MISS) ---');
  out.push(`HTTP ${r1.status}`);
  out.push(`X-Cache: ${r1.headers.get('x-cache')}`);
  out.push(`Cache-Control: ${r1.headers.get('cache-control')}`);
  const etag = r1.headers.get('etag');
  out.push(`ETag: ${etag}`);
  out.push(await r1.text());

  // 2. Second request -> HIT
  const r2 = await fetch('/v1/meta');
  out.push('');
  out.push('--- 2. Second /v1/meta (expect HIT) ---');
  out.push(`HTTP ${r2.status}`);
  out.push(`X-Cache: ${r2.headers.get('x-cache')}`);

  // 3. Conditional revalidation -> 304
  out.push('');
  out.push('--- 3. Conditional (If-None-Match) -> expect 304 ---');
  const r3 = await fetch('/v1/meta', { headers: { 'if-none-match': etag ?? '' } });
  out.push(`HTTP ${r3.status}`);
  out.push(`Body length: ${(await r3.text()).length}`);

  // 4. Random -> no-store
  out.push('');
  out.push('--- 4. /v1/works/random (expect no-store) ---');
  const r4 = await fetch('/v1/works/random');
  out.push(`HTTP ${r4.status}`);
  out.push(`Cache-Control: ${r4.headers.get('cache-control')}`);

  // 5. Rate limit headers
  out.push('');
  out.push('--- 5. Rate limit headers ---');
  const r5 = await fetch('/v1/health');
  out.push(`RateLimit: ${r5.headers.get('ratelimit')}`);
  out.push(`RateLimit-Policy: ${r5.headers.get('ratelimit-policy')}`);
  out.push(`X-RateLimit-Limit: ${r5.headers.get('x-ratelimit-limit')}`);
  out.push(`X-RateLimit-Remaining: ${r5.headers.get('x-ratelimit-remaining')}`);

  // 6. Legacy endpoint
  out.push('');
  out.push('--- 6. Legacy /api/quotes?limit=1 ---');
  const r6 = await fetch('/api/quotes?limit=1');
  const b6 = await r6.json();
  out.push(`HTTP ${r6.status} success=${b6.success} count=${b6.count}`);

  out.push('');
  out.push('========== END ==========');
  console.log(out.join('\n'));
}

main().catch((e) => { console.error(e); process.exit(1); });
