import { type NextRequest, NextResponse } from "next/server"
import { engine } from "@/lib/engine/instance"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const iterations = Math.min(Number.parseInt(searchParams.get("iterations") || "1000"), 10000)

  const results = {
    router: { ops: 0, avgNs: 0, totalNs: 0 },
    cache: { setOps: 0, getHitOps: 0, getMissOps: 0, avgSetNs: 0, avgGetNs: 0 },
    metrics: { ops: 0, avgNs: 0, totalNs: 0 },
  }

  // Router benchmark
  const routerStart = performance.now()
  for (let i = 0; i < iterations; i++) {
    engine.router.match('GET', `/api/quotes/hafez`)
    engine.router.match('GET', `/api/quotes/search`)
    engine.router.match('GET', `/api/stats`)
  }
  const routerElapsed = (performance.now() - routerStart) * 1_000_000
  results.router.ops = iterations * 3
  results.router.totalNs = routerElapsed
  results.router.avgNs = routerElapsed / (iterations * 3)

  // Cache benchmark
  const cacheSetStart = performance.now()
  for (let i = 0; i < iterations; i++) {
    engine.cache.set(`bench:${i}`, { data: `value-${i}`, nested: { a: 1, b: 2 } }, 60000)
  }
  const cacheSetElapsed = (performance.now() - cacheSetStart) * 1_000_000
  results.cache.setOps = iterations
  results.cache.avgSetNs = cacheSetElapsed / iterations

  const cacheGetStart = performance.now()
  for (let i = 0; i < iterations; i++) {
    engine.cache.get(`bench:${i}`)
  }
  const cacheGetElapsed = (performance.now() - cacheGetStart) * 1_000_000
  results.cache.getHitOps = iterations
  results.cache.avgGetNs = cacheGetElapsed / iterations

  for (let i = 0; i < iterations; i++) {
    engine.cache.get(`bench:miss:${i}`)
  }

  // Metrics benchmark
  const metricsStart = performance.now()
  for (let i = 0; i < iterations; i++) {
    engine.metrics.recordRequest('GET', '/api/bench', 200, Math.random() * 100)
  }
  const metricsElapsed = (performance.now() - metricsStart) * 1_000_000
  results.metrics.ops = iterations
  results.metrics.totalNs = metricsElapsed
  results.metrics.avgNs = metricsElapsed / iterations

  // Cleanup
  engine.cache.invalidatePattern('^bench:')

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
          cacheHitRate: "100%",
          metricsNsPerOp: Math.round(results.metrics.avgNs),
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
