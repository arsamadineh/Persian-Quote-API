import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  BookOpen,
  Award,
  Copyright,
  CheckCircle2,
  XCircle,
  Gauge,
  Heart,
  Server,
  RefreshCw,
  Shield,
  Scale,
  Github,
  AlertTriangle,
  Mail,
  Code,
} from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "شرایط استفاده - API اشعار فارسی",
  description: "شرایط و قوانین استفاده از API اشعار فارسی - Persian Quotes API Terms of Service",
}

export default function TermsPage() {
  const lastUpdated = "۱۳ تیر ۱۴۰۵"

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation - hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">فهرست مطالب</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <nav className="space-y-1 text-sm">
                    {[
                      { href: "#introduction", label: "مقدمه و پذیرش" },
                      { href: "#license", label: "مجوز استفاده" },
                      { href: "#ownership", label: "مالکیت محتوا" },
                      { href: "#permitted-use", label: "استفاده مجاز" },
                      { href: "#prohibited-use", label: "استفاده ممنوع" },
                      { href: "#rate-limits", label: "محدودیت نرخ" },
                      { href: "#attribution", label: "انتساب و اعتبار" },
                      { href: "#availability", label: "پایداری سرویس" },
                      { href: "#modifications", label: "اصلاحات سرویس" },
                      { href: "#disclaimer", label: "سلب مسئولیت" },
                      { href: "#liability", label: "محدودیت مسئولیت" },
                      { href: "#governing-law", label: "قانون حاکم" },
                      { href: "#contact", label: "تماس" },
                    ].map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="block text-muted-foreground hover:text-primary transition-colors py-1"
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <div className="border-b border-border pb-6">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-6 h-6 text-primary" />
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">شرایط استفاده</h1>
              </div>
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                با استفاده از API اشعار فارسی، شما شرایط زیر را می‌پذیرید. ما تلاش کرده‌ایم این
                شرایط ساده، منصفانه و منطبق با روح متن‌باز باشد.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  آخرین بروزرسانی: <span className="font-medium text-foreground">{lastUpdated}</span>
                </span>
                <Badge variant="secondary">مجوز MIT برای کد</Badge>
                <Badge variant="secondary">محتوای مالکیت عمومی</Badge>
              </div>
            </div>

            {/* Introduction */}
            <section id="introduction">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    مقدمه و پذیرش شرایط
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 leading-relaxed text-foreground/90">
                  <p>
                    به <strong>API اشعار فارسی</strong> (Persian Quotes API) خوش آمدید. این سرویس
                    یک API رایگان، عمومی و متن‌باز است که با هدف گسترش دسترسی به گنجینه ادب فارسی
                    ارائه می‌شود.
                  </p>
                  <p>
                    با استفاده از وب‌سایت
                    <code className="px-1.5 py-0.5 bg-muted rounded text-xs mx-1" dir="ltr">pq.arsamadineh.ir</code>
                    و کلیه نقاط پایانی (endpoints) آن، شما این شرایط را مطالعه، فهمیده و پذیرفته‌اید.
                    اگر با هر بخشی از شرایط موافق نیستید، لطفاً از سرویس استفاده نکنید.
                  </p>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>خلاصه اجمالی</AlertTitle>
                    <AlertDescription>
                      این شرایط با هدف حفظ حقوق متقابل توسعه‌دهندگان و کاربران نوشته شده‌اند. ما
                      باور داریم که یک API رایگان و متن‌باز باید حداقل اصول را رعایت کند، اما در
                      عین حال نباید مانع نوآوری شود.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </section>

            {/* License */}
            <section id="license">
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                مجوز استفاده از کد
              </h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <h3 className="text-xl font-bold">مجوز MIT</h3>
                  <p>
                    کد منبع API اشعار فارسی تحت <strong>مجوز MIT</strong> منتشر شده است. این
                    یکی از آزادترین مجوزهای متن‌باز است که به شما اجازه می‌دهد:
                  </p>

                  <ul className="space-y-2 pr-4">
                    {[
                      "استفاده تجاری بدون محدودیت",
                      "تغییر و شخصی‌سازی کد",
                      "انتشار مجدد (حتی با تغییرات)",
                      "استفاده در پروژه‌های اختصاصی (بدون متن‌باز کردن)",
                    ].map((perm, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                        <span>{perm}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="bg-muted/50 p-4 rounded-md border border-border text-xs" dir="ltr">
                    <p className="font-mono text-foreground/80 leading-relaxed">
                      MIT License - Copyright (c) 2024 Persian Quotes API contributors
                      <br />
                      <br />
                      Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
                      documentation files (the "Software"), to deal in the Software without restriction...
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    متن کامل مجوز MIT در فایل <code className="px-1 py-0.5 bg-muted rounded text-xs">LICENSE</code> ریپازیتوری موجود است.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Content Ownership */}
            <section id="ownership">
              <h2 className="text-2xl font-bold text-foreground mb-3">مالکیت محتوا (اشعار)</h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    اشعار موجود در این API متعلق به شاعران کلاسیک فارسی است که قرن‌ها پیش
                    می‌زیسته‌اند. این آثار در حوزه <strong>مالکیت عمومی</strong> (Public Domain)
                    قرار دارند و هیچ‌کس مالکیت معنوی بر آن‌ها ندارد.
                  </p>

                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border text-muted-foreground">
                          <th className="text-right p-3 font-semibold">شاعر</th>
                          <th className="text-right p-3 font-semibold">دوران</th>
                          <th className="text-right p-3 font-semibold">وضعیت حقوقی</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[
                          { poet: "حافظ شیرازی", era: "قرن ۸ هجری", status: "مالکیت عمومی" },
                          { poet: "مولانا جلال‌الدین رومی", era: "قرن ۷ هجری", status: "مالکیت عمومی" },
                          { poet: "سعدی شیرازی", era: "قرن ۶-۷ هجری", status: "مالکیت عمومی" },
                          { poet: "فردوسی", era: "قرن ۴-۵ هجری", status: "مالکیت عمومی" },
                          { poet: "نیما یوشیج", era: "قرن ۱۴", status: "نویسنده فوت‌شده، محافظت محدود" },
                          { poet: "سهراب سپهری", era: "قرن ۱۴", status: "نویسنده فوت‌شده، محافظت محدود" },
                        ].map((row, i) => (
                          <tr key={i}>
                            <td className="p-3 font-medium">{row.poet}</td>
                            <td className="p-3 text-muted-foreground">{row.era}</td>
                            <td className="p-3">
                              <Badge variant="secondary">{row.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Alert>
                    <Copyright className="h-4 w-4" />
                    <AlertTitle>توضیح مهم</AlertTitle>
                    <AlertDescription>
                      ترجمه‌های انگلیسی و فراداده‌های ساختاریافته (metadata) ممکن است تحت مجوزهای
                      متفاوتی قرار داشته باشند. در مورد ترجمه‌ها به منبع اصلی مراجعه کنید. ما
                      <strong> ادعایی بر مالکیت اشعار کلاسیک نداریم</strong> و صرفاً نقش
                      تجمیع‌کننده و ارائه‌دهنده را ایفا می‌کنیم.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </section>

            {/* Permitted Use */}
            <section id="permitted-use">
              <h2 className="text-2xl font-bold text-foreground mb-3">استفاده مجاز</h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>شما آزاد هستید که از API در موارد زیر (و فراتر از آن) استفاده کنید:</p>

                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      "اپلیکیشن‌های وب و موبایل",
                      "وبلاگ‌ها و سایت‌های شخصی",
                      "پروژه‌های تجاری و استارتاپ‌ها",
                      "ابزارهای آموزشی و پژوهشی",
                      "ربات‌های تلگرام/دیسکورد",
                      "اپلیکیشن‌های هوش مصنوعی (LLM)",
                      "چاپ و نشر (با حفظ حقوق شاعران)",
                      "استفاده آفلاین (با دانلود و cache)",
                    ].map((use, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                        <span className="text-sm">{use}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Prohibited Use */}
            <section id="prohibited-use">
              <h2 className="text-2xl font-bold text-foreground mb-3">استفاده ممنوع</h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    برای حفظ کیفیت سرویس و احترام به فرهنگ فارسی، موارد زیر <strong>ممنوع</strong> است:
                  </p>

                  <div className="space-y-3">
                    {[
                      {
                        title: "ارسال درخواست‌های بیش از حد (Rate Abuse)",
                        desc: "ارسال بیش از ۱۰۰ درخواست در ثانیه یا scraping مداوم بدون وقفه منطقی.",
                      },
                      {
                        title: "تلاش برای از کار انداختن سرویس (DDoS)",
                        desc: "هرگونه تلاش برای overload کردن یا مختل کردن API.",
                      },
                      {
                        title: "تغییر یا تحریف اشعار به شکل توهین‌آمیز",
                        desc: "تغییر محتوای اشعار به گونه‌ای که به شاعر یا فرهنگ فارسی توهین کند.",
                      },
                      {
                        title: "استفاده در محتوای نفرت‌پراکنی یا تروریسم",
                        desc: "API نباید ابزار ترویج نفرت، خشونت، یا تروریسم باشد.",
                      },
                      {
                        title: "ادعای مالکیت بر اشعار کلاسیک",
                        desc: "نمی‌توانید ادعا کنید که شعر حافظ یا مولانا متعلق به شماست.",
                      },
                      {
                        title: "فروش مجدد اشعار به شکل خام",
                        desc: "اشعار مالکیت عمومی هستند — فروش مجدد آن‌ها به عنوان محتوای اختصاصی تخلف است.",
                      },
                    ].map((item, i) => (
                      <div key={i} className="border border-border rounded-md p-4">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold mb-1">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>اقدام در برابر تخلف</AlertTitle>
                    <AlertDescription>
                      در صورت مشاهده تخلف، ما حق <strong>مسدود کردن IP</strong> یا محدودسازی
                      دسترسی به API را برای حفاظت از سرویس داریم. در اکثر موارد، قبل از اقدام
                      قاطع، از طریق GitHub با شما تماس می‌گیریم.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </section>

            {/* Rate Limits */}
            <section id="rate-limits">
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Gauge className="w-6 h-6 text-primary" />
                محدودیت‌های استفاده منصفانه
              </h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    با توجه به رایگان بودن و میزبانی جامعه‌محور، رعایت <strong>استفاده منصفانه</strong> ضروری است:
                  </p>

                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border text-muted-foreground">
                          <th className="text-right p-3 font-semibold">پارامتر</th>
                          <th className="text-right p-3 font-semibold">مقدار</th>
                          <th className="text-right p-3 font-semibold">توضیح</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[
                          { param: "حداکثر نتایج در هر درخواست", value: "۱۰۰", note: "برای endpointهای list" },
                          { param: "حداکثر نتایج جستجو", value: "۵۰", note: "Endpoint: /api/quotes/search" },
                          { param: "حداقل کاراکتر جستجو", value: "۲", note: "برای جلوگیری از بار اضافی" },
                          { param: "درخواست در دقیقه (توصیه)", value: "≤ 60", note: "استفاده معقول برای اپلیکیشن" },
                          { param: "Caching", value: "توصیه اکید", note: "اشعار تغییر نمی‌کنند؛ cache کنید" },
                        ].map((row, i) => (
                          <tr key={i}>
                            <td className="p-3 font-medium">{row.param}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="border-primary/30 text-primary font-mono">
                                {row.value}
                              </Badge>
                            </td>
                            <td className="p-3 text-muted-foreground text-xs">{row.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border border-border rounded-md p-4 bg-muted/30">
                    <h4 className="font-semibold mb-2">توصیه‌های عملکردی</h4>
                    <ul className="text-sm space-y-1.5 pr-4 text-muted-foreground">
                      <li>• <strong>Caching:</strong> اشعار تغییر نمی‌کنند، پس در سمت کلاینت cache کنید.</li>
                      <li>• <strong>Debouncing:</strong> در جستجو، ۳۰۰ms صبر کنید قبل از ارسال درخواست.</li>
                      <li>• <strong>Batch:</strong> اگر به چند شعر نیاز دارید، از <code className="text-xs bg-background px-1 rounded">limit=100</code> استفاده کنید.</li>
                      <li>• <strong>Random client-side:</strong> یک بار ۱۰۰ شعر بگیرید، سمت کلاینت random انتخاب کنید.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Attribution */}
            <section id="attribution">
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                انتساب و تقدیر
              </h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    <strong>انتساب اجباری نیست</strong>، اما <strong>به‌شدت قدردانی می‌شود</strong>.
                    اگر با افزودن یک لینک کوچک به سایت ما، به رشد این پروژه کمک کنید، خوشحال می‌شویم.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-border rounded-md p-4">
                      <h4 className="font-semibold mb-2">اختیاری (اما خوب)</h4>
                      <p className="text-sm text-muted-foreground mb-2">یک لینک یا متن کوچک مثل:</p>
                      <div className="bg-muted p-2 rounded text-xs text-center font-mono" dir="ltr">
                        اشعار از API اشعار فارسی
                      </div>
                    </div>

                    <div className="border border-border rounded-md p-4">
                      <h4 className="font-semibold mb-2">فوق‌العاده قدردانی می‌شود</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        اشاره به شاعر اصلی (مثلاً «مولانا») در کنار هر شعر.
                      </p>
                      <div className="bg-muted p-2 rounded text-xs text-center font-mono" dir="ltr">
                        عاشقان مرده‌اند... — مولانا
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Heart className="h-4 w-4" />
                    <AlertTitle>نکته فرهنگی</AlertTitle>
                    <AlertDescription>
                      در فرهنگ فارسی، <strong>ذکر نام شاعر</strong> بخشی از احترام به شعر است.
                      حتی اگر انتساب به ما لازم نیست، انتساب به شاعر اصلی یک رسم زیبا و اخلاقی است.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </section>

            {/* Availability */}
            <section id="availability">
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Server className="w-6 h-6 text-primary" />
                پایداری و دسترسی سرویس
              </h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>ما تمام تلاش خود را برای حفظ دسترسی <strong>۹۹٪+</strong> می‌کنیم، اما:</p>

                  <Alert>
                    <Server className="h-4 w-4" />
                    <AlertTitle>بدون SLA</AlertTitle>
                    <AlertDescription>
                      این سرویس <strong>بدون قرارداد سطح خدمات (SLA)</strong> ارائه می‌شود.
                      ما متعهد به uptime ۱۰۰٪ نیستیم. ممکن است در زمان‌هایی (نگهداری، bug،
                      قطعی زیرساخت) سرویس موقتاً در دسترس نباشد.
                    </AlertDescription>
                  </Alert>

                  <p><strong>توصیه‌های مهم برای اپلیکیشن‌های production:</strong></p>
                  <ul className="space-y-2 pr-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span>پیاده‌سازی <strong>fallback محلی</strong> با cache اشعار پرکاربرد.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span>مدیریت خطای graceful در سمت کلاینت (offline mode).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span>برای پروژه‌های critical، <strong>fork</strong> کنید یا mirror شخصی راه‌اندازی کنید.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span>عضویت در <strong>GitHub Watch</strong> برای اطلاع از تغییرات.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Modifications */}
            <section id="modifications">
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <RefreshCw className="w-6 h-6 text-primary" />
                اصلاحات و تغییرات
              </h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    ما حق <strong>تغییر، بهبود، اضافه کردن یا حذف ویژگی‌ها</strong> از API را
                    در هر زمان داریم. این شامل:
                  </p>
                  <ul className="space-y-2 pr-4">
                    <li className="flex items-start gap-2">
                      <RefreshCw className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span>افزودن endpointهای جدید</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RefreshCw className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span>تغییر schema (در صورت امکان، backwards-compatible)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RefreshCw className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span>افزایش یا کاهش محدودیت‌های rate limit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RefreshCw className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span>تغییر آدرس endpoint (با اطلاع‌رسانی قبلی)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RefreshCw className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span>اصلاح این شرایط استفاده</span>
                    </li>
                  </ul>

                  <p className="text-sm text-muted-foreground">
                    برای تغییرات breaking، حداقل <strong>۳۰ روز</strong> از طریق GitHub اطلاع‌رسانی می‌کنیم.
                    تغییرات minor (مثلاً باگ‌فیکس) بدون اطلاع قبلی اعمال می‌شوند.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Disclaimer */}
            <section id="disclaimer">
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                سلب مسئولیت
              </h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    این سرویس <strong>«همان‌طور که هست» (AS IS)</strong> و <strong>«همان‌طور
                    که در دسترس است» (AS AVAILABLE)</strong> ارائه می‌شود. ما هیچ‌گونه ضمانتی،
                    چه صریح و چه ضمنی، ارائه نمی‌دهیم، از جمله:
                  </p>

                  <div className="grid md:grid-cols-2 gap-2">
                    {[
                      "ضمانت تجاری‌بودن (Merchantability)",
                      "ضمانت تناسب برای هدف خاص",
                      "ضمانت عدم نقض حقوق ثالث",
                      "ضمانت دقت یا کامل‌بودن داده‌ها",
                      "ضمانت عملکرد بدون خطا",
                      "ضمانت uptime یا availability خاص",
                    ].map((warranty, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <span className="text-sm">{warranty}</span>
                      </div>
                    ))}
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>توضیح</AlertTitle>
                    <AlertDescription>
                      این سلب مسئولیت بخشی از مجوز MIT استاندارد است. ما یک پروژه داوطلبانه
                      هستیم و نمی‌توانیم مسئولیت حقوقی برای کیفیت یا uptime سرویس بپذیریم.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </section>

            {/* Liability */}
            <section id="liability">
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Scale className="w-6 h-6 text-primary" />
                محدودیت مسئولیت
              </h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    تحت هیچ شرایطی، توسعه‌دهندگان، مشارکت‌کنندگان، یا نگهدارندگان این پروژه
                    در برابر هرگونه <strong>ادعای خسارت</strong> مسئول نخواهند بود، از جمله:
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      "خسارت مستقیم یا غیرمستقیم",
                      "خسارت ناشی از قطعی سرویس",
                      "خسارت ناشی از داده‌های نادرست",
                      "خسارت تجاری یا از دست دادن سود",
                      "خسارت ناشی از دسترسی غیرمجاز",
                      "خسارت معنوی یا شهرتی",
                    ].map((damage, i) => (
                      <div key={i} className="border border-border rounded-md p-3 text-sm text-muted-foreground">
                        {damage}
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    این محدودیت در حداکثر extent ممکن طبق قوانین قابل اجرا اعمال می‌شود.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Governing Law */}
            <section id="governing-law">
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Scale className="w-6 h-6 text-primary" />
                قانون حاکم و حل اختلاف
              </h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    این شرایط استفاده تحت تأثیر قوانین بین‌المللی نرم‌افزارهای متن‌باز و اصول
                    کلی حقوق قراردادها تفسیر می‌شوند.
                  </p>

                  <Alert>
                    <Scale className="h-4 w-4" />
                    <AlertTitle>حل اختلاف</AlertTitle>
                    <AlertDescription>
                      در صورت بروز اختلاف، اولویت به ترتیب:
                      <strong>۱.</strong> گفتگوی دوستانه از طریق GitHub Issue،
                      <strong>۲.</strong> مراجعه به جامعه متن‌باز برای نظر کارشناسی،
                      <strong>۳.</strong> در نهایت، مراجعه به مراجع ذی‌صلاح. ما طرفدار
                      حل‌وفصل مسالمت‌آمیز هستیم.
                    </AlertDescription>
                  </Alert>

                  <p className="text-sm text-muted-foreground">
                    بدون تعارض با مجوز MIT، این شرایط به‌عنوان یک توافقنامه استفاده منصفانه
                    بین ارائه‌دهندگان و کاربران سرویس عمل می‌کند.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Contact */}
            <section id="contact">
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Mail className="w-6 h-6 text-primary" />
                تماس با ما
              </h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>برای سؤالات در مورد این شرایط، درخواست مجوز خاص، یا همکاری:</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <a
                      href="https://github.com/arsamadineh/Persian-Quote-API/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-border rounded-md p-4 hover:border-primary transition-colors"
                    >
                      <Github className="w-5 h-5 text-primary mb-2" />
                      <h4 className="font-semibold mb-1">GitHub Issues</h4>
                      <p className="text-sm text-muted-foreground">برای گزارش مشکل یا سؤال عمومی</p>
                    </a>

                    <a
                      href="https://github.com/arsamadineh/Persian-Quote-API"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-border rounded-md p-4 hover:border-primary transition-colors"
                    >
                      <Code className="w-5 h-5 text-primary mb-2" />
                      <h4 className="font-semibold mb-1">مشارکت در کد</h4>
                      <p className="text-sm text-muted-foreground">Pull Request ها پذیرفته می‌شوند</p>
                    </a>
                  </div>

                  <div className="text-center pt-4 border-t border-border mt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      با استفاده از API اشعار فارسی، شما این شرایط را پذیرفته‌اید.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Link href="/privacy">
                        <Button variant="outline" size="sm">
                          سیاست حریم خصوصی
                        </Button>
                      </Link>
                      <Link href="/docs">
                        <Button variant="outline" size="sm">
                          مستندات API
                        </Button>
                      </Link>
                      <Link href="/">
                        <Button size="sm">بازگشت به خانه</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
