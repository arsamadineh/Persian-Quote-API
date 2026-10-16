# خلاصه پروژه Persian-Quote-API

## هدف پروژه

**API رایگان و عمومی برای دسترسی به اشعار و سخنان بزرگان فارسی** — دسترسی ساده به گنجینه اشعار شاعران کلاسیک (حافظ، مولانا، سعدی، فردوسی) و معاصر (نیما یوشیج، سپهری)، و سخنان ۴۹۰+ بزرگ تاریخ. بدون ثبتنام، بدون کلید API، بدون حد پرداخت.

## چالشهای اصلی

۱. **طراحی موتور اختصاصی** — ساخت موتور Tigh برای مسیریابی سریع، کشکردن هوشمند، محدودسازی نرخ، و جمعآوری متریکهای زنده، نه استفاده از فریمورک آماده

۲. **مدیریت حجم بالای داده** — ۴۹۷ غزل حافظ + ۴۰۰۰ شعر معاصر + ۴۹۰ سخن غیرشاعری = دسترسی سریع و جستجوی بهینهشده

۳. **رابط کاربری چندلایه** — توثیق API در مستندات تعاملی، سازنده ویجت قابل تعبیه، معرفی معماری زنده

۴. **قابلیت مشارکت** — فرم تعاملی برای افزودن شعر جدید بدون نیاز به دانش برنامهنویسی

## نحوه انجام کار

### الف) موتور Tigh (هسته فنی)

- **Trie Router**: مسیریابی سریع O(1) برای اندپوینتهای پویا
- **LRU Cache**: کش درونبرنامهای با TTL و ردیابی دسترسی O(1)
- **Rate Limiter**: سه الگوریتم (Token Bucket، Sliding Window، Fixed Window)
- **Circuit Breaker**: مدار شکن خودترمیمشونده برای تحمل خرابی
- **Metrics**: جمعآوری P50/P99 latency، hit rate، uptime در حافظه حلقهای
- **Middleware**: CORS، اندازهگیری زمان، فشردهسازی gzip

### ب) صفحات و رابط

- **صفحه اصلی** (`/`): معرفی و تجربه تعاملی API
- **مستندات** (`/docs`): تمام اندپوینتها با جستجوی سراسری
- **نمونههای کد** (`/examples`): ۴ زبان با اجرای زنده
- **سازنده ویجت** (`/embed`): پیشنمایش آنی و کد تعبیه
- **معماری** (`/sakhtar`): نمودار موتور Tigh و متریک زنده
- **مشارکت** (`/contribute`): فرم ساده برای افزودن شعر

### ج) اندپوینتهای API

- `/api/quotes` — اشعار با فیلتر شاعر/موضوع
- `/api/quotes/[poet]` — اشعار شاعر مشخص
- `/api/quotes/hafez` — دیوان حافظ (۴۹۷ غزل)
- `/api/quotes/shereno` — شعر نو (۴۰۰۰ اثر)
- `/api/quotes/search` — جستجوی پیشرفته
- `/api/poets` — فهرست شاعران
- `/api/categories` — دستهبندیهای موضوعی
- `/api/engine/stats` و `/api/engine/benchmark` — متریکهای موتور

## نتیجه نهایی

**یک پلتفرم کامل و تولیدکننده**:

- ✓ API کاملاً عملکردی با ۸+ اندپوینت و جستجوی پیشرفته
- ✓ موتور Tigh اختصاصی — کش، rate limiting، circuit breaker، metrics
- ✓ ۶+ صفحه تعاملی (مستندات، نمونه، ویجت، معماری)
- ✓ ویجت HTML قابل تعبیه با ۵ تم و پارامترهای کنترلشونده
- ✓ ۹۰۰۰+ شعر و سخن — حافظ، شعر معاصر، و بزرگان تاریخ
- ✓ فرم مشارکت برای مشارکتکنندگان
- ✓ صفحه معماری زنده با متریکهای موتور
- ✓ مستندات کامل در فارسی و انگلیسی
- ✓ کد باز تحت MIT

**وضعیت فعلی**: پروژه اجراشونده و آماده برای استقرار.

## مهارتهای استفادهشده

### الف) معماری و طراحی

- طراحی موتور اختصاصی بدون وابستگیهای سنگین
- Trie routing، LRU cache، rate limiting algorithms
- Circuit breaker pattern برای resilience
- Metrics collection با ring buffer

### ب) فنیهای Frontend

- React 19 + TypeScript + Next.js 15 (App Router)
- Tailwind CSS 4 + Radix UI components
- Interactive documentation + live code examples
- Custom widget builder با پیشنمایش آنی

### ج) مدیریت داده

- ۹۰۰۰+ رکورد شعر در JSON منظمشده
- Query optimization و فیلتریگ سریع
- Search tokenization برای جستجوی فارسی

### د) DevOps و عملیات

- Next.js deployment (Vercel-ready)
- Monolithic structure با ماژولهای روشن
- Live metrics و performance monitoring
- Version tracking درون `lib/changelog.ts`

### ه) تجربه کاربر

- صفحات چندزبانه (فارسی/انگلیسی)
- Responsive design برای همه دستگاهها
- Interactive forms و real-time previews
- Embeddable widget system

---

**برچسب پروژه**: Open-source SaaS | REST API | Custom Engine | Persian Literature | Next.js | Metrics-Driven
