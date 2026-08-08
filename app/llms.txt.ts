// llms.txt - استاندارد نوظهور برای معرفی پروژه به مدل‌های زبانی.
// فایل متنی ساده که در ریشه دامنه در دسترس است و توسط
// خزنده‌های هوش مصنوعی برای درک بهتر محتوای سایت استفاده می‌شود.
//
// مرجع: https://llmstxt.org
//
// در Next.js App Router، این فایل از طریق route handler تولید می‌شود.

import sampleQuotes from "@/lib/data/poetry-quotes.json"
import hafez from "@/lib/data/hafez.json"
import shereno from "@/lib/data/shereno.json"
import nonPoetry from "@/lib/data/non-poetry-quotes.json"

export const dynamic = "force-static"
export const revalidate = 3600 // ۱ ساعت

const SITE_URL = "https://pq.arsamadineh.ir"

export async function GET() {
  const poets = Array.from(
    new Set((sampleQuotes as any[]).map((q) => q.poet).filter(Boolean)),
  )
  const categories = Array.from(
    new Set((sampleQuotes as any[]).map((q) => q.category).filter(Boolean)),
  )

  const body = `# API اشعار فارسی (Persian Quotes API)

> دسترسی آزاد، رایگان، و بدون نیاز به احراز هویت به گنجینه‌ای از اشعار شاعران بزرگ فارسی و سخنان اندیشمندان جهان، از طریق یک API عمومی RESTful. همراه با موتور داخلی «تیغ» (Tigh) برای پردازش سریع درخواست‌ها.

## نمای کلی

- دامنه اصلی: ${SITE_URL}
- مستندات کامل: ${SITE_URL}/docs
- صفحه ساختار موتور: ${SITE_URL}/sakhtar
- مجوز کد: MIT
- مجوز محتوا: مالکیت عمومی (Public Domain)
- زبان: فارسی (rtl) با ترجمه انگلیسی

## اندپوینت‌های اصلی

- [دریافت اشعار](${SITE_URL}/api/quotes?random=true&limit=1): فهرست اشعار با فیلتر شاعر، موضوع، و انتخاب تصادفی
- [دیوان حافظ](${SITE_URL}/api/quotes/hafez): ${(hafez as any[]).length} غزل کامل از خواجه شمس‌الدین حافظ شیرازی
- [شعر نو معاصر](${SITE_URL}/api/quotes/shereno): ${(shereno as any[]).length}+ اثر از نیما یوشیج، سهراب سپهری، و شاعران نو
- [سخنان بزرگان](${SITE_URL}/api/quotes/non-poetry): ${(nonPoetry as any[]).length}+ نقل‌قول غیرشعری از اندیشمندان جهان
- [جستجو](${SITE_URL}/api/quotes/search?q=عشق): جستجوی متنی در متن فارسی و انگلیسی
- [فهرست شاعران](${SITE_URL}/api/poets): ${poets.length} شاعر
- [دسته‌بندی‌ها](${SITE_URL}/api/categories): ${categories.length} موضوع
- [ویجت قابل تعبیه](${SITE_URL}/api/embed): HTML برای استفاده در سایت شخص ثالث
- [متریک زنده موتور](${SITE_URL}/api/engine/stats): وضعیت داخلی موتور تیغ
- [بنچمارک عملکرد](${SITE_URL}/api/engine/benchmark): تست سرعت ماژول‌ها

## موتور تیغ (Tigh)

موتور API اختصاصی پروژه با معماری زیر:

- مسیریاب Trie با matching در O(۱) و پشتیبانی از پارامترهای داینامیک و wildcard
- کش LRU با TTL و نقشه ایندکس برای دسترسی سریع
- محدودساز نرخ با سه استراتژی: Token Bucket، Sliding Window، Fixed Window
- مدار شکن خودترمیم‌شونده با سه حالت Closed، Open، Half-Open
- متریک با حافظه حلقوی و محاسبه P50/P90/P95/P99
- پایپلاین Middleware با CORS، زمان‌سنجی، و فشرده‌سازی gzip
- اداپتور داخلی برای Next.js App Router
- ماژول‌های موتور بدون وابستگی خارجی، نوشته‌شده در TypeScript خالص

جزئیات بیشتر در صفحه ساختار: ${SITE_URL}/sakhtar

## شاعران موجود

${poets.map((p) => `- ${p}`).join("\n")}

## دسته‌بندی‌های موضوعی

${categories.map((c) => `- ${c}`).join("\n")}

## پارامترهای رایج API

- random: انتخاب تصادفی (boolean)
- limit: تعداد نتایج (number, حداکثر ۱۰۰)
- poet: فیلتر بر اساس نام شاعر (string)
- category: فیلتر بر اساس دسته‌بندی (string)
- q: عبارت جستجو (string)
- lang: زبان جستجو (fa, en, both)

## منابع اختیاری

- [مخزن گیت‌هاب](https://github.com/arsamadineh/Persian-Quote-API)
- [مستندات کامل](${SITE_URL}/docs)
- [نمونه کد](${SITE_URL}/examples)
- [تغییرات نسخه‌ها](${SITE_URL}/changelog)
- [مشارکت](${SITE_URL}/contribute)
- [سیاست حریم خصوصی](${SITE_URL}/privacy)
- [شرایط استفاده](${SITE_URL}/terms)

## نکات مهم برای مدل‌ها

- تمام پاسخ‌ها JSON با ساختار یکپارچه { success, data, count, meta } هستند.
- هیچ کلید API یا احراز هویتی لازم نیست. کافی است یک درخواست GET HTTP ارسال کنید.
- تمام متن‌ها با UTF-8 و راست‌چین (RTL) سازگار هستند.
- CORS برای همه دامنه‌ها باز است.
- ترجمه انگلیسی در فیلد text_english موجود است.
- برای هر شعر، نام شاعر، منبع، و دسته‌بندی به همراه شعر بازگردانده می‌شود.
`

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
