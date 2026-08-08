import { NextRequest, NextResponse } from "next/server";
import { TighCache } from "@/lib/engine/cache";
import { engine } from "@/lib/engine/instance";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requested = Number.parseInt(searchParams.get("iterations") || "1000", 10);
  const iterations = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 10000) : 1000;
  const benchmarkCache = new TighCache({ maxSize: Math.max(iterations + 1, 10), defaultTTL: 60000, checkInterval: 0 });

  const results = {
    router: { ops: 0, avgNs: 0, totalNs: 0 },
    cache: { setOps: 0, getHitOps: 0, getMissOps: 0, avgSetNs: 0, avgGetNs: 0 },
  };

  const routerStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    engine.router.match("GET", "/api/quotes/hafez");
    engine.router.match("GET", "/api/quotes/search");
    engine.router.match("GET", "/api/stats");
  }
  const routerElapsed = (performance.now() - routerStart) * 1_000_000;
  results.router.ops = iterations * 3;
  results.router.totalNs = routerElapsed;
  results.router.avgNs = routerElapsed / results.router.ops;

  const prefix = `bench:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  const cacheSetStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    benchmarkCache.set(`${prefix}:set:${i}`, { data: `value-${i}`, nested: { a: 1, b: 2 } }, 60000);
  }
  const cacheSetElapsed = (performance.now() - cacheSetStart) * 1_000_000;
  results.cache.setOps = iterations;
  results.cache.avgSetNs = cacheSetElapsed / iterations;

  const cacheGetStart = performance.now();
  let hitOps = 0;
  for (let i = 0; i < iterations; i++) {
    if (benchmarkCache.get(`${prefix}:set:${i}`) !== null) hitOps++;
  }
  const cacheGetElapsed = (performance.now() - cacheGetStart) * 1_000_000;
  results.cache.getHitOps = hitOps;
  results.cache.avgGetNs = cacheGetElapsed / iterations;

  let missOps = 0;
  for (let i = 0; i < iterations; i++) {
    if (benchmarkCache.get(`${prefix}:miss:${i}`) === null) missOps++;
  }
  results.cache.getMissOps = missOps;
  benchmarkCache.destroy();

  return NextResponse.json(
    {
      success: true,
      engine: "تیغ",
      version: "0.0.1-beta",
      benchmark: {
        iterations,
        results,
        summary: {
          routerNsPerOp: Math.round(results.router.avgNs),
          cacheSetNsPerOp: Math.round(results.cache.avgSetNs),
          cacheGetNsPerOp: Math.round(results.cache.avgGetNs),
          cacheHitRate: results.cache.getHitOps / Math.max(1, results.cache.setOps),
        },
        note: "این آزمایش فقط روتر و یک کش جداگانه را اندازه می‌گیرد و متریک درخواست‌های سرویس را تغییر نمی‌دهد.",
      },
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
        "X-Engine": "tigh/0.0.1-beta",
      },
    },
  );
}
