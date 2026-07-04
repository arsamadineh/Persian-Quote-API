# گنجینه API اشعار فارسی 🌹

[![ساخته شده با Next.js](https://img.shields.io/badge/ساخته%20شده%20با-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![مجوز MIT](https://img.shields.io/badge/مجوز-MIT-green?style=for-the-badge)](LICENSE)
[![نسخه](https://img.shields.io/badge/نسخه-1.0.0-blue?style=for-the-badge)](https://github.com/arsamadineh/Persian-Quote-API)
[![مشارکت‌کنندگان](https://img.shields.io/github/contributors/arsamadineh/Persian-Quote-API?style=for-the-badge&color=orange)](https://github.com/arsamadineh/Persian-Quote-API/graphs/contributors)

<div dir="rtl">

## درباره پروژه

پروژه **API نقل‌قول‌های فارسی** یک پلتفرم جامع، متن‌باز و مدرن برای دسترسی به گنجینه‌ای از اشعار و نقل‌قول‌های زیبا از شاعران بزرگ و نامدار فارسی‌زبان است. این پروژه به منظور حفظ و ترویج ادبیات غنی فارسی در بستر وب طراحی شده است و ابزاری قدرتمند برای توسعه‌دهندگان، طراحان و علاقه‌مندان به ادبیات فراهم می‌آورد.

این پروژه شامل یک API کامل (RESTful)، ویجت‌های قابل جاسازی (Embeddable Widgets) و یک وب‌سایت نمایشی با طراحی اختصاصی راست‌به‌چپ (RTL) و تایپوگرافی زیبای فارسی با فونت **وزیرمتن** می‌باشد.

---

## ✨ ویژگی‌های کلیدی

### 🎯 API جامع و پرسرعت
دسترسی به هزاران بیت شعر از صدها شاعر نامدار از طریق اندپوینت‌های استاندارد:
- `GET /api/quotes` : دریافت نقل‌قول‌های تصادفی
- `GET /api/quotes/[poet]` : دریافت اشعار بر اساس نام شاعر
- `GET /api/quotes/category/[category]` : دریافت اشعار بر اساس موضوع (عشق، عرفان، حکمت و...)
- `GET /api/quotes/search?q={query}` : جستجوی پیشرفته در متن اشعار
- `GET /api/poets` : دریافت فهرست کامل شاعران به همراه زندگی‌نامه
- `GET /api/categories` : دریافت فهرست دسته‌بندی‌های موضوعی
- `GET /api/stats` : دریافت آمارهای پایگاه داده

### 🎨 ویجت‌ها و کارت‌های قابل جاسازی (Embed Widgets)
آیا می‌خواهید اشعار فارسی را به وب‌سایت خود اضافه کنید؟ با استفاده از کارت‌های نقل‌قول قابل تنظیم، می‌توانید به راحتی اشعار را جاسازی کنید:

```html
<!-- جاسازی ویجت شعر به راحتی در وب‌سایت شما -->
<iframe
  src="https://your-domain.com/embed?theme=classic&poet=rumi&category=love"
  width="100%"
  height="300"
  frameborder="0">
</iframe>
```

### 💻 تکنولوژی‌های استفاده شده
- **Next.js 15 (App Router)**: فریم‌ورک قدرتمند برای سمت سرور و کلاینت
- **TypeScript**: تضمین کیفیت کد و Type Safety
- **Tailwind CSS & Shadcn/ui**: طراحی رابط کاربری چشم‌نواز، مینیمال و واکنش‌گرا (Responsive)
- **Supabase**: پایگاه داده PostgreSQL قدرتمند برای ذخیره و بازیابی اشعار

---

## 🚀 نصب و راه‌اندازی برای توسعه‌دهندگان

### پیش‌نیازها
- Node.js 18 یا بالاتر
- `pnpm` (پیشنهادی)، `npm` یا `yarn`
- حساب کاربری Supabase (برای راه‌اندازی دیتابیس)

### مراحل نصب گام به گام

۱. **کلون کردن مخزن پروژه:**
```bash
git clone https://github.com/arsamadineh/Persian-Quote-API.git
cd Persian-Quote-API
```

۲. **نصب وابستگی‌ها (با pnpm):**
```bash
pnpm install
```

۳. **تنظیم متغیرهای محیطی:**
فایل `.env.example` را به `.env.local` تغییر نام دهید و مقادیر مربوط به دیتابیس خود را وارد کنید:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

۴. **آماده‌سازی پایگاه داده:**
اسکریپت‌های SQL موجود در پوشه `scripts/` را به ترتیب در پنل Supabase خود اجرا کنید تا جداول ساخته و داده‌های اولیه و شاعران وارد شوند:
- `001_create_quotes_schema.sql`
- `002_seed_poets_data.sql`
- `003_seed_categories_data.sql`
- `004_seed_sample_quotes.sql`
- `005_seed_more_poets.sql` (حاوی صدها شاعر و شعر جدید)

۵. **اجرای سرور توسعه:**
```bash
pnpm dev
```
پروژه روی آدرس `http://localhost:3000` در دسترس خواهد بود!

---

## 🤝 راهنمای مشارکت (How to Contribute)

ما از مشارکت‌های شما برای غنی‌تر کردن پایگاه داده اشعار و بهبود کدها به شدت استقبال می‌کنیم! شما می‌توانید به دو روش در این پروژه مشارکت کنید:

### روش اول: فرم تعاملی (سریع‌ترین و آسان‌ترین روش) 🚀
ما یک رابط کاربری ساده برای افزودن اشعار طراحی کرده‌ایم. برای این کار نیازی به برنامه‌نویسی ندارید:
1. در وب‌سایت پروژه، به صفحه **[مشارکت (Contribute)](/contribute)** بروید.
2. فرم را با دقت (نام شاعر، متن شعر فارسی و ترجمه انگلیسی، منبع و...) پر کنید.
3. روی دکمه «ثبت و ایجاد Pull Request» کلیک کنید.
4. شما مستقیماً به صفحه گیت‌هاب برای تایید و ارسال Pull Request هدایت می‌شوید!

### روش دوم: توسعه دستی و ارسال Pull Request (برای توسعه‌دهندگان) 💻
اگر می‌خواهید در کدها یا توسعه هسته سیستم مشارکت کنید:
1. ابتدا پروژه را در حساب گیت‌هاب خود Fork کنید.
2. یک شاخه (Branch) جدید برای تغییرات خود بسازید:
   ```bash
   git checkout -b feature/amazing-new-feature
   ```
3. کدهای خود را با رعایت اصول Clean Code بنویسید.
4. تغییرات خود را Commit کنید:
   ```bash
   git commit -m 'feat: Add an amazing new feature'
   ```
5. به شاخه خود در گیت‌هاب Push کنید:
   ```bash
   git push origin feature/amazing-new-feature
   ```
6. یک Pull Request در مخزن اصلی باز کنید تا تغییرات شما بررسی شود.

---

## 📄 مجوز (License)

این پروژه تحت مجوز متن‌باز **[MIT](LICENSE)** منتشر شده است. استفاده، تغییر و انتشار آن برای همه آزاد است.

## 👨‍💻 توسعه‌دهنده

**آرسام آدینه (Arsam Adineh)**
- 🌐 [وب‌سایت شخصی](https://arsamadineh.ir)
- 🐙 [GitHub](https://github.com/arsamadineh)
- 📧 ایمیل: contact@arsamadineh.ir

---
<div align="center">
  <p>ساخته شده با ❤️ و ☕ برای حفظ شکوه زبان زیبای پارسی.</p>
</div>

</div>
