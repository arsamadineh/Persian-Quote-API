"use client"

// صفحه مستندات — مرجع کامل برای API اشعار فارسی و موتور تیغ.
// شامل: شروع سریع، مرجع اندپوینت‌ها، معماری داخلی موتور، راهنمای
// فورک و توسعه، پرامپت‌های آماده برای دستیارهای کدنویسی، استقرار، و عیب‌یابی.

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Box,
  Check,
  CheckCircle2,
  Clock,
  Code,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  FileCode2,
  Folder,
  GaugeCircle,
  GitFork,
  Github,
  Globe,
  Info,
  KeyRound,
  Layers,
  Network,
  Package,
  Plus,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Terminal,
  TestTube,
  Timer,
  Users,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react"
import { AIPrompts } from "@/components/ai-prompts"
import { CodeBlock, InlineCode } from "@/components/code-block"

// ─────────────────────────────────────────────────────────────────────────────
// سکشن‌های TOC (نوار کناری)
// ─────────────────────────────────────────────────────────────────────────────

const TOC: { id: string; label: string; children?: { id: string; label: string }[] }[] = [
  { id: "overview", label: "معرفی کلی" },
  { id: "quickstart", label: "شروع سریع" },
  {
    id: "auth",
    label: "احراز هویت",
  },
  {
    id: "endpoints",
    label: "مرجع اندپوینت‌ها",
    children: [
      { id: "ep-quotes", label: "اشعار" },
      { id: "ep-hafez", label: "دیوان حافظ" },
      { id: "ep-shereno", label: "شعر نو" },
      { id: "ep-non-poetry", label: "سخنان بزرگان" },
      { id: "ep-search", label: "جستجو" },
      { id: "ep-poets", label: "شاعران" },
      { id: "ep-categories", label: "دسته‌بندی‌ها" },
      { id: "ep-stats", label: "آمار" },
      { id: "ep-embed", label: "ویجت" },
    ],
  },
  {
    id: "engine",
    label: "موتور تیغ",
    children: [
      { id: "engine-overview", label: "نمای کلی" },
      { id: "engine-router", label: "مسیریاب Trie" },
      { id: "engine-cache", label: "کش LRU + TTL" },
      { id: "engine-ratelimit", label: "محدودساز نرخ" },
      { id: "engine-circuit", label: "مدار شکن" },
      { id: "engine-middleware", label: "پایپلاین Middleware" },
      { id: "engine-metrics", label: "متریک‌ها" },
      { id: "engine-adapter", label: "اداپتور Next.js" },
      { id: "engine-api", label: "اندپوینت‌های موتور" },
    ],
  },
  { id: "fork", label: "فورک و توسعه موتور" },
  { id: "ai-prompts", label: "پرامپت‌های آماده" },
  { id: "examples", label: "نمونه‌های کاربردی" },
  { id: "deploy", label: "استقرار و خودمیزبانی" },
  { id: "troubleshoot", label: "عیب‌یابی" },
  { id: "errors", label: "مدیریت خطاها" },
]

// ─────────────────────────────────────────────────────────────────────────────
// تو کمکی: یک input بزرگ برای hero که CommandBar را باز می‌کند
// ─────────────────────────────────────────────────────────────────────────────

function HeroSearchInput() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("command-bar:open"))}
      className="group relative w-full max-w-xl mx-auto flex items-center gap-3 bg-card hover:bg-card/80 border border-border hover:border-primary/40 rounded-2xl px-4 py-3.5 transition-all duration-300 shadow-sm hover:shadow-md cursor-text"
    >
      <Search className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      <span className="flex-1 text-right text-sm md:text-base text-muted-foreground/80">
        جستجوی اندپوینت، راهنما، یا مفهوم...
      </span>
      <span className="cmdbar-kbd text-[10px] font-mono text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5 shrink-0 group-hover:border-primary/30 group-hover:text-primary transition-colors">
        Ctrl K
      </span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// بلوک Endpoint — استفاده مشترک برای همه اندپوینت‌ها
// ─────────────────────────────────────────────────────────────────────────────

interface EndpointCardProps {
  id: string
  title: string
  badge?: string
  description: string
  paths: string[]
  params?: { name: string; type: string; required?: boolean; default?: string; desc: string }[]
  example?: string
  liveUrl?: string
  exampleLanguage?: string
  responsePreview?: string
  notes?: React.ReactNode
  children?: React.ReactNode
}

function EndpointCard({
  id,
  title,
  badge,
  description,
  paths,
  params,
  example,
  liveUrl,
  exampleLanguage = "bash",
  responsePreview,
  notes,
  children,
}: EndpointCardProps) {
  return (
    <div id={id} className="scroll-mt-28">
      <Card className="border border-border overflow-hidden mb-6">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
              {badge && (
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-[10px]">
                  {badge}
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              GET
            </Badge>
          </div>
          <CardDescription className="text-sm md:text-base leading-relaxed">{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* مسیرها */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">مسیرها</h4>
            <div className="space-y-1.5" dir="ltr">
              {paths.map((p) => (
                <div
                  key={p}
                  className="bg-muted/60 border border-border rounded-lg px-3 py-2 font-mono text-xs md:text-[13px] text-foreground/85"
                >
                  GET {p}
                </div>
              ))}
            </div>
          </div>

          {/* پارامترها */}
          {params && params.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">پارامترها</h4>
              <div className="overflow-x-auto rounded-lg border border-border/70">
                <table className="w-full text-xs md:text-sm border-collapse min-w-[460px]" dir="rtl">
                  <thead>
                    <tr className="bg-muted/60 border-b border-border text-muted-foreground text-[11px]">
                      <th className="text-right p-2 md:p-3 font-semibold">نام</th>
                      <th className="text-center p-2 md:p-3 font-semibold">نوع</th>
                      <th className="text-center p-2 md:p-3 font-semibold">پیش‌فرض</th>
                      <th className="text-right p-2 md:p-3 font-semibold">توضیح</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {params.map((p) => (
                      <tr key={p.name} className="hover:bg-muted/20">
                        <td className="p-2 md:p-3">
                          <InlineCode>{p.name}</InlineCode>
                          {p.required && (
                            <Badge variant="destructive" className="text-[9px] mr-1.5 px-1.5 py-0">
                              لازم
                            </Badge>
                          )}
                        </td>
                        <td className="p-2 md:p-3 text-center font-mono text-muted-foreground text-[10px] md:text-xs">
                          {p.type}
                        </td>
                        <td className="p-2 md:p-3 text-center text-muted-foreground text-[11px] md:text-xs">
                          {p.default || "—"}
                        </td>
                        <td className="p-2 md:p-3 text-muted-foreground text-[11px] md:text-[13px] leading-relaxed">
                          {p.desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* مثال‌ها */}
          {example && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">نمونه درخواست</h4>
              <CodeBlock
                code={example}
                language={exampleLanguage}
                label={exampleLanguage === "bash" ? "TERMINAL" : exampleLanguage.toUpperCase()}
                liveUrl={liveUrl}
              />
            </div>
          )}

          {/* پاسخ */}
          {responsePreview && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">نمونه پاسخ</h4>
              <CodeBlock code={responsePreview} language="json" label="RESPONSE.JSON" />
            </div>
          )}

          {notes && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs md:text-sm leading-relaxed">{notes}</AlertDescription>
            </Alert>
          )}

          {children}
        </CardContent>
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// بلوک FileTree برای ساختار موتور
// ─────────────────────────────────────────────────────────────────────────────

interface FileTreeItem {
  name: string
  desc?: string
  indent: number
  isDir?: boolean
}

function FileTreeView({ items }: { items: FileTreeItem[] }) {
  return (
    <div dir="ltr" className="font-mono text-[11px] md:text-xs leading-relaxed bg-card border border-border rounded-xl p-3 md:p-4">
      {items.map((it, i) => (
        <div
          key={i}
          className="flex items-center gap-1.5 md:gap-2 py-0.5 md:py-1 hover:bg-muted/40 rounded px-1 transition-colors"
          style={{ paddingLeft: `${it.indent * 14}px` }}
        >
          {it.isDir ? (
            <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          ) : (
            <FileCode2 className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          )}
          <span className={it.isDir ? "font-bold text-foreground" : "text-foreground/80"}>
            {it.name}
          </span>
          {it.desc && <span className="text-muted-foreground/60 ml-auto">{it.desc}</span>}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// API Playground کوچک برای engine stats
// ─────────────────────────────────────────────────────────────────────────────

function MiniStats() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/engine/stats")
      const j = await res.json()
      setData(j?.data?.engine)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-center text-xs text-muted-foreground">
        <div className="persian-loading mx-auto mb-2" />
        در حال دریافت متریک زنده از موتور...
      </div>
    )
  }
  if (!data) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-center text-xs text-destructive">
        خطا در دریافت متریک از <InlineCode>/api/engine/stats</InlineCode>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
      <LiveStat label="P50 latency" value={`${data.latency.p50}ms`} icon={<Timer className="w-3.5 h-3.5" />} />
      <LiveStat label="P99 latency" value={`${data.latency.p99}ms`} icon={<Timer className="w-3.5 h-3.5" />} />
      <LiveStat
        label="Cache hit"
        value={`${data.cache.hitRate.toFixed(2)}%`}
        icon={<Database className="w-3.5 h-3.5" />}
      />
      <LiveStat
        label="درخواست‌ها"
        value={data.requests.total}
        icon={<Network className="w-3.5 h-3.5" />}
      />
      <LiveStat
        label="مدار شکن"
        value={data.circuitBreaker.state}
        icon={<ShieldCheck className="w-3.5 h-3.5" />}
        state={data.circuitBreaker.state}
      />
      <LiveStat label="Memory" value={`${data.cache.memoryMB}MB`} icon={<Box className="w-3.5 h-3.5" />} />
      <LiveStat label="Rate Limit" value={data.rateLimit.totalRequests} icon={<GaugeCircle className="w-3.5 h-3.5" />} />
      <LiveStat label="Uptime" value={`${Math.floor(data.uptime / 1000)}s`} icon={<Clock className="w-3.5 h-3.5" />} />
    </div>
  )
}

function LiveStat({
  label,
  value,
  icon,
  state,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  state?: string
}) {
  const color =
    state === "open"
      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
      : state === "half-open"
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
        : "bg-card text-foreground border-border"
  return (
    <div className={`rounded-lg border ${color} p-3 flex flex-col gap-1`}>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
        <span className="truncate">{label}</span>
        {icon}
      </div>
      <span className="text-base md:text-lg font-bold font-mono truncate">{value}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// کامپوننت اصلی
// ─────────────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const tocRef = useRef<HTMLElement>(null)

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60 py-12 md:py-20 px-4">
        <div className="hero-pattern" />
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <Badge variant="secondary" className="mb-4 text-xs font-mono">
            موتور تیغ ۰.۰.۱-beta • متریک‌های این صفحه زنده هستند
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">
            مستندات <span className="text-primary">API اشعار فارسی</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            مرجع کامل برای API داده، موتور تیغ، فورک و توسعه، و پرامپت‌های آماده برای دستیارهای کدنویسی.
          </p>

          <HeroSearchInput />

          <p className="mt-3 text-[11px] text-muted-foreground/70">
            یا فشار دهید <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">/</kbd>{" "}
            در هر صفحه‌ای
          </p>
        </div>
      </section>

      {/* محتوای اصلی */}
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6 md:gap-10">
          {/* نوار کناری TOC */}
          <aside ref={tocRef} className="hidden lg:block">
            <div className="sticky top-24">
              <Card className="p-4 border-border/70">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">فهرست مطالب</h3>
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <nav className="space-y-1 text-[13px] max-h-[70vh] overflow-y-auto pr-1" dir="rtl">
                  {TOC.map((s) => (
                    <div key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="block text-foreground/75 hover:text-primary transition-colors py-1 font-medium"
                      >
                        {s.label}
                      </a>
                      {s.children && (
                        <div className="mr-3 space-y-0.5 mt-0.5 border-r border-border pr-3">
                          {s.children.map((c) => (
                            <a
                              key={c.id}
                              href={`#${c.id}`}
                              className="block text-[12px] text-muted-foreground hover:text-primary/80 transition-colors py-0.5"
                            >
                              {c.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </Card>

              <div className="mt-3 px-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-[12px] h-9"
                  onClick={() => window.dispatchEvent(new CustomEvent("command-bar:open"))}
                >
                  <Search className="w-3.5 h-3.5 ml-1.5" />
                  باز کردن جستجوی سراسری
                  <kbd className="mr-auto text-[10px] font-mono px-1.5 py-0.5 bg-muted border border-border rounded">
                    Ctrl K
                  </kbd>
                </Button>
              </div>
            </div>
          </aside>

          {/* ستون اصلی */}
          <div className="min-w-0 space-y-10 md:space-y-14">
            {/* ─── معرفی کلی ─── */}
            <section id="overview" className="scroll-mt-28 space-y-5">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">معرفی کلی</h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  API رایگان و متن‌باز برای دسترسی به مجموعه‌ای از اشعار و سخنان فارسی. تعداد دقیق اسناد، شاعران و
                  دسته‌بندی‌ها در بخش متریک زنده از دادهٔ واقعی مخزن خوانده می‌شود.
                </p>
              </div>

              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription className="text-sm md:text-base leading-relaxed">
                  بدون ثبت‌نام، بدون کلید، بدون محدودیت پرداخت. فقط یک درخواست HTTP ارسال کنید و پاسخ
                  JSON دریافت کنید.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { label: "تعداد اسناد", value: "زنده", icon: BookOpen },
                  { label: "تعداد شاعران", value: "زنده", icon: Users },
                  { label: "پیاده‌سازی", value: "TypeScript", icon: Code },
                ].map((s) => (
                  <Card key={s.label} className="p-4 border-border/70">
                    <div className="flex items-center justify-between mb-2">
                      <s.icon className="w-4 h-4 text-primary" />
                      <span className="text-2xl md:text-3xl font-bold text-foreground">{s.value}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </Card>
                ))}
              </div>

              {/* متریک زنده موتور */}
              <Card className="p-4 md:p-5 border-border/70">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-engine-pulse" />
                    <h3 className="font-bold text-sm md:text-base">متریک زنده موتور</h3>
                  </div>
                  <a href="/sakhtar" className="text-[11px] text-primary hover:underline flex items-center gap-1">
                    مشاهده کامل
                    <ArrowLeft className="w-3 h-3" />
                  </a>
                </div>
                <MiniStats />
              </Card>
            </section>

            {/* ─── شروع سریع ─── */}
            <section id="quickstart" className="scroll-mt-28 space-y-5">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">شروع سریع</h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  اولین درخواست در کمتر از ۳۰ ثانیه. هیچ مرحله نصبی لازم نیست — فقط یک درخواست HTTP ارسال کنید.
                </p>
              </div>

              <Tabs defaultValue="curl" className="w-full">
                <TabsList className="flex w-full overflow-x-auto mb-4 bg-muted/50 p-1 scrollbar-none">
                  <TabsTrigger value="curl" className="flex-none">
                    cURL
                  </TabsTrigger>
                  <TabsTrigger value="js" className="flex-none">
                    JavaScript
                  </TabsTrigger>
                  <TabsTrigger value="py" className="flex-none">
                    Python
                  </TabsTrigger>
                  <TabsTrigger value="php" className="flex-none">
                    PHP
                  </TabsTrigger>
                  <TabsTrigger value="go" className="flex-none">
                    Go
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="curl">
                  <CodeBlock
                    code={`# دریافت یک شعر تصادفی
curl "https://pq.arsamadineh.ir/api/quotes?random=true&limit=1"

# دریافت ۵ شعر از حافظ
curl "https://pq.arsamadineh.ir/api/quotes/hafez?limit=5"

# فال حافظ (یک غزل تصادفی)
curl "https://pq.arsamadineh.ir/api/quotes/hafez?random=true&limit=1"

# جستجوی کلمه «عشق»
curl "https://pq.arsamadineh.ir/api/quotes/search?q=%D8%B9%D8%B4%D9%82&limit=5"`}
                    language="bash"
                    label="TERMINAL"
                    liveUrl="/api/quotes?random=true&limit=1"
                  />
                </TabsContent>

                <TabsContent value="js">
                  <CodeBlock
                    code={`// با fetch در جاوااسکریپت مدرن
async function getRandomQuote() {
  const res = await fetch('https://pq.arsamadineh.ir/api/quotes?random=true&limit=1')
  if (!res.ok) throw new Error('خطا در دریافت')
  const { data } = await res.json()
  return data[0]
}

// یا در Node.js با ابزارهای قدیمی‌تر
const https = require('https')
https.get('https://pq.arsamadineh.ir/api/quotes?random=true&limit=1', (res) => {
  let body = ''
  res.on('data', (chunk) => (body += chunk))
  res.on('end', () => console.log(JSON.parse(body)))
})`}
                    language="javascript"
                    filename="fetch-random.js"
                  />
                </TabsContent>

                <TabsContent value="py">
                  <CodeBlock
                    code={`import requests

def get_random_quote():
    r = requests.get(
        "https://pq.arsamadineh.ir/api/quotes",
        params={"random": "true", "limit": 1},
        timeout=5,
    )
    r.raise_for_status()
    payload = r.json()
    return payload["data"][0]

quote = get_random_quote()
print(f"{quote['text_persian']}\\n  — {quote['poet']}")`}
                    language="python"
                    filename="fetch_random.py"
                  />
                </TabsContent>

                <TabsContent value="php">
                  <CodeBlock
                    code={`<?php
// با cURL داخلی
function getRandomQuote(): ?array {
    $ch = curl_init('https://pq.arsamadineh.ir/api/quotes?random=true&limit=1');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_HTTPHEADER => ['Accept: application/json'],
    ]);
    $body = curl_exec($ch);
    curl_close($ch);
    return json_decode($body, true)['data'][0] ?? null;
}

$quote = getRandomQuote();
echo $quote['text_persian'] . PHP_EOL;
echo "  — " . $quote['poet'] . PHP_EOL;`}
                    language="php"
                    filename="fetch-random.php"
                  />
                </TabsContent>

                <TabsContent value="go">
                  <CodeBlock
                    code={`package main

import (
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

type Quote struct {
    TextPersian string \`json:"text_persian"\`
    Poet        string \`json:"poet"\`
}

func main() {
    res, err := http.Get("https://pq.arsamadineh.ir/api/quotes?random=true&limit=1")
    if err != nil { panic(err) }
    defer res.Body.Close()

    body, _ := io.ReadAll(res.Body)
    var payload struct {
        Data []Quote \`json:"data"\`
    }
    json.Unmarshal(body, &payload)

    q := payload.Data[0]
    fmt.Println(q.TextPersian)
    fmt.Println("  —", q.Poet)
}`}
                    language="go"
                    filename="main.go"
                  />
                </TabsContent>
              </Tabs>

              <Card className="border-primary/20 bg-primary/5 p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <Rocket className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm md:text-base mb-1">پنج اندپوینت برتر برای شروع</h4>
                    <ul className="text-xs md:text-[13px] text-muted-foreground space-y-1" dir="ltr">
                      <li><InlineCode>GET /api/quotes?random=true&limit=1</InlineCode></li>
                      <li><InlineCode>GET /api/quotes/hafez?random=true&limit=1</InlineCode></li>
                      <li><InlineCode>GET /api/quotes/search?q=عشق</InlineCode></li>
                      <li><InlineCode>GET /api/poets?stats=true</InlineCode></li>
                      <li><InlineCode>GET /api/engine/stats</InlineCode></li>
                    </ul>
                  </div>
                </div>
              </Card>
            </section>

            {/* ─── احراز هویت ─── */}
            <section id="auth" className="scroll-mt-28 space-y-5">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">احراز هویت</h2>

              <Card className="p-5 md:p-6 border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-start gap-3 md:gap-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-lg md:text-xl text-foreground mb-2">
                      احراز هویت لازم نیست
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      تمام اندپوینت‌ها کاملاً عمومی هستند. هیچ کلید API، توکن، یا ثبت‌نامی نیاز نیست. فقط
                      کافی است درخواست HTTP ارسال کنید. هدر <InlineCode>Accept: application/json</InlineCode> اختیاری است.
                    </p>
                  </div>
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                <Card className="p-4 border-border/70">
                  <div className="flex items-center gap-2 mb-2">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-sm">نرخ درخواست منصفانه</h4>
                  </div>
                  <p className="text-xs md:text-[13px] text-muted-foreground leading-relaxed">
                    موتور تیغ به‌طور پیش‌فرض ۱۲۰ درخواست در دقیقه برای هر IP مجاز می‌کند. اگر به بیشتر نیاز
                    دارید، صفحه محدودساز نرخ را ببینید.
                  </p>
                </Card>

                <Card className="p-4 border-border/70">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-sm">CORS باز</h4>
                  </div>
                  <p className="text-xs md:text-[13px] text-muted-foreground leading-relaxed">
                    تمام اندپوینت‌ها برای استفاده از مرورگر و فرانت‌اند پاسخ‌گو هستند. می‌توانید مستقیماً از
                    دامنه خودتان fetch کنید.
                  </p>
                </Card>
              </div>
            </section>

            {/* ─── مرجع اندپوینت‌ها ─── */}
            <section id="endpoints" className="scroll-mt-28 space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  مرجع اندپوینت‌ها
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  تمام روش‌ها <InlineCode>GET</InlineCode> هستند. پاسخ‌ها همگی JSON با ساختار یکپارچه
                  <InlineCode>{`{ success, data, count, meta }`}</InlineCode>.
                </p>
              </div>

              <EndpointCard
                id="ep-quotes"
                title="دریافت اشعار"
                description="لیست اشعار با فیلتر اختیاری بر اساس شاعر، دسته‌بندی، و انتخاب تصادفی. تمام خروجی‌ها به فارسی و انگلیسی موجود است."
                paths={[
                  "/api/quotes",
                  "/api/quotes/[poet]",
                  "/api/quotes/category/[category]",
                ]}
                params={[
                  { name: "limit", type: "number", default: "10", desc: "تعداد اشعار بازگشتی (حداکثر 100)" },
                  { name: "random", type: "boolean", default: "false", desc: "انتخاب تصادفی اشعار" },
                  { name: "poet", type: "string", desc: "فیلتر بر اساس نام شاعر (مثلاً: مولانا)" },
                  { name: "category", type: "string", desc: "فیلتر بر اساس دسته‌بندی (مثلاً: عشق)" },
                ]}
                example={`# پنج شعر تصادفی
curl "https://pq.arsamadineh.ir/api/quotes?random=true&limit=5"

# تمام اشعار حافظ
curl "https://pq.arsamadineh.ir/api/quotes/%D9%85%D9%88%D9%84%D8%A7%D9%86%D8%A7"

# اشعار عاشقانه
curl "https://pq.arsamadineh.ir/api/quotes/category/%D8%B9%D8%B4%D9%82"`}
                liveUrl="/api/quotes?random=true&limit=1"
                responsePreview={`{
  "success": true,
  "data": [
    {
      "id": 1,
      "text_persian": "عاشقان مرده‌اند در عشق زنده\\nتا ابد در دل جانان پاینده",
      "text_english": "Lovers are dead in love, yet alive...",
      "poet": "مولانا جلال‌الدین رومی",
      "poet_english": "Rumi",
      "source": "دیوان شمس",
      "category": "عشق",
      "tags": ["عشق", "زندگی", "جاودانگی"]
    }
  ],
  "count": 1,
  "meta": { "limit": 1, "random": true }
}`}
              />

              <EndpointCard
                id="ep-hafez"
                title="دیوان حافظ"
                badge="نمونه پاسخ: ۴۹۷ غزل"
                description="دسترسی کامل به تمام غزلیات خواجه شمس‌الدین حافظ شیرازی با ساختار بیتی (مصرع اول و دوم). پارامتر q جستجوی متنی اختصاصی دارد."
                paths={["/api/quotes/hafez"]}
                params={[
                  { name: "id", type: "number", desc: "دریافت غزل با شماره موجود در مجموعه" },
                  { name: "q", type: "string", desc: "جستجو در بین مصرع‌های دیوان" },
                  { name: "limit", type: "number", default: "10", desc: "تعداد غزل‌ها (حداکثر 100)" },
                  { name: "random", type: "boolean", default: "false", desc: "دریافت تصادفی (فال حافظ)" },
                ]}
                example={`# فال حافظ — یک غزل تصادفی
curl "https://pq.arsamadineh.ir/api/quotes/hafez?random=true&limit=1"

# غزل شماره ۱
curl "https://pq.arsamadineh.ir/api/quotes/hafez?id=1"

# جستجوی کلمه «رند»
curl "https://pq.arsamadineh.ir/api/quotes/hafez?q=%D8%B1%D9%86%D8%AF"`}
                liveUrl="/api/quotes/hafez?random=true&limit=1"
                responsePreview={`{
  "success": true,
  "data": [
    {
      "id": 1,
      "verses": [
        ["الا یا ایها الساقی ادر کاسا و ناولها", "که عشق آسان نمود اول ولی افتاد مشکل‌ها"],
        ["به بوی نافه کاخر صبا زان طره بگشاید", "ز تاب جعد مشکینش چه خون افتاد در دل‌ها"]
      ],
      "poet": "حافظ شیرازی",
      "source": "دیوان حافظ"
    }
  ],
  "count": 1,
  "total": "نمونه؛ مقدار واقعی از API خوانده می‌شود"
}`}
                notes={
                  <>
                    هر آیتم <InlineCode>verses</InlineCode> یک آرایه از زوج‌های{" "}
                    <InlineCode>[مصرع اول، مصرع دوم]</InlineCode> است. ساختار بیتی برای نمایش آسان در رابط کاربری.
                  </>
                }
              />

              <EndpointCard
                id="ep-shereno"
                title="شعر نو معاصر"
                badge="نمونه پاسخ: ۴۴۰۰ اثر"
                description="اشعار نو از پیشگامان شعر نو فارسی شامل نیما یوشیج، سهراب سپهری، و دیگر شاعران معاصر."
                paths={["/api/quotes/shereno"]}
                params={[
                  { name: "poet", type: "string", desc: "نام شاعر (مثلاً: نیما یوشیج، سهراب سپهری)" },
                  { name: "title", type: "string", desc: "جستجو در عنوان شعر" },
                  { name: "limit", type: "number", default: "10", desc: "تعداد اشعار (حداکثر 100)" },
                  { name: "random", type: "boolean", default: "false", desc: "انتخاب تصادفی" },
                ]}
                example={`# یک شعر نو تصادفی
curl "https://pq.arsamadineh.ir/api/quotes/shereno?random=true&limit=1"

# فقط اشعار نیما یوشیج
curl "https://pq.arsamadineh.ir/api/quotes/shereno?poet=%D9%86%DB%8C%D9%85%D8%A7"`}
                liveUrl="/api/quotes/shereno?random=true&limit=1"
                responsePreview={`{
  "success": true,
  "data": [
    {
      "id": 2,
      "title": "قایق",
      "poem": "من چهره‌ام گرفته / من قایقم نشسته به خشکی...",
      "poet": "نیما یوشیج",
      "book": "مجموعه اشعار"
    }
  ],
  "count": 1,
  "total": "نمونه؛ مقدار واقعی از API خوانده می‌شود"
}`}
              />

              <EndpointCard
                id="ep-non-poetry"
                title="سخنان بزرگان"
                badge="غیرشعری"
                description="نقل‌قول‌های ارزشمند و الهام‌بخش از بزرگ‌ترین اندیشمندان تاریخ جهان — به زبان فارسی."
                paths={["/api/quotes/non-poetry"]}
                params={[
                  { name: "author", type: "string", desc: "نام گوینده (مثلاً: انیشتین)" },
                  { name: "limit", type: "number", default: "10", desc: "تعداد نقل‌قول‌ها (حداکثر 100)" },
                  { name: "random", type: "boolean", default: "false", desc: "انتخاب تصادفی" },
                ]}
                example={`# یک نقل‌قول تصادفی
curl "https://pq.arsamadineh.ir/api/quotes/non-poetry?random=true&limit=1"

# فقط سخنان ایلان ماسک
curl "https://pq.arsamadineh.ir/api/quotes/non-poetry?author=%D8%A7%DB%8C%D9%84%D8%A7%D9%86"`}
                liveUrl="/api/quotes/non-poetry?random=true&limit=1"
                responsePreview={`{
  "success": true,
  "data": [
    {
      "id": 2,
      "body": "راه حل موفقیت این است که اشتیاق شما به پیروزی بیشتر از ترس شما از شکست باشد.",
      "author": "آلبرت انیشتین"
    }
  ],
  "count": 1,
  "total": "نمونه؛ مقدار واقعی از API خوانده می‌شود"
}`}
              />

              <EndpointCard
                id="ep-search"
                title="جستجو در اشعار"
                description="جستجوی متنی در تمام پایگاه داده با پشتیبانی از فارسی، انگلیسی، یا هر دو."
                paths={["/api/quotes/search"]}
                params={[
                  { name: "q", type: "string", required: true, desc: "کلمه یا عبارت جستجو (حداقل ۲ کاراکتر)" },
                  { name: "limit", type: "number", default: "10", desc: "تعداد نتایج (حداکثر ۵۰)" },
                  { name: "lang", type: "string", default: "both", desc: "زبان: persian | english | both" },
                ]}
                example={`# جستجوی کلمه عشق
curl "https://pq.arsamadineh.ir/api/quotes/search?q=%D8%B9%D8%B4%D9%82&limit=5"

# جستجو در متن انگلیسی
curl "https://pq.arsamadineh.ir/api/quotes/search?q=love&lang=english&limit=3"`}
                liveUrl="/api/quotes/search?q=عشق&limit=5"
                notes="جستجو بر اساس substring است — برای عبارات دقیق از کوتیشن در پارامتر q استفاده کنید."
              />

              <EndpointCard
                id="ep-poets"
                title="فهرست شاعران"
                description="دریافت اطلاعات شاعران شامل نام فارسی، نام لاتین، و آمار اشعار."
                paths={["/api/poets"]}
                params={[
                  { name: "stats", type: "boolean", default: "false", desc: "افزودن فیلد quote_count به هر شاعر" },
                ]}
                example={`curl "https://pq.arsamadineh.ir/api/poets?stats=true"`}
                liveUrl="/api/poets?stats=true"
              />

              <EndpointCard
                id="ep-categories"
                title="دسته‌بندی‌ها"
                description="لیست دسته‌بندی‌های موضوعی شامل عشق، عرفان، حکمت، طبیعت، اخلاق، و زندگی."
                paths={["/api/categories"]}
                params={[
                  { name: "stats", type: "boolean", default: "false", desc: "افزودن فیلد quote_count" },
                ]}
                example={`curl "https://pq.arsamadineh.ir/api/categories?stats=true"`}
                liveUrl="/api/categories?stats=true"
              />

              <EndpointCard
                id="ep-stats"
                title="آمار پایگاه داده"
                description="تعداد کل اشعار، شاعران، و منابع داده."
                paths={["/api/stats"]}
                example={`curl "https://pq.arsamadineh.ir/api/stats"`}
                liveUrl="/api/stats"
              />

              <EndpointCard
                id="ep-embed"
                title="ویجت قابل تعبیه"
                badge="HTML + iframe"
                description="تولید HTML برای نمایش اشعار در سایت شخص ثالث. پنج قالب ظاهری، سه اندازه، و دو حالت تازه‌سازی خودکار."
                paths={["/api/embed"]}
                params={[
                  { name: "theme", type: "string", default: "default", desc: "default | elegant | minimal | classic | modern" },
                  { name: "size", type: "string", default: "medium", desc: "small | medium | large" },
                  { name: "poet", type: "string", desc: "فیلتر شاعر خاص" },
                  { name: "category", type: "string", desc: "فیلتر دسته‌بندی خاص" },
                  { name: "auto_refresh", type: "boolean", default: "false", desc: "تازه‌سازی خودکار هر ۳۰ ثانیه" },
                ]}
                example={`<iframe
  src="https://pq.arsamadineh.ir/api/embed?theme=classic&poet=rumi"
  width="100%"
  height="300"
  frameborder="0"
></iframe>`}
                exampleLanguage="html"
                notes="برای ساخت تعاملی، به صفحه ویجت‌ساز مراجعه کنید."
              >
                <div className="pt-2">
                  <Link href="/embed">
                    <Button variant="outline" size="sm">
                      <Wrench className="w-3.5 h-3.5 ml-1.5" />
                      ویجت‌ساز تعاملی
                    </Button>
                  </Link>
                </div>
              </EndpointCard>
            </section>

            {/* ─── موتور تیغ ─── */}
            <section id="engine" className="scroll-mt-28 space-y-8">
              <div id="engine-overview" className="scroll-mt-28">
                <Badge variant="secondary" className="mb-3 text-[10px] font-mono">
                  CORE
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">موتور تیغ</h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  یک موتور API نوشته‌شده در TypeScript خالص؛ ماژول‌های موتور به وابستگی خارجی نیاز ندارند. مناسب برای
                  هر پروژه‌ای که به مسیریابی سریع، کش هوشمند، و متریک زنده نیاز دارد.
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-3">
                {[
                  { label: "فایل‌های TS", value: "۹", icon: FileCode2 },
                  { label: "اندازه bundle", value: "وابسته به build", icon: Box },
                  { label: "وابستگی", value: "۰", icon: Package },
                  { label: "مجوز", value: "MIT", icon: ShieldCheck },
                ].map((s) => (
                  <Card key={s.label} className="p-3 md:p-4 border-border/70">
                    <div className="flex items-center justify-between mb-2">
                      <s.icon className="w-4 h-4 text-primary" />
                      <span className="text-xl font-bold text-foreground font-mono">{s.value}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{s.label}</span>
                  </Card>
                ))}
              </div>

              <FileTreeView
                items={[
                  { name: "lib/engine/", isDir: true, indent: 0 },
                  { name: "index.ts", desc: "نقطه export", indent: 1 },
                  { name: "types.ts", desc: "اینترفیس‌ها", indent: 1 },
                  { name: "engine.ts", desc: "Tigh — orchestrator", indent: 1 },
                  { name: "router.ts", desc: "Trie matcher", indent: 1 },
                  { name: "cache.ts", desc: "LRU + TTL", indent: 1 },
                  { name: "middleware.ts", desc: "CORS + timing + compress", indent: 1 },
                  { name: "rate-limiter.ts", desc: "۳ استراتژی", indent: 1 },
                  { name: "circuit-breaker.ts", desc: "۳ حالت", indent: 1 },
                  { name: "metrics.ts", desc: "Percentile + counter", indent: 1 },
                  { name: "adapter-next.ts", desc: "createNextHandler", indent: 1 },
                  { name: "instance.ts", desc: "singleton", indent: 1 },
                  { name: "app/api/", isDir: true, indent: 0 },
                  { name: "engine/stats/route.ts", indent: 1 },
                  { name: "engine/benchmark/route.ts", indent: 1 },
                ]}
              />

              {/* ─── مسیریاب Trie ─── */}
              <div id="engine-router" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-primary" />
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">مسیریاب Trie</h3>
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  <InlineCode>TighRouter</InlineCode> از ساختار Trie برای matching استفاده می‌کند. به جای جستجوی
                  خطی O(n) در لیست مسیرها، مسیر ورودی به segment تقسیم می‌شود و در هر گره درخت Trie تنها یک
                  شاخه پیمایش می‌شود.
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  <Card className="p-4 border-border/70">
                    <h4 className="font-bold text-sm mb-2">پارامتر داینامیک</h4>
                    <CodeBlock
                      code={"/api/quotes/[poet]\n/api/quotes/hafez\n→ { poet: \"hafez\" }"}
                      language="text"
                      maxHeight="90px"
                    />
                  </Card>
                  <Card className="p-4 border-border/70">
                    <h4 className="font-bold text-sm mb-2">Wildcard</h4>
                    <CodeBlock
                      code={"/api/static/*\n/api/static/css/style.css\n→ { wildcard: \"css/style.css\" }"}
                      language="text"
                      maxHeight="90px"
                    />
                  </Card>
                  <Card className="p-4 border-border/70">
                    <h4 className="font-bold text-sm mb-2">ترکیبی</h4>
                    <CodeBlock
                      code={"/api/[version]/users/[id]\n/api/v2/users/42\n→ { version: \"v2\", id: \"42\" }"}
                      language="text"
                      maxHeight="90px"
                    />
                  </Card>
                </div>
              </div>

              {/* ─── کش ─── */}
              <div id="engine-cache" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">کش LRU + TTL</h3>
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  <InlineCode>TighCache</InlineCode> با دو مکانیزم Eviction:
                </p>
                <ul className="text-xs md:text-[13px] text-muted-foreground space-y-1.5 list-disc pr-5">
                  <li>
                    <strong>LRU (Least Recently Used):</strong> وقتی اندازه به سقف می‌رسد، کم‌استفاده‌ترین کلید
                    حذف می‌شود.
                  </li>
                  <li>
                    <strong>TTL (Time To Live):</strong> هر کلید پس از انقضا به‌طور خودکار از کش خارج می‌شود.
                  </li>
                  <li>
                    <strong>invalidatePattern:</strong> حذف گروهی کلیدها بر اساس الگوی regex.
                  </li>
                </ul>
                <CodeBlock
                  code={`// استفاده در یک route
engine.get("/api/quotes/popular", async () => {
  const top = await db.quotes
    .orderBy("likes", "desc")
    .limit(20)
  return {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: top,
  }
}, {
  cache: {
    ttl: 5 * 60_000,             // ۵ دقیقه
    key: (req) => \`popular:\${req.ip}\`,
  },
})`}
                  language="typescript"
                  filename="routes/quotes-popular.ts"
                />
              </div>

              {/* ─── محدودساز نرخ ─── */}
              <div id="engine-ratelimit" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2">
                  <GaugeCircle className="w-5 h-5 text-primary" />
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">محدودساز نرخ</h3>
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  <InlineCode>TighRateLimiter</InlineCode> سه استراتژی برای کنترل نرخ درخواست دارد:
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    {
                      name: "Token Bucket",
                      desc: "پیش‌فرض. درخواست‌ها با سرعت ثابت جایگزین می‌شوند.",
                      ideal: "ترافیک متغیر و burst-پذیر",
                    },
                    {
                      name: "Sliding Window",
                      desc: "شمارش دقیق درخواست‌ها در پنجره زمانی شناور.",
                      ideal: "ترافیک یکنواخت",
                    },
                    {
                      name: "Fixed Window",
                      desc: "شمارش ساده در هر پنجره زمانی ثابت.",
                      ideal: "ترافیک قابل پیش‌بینی",
                    },
                  ].map((s) => (
                    <Card key={s.name} className="p-4 border-border/70">
                      <h4 className="font-bold text-sm">{s.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
                      <p className="text-[10px] text-primary mt-2 font-mono">{s.ideal}</p>
                    </Card>
                  ))}
                </div>
                <CodeBlock
                  code={`// هدرهای پاسخ
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1751640000
Retry-After: 30    // فقط در حالت 429`}
                  language="http"
                  label="RESPONSE HEADERS"
                />
              </div>

              {/* ─── مدار شکن ─── */}
              <div id="engine-circuit" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">مدار شکن</h3>
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  <InlineCode>TighCircuitBreaker</InlineCode> از الگوی سه‌حالته پیروی می‌کند تا از فراخوانی
                  بیش از حد یک endpoint ناپایدار جلوگیری کند.
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  <Card className="p-4 border-emerald-500/40 bg-emerald-500/5">
                    <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-400">CLOSED</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      حالت عادی. درخواست‌ها عبور می‌کنند. خطاها شمارش می‌شوند.
                    </p>
                  </Card>
                  <Card className="p-4 border-rose-500/40 bg-rose-500/5">
                    <h4 className="font-bold text-sm text-rose-700 dark:text-rose-400">OPEN</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      پس از رسیدن به آستانه خطا، درخواست‌ها بلاک می‌شوند (۵۰۳). پس از{" "}
                      <InlineCode>recoveryTimeout</InlineCode> به half-open می‌رود.
                    </p>
                  </Card>
                  <Card className="p-4 border-amber-500/40 bg-amber-500/5">
                    <h4 className="font-bold text-sm text-amber-700 dark:text-amber-400">HALF-OPEN</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      تعداد محدودی درخواست آزمایشی ارسال می‌شود. موفقیت → closed، شکست → open.
                    </p>
                  </Card>
                </div>
              </div>

              {/* ─── Middleware ─── */}
              <div id="engine-middleware" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">پایپلاین Middleware</h3>
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  <InlineCode>TighMiddleware</InlineCode> هر درخواست را از طریق زنجیره‌ای از middlewareها
                  عبور می‌دهد. دو middleware پیش‌فرض فعال هستند و فشرده‌سازی به‌صورت اختیاری در دسترس است:
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { name: "corsMiddleware", desc: "تزریق هدرهای CORS و پاسخ ۲۰۴ به OPTIONS" },
                    { name: "timingMiddleware", desc: "اندازه‌گیری پاسخ + تزریق X-Request-Id" },
                    { name: "compressMiddleware", desc: "فشرده‌سازی gzip اختیاری در پاسخ‌های بزرگ" },
                  ].map((m) => (
                    <Card key={m.name} className="p-3 border-border/70">
                      <InlineCode className="text-[11px]">{m.name}</InlineCode>
                      <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{m.desc}</p>
                    </Card>
                  ))}
                </div>
                <CodeBlock
                  code={`// افزودن middleware سفارشی
engine.use(async (req, next) => {
  const start = Date.now()
  const res = await next()
  console.log(\`\${req.method} \${req.path} → \${res.status} (\${Date.now() - start}ms)\`)
  return res
})`}
                  language="typescript"
                  filename="middleware/logger.ts"
                />
              </div>

              {/* ─── متریک ─── */}
              <div id="engine-metrics" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-primary" />
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">متریک‌ها</h3>
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  <InlineCode>TighMetrics</InlineCode> به‌طور خودکار برای هر درخواست latency، method، path و
                  status code را ثبت می‌کند. percentileها به‌صورت بلادرنگ محاسبه می‌شوند.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {["P50", "P90", "P95", "P99", "AVG"].map((p) => (
                    <Card key={p} className="p-3 text-center border-border/70">
                      <span className="text-[11px] text-muted-foreground block">{p} latency</span>
                      <span className="text-xl font-bold font-mono text-primary">~{p === "AVG" ? "12" : "20"}ms</span>
                    </Card>
                  ))}
                </div>
              </div>

              {/* ─── اداپتور ─── */}
              <div id="engine-adapter" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">اداپتور Next.js</h3>
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  <InlineCode>createNextHandler(engine)</InlineCode> یک NextRequest می‌گیرد و آن را به
                  TighRequest تبدیل می‌کند، در موتور اجرا می‌کند، و پاسخ را به‌صورت{" "}
                  <InlineCode>Response</InlineCode> استاندارد Web برمی‌گرداند.
                </p>
                <CodeBlock
                  code={`import { createNextHandler } from "@/lib/engine"
import { engine } from "@/lib/engine/instance"

export const dynamic = "force-dynamic"

export const GET = createNextHandler(engine)
// به همین سادگی تمام handlerهای شما از موتور عبور می‌کنند
// و از کش، rate limit، circuit breaker، و متریک بهره می‌برند.`}
                  language="typescript"
                  filename="app/api/(proxy)/route.ts"
                />
              </div>

              {/* ─── اندپوینت‌های موتور ─── */}
              <div id="engine-api" className="scroll-mt-28 space-y-4">
                <Badge variant="outline" className="text-[10px] border-primary/30">
                  LIVE
                </Badge>
                <h3 className="text-xl md:text-2xl font-bold text-foreground">اندپوینت‌های موتور</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  دو اندپوینت برای مشاهده وضعیت داخلی موتور — بدون احراز هویت:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <Card className="p-4 border-border/70">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-sm">متریک زنده</h4>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        GET
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      latency p50-p99، hit rate کش، وضعیت مدار شکن، و uptime.
                    </p>
                    <InlineCode>/api/engine/stats</InlineCode>
                  </Card>
                  <Card className="p-4 border-border/70">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-sm">بنچمارک</h4>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        GET
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      اندازه‌گیری ns/op برای روتر، کش، و متریک با تعداد تکرار قابل تنظیم (پیش‌فرض ۱۰۰۰).
                    </p>
                    <InlineCode>/api/engine/benchmark?iterations=5000</InlineCode>
                  </Card>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href="/sakhtar">
                    <Box className="w-3.5 h-3.5 ml-1.5" />
    مشاهده صفحه ساختار با متریک کامل
                  </a>
                </Button>
              </div>
            </section>

            {/* ─── فورک و توسعه ─── */}
            <section id="fork" className="scroll-mt-28 space-y-6">
              <div>
                <Badge variant="secondary" className="mb-3 text-[10px] font-mono">
                  STEP-BY-STEP
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  فورک کردن و توسعه موتور
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  موتور تیغ طوری طراحی شده که به‌راحتی در پروژه شما قابل استفاده و گسترش باشد. این راهنما شما را
                  از صفر تا استقرار یک نمونه سفارشی همراهی می‌کند.
                </p>
              </div>

              <div className="grid gap-3 md:gap-4">
                {[
                  {
                    n: "۰۱",
                    icon: GitFork,
                    title: "فورک کردن مخزن",
                    desc: "روی صفحه گیت‌هاب، دکمه Fork را بزنید. مخزن به حساب شما کپی می‌شود.",
                    code: "git clone https://github.com/YOUR-USER/Persian-Quote-API.git\ncd Persian-Quote-API\nbun install",
                    next: "پس از نصب، پروژه آماده اجرا است. دستور bun run dev سرور توسعه را روی پورت ۳۰۰۰ بالا می‌آورد.",
                  },
                  {
                    n: "۰۲",
                    icon: Network,
                    title: "آشنایی با ساختار موتور",
                    desc: "تمام منطق موتور در lib/engine/ است. مهم‌ترین فایل برای ویرایش instance.ts است که پیکربندی سراسری موتور را نگه می‌دارد.",
                    code: `// lib/engine/instance.ts
import { Tigh } from "./engine"

export const engine = new Tigh({
  enableCache: true,           // کش LRU داخلی
  enableRateLimit: true,       // محدودسازی نرخ
  enableCircuitBreaker: true,  // مدار شکن خودترمیم
  cache: {
    maxSize: 5000,             // حداکثر کلید
    defaultTTL: 30_000,        // ۳۰ ثانیه
  },
  rateLimit: {
    windowMs: 60_000,          // ۶۰ ثانیه
    maxRequests: 120,          // ۱۲۰ درخواست
    strategy: "token-bucket",
  },
})`,
                    next: "تغییر این مقادیر بلافاصله روی رفتار تمام اندپوینت‌های موتور اعمال می‌شود.",
                  },
                  {
                    n: "۰۳",
                    icon: Plus,
                    title: "افزودن اندپوینت سفارشی",
                    desc: "هر فایل در app/api/*/route.ts می‌تواند از موتور استفاده کند یا مستقل باشد. الگوی کنونی: route ها مستقیماً NextResponse برمی‌گردانند — برای استفاده از موتور، ساختار را به handler-based تغییر دهید.",
                    code: `// app/api/hello/route.ts
import { createNextHandler } from "@/lib/engine"
import { engine } from "@/lib/engine/instance"

engine.get("/api/hello", async (req) => {
  return {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: { greeting: "سلام", lang: req.headers["accept-language"] },
  }
}, {
  cache: { ttl: 60_000 },
})

export const GET = createNextHandler(engine)`,
                    next: "نکته: route.register در زمان import اجرا می‌شود، پس فایل را در hot reload لازم نیست دوباره import کنید.",
                  },
                  {
                    n: "۰۴",
                    icon: Wrench,
                    title: "سفارشی‌سازی ماژول‌ها",
                    desc: "تمام ماژول‌ها قابل جایگزینی هستند: TighRouter، TighCache، TighRateLimiter، TighCircuitBreaker، TighMiddleware.",
                    code: `// نمونه: جایگزینی کش با نسخه ردیس-مانند
import { Tigh } from "./engine"
import { MyRedisCache } from "./my-redis-cache"

const engine = new Tigh({
  cache: { maxSize: 100_000, defaultTTL: 300_000 }
})
engine.cache = new MyRedisCache({ url: process.env.REDIS_URL! })`,
                    next: "کافی است اینترفیس عمومی هر ماژول را پیاده کنید و در سازنده Tigh جایگزین کنید.",
                  },
                  {
                    n: "۰۵",
                    icon: TestTube,
                    title: "نوشتن تست با Bun Test",
                    desc: "چون موتور صفر وابستگی دارد، تست‌نویسی بسیار ساده است.",
                    code: `// tests/cache.test.ts
import { test, expect } from "bun:test"
import { TighCache } from "../lib/engine/cache"

test("TighCache respects TTL", () => {
  const c = new TighCache({ maxSize: 10, defaultTTL: 50 })
  c.set("k", "v")
  expect(c.get("k")).toBe("v")
  Bun.sleep(60)
  expect(c.get("k")).toBeNull()
})

test("TighCache evicts LRU", () => {
  const c = new TighCache({ maxSize: 2 })
  c.set("a", 1); c.set("b", 2); c.get("a"); c.set("c", 3)
  expect(c.has("a")).toBe(false)
})`,
                    next: "bun test تمام تست‌ها را اجرا می‌کند. CI از bun test bun.lock استفاده می‌کند.",
                  },
                  {
                    n: "۰۶",
                    icon: Rocket,
                    title: "استقرار",
                    desc: "پروژه استاندارد Next.js است — Vercel به‌طور خودکار آن را تشخیص می‌دهد.",
                    code: `# روی Vercel
vercel deploy

# یا با GitHub Actions
git push origin main   # در Vercel فعال باشد، خودکار deploy می‌شود`,
                    next: "پس از deploy، به /sakhtar بروید و متریک زنده موتور را در production ببینید.",
                  },
                ].map((step, i) => (
                  <Card key={step.n} className="p-0 border-border/70 overflow-hidden">
                    <div className="p-4 md:p-5 border-b border-border/60 flex items-start gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-mono font-bold text-sm md:text-base">
                        {step.n}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <step.icon className="w-4 h-4 text-primary" />
                          <h3 className="font-bold text-base md:text-lg">{step.title}</h3>
                        </div>
                        <p className="text-xs md:text-[13px] text-muted-foreground leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 md:p-5 bg-muted/20">
                      <CodeBlock code={step.code} language="bash" filename={`step-${step.n}.sh`} />
                      {step.next && (
                        <p className="mt-3 text-xs md:text-[13px] text-muted-foreground leading-relaxed" dir="rtl">
                          <span className="text-primary font-bold">نکته: </span>
                          {step.next}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-4 md:p-5 border-primary/30 bg-primary/5">
                <div className="flex items-start gap-3">
                  <Github className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-1">پس از فورک</h3>
                    <p className="text-xs md:text-[13px] text-muted-foreground leading-relaxed">
                      اگر بهبودی در موتور اعمال کردید که به نفع همه است، یک Pull Request به مخزن اصلی بفرستید.
                      راهنمای مشارکت در <InlineCode>AGENTS.md</InlineCode> توضیح داده شده است — به‌ویژه قاعده
                      ثبت در changelog و لحن رسمی-دوستانه.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* ─── پرامپت‌های آماده ─── */}
            <section id="ai-prompts" className="scroll-mt-28 space-y-6">
              <div>
                <Badge variant="secondary" className="mb-3 text-[10px] font-mono">
                  AUTOMATE
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  پرامپت‌های آماده برای دستیارها
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  اگر با Cursor، Claude Code یا Codex کار می‌کنید، کافی است یکی از پرامپت‌های زیر را کپی کنید
                  و در دستیار خود paste کنید. پاسخ را به فارسی یا انگلیسی تنظیم کرده‌ایم.
                </p>
              </div>

              <AIPrompts />

              <Card className="p-4 md:p-5 border-border/70">
                <div className="flex items-start gap-3">
                  <Terminal className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-base mb-1">نحوه استفاده</h3>
                    <ol className="text-xs md:text-[13px] text-muted-foreground space-y-1.5 list-decimal pr-5 leading-relaxed">
                      <li>روی یکی از کارت‌ها دکمه «کپی» را بزنید.</li>
                      <li>در پنل دستیار، متن کپی‌شده را paste کنید.</li>
                      <li>پاسخ را بخوانید، تغییرات را مرور کنید، و در صورت نیاز PR ثبت کنید.</li>
                    </ol>
                    <p className="mt-3 text-[11px] text-muted-foreground/80 font-medium">
                      در مستندات بیشتر درباره هر پرامپت، روی عنوان کارت کلیک کنید تا به بخش مربوط به آن هدایت شوید.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            {/* ─── نمونه‌های کاربردی ─── */}
            <section id="examples" className="scroll-mt-28 space-y-5">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">نمونه‌های کاربردی</h2>
              <p className="text-base text-muted-foreground">
                چهار سناریوی واقعی برای استفاده از API — از ساده‌ترین تا یکپارچه‌سازی کامل در رابط کاربری.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 border-border/70 min-w-0 overflow-hidden">
                  <h3 className="font-bold text-sm mb-2">نمایش شعر روز در سایت</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    هر روز یک شعر جدید به بازدیدکنندگان نشان دهید.
                  </p>
                  <CodeBlock
                    code={`const today = new Date().toISOString().slice(0, 10)
const res = await fetch(
  \`https://pq.arsamadineh.ir/api/quotes?random=true&limit=1&cacheBust=\${today}\`
)
const { data } = await res.json()
// data[0].text_persian`}
                    language="javascript"
                    maxHeight="180px"
                  />
                </Card>

                <Card className="p-4 border-border/70 min-w-0 overflow-hidden">
                  <h3 className="font-bold text-sm mb-2">ویجت فال حافظ</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    یک iframe ساده برای نمایش فال حافظ در سایت شخص ثالث.
                  </p>
                  <CodeBlock
                    code={`<iframe
  src="https://pq.arsamadineh.ir/api/embed?theme=classic&poet=hafez&auto_refresh=true"
  width="400"
  height="280"
  style="border: 0; border-radius: 12px;"
  loading="lazy"
></iframe>`}
                    language="html"
                    maxHeight="180px"
                  />
                </Card>

                <Card className="p-4 border-border/70 min-w-0 overflow-hidden">
                  <h3 className="font-bold text-sm mb-2">تست بار (Load Test)</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    اندازه‌گیری latency واقعی از سمت کاربر.
                  </p>
                  <CodeBlock
                    code={`import asyncio, aiohttp, time

async def hit(session, url):
    async with session.get(url) as r:
        return r.status, await r.json()

async def main():
    url = "https://pq.arsamadineh.ir/api/quotes?random=true"
    async with aiohttp.ClientSession() as s:
        start = time.time()
        results = await asyncio.gather(*[hit(s, url) for _ in range(100)])
        print(f"100 reqs in {time.time() - start:.2f}s")

asyncio.run(main())`}
                    language="python"
                    maxHeight="200px"
                  />
                </Card>

                <Card className="p-4 border-border/70 min-w-0 overflow-hidden">
                  <h3 className="font-bold text-sm mb-2">اپ موبایل (React Native)</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    یک اپ ساده برای مرور اشعار، با کش محلی برای آفلاین.
                  </p>
                  <CodeBlock
                    code={`import { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export function QuoteScreen() {
  const [quote, setQuote] = useState(null)
  useEffect(() => {
    AsyncStorage.getItem("quote").then(setQuote)
  }, [])
  const refresh = async () => {
    const r = await fetch("/api/quotes?random=true&limit=1")
    const j = await r.json()
    setQuote(j.data[0])
    AsyncStorage.setItem("quote", JSON.stringify(j.data[0]))
  }
  return /* ... */
}`}
                    language="tsx"
                    maxHeight="200px"
                  />
                </Card>
              </div>
            </section>

            {/* ─── استقرار ─── */}
            <section id="deploy" className="scroll-mt-28 space-y-5">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">استقرار و خودمیزبانی</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                سه روش برای راه‌اندازی یک نمونه شخصی — از ساده‌ترین (Vercel) تا کنترل کامل (Docker).
              </p>

              <Tabs defaultValue="vercel" className="w-full">
                <TabsList className="flex w-full overflow-x-auto mb-4 bg-muted/50 p-1 scrollbar-none">
                  <TabsTrigger value="vercel" className="flex-none">Vercel</TabsTrigger>
                  <TabsTrigger value="docker" className="flex-none">Docker</TabsTrigger>
                  <TabsTrigger value="local" className="flex-none">محلی</TabsTrigger>
                </TabsList>

                <TabsContent value="vercel" className="space-y-4">
                  <ol className="list-decimal pr-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
                    <li>مخزن را به حساب گیت‌هاب خود fork کنید.</li>
                    <li>به <InlineCode>vercel.com</InlineCode> بروید و «New Project» را بزنید.</li>
                    <li>مخزن fork شده را انتخاب کنید. Vercel به‌طور خودکار Next.js را تشخیص می‌دهد.</li>
                    <li>روی «Deploy» کلیک کنید. در کمتر از یک دقیقه نمونه شما فعال می‌شود.</li>
                    <li>برای custom domain، از تنظیمات پروژه دامنه را اضافه کنید.</li>
                  </ol>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    هیچ متغیر محیطی لازم نیست — تمام داده‌ها فایل‌های JSON محلی هستند.
                  </p>
                </TabsContent>

                <TabsContent value="docker" className="space-y-4">
                  <CodeBlock
                    code={`# Dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "start"]

# ساخت و اجرا
docker build -t persian-quotes .
docker run -p 3000:3000 persian-quotes`}
                    language="dockerfile"
                    filename="Dockerfile"
                  />
                </TabsContent>

                <TabsContent value="local" className="space-y-4">
                  <CodeBlock
                    code={`# پیش‌نیازها
node --version   # >= 18
bun --version    # اختیاری، اما توصیه‌شده

# مراحل
git clone https://github.com/YOUR-USER/Persian-Quote-API.git
cd Persian-Quote-API
bun install
bun run dev

# در حالت production
bun run build
bun run start`}
                    language="bash"
                    label="TERMINAL"
                  />
                </TabsContent>
              </Tabs>

              <Card className="p-4 border-border/70">
                <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <Network className="w-4 h-4 text-primary" />
                  پشتیبان‌گیری از داده‌ها
                </h3>
                <p className="text-xs md:text-[13px] text-muted-foreground leading-relaxed">
                  فایل‌های JSON در <InlineCode>lib/data/</InlineCode> منبع حقیقتی هستند. برای افزودن شعر جدید،
                  یا فایل JSON را ویرایش کنید، یا از فرم /contribute استفاده کنید تا یک PR خودکار ساخته شود.
                </p>
              </Card>
            </section>

            {/* ─── عیب‌یابی ─── */}
            <section id="troubleshoot" className="scroll-mt-28 space-y-5">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">عیب‌یابی</h2>
              <p className="text-base text-muted-foreground">
                رایج‌ترین مشکلات و راه‌حل‌های آن‌ها.
              </p>

              <div className="space-y-3">
                {[
                  {
                    icon: AlertTriangle,
                    title: "CORS بلاک می‌کند",
                    symptom: "در مرورگر خطای «blocked by CORS policy» می‌بینید.",
                    cause: "معمولاً به دلیل استفاده از endpoint قدیمی یا فراخوانی مستقیم بدون HTTPS.",
                    fix: "مطمئن شوید URL با https شروع می‌شود و /api/embed?… در iframe همیشه موفق است.",
                  },
                  {
                    icon: Database,
                    title: "کش stale شده",
                    symptom: "تغییرات در lib/data/*.json بلافاصله دیده نمی‌شود.",
                    cause: "موتور کش داخلی دارد که برای ۳۰ ثانیه تا ۵ دقیقه نگه می‌دارد.",
                    fix: "یا صبر کنید، یا کش را با ?cacheBust=<timestamp> در URL بشکنید، یا در production: curl /api/engine/stats | grep cache.hitRate برای بررسی وضعیت.",
                  },
                  {
                    icon: XCircle,
                    title: "دریافت ۴۲۹ (Too Many Requests)",
                    symptom: "تعداد بالای درخواست در کمتر از یک دقیقه.",
                    cause: "Rate limit پیش‌فرض ۱۲۰ درخواست در دقیقه به ازای هر IP است.",
                    fix: "صبر کنید تا پنجره زمانی ریست شود، یا اگر نمونه خودتان است، maxRequests در lib/engine/instance.ts را افزایش دهید.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "مدار شکن باز است (۵۰۳)",
                    symptom: "بعضی درخواست‌ها خیلی سریع با 503 پاسخ می‌گیرند.",
                    cause: "تعداد خطاها به آستانه (failureThreshold پیش‌فرض ۵) رسیده است.",
                    fix: "recoveryTimeout پیش‌فرض ۳۰ ثانیه است. موتور خودکار بهبود می‌یابد. در نمونه سفارشی، recoveryTimeout را تنظیم کنید.",
                  },
                  {
                    icon: GaugeCircle,
                    title: "P99 بالا (بیش از ۲۰۰ms)",
                    symptom: "بعضی درخواست‌ها کند هستند.",
                    cause: "عدم کش، یا cache key نادقیق، یا I/O در handler.",
                    fix: "از /api/engine/stats مقدار p99 را بخوانید، سپس در lib/engine/instance.ts برای route های پرکاربرد cache.ttl اختصاصی تعریف کنید.",
                  },
                ].map((item) => (
                  <Card key={item.title} className="p-4 border-border/70">
                    <div className="flex items-start gap-3">
                      <item.icon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-bold text-sm md:text-base">{item.title}</h3>
                        <div className="mt-2 space-y-1.5 text-xs md:text-[13px] leading-relaxed">
                          <div>
                            <span className="text-primary font-mono">علائم: </span>
                            <span className="text-muted-foreground">{item.symptom}</span>
                          </div>
                          <div>
                            <span className="text-primary font-mono">علت: </span>
                            <span className="text-muted-foreground">{item.cause}</span>
                          </div>
                          <div>
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono">رفع: </span>
                            <span className="text-foreground/85">{item.fix}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* ─── مدیریت خطاها ─── */}
            <section id="errors" className="scroll-mt-28 space-y-5">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">مدیریت خطاها</h2>
              <p className="text-base text-muted-foreground">
                کدهای HTTP استاندارد و ساختار پاسخ‌های خطا.
              </p>

              <div className="grid gap-2">
                {[
                  { code: 200, label: "درخواست موفق", severity: "موفقیت" },
                  { code: 400, label: "پارامتر نامعتبر", severity: "هشدار" },
                  { code: 404, label: "منبع یافت نشد", severity: "هشدار" },
                  { code: 429, label: "تعداد درخواست بیش از حد", severity: "هشدار" },
                  { code: 503, label: "سرویس موقتاً در دسترس نیست (مدار شکن)", severity: "خطا" },
                ].map((r) => (
                  <div
                    key={r.code}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/70 bg-muted/20"
                  >
                    <Badge
                      variant={r.severity === "موفقیت" ? "secondary" : r.severity === "هشدار" ? "outline" : "destructive"}
                      className="font-mono text-xs"
                    >
                      {r.code}
                    </Badge>
                    <span className="text-sm">{r.label}</span>
                    <span className="mr-auto text-[10px] text-muted-foreground font-mono uppercase opacity-70">
                      {r.severity}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-base font-semibold mb-2">نمونه پاسخ خطا</h3>
                <CodeBlock
                  code={`{
  "error": "No quotes found for this poet",
  "poet": "شاعر نامعلوم",
  "suggestion": "Available poets: مولانا, حافظ, سعدی, فردوسی"
}`}
                  language="json"
                  label="RESPONSE.JSON"
                />
              </div>
            </section>

            {/* CTA پایانی */}
            <Card className="p-6 md:p-8 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="flex-1">
                  <Sparkles className="w-6 h-6 text-primary mb-2" />
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                    آماده‌اید موتور را امتحان کنید؟
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    به صفحه متریک زنده بروید و عملکرد موتور را در زمان واقعی ببینید. یا فورک کنید و برای
                    پروژه خودتان سفارشی‌سازی کنید.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <Button asChild>
                    <Link href="/sakhtar">
                      <Box className="w-4 h-4 ml-1.5" />
                      صفحه ساختار
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="https://github.com/arsamadineh/Persian-Quote-API" target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 ml-1.5" />
                      مشاهده در گیت‌هاب
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


