import { type NextRequest, NextResponse } from "next/server"
import { engine } from "@/lib/engine/instance"
import sampleQuotes from "@/lib/data/poetry-quotes.json"
import hafez from "@/lib/data/hafez.json"
import shereno from "@/lib/data/shereno.json"
import nonPoetryQuotes from "@/lib/data/non-poetry-quotes.json"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const start = performance.now()

  const totals = {
    quotes: sampleQuotes.length + hafez.length + shereno.length + nonPoetryQuotes.length,
    poets: 6,
    categories: 5,
  }

  const engineMetrics = engine.flushMetrics()

  const duration = performance.now() - start

  return NextResponse.json(
    {
      success: true,
      engine: "تیغ",
      version: "0.0.1-beta",
      data: {
        totals,
        engine: {
          uptime: engineMetrics.uptime,
          requests: {
            total: engineMetrics.requests.total,
            byMethod: engineMetrics.requests.byMethod,
            byStatus: engineMetrics.requests.byStatus,
            topPaths: Object.entries(engineMetrics.requests.byPath)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([path, count]) => ({ path, count })),
          },
          latency: {
            avg: Math.round(engineMetrics.latency.avg * 100) / 100,
            p50: Math.round(engineMetrics.latency.p50 * 100) / 100,
            p90: Math.round(engineMetrics.latency.p90 * 100) / 100,
            p95: Math.round(engineMetrics.latency.p95 * 100) / 100,
            p99: Math.round(engineMetrics.latency.p99 * 100) / 100,
            min: Math.round(engineMetrics.latency.min * 100) / 100,
            max: Math.round(engineMetrics.latency.max * 100) / 100,
          },
          cache: {
            hitRate: Math.round(engineMetrics.cache.hitRate * 10000) / 100,
            hits: engineMetrics.cache.hits,
            misses: engineMetrics.cache.misses,
            size: engineMetrics.cache.size,
            memoryMB: Math.round((engineMetrics.cache.memoryBytes / 1024 / 1024) * 100) / 100,
          },
          rateLimit: {
            totalRequests: engineMetrics.rateLimit.totalRequests,
            rejected: engineMetrics.rateLimit.rejected,
          },
          circuitBreaker: {
            state: engineMetrics.circuitBreaker.state,
            failures: engineMetrics.circuitBreaker.failures,
            totalTrips: engineMetrics.circuitBreaker.totalTrips,
          },
        },
        meta: {
          responseTime: `${Math.round(duration * 100) / 100}ms`,
          timestamp: new Date().toISOString(),
        },
      },
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "X-Engine": "tigh/0.0.1-beta",
      },
    }
  )
}
