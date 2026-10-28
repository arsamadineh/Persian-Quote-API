"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Scale,
  Copy,
  Check,
  FileText,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Type,
  Columns2,
  AlignJustify,
  Code2,
  Download,
} from "lucide-react"
import { scanHemistich, METERS } from "@persian-quote/arud"
import { cite } from "@persian-quote/tools"

function toPersianDigits(num: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۸", "۹"]
  return String(num).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)] || d)
}

const FORM_LABELS: Record<string, string> = {
  ghazal: "غزل",
  masnavi: "مثنوی",
  qasida: "قصیده",
  rubai: "رباعی",
  qita: "قطعه",
  tarji: "ترجیع‌بند",
  tarkib: "ترکیب‌بند",
  nimai: "شعر نیمایی",
  free: "شعر آزاد و سپید",
}

interface PoemReaderViewProps {
  poem: {
    id: string
    title: string
    title_english?: string
    poet_id: string
    poet_name: string
    collection_id?: string
    collection_title?: string
    number?: number
    form?: string
    stanzas: string[][]
    text_plain: string
    meter?: {
      name?: string
      pattern?: string
      rhythm?: string
      confidence?: number
    }
    radif?: string
    qafiyeh?: string
    attribution?: {
      status?: string
      notes?: string
      sources?: string[]
    }
    rights?: {
      status?: string
      license?: string
      provenance?: string
    }
    tags?: string[]
    source?: {
      edition?: string
      book?: string
    }
  }
  prevWork?: { id: string; title: string } | null
  nextWork?: { id: string; title: string } | null
}

export function PoemReaderView({ poem, prevWork, nextWork }: PoemReaderViewProps) {
  const [fontFamily, setFontFamily] = useState<"naskh" | "nastaliq" | "kufi" | "vazirmatn">("naskh")
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md")
  const [layoutMode, setLayoutMode] = useState<"diwan" | "single">("diwan")
  const [activeBeytIdx, setActiveBeytIdx] = useState<number | null>(0)
  const [highlightRhyme, setHighlightRhyme] = useState<boolean>(true)
  const [copiedWhole, setCopiedWhole] = useState(false)
  const [copiedBeytIdx, setCopiedBeytIdx] = useState<number | null>(null)
  const [citationStyle, setCitationStyle] = useState<"apa-fa" | "chicago-fa" | "bibtex" | "csl-json">("apa-fa")
  const [copiedCitation, setCopiedCitation] = useState(false)

  const stanzas = useMemo(() => {
    if (!Array.isArray(poem.stanzas)) return []
    return poem.stanzas
  }, [poem.stanzas])

  // Detect live prosodic meter from the opening couplet via @persian-quote/arud
  const openingScan = useMemo(() => {
    const firstStanza = stanzas[0]
    if (!firstStanza || firstStanza.length === 0) return null
    const s1 = scanHemistich(firstStanza[0] || "")
    const s2 = firstStanza[1] ? scanHemistich(firstStanza[1]) : null
    const meterObj = METERS.find((m) => m.name === s1.meter)
    return { s1, s2, meterObj }
  }, [stanzas])

  // Active beyt scansion
  const activeBeytScan = useMemo(() => {
    if (activeBeytIdx === null || !stanzas[activeBeytIdx]) return null
    const pair = stanzas[activeBeytIdx]!
    const h1 = pair[0] || ""
    const h2 = pair[1] || ""
    return {
      h1,
      h2,
      scan1: h1 ? scanHemistich(h1) : null,
      scan2: h2 ? scanHemistich(h2) : null,
    }
  }, [activeBeytIdx, stanzas])

  const selectedBeytNumber = activeBeytIdx !== null ? activeBeytIdx + 1 : 1

  const citationText = useMemo(() => {
    return cite(
      {
        id: poem.id,
        poetId: poem.poet_id,
        poetName: poem.poet_name,
        title: poem.title,
        collection: poem.collection_title || poem.source?.book || "دیوان اشعار",
        kind: "classical",
      },
      citationStyle,
      { beyt: selectedBeytNumber }
    )
  }, [poem, citationStyle, selectedBeytNumber])

  const handleCopyWhole = () => {
    const formatted = stanzas.map((s) => s.join(" / ")).join("\n")
    navigator.clipboard.writeText(`${poem.title} — ${poem.poet_name}\n\n${formatted}`)
    setCopiedWhole(true)
    setTimeout(() => setCopiedWhole(false), 2000)
  }

  const handleCopyBeyt = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const pair = stanzas[idx]
    if (!pair) return
    navigator.clipboard.writeText(`${pair.join(" / ")}\n— ${poem.poet_name} (${poem.title}، بیت ${toPersianDigits(idx + 1)})`)
    setCopiedBeytIdx(idx)
    setTimeout(() => setCopiedBeytIdx(null), 2000)
  }

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(citationText)
    setCopiedCitation(true)
    setTimeout(() => setCopiedCitation(false), 2000)
  }

  const fontClass =
    fontFamily === "naskh"
      ? "font-naskh"
      : fontFamily === "nastaliq"
      ? "font-nastaliq"
      : fontFamily === "kufi"
      ? "font-kufi"
      : "font-vazirmatn"

  const sizeClass =
    fontSize === "sm"
      ? "text-base sm:text-lg"
      : fontSize === "lg"
      ? "text-xl sm:text-2xl md:text-[26px]"
      : "text-lg sm:text-xl md:text-[22px]"

  // Helper to highlight radif at the end of a hemistich
  const renderHemistich = (line: string) => {
    if (!highlightRhyme || !poem.radif) return line
    const radif = poem.radif.trim()
    if (radif && line.trim().endsWith(radif)) {
      const idx = line.lastIndexOf(radif)
      const before = line.slice(0, idx)
      return (
        <>
          <span>{before}</span>
          <span className="text-primary font-semibold underline decoration-primary/30 underline-offset-8">
            {radif}
          </span>
        </>
      )
    }
    return line
  }

  const displayMeterName = openingScan?.meterObj?.name || poem.meter?.name || "بحر عروضی کلاسیک"
  const displayAfail = openingScan?.meterObj?.afail || poem.meter?.pattern || ""
  const displayRhythm = openingScan?.meterObj?.rhythm || poem.meter?.rhythm || ""

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        {/* مسیر راهنما (Breadcrumb) و ناوبری غزل قبلی و بعدی */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-border/70">
          <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              صفحه اصلی
            </Link>
            <span>/</span>
            <Link href={`/poets/${poem.poet_id}`} className="hover:text-foreground transition-colors font-medium text-foreground/90">
              {poem.poet_name}
            </Link>
            {poem.collection_title && (
              <>
                <span>/</span>
                <span>{poem.collection_title}</span>
              </>
            )}
            <span>/</span>
            <span className="text-primary font-semibold">{poem.title}</span>
          </nav>

          <div className="flex items-center gap-2">
            {prevWork && (
              <Link
                href={`/p/${encodeURIComponent(prevWork.id)}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-card hover:bg-muted/60 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>{prevWork.title}</span>
              </Link>
            )}
            {nextWork && (
              <Link
                href={`/p/${encodeURIComponent(nextWork.id)}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-card hover:bg-muted/60 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{nextWork.title}</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* سربرگ نسخه‌شناختی اثر */}
        <header className="rounded-xl border border-border bg-card/80 p-6 sm:p-8 mb-6 shadow-2xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs font-medium border-primary/30 text-primary bg-primary/5">
                  {FORM_LABELS[poem.form || ""] || poem.form || "شعر کلاسیک"}
                </Badge>
                <Badge variant="secondary" className="text-xs font-normal">
                  {toPersianDigits(stanzas.length)} بیت ({toPersianDigits(stanzas.flat().length)} مصراع)
                </Badge>
                {poem.source?.edition && (
                  <Badge variant="outline" className="text-[11px] text-muted-foreground">
                    تصحیح {poem.source.edition}
                  </Badge>
                )}
                <span className="text-[11px] font-mono text-muted-foreground" dir="ltr">
                  {poem.id}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground font-naskh tracking-tight">
                {poem.title} — {poem.poet_name}
              </h1>

              {stanzas[0]?.[0] && (
                <p className="text-sm text-muted-foreground font-naskh">
                  مطلع: «{stanzas[0][0]}»
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyWhole}
                className="h-8 text-xs gap-1.5"
              >
                {copiedWhole ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWhole ? "کپی شد" : "کپی کل شعر"}</span>
              </Button>
            </div>
          </div>

          {/* نوار اطلاعات عروضی، قافیه و ردیف */}
          <div className="mt-6 pt-4 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-muted/25 border border-border/60 space-y-1">
              <div className="text-muted-foreground flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-primary" />
                <span>بحر و وزن عروضی:</span>
              </div>
              <div className="font-bold text-foreground font-naskh text-sm">{displayMeterName}</div>
              {displayAfail && (
                <div className="text-[11px] text-primary font-medium">{displayAfail}</div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-muted/25 border border-border/60 space-y-1">
              <div className="text-muted-foreground">واژگان قافیه و ردیف:</div>
              <div className="flex flex-wrap items-center gap-3 pt-0.5">
                <div>
                  <span className="text-muted-foreground">قافیه: </span>
                  <strong className="text-foreground font-naskh">{poem.qafiyeh || "موزون"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">ردیف: </span>
                  <strong className="text-primary font-naskh">{poem.radif || "فاقد ردیف"}</strong>
                </div>
              </div>
              {displayRhythm && (
                <div className="text-[11px] font-mono text-muted-foreground pt-0.5" dir="ltr">
                  {displayRhythm}
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-muted/25 border border-border/60 space-y-1">
              <div className="text-muted-foreground">وضعیت استناد و منبع:</div>
              <div className="font-semibold text-foreground">
                {poem.attribution?.notes || `برگرفته از ${poem.collection_title || "دیوان اشعار"}`}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                {poem.rights?.license || "مالکیت عمومی (Public Domain)"}
              </div>
            </div>
          </div>
        </header>

        {/* نوار تنظیمات خط، اندازه، چیدمان و برجسته‌سازی ردیف */}
        <div className="rounded-xl border border-border bg-card/60 px-4 py-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground flex items-center gap-1 font-medium">
              <Type className="w-3.5 h-3.5 text-primary" />
              <span>قلم خوانش:</span>
            </span>
            <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
              {[
                { id: "naskh", label: "نسخ ادبی" },
                { id: "nastaliq", label: "نستعلیق" },
                { id: "kufi", label: "کوفی" },
                { id: "vazirmatn", label: "وزیرمتن" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFontFamily(f.id as any)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                    fontFamily === f.id
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
              {[
                { id: "sm", label: "کوچک" },
                { id: "md", label: "متوسط" },
                { id: "lg", label: "بزرگ" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setFontSize(s.id as any)}
                  className={`px-2 py-1 rounded-md text-xs transition-colors ${
                    fontSize === s.id
                      ? "bg-secondary text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {poem.radif && (
              <button
                type="button"
                onClick={() => setHighlightRhyme(!highlightRhyme)}
                className={`px-2.5 py-1 rounded-md border text-xs transition-colors ${
                  highlightRhyme
                    ? "border-primary/40 bg-primary/10 text-primary font-medium"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                برجسته‌سازی ردیف «{poem.radif}»
              </button>
            )}

            <div className="inline-flex rounded-lg border border-border bg-background p-0.5">
              <button
                type="button"
                onClick={() => setLayoutMode("diwan")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors ${
                  layoutMode === "diwan"
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>دو ستونه دیوانی</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode("single")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors ${
                  layoutMode === "single"
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <AlignJustify className="w-3.5 h-3.5" />
                <span>تک‌ستونه</span>
              </button>
            </div>
          </div>
        </div>

        {/* متن اصلی دیوان با قابلیت کالبدشکافی هر بیت */}
        <article className="rounded-xl border border-border bg-card p-5 sm:p-8 md:p-10 shadow-2xs space-y-2">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60 text-[11px] text-muted-foreground">
            <span>برای مشاهده تقطیع هجایی و استناد دقیق، روی هر بیت کلیک کنید.</span>
            <span>شماره‌گذاری بر اساس ترتیب نسخه مرجع</span>
          </div>

          <div className="divide-y divide-border/40">
            {stanzas.map((stanza, idx) => {
              const isSelected = activeBeytIdx === idx
              const isCouplet = stanza.length === 2
              return (
                <div key={idx} className="py-4 first:pt-1 last:pb-1">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveBeytIdx(isSelected ? null : idx)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setActiveBeytIdx(isSelected ? null : idx)
                      }
                    }}
                    className={`group rounded-lg p-3 sm:p-4 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary/5 border border-primary/30"
                        : "hover:bg-muted/30 border border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* شماره بیت */}
                      <span
                        className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 text-muted-foreground border-border group-hover:border-primary/40 group-hover:text-foreground"
                        }`}
                      >
                        {toPersianDigits(idx + 1)}
                      </span>

                      {/* مصراع‌ها */}
                      <div className={`flex-1 ${fontClass} ${sizeClass}`}>
                        {isCouplet && layoutMode === "diwan" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8 items-baseline">
                            <div className="text-right leading-relaxed">
                              {renderHemistich(stanza[0]!)}
                            </div>
                            <div className="text-right md:text-left leading-relaxed">
                              {renderHemistich(stanza[1]!)}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {stanza.map((line, lIdx) => (
                              <div key={lIdx} className="leading-relaxed">
                                {renderHemistich(line)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* دکمه کپی تک‌بیت */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyBeyt(idx, e)}
                        title={`کپی بیت ${toPersianDigits(idx + 1)}`}
                        className="opacity-70 group-hover:opacity-100 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0"
                      >
                        {copiedBeytIdx === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* کالبدشکافی عروضی بیت انتخاب‌شده */}
                  {isSelected && activeBeytScan && (
                    <div className="mt-2 mr-0 sm:mr-10 p-4 rounded-lg border border-border bg-muted/20 space-y-4 text-xs animate-in fade-in duration-150">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border/60">
                        <div className="flex items-center gap-2">
                          <Scale className="w-3.5 h-3.5 text-primary" />
                          <span className="font-bold text-foreground">
                            کالبدشکافی عروضی بیت {toPersianDigits(idx + 1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[11px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                            اطمینان تقطیع: ٪{toPersianDigits(Math.round((activeBeytScan.scan1?.confidence || 0.9) * 100))}
                          </Badge>
                        </div>
                      </div>

                      {/* تقطیع مصراع اول */}
                      {activeBeytScan.scan1 && (
                        <div className="space-y-1.5">
                          <div className="text-muted-foreground text-[11px]">
                            تقطیع مصراع اول ({toPersianDigits(activeBeytScan.scan1.syllables.length)} هجا):
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {activeBeytScan.scan1.syllables.map((s, sIdx) => (
                              <div
                                key={sIdx}
                                className={`px-2.5 py-1 rounded border text-center min-w-[38px] ${
                                  s.weight === "L"
                                    ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                                    : s.weight === "S"
                                    ? "bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300"
                                    : "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300"
                                }`}
                              >
                                <div className="text-xs font-bold font-naskh">{s.text}</div>
                                <div className="text-[10px] font-mono opacity-80">
                                  {s.weight === "L" ? "–" : s.weight === "S" ? "U" : "∪"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* تقطیع مصراع دوم */}
                      {activeBeytScan.scan2 && (
                        <div className="space-y-1.5">
                          <div className="text-muted-foreground text-[11px]">
                            تقطیع مصراع دوم ({toPersianDigits(activeBeytScan.scan2.syllables.length)} هجا):
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {activeBeytScan.scan2.syllables.map((s, sIdx) => (
                              <div
                                key={sIdx}
                                className={`px-2.5 py-1 rounded border text-center min-w-[38px] ${
                                  s.weight === "L"
                                    ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                                    : s.weight === "S"
                                    ? "bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300"
                                    : "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300"
                                }`}
                              >
                                <div className="text-xs font-bold font-naskh">{s.text}</div>
                                <div className="text-[10px] font-mono opacity-80">
                                  {s.weight === "L" ? "–" : s.weight === "S" ? "U" : "∪"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </article>

        {/* بخش استناد علمی و مأخذشناسی دانشگاهی */}
        <section className="mt-6 rounded-xl border border-border bg-card/80 p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">
                استناد علمی و مأخذشناسی دانشگاهی (بیت {toPersianDigits(selectedBeytNumber)})
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                { id: "apa-fa", label: "APA فارسی" },
                { id: "chicago-fa", label: "شیکاگو" },
                { id: "bibtex", label: "BibTeX" },
                { id: "csl-json", label: "CSL-JSON" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCitationStyle(s.id as any)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    citationStyle === s.id
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-border bg-background text-xs"
            dir={citationStyle === "bibtex" || citationStyle === "csl-json" ? "ltr" : "rtl"}
          >
            <pre className="flex-1 overflow-x-auto whitespace-pre-wrap font-mono text-foreground leading-relaxed">
              {citationText}
            </pre>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyCitation}
              className="shrink-0 h-8 text-xs gap-1.5"
            >
              {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCitation ? "کپی شد" : "کپی استناد"}</span>
            </Button>
          </div>

          {/* پیوندهای داده خام و API */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {poem.tags?.map((t) => (
                <Link
                  key={t}
                  href={`/search?q=${encodeURIComponent(t)}`}
                  className="px-2 py-0.5 rounded bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  #{t}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`/v1/works/${encodeURIComponent(poem.id)}?view=full`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted transition-colors text-xs"
              >
                <Code2 className="w-3.5 h-3.5 text-primary" />
                <span>خروجی JSON (API v1)</span>
              </a>
              <a
                href={`/v1/works/${encodeURIComponent(poem.id)}?view=text&format=txt`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted transition-colors text-xs"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>متن خام (TXT)</span>
              </a>
              <Link
                href={`/poets/${poem.poet_id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 transition-colors text-xs font-medium"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>فهرست آثار {poem.poet_name}</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
