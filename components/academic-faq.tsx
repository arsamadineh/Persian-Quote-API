"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface FaqItem {
  question: string
  answer: string
}

const FAQS: FaqItem[] = [
  {
    question: "آیا برای استفادهٔ کلاسی و دانشگاهی باید ثبت‌نام کنیم یا کلید API بگیریم؟",
    answer: "خیر. تمامی اندپوینت‌ها و ابزارهای میزکار کاملاً عمومی و آزاد هستند. هیچ توکن احراز هویت، کلید اختصاصی یا سقف پرداختی وجود ندارد. برای یک کلاس ۴۰ نفره که همگی از IP پردیس یا دانشگاه متصل می‌شوند، محدودیت ۱۲۰ درخواست در دقیقه برای هر IP کاملاً پاسخگوی نیازهای پژوهشی و آموزشی است.",
  },
  {
    question: "دقت موتور عروض چقدر است و چگونه در پژوهش گزارش می‌شود؟",
    answer: "موتور عروض arud از هم‌ترازی کمینه‌هزینه، واژگان‌نامه وزنی و رأی‌گیری سطح شعر بهره می‌گیرد. صحت‌سنجی بحر تنها در صورتی که ضریب اطمینان بالای ۰.۸ باشد اعلام می‌شود؛ در غیر این صورت نتیجه به همراه فهرست کاندیداها و درجه شباهت برگردانده می‌شود تا پژوهشگر بتواند موارد استثنا یا نسخه‌بدل‌ها را به صورت دستی بررسی کند.",
  },
  {
    question: "قاعدهٔ وصل همزه و هجاهای کشیده چگونه مدیریت می‌شوند؟",
    answer: "هجابندی با ترکیب واژگان‌نامه تلفظی و قواعد فونولوژیک انجام می‌گیرد و قاعده وصل همزه (مانند «کزین» و پیوند صامت پایانی به مصوت آغازی کلمه بعد)، اشباع هجا و هجاهای کشیده سه و چهار حرفی به صورت صریح مدل شده‌اند. اصالت رسم‌الخط نسخه‌ها ۱۰۰٪ حفظ می‌شود و تغییرات صرفاً در لایه تحلیلی عروض اعمال می‌گردند.",
  },
  {
    question: "خروجی آزمون را چطور وارد سامانه مودل (Moodle) کنیم؟",
    answer: "از تب «آزمون و طرح درس» در میزکار دانشگاهی استفاده کنید. قالب Moodle XML یا GIFT را برگزینید و فایل را بارگیری کنید. سپس در سامانه مودل به بخش Question bank رفته و با انتخاب Import، فایل بارگیری‌شده را مستقیماً درون‌ریزی نمایید. سؤالات چهارگزینه‌ای با امتیاز ۱۰۰٪ و سؤالات کوتاه با انعطاف بالا تنظیم می‌شوند.",
  },
  {
    question: "آیا امکان درون‌ریزی پیکره خصوصی و کار برون‌خط وجود دارد؟",
    answer: "بله. میزکار تعاملی به گونه‌ای طراحی شده که پژوهشگر می‌تواند متن یا ابیات مدنظر خود را مستقیماً در بخش‌های مختلف (عروض، مقابله نسخ و بیت‌یاب) وارد نموده و بدون وابستگی به سرور خارجی پردازش کند. تنظیمات و داده‌های واردشده به صورت امن در حافظه مرورگر باقی می‌مانند.",
  },
  {
    question: "استناد علمی استاندارد چگونه ساخته می‌شود؟",
    answer: "هر اثر در پیکره دارای شناسه پایدار و یکتا است (مانند hafez.ghazaliat.296). ابزار استناد، ارجاعات را در قالب‌های APA 7، Chicago 17، MLA 9، BibTeX و CSL-JSON همراه با تاریخ دسترسی و شماره بیت دقیق تولید می‌کند که مستقیماً در نرم‌افزارهای Zotero و LaTeX قابل استفاده است.",
  },
  {
    question: "آیا خروجی TEI برای پایان‌نامه‌های تصحیح انتقادی نسخ مناسب است؟",
    answer: "بله. ابزار مقابله نسخ، شاهدها را با ساختار msDesc و تفاوت‌های ضبط نسخ را با تگ‌های معتبر app و rdg بر اساس ویرایش پنجم استاندارد TEI-P5 صادر می‌کند. این خروجی مستقیماً در نرم‌افزارهای تخصصی تصحیح و تحلیل متنی نظیر Oxygen XML معتبر است.",
  },
  {
    question: "پروژه تحت چه مجوزی منتشر شده و چگونه می‌توان مشارکت کرد؟",
    answer: "کد منبع پروژه تحت پروانه متن‌باز MIT منتشر شده و متون کهن ادبی در مالکیت عمومی (Public Domain) قرار دارند. برای مشارکت در تصحیح دیوان‌ها یا توسعه الگوریتم‌ها می‌توانید به صفحه مشارکت سر بزنید یا از طریق مخزن گیت‌هاب پول‌ریکوئست ارسال کنید.",
  },
]

export function AcademicFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx)
  }

  return (
    <section id="faq" className="py-14 md:py-20 px-4 border-b border-border bg-muted/10">
      <div className="container mx-auto max-w-4xl text-right" dir="rtl">
        {/* Section Header */}
        <div className="max-w-2xl mb-8">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-amber-600 dark:text-amber-400 uppercase mb-2">
            <span>۰۶</span>
            <span className="w-8 h-px bg-amber-500/40"></span>
            <span>پرسش‌های متداول</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 font-naskh text-foreground">
            پیش از آغاز ترم تحصیلی و کار پژوهشی
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            پاسخ به متداول‌ترین پرسش‌های اساتید، دانشجویان ادبیات و پژوهشگران پردازش زبان طبیعی درباره اعتبارسنجی علمی، دسترسی رایگان و قالب‌های استاندارد.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border/60 shadow-2xs">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx
            return (
              <div key={idx} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-right hover:bg-muted/20 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-xs sm:text-sm text-foreground font-naskh leading-relaxed">
                    {faq.question}
                  </span>
                  <div className={`p-1 rounded-md text-muted-foreground transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-primary" : ""}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 pt-1 sm:px-5 text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans border-t border-border/30 bg-muted/10">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
