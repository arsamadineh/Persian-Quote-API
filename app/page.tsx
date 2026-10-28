"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Code2,
  Copy,
  Check,
  Database,
  ArrowUpRight,
  GraduationCap,
  Scale,
  Search,
  FileCheck,
  Zap,
  Type,
  Play,
  Feather,
} from "lucide-react"
import Link from "next/link"
import { AcademicWorkbench } from "@/components/academic-workbench"
import { HeroAruzInstrument } from "@/components/hero-aruz-instrument"
import { MetreWheel } from "@/components/metre-wheel"
import { AcademicSyllabus } from "@/components/academic-syllabus"
import { AcademicFaq } from "@/components/academic-faq"
import { ScrollEnhancements } from "@/components/scroll-enhancements"

function toPersianDigits(num: number | string): string {
  return String(num).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)] || d)
}

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
  const [liveOutput, setLiveOutput] = useState<string | null>(null)
  const [latencyMs, setLatencyMs] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const apiTabs: ApiTabItem[] = [
    {
      title: "دیوان حافظ (غزل ۲۹۶)",
      endpoint: "/api/quotes/hafez?id=296",
      description: "دسترسی مستقیم به ۴۹۷ غزل مدون دیوان حافظ بر پایه تصحیح قزوینی-غنی با تفکیک دقیق ابیات و مصراع‌ها.",
      params: [
        { name: "id", type: "number", required: "اختیاری", desc: "شماره غزل بر اساس نسخه قزوینی-غنی (۱ تا ۴۹۷)" },
        { name: "random", type: "boolean", required: "اختیاری", desc: "انتخاب تصادفی یک غزل از دیوان" },
        { name: "q", type: "string", required: "اختیاری", desc: "فیلتر بر اساس واژگان متن غزل" },
      ],
      response: `{\n  "success": true,\n  "data": [\n    {\n      "id": 296,\n      "verses": [\n        ["در وفای عشق تو مشهور خوبانم چو شمع", "شب‌نشین کوی سربازان و رندانم چو شمع"],\n        ["روز و شب خوابم نمی‌آید به چشم غم‌پرست", "بس که در بیماری هجر تو گریانم چو شمع"]\n      ],\n      "poet": "حافظ شیرازی",\n      "source": "دیوان حافظ"\n    }\n  ],\n  "count": 1,\n  "total": 497\n}`,
    },
    {
      title: "جستجوی متنی اشعار",
      endpoint: "/api/quotes/search?q=شیراز&limit=2",
      description: "جستجوی چندکلمه‌ای در متن، نام شاعر، عنوان اثر و دیوان‌ها با رتبه‌بندی بسامدی BM25F.",
      params: [
        { name: "q", type: "string", required: "الزامی", desc: "عبارت یا واژگان مورد نظر برای جستجو" },
        { name: "limit", type: "number", required: "اختیاری", desc: "تعداد رکوردهای بازگشتی (پیش‌فرض ۱۰، بیشینه ۱۰۰)" },
        { name: "page", type: "number", required: "اختیاری", desc: "شماره صفحه برای صفحه‌بندی" },
      ],
      response: `{\n  "success": true,\n  "data": [\n    {\n      "id": "h-3",\n      "kind": "hafez",\n      "text_persian": "اگر آن ترک شیرازی به دست آرد دل ما را\\nبه خال هندویش بخشم سمرقند و بخارا را",\n      "poet": "حافظ شیرازی",\n      "poet_english": "Hafez",\n      "source": "دیوان حافظ",\n      "category": "غزل",\n      "tags": ["حافظ", "غزل", "شیراز"]\n    }\n  ],\n  "count": 2,\n  "total": 48,\n  "page": 1,\n  "limit": 2\n}`,
    },
    {
      title: "شعر معاصر و نو",
      endpoint: "/api/quotes/shereno?poet=سهراب سپهری&limit=1",
      description: "بیش از ۴۰۰۰ قطعه شعر معاصر با ساختار مصراع‌های آزاد از نیما یوشیج، اخوان ثالث، شاملو، فروغ و سپهری.",
      params: [
        { name: "poet", type: "string", required: "اختیاری", desc: "نام شاعر نو (پشتیبانی از جستجوی فازی و معادل انگلیسی)" },
        { name: "title", type: "string", required: "اختیاری", desc: "عنوان شعر یا بند مدنظر" },
        { name: "limit", type: "number", required: "اختیاری", desc: "تعداد رکوردهای بازگشتی" },
      ],
      response: `{\n  "success": true,\n  "data": [\n    {\n      "id": "sn-204",\n      "title": "صدای پای آب",\n      "poem": "اهل کاشانم / روزگارم بد نیست / تکه نانی دارم، خرده هوشی، سر سوزن ذوقی",\n      "poet": "سهراب سپهری",\n      "book": "هشت کتاب"\n    }\n  ],\n  "count": 1,\n  "total": 4000\n}`,
    },
    {
      title: "نسخه کامل اثر (v1/works)",
      endpoint: "/v1/works/hafez.ghazaliat.296?view=full",
      description: "بازیابی پرونده کامل نسخه‌شناختی اثر شامل ابیات، وزن عروضی، قافیه، ردیف و گواهی اصالت متن.",
      params: [
        { name: "view", type: "string", required: "اختیاری", desc: "حالت نمایش: full برای دریافت تمامی ابیات و فراداده عروضی" },
      ],
      response: `{\n  "id": "hafez.ghazaliat.296",\n  "title": "غزل ۲۹۶",\n  "poet_name": "حافظ شیرازی",\n  "collection_title": "دیوان حافظ",\n  "radif": "چو شمع",\n  "qafiyeh": "خوبانم، رندانم، گریانم",\n  "stanzas": [\n    ["در وفای عشق تو مشهور خوبانم چو شمع", "شب‌نشین کوی سربازان و رندانم چو شمع"]\n  ]\n}`,
    },
  ]

  const handleCopy = () => {
    const fullUrl = `${window.location.origin}${apiTabs[activeTab].endpoint}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRunLive = async () => {
    setIsLoading(true)
    const t0 = performance.now()
    try {
      const res = await fetch(apiTabs[activeTab].endpoint)
      const json = await res.json()
      const elapsed = Math.max(1, Math.round(performance.now() - t0))
      setLatencyMs(elapsed)
      setLiveOutput(JSON.stringify(json, null, 2))
    } catch {
      setLiveOutput(apiTabs[activeTab].response)
    } finally {
      setIsLoading(false)
    }
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
              setLiveOutput(null)
              setLatencyMs(null)
            }}
            className={`px-3.5 py-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
              activeTab === idx
                ? "border-primary text-foreground bg-muted/40 font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* نوار آدرس، اجرای زنده و کپی */}
      <div className="flex flex-wrap items-center gap-2 bg-muted/30 p-2.5 rounded-lg border border-border">
        <Badge variant="outline" className="font-mono text-[11px] px-2 py-0.5 bg-background font-semibold shrink-0">
          GET
        </Badge>
        <div className="flex-1 overflow-x-auto font-mono text-xs md:text-sm text-left py-0.5 select-all" dir="ltr">
          <span className="text-muted-foreground">{origin}</span>
          <span className="text-foreground font-semibold">{apiTabs[activeTab].endpoint}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="default"
            size="sm"
            className="h-8 text-xs gap-1.5 px-3"
            onClick={handleRunLive}
            disabled={isLoading}
          >
            <Play className="w-3 h-3" />
            <span>{isLoading ? "در حال دریافت..." : "اجرای زنده"}</span>
          </Button>
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
            <span>application/json; charset=utf-8</span>
            <div className="flex items-center gap-2">
              {latencyMs !== null && (
                <span className="text-emerald-400 font-sans">
                  پاسخ زنده ({toPersianDigits(latencyMs)} میلی‌ثانیه)
                </span>
              )}
              <span>200 OK</span>
            </div>
          </div>
          <pre className="p-3.5 font-mono text-xs overflow-auto text-left leading-relaxed max-h-[340px] bg-stone-950 text-stone-200" dir="ltr">
            <code>{liveOutput ?? apiTabs[activeTab].response}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}

const FEATURED_WORKS = [
  {
    id: "hafez.ghazaliat.296",
    title: "غزل ۲۹۶ دیوان حافظ",
    poet: "حافظ شیرازی",
    meter: "بحر رمل مثمن محذوف",
    radif: "چو شمع",
    firstBeyt: [
      "در وفای عشق تو مشهور خوبانم چو شمع",
      "شب‌نشین کوی سربازان و رندانم چو شمع",
    ],
  },
  {
    id: "hafez.ghazaliat.2",
    title: "غزل ۲ دیوان حافظ",
    poet: "حافظ شیرازی",
    meter: "بحر مجتث مثمن مخبون محذوف",
    radif: "کجاست",
    firstBeyt: [
      "صلاح کار کجا و من خراب کجا",
      "ببین تفاوت ره کز کجاست تا به کجا",
    ],
  },
  {
    id: "hafez.ghazaliat.3",
    title: "غزل ۳ دیوان حافظ",
    poet: "حافظ شیرازی",
    meter: "بحر هزج مثمن سالم",
    radif: "را",
    firstBeyt: [
      "اگر آن ترک شیرازی به دست آرد دل ما را",
      "به خال هندویش بخشم سمرقند و بخارا را",
    ],
  },
]

export default function HomePage() {
  const [workspaceMode, setWorkspaceMode] = useState<"academic" | "api">("academic")
  const [showcaseFont, setShowcaseFont] = useState<"naskh" | "nastaliq" | "kufi" | "vazirmatn">("naskh")

  const stats = [
    { label: "مجموع ابیات و آثار مدون", value: "۶،۹۹۶+" },
    { label: "شاعران کهن و معاصر", value: "۴۵" },
    { label: "حفظ اصالت متن (R4)", value: "۱۰۰٪" },
    { label: "تأخیر پاسخ درون‌حافظه‌ای", value: "زیر ۱ میلی‌ثانیه" },
  ]

  const technicalSpecs = [
    {
      title: "عروض رایانشی و تقطیع هجایی",
      desc: "هجابندی خودکار اوزان شعر فارسی بر اساس بحور کلاسیک، قاعده وصل همزه و تشخیص هجاهای کشیده، بدون تغییر در رسم‌الخط اصیل دیوان‌ها.",
      icon: Scale,
    },
    {
      title: "استناد علمی استاندارد (APA, BibTeX, CSL)",
      desc: "تولید خودکار کدهای استناد علمی با شناسه‌های یکتا و پایدار برای مقالات پژوهشی، پایان‌نامه‌ها و نرم‌افزارهای مدیریت مراجع.",
      icon: FileCheck,
    },
    {
      title: "هسته درون‌حافظه‌ای تیغ (Tigh Engine)",
      desc: "مسیریاب درختی، حافظه پنهان چندسطحی و محدودکننده نرخ درخواست بدون وابستگی به پایگاه داده خارجی در مسیر بحرانی.",
      icon: Zap,
    },
    {
      title: "آزمون‌ساز دانشگاهی و مقابله نسخ (TEI XML)",
      desc: "طراحی خودکار سؤالات جای خالی ردیف و تشخیص بحر با صدور به Moodle XML و GIFT، همراه با ابزار مقابله نسخ خطی.",
      icon: GraduationCap,
    },
  ]

  const showcaseFontClass =
    showcaseFont === "naskh"
      ? "font-naskh"
      : showcaseFont === "nastaliq"
      ? "font-nastaliq"
      : showcaseFont === "kufi"
      ? "font-kufi"
      : "font-vazirmatn"

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <ScrollEnhancements />

      {/* سربرگ معرفی (Hero Section) */}
      <section className="border-b border-border py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/30 text-xs text-muted-foreground mb-5">
            <Feather className="w-3.5 h-3.5 text-primary" />
            <span>پیکره متنی استاندارد شعر کلاسیک و معاصر فارسی — مجهز به موتور عروض و نسخه‌پژوهی</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-5 leading-tight font-naskh">
            رابط برنامه‌نویسی و میزکار پژوهشی ادبیات فارسی
          </h1>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
            بستر آزاد، رایگان و ساختاریافته برای بازیابی، تقطیع عروضی، مقابله نسخ و پردازش شعر کهن و معاصر فارسی.
            طراحی‌شده برای اساتید و دانشجویان ادبیات، پژوهشگران زبان‌شناسی رایانشی و توسعه‌دهندگان وب.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <a href="#workspace-section" onClick={() => setWorkspaceMode("academic")}>
              <Button size="default" className="text-sm px-5 py-2 h-10 gap-2">
                <GraduationCap className="w-4 h-4" />
                کارگاه دانشگاهی و عروض
              </Button>
            </a>
            <a href="#metres">
              <Button variant="outline" size="default" className="text-sm px-4 py-2 h-10 gap-2 bg-background">
                <Scale className="w-4 h-4" />
                گردونهٔ ۱۲ بحر
              </Button>
            </a>
            <a href="#syllabus">
              <Button variant="outline" size="default" className="text-sm px-4 py-2 h-10 gap-2 bg-background">
                <BookOpen className="w-4 h-4" />
                طرح درس دانشگاهی
              </Button>
            </a>
            <Link href="/p/hafez.ghazaliat.296">
              <Button variant="outline" size="default" className="text-sm px-4 py-2 h-10 gap-2 bg-background">
                خوانش دیوانی (غزل ۲۹۶)
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" size="default" className="text-sm px-4 py-2 h-10 gap-2 bg-background">
                <Search className="w-4 h-4" />
                جستجوی اشعار
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="default" className="text-sm px-4 py-2 h-10 gap-2 bg-background">
                <Code2 className="w-4 h-4" />
                مستندات API
              </Button>
            </Link>
          </div>

          {/* ابزار تقطیع هجایی زنده در هیرو (Hero Scansion Instrument) */}
          <div className="my-8 text-right">
            <HeroAruzInstrument />
          </div>

          {/* آمار داده‌ها و اعتبار علمی */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 pt-8 border-t border-border/60">
            {stats.map((s, i) => (
              <div key={i} className="text-center p-3.5 rounded-lg bg-muted/20 border border-border/50">
                <div className="text-lg md:text-xl font-bold text-foreground mb-1">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* چرخ تعاملی ۱۲ بحر کلاسیک شعر فارسی */}
      <section id="metres" className="py-12 md:py-16 px-4 border-b border-border bg-muted/15">
        <div className="container mx-auto max-w-5xl">
          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>موسیقی شعر کلاسیک فارسی</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2 font-naskh">
              گردونهٔ تعاملی ۱۲ بحر کلاسیک عروض فارسی
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              هر بحر عروضی را با قطاع‌های هندسی دایره، ضرب‌آهنگ هجاهای کوتاه (U) و بلند (–)، پایه‌های تفاعیل و نمونه‌های دیوانی کاوش کنید.
            </p>
          </div>

          <MetreWheel />
        </div>
      </section>

      {/* بخش میزکار تعاملی (Interactive Workspace Section) */}
      <section id="workspace-section" className="py-12 md:py-16 px-4 border-b border-border bg-muted/10">
        <div id="academic-tools" className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>میزکار ۸ زبانه پژوهش ادبی</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2 font-naskh">
                کارگاه دانشگاهی عروض، نسخه‌پژوهی و پردازش متنی
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                تقطیع عروضی، مقابله نسخ خطی، استناد علمی، تحلیل آماری سبک‌سنجی و کنسول زنده توسعه‌دهندگان در مرورگر.
              </p>
            </div>

            {/* سوییچر بین مسیر دانشگاه و مسیر مهندسی */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-background border border-border text-xs shrink-0">
              <button
                type="button"
                onClick={() => setWorkspaceMode("academic")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  workspaceMode === "academic"
                    ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>دانشگاه و پژوهش (۸ ابزار)</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceMode("api")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  workspaceMode === "api"
                    ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>کنسول برنامه‌نویسان</span>
              </button>
            </div>
          </div>

          {/* محتوای فعال میزکار */}
          {workspaceMode === "academic" ? (
            <AcademicWorkbench />
          ) : (
            <div className="border border-border rounded-xl bg-card p-4 sm:p-6 shadow-xs">
              <ApiPlayground />
            </div>
          )}
        </div>
      </section>

      {/* طرح درس ۱۴ هفته‌ای دانشگاهی (14-Week Academic Syllabus) */}
      <section id="syllabus" className="py-12 md:py-16 px-4 border-b border-border bg-background">
        <div className="container mx-auto max-w-5xl">
          <AcademicSyllabus />
        </div>
      </section>

      {/* تالار خوانش دیوانی و آزمایشگاه قلم‌های فارسی */}
      <section className="py-12 md:py-16 px-4 border-b border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2 font-naskh">
                تالار خوانش دیوانی و تایپوگرافی اصیل فارسی
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                صفحات اختصاصی هر اثر (`/p/[id]`) با چیدمان دو ستونه دیوانی، تقطیع عروضی تک‌تک ابیات و چهار قلم اصیل فارسی.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground flex items-center gap-1 ml-1">
                <Type className="w-3.5 h-3.5 text-primary" />
                <span>پیش‌نمایش قلم:</span>
              </span>
              <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
                {[
                  { id: "naskh", label: "نسخ ادبی" },
                  { id: "nastaliq", label: "نستعلیق" },
                  { id: "kufi", label: "کوفی" },
                  { id: "vazirmatn", label: "وزیرمتن" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setShowcaseFont(f.id as any)}
                    className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                      showcaseFont === f.id
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURED_WORKS.map((work) => (
              <Link
                key={work.id}
                href={`/p/${work.id}`}
                className="group rounded-xl border border-border bg-card/80 hover:border-primary/40 hover:bg-card p-5 transition-all flex flex-col justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[11px] border-primary/30 text-primary bg-primary/5">
                      {work.poet}
                    </Badge>
                    <span className="text-[11px] font-mono text-muted-foreground" dir="ltr">
                      /p/{work.id}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors font-naskh">
                    {work.title}
                  </h3>

                  <div className={`p-3.5 rounded-lg bg-muted/25 border border-border/60 space-y-2 ${showcaseFontClass}`}>
                    <p
                      className="text-sm sm:text-base text-foreground text-right"
                      style={{ lineHeight: showcaseFont === "nastaliq" ? 2.6 : 2.0 }}
                    >
                      {work.firstBeyt[0]}
                    </p>
                    <p
                      className="text-sm sm:text-base text-foreground/90 text-left"
                      style={{ lineHeight: showcaseFont === "nastaliq" ? 2.6 : 2.0 }}
                    >
                      {work.firstBeyt[1]}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{work.meter}</span>
                  <span className="inline-flex items-center gap-1 text-primary font-medium group-hover:translate-x-[-2px] transition-transform">
                    <span>ورود به صفحه شعر</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* مشخصات فنی و استانداردهای داده */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="max-w-2xl mb-8">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2 font-naskh">
              ویژگی‌های علمی و استانداردهای داده
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              معیارهای طراحی‌شده برای زبان‌شناسی رایانشی، پردازش زبان طبیعی و دوره‌های تحصیلی دانشگاهی.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technicalSpecs.map((item, idx) => {
              const Icon = item.icon
              return (
                <Card key={idx} className="border border-border bg-card/60 shadow-none">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* پرسش‌های متداول اساتید و پژوهشگران (Academic FAQ) */}
      <section id="faq" className="py-12 md:py-16 px-4 border-t border-border bg-muted/15">
        <div className="container mx-auto max-w-4xl">
          <AcademicFaq />
        </div>
      </section>

      {/* نمایه نمونه شعر کلاسه */}
      <section className="py-12 px-4 border-t border-border bg-muted/20">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="p-8 rounded-xl border border-border bg-card shadow-2xs">
            <p className="text-xl md:text-2xl font-medium leading-loose text-foreground mb-4 font-naskh">
              «به نام خداوند جان و خرد
              <br />
              کزین برتر اندیشه برنگذرد»
            </p>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <span>ابوالقاسم فردوسی</span>
              <span>—</span>
              <span>دیباچه شاهنامه (بحر متقارب مثمن محذوف)</span>
            </div>
          </div>
        </div>
      </section>

      {/* بخش پیوندهای پژوهشی و دسترسی مستقیم */}
      <section className="py-10 px-4 border-t border-border">
        <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-foreground" />
            <span>پایگاه داده مستقل درون‌حافظه‌ای بدون وابستگی خارجی به سرورهای ثالث</span>
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
