"use client"

import { useState, useMemo } from "react"
import { METERS } from "@persian-quote/arud"

export interface MetreItem {
  key: string
  name: string
  afail: string
  pattern: string
  signature: string
  description: string
  works: string
}

export const CLASSICAL_METRES: MetreItem[] = [
  {
    key: "mutaqarib-mahzuf",
    name: "متقارب مثمن محذوف",
    afail: "فعولن فعولن فعولن فعل",
    pattern: "U-- U-- U-- U-",
    signature: "شاهنامهٔ فردوسی · بوستان سعدی",
    description: "وزن حماسی و تعلیمی؛ پرکاربردترین بحر در منظومه‌های حماسی و شاهنامه فردوسی.",
    works: "شاهنامه، بوستان، اسکندرنامه",
  },
  {
    key: "mutaqarib-salem",
    name: "متقارب مثمن سالم",
    afail: "فعولن فعولن فعولن فعولن",
    pattern: "U-- U-- U-- U--",
    signature: "سرآغاز منظومه‌های حماسی",
    description: "صورت کامل بحر متقارب بدون حذف هجای پایانی؛ ضرب‌آهنگ متقارن و یکدست.",
    works: "بخش‌هایی از شاهنامه و حماسه‌های کهن",
  },
  {
    key: "hazaj-salem",
    name: "هزج مثمن سالم",
    afail: "مفاعیلن مفاعیلن مفاعیلن مفاعیلن",
    pattern: "U--- U--- U--- U---",
    signature: "غزل ۳ حافظ · خسرو و شیرین نظامی",
    description: "وزن روایی و غنایی؛ بستر اصلی غزل‌های بلند و منظومه‌های عاشقانه نظامی گنجوی.",
    works: "دیوان حافظ، خسرو و شیرین، لیلی و مجنون",
  },
  {
    key: "hazaj-akhrab",
    name: "هزج مثمن اخرب مقبوض محذوف",
    afail: "مفعولن مفاعلن فعولن",
    pattern: "--U- U-U- U--",
    signature: "رباعیات خیام · دوبیتی‌های باباطاهر",
    description: "بحر اختصاصی رباعی و دوبیتی‌های فهلوی با هجاهای ضربی و پایان کوتاه.",
    works: "رباعیات خیام، دوبیتی‌های باباطاهر، رباعیات عطار",
  },
  {
    key: "ramal-mahzuf",
    name: "رمل مثمن محذوف",
    afail: "فاعلاتن فاعلاتن فاعلاتن فاعلن",
    pattern: "-U-- -U-- -U-- -U-",
    signature: "غزل ۲۹۶ حافظ · غزلیات سعدی",
    description: "پرمصرف‌ترین بحر غزل کلاسیک فارسی پس از هزج؛ وزنی روان، رقصان و عاشقانه.",
    works: "دیوان حافظ، دیوان شمس، غزلیات سعدی",
  },
  {
    key: "ramal-makhbon",
    name: "رمل مثمن مخبون محذوف",
    afail: "فعولاتن فعولاتن فعولاتن فعلن",
    pattern: "UU-- UU-- UU-- UU-",
    signature: "مثنوی معنوی مولانا · منطق‌الطیر عطار",
    description: "وزن مثنوی عرفانی با خبن در پای نخست؛ مناسب بازگویی حکایات و اندیشه‌های معنوی.",
    works: "مثنوی معنوی، منطق‌الطیر، ویس و رامین",
  },
  {
    key: "ramal-salem",
    name: "رمل مثمن سالم",
    afail: "فاعلاتن فاعلاتن فاعلاتن فاعلاتن",
    pattern: "-U-- -U-- -U-- -U--",
    signature: "قصاید تعلیمی و اشعار حکمی",
    description: "صورت چهارپایه سالم بحر رمل؛ طنین گسترده و فاخر در قصاید و اشعار تعلیمی.",
    works: "قصاید سنایی، ناصرخسرو و خاقانی",
  },
  {
    key: "mojtass-makhbon",
    name: "مجتث مثمن مخبون محذوف",
    afail: "مفعولن فاعلاتن مفعولن فاعلن",
    pattern: "--U- -U-- --U- -U-",
    signature: "غزل ۲ حافظ (صلاح کار کجا)",
    description: "بحر غزل‌های پرشور با آغاز ضربی و ترکیب متناوب ارکان؛ موسیقی درونی غنی.",
    works: "دیوان حافظ، دیوان خواجو، غزلیات صائب",
  },
  {
    key: "mozare-makhbon",
    name: "مضارع مثمن اخرب مکفوف",
    afail: "مفعولن فاعلاتن مفعولن فاعلاتن",
    pattern: "--U- -U-- --U- -U--",
    signature: "قطعات عرفانی و اشعار عاشقانه",
    description: "از زیباترین اوزان غزل فارسی با دو پایه متناوب و پایان کشیده و آرام‌بخش.",
    works: "غزلیات شمس، دیوان حافظ، قصاید سنایی",
  },
  {
    key: "khafif-makhbon",
    name: "خفیف مثمن مخبون محذوف",
    afail: "فاعلاتن مفاعیلن فاعلن",
    pattern: "-U-- U--- -U-",
    signature: "حدیقةالحقیقه سنایی · هفت‌پیکر نظامی",
    description: "وزن مراثی و منظومه‌های فکری؛ ریتمی محزون، کشیده و عمیق.",
    works: "حدیقةالحقیقه، هفت‌پیکر، مراثی سعدی",
  },
  {
    key: "rajaz-salem",
    name: "رجز مثمن سالم",
    afail: "مستفعلن مستفعلن مستفعلن مستفعلن",
    pattern: "--U- --U- --U- --U-",
    signature: "ای ساربان آهسته ران (سعدی)",
    description: "بحر رجز متقارن؛ ضرب‌آهنگ محکم، طبل‌مانند و حماسی در غزل و قصیده.",
    works: "غزلیات سعدی، منظومه‌های علمی کهن",
  },
  {
    key: "sari-matvi",
    name: "سریع مثمن مطوی",
    afail: "مستفعلن مفتعلن مستفعلن مفتعلن",
    pattern: "--U- --U- --U- --U-",
    signature: "مخزن‌الاسرار نظامی گنجوی",
    description: "طی در پای دوم؛ ریتم تند، کوبنده و پرانرژی در منظومه‌های اخلاقی و عرفانی.",
    works: "مخزن‌الاسرار، تحفةالاحرار جامی",
  },
]

export function MetreWheel() {
  const [selectedIdx, setSelectedIdx] = useState(0)

  const activeMetre = CLASSICAL_METRES[selectedIdx] || CLASSICAL_METRES[0]!

  // Generate SVG circular sectors (12 segments around 200, 200)
  const sectors = useMemo(() => {
    const cx = 200
    const cy = 200
    const rOut = 186
    const rIn = 112
    const n = CLASSICAL_METRES.length
    const gap = 0.012

    return CLASSICAL_METRES.map((m, i) => {
      const a0 = (i / n) * Math.PI * 2 - Math.PI / 2
      const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2

      const p = (r: number, a: number) => [
        cx + Math.cos(a) * r,
        cy + Math.sin(a) * r,
      ]

      const [x0, y0] = p(rOut, a0 + gap)
      const [x1, y1] = p(rOut, a1 - gap)
      const [x2, y2] = p(rIn, a1 - gap)
      const [x3, y3] = p(rIn, a0 + gap)

      const pathData = `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${rOut} ${rOut} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} A ${rIn} ${rIn} 0 0 0 ${x3.toFixed(1)} ${y3.toFixed(1)} Z`

      const midAngle = (a0 + a1) / 2
      const labelRadius = rOut + 18
      const lx = cx + Math.cos(midAngle) * labelRadius
      const ly = cy + Math.sin(midAngle) * labelRadius
      const rotDeg = (midAngle * 180) / Math.PI + 90

      // Rhythm dot positions
      const patternChars = m.pattern.replace(/[^U-]/g, "")
      const dots = []
      for (let d = 0; d < patternChars.length; d++) {
        const at = a0 + ((d + 0.5) / patternChars.length) * (a1 - a0)
        const rr = (rIn + rOut) / 2
        dots.push({
          x: cx + Math.cos(at) * rr,
          y: cy + Math.sin(at) * rr,
          isShort: patternChars[d] === "U",
        })
      }

      return {
        idx: i,
        pathData,
        lx,
        ly,
        rotDeg,
        dots,
        shortLabel: m.name.split(" ")[0] || m.name,
      }
    })
  }, [])

  return (
    <section id="metres" className="py-14 md:py-20 px-4 border-b border-border bg-muted/10">
      <div className="container mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="max-w-2xl mb-10 text-right" dir="rtl">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-amber-600 dark:text-amber-400 uppercase mb-2">
            <span>۰۱</span>
            <span className="w-8 h-px bg-amber-500/40"></span>
            <span>چرخ بحور عروضی</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 font-naskh text-foreground">
            بحور کلاسیک عروض فارسی، روی صفحهٔ تعاملی
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            جدول تعاملی ۱۲ بحر اصلی شعر فارسی با افاعیل، الگوی هجایی و شواهد دیوانی. هر بخش از چرخ یا فهرست را برگزینید تا مشخصات و شاهکارهای سروده‌شده در آن وزن را مشاهده کنید.
          </p>
        </div>

        {/* Wheel & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" dir="rtl">
          {/* Wheel SVG */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-square">
              <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible select-none">
                {/* Background Guide Circles */}
                <circle cx="200" cy="200" r="196" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-border/60" />
                <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 7" className="text-border/80" />
                <circle cx="200" cy="200" r="112" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-border" />

                {/* Interactive Sectors */}
                {sectors.map((sec) => {
                  const isSelected = sec.idx === selectedIdx
                  return (
                    <g
                      key={sec.idx}
                      onClick={() => setSelectedIdx(sec.idx)}
                      className="cursor-pointer transition-all"
                    >
                      <path
                        d={sec.pathData}
                        fill={isSelected ? "rgba(245, 158, 11, 0.28)" : "rgba(120, 113, 108, 0.08)"}
                        stroke={isSelected ? "#f59e0b" : "currentColor"}
                        strokeWidth={isSelected ? 1.8 : 0.8}
                        className={`transition-colors ${isSelected ? "text-amber-500" : "text-border hover:fill-amber-500/15"}`}
                      />

                      {/* Rhythm Dots */}
                      {sec.dots.map((d, di) => (
                        <circle
                          key={di}
                          cx={d.x.toFixed(1)}
                          cy={d.y.toFixed(1)}
                          r={d.isShort ? 2.0 : 3.2}
                          fill={isSelected ? "#f59e0b" : "#14b8a6"}
                          opacity={isSelected ? 0.95 : 0.6}
                          className="pointer-events-none transition-colors"
                        />
                      ))}

                      {/* Sector Perimeter Label */}
                      <text
                        x={sec.lx.toFixed(1)}
                        y={sec.ly.toFixed(1)}
                        transform={`rotate(${sec.rotDeg.toFixed(1)} ${sec.lx.toFixed(1)} ${sec.ly.toFixed(1)})`}
                        textAnchor="middle"
                        className={`text-[10px] font-sans pointer-events-none transition-colors ${
                          isSelected ? "fill-amber-400 font-bold" : "fill-muted-foreground"
                        }`}
                      >
                        {sec.shortLabel}
                      </text>
                    </g>
                  )
                })}
              </svg>

              {/* Center Core Display */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[52%] text-center p-2 rounded-full space-y-1">
                  <div className="text-base sm:text-lg font-bold font-naskh text-amber-500 dark:text-amber-400 leading-tight">
                    {activeMetre.name}
                  </div>
                  <div className="text-xs font-mono text-teal-600 dark:text-teal-400" dir="ltr">
                    {activeMetre.pattern}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-sans line-clamp-2">
                    {activeMetre.afail}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Meter List */}
          <div className="lg:col-span-6 space-y-2 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
            {CLASSICAL_METRES.map((m, idx) => {
              const isSelected = idx === selectedIdx
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-full text-right p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? "border-amber-500 bg-amber-500/10 shadow-xs"
                      : "border-border bg-card/60 hover:bg-card hover:border-border/80"
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? "bg-amber-500" : "bg-muted-foreground/40"}`}></span>
                      <span className="font-bold text-xs sm:text-sm text-foreground font-naskh truncate">
                        {m.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {m.signature}
                    </div>
                  </div>

                  <div className="text-left shrink-0 font-mono text-[11px] text-teal-600 dark:text-teal-400" dir="ltr">
                    {m.pattern}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Meter Full Showcase Card */}
        <div className="mt-8 p-5 rounded-2xl border border-border bg-card/90 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs" dir="rtl">
          <div className="space-y-1">
            <span className="text-muted-foreground block font-medium">افاعیل عروضی (تفاعیل):</span>
            <span className="text-sm font-bold text-foreground font-naskh block">
              {activeMetre.afail}
            </span>
            <span className="text-muted-foreground font-mono text-[11px] block" dir="ltr">
              {activeMetre.pattern}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground block font-medium">آثار و منظومه‌های شاخص:</span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block font-naskh">
              {activeMetre.works}
            </span>
            <span className="text-muted-foreground text-[11px] block">
              {activeMetre.signature}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-muted-foreground block font-medium">توصیف کاربرد ادبی و لحن:</span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              {activeMetre.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
