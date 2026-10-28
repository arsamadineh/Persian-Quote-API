"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, FileText, Scale } from "lucide-react"
import { cite } from "@persian-quote/tools"

interface PoemCitationBoxProps {
  id: string
  title: string
  poetName: string
  poetId: string
  collection?: string
  meterName?: string
  qafiyeh?: string
  radif?: string
}

export function PoemCitationBox({
  id,
  title,
  poetName,
  poetId,
  collection = "دیوان اشعار",
  meterName,
  qafiyeh,
  radif
}: PoemCitationBoxProps) {
  const [style, setStyle] = useState<"apa-fa" | "chicago-fa" | "bibtex" | "csl-json">("apa-fa")
  const [copied, setCopied] = useState(false)
  const [beyt, setBeyt] = useState(1)

  const workRef = {
    id,
    poetId,
    poetName,
    title,
    collection,
    kind: "classical" as const
  }

  const citation = cite(workRef, style, { beyt })

  const handleCopy = () => {
    navigator.clipboard.writeText(citation)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-8 pt-6 border-t border-border/80 space-y-4" dir="rtl">
      {/* اطلاعات وزن و قافیه */}
      {meterName && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-muted/20 border border-border">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">وزن عروضی:</span>
            <span className="text-xs font-semibold text-foreground font-serif">{meterName}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {qafiyeh && <span>قافیه: <strong className="text-foreground">{qafiyeh}</strong></span>}
            {radif && <span>ردیف: <strong className="text-foreground">{radif}</strong></span>}
          </div>
        </div>
      )}

      {/* بخش استناد دانشگاهی */}
      <div className="border border-border rounded-lg p-4 bg-card/60 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">استناد علمی دانشگاهی:</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label htmlFor="beyt-no" className="text-muted-foreground text-[11px]">بیت:</label>
            <input
              id="beyt-no"
              type="number"
              min="1"
              value={beyt}
              onChange={(e) => setBeyt(Math.max(1, Number(e.target.value)))}
              className="w-14 px-2 py-0.5 rounded border border-border bg-background text-xs font-mono text-center"
              dir="ltr"
            />
          </div>
        </div>

        {/* انتخاب شیوه ارجاع */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: "apa-fa", label: "APA فارسی" },
            { id: "chicago-fa", label: "شیکاگو" },
            { id: "bibtex", label: "BibTeX" },
            { id: "csl-json", label: "CSL-JSON" }
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyle(s.id as any)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                style === s.id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* کادر استناد */}
        <div className="flex items-center gap-2 p-2.5 rounded border border-border bg-background font-mono text-xs select-all">
          <div className="flex-1 overflow-x-auto text-foreground whitespace-pre-wrap">
            {citation}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="کپی استناد"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
