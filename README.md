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
    <img src="https://img.shields.io/badge/%D9%86%D8%B3%D8%AE%D9%87-%DB%B3.%DB%B1%DB%B5.%DB%B0-blue?style=for-the-badge" alt="نسخه" />
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
  <strong>دسترسی آزاد، ساختاریافته و پرسرعت به گنجینه شعر و ادب فارسی با یک درخواست ساده HTTP.</strong>
</p>

<p align="center">
  بدون نیاز به ثبت‌نام. بدون کلید دسترسی. بدون هزینه. متن‌باز با مجوز MIT.
</p>

---

## معرفی پروژه

سرویس API اشعار فارسی یک بستر متن‌باز، قابل اتکا و استاندارد برای دسترسی به متون ادبیات کلاسیک و معاصر فارسی است. این پایگاه داده دربردارنده بیش از ۹,۰۰۰ اثر و گزیده از شاعران برجسته پارسی‌گوی از جمله حافظ، مولانا، سعدی، فردوسی، خیام، عطار، نیما یوشیج، سهراب سپهری، نادر نادرپور، سلمان هراتی و کلمات قصار بزرگان تاریخ است.

هدف این پروژه، ارائه متون ادبی به شکلی کاملاً ساختاریافته (تفکیک دقیق بیت‌ها، مصرع‌ها، بندها و استخراج ترقیمه‌ها) همراه با زیرساختی پرسرعت، مستقل و مناسب برای پژوهش‌های دانشگاهی و استفاده در سامانه‌های نرم‌افزاری است.

## قابلیت‌های کلیدی

- **داده‌های کاملاً ساختاریافته**: تفکیک منظم ابیات سنتی به زوج مصراع‌ها، استخراج اطلاعات ترقیمه (مکان و زمان سرایش شعر)، و محاسبه اوزان و قوافی بدون دستکاری در اصالت واژگان.
- **موتور مستقل تیغ ۱.۰.۰ (Tigh Engine)**: هسته پردازشی سریع با صفر وابستگی خارجی در مسیر اصلی، بهره‌گیری از مسیریاب Radix Tree، حافظه پنهان پیش‌ساخته مبتنی بر الگوریتم‌های S3-FIFO و W-TinyLFU، و محدودکننده نرخ GCRA.
- **اندپوینت‌های نسخه ۱ و حفظ سازگاری**: ارائه اندپوینت‌های استاندارد `/v1` با پشتیبانی از صفحه‌بندی نشانگری (Cursor Pagination)، فیلترهای متنوع، و رعایت قالب خطای استاندارد RFC 9457، در کنار حفظ کامل سازگاری با اندپوینت‌های پیشین `/api/**`.
- **جستجوی پیشرفته متنی و هیبریدی**: موتور جستجوی فارسی مبتنی بر الگوریتم BM25F با درک عبارات، رتبه‌بندی دقیق، تصحیح خطاهای املایی رایج و قابلیت درک پرسمان‌های فینگلیش.
- **ابزارهای وب و یکپارچه‌سازی**: کامپوننت وب استاندارد `<persian-quote>` با حجم کمتر از ۴ کیلوبایت، همراه با ویجت آی‌فریم و سازنده تعاملی ویجت.
- **مناسب برای پژوهش و محیط‌های هوش مصنوعی**: شناسه‌های دائمی و پایدار برای آثار، پشتیبانی از فرمت‌های استناد دانشگاهی (APA، BibTeX، CSL)، سرور MCP اختصاصی برای دستیاران هوش مصنوعی، و بسته‌های نرم‌افزاری تایپ‌اسکریپت و پایتون.

## نقشه فناوری

<p align="center">
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/Bun-1.4-000000?style=for-the-badge&logo=bun&logoColor=white" alt="Bun" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
</p>

## شروع سریع

### دریافت تصادفی یک اثر (نسخه ۱)

```bash
curl https://pq.arsamadineh.ir/v1/works/random
```

نمونه خروجی ساختاریافته:

```json
{
  "data": {
    "id": "hafez.ghazal.001",
    "kind": "classical",
    "form": "ghazal",
    "title": "غزل شماره ۱",
    "poet": {
      "id": "hafez",
      "name": "خواجه شمس‌الدین محمد حافظ شیرازی"
    },
    "text": {
      "beyts": [
        ["الا یا ایها الساقی ادر کاسا و ناولها", "که عشق آسان نمود اول ولی افتاد مشکل‌ها"],
        ["به بوی نافه‌ای کاخر صبا زان طره بگشاید", "ز تاب جعد مشکینش چه خون افتاد در دل‌ها"]
      ]
    },
    "stats": {
      "lines": 14,
      "words": 92
    }
  },
  "links": {
    "self": "/v1/works/hafez.ghazal.001",
    "cite": "/v1/works/hafez.ghazal.001/cite"
  }
}
```

### شعر روز (به وقت تهران)

```bash
curl https://pq.arsamadineh.ir/v1/daily
```

### فال حافظ با پیوند ماندگار

```bash
curl "https://pq.arsamadineh.ir/v1/fal?seed=my-intention"
```

### جستجوی هوشمند در اشعار

```bash
curl "https://pq.arsamadineh.ir/v1/search?q=عشق&limit=5"
```

همچنین جستجو با خط لاتین (فینگلیش) پشتیبانی می‌شود:

```bash
curl "https://pq.arsamadineh.ir/v1/search?q=eshgh&limit=5"
```

### دریافت اثر با اندپوینت‌های سازگار نسخه پیشین

```bash
curl https://pq.arsamadineh.ir/api/quotes?random=true&limit=1
```

```bash
curl https://pq.arsamadineh.ir/api/quotes/hafez?random=true&limit=1
```

## فهرست اندپوینت‌ها

### اندپوینت‌های نسخه ۱ (`/v1`)

| روش | مسیر | توضیح |
|---|---|---|
| `GET` | `/v1/works` | فهرست اشعار با فیلتر شاعر، قالب، موضوع، و وزن عروضی |
| `GET` | `/v1/works/{id}` | دریافت کامل یک اثر بر اساس شناسه پایدار |
| `GET` | `/v1/works/random` | دریافت اثر تصادفی با فیلترهای انتخابی |
| `GET` | `/v1/daily` | شعر روز مشخص و هماهنگ بر اساس تقویم تهران |
| `GET` | `/v1/fal` | تفأل به دیوان حافظ همراه با شناسه اختصاصی اشتراک‌گذاری |
| `GET` | `/v1/poets` | فهرست جامع شاعران همراه با دوره‌های تاریخی و نام‌ها |
| `GET` | `/v1/poets/{id}` | اطلاعات تفصیلی و آثار یک شاعر |
| `GET` | `/v1/collections` | فهرست مجموعه‌ها و دیوان‌های موجود |
| `GET` | `/v1/search` | جستجوی دقیق با رتبه‌بندی BM25F و درک فینگلیش |
| `GET` | `/v1/rhymes` | یابنده کلمات هم‌قافیه در گنجینه اشعار |
| `GET` | `/v1/works/{id}/cite` | دریافت ارجاع استاندارد علمی (APA، BibTeX، CSL-JSON) |
| `GET` | `/v1/meta` | اطلاعات نگارش داده‌ها، تاریخ به‌روزرسانی و شناسه انتشار |
| `GET` | `/v1/health` | بررسی وضعیت سلامت سرور و پایگاه داده |
| `GET` | `/openapi.json` | مشخصات رسمی رابط برنامه‌نویسی OpenAPI 3.1 |

### اندپوینت‌های سازگار (`/api/**`)

کلیه مسیرهای پیشین بدون تغییر در ساختار خروجی و با پاسخ‌دهی کامل در دسترس هستند:

| روش | مسیر | توضیح |
|---|---|---|
| `GET` | `/api/quotes` | دریافت اشعار با فیلتر شاعر و موضوع |
| `GET` | `/api/quotes/hafez` | دیوان حافظ (۴۹۷ غزل) |
| `GET` | `/api/quotes/shereno` | بیش از ۴,۴۰۰ اثر شعر نو و معاصر |
| `GET` | `/api/quotes/non-poetry` | گزیده سخنان و جملات بزرگان |
| `GET` | `/api/quotes/search` | جستجوی متنی در داده‌ها |
| `GET` | `/api/poets` | فهرست شاعران |
| `GET` | `/api/categories` | دسته‌بندی‌های موضوعی |
| `GET` | `/api/stats` | آمار کلی پایگاه داده |
| `GET` | `/api/embed` | خروجی ویجت HTML سازگار |
| `GET` | `/api/engine/stats` | آمار لحظه‌ای موتور تیغ |
| `GET` | `/api/engine/benchmark` | اجرای زنده بنچمارک عملکردی |

## کامپوننت وب `<persian-quote>`

برای نمایش اشعار در صفحات وب بدون بارگذاری فریم‌های سنگین، کامپوننت وب استاندارد در بسته `@persian-quote/widget` ارائه شده است:

```html
<script type="module" src="https://pq.arsamadineh.ir/widget/persian-quote.js"></script>

<persian-quote
  poet="hafez"
  theme="elegant"
  size="medium"
  show-source="true">
</persian-quote>
```

همچنین استفاده از آی‌فریم با آدرس زیر پشتیبانی می‌شود:

```html
<iframe
  src="https://pq.arsamadineh.ir/api/embed?theme=elegant&size=medium"
  width="100%"
  height="380"
  frameborder="0"
  scrolling="no">
</iframe>
```

## معماری بسته‌ها (Monorepo)

مخزن به صورت چندبسته‌ای (Bun Workspaces) بازطراحی شده و هر بخش دارای مرزهای مشخص است:

```
packages/
  core/         موتور پردازشی Tigh v1 (مسیریاب Radix، کش S3-FIFO، محدودکننده GCRA)
  schema/       طرحواره‌های اعتبارسنجی Zod و تولیدکننده خودکار OpenAPI 3.1
  persian/      ابزارهای پردازش زبان فارسی (نرمال‌سازی دوگانه، تقویم جلالی، بیدایرکشنال)
  poem/         موتور تحلیل ساختار شعر (استخراج ترقیمه، تقطیع مصراع، وزن و قافیه)
  search/       موتور جستجوی ترکیبی BM25F و معادل‌سازی فینگلیش
  widget/       کامپوننت وب استاندارد <persian-quote>
  mcp/          سرور پروتکل Model Context Protocol برای دستیاران هوش مصنوعی
  sdk-ts/       کتابخانه کار با API برای زبان تایپ‌اسکریپت و جاوااسکریپت

apps/
  web/          برنامه اصلی Next.js (صفحه اصلی، مستندات، جستجو، و میزکار)

data/
  canonical/    داده‌های ساختاریافته نهایی در قالب JSONL
  legacy/       نسخه پایدار و اولیه داده‌ها همراه با چک‌سام‌های رمزنگاری SHA-256
```

## راه‌اندازی محلی و توسعه

پیش‌نیاز: ابزار [Bun](https://bun.sh) نسخه ۱.۲ به بالا.

```bash
git clone https://github.com/arsamadineh/Persian-Quote-API.git
cd Persian-Quote-API
bun install
bun run dev
```

سامانه روی نشانی `http://localhost:3000` در دسترس خواهد بود.

### اجرای آزمون‌ها

```bash
bun test
```

کلیه ۲۱۶ آزمون در لایه‌های مدل داده، پردازش متن، موتور تیغ و قراردادهای ای‌پی‌آی اجرا می‌شوند.

## استقرار با Docker

برای استقرار ایزوله در محیط سرور اختصاصی یا سازمان‌ها:

```bash
docker build -t persian-quote-api .
docker run -p 3000:3000 persian-quote-api
```

همچنین تنظیمات چندسرویسی از طریق `docker-compose.yml` در ریشه مخزن مهیا است.

## مشارکت در پروژه

از مشارکت علاقه‌مندان به زبان و ادب فارسی و توسعه‌دهندگان نرم‌افزار استقبال می‌شود.

- **ثبت شعر یا تصحیح متن**: از طریق فرم برخط در نشانی `/contribute` یا ثبت Pull Request در پوشه `data/`.
- **قوانین مشارکت**: پیش از ارسال تغییرات، لطفاً فایل [AGENTS.md](AGENTS.md) را مطالعه نمایید. تمامی تغییرات کدی باید در فایل `lib/changelog.ts` ثبت شوند.

## حقوق مالکیت و اخلاق داده

کدهای این پروژه تحت مجوز آزاد [MIT](LICENSE) منتشر شده‌اند. متون اشعار کهن در مالکیت عمومی قرار دارند. جهت رعایت حقوق مؤلفان معاصر، ساختار داده‌ها شامل فیلدهای شفاف ردیابی منبع و سیاست نمایش است. در صورت نیاز به بررسی حقوقی یا درخواست حذف، بخش `/takedown` در دسترس است.

## توسعه‌دهنده

این پروژه به همت **آرسام آدینه** طراحی، توسعه و میزبانی می‌شود.

- وب‌سایت: [arsamadineh.ir](https://arsamadineh.ir)
- گیت‌هاب: [github.com/arsamadineh](https://github.com/arsamadineh)
- ارتباط و نظرات: [contact@arsamadineh.ir](mailto:contact@arsamadineh.ir)

اگر این پروژه برای شما یا مجموعه‌تان مفید بوده است، می‌توانید از تداوم سرورها و نگهداری آن حمایت کنید:

<p align="center">
  <a href="https://www.coffeebede.com/arsamadineh">
    <img src="https://coffeebede.ir/DashboardTemplateV2/app-assets/images/banner/default-yellow.svg" alt="حمایت مالی از پروژه" />
  </a>
</p>
