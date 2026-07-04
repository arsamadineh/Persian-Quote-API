<p align="center">
  <a href="https://pq.arsamadineh.ir">
    <img src="public/banner.svg" alt="API اشعار فارسی" width="100%" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/arsamadineh/Persian-Quote-API/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/%D9%85%D8%AC%D9%88%D8%B2-MIT-green?style=for-the-badge" alt="مجوز MIT" />
  </a>
  <a href="https://github.com/arsamadineh/Persian-Quote-API/releases">
    <img src="https://img.shields.io/badge/%D9%86%D8%B3%D8%AE%D9%87-%DB%B3.%DB%B1.%DB%B1-blue?style=for-the-badge" alt="نسخه" />
  </a>
  <a href="https://github.com/arsamadineh/Persian-Quote-API/stargazers">
    <img src="https://img.shields.io/github/stars/arsamadineh/Persian-Quote-API?style=for-the-badge&color=amber" alt="ستاره‌ها" />
  </a>
  <a href="https://github.com/arsamadineh/Persian-Quote-API/network/members">
    <img src="https://img.shields.io/github/forks/arsamadineh/Persian-Quote-API?style=for-the-badge&color=indigo" alt="شاخه‌ها" />
  </a>
  <a href="https://github.com/arsamadineh/Persian-Quote-API/issues">
    <img src="https://img.shields.io/github/issues/arsamadineh/Persian-Quote-API?style=for-the-badge" alt="مسائل" />
  </a>
</p>

<p align="center">
  <strong>دسترسی آزاد به گنجینه اشعار شاعران بزرگ فارسی، فقط با یک درخواست HTTP.</strong>
</p>

<p align="center">
  بدون ثبت‌نام. بدون کلید API. بدون محدودیت پرداخت. متن‌باز با مجوز MIT.
</p>

---

## نمای کلی

API اشعار فارسی یک سرویس REST عمومی و رایگان برای دسترسی به اشعار کلاسیک و معاصر فارسی است. این پروژه شامل اشعار مولانا، حافظ، سعدی، فردوسی، نیما یوشیج، سهراب سپهری، و سخنان بیش از ۴۹۰ بزرگ تاریخ است.

ویجت قابل تعبیه، صفحه مستندات تعاملی، نمونه‌های کاربردی با اجرای زنده، و موتور API اختصاصی (Tigh) از قابلیت‌های این پروژه هستند.

## نقشه فناوری

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
</p>

## شروع سریع

یک شعر تصادفی:

```bash
curl https://pq.arsamadineh.ir/api/quotes?random=true&limit=1
```

یک غزل حافظ برای فال:

```bash
curl https://pq.arsamadineh.ir/api/quotes/hafez?random=true&limit=1
```

جستجو در میان اشعار:

```bash
curl "https://pq.arsamadineh.ir/api/quotes/search?q=عشق&limit=5"
```

نمونه پاسخ:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "text_persian": "عاشقان مرده‌اند در عشق زنده\nتا ابد در دل جانان پاینده",
      "text_english": "Lovers are dead in love, yet alive / Forever enduring in the beloved's heart",
      "poet": "مولانا جلال‌الدین رومی",
      "poet_english": "Rumi",
      "source": "دیوان شمس",
      "category": "عشق"
    }
  ],
  "count": 1
}
```

## اندپوینت‌ها

| روش | مسیر | توضیح |
|---|---|---|
| `GET` | `/api/quotes` | فهرست اشعار با فیلتر شاعر و موضوع |
| `GET` | `/api/quotes/[poet]` | اشعار یک شاعر مشخص |
| `GET` | `/api/quotes/category/[category]` | اشعار یک موضوع مشخص |
| `GET` | `/api/quotes/hafez` | دیوان کامل حافظ (۴۹۷ غزل) |
| `GET` | `/api/quotes/shereno` | بیش از چهار هزار اثر شعر نو |
| `GET` | `/api/quotes/non-poetry` | سخنان ۴۹۰+ بزرگ تاریخ |
| `GET` | `/api/quotes/search` | جستجوی پیشرفته در متن اشعار |
| `GET` | `/api/poets` | فهرست شاعران |
| `GET` | `/api/categories` | دسته‌بندی‌های موضوعی |
| `GET` | `/api/stats` | آمار کلی پایگاه داده |
| `GET` | `/api/embed` | ویجت HTML قابل تعبیه |
| `GET` | `/api/engine/stats` | متریک زنده موتور Tigh |
| `GET` | `/api/engine/benchmark` | بنچمارک عملکردی موتور |

### پارامترهای رایج

| پارامتر | نوع | پیش‌فرض | توضیح |
|---|---|---|---|
| `random` | `boolean` | `false` | دریافت تصادفی |
| `limit` | `number` | `10` | تعداد نتایج (حداکثر ۱۰۰) |
| `poet` | `string` | - | فیلتر نام شاعر |
| `category` | `string` | - | فیلتر موضوع |
| `q` | `string` | - | عبارت جستجو |
| `lang` | `string` | `fa` | زبان جستجو (fa/en/both) |

## موتور Tigh

پروژه شامل یک موتور API اختصاصی به نام **Tigh** است که زیرساخت پردازش درخواست‌ها را مدیریت می‌کند:

| ماژول | عملکرد |
|---|---|
| **Trie Router** | مسیریابی سریع با پشتیبانی از پارامترهای داینامیک و wildcard |
| **LRU Cache** | کش درون‌برنامه‌ای با TTL و ردیابی دسترسی O(1) |
| **Rate Limiter** | محدودسازی نرخ با سه الگوریتم: Token Bucket، Sliding Window، Fixed Window |
| **Circuit Breaker** | مدار شکن خودترمیم‌شونده با سه حالت closed/open/half-open |
| **Metrics** | جمع‌آوری متریک با حافظه حلقه‌ای: P50/P99 latency، hit rate، uptime |
| **Middleware** | پایپلاین CORS، اندازه‌گیری زمان، و فشرده‌سازی gzip |

## صفحات پروژه

| مسیر | توضیح |
|---|---|
| `/` | صفحه اصلی با معرفی و نمونه تعاملی API |
| `/docs` | مستندات کامل اندپوینت‌ها با جستجوی سراسری (Ctrl K) |
| `/examples` | نمونه کد در چهار زبان با اجرای زنده |
| `/embed` | سازنده ویجت با پیش‌نمایش آنی و کد تعبیه |
| `/sakhtar` | نمایش معماری موتور Tigh با نمودار و متریک زنده |
| `/contribute` | فرم مشارکت برای افزودن شعر جدید |
| `/changelog` | تاریخچه تغییرات نسخه‌ها |
| `/privacy` | سیاست حریم خصوصی |
| `/terms` | شرایط استفاده |

## ویجت قابل تعبیه

ویجت اشعار فارسی را می‌توانید با تنظیمات دلخواه بسازید و در وب‌سایت خود قرار دهید:

```html
<iframe
  src="https://pq.arsamadineh.ir/api/embed?theme=elegant&size=medium"
  width="100%"
  height="400"
  frameborder="0"
  scrolling="no"
>
</iframe>
```

پارامترهای موجود: `theme` (default/elegant/minimal/classic/modern)، `size` (small/medium/large)، `poet`، `category`، `english`، `source`، `category_badge`، `auto_refresh`، `refresh_interval`.

## ساختار پروژه

```
app/
  api/                  اندپوینت‌های REST
    quotes/             دریافت اشعار
    embed/              ویجت HTML
    engine/             متریک و بنچمارک موتور
    poets/              فهرست شاعران
    categories/         دسته‌بندی‌ها
    stats/              آمار پایگاه داده
  docs/                 مستندات تعاملی
  examples/             نمونه‌های کاربردی
  embed/                سازنده ویجت
  sakhtar/              معماری موتور Tigh
  contribute/           فرم مشارکت
  changelog/            صفحه تغییرات
  privacy/              سیاست حریم خصوصی
  terms/                شرایط استفاده

lib/
  engine/               موتور Tigh
    engine.ts           هسته اصلی
    router.ts           مسیریاب Trie
    cache.ts            کش LRU با ایندکس نقشه‌ای
    rate-limiter.ts     محدودسازی نرخ (سه الگوریتم)
    circuit-breaker.ts  مدار شکن خودترمیم
    metrics.ts          متریک با حافظه حلقه‌ای
    middleware.ts       CORS، زمان‌سنجی، فشرده‌سازی
    adapter-next.ts     اداپتور Next.js
    instance.ts         نمونه سراسری موتور
    types.ts            تعریف انواع
  data/                 فایل‌های JSON اشعار
    poetry-quotes.json  اشعار کلاسیک
    hafez.json          دیوان حافظ (۴۹۷ غزل)
    shereno.json        شعر نو (۴۰۰۰+ اثر)
    non-poetry-quotes.json  سخنان بزرگان (۴۹۰+)
  changelog.ts          منبع حقیقتی تغییرات
  utils.ts              توابع مشترک (cn، formatVerse)

components/
  navbar.tsx            نوار ناوبری شیشه‌ای
  footer.tsx            فوتر مشترک
  quote-cards/          کارت‌های نمایش شعر
  ui/                   کامپوننت‌های پایه

public/
  banner.svg            بنر اصلی پروژه
  og-image.svg          تصویر Open Graph
  twitter-card.svg      تصویر Twitter Card
  icon.svg              فاوآیکن
```

## نصب و راه‌اندازی

پیش‌نیازها: Node.js ۱۸+ و یکی از npm، pnpm، یا bun.

```bash
git clone https://github.com/arsamadineh/Persian-Quote-API.git
cd Persian-Quote-API
npm install
npm run dev
```

پروژه روی `http://localhost:3000` در دسترس خواهد بود.

## مشارکت

**روش آسان**: فرم تعاملی در `/contribute` — بدون نیاز به دانش برنامه‌نویسی، فقط متن شعر را وارد کنید.

**روش مستقیم**: مخزن را fork کنید، شاخه جدید بسازید، تغییرات را در `lib/changelog.ts` ثبت کنید، و PR ارسال کنید.

پیش از مشارکت، فایل `AGENTS.md` را مطالعه کنید.

## مجوز

این پروژه تحت مجوز [MIT](LICENSE) منتشر شده است. اشعار موجود در پایگاه داده در حوزه مالکیت عمومی قرار دارند.

## حمایت مالی

این پروژه به‌طور کامل توسط آرسام آدینه و با هزینه شخصی توسعه و نگهداری می‌شود. اگر برایتان مفید بود، با خرید یک قهوه از ادامه کار حمایت کنید:

<a href="https://www.coffeebede.com/arsamadineh"><img src="https://coffeebede.ir/DashboardTemplateV2/app-assets/images/banner/default-yellow.svg" alt="حمایت مالی" /></a>

## آمار پروژه

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=arsamadineh&repo=Persian-Quote-API&show_icons=true&theme=radical&hide_border=true&bg_color=0D1117&title_color=F59E0B&text_color=E6E6E6&icon_color=F59E0B" alt="آمار گیت‌هاب" />
  <img src="https://streak-stats.demolab.com?user=arsamadineh&repo=Persian-Quote-API&theme=radical&hide_border=true&background=0D1117&stroke=E7E5E4&ring=F59E0B&fire=F59E0B&currStreakLabel=F59E0B&sideLabels=E6E6E6&dates=A8A29E" alt="آمار پیوستگی" />
</p>

<p align="center">
  <a href="https://github.com/arsamadineh/Persian-Quote-API/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=arsamadineh/Persian-Quote-API&max=24&theme=radical" alt="مشارکت‌کنندگان" />
  </a>
</p>

## توسعه‌دهنده

این پروژه توسط **آرسام آدینه** (Arsam Adineh) طراحی، توسعه، و تامین مالی شده است.

- وب‌سایت: [arsamadineh.ir](https://arsamadineh.ir)
- گیت‌هاب: [github.com/arsamadineh](https://github.com/arsamadineh)
- X: [x.com/dev_arsam](https://x.com/dev_arsam)
- تلگرام: [t.me/arsamadineh](https://t.me/arsamadineh)
- ایمیل: [contact@arsamadineh.ir](mailto:contact@arsamadineh.ir)

## تماس و ارتباط

- مخزن: [arsamadineh/Persian-Quote-API](https://github.com/arsamadineh/Persian-Quote-API)
- گزارش مشکل: [Issues](https://github.com/arsamadineh/Persian-Quote-API/issues)
- تغییرات: [lib/changelog.ts](lib/changelog.ts)
