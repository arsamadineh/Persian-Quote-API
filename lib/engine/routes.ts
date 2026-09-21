import type { Request, Response, RouteParams, RouteHandler } from './types';
import { engine } from './instance';
import {
  getQuotes,
  getQuotesByPoet,
  getHafez,
  getNonPoetry,
  getShereno,
  getByCategory,
  searchQuotes,
  getPoets,
  getCategories,
  getStats,
  dataset,
  presentQuotes,
  type NormalizedQuote,
} from '@/lib/data/store';
import type { LineMode } from '@/lib/data/poem-lines';

// ============================================================================
// ثبت اندپوینت‌های API روی موتور تیغ
// تمام مسیرها یک بار اینجا تعریف می‌شوند و از طریق اداپتور نکست‌جی اجرا می‌گردند.
// پارامترهای مسیر روی req.params و پارامترهای پرس‌وجو روی req.query قرار دارند.
// هر مسیر هم‌زمان با OPTIONS ثبت می‌شود تا پیش‌پرواز (preflight) CORS پاسخ دهد.
// ============================================================================

function sp(req: Request): URLSearchParams {
  return new URLSearchParams(req.query as Record<string, string>);
}

function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      ...extra,
    },
    body,
  };
}

function ok(data: unknown, meta: Record<string, unknown> = {}) {
  return json({ success: true, data, ...meta });
}

// حالت شکست خط شعر با پارامتر lines انتخاب می‌شود:
//   auto (پیش‌فرض)   شکست خط‌های واقعی، و در نبود نشانه، سطرهای بازسازی‌شده
//   separators       فقط شکست خط‌های واقعی منبع
//   raw              متن خام منبع بدون هیچ شکست خط افزوده
function lineMode(req: Request): LineMode {
  const value = String(req.query.lines ?? '').toLowerCase();
  if (value === 'raw' || value === 'original') return 'raw';
  if (value === 'separators' || value === 'split') return 'separators';
  return 'auto';
}

// تبدیل آیتم‌های داخلی مخزن به شکل قابل انتشار در پاسخ
function present(req: Request, quotes: NormalizedQuote[]): { data: Record<string, unknown>[]; lineMode: LineMode } {
  const mode = lineMode(req);
  return { data: presentQuotes(quotes, mode), lineMode: mode };
}

// ثبت GET و OPTIONS برای یک مسیر با بهره‌گیری از کش LRU و مدار شکن موتور
function reg(path: string, handler: RouteHandler, ttl = 60000, cache = true): void {
  engine.get(path, handler, cache ? { cache: { ttl } } : undefined);
}

export function registerRoutes(): void {
  reg('/api/quotes', (req) => {
    const r = getQuotes(sp(req));
    const p = present(req, r.data);
    return ok(p.data, { count: r.count, total: r.total, page: r.page, limit: r.limit, line_mode: p.lineMode });
  });

  // مسیرهای ثابت پیش از مسیر پویا [poet] ثبت می‌شوند
  reg('/api/quotes/hafez', (req) => {
    const r = getHafez(sp(req));
    const p = present(req, r.data);
    return ok(p.data, { count: r.count, total: r.total, page: r.page, limit: r.limit, line_mode: p.lineMode });
  });

  reg('/api/quotes/non-poetry', (req) => {
    const r = getNonPoetry(sp(req));
    const p = present(req, r.data);
    return ok(p.data, {
      count: r.count,
      total: r.total,
      page: r.page,
      limit: r.limit,
      line_mode: p.lineMode,
      meta: {
        raw: dataset.nonPoetryRawCount,
        dropped: dataset.nonPoetryDropped,
        note: 'ورودی‌های تکراری و بدون منتسب در هنگام بارگذاری به‌طور خودکار حذف شدند.',
      },
    });
  });

  reg('/api/quotes/shereno', (req) => {
    const r = getShereno(sp(req));
    const p = present(req, r.data);
    return ok(p.data, {
      count: r.count,
      total: r.total,
      page: r.page,
      limit: r.limit,
      line_mode: p.lineMode,
      meta: {
        note:
          p.lineMode === 'auto'
            ? 'سطرهای شعر نو در نبود نشانهٔ شکست خط در منبع، بازسازی تقریبی شده‌اند. مقدار line_origin منبع هر متن را اعلام می‌کند.'
            : 'شکست خط‌ها فقط از نشانه‌های موجود در منبع گرفته شده‌اند.',
      },
    });
  });

  reg('/api/quotes/search', (req) => {
    const qs = sp(req);
    const r = searchQuotes(qs);
    const p = present(req, r.data);
    return ok(p.data, {
      count: r.count,
      total: r.total,
      page: r.page,
      limit: r.limit,
      line_mode: p.lineMode,
      query: qs.get('q') || qs.get('query') || '',
    });
  });

  reg('/api/quotes/category/[category]', (req) => {
    const params = req.params as RouteParams;
    const r = getByCategory(String(params.category), sp(req));
    const p = present(req, r.data);
    return ok(p.data, {
      count: r.count,
      total: r.total,
      page: r.page,
      limit: r.limit,
      line_mode: p.lineMode,
      category: params.category,
    });
  });

  reg('/api/quotes/[poet]', (req) => {
    const params = req.params as RouteParams;
    const r = getQuotesByPoet(String(params.poet), sp(req));
    const p = present(req, r.data);
    return ok(p.data, {
      count: r.count,
      total: r.total,
      page: r.page,
      limit: r.limit,
      line_mode: p.lineMode,
      poet: params.poet,
    });
  });

  reg('/api/poets', () => {
    const { data, count } = getPoets();
    return ok(data, { count });
  });

  reg('/api/categories', () => {
    const { data, count } = getCategories();
    return ok(data, { count });
  });

  reg('/api/stats', () => {
    const s = getStats();
    const cache = engine.cache.getStats();
    const metrics = engine.flushMetrics();
    const response = ok(s, {
      engine: {
        name: 'تیغ',
        version: '0.0.1-beta',
        cache: { size: cache.size, hitRate: cache.hitRate, hits: cache.hits, misses: cache.misses },
        requests: metrics.requests.total,
        uptimeMs: metrics.uptime,
        instanceId: metrics.instanceId,
        collectionScope: metrics.collectionScope,
      },
      dataIntegrity: {
        nonPoetryRaw: s.nonPoetryRaw,
        nonPoetryClean: s.nonPoetry,
        nonPoetryDropped: s.nonPoetryDropped,
        status: s.nonPoetryDropped > 0 ? 'تمیزسازی خودکار اعمال شد' : 'سالم',
      },
    });
    return { ...response, headers: { ...response.headers, 'Cache-Control': 'no-store' } };
  }, 60000, false);

  reg('/api/health', () => {
    const s = getStats();
    const metrics = engine.flushMetrics();
    const response = ok(
      {
        status: 'ok',
        engine: 'تیغ/0.0.1-beta',
        instanceId: metrics.instanceId,
        collectionScope: metrics.collectionScope,
        uptimeMs: metrics.uptime,
        datasets: {
          poetry: s.poetry,
          hafez: s.hafez,
          nonPoetry: s.nonPoetry,
          shereno: s.shereno,
          total: s.total,
        },
        cache: engine.cache.getStats(),
        timestamp: Date.now(),
      },
      {},
    );
    return { ...response, headers: { ...response.headers, 'Cache-Control': 'no-store' } };
  }, 60000, false);
}
