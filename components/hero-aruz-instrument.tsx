"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { scanHemistich, METERS } from "@persian-quote/arud"

function toPersianDigits(num: number | string): string {
  const p = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
  return String(num).replace(/\d/g, (d) => p[Number(d)] || d)
}

const PRESETS = [
  {
    label: "فردوسی · شاهنامه",
    m1: "به نام خداوند جان و خرد",
    m2: "کزین برتر اندیشه برنگذرد",
    src: "ابوالقاسم فردوسی — دیباچهٔ شاهنامه",
  },
  {
    label: "حافظ · غزل ۲۹۶",
    m1: "در وفای عشق تو مشهور خوبانم چو شمع",
    m2: "شب‌نشین کوی سربازان و رندانم چو شمع",
    src: "حافظ شیرازی — غزل ۲۹۶ دیوان حافظ",
  },
  {
    label: "فردوسی · وصیت",
    m1: "چو ایران نباشد تن من مباد",
    m2: "بدین بوم و بر زنده یک تن مباد",
    src: "ابوالقاسم فردوسی — شاهنامه",
  },
]

function extractRhyme(m1: string, m2?: string) {
  if (!m2 || !m2.trim()) {
    const t1 = m1.trim().split(/\s+/).filter(Boolean)
    const q1 = t1[t1.length - 1] || "—"
    return { redif: "فاقد ردیف", ravi: q1.slice(-2) || q1, q1, q2: "—" }
  }
  const t1 = m1.trim().split(/\s+/).filter(Boolean)
  const t2 = m2.trim().split(/\s+/).filter(Boolean)
  let n = 0
  while (
    n < Math.min(t1.length, t2.length) &&
    t1[t1.length - 1 - n] === t2[t2.length - 1 - n]
  ) {
    n++
  }
  const redif = n > 0 ? t1.slice(t1.length - n).join(" ") : ""
  const q1 = t1[t1.length - 1 - n] || ""
  const q2 = t2[t2.length - 1 - n] || ""

  let ravi = ""
  for (let i = 1; i <= Math.min(q1.length, q2.length); i++) {
    if (q1.slice(-i) === q2.slice(-i)) {
      ravi = q1.slice(-i)
    } else {
      break
    }
  }
  if (!ravi) ravi = q2.slice(-2) || q2

  return {
    redif: redif ? `«${redif}» — مردف` : "فاقد ردیف (غیرمردف)",
    ravi: `«${ravi}»`,
    q1: `«${q1}»`,
    q2: `«${q2}»`,
  }
}

export function HeroAruzInstrument() {
  const [activePreset, setActivePreset] = useState<number | "custom">(0)
  const [customInput, setCustomInput] = useState(PRESETS[0]!.m1)
  const [latencyMs, setLatencyMs] = useState<number | null>(null)

  const activeM1 =
    activePreset === "custom" ? customInput : PRESETS[activePreset]!.m1
  const activeM2 =
    activePreset === "custom" ? "" : PRESETS[activePreset]!.m2
  const activeSrc =
    activePreset === "custom"
      ? "متن واردشده توسط کاربر"
      : PRESETS[activePreset]!.src

  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    startTimeRef.current = performance.now()
  }, [activeM1, activeM2])

  const scan1 = useMemo(() => {
    if (!activeM1.trim()) return null
    return scanHemistich(activeM1)
  }, [activeM1])

  const scan2 = useMemo(() => {
    if (!activeM2.trim()) return null
    return scanHemistich(activeM2)
  }, [activeM2])

  useEffect(() => {
    if (startTimeRef.current > 0) {
      const elapsed = Math.max(1, Math.round(performance.now() - startTimeRef.current))
      setLatencyMs(elapsed)
    }
  }, [scan1, scan2])

  const meterObj = useMemo(() => {
    if (!scan1?.meter) return null
    return METERS.find((m) => m.name === scan1.meter) || null
  }, [scan1])

  const rhymeInfo = useMemo(() => {
    return extractRhyme(activeM1, activeM2)
  }, [activeM1, activeM2])

  const confidence = scan1?.confidence ?? 0.85
  const isAligned =
    scan1 && scan2 ? scan1.meter === scan2.meter && scan1.syllables.length === scan2.syllables.length : true

  // Circular SVG ring calculation (perimeter: 2 * PI * 17 ≈ 106.8)
  const strokeDashoffset = Math.max(0, 106.8 - 106.8 * confidence)

  return (
    <div className="rounded-2xl border border-stone-800 bg-[#080b12] text-stone-100 shadow-2xl overflow-hidden text-right" dir="rtl">
      {/* Instrument Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0d121c] border-b border-stone-800 text-[11px] font-mono text-stone-400">
        <div className="flex items-center gap-1.5" dir="ltr">
          <span className="w-2 h-2 rounded-full bg-rose-500/80 inline-block"></span>
          <span className="w-2 h-2 rounded-full bg-amber-500/80 inline-block"></span>
          <span className="w-2 h-2 rounded-full bg-emerald-500/80 inline-block"></span>
          <span className="ml-2 text-stone-300 font-medium">ARUZ ENGINE · syllabic scansion</span>
        </div>
        <div className="flex items-center gap-2 font-sans text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-emerald-400 font-mono text-[11px]">
            {latencyMs !== null ? `${latencyMs} ms` : "< ۱ ms"}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActivePreset(idx)
                setCustomInput(p.m1)
              }}
              className={`px-3 py-1 rounded-full text-xs transition-colors border ${
                activePreset === idx
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-300 font-semibold"
                  : "border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:border-stone-700"
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setActivePreset("custom")}
            className={`px-3 py-1 rounded-full text-xs transition-colors border ${
              activePreset === "custom"
                ? "border-amber-500/50 bg-amber-500/10 text-amber-300 font-semibold"
                : "border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200 hover:border-stone-700"
            }`}
          >
            متن دلخواه
          </button>
        </div>

        {/* Live Input Field */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0a0e16] border border-stone-800 text-sm">
          <span className="text-amber-400 font-mono text-xs select-none">◂</span>
          <input
            type="text"
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value)
              setActivePreset("custom")
            }}
            placeholder="مصراع را بنویسید... مثلاً: به نام خداوند جان و خرد"
            className="w-full bg-transparent border-0 outline-none text-stone-100 placeholder:text-stone-600 font-sans text-xs sm:text-sm"
            dir="rtl"
          />
        </div>

        {/* Misra 1 (صدر) */}
        {scan1 && (
          <div className="rounded-xl border border-stone-800/80 bg-[#0a0e16] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-stone-400 border-b border-stone-900 pb-1.5 font-mono">
              <span className="font-sans text-stone-300">مصراع اول · صدر</span>
              <span>{toPersianDigits(scan1.syllables.length)} هجا</span>
            </div>

            <div className="font-naskh text-center text-stone-100 text-base sm:text-lg leading-relaxed pt-1">
              {activeM1}
            </div>

            {/* Syllable Pill Carousel / Row */}
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {scan1.syllables.map((syl, i) => {
                const isShort = syl.weight === "S"
                const isFinal = i === scan1.syllables.length - 1
                return (
                  <div
                    key={i}
                    title={`${syl.text} · ${isShort ? "کوتاه" : isFinal ? "پایانی/کشیده" : "بلند"}`}
                    className={`flex flex-col items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded border text-[11px] transition-transform hover:-translate-y-0.5 ${
                      isShort
                        ? "border-teal-500/30 bg-teal-500/10 text-teal-300"
                        : isFinal
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    <span className="font-sans leading-none pb-0.5">{syl.text}</span>
                    <span className="font-mono text-[10px] opacity-80 leading-none">
                      {isShort ? "U" : isFinal ? "∪" : "–"}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Misra 2 (عجز) - if present */}
        {scan2 && activeM2 && (
          <div className="rounded-xl border border-stone-800/80 bg-[#0a0e16] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-stone-400 border-b border-stone-900 pb-1.5 font-mono">
              <span className="font-sans text-stone-300">مصراع دوم · عجز</span>
              <span>
                {toPersianDigits(scan2.syllables.length)} هجا ·{" "}
                <span className={isAligned ? "text-emerald-400" : "text-amber-400"}>
                  {isAligned ? "تراز کامل با صدر" : "ناهمتراز"}
                </span>
              </span>
            </div>

            <div className="font-naskh text-center text-stone-100 text-base sm:text-lg leading-relaxed pt-1">
              {activeM2}
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {scan2.syllables.map((syl, i) => {
                const isShort = syl.weight === "S"
                const isFinal = i === scan2.syllables.length - 1
                return (
                  <div
                    key={i}
                    title={`${syl.text} · ${isShort ? "کوتاه" : isFinal ? "پایانی/کشیده" : "بلند"}`}
                    className={`flex flex-col items-center justify-center min-w-[28px] px-1.5 py-0.5 rounded border text-[11px] transition-transform hover:-translate-y-0.5 ${
                      isShort
                        ? "border-teal-500/30 bg-teal-500/10 text-teal-300"
                        : isFinal
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    <span className="font-sans leading-none pb-0.5">{syl.text}</span>
                    <span className="font-mono text-[10px] opacity-80 leading-none">
                      {isShort ? "U" : isFinal ? "∪" : "–"}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tafaeel Feet Breakdown */}
        {meterObj?.afail && (
          <div className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-lg bg-stone-900/50 border border-stone-800 text-xs font-mono text-amber-300" dir="ltr">
            {meterObj.afail.split(/\s+/).map((foot, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-stone-800/80 text-amber-200">
                {foot}
              </span>
            ))}
          </div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-[#0a0e16] border border-stone-800 space-y-1">
            <span className="text-[10px] text-stone-400 block">بحر تشخیصی</span>
            <span className="font-bold text-amber-300 font-naskh text-sm block">
              {scan1?.meter || "بحر عروضی کلاسیک"}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0a0e16] border border-stone-800 space-y-1">
            <span className="text-[10px] text-stone-400 block">شاهد شعری</span>
            <span className="text-stone-300 text-xs block truncate" title={activeSrc}>
              {activeSrc}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0a0e16] border border-stone-800 space-y-1">
            <span className="text-[10px] text-stone-400 block">قافیه و ردیف</span>
            <span className="font-naskh text-stone-200 text-xs block truncate">
              {rhymeInfo.redif}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0a0e16] border border-stone-800 space-y-1">
            <span className="text-[10px] text-stone-400 block">حروف اصلی رَوی</span>
            <span className="font-bold text-amber-300 font-naskh text-sm block">
              {rhymeInfo.ravi}
            </span>
          </div>
        </div>

        {/* Confidence Ring & Status */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0e16] border border-stone-800">
          <svg className="w-9 h-9 shrink-0" viewBox="0 0 42 42">
            <circle cx="21" cy="21" r="17" fill="none" stroke="#1e2839" strokeWidth="3.4" />
            <circle
              cx="21"
              cy="21"
              r="17"
              fill="none"
              stroke="#5fc384"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeDasharray="106.8"
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 21 21)"
              className="transition-all duration-700"
            />
          </svg>
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-stone-100 font-sans">
              ضریب اطمینان {toPersianDigits(Math.round(confidence * 100))}٪
            </div>
            <div className="text-[11px] text-stone-400">
              {scan2 && activeM2
                ? isAligned
                  ? "اتحاد وزن دو مصراع: تراز کامل بر پایه جدول بحور"
                  : "ارزیابی تقطیع تک‌پایه"
                : "تک‌مصراع — ارزیابی دقیق ساختار هجایی"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
