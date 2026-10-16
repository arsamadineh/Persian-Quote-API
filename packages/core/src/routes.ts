import { loadCanonicalStore, poemOfTheDay, falHafez } from './storage';
export { searchHandler } from './search-index';
import {
  jsonBody,
  textBody,
  emptyBody,
  problemResponse,
} from './server';
import type { TighRequest, TighResponse } from './types';
import { pickExcerpt } from '@persian-quote/poem';
import { cleanLine as cleanPersianLine } from '@persian-quote/persian';
import type { Poem } from '@persian-quote/schema';

const store = loadCanonicalStore();

function parseBool(v: string | undefined): boolean {
  return v === '1' || v === 'true' || v === 'yes';
}

function cursorEncode(offset: number, limit: number): string {
  return Buffer.from(`${offset}:${limit}`).toString('base64url');
}

function cursorDecode(cursor: string | undefined): { offset: number; limit: number } | null {
  if (!cursor) return null;
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString();
    const [off, lim] = decoded.split(':').map(Number);
    if (!Number.isFinite(off) || !Number.isFinite(lim)) return null;
    return { offset: off, limit: lim };
  } catch {
    return null;
  }
}

function filterWorks(
  works: Iterable<Poem>,
  filters: {
    poet?: string;
    collection?: string;
    form?: string;
    meter?: string;
    tag?: string;
    rights?: string;
  }
): Poem[] {
  const result: Poem[] = [];
  for (const w of works) {
    if (filters.poet && w.poet_id !== filters.poet) continue;
    if (filters.collection && w.collection_id !== filters.collection) continue;
    if (filters.form && w.form !== filters.form) continue;
    if (filters.meter && w.meter?.name !== filters.meter) continue;
    if (filters.tag && !w.tags?.includes(filters.tag)) continue;
    if (filters.rights && w.rights?.status !== filters.rights) continue;
    result.push(w);
  }
  result.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return result;
}

/* ------------------------------------------------------------------ */
/* /v1 handlers                                                       */
/* ------------------------------------------------------------------ */

export function healthHandler(_req: TighRequest): TighResponse {
  return jsonBody({ status: 'ok', service: 'pq-api', version: '۱.۰.۰' });
}

export function metaHandler(_req: TighRequest): TighResponse {
  return jsonBody({
    works: store.counts.works,
    poets: store.counts.poets,
    collections: store.counts.collections,
    timezone: 'Asia/Tehran',
  });
}

export function worksListHandler(req: TighRequest): TighResponse {
  const filters = {
    poet: req.query.poet,
    collection: req.query.collection,
    form: req.query.form,
    meter: req.query.meter,
    tag: req.query.tag,
    rights: req.query.rights,
  };
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const cursor = cursorDecode(req.query.cursor);
  const offset = cursor ? cursor.offset : 0;

  const all = filterWorks(store.works.values(), filters);
  const page = all.slice(offset, offset + limit);
  const nextOffset = offset + page.length;
  const hasNext = nextOffset < all.length;

  const links: string[] = [];
  if (hasNext) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) if (v) params.set(k, v);
    params.set('limit', String(limit));
    params.set('cursor', cursorEncode(nextOffset, limit));
    links.push(`<${req.path}?${params.toString()}>; rel="next"`);
  }
  if (offset > 0) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) if (v) params.set(k, v);
    params.set('limit', String(limit));
    params.set('cursor', cursorEncode(Math.max(0, offset - limit), limit));
    links.push(`<${req.path}?${params.toString()}>; rel="prev"`);
  }

  return jsonBody(
    {
      items: page,
      count: page.length,
      total: all.length,
      offset,
      limit,
      hasNext,
    },
    200,
    links.length > 0 ? { 'Link': links.join(', ') } : {}
  );
}

export function worksGetHandler(req: TighRequest): TighResponse {
  const id = req.params.id!;
  const w = store.works.get(id);
  if (!w) {
    return problemResponse(404, 'Not Found', `Work ${id} not found`);
  }

  const view = req.query.view || 'full';
  const format = req.query.format || 'json';

  let body: unknown;
  switch (view) {
    case 'excerpt':
      body = { ...w, stanzas: [w.excerpt?.lines ?? [w.stanzas[0]?.[0] ?? '']] };
      break;
    case 'lines':
      body = { id: w.id, lines: w.stanzas.flat(), text_plain: w.text_plain };
      break;
    case 'text':
      body = { id: w.id, text: w.text_plain };
      break;
    case 'full':
    default:
      body = w;
      break;
  }

  if (format === 'txt') {
    return textBody(typeof body === 'string' ? body : JSON.stringify(body, null, 2));
  }
  return jsonBody(body);
}

export function worksRandomHandler(_req: TighRequest): TighResponse {
  const ids = Array.from(store.works.keys());
  const id = ids[Math.floor(Math.random() * ids.length)]!;
  return jsonBody(store.works.get(id)!, 200, { 'cache-control': 'no-store' });
}

export function dailyHandler(_req: TighRequest): TighResponse {
  const poem = poemOfTheDay(store.works);
  return jsonBody({ kind: 'daily', poem });
}

export function falHandler(_req: TighRequest): TighResponse {
  const poem = falHafez(store.works);
  return jsonBody({ kind: 'fal', poem, permalink: `/v1/works/${poem.id}` });
}

export function poetsListHandler(_req: TighRequest): TighResponse {
  return jsonBody({ items: Array.from(store.poets.values()), count: store.poets.size });
}

export function poetsGetHandler(req: TighRequest): TighResponse {
  const p = store.poets.get(req.params.id!);
  if (!p) return problemResponse(404, 'Not Found', `Poet ${req.params.id} not found`);
  return jsonBody(p);
}

export function collectionsListHandler(_req: TighRequest): TighResponse {
  return jsonBody({ items: Array.from(store.collections.values()), count: store.collections.size });
}

export function collectionsGetHandler(req: TighRequest): TighResponse {
  const c = store.collections.get(req.params.id!);
  if (!c) return problemResponse(404, 'Not Found', `Collection ${req.params.id} not found`);
  return jsonBody(c);
}

export function formsHandler(_req: TighRequest): TighResponse {
  const forms = new Set<string>();
  for (const w of store.works.values()) forms.add(w.form);
  return jsonBody({ items: Array.from(forms).sort(), count: forms.size });
}

export function metersHandler(_req: TighRequest): TighResponse {
  const meters = new Set<string>();
  for (const w of store.works.values()) if (w.meter?.name) meters.add(w.meter.name);
  return jsonBody({ items: Array.from(meters).sort(), count: meters.size });
}

export function tagsHandler(_req: TighRequest): TighResponse {
  const tagCounts = new Map<string, number>();
  for (const w of store.works.values()) {
    for (const t of w.tags) tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
  }
  const items = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'fa'));
  return jsonBody({ items, count: items.length });
}

export function suggestHandler(req: TighRequest): TighResponse {
  const q = cleanPersianLine(req.query.q || '');
  if (!q) return jsonBody({ items: [], count: 0 });
  const results = new Map<string, any>();
  const add = (item: any, score: number) => {
    if (!results.has(item.id)) results.set(item.id, { ...item, score });
  };
  for (const w of store.works.values()) {
    const haystack = `${w.title} ${w.text_plain} ${w.poet_name} ${w.tags.join(' ')}`;
    const normalized = haystack.normalize('NFC');
    if (normalized.includes(q)) add(w, 1);
  }
  for (const p of store.poets.values()) {
    if (
      p.name_persian.normalize('NFC').includes(q) ||
      p.name_english.toLowerCase().includes(q.toLowerCase())
    ) {
      add(
        { id: p.slug, type: 'poet', name_persian: p.name_persian, name_english: p.name_english },
        2
      );
    }
  }
  return jsonBody({ items: Array.from(results.values()).slice(0, 20), count: results.size });
}

export function rhymesHandler(req: TighRequest): TighResponse {
  const word = cleanPersianLine(req.query.word || '');
  if (!word) return jsonBody({ items: [], count: 0 });
  const results: any[] = [];
  for (const w of store.works.values()) {
    for (const stanza of w.stanzas) {
      for (const line of stanza) {
        const trimmed = line.trim();
        if (trimmed.endsWith(word)) {
          results.push({ poemId: w.id, poet: w.poet_name, line: trimmed });
        }
      }
    }
  }
  return jsonBody({ items: results.slice(0, 50), count: results.length, word });
}

/* ------------------------------------------------------------------ */
/* Legacy /api handlers (R6 backward compatibility)                   */
/* ------------------------------------------------------------------ */

export function legacyQuotesHandler(req: TighRequest): TighResponse {
  const poet = req.query.poet;
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const page = Math.max(Number(req.query.page || 1), 1);
  const random = parseBool(req.query.random);

  const all = filterWorks(store.works.values(), poet ? { poet } : {});
  if (random) {
    const id = all[Math.floor(Math.random() * all.length)]?.id;
    if (!id) return jsonBody({ success: true, data: [], count: 0 });
    return jsonBody({ success: true, data: [store.works.get(id)!], count: 1 });
  }
  const start = (page - 1) * limit;
  const pageItems = all.slice(start, start + limit);
  return jsonBody({
    success: true,
    data: pageItems,
    count: pageItems.length,
    total: all.length,
    page,
    limit,
  });
}

export function legacyHafezHandler(_req: TighRequest): TighResponse {
  const hafez: Poem[] = [];
  for (const w of store.works.values()) {
    if (w.poet_id === 'hafez') hafez.push(w);
  }
  return jsonBody({ success: true, data: hafez, count: hafez.length });
}

export function legacyStatsHandler(_req: TighRequest): TighResponse {
  return jsonBody({
    success: true,
    data: {
      works: store.counts.works,
      poets: store.counts.poets,
      collections: store.counts.collections,
    },
  });
}

export function legacyHealthHandler(_req: TighRequest): TighResponse {
  return jsonBody({ success: true, status: 'ok' });
}

export function legacyNotFoundHandler(_req: TighRequest): TighResponse {
  return problemResponse(404, 'Not Found', 'Legacy endpoint not found');
}
