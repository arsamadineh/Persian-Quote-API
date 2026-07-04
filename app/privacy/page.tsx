import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Shield,
  Eye,
  Database,
  Cookie,
  Mail,
  RefreshCw,
  Github,
  CheckCircle2,
  XCircle,
  Server,
} from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "سیاست حریم خصوصی - API اشعار فارسی",
  description: "سیاست حریم خصوصی API اشعار فارسی - Persian Quotes API Privacy Policy",
}

export default function PrivacyPage() {
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
                      { href: "#introduction", label: "مقدمه" },
                      { href: "#commitment", label: "تعهد ما" },
                      { href: "#collected-info", label: "اطلاعات جمع‌آوری‌شده" },
                      { href: "#cookies", label: "کوکی‌ها و ذخیره‌سازی" },
                      { href: "#analytics", label: "ردیابی و تحلیل" },
                      { href: "#third-party", label: "سرویس‌های شخص ثالث" },
                      { href: "#infrastructure", label: "زیرساخت و میزبانی" },
                      { href: "#sharing", label: "اشتراک‌گذاری داده‌ها" },
                      { href: "#security", label: "امنیت داده‌ها" },
                      { href: "#rights", label: "حقوق شما" },
                      { href: "#children", label: "حریم خصوصی کودکان" },
                      { href: "#changes", label: "تغییرات در سیاست" },
                      { href: "#contact", label: "تماس با ما" },
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
                <Shield className="w-6 h-6 text-primary" />
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">سیاست حریم خصوصی</h1>
              </div>
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                شفافیت کامل در مورد داده‌های شما. ما باور داریم که یک API رایگان نباید بهای حریم
                خصوصی شما را بپردازد.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  آخرین بروزرسانی: <span className="font-medium text-foreground">{lastUpdated}</span>
                </span>
                <Badge variant="secondary">بدون ثبت‌نام، بدون ردیابی، بدون کوکی</Badge>
              </div>
            </div>

            {/* Introduction */}
            <section id="introduction">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    مقدمه
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 leading-relaxed text-foreground/90">
                  <p>
                    به <strong>API اشعار فارسی</strong> (Persian Quotes API) خوش آمدید. این سند
                    توضیح می‌دهد که ما چگونه با اطلاعات شما — و به‌طور خاص، با عدم جمع‌آوری آن‌ها —
                    رفتار می‌کنیم.
                  </p>
                  <p>
                    فلسفه ما ساده است: <strong>یک سرویس رایگان نباید بهایی از حریم خصوصی شما
                    بگیرد</strong>. این سیاست در مورد وب‌سایت
                    <code className="px-1.5 py-0.5 bg-muted rounded text-xs mx-1" dir="ltr">pq.arsamadineh.ir</code>
                    و کلیه نقاط پایانی (endpoints) API عمومی ما اعمال می‌شود. با استفاده از خدمات
                    ما، شما مفاد این سند را مطالعه و پذیرفته‌اید.
                  </p>

                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>نکته کلیدی</AlertTitle>
                    <AlertDescription>
                      این پروژه <strong>کاملاً متن‌باز</strong> است و هیچ‌گونه اطلاعات شناسایی شخصی (PII)
                      از کاربران جمع‌آوری، ذخیره یا پردازش نمی‌کند. کد منبع در GitHub قابل بررسی و
                      حسابرسی است.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </section>

            {/* Our Commitment */}
            <section id="commitment">
              <h2 className="text-2xl font-bold text-foreground mb-3">تعهد ما به شما</h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    ما متعهد هستیم که حریم خصوصی شما را با رعایت اصل <strong>«حداقل داده»</strong>
                    (Data Minimization) حفظ کنیم. یعنی:
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { title: "بدون ثبت‌نام", desc: "نیازی به ایجاد حساب کاربری نیست" },
                      { title: "بدون ایمیل", desc: "هیچ ایمیلی از شما درخواست نمی‌شود" },
                      { title: "بدون کلید API", desc: "هیچ توکن یا کلید احراز هویتی لازم نیست" },
                      { title: "بدون پرداخت", desc: "هیچ اطلاعات بانکی یا مالی جمع‌آوری نمی‌شود" },
                    ].map((item, i) => (
                      <div key={i} className="border border-border rounded-md p-3">
                        <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Information Collected */}
            <section id="collected-info">
              <h2 className="text-2xl font-bold text-foreground mb-3">اطلاعات جمع‌آوری‌شده</h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    ما <strong>هیچ‌گونه اطلاعات شخصی</strong> (Personally Identifiable Information -
                    PII) از کاربران API یا بازدیدکنندگان وب‌سایت جمع‌آوری نمی‌کنیم:
                  </p>

                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border text-muted-foreground">
                          <th className="text-right p-3 font-semibold">نوع داده</th>
                          <th className="text-right p-3 font-semibold">وضعیت</th>
                          <th className="text-right p-3 font-semibold">توضیح</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[
                          { type: "نام و نام خانوادگی", status: "جمع‌آوری نمی‌شود" },
                          { type: "آدرس ایمیل", status: "جمع‌آوری نمی‌شود" },
                          { type: "شماره تلفن", status: "جمع‌آوری نمی‌شود" },
                          { type: "آدرس IP (لاگ‌ها)", status: "ذخیره دائمی نمی‌شود" },
                          { type: "موقعیت جغرافیایی", status: "جمع‌آوری نمی‌شود" },
                          { type: "اطلاعات مرورگر", status: "جمع‌آوری نمی‌شود" },
                          { type: "کوکی‌ها", status: "استفاده نمی‌شود" },
                          { type: "تاریخچه جستجو", status: "ذخیره نمی‌شود" },
                        ].map((row, i) => (
                          <tr key={i}>
                            <td className="p-3 font-medium">{row.type}</td>
                            <td className="p-3">
                              <Badge variant="secondary">{row.status}</Badge>
                            </td>
                            <td className="p-3 text-muted-foreground text-xs">توسط ما پردازش یا ذخیره نمی‌شود</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Alert>
                    <Database className="h-4 w-4" />
                    <AlertTitle>اطلاعاتی که وجود دارد</AlertTitle>
                    <AlertDescription>
                      تنها داده‌های موجود در سرویس ما، <strong>محتوای اشعار فارسی</strong> است که
                      از منابع عمومی و آزاد (Public Domain) جمع‌آوری شده‌اند. این محتوا متعلق به
                      بزرگان ادب فارسی (مولانا، حافظ، سعدی و...) است که قرن‌ها پیش می‌زیسته‌اند.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </section>

            {/* Cookies */}
            <section id="cookies">
              <h2 className="text-2xl font-bold text-foreground mb-3">کوکی‌ها و ذخیره‌سازی محلی</h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    وب‌سایت و API ما از <strong>هیچ کوکی</strong> و هیچ مکانیزم ذخیره‌سازی محلی
                    (LocalStorage، SessionStorage، IndexedDB و...) استفاده نمی‌کند.
                  </p>

                  <ul className="space-y-2 pr-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span>هیچ کوکی‌ای تنظیم نمی‌شود</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span>هیچ داده‌ای در مرورگر شما ذخیره نمی‌شود</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span>هیچ ردیابی بین‌صفحه‌ای وجود ندارد</span>
                    </li>
                  </ul>

                  <p className="text-sm text-muted-foreground">
                    <strong>توجه:</strong> سرویس‌های شخص ثالث (مثل Google Fonts یا CDN میزبان) ممکن
                    است در لاگ‌های شبکه IP شما را ببینند، اما این خارج از کنترل مستقیم ماست.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Analytics */}
            <section id="analytics">
              <h2 className="text-2xl font-bold text-foreground mb-3">ردیابی و تحلیل</h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    ما از <strong>هیچ ابزار تحلیلی</strong> (Analytics) استفاده نمی‌کنیم:
                  </p>

                  <div className="grid md:grid-cols-3 gap-3">
                    {[
                      "Google Analytics",
                      "Plausible / Umami",
                      "Facebook Pixel",
                      "Hotjar / Session Recording",
                      "Sentry / Error Tracking",
                      "Mixpanel / Amplitude",
                    ].map((tool, i) => (
                      <div key={i} className="border border-border rounded-md p-3 text-center">
                        <div className="text-sm font-medium">{tool}</div>
                        <Badge variant="outline" className="mt-2 text-xs">
                          غیرفعال
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <Alert>
                    <Eye className="h-4 w-4" />
                    <AlertTitle>سیاست ما</AlertTitle>
                    <AlertDescription>
                      فلسفه ما «حریم خصوصی by default» است. ما باور داریم که حتی داده‌های تجمیعی و
                      ناشناس نیز اگر واقعاً لازم نباشند، نباید جمع‌آوری شوند. در حال حاضر، ما هیچ
                      نیازی به تحلیل رفتار کاربران نداریم.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </section>

            {/* Third-Party Services */}
            <section id="third-party">
              <h2 className="text-2xl font-bold text-foreground mb-3">سرویس‌های شخص ثالث</h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    برای ارائه خدمات، از چند سرویس شخص ثالث استفاده می‌کنیم. هر کدام سیاست حریم
                    خصوصی مستقل خود را دارند:
                  </p>

                  <div className="space-y-3">
                    {[
                      {
                        name: "Google Fonts (Vazirmatn)",
                        desc: "برای نمایش زیبای متن فارسی در وب‌سایت. ممکن است IP شما برای Google قابل مشاهده باشد.",
                        policy: "policies.google.com/privacy",
                      },
                      {
                        name: "GitHub",
                        desc: "میزبانی کد منبع و issue tracker. در صورت تعامل با ریپازیتوری یا Issues، سیاست GitHub اعمال می‌شود.",
                        policy: "docs.github.com/site-policy/privacy-policies",
                      },
                      {
                        name: "سرویس میزبانی (CDN/Hoster)",
                        desc: "برای ارائه API در آدرس pq.arsamadineh.ir. لاگ‌های شبکه استاندارد توسط هاست نگهداری می‌شود.",
                        policy: "بسته به سرویس‌دهنده متغیر است",
                      },
                    ].map((svc, i) => (
                      <div key={i} className="border border-border rounded-md p-4">
                        <h4 className="font-semibold mb-2">{svc.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">{svc.desc}</p>
                        <div className="text-xs font-mono text-primary bg-muted px-2 py-1 rounded inline-block" dir="ltr">
                          {svc.policy}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Infrastructure */}
            <section id="infrastructure">
              <h2 className="text-2xl font-bold text-foreground mb-3">زیرساخت و لاگ‌های سرور</h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    به‌طور شفاف باید بدانید که <strong>زیرساخت اینترنت ذاتاً IP شما را برای ارائه
                    درخواست‌های HTTP می‌بیند</strong>. این موضوع اجتناب‌ناپذیر است و مختص سرویس ما نیست.
                  </p>
                  <p>
                    با این حال، ما در لایه اپلیکیشن خود هیچ لاگ دائمی از IP، User-Agent، یا الگوهای
                    استفاده شما ذخیره نمی‌کنیم. لاگ‌های شبکه صرفاً توسط ارائه‌دهنده میزبانی و به‌منظور
                    امنیت و دیباگ نگهداری می‌شوند و خارج از کنترل مستقیم ما هستند.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    اگر نگرانی خاصی در مورد لاگ‌های زیرساخت دارید، توصیه می‌کنیم از یک VPN یا Tor
                    استفاده کنید — همان‌طور که برای هر سرویس آنلاین دیگری نیز صادق است.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Data Sharing */}
            <section id="sharing">
              <h2 className="text-2xl font-bold text-foreground mb-3">اشتراک‌گذاری داده‌ها</h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    چون ما داده‌ای از شما نداریم، داده‌ای هم به اشتراک نمی‌گذاریم، نمی‌فروشیم، یا
                    به شخص ثالثی منتقل نمی‌کنیم:
                  </p>
                  <ul className="space-y-2 pr-4">
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0 mt-1" />
                      <span><strong>فروش داده:</strong> هیچ داده‌ای وجود ندارد که بفروشیم.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0 mt-1" />
                      <span><strong>اشتراک‌گذاری با تبلیغ‌کنندگان:</strong> هیچ رابطه تبلیغاتی با شخص ثالث نداریم.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0 mt-1" />
                      <span><strong>اشتراک با شرکت‌های تحلیل داده:</strong> استفاده نمی‌کنیم.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0 mt-1" />
                      <span><strong>اشتراک با دولت‌ها:</strong> فقط در صورت حکم قضایی معتبر (که تاکنون دریافت نکرده‌ایم).</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Security */}
            <section id="security">
              <h2 className="text-2xl font-bold text-foreground mb-3">امنیت</h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    با وجود اینکه ما داده‌ای حساس ذخیره نمی‌کنیم، اقدامات زیر را برای حفظ یکپارچگی
                    و در دسترس بودن سرویس انجام می‌دهیم:
                  </p>
                  <ul className="space-y-2 pr-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span><strong>HTTPS:</strong> تمام ارتباطات با API رمزنگاری شده (TLS 1.2+).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span><strong>CORS:</strong> پاسخ‌ها از هر دامنه‌ای قابل استفاده هستند.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span><strong>متن‌باز:</strong> تمام کد در GitHub قابل بررسی است.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span><strong>بدون SQL/Database:</strong> سرویس به یک پایگاه داده کاربران متصل نیست.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* User Rights */}
            <section id="rights">
              <h2 className="text-2xl font-bold text-foreground mb-3">حقوق شما</h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    اگرچه ما داده‌ای از شما نداریم، حقوق زیر را به رسمیت می‌شناسیم:
                  </p>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="border border-border rounded-md p-4">
                      <h4 className="font-semibold mb-2">حق دسترسی</h4>
                      <p className="text-sm text-muted-foreground">
                        شما حق دارید بدانید چه داده‌ای از شما وجود دارد — و پاسخ ما ساده است: «هیچ».
                      </p>
                    </div>
                    <div className="border border-border rounded-md p-4">
                      <h4 className="font-semibold mb-2">حق حذف</h4>
                      <p className="text-sm text-muted-foreground">
                        اگر داده‌ای وجود داشت، آن را حذف می‌کنیم — اما چون داده‌ای نیست، نیازی به
                        اقدام نیست.
                      </p>
                    </div>
                    <div className="border border-border rounded-md p-4">
                      <h4 className="font-semibold mb-2">حق انتقال‌پذیری</h4>
                      <p className="text-sm text-muted-foreground">
                        از آنجا که داده‌ای نیست، مفهوم انتقال نیز موضوعیت ندارد.
                      </p>
                    </div>
                    <div className="border border-border rounded-md p-4">
                      <h4 className="font-semibold mb-2">حق اعتراض</h4>
                      <p className="text-sm text-muted-foreground">
                        شما می‌توانید در هر زمان با ارسال Issue در GitHub، اعتراض یا پیشنهاد خود را
                        مطرح کنید.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Children */}
            <section id="children">
              <h2 className="text-2xl font-bold text-foreground mb-3">حریم خصوصی کودکان</h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    سرویس ما برای استفاده توسط <strong>افراد در هر سنی</strong> مناسب است، از جمله
                    کودکان و نوجوانان، زیرا محتوای اشعار فارسی سرشار از حکمت و زیبایی است و ذاتاً
                    آموزنده است.
                  </p>
                  <p>
                    با توجه به اینکه ما هیچ اطلاعاتی از کاربران (از جمله کودکان) جمع‌آوری نمی‌کنیم،
                    مفاد COPPA (قانون حریم خصوصی آنلاین کودکان آمریکا) و مقررات مشابه بین‌المللی
                    به‌طور کامل و بدون نیاز به اقدام اضافی رعایت می‌شوند.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ما هیچ‌گونه محتوای نامناسب برای کودکان در سرویس قرار نمی‌دهیم.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Changes */}
            <section id="changes">
              <h2 className="text-2xl font-bold text-foreground mb-3">تغییرات در این سیاست</h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    ما ممکن است این سیاست حریم خصوصی را در آینده بروزرسانی کنیم. هر تغییر مهم از
                    طریق:
                  </p>
                  <ul className="space-y-2 pr-4">
                    <li className="flex items-start gap-2">
                      <Github className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span>Commit در ریپازیتوری GitHub (release notes)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RefreshCw className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span>تغییر تاریخ «آخرین بروزرسانی» در همین صفحه</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Eye className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <span>در صورت تغییرات اساسی، اطلاعیه در README پروژه</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground">
                    از آنجا که ما اطلاعات تماس شما را نداریم، نمی‌توانیم شخصاً به شما اطلاع‌رسانی
                    کنیم. توصیه می‌کنیم به‌صورت دوره‌ای این صفحه را بررسی کنید یا ریپازیتوری را
                    star کنید تا از تغییرات مطلع شوید.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Contact */}
            <section id="contact">
              <h2 className="text-2xl font-bold text-foreground mb-3">تماس با ما</h2>
              <Card>
                <CardContent className="pt-6 space-y-4 leading-relaxed">
                  <p>
                    اگر سؤال، نگرانی، یا شکایتی در مورد حریم خصوصی دارید، لطفاً از طریق یکی از
                    روش‌های زیر با ما در تماس باشید:
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <a
                      href="https://github.com/arsamadineh/Persian-Quote-API/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-border rounded-md p-4 hover:border-primary transition-colors"
                    >
                      <Github className="w-5 h-5 text-primary mb-2" />
                      <h4 className="font-semibold mb-1">GitHub Issues</h4>
                      <p className="text-sm text-muted-foreground">بهترین روش برای ارتباط عمومی و شفاف</p>
                    </a>

                    <a
                      href="https://github.com/arsamadineh/Persian-Quote-API"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-border rounded-md p-4 hover:border-primary transition-colors"
                    >
                      <Mail className="w-5 h-5 text-primary mb-2" />
                      <h4 className="font-semibold mb-1">گفتگوی عمومی</h4>
                      <p className="text-sm text-muted-foreground">از طریق Discussions یا ریپازیتوری</p>
                    </a>
                  </div>

                  <Alert>
                    <Server className="h-4 w-4" />
                    <AlertTitle>پاسخگویی</AlertTitle>
                    <AlertDescription>
                      ما یک پروژه داوطلبانه و متن‌باز هستیم. تلاش می‌کنیم در اسرع وقت به پرسش‌های
                      مرتبط با حریم خصوصی پاسخ دهیم، اما تضمین زمانی خاصی وجود ندارد.
                    </AlertDescription>
                  </Alert>

                  <div className="text-center pt-4 border-t border-border mt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      متشکریم از اینکه از API اشعار فارسی استفاده می‌کنید.
                    </p>
                    <Link href="/" className="text-sm text-primary hover:underline">
                      بازگشت به خانه
                    </Link>
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
