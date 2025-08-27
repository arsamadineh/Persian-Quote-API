# API نقل‌قول‌های فارسی

[![ساخته شده با Next.js](https://img.shields.io/badge/ساخته%20شده%20با-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

## درباره پروژه

API نقل‌قول‌های فارسی یک پلتفرم جامع برای دسترسی به نقل‌قول‌های زیبا از شاعران بزرگ فارسی است. این پروژه شامل یک API کامل و وب‌سایت نمایشی با طراحی راست‌به‌چپ و تایپوگرافی فارسی می‌باشد.

## ✨ ویژگی‌ها

### 🎯 API کامل
- **دریافت نقل‌قول تصادفی**: `/api/quotes`
- **جستجو بر اساس شاعر**: `/api/quotes/[poet]`
- **دسته‌بندی موضوعی**: `/api/quotes/category/[category]`
- **جستجوی متنی**: `/api/quotes/search`
- **فهرست شاعران**: `/api/poets`
- **فهرست دسته‌بندی‌ها**: `/api/categories`
- **آمار استفاده**: `/api/stats`

### 🎨 وب‌سایت نمایشی
- طراحی راست‌به‌چپ (RTL) مخصوص فارسی
- فونت زیبای وزیرمتن
- رنگ‌بندی الهام‌گرفته از فرهنگ ایرانی
- کارت‌های نقل‌قول قابل تنظیم
- صفحه مستندات کامل
- نمونه‌های زنده و تعاملی

### 🔧 امکانات فنی
- **Next.js 15** با App Router
- **TypeScript** برای type safety
- **Supabase** برای پایگاه داده
- **Tailwind CSS** برای استایل‌دهی
- **shadcn/ui** برای کامپوننت‌ها
- **Responsive Design** برای همه دستگاه‌ها

## 🚀 نصب و راه‌اندازی

### پیش‌نیازها
- Node.js 18+ 
- npm یا yarn
- حساب Supabase (اختیاری)

### مراحل نصب

1. **کلون کردن پروژه**
\`\`\`bash
git clone https://github.com/arsamadineh/Persian-Quote-API.git
cd Persian-Quote-API
\`\`\`

2. **نصب وابستگی‌ها**
\`\`\`bash
npm install
# یا
yarn install
\`\`\`

3. **تنظیم متغیرهای محیطی**
\`\`\`bash
cp .env.example .env.local
\`\`\`

متغیرهای مورد نیاز:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

4. **راه‌اندازی پایگاه داده (اختیاری)**
\`\`\`bash
# اجرای اسکریپت‌های SQL در پوشه scripts/
# 001_create_quotes_schema.sql
# 002_seed_poets_data.sql  
# 003_seed_categories_data.sql
# 004_seed_sample_quotes.sql
\`\`\`

5. **اجرای پروژه**
\`\`\`bash
npm run dev
# یا
yarn dev
\`\`\`

پروژه روی `http://localhost:3000` در دسترس خواهد بود.

## 📖 نحوه استفاده از API

### دریافت نقل‌قول تصادفی
\`\`\`javascript
fetch('/api/quotes')
  .then(response => response.json())
  .then(data => console.log(data));
\`\`\`

### جستجو بر اساس شاعر
\`\`\`javascript
fetch('/api/quotes/rumi')
  .then(response => response.json())
  .then(data => console.log(data));
\`\`\`

### جستجوی متنی
\`\`\`javascript
fetch('/api/quotes/search?q=عشق')
  .then(response => response.json())
  .then(data => console.log(data));
\`\`\`

## 🎨 کارت‌های قابل جاسازی

پروژه شامل کارت‌های نقل‌قول قابل تنظیم است که می‌توانید در وب‌سایت خود جاسازی کنید:

\`\`\`html
<iframe 
  src="/embed?theme=classic&poet=rumi&category=love" 
  width="400" 
  height="300">
</iframe>
\`\`\`

## 🛠️ توسعه

### ساختار پروژه
\`\`\`
├── app/                    # صفحات و API routes
│   ├── api/               # API endpoints
│   ├── docs/              # صفحه مستندات
│   ├── examples/          # نمونه‌های زنده
│   └── embed/             # کارت‌های قابل جاسازی
├── components/            # کامپوننت‌های React
├── lib/                   # توابع کمکی
├── scripts/               # اسکریپت‌های پایگاه داده
└── public/                # فایل‌های استاتیک
\`\`\`

### اضافه کردن شاعر جدید
1. اسکریپت SQL جدید در `scripts/` ایجاد کنید
2. داده‌های شاعر را به جدول `poets` اضافه کنید
3. نقل‌قول‌ها را به جدول `persian_quotes` اضافه کنید

### اضافه کردن تم جدید
1. استایل‌های جدید در `components/quote-cards/` تعریف کنید
2. تم را به لیست تم‌های موجود اضافه کنید
3. پیش‌نمایش در صفحه `/embed` اضافه کنید

## 🤝 مشارکت

مشارکت شما در بهبود این پروژه بسیار ارزشمند است:

1. پروژه را Fork کنید
2. شاخه جدید ایجاد کنید (`git checkout -b feature/amazing-feature`)
3. تغییرات را commit کنید (`git commit -m 'Add amazing feature'`)
4. به شاخه push کنید (`git push origin feature/amazing-feature`)
5. Pull Request ایجاد کنید

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است. برای جزئیات بیشتر فایل [LICENSE](LICENSE) را مطالعه کنید.

## 👨‍💻 سازنده

**[آرسام آدینه](https://arsamadineh.ir)**

- وب‌سایت: [arsamadineh.ir](https://arsamadineh.ir)
- GitHub: [@arsamadineh](https://github.com/arsamadineh)
- ایمیل: contact@arsamadineh.ir

---

<div align="center">
  <p>ساخته شده با ❤️ برای زبان زیبای فارسی</p>
  <p>© 2025 آرسام آدینه. تمامی حقوق محفوظ است.</p>
</div>
