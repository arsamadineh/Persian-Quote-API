// منبع حقیقتی جستجوی فرمان‌پالت.
// تمام اقلام قابل جستجو (اندپوینت‌ها، مفاهیم موتور، راهنما، دستورها، و قطعه‌کدها) در اینجا نگهداری می‌شوند.
// CommandBar در ریشه برنامه mount می‌شود و این فایل را می‌خواند.

export type DocItemCategory =
  | "endpoint"
  | "engine"
  | "guide"
  | "concept"
  | "snippet"
  | "prompt"

export interface DocItem {
  id: string
  title: string
  titleEn?: string
  desc: string
  category: DocItemCategory
  href: string
  external?: boolean
  keywords: string[]
  payload?: string
}

export const DOC_CATEGORIES: Record<DocItemCategory, { label: string; icon: string }> = {
  endpoint: { label: "اندپوینت‌ها", icon: "route" },
  engine: { label: "موتور تیغ", icon: "cpu" },
  guide: { label: "راهنما", icon: "book" },
  concept: { label: "مفاهیم", icon: "lightbulb" },
  snippet: { label: "قطعه‌کدها", icon: "code" },
  prompt: { label: "پرامپت‌های آماده", icon: "sparkles" },
}

export const DOC_INDEX: DocItem[] = [
  // ── اندپوینت‌ها ──────────────────────────────────
  {
    id: "ep-quotes",
    title: "دریافت اشعار",
    titleEn: "Get quotes",
    desc: "لیست اشعار با فیلتر شاعر، دسته‌بندی، و انتخاب تصادفی",
    category: "endpoint",
    href: "/docs#quotes",
    keywords: ["quote", "شعر", "api", "random", "filter", "poet", "category"],
  },
  {
    id: "ep-quotes-poet",
    title: "اشعار یک شاعر",
    titleEn: "Quotes by poet",
    desc: "دریافت تمام اشعار یک شاعر مشخص",
    category: "endpoint",
    href: "/docs#quotes",
    keywords: ["poet", "شاعر", "rumi", "حافظ", "mowlavi", "فردوسی"],
  },
  {
    id: "ep-quotes-category",
    title: "اشعار یک دسته",
    titleEn: "Quotes by category",
    desc: "فیلتر بر اساس موضوع: عشق، عرفان، حکمت",
    category: "endpoint",
    href: "/docs#quotes",
    keywords: ["category", "دسته", "عشق", "عرفان", "حکمت"],
  },
  {
    id: "ep-hafez",
    title: "دیوان حافظ",
    titleEn: "Hafez ghazals",
    desc: "۴۹۷ غزل کامل با ساختار بیتی و جستجوی اختصاصی",
    category: "endpoint",
    href: "/docs#hafez",
    keywords: ["hafez", "حافظ", "ghazal", "غزل", "فال"],
  },
  {
    id: "ep-shereno",
    title: "شعر نو معاصر",
    titleEn: "Modern poetry",
    desc: "بیش از ۴۴۰۰ اثر از نیما، سهراب، و شاعران نو",
    category: "endpoint",
    href: "/docs#shereno",
    keywords: ["shereno", "شعر نو", "nima", "نیما", "sohrab", "سهراب", "modern"],
  },
  {
    id: "ep-non-poetry",
    title: "سخنان بزرگان",
    titleEn: "Non-poetry quotes",
    desc: "نقل‌قول‌های غیرشعری از اندیشمندان جهان",
    category: "endpoint",
    href: "/docs#non-poetry",
    keywords: ["سخنان", "transcendental", "einstein", "انیشتین", "non-poetry"],
  },
  {
    id: "ep-search",
    title: "جستجو در اشعار",
    titleEn: "Search",
    desc: "جستجوی متنی در تمام پایگاه داده با پشتیبانی از فارسی و انگلیسی",
    category: "endpoint",
    href: "/docs#search",
    keywords: ["search", "جستجو", "query", "find"],
  },
  {
    id: "ep-poets",
    title: "فهرست شاعران",
    titleEn: "Poets list",
    desc: "دریافت شاعران به همراه آمار اشعار",
    category: "endpoint",
    href: "/docs#poets",
    keywords: ["poets", "شاعر", "list", "لیست"],
  },
  {
    id: "ep-categories",
    title: "دسته‌بندی‌ها",
    titleEn: "Categories",
    desc: "لیست دسته‌بندی‌های موضوعی به همراه تعداد اشعار هر کدام",
    category: "endpoint",
    href: "/docs#categories",
    keywords: ["categories", "دسته", "topic"],
  },
  {
    id: "ep-stats",
    title: "آمار پایگاه داده",
    titleEn: "Stats",
    desc: "تعداد کل اشعار، شاعران، و منابع",
    category: "endpoint",
    href: "/docs#stats",
    keywords: ["stats", "آمار", "count", "tعداد"],
  },
  {
    id: "ep-engine-stats",
    title: "متریک زنده موتور",
    titleEn: "Engine stats",
    desc: "P50/P90/P95/P99 latency، hit/miss کش، وضعیت مدار شکن",
    category: "endpoint",
    href: "/docs#engine-api",
    keywords: ["engine", "موتور", "metrics", "latency", "percentile"],
  },
  {
    id: "ep-engine-benchmark",
    title: "بنچمارک عملکرد",
    titleEn: "Benchmark",
    desc: "تست سرعت روتر، کش، و متریک با تعداد تکرار قابل تنظیم",
    category: "endpoint",
    href: "/docs#engine-api",
    keywords: ["benchmark", "بنچمارک", "performance", "ns/op"],
  },
  {
    id: "ep-embed",
    title: "ویجت قابل تعبیه",
    titleEn: "Embed widget",
    desc: "تولید iframe و HTML برای نمایش اشعار در سایت شخص ثالث",
    category: "endpoint",
    href: "/docs#embed",
    keywords: ["embed", "تعبیه", "widget", "iframe"],
  },

  // ── مفاهیم موتور ─────────────────────────────────
  {
    id: "engine-overview",
    title: "موتور تیغ چیست",
    titleEn: "What is Tigh",
    desc: "موتور API با مسیریاب Trie، کش LRU، مدار شکن، و متریک — صفر وابستگی",
    category: "engine",
    href: "/docs#engine-overview",
    keywords: ["tigh", "تیغ", "engine", "موتور", "router", "cache"],
  },
  {
    id: "engine-router",
    title: "مسیریاب Trie",
    titleEn: "Router",
    desc: "TighRouter با matching در O(1) — پارامترهای [id] و wildcard *",
    category: "engine",
    href: "/docs#engine-router",
    keywords: ["router", "مسیریاب", "trie", "matching", "wildcard", "params"],
  },
  {
    id: "engine-cache",
    title: "کش LRU با TTL",
    titleEn: "Cache",
    desc: "TighCache با eviction کم‌استفاده‌ترین و انقضای زمانی",
    category: "engine",
    href: "/docs#engine-cache",
    keywords: ["cache", "کش", "lru", "ttl", "memory", "حافظه"],
  },
  {
    id: "engine-ratelimit",
    title: "محدودساز نرخ",
    titleEn: "Rate limiter",
    desc: "سه استراتژی: Token Bucket، Sliding Window، Fixed Window",
    category: "engine",
    href: "/docs#engine-ratelimit",
    keywords: ["rate", "محدودیت", "token", "bucket", "window", "429"],
  },
  {
    id: "engine-circuit",
    title: "مدار شکن",
    titleEn: "Circuit breaker",
    desc: "سه حالت Closed، Open، Half-Open با بهبود خودکار",
    category: "engine",
    href: "/docs#engine-circuit",
    keywords: ["circuit", "مدار", "breaker", "fault", "تولرانس"],
  },
  {
    id: "engine-middleware",
    title: "پایپلاین Middleware",
    titleEn: "Middleware",
    desc: "زنجیره CORS، زمان‌سنجی، فشرده‌سازی — قابل توسعه",
    category: "engine",
    href: "/docs#engine-middleware",
    keywords: ["middleware", "cors", "زمان سنجی", "compress", "pipeline"],
  },
  {
    id: "engine-metrics",
    title: "متریک و Percentile",
    titleEn: "Metrics",
    desc: "P50/P90/P95/P99 latency و snapshot لحظه‌ای",
    category: "engine",
    href: "/docs#engine-metrics",
    keywords: ["metrics", "percentile", "p50", "p99", "latency"],
  },
  {
    id: "engine-adapter",
    title: "اداپتور Next.js",
    titleEn: "Adapter",
    desc: "createNextHandler برای اتصال به App Router",
    category: "engine",
    href: "/docs#engine-adapter",
    keywords: ["adapter", "اداپتور", "next", "next.js", "handler"],
  },

  // ── راهنما ─────────────────────────────────────────
  {
    id: "quickstart",
    title: "شروع سریع",
    titleEn: "Quick start",
    desc: "اولین درخواست API در ۳۰ ثانیه — با curl",
    category: "guide",
    href: "/docs#quickstart",
    keywords: ["quick", "شروع", "start", "tutorial", "آموزش"],
  },
  {
    id: "auth",
    title: "احراز هویت",
    titleEn: "Authentication",
    desc: "این API کاملاً عمومی است — هیچ کلید یا توکنی لازم نیست",
    category: "guide",
    href: "/docs#auth",
    keywords: ["auth", "احراز هویت", "key", "token", "public"],
  },
  {
    id: "errors",
    title: "مدیریت خطاها",
    titleEn: "Errors",
    desc: "کدهای HTTP، ساختار پاسخ خطا، و Retry-After",
    category: "guide",
    href: "/docs#errors",
    keywords: ["error", "خطا", "500", "404", "429"],
  },
  {
    id: "examples",
    title: "نمونه‌های کاربردی",
    titleEn: "Examples",
    desc: "کد در جاوااسکریپت، پایتون، PHP، و cURL",
    category: "guide",
    href: "/docs#examples",
    keywords: ["example", "نمونه", "javascript", "python", "php", "curl"],
  },
  {
    id: "deploy",
    title: "استقرار و خودمیزبانی",
    titleEn: "Self-hosting",
    desc: "نصب، تنظیم متغیرها، و استقرار روی Vercel یا سرور شخصی",
    category: "guide",
    href: "/docs#deploy",
    keywords: ["deploy", "استقرار", "vercel", "self-host", "نصب"],
  },
  {
    id: "fork",
    title: "فورک کردن و توسعه موتور",
    titleEn: "Fork & build",
    desc: "از صفر تا سفارشی‌سازی موتور تیغ — برای پروژه‌های خودتان",
    category: "guide",
    href: "/docs#fork",
    keywords: ["fork", "سفارشی", "custom", "توسعه", "extend", "build"],
  },
  {
    id: "ai-prompts",
    title: "پرامپت‌های آماده برای دستیارها",
    titleEn: "AI prompts",
    desc: "دستورهای آماده برای Cursor، Claude Code، Codex و دیگر ابزارها",
    category: "guide",
    href: "/docs#ai-prompts",
    keywords: ["ai", "prompt", "پرامپت", "cursor", "claude", "codex", "agent"],
  },
  {
    id: "troubleshoot",
    title: "عیب‌یابی",
    titleEn: "Troubleshooting",
    desc: "رفع مشکلات رایج: CORS، کش، حافظه، و latency",
    category: "guide",
    href: "/docs#troubleshoot",
    keywords: ["troubleshoot", "عیب یابی", "fix", "debug", "رفع"],
  },

  // ── مفاهیم ─────────────────────────────────────────
  {
    id: "concept-rtl",
    title: "پشتیبانی از راست‌چین",
    titleEn: "RTL support",
    desc: "تمام خروجی‌ها با UTF-8 و متن فارسی سازگار هستند",
    category: "concept",
    href: "/docs#examples",
    keywords: ["rtl", "راست چین", "utf", "persian", "فارسی"],
  },
  {
    id: "concept-cors",
    title: "CORS و امنیت",
    titleEn: "CORS",
    desc: "استفاده مستقیم از مرورگر بدون نیاز به پروکسی",
    category: "concept",
    href: "/docs#examples",
    keywords: ["cors", "browser", "مرورگر", "security", "امنیت"],
  },

  // ── قطعه‌کدها ─────────────────────────────────────
  {
    id: "snip-curl-random",
    title: "دریافت شعر تصادفی",
    titleEn: "Random quote curl",
    desc: "دستور کپی‌پذیر برای دریافت یک شعر تصادفی",
    category: "snippet",
    href: "/docs#quickstart",
    keywords: ["curl", "random", "تصادفی"],
    payload: "curl \"https://pq.arsamadineh.ir/api/quotes?random=true&limit=1\"",
  },
  {
    id: "snip-curl-hafez",
    title: "فال حافظ با curl",
    titleEn: "Hafez fal",
    desc: "دریافت یک غزل تصادفی از حافظ برای فال",
    category: "snippet",
    href: "/docs#hafez",
    keywords: ["hafez", "فال", "curl", "ghazal"],
    payload: "curl \"https://pq.arsamadineh.ir/api/quotes/hafez?random=true&limit=1\"",
  },
  {
    id: "snip-curl-search",
    title: "جستجوی شعر عشق",
    titleEn: "Search love",
    desc: "جستجوی کلمه عشق در تمام اشعار",
    category: "snippet",
    href: "/docs#search",
    keywords: ["search", "عشق", "love", "جستجو"],
    payload: 'curl "https://pq.arsamadineh.ir/api/quotes/search?q=%D8%B9%D8%B4%D9%82&limit=5"',
  },
  {
    id: "snip-js-fetch",
    title: "JavaScript fetch",
    desc: "دریافت شعر با fetch در جاوااسکریپت",
    category: "snippet",
    href: "/docs#examples",
    keywords: ["javascript", "fetch", "js"],
    payload: `const res = await fetch("/api/quotes?random=true&limit=1")
const { data } = await res.json()
console.log(data[0].text_persian)`,
  },
  {
    id: "snip-py-fetch",
    title: "Python requests",
    desc: "دریافت شعر با requests در پایتون",
    category: "snippet",
    href: "/docs#examples",
    keywords: ["python", "requests"],
    payload: `import requests
r = requests.get("/api/quotes", params={"random": "true", "limit": 1})
print(r.json()["data"][0]["text_persian"])`,
  },
  {
    id: "snip-install",
    title: "نصب وابستگی‌ها",
    titleEn: "Install",
    desc: "نصب پکیج‌های پروژه با bun",
    category: "snippet",
    href: "/docs#deploy",
    keywords: ["install", "نصب", "dep", "bun", "npm"],
    payload: "bun install\nbun run dev",
  },
  {
    id: "snip-fork",
    title: "کلون مخزن",
    titleEn: "Clone repo",
    desc: "دریافت آخرین نسخه از گیت‌هاب",
    category: "snippet",
    href: "/docs#fork",
    keywords: ["git", "clone", "fork", "کلون"],
    payload: "git clone https://github.com/arsamadineh/Persian-Quote-API\ncd Persian-Quote-API",
  },

  // ── پرامپت‌های آماده ───────────────────────────────
  {
    id: "prompt-explain",
    title: "توضیح ساختار موتور",
    desc: "از دستیار بخواهید معماری lib/engine را توضیح دهد",
    category: "prompt",
    href: "/docs#ai-prompts",
    keywords: ["ai", "cursor", "claude", "explain"],
    payload: "You are working in /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API. Read lib/engine/*.ts and produce a written map of every module, what it exports, and how they wire together. Keep it under 400 words in Persian.",
  },
  {
    id: "prompt-endpoint",
    title: "افزودن اندپوینت جدید",
    desc: "ساخت یک اندپوینت GET روی موتور تیغ",
    category: "prompt",
    href: "/docs#ai-prompts",
    keywords: ["ai", "add", "endpoint", "جدید"],
    payload: "Add a new Next.js route at app/api/quotes/by-tag/[tag]/route.ts that uses Tigh from lib/engine. The route should: filter sampleQuotes by an array of tags, return at most 50 results with cache TTL 60s, and surface non-200 through the engine's circuit breaker. Include the engine.handle wiring.",
  },
  {
    id: "prompt-cache",
    title: "تنظیم هوشمند کش",
    desc: "پیشنهاد TTL بهینه بر اساس الگوی ترافیک",
    category: "prompt",
    href: "/docs#ai-prompts",
    keywords: ["ai", "cache", "ttl", "بهینه"],
    payload: "Look at lib/engine/instance.ts and lib/engine/cache.ts. Based on routes in app/api/*/route.ts, recommend a defaultTTL per route, and produce a snippet that overrides cache by request using engine.route({ cache: { ttl, key } }).",
  },
  {
    id: "prompt-debug",
    title: "اشکال‌زدایی Latency",
    desc: "تشخیص علت کندی و ارائه راه‌حل",
    category: "prompt",
    href: "/docs#ai-prompts",
    keywords: ["ai", "debug", "latency", "کندی"],
    payload: "Hit GET /api/engine/stats and parse the latency percentiles. Suggest two concrete tweaks (cache key, TTL, or eager prewarm) that would bring p99 below 50ms. Show diffs against lib/data/*.json imports inside the route files.",
  },
  {
    id: "prompt-deploy",
    title: "راه‌اندازی استقرار",
    desc: "آماده‌سازی برای Vercel",
    category: "prompt",
    href: "/docs#ai-prompts",
    keywords: ["ai", "deploy", "vercel", "استقرار"],
    payload: "I want to deploy this Next.js app to Vercel. Walk me through the exact env vars, build command, and a vercel.json tweak to make /api/engine/stats run on the Edge runtime without breaking the filesystem JSON imports.",
  },
]

// تابع امتیازدهی سریع بر پایه match ساده.
// مناسب برای حجم کم — از هر کتابخانه سنگین‌تری سریع‌تر است.
export function scoreItem(item: DocItem, q: string): number {
  if (!q) return 1
  const needle = q.toLowerCase().trim()
  if (!needle) return 1

  const haystackTitle = item.title.toLowerCase()
  const haystackTitleEn = (item.titleEn || "").toLowerCase()
  const haystackDesc = item.desc.toLowerCase()
  const haystackKeywords = item.keywords.join(" ").toLowerCase()

  let score = 0

  if (haystackTitle.startsWith(needle)) score += 30
  if (haystackTitle.includes(needle)) score += 20

  if (haystackTitleEn.startsWith(needle)) score += 25
  if (haystackTitleEn.includes(needle)) score += 15

  if (haystackDesc.includes(needle)) score += 8

  for (const kw of item.keywords) {
    const k = kw.toLowerCase()
    if (k === needle) score += 12
    if (k.startsWith(needle)) score += 8
    if (k.includes(needle)) score += 4
  }

  // توکن‌های جداگانه — اگر query چندکلمه‌ای بود، تمام توکن‌ها باید match شوند
  const tokens = needle.split(/\s+/).filter(Boolean)
  if (tokens.length > 1) {
    let allMatched = true
    for (const t of tokens) {
      const matched =
        haystackTitle.includes(t) ||
        haystackTitleEn.includes(t) ||
        haystackDesc.includes(t) ||
        haystackKeywords.includes(t)
      if (!matched) {
        allMatched = false
        break
      }
    }
    if (allMatched) score += 10
  }

  // payload اولویت بیشتری دارد (برای snippet)
  if (item.payload && item.payload.toLowerCase().includes(needle)) score += 5

  return score
}

export function searchDocs(query: string, limit = 60): DocItem[] {
  if (!query.trim()) {
    return DOC_INDEX.slice(0, Math.min(limit, 12))
  }

  const results = DOC_INDEX.map((item) => ({ item, score: scoreItem(item, query) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.item)

  return results
}
