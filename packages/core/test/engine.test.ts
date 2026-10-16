import { describe, test, expect } from 'bun:test';
import { TighEngine } from '../src/server';
import { createAppEngine } from '../src/app';

// Permissive engine for functional tests (no throttling under burst).
const engine = createAppEngine({ enableRateLimit: false });

async function req(path: string, init: RequestInit = {}): Promise<Response> {
  const url = new URL(path, 'http://localhost');
  return engine.fetch(new Request(url.toString(), init));
}

describe('packages/core: Tigh v1 engine', () => {
  test('GET /v1/health returns ok', async () => {
    const res = await req('/v1/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('GET /v1/meta returns counts', async () => {
    const res = await req('/v1/meta');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.works).toBeGreaterThan(0);
    expect(body.poets).toBeGreaterThan(0);
    expect(body.collections).toBeGreaterThan(0);
  });

  test('GET /v1/works paginates with Link header', async () => {
    const res = await req('/v1/works?limit=2');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items.length).toBe(2);
    expect(body.limit).toBe(2);
    expect(body.hasNext).toBe(true);
    expect(res.headers.get('link')).toContain('rel="next"');
  });

  test('GET /v1/works cursor pagination', async () => {
    const first = await req('/v1/works?limit=1');
    const firstBody = await first.json();
    const link = first.headers.get('link') || '';
    const m = link.match(/<([^>]+)>;\s*rel="next"/);
    expect(m).toBeTruthy();
    const next = await req(m![1]);
    const nextBody = await next.json();
    expect(nextBody.items.length).toBe(1);
    expect(nextBody.items[0].id).not.toBe(firstBody.items[0].id);
  });

  test('GET /v1/works/[id] returns poem', async () => {
    const res = await req('/v1/works/hafez.ghazaliat.1');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('hafez.ghazaliat.1');
    expect(Array.isArray(body.stanzas)).toBe(true);
  });

  test('GET /v1/works/[id] view=excerpt', async () => {
    const res = await req('/v1/works/hafez.ghazaliat.1?view=excerpt');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.stanzas.length).toBe(1);
    expect(body.stanzas[0].length).toBeGreaterThan(0);
    const words = body.stanzas[0].join(' ').split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThanOrEqual(25);
  });

  test('GET /v1/works/[id] view=text returns txt', async () => {
    const res = await req('/v1/works/hafez.ghazaliat.1?view=text&format=txt');
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text.length).toBeGreaterThan(0);
  });

  test('GET /v1/works/[id] 404 for unknown id', async () => {
    const res = await req('/v1/works/does.not.exist');
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('problem+json');
  });

  test('GET /v1/works/random is nocache', async () => {
    const res = await req('/v1/works/random');
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('no-store');
  });

  test('GET /v1/daily deterministic', async () => {
    const res = await req('/v1/daily');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.kind).toBe('daily');
    expect(body.poem.id).toBeDefined();
  });

  test('GET /v1/fal deterministic with permalink', async () => {
    const res = await req('/v1/fal');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.kind).toBe('fal');
    expect(body.permalink).toBe(`/v1/works/${body.poem.id}`);
    expect(body.poem.poet_id).toBe('hafez');
  });

  test('GET /v1/poets list', async () => {
    const res = await req('/v1/poets');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBeGreaterThan(0);
  });

  test('GET /v1/poets/[id]', async () => {
    const res = await req('/v1/poets/hafez');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.slug).toBe('hafez');
  });

  test('GET /v1/tags sorted by count', async () => {
    const res = await req('/v1/tags');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBeGreaterThan(0);
    const counts = body.items.map((i: any) => i.count);
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeLessThanOrEqual(counts[i - 1]);
    }
  });

  test('GET /v1/suggest finds poems', async () => {
    const res = await req('/v1/suggest?q=عشق');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBeGreaterThan(0);
  });

  test('GET /v1/rhymes finds matching lines', async () => {
    const res = await req('/v1/rhymes?word=کجا');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.word).toBe('کجا');
  });

  test('GET /v1/forms and /v1/meters', async () => {
    const forms = await req('/v1/forms');
    expect(forms.status).toBe(200);
    const meters = await req('/v1/meters');
    expect(meters.status).toBe(200);
  });

  test('cache HIT header on second request', async () => {
    await req('/v1/meta');
    const second = await req('/v1/meta');
    expect(second.status).toBe(200);
    expect(second.headers.get('x-cache')).toBe('HIT');
  });

  test('legacy /api/quotes backward compatible', async () => {
    const res = await req('/api/quotes?limit=1');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBe(1);
  });

  test('legacy /api/quotes/hafez', async () => {
    const res = await req('/api/quotes/hafez');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBeGreaterThan(0);
  });

  test('rate limit headers present (single request, default engine)', async () => {
    const defaultEngine = new TighEngine();
    const res = await defaultEngine.fetch(new Request('http://localhost/v1/health'));
    expect(res.headers.get('x-ratelimit-limit')).toBeTruthy();
    expect(res.headers.get('ratelimit-policy')).toBeTruthy();
  });

  test('OPTIONS returns 204', async () => {
    const res = await engine.fetch(new Request('http://localhost/v1/health', { method: 'OPTIONS' }));
    expect(res.status).toBe(204);
  });

  test('HEAD returns headers only', async () => {
    const res = await engine.fetch(new Request('http://localhost/v1/health', { method: 'HEAD' }));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('');
  });

  test('404 for unknown route', async () => {
    const res = await req('/v1/nope');
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('problem+json');
  });
});
