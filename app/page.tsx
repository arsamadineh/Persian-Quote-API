"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Code2, Copy, Check, Terminal, Database, ArrowLeft, ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface ApiTabItem {
  title: string
  endpoint: string
  description: string
  params: Array<{ name: string; type: string; required: string; desc: string }>
  response: string
}

function ApiPlayground() {
  const [activeTab, setActiveTab] = useState(0)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState("https://pq.adicon.ir")

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const apiTabs: ApiTabItem[] = [
    {
      title: "جستجوی متنی اشعار",
      endpoint: "/api/quotes/search?q=شیراز&limit=2",
      description: "جستجوی دقیق چندکلمه‌ای در متن، نام شاعر، عنوان اثر و دیوان‌ها با رتبه‌بندی بسامدی.",
      params: [
        { name: "q", type: "string", required: "الزامی", desc: "عبارت یا واژگان مورد نظر برای جستجو" },
        { name: "limit", type: "number", required: "اختیاری", desc: "تعداد رکوردهای بازگشتی (پیش‌فرض ۱۰، بیشینه ۱۰۰)" },
        { name: "page", type: "number", required: "اختیاری", desc: "شماره صفحه برای صفحه‌بندی" },
      ],
      response: `{
  "success": true,
  "data": [
    {
      "id": "h-1",
      "kind": "hafez",
      "text_persian": "الا یا ایها الساقی ادر کاسا و ناولها\\nکه عشق آسان نمود اول ولی افتاد مشکل‌ها",
      "poet": "حافظ",
      "poet_english": "Hafez",
      "source": "دیوان حافظ",
      "category": "غزل",
      "tags": ["حافظ", "غزل"]
    }
  ],
  "count": 1,
  "total": 497,
  "page": 1,
  "limit": 2
}`,
    },
    {
      title: "دیوان حافظ",
      endpoint: "/api/quotes/hafez?id=1",
      description: "دسترسی مستقیم به ۴۹۷ غزل مدون دیوان حافظ با شماره‌گذاری استاندارد و تفکیک مصراع‌ها.",
      params: [
        { name: "id", type: "number", required: "اختیاری", desc: "شماره غزل بر اساس نسخه قزوینی-غنی (۱ تا ۴۹۷)" },
        { name: "random", type: "boolean", required: "اختیاری", desc: "انتخاب تصادفی یک غزل" },
        { name: "q", type: "string", required: "اختیاری", desc: "فیلتر بر اساس واژگان متن غزل" },
      ],
      response: `{
  "success": true,
  "data": [
    {
      "id": 1,
      "verses": [
        ["الا یا ایها الساقی ادر کاسا و ناولها", "که عشق آسان نمود اول ولی افتاد مشکل‌ها"],
        ["به بوی نافه کاخر صبا زان طره بگشاید", "ز تاب جعد مشکینش چه خون افتاد در دل‌ها"]
      ],
      "poet": "حافظ شیرازی",
      "source": "دیوان حافظ"
    }
  ],
  "count": 1,
  "total": 497
}`,
    },
    {
      title: "شعر معاصر و نو",
      endpoint: "/api/quotes/shereno?poet=سهراب سپهری&limit=1",
      description: "بیش از ۴۰۰۰ قطعه شعر معاصر با ساختار مصراع‌های آزاد از نیما یوشیج، اخوان ثالث، شاملو و سپهری.",
      params: [
        { name: "poet", type: "string", required: "اختیاری", desc: "نام شاعر نو (پشتیبانی از جستجوی فازی و معادل انگلیسی)" },
        { name: "title", type: "string", required: "اختیاری", desc: "عنوان شعر یا بند مدنظر" },
        { name: "limit", type: "number", required: "اختیاری", desc: "تعداد رکوردهای بازگشتی" },
      ],
      response: `{
  "success": true,
  "data": [
    {
      "id": "sn-204",
      "title": "صدای پای آب",
      "poem": "اهل کاشانم / روزگارم بد نیست / تکه نانی دارم، خرده هوشی، سر سوزن ذوقی",
      "poet": "سهراب سپهری",
      "book": "صدای پای آب"
    }
  ],
  "count": 1,
  "total": 4000
}`,
    },
    {
      title: "فهرست و نمایه شاعران",
      endpoint: "/api/poets",
      description: "اطلاعات ساختاریافته شاعران شامل نام معیار فارسی و انگلیسی، سال تولد و وفات، و تعداد ابیات موجود.",
      params: [
        { name: "-", type: "-", required: "بدون ورودی", desc: "فهرست کامل شاعران ثبت‌شده در پایگاه داده" },
      ],
      response: `{
  "success": true,
  "data": [
    {
      "id": 2,
      "name_persian": "حافظ شیرازی",
      "name_english": "Hafez",
      "birth_year": 1315,
      "death_year": 1390,
      "quote_count": 499
    }
  ],
  "count": 14
}`,
    },
  ]

  const handleCopy = () => {
    const fullUrl = `${window.location.origin}${apiTabs[activeTab].endpoint}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5 text-right" dir="rtl">
      {/* انتخاب‌گر اندپوینت */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-border/70 scrollbar-none">
        {apiTabs.map((tab, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setActiveTab(idx)
              setCopied(false)
            }}
            className={`px-3.5 py-2 rounded-t-md text-xs md:text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
              activeTab === idx
                ? "border-primary text-foreground bg-muted/40 font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* نوار آدرس و کپی */}
      <div className="flex items-center gap-2 bg-muted/30 p-2.5 rounded-lg border border-border">
        <Badge variant="outline" className="font-mono text-[11px] px-2 py-0.5 bg-background font-semibold shrink-0">
          GET
        </Badge>
        <div className="flex-1 overflow-x-auto font-mono text-xs md:text-sm text-left py-0.5 select-all" dir="ltr">
          <span className="text-muted-foreground">{origin}</span>
          <span className="text-foreground font-semibold">{apiTabs[activeTab].endpoint}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 hover:bg-background"
          onClick={handleCopy}
          aria-label="کپی پیوند اندپوینت"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* توضیحات و جدول پارامترها */}
        <div className="lg:col-span-5 space-y-3">
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            {apiTabs[activeTab].description}
          </p>

          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="px-3 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-foreground">
              پارامترهای پرس‌وجو (Query Parameters)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground text-[11px]">
                    <th className="p-2 text-right font-medium">پارامتر</th>
                    <th className="p-2 text-center font-medium">نوع</th>
                    <th className="p-2 text-right font-medium">توضیح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono text-[11px]">
                  {apiTabs[activeTab].params.map((p, idx) => (
                    <tr key={idx} className="hover:bg-muted/10">
                      <td className="p-2 font-semibold text-foreground text-left" dir="ltr">{p.name}</td>
                      <td className="p-2 text-center text-muted-foreground">{p.type}</td>
                      <td className="p-2 font-sans text-muted-foreground">{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* نمایش خروجی استاندارد JSON */}
        <div className="lg:col-span-7 border border-border rounded-lg overflow-hidden bg-stone-950 text-stone-100 flex flex-col">
          <div className="px-3 py-1.5 border-b border-stone-800 bg-stone-900/90 flex items-center justify-between text-[11px] font-mono text-stone-400">
            <span>application/json</span>
            <span>200 OK</span>
          </div>
          <pre className="p-3.5 font-mono text-xs overflow-auto text-left leading-relaxed max-h-[340px] bg-stone-950 text-stone-200" dir="ltr">
            <code>{apiTabs[activeTab].response}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const stats = [
    { label: "مجموع ابیات و متون", value: "۹،۰۰۰+" },
    { label: "غزلیات مدون حافظ", value: "۴۹۷" },
    { label: "اشعار معاصر و نو", value: "۴،۰۰۰" },
    { label: "اندپوینتهای عمومی", value: "۱۰" },
  ]

  const technicalSpecs = [
    {
      title: "داده‌های متنی ساختاریافته",
      desc: "متون به صورت مصراع‌بندی‌شده همراه با متادیتا شامل قالب شعری، منبع دیوان، موضوع، و نسخه لاتین نام مؤلفان سازمان‌دهی شده‌اند.",
    },
    {
      title: "نرمال‌سازی الفبای فارسی",
      desc: "یکسان‌سازی حروف عربی، حذف اعراب و تنوین، مدیریت نیم‌فاصله‌ها، و تبدیل ارقام فارسی جهت نتایج بازیابی پایدار در پرس‌وجوها.",
    },
    {
      title: "معماری موتور سبک (تیغ)",
      desc: "مسیریابی ترای O(1)، حافظه پنهان LRU، تفکیک نرخ درخواست (Rate Limiter)، و مدارشکن خودکار جهت پایداری بار ترافیک دانشگاهی.",
    },
    {
      title: "دسترسی آزاد بدون مانع",
      desc: "بدون نیاز به توکن احراز هویت، کلید اختصاصی یا ثبت‌نام؛ به صورت کاملاً عمومی و آزاد تحت پروانه متن‌باز برای پروژه‌های پژوهشی.",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* سربرگ معرفی */}
      <section className="border-b border-border py-14 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-6 bg-muted/20">
            <span>پایگاه داده متن‌باز ادبیات فارسی</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
            <span className="font-mono text-[11px]">نسخه ۳.۶</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-5 leading-tight">
            رابط برنامه‌نویسی ادبیات فارسی
          </h1>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
            بستر برخط و آزاد جهت بازیابی، تحلیل و پردازش ساختاریافته متون کهن و معاصر فارسی. طراحی‌شده برای پژوهشگران، دانشجویان و توسعه‌دهندگان نرم‌افزار.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/docs">
              <Button size="default" className="text-sm px-5 py-2 h-10 gap-2">
                <BookOpen className="w-4 h-4" />
                مستندات کامل API
              </Button>
            </Link>
            <Link href="/examples">
              <Button variant="outline" size="default" className="text-sm px-5 py-2 h-10 gap-2 bg-background">
                <Code2 className="w-4 h-4" />
                نمونه‌های پیاده‌سازی
              </Button>
            </Link>
            <Link href="/sakhtar">
              <Button variant="outline" size="default" className="text-sm px-5 py-2 h-10 gap-2 bg-background">
                <Terminal className="w-4 h-4" />
                معماری فنی موتور
              </Button>
            </Link>
          </div>

          {/* آمار داده‌ها */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 pt-10 border-t border-border/60">
            {stats.map((s, i) => (
              <div key={i} className="text-center p-3 rounded-lg bg-muted/20 border border-border/40">
                <div className="text-lg md:text-2xl font-bold font-mono text-foreground mb-1">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* بخش تست و کنسول API */}
      <section className="py-12 md:py-16 px-4 border-b border-border bg-muted/10">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
                بررسی تعاملی اندپوینت‌ها
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                ساختار درخواست و پاسخ استاندارد JSON در اندپوینت‌های پرکاربرد.
              </p>
            </div>
            <Link href="/docs" className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium">
              مشاهده تمامی ۱۰ اندپوینت
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ApiPlayground />
        </div>
      </section>

      {/* مشخصات فنی و استانداردهای داده */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="max-w-2xl mb-8">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
              ویژگی‌های فنی و ساختار داده
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              معیارهای طراحی‌شده برای تسهیل امور پژوهشی در زبان‌شناسی رایانشی، پردازش زبان طبیعی و سامانه‌های دانشگاهی.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technicalSpecs.map((item, idx) => (
              <Card key={idx} className="border border-border bg-card/60 shadow-none">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* نمایه نمونه شعر کلاسه */}
      <section className="py-10 px-4 border-t border-border bg-muted/20">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="p-6 rounded-lg border border-border bg-card">
            <p className="text-base md:text-lg font-medium leading-loose text-foreground mb-3 font-serif">
              «عاشقان مرده‌اند در عشق زنده
              <br />
              تا ابد در دل جانان پاینده»
            </p>
            <div className="text-xs text-muted-foreground">
              مولانا جلال‌الدین بلخی — دیوان شمس تبریزی
            </div>
          </div>
        </div>
      </section>

      {/* بخش پیوندهای پژوهشی و دسترسی مستقیم */}
      <section className="py-10 px-4 border-t border-border">
        <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-foreground" />
            <span>پایگاه داده مستقل مبتنی بر حافظه و بدون وابستگی خارجی به پایگاه داده شخص ثالث</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/embed" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
              ویجت وب
              <ArrowUpRight className="w-3 h-3" />
            </Link>
            <Link href="/contribute" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
              افزودن مدخل
              <ArrowUpRight className="w-3 h-3" />
            </Link>
            <Link href="/changelog" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
              تاریخچه تغییرات
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
