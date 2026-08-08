// منبع حقیقتی changelog پروژه.
// هر تغییر در پروژه باید در این فایل ثبت شود (بر اساس AGENTS.md).
// رابط کاربری و صفحه /changelog مستقیماً از این فایل می‌خوانند.

export type ChangeType = "added" | "changed" | "fixed" | "removed"

export type ChangelogEntry = {
  type: ChangeType
  description: string
}

export type ChangelogVersion = {
  version: string
  isoDate: string
  date: string
  changes: ChangelogEntry[]
}

export const CHANGE_TYPES: Record<ChangeType, { label: string; order: number }> = {
  added: { label: "اضافه شد", order: 0 },
  changed: { label: "تغییر کرد", order: 1 },
  fixed: { label: "رفع شد", order: 2 },
  removed: { label: "حذف شد", order: 3 },
}

export const CHANGELOG: ChangelogVersion[] = [
  {
    version: "۳.۴.۰",
    isoDate: "2026-08-08",
    date: "۱۷ مرداد ۱۴۰۵",
    changes: [
      {
        type: "changed",
        description: "تشخیص شاعر با نرمال‌سازی فارسی، نام‌های مستعار، املای لاتین و تطبیق تقریبی برای فیلتر دقیق‌تر بازنویسی شد.",
      },
      {
        type: "added",
        description: "آمار موتور، آپتایم، شناسه نمونه اجرا و دامنه جمع‌آوری در پاسخ متریک زنده اعلام می‌شود.",
      },
      {
        type: "fixed",
        description: "تعداد شاعران و دسته‌بندی‌ها در متریک موتور از داده واقعی خوانده می‌شود و مقدار ثابت ندارد.",
      },
      {
        type: "fixed",
        description: "درخواست‌های تصادفی دیگر از کش پاسخ نمی‌گیرند و بنچمارک آمار درخواست‌های واقعی را تغییر نمی‌دهد.",
      },
      {
        type: "changed",
        description: "اسناد رابط کاربری به جای عددهای ثابت، وضعیت داده و عملکرد زنده را نمایش می‌دهند.",
      },
    ],
  },
  {
    version: "۳.۳.۰",
    isoDate: "2026-07-19",
    date: "۲۸ تیر ۱۴۰۵",
    changes: [
      {
        type: "fixed",
        description:
          "رفع اشکال بحرانی در موتور تیغ: زنجیره میان‌افزارهای مسیر (شامل منطق اصلی هندلرها) هرگز اجرا نمی‌شد و همهٔ اندپوینت‌ها بدنهٔ خالی برمی‌گرداندند. حالا هندلر واقعی از route.middlewares اجرا می‌شود.",
      },
      {
        type: "changed",
        description:
          "تمام اندپوینت‌های API به صورت یکپارچه روی موتور تیغ ثبت شدند و فایل‌های route.ts فقط به اداپتور نکست‌جی (createNextHandler) واگذار می‌کنند. حذف کد تکراری و دستیابی به کش LRU و مدار شکن روی هر مسیر.",
      },
      {
        type: "added",
        description:
          "مخزن یکپارچه داده (lib/data/store.ts): بارگذاری یک‌باره تمام مجموعه‌داده‌ها، نرمال‌سازی، نمایه‌سازی و حذف خودکار ورودی‌های تکراری و بدون منتسب در نقل‌قول‌های غیرشعری.",
      },
      {
        type: "fixed",
        description:
          "رفع خطای «Unexpected end of JSON input» در صفحهٔ تعبیه (embed) با افزودن بررسی نوع محتوا و مدیریت ایمن پاسخ‌های نامعتبر در درخواست‌های /api/poets و /api/categories.",
      },
      {
        type: "fixed",
        description:
          "رفع اشکال فیلتر شاعر: اندپوینت /api/quotes پارامتر poet را نادیده می‌گرفت و شعر شاعران دیگر را برمی‌گرداند. حالا با انتخاب هر شاعر فقط اشعار خودش نمایش داده می‌شود.",
      },
      {
        type: "changed",
        description:
          "بهینه‌سازی اندپوینت شعر نو (/api/quotes/shereno): حذف کپی‌برداری کل مجموعه ۴۴۰۰ شعری در هر درخواست و جایگزینی با نمایهٔ سریع بر اساس شاعر — زمان پاسخ‌دهی از مرتبه میلی‌ثانیه به کسر میلی‌ثانیه رسید.",
      },
      {
        type: "added",
        description:
          "کامبوباکس جستجوشوندهٔ شاعران (PoetCombobox) در تب تعبیه: فیلتر زندهٔ لیست طولانی شاعران با نمایش تعداد اشعار، بدون وابستگی جدید.",
      },
    ],
  },
  {
    version: "۳.۲.۰",
    isoDate: "2026-07-04",
    date: "۱۳ تیر ۱۴۰۵",
    changes: [
      {
        type: "added",
        description: "نقشه سایت دینامیک در مسیر /sitemap.xml شامل تمام صفحات رابط کاربری و اندپوینت‌های API با alternates زبان.",
      },
      {
        type: "added",
        description: "فایل robots.txt با پشتیبانی صریح از ۳۰+ خزنده موتور جستجو و هوش مصنوعی شامل GPTBot، ClaudeBot، PerplexityBot، Google-Extended، DeepSeekBot، و Applebot-Extended.",
      },
      {
        type: "added",
        description: "فایل llms.txt و llms-full.txt در ریشه دامنه برای معرفی پروژه به مدل‌های زبانی مطابق استاندارد llmstxt.org.",
      },
      {
        type: "added",
        description: "ساختار داده JSON-LD در تمام صفحات شامل Organization، WebSite با SearchAction، SoftwareApplication، SoftwareSourceCode برای موتور تیغ، FAQPage در مستندات، و BreadcrumbList.",
      },
      {
        type: "added",
        description: "فراداده جامع برای هر صفحه شامل title اختصاصی، description، کلیدواژه، Open Graph با locale فارسی و انگلیسی، Twitter Card با creator handle، canonical، و robots.",
      },
      {
        type: "added",
        description: "تولیدکننده پویا favicon با ImageResponse برای app/icon.tsx و app/apple-icon.tsx با پشتیبانی از حالت روشن و تاریک.",
      },
      {
        type: "added",
        description: "فایل manifest.webmanifest برای PWA شامل shortcuts به مستندات، موتور تیغ، نمونه‌ها، و سازنده ویجت.",
      },
      {
        type: "added",
        description: "هدرهای امنیتی و سئو در next.config شامل X-Content-Type-Options، Strict-Transport-Security، Referrer-Policy، و X-Robots-Tag برای تصاویر.",
      },
      {
        type: "changed",
        description: "layout.tsx بازنویسی شد تا شامل متادیتای گسترده، Dublin Core برای AI Crawlers، اعتبارسنجی موتورهای جستجو، و viewport اختصاصی برای PWA باشد.",
      },
      {
        type: "added",
        description: "تگ‌های HTML اضافی در head شامل preconnect برای Google Fonts، dns-prefetch برای GitHub API، و alternate links برای llms.txt و نسخه انگلیسی.",
      },
    ],
  },
  {
    version: "۳.۱.۲",
    isoDate: "2026-07-04",
    date: "۱۳ تیر ۱۴۰۵",
    changes: [
      {
        type: "changed",
        description: "بازنویسی کامل فوتر برای نمایش بهینه در موبایل. چیدمان ستون‌ها در صفحه‌های باریک به‌صورت تک‌ستونی و پیوندهای داخلی با فاصله لمسی مناسب نمایش داده می‌شوند.",
      },
      {
        type: "changed",
        description: "متن کپی‌رایت فوتر به «۱۴۰۵ · تمامی حقوق محفوظ است» به‌جای نمونه میلادی پیشین تغییر کرد.",
      },
      {
        type: "added",
        description: "بنر SVG اصلی پروژه، تصویر Open Graph، و تصویر Twitter Card برای نمایش بهینه در شبکه‌های اجتماعی اضافه شد.",
      },
      {
        type: "changed",
        description: "README بازنویسی کامل شد: اضافه شدن بخش موتور Tigh، فهرست صفحات، پارامترهای API، و مستندات ساختار پروژه.",
      },
      {
        type: "added",
        description: "تگ‌های Open Graph و Twitter Card در layout.tsx برای نمایش تصویر هنگام اشتراک‌گذاری لینک در شبکه‌های اجتماعی اضافه شد.",
      },
    ],
  },
  {
    version: "۳.۱.۱",
    isoDate: "2026-07-04",
    date: "۱۳ تیر ۱۴۰۵",
    changes: [
      {
        type: "fixed",
        description: "نمایش مصرع‌های شعر در ویجت تعبیه و کامپوننت QuoteCard با جدا کردن خطوط به جای استفاده از /. نتیجه مصرع اول و دوم هر کدام در خط جداگانه نمایش داده می‌شود.",
      },
      {
        type: "changed",
        description: "بهینه‌سازی کش موتور با اضافه کردن نقشه ایندکس برای دسترسی سریع‌تر به تاریخچه دسترسی.",
      },
      {
        type: "changed",
        description: "ادغام شاخه‌های تکراری در الگوریتم Fixed Window محدودسازی نرخ.",
      },
      {
        type: "changed",
        description: "جایگزینی آرایه لیستی متریک با حافظه حلقه‌ای (Float64Array) برای کاهش فشار حافظه و حذف عملیات shift.",
      },
    ],
  },
  {
    version: "۳.۱.۰",
    isoDate: "2026-07-04",
    date: "۱۳ تیر ۱۴۰۵",
    changes: [
      {
        type: "added",
        description: "فرمان‌پالت سراسری (⌘K / Ctrl K) با جستجو در تمام اندپوینت‌ها، راهنما، مفاهیم موتور، قطعه‌کدها، و پرامپت‌های آماده.",
      },
      {
        type: "added",
        description: "دکمه جستجو در نوار ناوبری و ورودی بزرگ در سربرگ صفحه مستندات برای دسترسی سریع به فرمان‌پالت.",
      },
      {
        type: "added",
        description: "کامپوننت CodeBlock با دکمه کپی، برچسب زبان، تشخیص خودکار Mac/Windows، و نمایش پیام موفقیت کپی.",
      },
      {
        type: "added",
        description: "بخش پرامپت‌های آماده برای دستیارهای کدنویسی شامل هشت پرامپت در شش دسته (راه‌اندازی، توسعه، بهینه‌سازی، اشکال‌زدایی، استقرار، شناخت).",
      },
      {
        type: "added",
        description: "صفحه مستندات بازنویسی شد با بخش‌های کامل: مرجع اندپوینت‌ها، معماری داخلی موتور، راهنمای گام‌به‌گام فورک و توسعه، راهنمای استقرار، و عیب‌یابی.",
      },
      {
        type: "added",
        description: "متریک زنده موتور (P50/P99، hit rate، مدار شکن، uptime) در سربرگ صفحه مستندات برای مشاهده آنی عملکرد.",
      },
      {
        type: "changed",
        description: "نوار ناوبری شامل دکمه جستجوی سراسری با راهنمای میان‌بر Ctrl K شد.",
      },
    ],
  },
  {
    version: "۳.۰.۰-beta.۱",
    isoDate: "2026-07-04",
    date: "۱۳ تیر ۱۴۰۵",
    changes: [
      {
        type: "added",
        description: "موتور تیغ (Tigh) — موتور API با عملکرد بالا با معماری Trie برای مسیریابی، کش LRU با TTL، محدودسازی نرخ با الگوریتم Token Bucket، و مدار شکن خودترمیم‌شونده.",
      },
      {
        type: "added",
        description: "سیستم متریک — جمع‌آوری خودکار پرسرCENTIL، شمارنده درخواست‌ها، نسبت hit/miss کش، و snapshot لحظه‌ای از عملکرد موتور.",
      },
      {
        type: "added",
        description: "پایپلاین مiddleware — اجرای زنجیره‌ای middleware شامل CORS، اندازه‌گیری زمان پاسخ، و فشرده‌سازی پاسخ.",
      },
      {
        type: "added",
        description: "اداپتور Next.js — یکپارچه‌سازی کامل با App Router از طریق createNextHandler().",
      },
      {
        type: "added",
        description: "اندپوینت /api/engine/stats — نمایش متریک‌های زنده موتور شامل آپتایم، تعداد درخواست‌ها، latency، وضعیت کش و مدار شکن.",
      },
      {
        type: "added",
        description: "اندپوینت /api/engine/benchmark — بنچمارک عملکردی روتر، کش و متریک با قابلیت تنظیم تعداد تکرار.",
      },
      {
        type: "added",
        description: "سه نمودار SVG از معماری، چرخه حیات درخواست و ساختار پکیج موتور در مسیر public/.",
      },
      {
        type: "added",
        description: "صفحه ساختار در مسیر /sakhtar — نمایش کامل معماری موتور، ماژول‌ها، چرخه حیات درخواست، متریک زنده، بنچمارک عملکردی، و مقایسه با جایگزین‌ها.",
      },
      {
        type: "added",
        description: "انیمیشن‌های CSS برای نمایش اسکرول، نوارهای عملکرد، و شمارنده‌های متحرک در صفحه ساختار.",
      },
      {
        type: "added",
        description: "لینک ساختار در نوار ناوبری برای دسترسی سریع به نقشه راه موتور.",
      },
    ],
  },
  {
    version: "۲.۱۴.۰",
    isoDate: "2026-07-04",
    date: "۱۳ تیر ۱۴۰۵",
    changes: [
      {
        type: "added",
        description: "انتشار عمومی پروژه. پایگاه داده و اندپوینت‌های موجود برای استفاده عمومی در دسترس قرار گرفت.",
      },
      {
        type: "added",
        description: "صفحه تغییرات در مسیر /changelog با گروه‌بندی بر اساس نوع رویداد (اضافه، تغییر، رفع، حذف).",
      },
      {
        type: "added",
        description: "مودال اطلاع‌رسانی برای نمایش خلاصه نسخه جدید در اولین بازدید پس از انتشار.",
      },
      {
        type: "added",
        description: "صفحه سیاست حریم خصوصی با توضیح شفاف درباره عدم جمع‌آوری داده‌های شخصی.",
      },
      {
        type: "added",
        description: "صفحه شرایط استفاده شامل مجوز MIT و توضیح مالکیت عمومی اشعار.",
      },
      {
        type: "added",
        description: "فایل AGENTS.md به‌عنوان سند مرجع برای قواعد مشارکت و قالب ثبت تغییرات.",
      },
      {
        type: "added",
        description: "فاوآیکن اختصاصی پروژه با طراحی شفاف و سازگار با حالت روشن و تاریک.",
      },
      {
        type: "changed",
        description: "نوار ناوبری با عنوان متنی نمایش داده می‌شود؛ لوگو از رابط کاربری حذف و فقط در فاوآیکن باقی ماند.",
      },
      {
        type: "changed",
        description: "فوتر به یک کامپوننت مشترک منتقل شد و در تمام صفحات به‌طور خودکار نمایش داده می‌شود.",
      },
      {
        type: "removed",
        description: "بخش خبرنامه توسعه‌دهندگان از فوتر سایت حذف شد.",
      },
      {
        type: "fixed",
        description: "خطای hydration در صفحه اصلی به دلیل اختلاف مقدار origin میان سرور و مرورگر برطرف شد.",
      },
    ],
  },
  {
    version: "۲.۱۳.۰",
    isoDate: "2026-06-20",
    date: "۳۰ خرداد ۱۴۰۵",
    changes: [
      {
        type: "added",
        description: "صفحه اختصاصی برای ساخت ویجت قابل تعبیه با تنظیمات قالب، اندازه، و فیلتر شاعر و موضوع.",
      },
      {
        type: "added",
        description: "پنج قالب ظاهری برای ویجت: پیش‌فرض، شیک، مینیمال، کلاسیک، مدرن.",
      },
      {
        type: "added",
        description: "تولید خودکار کد iframe برای تعبیه ویجت در صفحات شخص ثالث.",
      },
      {
        type: "changed",
        description: "ساختار پاسخ اندپوینت embed برای پشتیبانی از پارامترهای جدید بازنویسی شد.",
      },
      {
        type: "fixed",
        description: "مشکل رندر فونت در زبان فارسی در مرورگرهای قدیمی برطرف شد.",
      },
    ],
  },
  {
    version: "۲.۱۲.۰",
    isoDate: "2026-05-15",
    date: "۲۵ اردیبهشت ۱۴۰۵",
    changes: [
      {
        type: "added",
        description: "صفحه نمونه‌های کاربردی با قابلیت اجرای زنده اندپوینت‌ها و نمایش خروجی JSON.",
      },
      {
        type: "added",
        description: "نمونه کد در چهار زبان: جاوااسکریپت، پایتون، PHP و cURL.",
      },
      {
        type: "added",
        description: "ویجت‌های نمونه با سه قالب مختلف برای نمایش زنده در صفحه.",
      },
      {
        type: "changed",
        description: "ساختار صفحه مستندات برای پشتیبانی از محتوای بلندتر و جداول پارامترها بازنویسی شد.",
      },
    ],
  },
  {
    version: "۲.۱۱.۰",
    isoDate: "2026-04-10",
    date: "۲۱ فروردین ۱۴۰۵",
    changes: [
      {
        type: "added",
        description: "صفحه مستندات با فهرست مطالب ثابت در نوار کناری.",
      },
      {
        type: "added",
        description: "توضیحات کامل برای هر اندپوینت شامل پارامترها، نوع داده، و مقدار پیش‌فرض.",
      },
      {
        type: "added",
        description: "بخش مدیریت خطا با جدول کدهای HTTP و نمونه پاسخ خطا.",
      },
      {
        type: "added",
        description: "بخش محدودیت‌ها و نکات مهم درباره استفاده منصفانه.",
      },
      {
        type: "changed",
        description: "ساختار کلی صفحه اصلی برای نمایش واضح‌تر بخش‌ها ویرایش شد.",
      },
    ],
  },
  {
    version: "۲.۱۰.۰",
    isoDate: "2026-03-12",
    date: "۲۲ اسفند ۱۴۰۴",
    changes: [
      {
        type: "added",
        description: "فرم مشارکت در مسیر /contribute برای افزودن شعر از طریق رابط کاربری.",
      },
      {
        type: "added",
        description: "تولید خودکار دستور SQL و هدایت کاربر به صفحه ایجاد فایل در گیت‌هاب.",
      },
      {
        type: "added",
        description: "اعتبارسنجی فرم با کتابخانه zod و نمایش خطاهای فیلد به زبان فارسی.",
      },
      {
        type: "changed",
        description: "ساختار داده‌های ورودی فرم برای سازگاری با اسکیمای پایگاه داده اصلاح شد.",
      },
    ],
  },
  {
    version: "۲.۹.۰",
    isoDate: "2026-02-15",
    date: "۲۷ بهمن ۱۴۰۴",
    changes: [
      {
        type: "changed",
        description: "انتقال کامل منابع داده از پایگاه داده خارجی به فایل‌های JSON محلی برای کاهش وابستگی.",
      },
      {
        type: "changed",
        description: "تمام اندپوینت‌ها برای خواندن مستقیم از JSON بهینه شدند.",
      },
      {
        type: "removed",
        description: "وابستگی به سرویس پایگاه داده خارجی از کد حذف شد.",
      },
      {
        type: "fixed",
        description: "مشکل تأخیر در پاسخ‌گویی به دلیل اتصال شبکه به پایگاه داده برطرف شد.",
      },
    ],
  },
  {
    version: "۲.۸.۰",
    isoDate: "2026-01-20",
    date: "۱ بهمن ۱۴۰۴",
    changes: [
      {
        type: "added",
        description: "اندپوینت اختصاصی برای دیوان حافظ در مسیر /api/quotes/hafez.",
      },
      {
        type: "added",
        description: "شامل ۴۹۷ غزل کامل با ساختار بیتی (مصرع اول و دوم).",
      },
      {
        type: "added",
        description: "قابلیت جستجو در متن مصرع‌ها با پارامتر q.",
      },
      {
        type: "added",
        description: "امکان دریافت غزل با شماره مشخص از طریق پارامتر id.",
      },
      {
        type: "added",
        description: "نمایش فال حافظ به‌صورت تصادفی با random=true.",
      },
    ],
  },
  {
    version: "۲.۷.۰",
    isoDate: "2025-12-15",
    date: "۲۴ آذر ۱۴۰۴",
    changes: [
      {
        type: "added",
        description: "اندپوینت جستجوی پیشرفته در مسیر /api/quotes/search با پشتیبانی از فیلتر زبان.",
      },
      {
        type: "added",
        description: "پارامتر lang برای جستجو در متن فارسی، انگلیسی، یا هر دو.",
      },
      {
        type: "changed",
        description: "الگوریتم جستجو برای پشتیبانی از عبارت‌های چندکلمه‌ای بهینه شد.",
      },
      {
        type: "fixed",
        description: "مشکل املای متون قدیمی حافظ در جستجو برطرف شد.",
      },
    ],
  },
  {
    version: "۲.۶.۰",
    isoDate: "2025-11-10",
    date: "۱۹ آبان ۱۴۰۴",
    changes: [
      {
        type: "added",
        description: "بخش سخنان بزرگان با بیش از ۴۹۰ نقل‌قول غیرشعری.",
      },
      {
        type: "added",
        description: "اندپوینت /api/quotes/non-poetry با فیلتر بر اساس نام گوینده.",
      },
      {
        type: "added",
        description: "نقل‌قول‌های منتخب از اندیشمندان، دانشمندان، و نویسندگان بزرگ تاریخ.",
      },
      {
        type: "changed",
        description: "ساختار پاسخ برای تمایز بین اشعار و سخنان غیرشعری بهبود یافت.",
      },
    ],
  },
  {
    version: "۲.۵.۰",
    isoDate: "2025-10-15",
    date: "۲۳ مهر ۱۴۰۴",
    changes: [
      {
        type: "added",
        description: "بخش شعر نو با بیش از چهار هزار اثر از شاعران معاصر.",
      },
      {
        type: "added",
        description: "اندپوینت /api/quotes/shereno با فیلتر بر اساس شاعر و عنوان.",
      },
      {
        type: "added",
        description: "شامل آثار کامل نیما یوشیج و سهراب سپهری به همراه شاعران دیگر.",
      },
      {
        type: "added",
        description: "نمایش اطلاعات کتاب و مجموعه برای هر شعر نو.",
      },
    ],
  },
  {
    version: "۲.۴.۰",
    isoDate: "2025-09-10",
    date: "۱۹ شهریور ۱۴۰۴",
    changes: [
      {
        type: "added",
        description: "سیستم طبقه‌بندی موضوعی اشعار بر اساس محتوا.",
      },
      {
        type: "added",
        description: "دسته‌بندی‌های اصلی: عشق، عرفان، حکمت، طبیعت، اخلاق، زندگی.",
      },
      {
        type: "added",
        description: "تگ‌های ثانویه برای جستجوی دقیق‌تر در موضوعات فرعی.",
      },
      {
        type: "changed",
        description: "ساختار داده شعر برای پشتیبانی از چند دسته‌بندی بازنویسی شد.",
      },
    ],
  },
  {
    version: "۲.۳.۰",
    isoDate: "2025-08-15",
    date: "۲۴ مرداد ۱۴۰۴",
    changes: [
      {
        type: "added",
        description: "بازنویسی کامل رابط کاربری با سیستم طراحی راست‌چین و فونت فارسی.",
      },
      {
        type: "added",
        description: "سیستم تم روشن و تاریک با تشخیص خودکار تنظیمات سیستم.",
      },
      {
        type: "added",
        description: "نوار ناوبری شیشه‌ای با افکت بلور در هنگام اسکرول.",
      },
      {
        type: "added",
        description: "صفحه اصلی با معرفی کامل قابلیت‌ها و نمونه استفاده.",
      },
      {
        type: "changed",
        description: "ساختار پوشه‌بندی پروژه برای مقیاس‌پذیری بهتر مرتب شد.",
      },
    ],
  },
  {
    version: "۲.۲.۰",
    isoDate: "2025-07-12",
    date: "۲۱ تیر ۱۴۰۴",
    changes: [
      {
        type: "added",
        description: "مهاجرت کامل کدبیس به TypeScript با تنظیمات سخت‌گیرانه نوع‌دهی.",
      },
      {
        type: "added",
        description: "تعریف اینترفیس برای تمام مدل‌های داده‌ای شاعر، شعر، و دسته‌بندی.",
      },
      {
        type: "changed",
        description: "تمام توابع بدون نوع‌دهی صریح حذف و با امضای دقیق جایگزین شدند.",
      },
      {
        type: "fixed",
        description: "چندین خطای زمان اجرا که در نسخه جاوااسکریپتی قابل تشخیص نبودند، در زمان کامپایل شناسایی شدند.",
      },
    ],
  },
  {
    version: "۲.۱.۰",
    isoDate: "2025-06-15",
    date: "۲۵ خرداد ۱۴۰۴",
    changes: [
      {
        type: "added",
        description: "پیاده‌سازی Server Components در تمام صفحات برای کاهش حجم جاوااسکریپت ارسالی.",
      },
      {
        type: "added",
        description: "استفاده از App Router با ساختار پوشه‌بندی مبتنی بر مسیر.",
      },
      {
        type: "changed",
        description: "ساختار رندر صفحات از حالت کلاینت به سمت سرور منتقل شد.",
      },
      {
        type: "removed",
        description: "صفحات مبتنی بر Pages Directory که در نسخه‌های قبلی استفاده می‌شد، حذف شدند.",
      },
    ],
  },
  {
    version: "۲.۰.۰",
    isoDate: "2025-05-10",
    date: "۲۰ اردیبهشت ۱۴۰۴",
    changes: [
      {
        type: "changed",
        description: "بازنویسی کامل پروژه با چارچوب Next.js ۱۵. تمام کدبیس قبلی حذف و از ابتدا نوشته شد.",
      },
      {
        type: "changed",
        description: "ساختار پاسخ‌های API به فرمت یکپارچه شامل فیلدهای success، data، count و meta تبدیل شد.",
      },
      {
        type: "changed",
        description: "نام‌گذاری مسیرها برای سازگاری با الگوی RESTful بازنگری شد.",
      },
      {
        type: "removed",
        description: "سرور Express و تمام وابستگی‌های مرتبط حذف شدند.",
      },
      {
        type: "removed",
        description: "پایگاه داده SQLite که در نسخه ۱.x استفاده می‌شد، کنار گذاشته شد.",
      },
    ],
  },
  {
    version: "۱.۴.۰",
    isoDate: "2025-04-08",
    date: "۱۹ فروردین ۱۴۰۴",
    changes: [
      {
        type: "added",
        description: "مهاجرت از پایتون به Node.js برای یکپارچگی با زیرساخت وب.",
      },
      {
        type: "added",
        description: "سرور Express با میان‌افزار مدیریت خطا و لاگ‌گیری.",
      },
      {
        type: "added",
        description: "پشتیبانی از فشرده‌سازی gzip برای کاهش حجم پاسخ‌ها.",
      },
      {
        type: "changed",
        description: "ساختار پایگاه داده از SQLite به فرمت JSON برای سهولت توزیع تغییر یافت.",
      },
    ],
  },
  {
    version: "۱.۳.۰",
    isoDate: "2025-02-25",
    date: "۶ اسفند ۱۴۰۳",
    changes: [
      {
        type: "added",
        description: "مستندات اندپوینت‌ها با استفاده از حاشیه‌نویسی در کد تولید شد.",
      },
      {
        type: "added",
        description: "نمونه درخواست و پاسخ برای هر اندپوینت به مستندات افزوده شد.",
      },
      {
        type: "changed",
        description: "مستندات به‌صورت خودکار از توضیح‌های درون‌خطی کد تولید می‌شوند.",
      },
    ],
  },
  {
    version: "۱.۲.۰",
    isoDate: "2025-01-15",
    date: "۲۵ دی ۱۴۰۳",
    changes: [
      {
        type: "added",
        description: "سیستم کش درون‌برنامه‌ای برای کاهش زمان پاسخ‌گویی به پرس‌وجوهای تکراری.",
      },
      {
        type: "added",
        description: "اندازه‌گیری زمان پاسخ‌گویی برای هر درخواست و ثبت در لاگ.",
      },
      {
        type: "changed",
        description: "الگوریتم بارگذاری اشعار برای استفاده از فهرست از پیش ساخته‌شده بهینه شد.",
      },
      {
        type: "fixed",
        description: "مشکل حافظه در زمان بارگذاری هم‌زمان بیش از هزار رکورد برطرف شد.",
      },
    ],
  },
  {
    version: "۱.۱.۰",
    isoDate: "2024-12-10",
    date: "۲۰ آذر ۱۴۰۳",
    changes: [
      {
        type: "added",
        description: "سیستم دسته‌بندی موضوعی برای اشعار با پنج دسته اصلی.",
      },
      {
        type: "added",
        description: "تگ‌های ثانویه برای جستجوی دقیق‌تر در هر دسته.",
      },
      {
        type: "changed",
        description: "ساختار رکورد شعر برای پشتیبانی از آرایه‌ای از دسته‌بندی‌ها بازنویسی شد.",
      },
    ],
  },
  {
    version: "۱.۰.۰",
    isoDate: "2024-11-20",
    date: "۳۰ آبان ۱۴۰۳",
    changes: [
      {
        type: "added",
        description: "اولین نسخه پایدار پروژه. پایگاه داده شامل بیش از هزار بیت از شاعران کلاسیک است.",
      },
      {
        type: "added",
        description: "API عمومی با هشت اندپوینت برای دریافت اشعار، شاعران، و دسته‌بندی‌ها.",
      },
      {
        type: "added",
        description: "مستندات اولیه برای استفاده از API.",
      },
      {
        type: "added",
        description: "مجموعه‌ای از ابزارهای داخلی برای افزودن و ویرایش اشعار از طریق خط فرمان.",
      },
    ],
  },
  {
    version: "۰.۹.۰",
    isoDate: "2024-10-25",
    date: "۴ آبان ۱۴۰۳",
    changes: [
      {
        type: "added",
        description: "مجموعه آزمایش‌های خودکار برای اندپوینت‌های اصلی.",
      },
      {
        type: "added",
        description: "اعتبارسنجی ورودی‌ها با کتابخانه تخصصی برای جلوگیری از درخواست‌های نامعتبر.",
      },
      {
        type: "fixed",
        description: "چندین مورد خطای ۵۰۰ که در شرایط خاص رخ می‌داد، شناسایی و برطرف شد.",
      },
    ],
  },
  {
    version: "۰.۸.۰",
    isoDate: "2024-09-15",
    date: "۲۵ شهریور ۱۴۰۳",
    changes: [
      {
        type: "added",
        description: "قابلیت جستجوی ترکیبی در نام شاعر، متن شعر، و منبع.",
      },
      {
        type: "added",
        description: "صفحه‌بندی نتایج جستجو با پارامتر page و limit.",
      },
      {
        type: "changed",
        description: "پارامترهای جستجو برای سازگاری بیشتر استانداردسازی شدند.",
      },
    ],
  },
  {
    version: "۰.۷.۰",
    isoDate: "2024-08-20",
    date: "۳۰ مرداد ۱۴۰۳",
    changes: [
      {
        type: "added",
        description: "قابلیت خروجی JSON کامل از تمام اشعار برای پردازش خارجی.",
      },
      {
        type: "added",
        description: "ابزار خط فرمان برای تولید فایل خروجی JSON از پایگاه داده.",
      },
      {
        type: "changed",
        description: "ساختار فایل خروجی برای سازگاری با سایر ابزارهای پردازش متن بهبود یافت.",
      },
    ],
  },
  {
    version: "۰.۶.۰",
    isoDate: "2024-07-18",
    date: "۲۸ تیر ۱۴۰۳",
    changes: [
      {
        type: "added",
        description: "رابط برنامه‌نویسی RESTful با چهار اندپوینت اصلی.",
      },
      {
        type: "added",
        description: "پشتیبانی از CORS برای استفاده در صفحات وب.",
      },
      {
        type: "added",
        description: "پاسخ‌ها در قالب JSON با ساختار سازگار.",
      },
      {
        type: "changed",
        description: "لایه دسترسی به داده از منطق تجاری جدا شد.",
      },
    ],
  },
  {
    version: "۰.۵.۰",
    isoDate: "2024-06-15",
    date: "۲۶ خرداد ۱۴۰۳",
    changes: [
      {
        type: "added",
        description: "افزودن اشعار پنج شاعر کلاسیک: مولانا، حافظ، سعدی، فردوسی، و خیام.",
      },
      {
        type: "added",
        description: "ساختار منبع‌یابی برای هر شعر شامل نام کتاب و شماره غزل.",
      },
      {
        type: "fixed",
        description: "چند مورد غلط املایی در متون قدیمی اصلاح شد.",
      },
    ],
  },
  {
    version: "۰.۴.۰",
    isoDate: "2024-05-22",
    date: "۲ خرداد ۱۴۰۳",
    changes: [
      {
        type: "added",
        description: "موتور جستجوی ساده برای یافتن اشعار بر اساس کلمه کلیدی.",
      },
      {
        type: "added",
        description: "پشتیبانی از جستجوی ریشه‌ای برای کلمات فارسی.",
      },
      {
        type: "changed",
        description: "الگوریتم جستجو برای سرعت بیشتر در مجموعه داده‌های بزرگ بهینه شد.",
      },
    ],
  },
  {
    version: "۰.۳.۰",
    isoDate: "2024-04-28",
    date: "۹ اردیبهشت ۱۴۰۳",
    changes: [
      {
        type: "added",
        description: "پایگاه داده محلی SQLite برای ذخیره‌سازی اشعار و اطلاعات شاعران.",
      },
      {
        type: "added",
        description: "اسکریپت مهاجرت برای انتقال داده‌های پراکنده به ساختار منظم.",
      },
      {
        type: "added",
        description: "نمایه‌گذاری متن برای بهبود سرعت جستجو.",
      },
    ],
  },
  {
    version: "۰.۲.۰",
    isoDate: "2024-04-05",
    date: "۱۷ فروردین ۱۴۰۳",
    changes: [
      {
        type: "added",
        description: "رابط وب ساده با استفاده از چارچوب Flask برای دسترسی محلی.",
      },
      {
        type: "added",
        description: "صفحه اصلی با نمایش یک شعر تصادفی و اطلاعات شاعر.",
      },
      {
        type: "added",
        description: "صفحه فهرست شاعران با زندگی‌نامه مختصر.",
      },
      {
        type: "changed",
        description: "ساختار فایل‌های پروژه برای توسعه آسان‌تر مرتب شد.",
      },
    ],
  },
  {
    version: "۰.۱.۰",
    isoDate: "2024-03-22",
    date: "۳ فروردین ۱۴۰۳",
    changes: [
      {
        type: "added",
        description: "آغاز پروژه. اسکریپت خط فرمان برای سازماندهی یادداشت‌های شخصی اشعار فارسی.",
      },
      {
        type: "added",
        description: "ذخیره‌سازی اشعار منتخب در فایل‌های متنی ساده برای استفاده شخصی.",
      },
      {
        type: "added",
        description: "ساختار اولیه داده شامل متن شعر، نام شاعر، و منبع.",
      },
    ],
  },
]

export const LATEST_VERSION = CHANGELOG[0]
