"use client"

import { Button } from "@/components/ui/button"
import { Download, BookOpen, GraduationCap, ArrowUpRight } from "lucide-react"

export interface SyllabusWeek {
  week: string
  title: string
  tool: string
  output: string
}

const SYLLABUS_WEEKS: SyllabusWeek[] = [
  {
    week: "۰۱",
    title: "معرفی پیکره، ساختار داده و رسم‌الخط اصیل دیوان‌ها",
    tool: "کاوش پیکره و جستجوی اشعار",
    output: "corpus-export.tsv",
  },
  {
    week: "۰۲",
    title: "مبانی عروض رایانشی: هجا، کمّیت، ارکان و صامت‌بندی",
    tool: "تقطیع هجایی مصراع به مصراع",
    output: "scansion-worksheet.pdf",
  },
  {
    week: "۰۳",
    title: "بحر متقارب و وزن حماسی شاهنامه فردوسی",
    tool: "چرخ بحور و آزمون عروضی",
    output: "mutaqarib-quiz.gift",
  },
  {
    week: "۰۴",
    title: "بحر رمل و موسیقی غزل حافظ شیرازی",
    tool: "کالبدشکافی عروضی غزل ۲۹۶",
    output: "ramal-analysis.gift",
  },
  {
    week: "۰۵",
    title: "شناسایی خودکار قافیه، ردیف و حروف رَوی",
    tool: "موتور تشخیص ردیف و همنشینی",
    output: "concordance.tsv",
  },
  {
    week: "۰۶",
    title: "هجابندی پیشرفته: قاعده وصل همزه، اشباع و هجاهای کشیده",
    tool: "موتور عروض و رأی‌گیری سطح شعر",
    output: "arud-report.json",
  },
  {
    week: "۰۷",
    title: "آزمون میان‌ترم — طراحی خودکار سؤالات از دیوان‌ها",
    tool: "آزمون‌ساز دانشگاهی LMS",
    output: "midterm-quiz.xml (Moodle)",
  },
  {
    week: "۰۸",
    title: "نسخه‌شناسی و اصول تصحیح متن انتقادی",
    tool: "مقابله نسخ خطی ۳ گانه",
    output: "witness-apparatus.tei.xml",
  },
  {
    week: "۰۹",
    title: "استاندارد TEI-P5 و کدگذاری متون ادبی",
    tool: "ویرایش مستقیم شاهدها و صدور TEI",
    output: "tei-corpus-p5.xml",
  },
  {
    week: "۱۰",
    title: "زبان‌شناسی رایانشی: نرمال‌سازی و توکنایز متن فارسی",
    tool: "کنسول زنده و اندپوینت search",
    output: "nlp-pipeline.ipynb",
  },
  {
    week: "۱۱",
    title: "نمایه واژگانی در بافت (KWIC) و همنشینی واژگان",
    tool: "نمایه در بافت با پنجره تنظیم‌پذیر",
    output: "kwic-lexicon.tsv",
  },
  {
    week: "۱۲",
    title: "سبک‌سنجی آماری، نسبت تیپ به توکن (TTR) و بوروز دلتا",
    tool: "ماتریس فاصله دلتا و بن‌واژه‌سازی",
    output: "stylometry-matrix.json",
  },
  {
    week: "۱۳",
    title: "بیت‌یابی در متون مخدوش، انتحال‌سنجی و ردیابی پژواک",
    tool: "بیت‌یاب مخدوش هیبریدی BM25F",
    output: "verse-similarity.csv",
  },
  {
    week: "۱۴",
    title: "ارائه پروژه نهایی پژوهشی و استناد علمی استاندارد",
    tool: "مولد استناد APA / BibTeX / CSL",
    output: "final-bibliography.bib",
  },
]

export function AcademicSyllabus() {
  const handleDownloadMarkdown = () => {
    let md = `# طرح درس ۱۴ هفته‌ای ادبیات رایانشی و عروض فارسی\n\n> منبع: پایگاه داده و پیکره شعر فارسی (pq.adicon.ir) · نسخه ۳.۳۴.۰ · پروانه آزاد MIT\n\n| هفته | سرفصل آموزشی | ابزار میزکار پژوهشی | خروجی استاندارد دانشجو |\n|:---:|:---|:---|:---|\n`
    for (const row of SYLLABUS_WEEKS) {
      md += `| ${row.week} | ${row.title} | ${row.tool} | \`${row.output}\` |\n`
    }
    md += `\n## نظام ارزیابی دانشگاهی\n- **آزمون میان‌ترم (هفته ۰۷)**: صدور خودکار سؤالات تستی و جای خالی در قالب Moodle XML — ۲۵٪\n- **پروژه مقابله نسخ (هفته ۰۹)**: آماده‌سازی نسخه بدل‌ها و خروجی استاندارد TEI-P5 XML — ۲۵٪\n- **پژوهش پایانی و سبک‌سنجی (هفته ۱۴)**: تحلیل سبک‌شناختی دیوان به همراه استناد پایدار BibTeX — ۵۰٪\n`

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "syllabus-arud-14weeks.md"
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      URL.revokeObjectURL(url)
      a.remove()
    }, 200)
  }

  return (
    <section id="semester" className="py-14 md:py-20 px-4 border-b border-border">
      <div className="container mx-auto max-w-5xl text-right" dir="rtl">
        {/* Section Header */}
        <div className="max-w-2xl mb-8">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-amber-600 dark:text-amber-400 uppercase mb-2">
            <span>۰۵</span>
            <span className="w-8 h-px bg-amber-500/40"></span>
            <span>طرح درس دانشگاهی</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 font-naskh text-foreground">
            یک طرح درس ۱۴ هفته‌ای، آمادهٔ اجرای کلاسی
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            نگاشت هفته‌به‌هفتهٔ ابزارهای میزکار به سرفصل‌های دروس «عروض و قافیه»، «متن‌پژوهی و تصحیح نسخ» و «زبان‌شناسی رایانشی فارسی». هر هفته خروجی مشخصی دارد که دانشجو می‌تواند مستقیماً در سامانه آموزش مجازی بارگذاری کند.
          </p>
        </div>

        {/* Syllabus Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground text-[11px] font-mono">
                  <th className="p-3 text-center w-16">هفته</th>
                  <th className="p-3 font-sans font-semibold text-foreground">سرفصل آموزشی و پژوهشی</th>
                  <th className="p-3 font-sans font-semibold text-foreground">ابزار میزکار تعاملی</th>
                  <th className="p-3 font-sans font-semibold text-foreground text-left" dir="ltr">
                    خروجی دوره (LMS / File)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {SYLLABUS_WEEKS.map((w) => (
                  <tr key={w.week} className="hover:bg-muted/15 transition-colors">
                    <td className="p-3 text-center font-mono text-amber-600 dark:text-amber-400 font-bold text-xs">
                      هفته {w.week}
                    </td>
                    <td className="p-3 font-medium text-foreground">
                      {w.title}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs font-sans">
                      {w.tool}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-teal-600 dark:text-teal-400 text-left" dir="ltr">
                      {w.output}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <a href="#workspace-section">
            <Button size="sm" className="gap-2 text-xs h-9">
              <GraduationCap className="w-4 h-4" />
              <span>باز کردن ابزارهای کارگاه دانشگاهی</span>
            </Button>
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadMarkdown}
            className="gap-2 text-xs h-9 bg-card"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>بارگیری فایل طرح درس (Markdown)</span>
          </Button>
          <a href="/docs">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-9 text-muted-foreground hover:text-foreground">
              <BookOpen className="w-3.5 h-3.5" />
              <span>اتصال سامانهٔ دانشگاهی به API</span>
              <ArrowUpRight className="w-3 h-3" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}
