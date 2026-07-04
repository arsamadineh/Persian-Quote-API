"use client"

// بخش پرامپت‌های آماده برای دستیارهای کدنویسی.
// هر کارت شامل: عنوان، توضیح کوتاه، ابزارهای هدف، خود پرامپت، و دکمه کپی.

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Copy, Sparkles, Wand2, Wrench, Bug, Rocket, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

type Tool = "Cursor" | "Claude Code" | "Codex" | "Any"

interface PromptCard {
  id: string
  title: string
  description: string
  tools: Tool[]
  category: "setup" | "extend" | "optimize" | "debug" | "deploy" | "explore"
  prompt: string
}

const CARDS: PromptCard[] = [
  {
    id: "explain-engine",
    title: "توضیح کامل معماری موتور",
    description: "از دستیار بخواهید ساختار lib/engine را به فارسی توضیح دهد و رابطه بین ماژول‌ها را بنویسد.",
    tools: ["Cursor", "Claude Code", "Any"],
    category: "explore",
    prompt:
      "You are inside /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API. Read every file under lib/engine/*.ts. Produce a written map (under 400 words) of every module: name, exports, role, and how it wires to engine.ts. Reply in Persian with code snippet citations.",
  },
  {
    id: "add-endpoint",
    title: "ساخت اندپوینت جدید با موتور",
    description: "یک اندپوینت GET که با موتور تیغ اجرا می‌شود، کش دارد، و از circuit breaker پیروی می‌کند.",
    tools: ["Cursor", "Claude Code", "Codex"],
    category: "extend",
    prompt:
      "Create app/api/quotes/by-tag/[tag]/route.ts that uses Tigh from lib/engine. The handler must: import sampleQuotes from lib/data/poetry-quotes.json, filter where tags contains the [tag] param, return at most 50 results, attach cache { ttl: 60_000, key }, and surface non-200 status via the engine's circuit breaker. Show the full file and explain each engine call.",
  },
  {
    id: "cache-tuning",
    title: "تنظیم TTL هر مسیر",
    description: "بررسی الگوی ترافیک هر اندپوینت و پیشنهاد TTL اختصاصی — با قطعه کد.",
    tools: ["Cursor", "Claude Code", "Any"],
    category: "optimize",
    prompt:
      "Open lib/engine/instance.ts and lib/engine/cache.ts. Scan app/api/**/route.ts and propose: a per-route defaultTTL (short 10s for /search, medium 60s for /quotes/*, long 24h for /hafez, /shereno). Produce a diff for instance.ts plus a snippet showing engine.route({ cache: { ttl, key } }) for one route. Quantify expected hit-rate improvement.",
  },
  {
    id: "debug-latency",
    title: "اشکال‌زدایی Latency",
    description: "تحلیل داده‌های زنده و ارائه دو پیشنهاد برای رساندن P99 به زیر ۵۰ms.",
    tools: ["Cursor", "Claude Code", "Any"],
    category: "debug",
    prompt:
      "Hit GET /api/engine/stats and parse latency.p50/p90/p95/p99 plus cache.hitRate. Identify the top 3 slowest paths from topPaths. Suggest two concrete optimizations (cache key rewrite, eager prewarm, or middleware reorder) that should bring p99 below 50ms. Show diffs and explain trade-offs.",
  },
  {
    id: "deploy-vercel",
    title: "استقرار روی Vercel",
    description: "راهنمای کامل env vars، build command، و تنظیمات لبه.",
    tools: ["Cursor", "Claude Code", "Codex"],
    category: "deploy",
    prompt:
      "Walk me through a full Vercel deployment of /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API. Provide: the exact env vars (none required, but list any optional for future use), build/dev commands, a minimal vercel.json that pins Node.js 20 and maximizes the cron quota, and a check that the JSON imports in lib/data/*.json remain valid on the Edge runtime.",
  },
  {
    id: "add-tests",
    title: "افزودن تست‌های موتور",
    description: "ساخت تست واحد برای هر ماژول با Bun Test.",
    tools: ["Cursor", "Claude Code", "Codex"],
    category: "extend",
    prompt:
      "Create tests/ folder with bun:test unit tests for every module in lib/engine: TighRouter (param + wildcard match), TighCache (LRU eviction, TTL expiration), TighRateLimiter (each strategy), TighCircuitBreaker (state transitions), TighMetrics (percentile accuracy). Group tests by module. No external libraries; pure assertions.",
  },
  {
    id: "ai-summary",
    title: "خلاصه PR برای بازبینی",
    description: "از تغییرات فعلی یک توصیف کوتاه و حرفه‌ای برای ارسال به GitHub PR بساز.",
    tools: ["Cursor", "Claude Code", "Any"],
    category: "explore",
    prompt:
      "Look at the currently changed files (git status / git diff --staged). Write a Persian PR description under 250 words: a one-line summary, a section of files changed, and a checklist of what to verify before merging. Keep language formal and direct — no marketing adjectives.",
  },
  {
    id: "refactor-route",
    title: "Refactor یک اندپوینت موجود",
    description: "تبدیل یکی از route.tsهای موجود به استفاده کامل از موتور (به‌جای NextResponse مستقیم).",
    tools: ["Cursor", "Claude Code", "Any"],
    category: "extend",
    prompt:
      "Pick app/api/quotes/route.ts. Refactor it to delegate to engine via createNextHandler(engine) from lib/engine/adapter-next.ts. Register the route inside instance.ts via engine.get(\"/api/quotes\", ...), wire cache { ttl, key } and rateLimit config. Provide a step-by-step diff and explain how NextRequest becomes the engine Request shape.",
  },
]

const CATEGORY_META: Record<PromptCard["category"], { label: string; icon: typeof Sparkles; color: string }> = {
  setup: { label: "راه‌اندازی", icon: Wand2, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  extend: { label: "توسعه", icon: BookOpen, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  optimize: { label: "بهینه‌سازی", icon: Sparkles, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  debug: { label: "اشکال‌زدایی", icon: Bug, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  deploy: { label: "استقرار", icon: Rocket, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
  explore: { label: "شناخت", icon: Wrench, color: "text-stone-600 bg-stone-500/10 border-stone-500/20" },
}

const TOOLS_LABEL: Record<Tool, string> = {
  "Cursor": "Cursor",
  "Claude Code": "Claude Code",
  "Codex": "Codex",
  "Any": "همه",
}

interface AIPromptsProps {
  /** اختیاری — اگر فقط یک دسته نمایش داده شود */
  filter?: PromptCard["category"][]
}

export function AIPrompts({ filter }: AIPromptsProps) {
  const visible = filter ? CARDS.filter((c) => filter.includes(c.category)) : CARDS

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
      {visible.map((c, idx) => (
        <PromptCardItem key={c.id} card={c} index={idx} />
      ))}
    </div>
  )
}

function PromptCardItem({ card, index }: { card: PromptCard; index: number }) {
  const [copied, setCopied] = useState(false)
  const meta = CATEGORY_META[card.category]
  const Icon = meta.icon

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(card.prompt)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = card.prompt
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Card
      className={cn(
        "border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-300 group overflow-hidden"
      )}
      style={{ animation: `engine-slide-up 0.5s ease-out ${index * 70}ms both` }}
    >
      <CardContent className="p-0">
        {/* سربرگ */}
        <div className="p-4 md:p-5 space-y-3 border-b border-border/60">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className={cn("w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center border shrink-0", meta.color)}>
                <Icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm md:text-base text-foreground leading-snug">
                  {card.title}
                </h3>
                <p className="text-xs md:text-[13px] text-muted-foreground mt-1 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-1.5">
            <Badge variant="outline" className={cn("text-[10px] font-medium border", meta.color)}>
              {meta.label}
            </Badge>
            {card.tools.map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px]">
                {TOOLS_LABEL[t]}
              </Badge>
            ))}
          </div>
        </div>

        {/* بدنه پرامپت */}
        <div dir="ltr" className="relative bg-muted/30 px-4 md:px-5 py-3 md:py-4">
          <pre className="text-[11px] md:text-xs font-mono text-foreground/85 leading-relaxed whitespace-pre-wrap break-words max-h-44 overflow-y-auto scrollbar-thin" dir="ltr">
            {card.prompt}
          </pre>
          <button
            type="button"
            onClick={onCopy}
            className={cn(
              "absolute top-2 left-2 md:top-3 md:left-3 rtl:left-auto rtl:right-2 md:rtl:right-3",
              "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-all duration-200 border",
              copied
                ? "bg-emerald-500 text-white border-emerald-600"
                : "bg-background text-muted-foreground border-border hover:text-primary hover:border-primary/40"
            )}
            aria-label="کپی پرامپت"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                کپی شد
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                کپی
              </>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
