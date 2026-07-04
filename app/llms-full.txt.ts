// llms-full.txt - نسخه کامل‌تر فایل llms.txt برای خزنده‌های هوش مصنوعی.
// شامل نمونه کد، ساختار پاسخ، و توضیحات تفصیلی هر اندپوینت.

import sampleQuotes from "@/lib/data/poetry-quotes.json"
import hafez from "@/lib/data/hafez.json"
import shereno from "@/lib/data/shereno.json"
import nonPoetry from "@/lib/data/non-poetry-quotes.json"

export const dynamic = "force-static"
export const revalidate = 3600

const SITE_URL = "https://pq.arsamadineh.ir"

export async function GET() {
  const sample = (sampleQuotes as any[]).slice(0, 3)

  const body = `# API اشعار فارسی — نسخه کامل برای مدل‌ها

> این فایل حاوی تمام اطلاعات فنی، نمونه‌ها، و ساختار پاسخ‌های API اشعار فارسی است. برای آشنایی سریع، فایل llms.txt را مطالعه کنید.

## فهرست

- [معماری کلی](#معماری-کلی)
- [نمونه درخواست‌ها](#نمونه-درخواست‌ها)
- [ساختار پاسخ‌ها](#ساختار-پاسخ‌ها)
- [موتور تیغ](#موتور-تیغ)
- [نمونه اشعار](#نمونه-اشعار)
- [نمونه داده‌ها](#نمونه-داده‌ها)

## معماری کلی

پروژه شامل سه لایه اصلی است:

1. لایه داده: فایل‌های JSON شامل اشعار کلاسیک، دیوان حافظ، شعر نو، و سخنان بزرگان. فایل‌ها در پوشه lib/data/ قرار دارند و در زمان ساخت خوانده می‌شوند.

2. لایه API: اندپوینت‌های Next.js App Router که در app/api/ تعریف شده‌اند. هر اندپوینت داده‌ها را از لایه اول می‌خواند، فیلتر و محدودسازی اعمال می‌کند، و پاسخ JSON برمی‌گرداند.

3. لایه موتور تیغ: موتور داخلی برای بهینه‌سازی عملکرد. شامل مسیریاب Trie، کش LRU با TTL، محدودساز نرخ، مدار شکن، و متریک.

## نمونه درخواست‌ها

### دریافت شعر تصادفی

\`\`\`
GET ${SITE_URL}/api/quotes?random=true&limit=1
\`\`\`

### دریافت فال حافظ

\`\`\`
GET ${SITE_URL}/api/quotes/hafez?random=true&limit=1
\`\`\`

### جستجو

\`\`\`
GET ${SITE_URL}/api/quotes/search?q=عشق&limit=5
\`\`\`

### با curl

\`\`\`bash
curl "${SITE_URL}/api/quotes?random=true&limit=1"
curl "${SITE_URL}/api/quotes/hafez?random=true&limit=1"
curl "${SITE_URL}/api/quotes/search?q=%D8%B9%D8%B4%D9%82&limit=5"
\`\`\`

### با جاوااسکریپت

\`\`\`javascript
const res = await fetch("${SITE_URL}/api/quotes?random=true&limit=1")
const { data } = await res.json()
console.log(data[0].text_persian)
\`\`\`

### با پایتون

\`\`\`python
import requests
r = requests.get("${SITE_URL}/api/quotes", params={"random": "true", "limit": 1})
print(r.json()["data"][0]["text_persian"])
\`\`\`

## ساختار پاسخ‌ها

تمام پاسخ‌ها JSON با ساختار یکپارچه:

\`\`\`json
{
  "success": true,
  "data": [ /* آرایه‌ای از اشعار یا نتایج */ ],
  "count": 1,
  "meta": {
    "limit": 1,
    "random": true
  }
}
\`\`\`

### ساختار هر شعر

\`\`\`json
{
  "id": 1,
  "text_persian": "متن فارسی شعر",
  "text_english": "English translation",
  "poet": "نام شاعر به فارسی",
  "poet_english": "Poet name in English",
  "source": "نام منبع",
  "category": "دسته‌بندی موضوعی",
  "tags": ["تگ۱", "تگ۲"]
}
\`\`\`

### ساختار غزل حافظ

\`\`\`json
{
  "id": 1,
  "verses": [
    ["مصرع اول بیت اول", "مصرع دوم بیت اول"],
    ["مصرع اول بیت دوم", "مصرع دوم بیت دوم"]
  ],
  "poet": "حافظ شیرازی",
  "source": "دیوان حافظ"
}
\`\`\`

## موتور تیغ

### ماژول‌ها

- TighRouter: مسیریاب Trie با matching در O(۱). پارامترهای داینامیک با [name] و wildcard با *.
- TighCache: کش LRU با TTL. نقشه ایندکس داخلی برای حذف O(۱). متدهای get, set, has, delete, invalidatePattern.
- TighRateLimiter: سه استراتژی. Token Bucket برای burst، Sliding Window برای دقت، Fixed Window برای سادگی.
- TighCircuitBreaker: سه حالت. closed برای عملکرد عادی، open برای بلاک، half-open برای آزمایش.
- TighMetrics: حافظه حلقوی Float64Array برای latency. محاسبه P50/P90/P95/P99 در O(n).
- TighMiddleware: زنجیره middleware. corsMiddleware، timingMiddleware، compressMiddleware به‌صورت پیش‌فرض.
- createNextHandler: اداپتور برای Next.js App Router.

### پیکربندی پیش‌فرض

\`\`\`typescript
new Tigh({
  enableCache: true,
  enableRateLimit: true,
  enableCircuitBreaker: true,
  cache: { maxSize: 5000, defaultTTL: 30000 },
  rateLimit: { maxRequests: 120, windowMs: 60000, strategy: "token-bucket" },
  circuitBreaker: { failureThreshold: 5, recoveryTimeout: 30000 }
})
\`\`\`

### استفاده

\`\`\`typescript
import { Tigh } from "@/lib/engine"

const engine = new Tigh()

engine.get("/api/quotes", async (req) => {
  return { status: 200, body: { data: [] } }
}, { cache: { ttl: 60000 } })
\`\`\`

## نمونه اشعار

${sample
  .map(
    (q, i) => `### ${i + 1}. ${q.poet}

فارسی: ${q.text_persian}

انگلیسی: ${q.text_english || "(ترجمه موجود نیست)"}

منبع: ${q.source || "(نامشخص)"} · دسته: ${q.category || "(نامشخص)"}
`,
  )
  .join("\n")}

## آمار پایگاه داده

- اشعار کلاسیک: ${(sampleQuotes as any[]).length} مورد
- غزلیات حافظ: ${(hafez as any[]).length} غزل
- شعر نو معاصر: ${(shereno as any[]).length}+ اثر
- سخنان بزرگان: ${(nonPoetry as any[]).length}+ مورد
- تعداد شاعران: ${new Set((sampleQuotes as any[]).map((q) => q.poet)).size}

## پشتیبانی و ارتباط

- مخزن گیت‌هاب: https://github.com/arsamadineh/Persian-Quote-API
- توسعه‌دهنده: آرسام آدینه
- مجوز کد: MIT
- مجوز محتوا: مالکیت عمومی
`

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
