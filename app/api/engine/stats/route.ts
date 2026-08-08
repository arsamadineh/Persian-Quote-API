import { NextResponse } from "next/server";
import { getCategories, getPoets, getStats } from "@/lib/data/store";
import { engine } from "@/lib/engine/instance";

export const dynamic = "force-dynamic";

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function GET() {
  const started = performance.now();
  const datasetStats = getStats();
  const poets = getPoets();
  const categories = getCategories();
  const metrics = engine.flushMetrics();
  const duration = performance.now() - started;

  return NextResponse.json(
    {
      success: true,
      engine: "تیغ",
      version: "0.0.1-beta",
      data: {
        totals: {
          quotes: datasetStats.total,
          poets: poets.count,
          categories: categories.count,
          poetry: datasetStats.poetry,
          hafez: datasetStats.hafez,
          shereno: datasetStats.shereno,
          nonPoetry: datasetStats.nonPoetry,
        },
        engine: {
          uptime: metrics.uptime,
          startedAt: metrics.startedAt,
          instanceId: metrics.instanceId,
          collectionScope: metrics.collectionScope,
          sampleSize: metrics.sampleSize,
          requests: {
            total: metrics.requests.total,
            byMethod: metrics.requests.byMethod,
            byStatus: metrics.requests.byStatus,
            topPaths: Object.entries(metrics.requests.byPath)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([path, count]) => ({ path, count })),
          },
          latency: {
            avg: round(metrics.latency.avg),
            p50: round(metrics.latency.p50),
            p90: round(metrics.latency.p90),
            p95: round(metrics.latency.p95),
            p99: round(metrics.latency.p99),
            min: round(metrics.latency.min),
            max: round(metrics.latency.max),
          },
          cache: {
            hitRate: round(metrics.cache.hitRate * 100),
            hits: metrics.cache.hits,
            misses: metrics.cache.misses,
            size: metrics.cache.size,
            memoryMB: round(metrics.cache.memoryBytes / 1024 / 1024),
          },
          rateLimit: {
            totalRequests: metrics.rateLimit.totalRequests,
            rejected: metrics.rateLimit.rejected,
          },
          circuitBreaker: metrics.circuitBreaker,
        },
        dataIntegrity: {
          nonPoetryRaw: datasetStats.nonPoetryRaw,
          nonPoetryClean: datasetStats.nonPoetry,
          nonPoetryDropped: datasetStats.nonPoetryDropped,
          status: datasetStats.nonPoetryDropped > 0 ? "تمیزسازی خودکار اعمال شد" : "سالم",
        },
        meta: {
          responseTimeMs: round(duration),
          timestamp: new Date().toISOString(),
          note: "آمار درخواست‌ها و uptime فقط مربوط به همین نمونهٔ در حال اجرای سرویس است و با راه‌اندازی مجدد صفر می‌شود.",
        },
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
