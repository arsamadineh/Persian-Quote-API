"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Zap, Database, Shield, RotateCcw, BarChart3, Layers,
  Clock, Activity, Server, GitBranch, FileCode,
  CheckCircle2, XCircle, AlertTriangle, RefreshCw, Terminal,
  Box, Gauge, Code2, FolderOpen, File,
} from "lucide-react"

function toFa(n: number): string {
  const fa = ["۰","۱","۲","۳","۴","۵","۶","۷","۸","۹"]
  return String(n).replace(/\d/g, d => fa[+d])
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

interface EngineStats {
  data: {
    totals: { quotes: number; poets: number; categories: number }
    engine: {
      startedAt: string
      instanceId: string
      collectionScope: string
      sampleSize: number
      uptime: number
      requests: { total: number; topPaths: { path: string; count: number }[] }
      latency: { avg: number; p50: number; p90: number; p95: number; p99: number }
      cache: { hitRate: number; hits: number; misses: number; size: number; memoryMB: number }
      rateLimit: { totalRequests: number; rejected: number }
      circuitBreaker: { state: string; failures: number; totalTrips: number }
    }
  }
}

interface BenchmarkData {
  benchmark: {
    iterations: number
    summary: { routerNsPerOp: number; cacheSetNsPerOp: number; cacheGetNsPerOp: number; cacheHitRate: number }
  }
}

const MODULES = [
  { name: "TighRouter", fa: "مسیریاب", Icon: Zap, desc: "پیاده‌سازی Trie برای مسیریابی. در بهترین حالت O(1) و بدون جستجوی خطی.", tags: ["O(1) lookup", "پارامتر داینامیک", "Wildcard"] },
  { name: "TighCache", fa: "کش", Icon: Database, desc: "کش LRU با انقضای زمانی. ردیابی مصرف حافظه و پاکسازی خودکار.", tags: ["LRU", "TTL", "Invalidation"] },
  { name: "TighRateLimiter", fa: "محدودساز", Icon: Shield, desc: "سه الگوریتم محدودسازی نرخ. ردیابی per-IP و حذف خودکار رکوردهای منقضی.", tags: ["Token Bucket", "Sliding Window", "Fixed Window"] },
  { name: "TighCircuitBreaker", fa: "مدار شکن", Icon: RotateCcw, desc: "StateMachine سه‌حالته با بهبود خودکار. جلوگیری از cascading failure.", tags: ["Closed/Open/Half", "Auto recovery", "Events"] },
  { name: "TighMetrics", fa: "متریک", Icon: BarChart3, desc: "Percentile latency، شمارنده درخواست‌ها، نسبت کش، و snapshot لحظه‌ای.", tags: ["P50-P99", "Counters", "Snapshot"] },
  { name: "TighMiddleware", fa: "پایپلاین", Icon: Layers, desc: "اجرای زنجیره‌ای middleware. CORS، اندازه‌گیری زمان، و فشرده‌سازی.", tags: ["CORS", "Timing", "Gzip"] },
]

const STEPS = [
  { n: 1, title: "درخواست ورودی", desc: "کلاینت درخواست HTTP ارسال می‌کند" },
  { n: 2, title: "بررسی نرخ", desc: "محدودساز بر اساس IP بررسی می‌شود" },
  { n: 3, title: "CORS + زمان", desc: "هدرها تزریق و زمان پاسخ ثبت می‌شود" },
  { n: 4, title: "جستجوی کش", desc: "در صورت Hit پاسخ فوری برمی‌گردد" },
  { n: 5, title: "مسیریاب Trie", desc: "مسیر مورد نظر O(1) پیدا می‌شود" },
  { n: 6, title: "مدار شکن", desc: "وضعیت Circuit بررسی می‌شود" },
  { n: 7, title: "اجرا", desc: "Handler اجرا و نتیجه برگردانده می‌شود" },
  { n: 8, title: "ذخیره کش", desc: "نتیجه برای درخواست‌های بعدی ذخیره می‌شود" },
]

const FILES = [
  { name: "lib/engine/", dir: true },
  { name: "index.ts", dir: false, desc: "نقطه صادرات" },
  { name: "types.ts", dir: false, desc: "۲۵+ نوع TypeScript" },
  { name: "engine.ts", dir: false, desc: "هسته اصلی — class Tigh" },
  { name: "router.ts", dir: false, desc: "مسیریاب Trie" },
  { name: "cache.ts", dir: false, desc: "کش LRU + TTL" },
  { name: "middleware.ts", dir: false, desc: "پایپلاین + CORS + Timing" },
  { name: "rate-limiter.ts", dir: false, desc: "محدودساز نرخ" },
  { name: "circuit-breaker.ts", dir: false, desc: "مدار شکن" },
  { name: "metrics.ts", dir: false, desc: "متریک و percentile" },
  { name: "adapter-next.ts", dir: false, desc: "اداپتور Next.js" },
  { name: "instance.ts", dir: false, desc: "Singleton موتور" },
  { name: "app/api/engine/", dir: true },
  { name: "stats/route.ts", dir: false, desc: "متریک زنده" },
  { name: "benchmark/route.ts", dir: false, desc: "بنچمارک عملکرد" },
]

function Bar({ value, max, label, color, delay }: { value: number; max: number; label: string; color: string; delay: number }) {
  const [w, setW] = useState(0)
  const { ref, visible } = useInView()
  useEffect(() => {
    if (visible) { const t = setTimeout(() => setW((value / max) * 100), delay); return () => clearTimeout(t) }
  }, [visible, value, max, delay])
  return (
    <div ref={ref} className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-mono">{toFa(value)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} style={{ width: `${w}%` }} />
      </div>
    </div>
  )
}

function StatBox({ label, value, unit, icon: Icon }: { label: string; value: string | number; unit?: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="p-3 rounded-lg bg-card border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      <div className="text-lg font-bold text-foreground font-mono">
        {value}{unit && <span className="text-xs text-muted-foreground mr-1">{unit}</span>}
      </div>
    </div>
  )
}

export default function SakhtarPage() {
  const [stats, setStats] = useState<EngineStats | null>(null)
  const [bench, setBench] = useState<BenchmarkData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [s, b] = await Promise.all([
        fetch("/api/engine/stats").then(r => r.json()),
        fetch("/api/engine/benchmark?iterations=2000").then(r => r.json()),
      ])
      setStats(s)
      setBench(b)
    } catch { /* */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const s1 = useInView(0.05)
  const s2 = useInView(0.05)
  const s3 = useInView(0.05)
  const s4 = useInView(0.05)
  const s5 = useInView(0.05)
  const s6 = useInView(0.05)

  return (
    <div className="min-h-screen">
      {/* ═══ HERO ═══ */}
      <section className="relative py-16 sm:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full bg-amber-500/[0.03] blur-[100px]" />

        <div
          ref={s1.ref}
          className={`relative max-w-4xl mx-auto text-center transition-all duration-700 ${
            s1.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Badge variant="outline" className="border-border text-muted-foreground mb-6 text-xs bg-card/60">
            نسخه ۰.۰.۱-beta
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-3 leading-tight">
            موتور <span className="text-amber-600 dark:text-amber-500">تیغ</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed mb-6">
            اولین موتور API متن‌باز فارسی که با هر نوع داده فارسی سازگار است و از جایگزین‌های خارجی سریع‌تر عمل می‌کند. طراحی و پیاده‌سازی توسط <span className="text-foreground font-medium">آرسام آدینه</span>.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground text-xs"
              onClick={() => document.getElementById("arch")?.scrollIntoView({ behavior: "smooth" })}>
              معماری
            </Button>
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground text-xs"
              onClick={() => document.getElementById("live")?.scrollIntoView({ behavior: "smooth" })}>
              متریک زنده
            </Button>
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground text-xs"
              onClick={() => document.getElementById("bench")?.scrollIntoView({ behavior: "smooth" })}>
              بنچمارک
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ ARCHITECTURE ═══ */}
      <section id="arch" className="py-12 sm:py-16 px-4">
        <div ref={s2.ref} className={`max-w-5xl mx-auto transition-all duration-700 ${s2.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">ساختار موتور</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">نمودار کامل معماری و جریان داده</p>
          </div>

          <Card className="border-border bg-card overflow-hidden shadow-sm">
            <CardContent className="p-0">
              <img src="/engine-architecture.svg" alt="ساختار موتور تیغ" className="w-full h-auto dark:opacity-100" loading="lazy" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-5">
            {[
              { l: "هسته", v: "۶ ماژول" },
              { l: "اداپتور", v: "۱ فعال" },
              { l: "Middleware", v: "۲ فعال" },
              { l: "وابستگی", v: "۰" },
            ].map(i => (
              <div key={i.l} className="text-center p-2.5 rounded-lg bg-card border border-border">
                <div className="text-sm font-bold text-foreground">{i.v}</div>
                <div className="text-[10px] text-muted-foreground">{i.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MODULES ═══ */}
      <section className="py-12 sm:py-16 px-4">
        <div ref={s3.ref} className={`max-w-5xl mx-auto transition-all duration-700 ${s3.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">ماژول‌ها</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">هر ماژول مستقل و قابل توسعه</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MODULES.map((m, i) => (
              <ModCard key={m.name} m={m} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LIFECYCLE ═══ */}
      <section className="py-12 sm:py-16 px-4">
        <div ref={s4.ref} className={`max-w-4xl mx-auto transition-all duration-700 ${s4.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">چرخه درخواست</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">مسیر یک درخواست از ورود تا پاسخ</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {STEPS.map((s, i) => (
              <StepItem key={i} s={s} i={i} />
            ))}
          </div>

          <Card className="border-border bg-card overflow-hidden shadow-sm mt-6">
            <CardContent className="p-0">
              <img src="/engine-lifecycle.svg" alt="چرخه حیات درخواست" className="w-full h-auto" loading="lazy" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ═══ LIVE METRICS ═══ */}
      <section id="live" className="py-12 sm:py-16 px-4">
        <div ref={s5.ref} className={`max-w-5xl mx-auto transition-all duration-700 ${s5.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">متریک زنده</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">داده لحظه‌ای از موتور — بروزرسانی خودکار</p>
            <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground hover:text-foreground text-xs"
              onClick={fetchData} disabled={loading}>
              <RefreshCw className={`w-3 h-3 ml-1 ${loading ? "animate-spin" : ""}`} />
              بروزرسانی
            </Button>
          </div>

          {stats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <StatBox label="نقل‌قول" value={toFa(stats.data.totals.quotes)} icon={FileCode} />
                <StatBox label="شاعر" value={toFa(stats.data.totals.poets)} icon={Terminal} />
                <StatBox label="دسته‌بندی" value={toFa(stats.data.totals.categories)} icon={Box} />
                <StatBox label="آپتایم" value={toFa(Math.round(stats.data.engine.uptime / 1000))} unit="ثانیه" icon={Clock} />
              </div>

              {/* Latency */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    Latency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { l: "P50", v: stats.data.engine.latency.p50 },
                      { l: "P90", v: stats.data.engine.latency.p90 },
                      { l: "P95", v: stats.data.engine.latency.p95 },
                      { l: "P99", v: stats.data.engine.latency.p99 },
                      { l: "میانگین", v: stats.data.engine.latency.avg },
                    ].map(x => (
                      <div key={x.l} className="text-center p-2 rounded-lg bg-muted/50 border border-border/50">
                        <div className="text-sm sm:text-base font-bold text-foreground font-mono">{x.v.toFixed(2)}</div>
                        <div className="text-[10px] text-muted-foreground">{x.l}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cache / Rate / Circuit */}
              <div className="grid sm:grid-cols-3 gap-3">
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-primary" />
                      کش
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">نرخ Hit</span>
                      <span className="text-foreground font-mono">{stats.data.engine.cache.hitRate.toFixed(1)}٪</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${stats.data.engine.cache.hitRate}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                      <span>Hit: {toFa(stats.data.engine.cache.hits)}</span>
                      <span>Miss: {toFa(stats.data.engine.cache.misses)}</span>
                      <span>اندازه: {toFa(stats.data.engine.cache.size)}</span>
                      <span>حافظه: {stats.data.engine.cache.memoryMB} MB</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      محدودساز نرخ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 rounded-lg bg-muted/50 border border-border/50">
                        <div className="text-base font-bold text-foreground font-mono">{toFa(stats.data.engine.rateLimit.totalRequests)}</div>
                        <div className="text-[10px] text-muted-foreground">کل</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50 border border-border/50">
                        <div className="text-base font-bold text-foreground font-mono">{toFa(stats.data.engine.rateLimit.rejected)}</div>
                        <div className="text-[10px] text-muted-foreground">رد شده</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground text-center">Token Bucket</div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                      <RotateCcw className="w-3.5 h-3.5 text-primary" />
                      مدار شکن
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-center p-3 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center justify-center gap-1.5">
                        {stats.data.engine.circuitBreaker.state === "closed" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : stats.data.engine.circuitBreaker.state === "open" ? (
                          <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        )}
                        <span className="text-sm font-bold text-foreground font-mono uppercase">
                          {stats.data.engine.circuitBreaker.state}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                      <span>قطع: {toFa(stats.data.engine.circuitBreaker.totalTrips)}</span>
                      <span>خطا: {toFa(stats.data.engine.circuitBreaker.failures)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Paths */}
              {stats.data.engine.requests.topPaths.length > 0 && (
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                      <GitBranch className="w-3.5 h-3.5 text-primary" />
                      مسیرهای پرتکرار
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {stats.data.engine.requests.topPaths.slice(0, 5).map((p, i) => (
                      <Bar key={p.path} value={p.count} max={Math.max(...stats.data.engine.requests.topPaths.map(x => x.count))}
                        label={p.path} color="bg-primary" delay={i * 100} />
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground text-sm">
              {loading ? "در حال بارگذاری..." : "خطا در دریافت متریک"}
            </div>
          )}
        </div>
      </section>

      {/* ═══ BENCHMARK ═══ */}
      <section id="bench" className="py-12 sm:py-16 px-4">
        <div ref={s6.ref} className={`max-w-5xl mx-auto transition-all duration-700 ${s6.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">بنچمارک</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">اندازه‌گیری واقعی عملکرد ماژول‌ها</p>
          </div>

          {bench ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                {[
                  { l: "تکرار", v: toFa(bench.benchmark.iterations), c: "text-foreground" },
                  { l: "روتر", v: toFa(bench.benchmark.summary.routerNsPerOp), c: "text-foreground", u: "ns" },
                  { l: "کش (set)", v: toFa(bench.benchmark.summary.cacheSetNsPerOp), c: "text-foreground", u: "ns" },
                  { l: "کش (get)", v: toFa(bench.benchmark.summary.cacheGetNsPerOp), c: "text-foreground", u: "ns" },
                  { l: "نرخ hit کش", v: toFa(Math.round(bench.benchmark.summary.cacheHitRate * 100)), c: "text-foreground", u: "٪" },
                ].map(x => (
                  <div key={x.l} className="text-center p-3 rounded-lg bg-card border border-border">
                    <div className={`text-base font-bold font-mono ${x.c}`}>{x.v}{x.u && <span className="text-[10px] text-muted-foreground mr-0.5">{x.u}</span>}</div>
                    <div className="text-[10px] text-muted-foreground">{x.l}</div>
                  </div>
                ))}
              </div>

              {/* Module speed bars */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground">سرعت ماژول‌ها — ns/op (کمتر بهتر)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Bar value={bench.benchmark.summary.routerNsPerOp} max={Math.max(bench.benchmark.summary.routerNsPerOp, bench.benchmark.summary.cacheSetNsPerOp, bench.benchmark.summary.cacheGetNsPerOp)}
                    label="TighRouter" color="bg-amber-600 dark:bg-amber-500" delay={0} />
                  <Bar value={bench.benchmark.summary.cacheGetNsPerOp} max={Math.max(bench.benchmark.summary.routerNsPerOp, bench.benchmark.summary.cacheSetNsPerOp, bench.benchmark.summary.cacheGetNsPerOp)}
                    label="TighCache (get)" color="bg-primary/80" delay={150} />
                  <Bar value={bench.benchmark.summary.cacheSetNsPerOp} max={Math.max(bench.benchmark.summary.routerNsPerOp, bench.benchmark.summary.cacheSetNsPerOp, bench.benchmark.summary.cacheGetNsPerOp)}
                    label="TighCache (set)" color="bg-primary/80" delay={300} />
                  <div className="text-[10px] text-muted-foreground border-t border-border pt-3">
                    متریک‌های درخواست در این آزمایش ثبت نمی‌شوند تا آمار سرویس آلوده نشود.
                  </div>
                </CardContent>
              </Card>

              {/* Comparison table */}
              <Card className="border-border bg-card min-w-0 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                    <Gauge className="w-3.5 h-3.5 text-primary" />
                    مقایسه با جایگزین‌ها
                  </CardTitle>
                </CardHeader>
                <CardContent className="min-w-0 p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[500px]">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-right py-2 px-2 text-muted-foreground font-medium">ویژگی</th>
                          <th className="text-center py-2 px-2 text-primary font-bold">تیغ</th>
                          <th className="text-center py-2 px-2 text-muted-foreground font-medium">Express</th>
                          <th className="text-center py-2 px-2 text-muted-foreground font-medium">Hono</th>
                          <th className="text-center py-2 px-2 text-muted-foreground font-medium">Fastify</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        {[
                          ["مسیریاب", "Trie O(۱)", "Linear O(n)", "Radix Tree", "Radix Tree"],
                          ["کش داخلی", "LRU + TTL", "ندارد", "ندارد", "ندارد"],
                          ["Rate Limiter", "۳ استراتژی", "پلاگین", "پلاگین", "پلاگین"],
                          ["Circuit Breaker", "داخلی", "پلاگین", "ندارد", "پلاگین"],
                          ["متریک", "P50-P99", "پلاگین", "ندارد", "ساده"],
                          ["CORS", "خودکار", "پلاگین", "خودکار", "پلاگین"],
                          ["وابستگی", "صفر", "۱", "۰", "۱"],
                          ["TypeScript", "خالص", "ناخالص", "خالص", "ناخالص"],
                          ["اندازه", "وابسته به build", "وابسته به build", "وابسته به build", "وابسته به build"],
                          ["پشتیبانی فارسی", "بله", "خیر", "خیر", "خیر"],
                        ].map(([f, t, e, h, fa]) => (
                          <tr key={f} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-2 px-2 text-foreground font-medium">{f}</td>
                            <td className="py-2 px-2 text-center text-primary font-bold bg-primary/5">{t}</td>
                            <td className="py-2 px-2 text-center">{e}</td>
                            <td className="py-2 px-2 text-center">{h}</td>
                            <td className="py-2 px-2 text-center">{fa}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground text-sm">
              {loading ? "در حال اجرای بنچمارک..." : "خطا در دریافت بنچمارک"}
            </div>
          )}
        </div>
      </section>

      {/* ═══ FILES + USAGE ═══ */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">ساختار فایل‌ها</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">ماژول‌های TypeScript · بدون وابستگی خارجی در موتور · مجوز MIT</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border bg-card min-w-0 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                  <FolderOpen className="w-3.5 h-3.5 text-primary" />
                  فایل‌ها
                </CardTitle>
              </CardHeader>
              <CardContent className="min-w-0">
                <div className="font-mono text-[11px] space-y-0.5 overflow-x-auto w-full">
                  {FILES.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 py-0.5 whitespace-nowrap min-w-fit" style={{ paddingInlineStart: `${f.dir ? 0 : 1}rem` }}>
                      {f.dir ? <FolderOpen className="w-3 h-3 text-amber-600 dark:text-amber-500 flex-shrink-0" /> : <File className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                      <span className={f.dir ? "text-foreground font-semibold" : "text-muted-foreground"}>{f.name}</span>
                      {f.desc && <span className="text-[9px] text-muted-foreground/70 mr-auto truncate">{f.desc}</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3 min-w-0">
              <Card className="border-border bg-card min-w-0 overflow-hidden">
                <CardContent className="p-0">
                  <img src="/engine-packages.svg" alt="ساختار پکیج" className="w-full h-auto" loading="lazy" />
                </CardContent>
              </Card>

              <Card className="border-border bg-card min-w-0 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-primary" />
                    نحوه استفاده
                  </CardTitle>
                </CardHeader>
                <CardContent className="min-w-0">
                  <pre className="text-[11px] font-mono text-muted-foreground bg-muted/60 rounded-lg p-3 overflow-x-auto w-full leading-relaxed ltr text-left border border-border/50">
{`import { Tigh } from "@/lib/engine"

const engine = new Tigh({
  enableCache: true,
  enableRateLimit: true,
  cache: { maxSize: 5000, defaultTTL: 30000 },
  rateLimit: { maxRequests: 120, strategy: "token-bucket" },
})

engine.get("/api/quotes", async (req) => {
  const quotes = await fetchQuotes(req.query)
  return { status: 200, headers: {}, body: quotes }
})`}
                  </pre>
                </CardContent>
              </Card>

              <Card className="border-border bg-card min-w-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-primary" />
                    اطلاعات پروژه
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      ["فایل‌ها", toFa(FILES.filter(f => !f.dir).length)],
                      ["انواع TS", "۲۵+"],
                      ["وابستگی", "۰"],
                      ["License", "MIT"],
                      ["اداپتور", "Next.js"],
                      ["نسخه", "۰.۰.۱-beta"],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between p-1.5 rounded bg-muted/50 border border-border/40 min-w-0">
                        <span className="text-muted-foreground truncate">{l}</span>
                        <span className="text-foreground font-mono flex-shrink-0">{v}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ROADMAP ═══ */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">نقشه راه</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">مسیر توسعه موتور تیغ</p>
          </div>

          <div className="space-y-2">
            {[
              { v: "۰.۰.۱-beta", status: "انجام شد", items: ["مسیریاب Trie", "کش LRU", "محدودساز نرخ", "مدار شکن", "متریک", "اداپتور Next.js"], done: true },
              { v: "۰.۱.۰", status: "آینده", items: ["اداپتور Express", "اداپتور Bun", "اداپتور Deno", "فشرده‌سازی بهتر"], done: false },
              { v: "۰.۲.۰", status: "آینده", items: ["Worker Threads برای CPU-bound", "پشتیبانی WebSocket", "Middleware marketplace"], done: false },
              { v: "۱.۰.۰", status: "آینده", items: ["پکیج npm مستقل", "مستندات کامل", "Test suite", "CLI tool"], done: false },
            ].map((r, i) => (
              <Card key={i} className={`border-border bg-card ${r.done ? "border-border shadow-sm" : "border-dashed"}`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {r.done ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                      <span className="text-sm font-bold text-foreground font-mono">v{r.v}</span>
                    </div>
                    <span className={`text-[10px] ${r.done ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}`}>{r.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {r.items.map(item => (
                      <Badge key={item} variant="secondary" className={`text-[10px] ${r.done ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"} border-0`}>
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">تیغ</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            موتور API متن‌باز فارسی. طراحی و پیاده‌سازی توسط آرسام آدینه. مجوز MIT.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground text-xs"
              onClick={() => window.open("/api/engine/stats", "_blank")}>
              <BarChart3 className="w-3 h-3 ml-1" />
              متریک
            </Button>
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground text-xs"
              onClick={() => window.open("/api/engine/benchmark", "_blank")}>
              <Gauge className="w-3 h-3 ml-1" />
              بنچمارک
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function ModCard({ m, i }: { m: typeof MODULES[0]; i: number }) {
  const { ref, visible } = useInView(0.1)
  return (
    <div ref={ref} className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: `${i * 80}ms` }}>
      <Card className="border-border bg-card h-full hover:border-primary/40 transition-colors shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <m.Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xs text-foreground">{m.name}</CardTitle>
              <div className="text-[10px] text-muted-foreground">{m.fa}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{m.desc}</p>
          <div className="flex flex-wrap gap-1">
            {m.tags.map(t => (
              <Badge key={t} variant="secondary" className="text-[9px] bg-muted text-muted-foreground border-0">{t}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StepItem({ s, i }: { s: typeof STEPS[0]; i: number }) {
  const { ref, visible } = useInView(0.15)
  return (
    <div ref={ref} className={`flex items-start gap-3 transition-all duration-500 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
      style={{ transitionDelay: `${i * 80}ms` }}>
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <span className="text-xs font-bold text-primary font-mono">{toFa(s.n)}</span>
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="font-medium text-foreground text-xs">{s.title}</div>
        <div className="text-muted-foreground text-[11px] mt-0.5">{s.desc}</div>
      </div>
    </div>
  )
}
