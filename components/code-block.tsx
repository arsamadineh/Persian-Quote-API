"use client"

// بلوک کد با دکمه کپی، برچسب زبان، و (اختیاری) لینک اجرای زنده روی سرور.
// استایل هماهنگ با بلوک‌های موجود در صفحات دیگر؛ مخصوص استفاده در صفحه مستندات.

import { useState, useEffect } from "react"
import { Check, Copy, ExternalLink, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  language?: string
  label?: string
  filename?: string
  /** اگر مقدار داشته باشد، دکمه «اجرای زنده» نمایش داده می‌شود */
  liveUrl?: string
  className?: string
  /** ارتفاع حداکثری برای اسکرول داخلی؛ پیش‌فرض بدون محدودیت */
  maxHeight?: string
}

export function CodeBlock({
  code,
  language = "text",
  label,
  filename,
  liveUrl,
  className,
  maxHeight,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [platform, setPlatform] = useState<"mac" | "other">("other")

  useEffect(() => {
    setPlatform(/Mac|iPhone|iPad/.test(navigator.platform) ? "mac" : "other")
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = code
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div
      dir="ltr"
      className={cn(
        "relative rounded-xl overflow-hidden border border-border bg-stone-950 dark:bg-stone-950 text-stone-100 shadow-sm",
        className
      )}
    >
      {/* سربرگ */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-stone-900 border-b border-stone-800 text-[11px] sm:text-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500/70" />
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500/70" />
          </div>
          {filename ? (
            <span className="font-mono text-stone-300 truncate">{filename}</span>
          ) : label ? (
            <span className="text-stone-400 flex items-center gap-1.5">
              <Terminal className="w-3 h-3" />
              {label}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-stone-500 font-mono text-[10px] sm:text-[11px] uppercase">{language}</span>
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-400 hover:text-amber-400 transition-colors rounded-md p-1 flex items-center gap-1"
              title="باز کردن در تب جدید"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="text-stone-400 hover:text-amber-400 transition-colors rounded-md p-1 flex items-center gap-1"
            title={`کپی (${platform === "mac" ? "⌘" : "Ctrl"} C)`}
            aria-label="کپی کد"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* بدنه */}
      <pre
        dir="ltr"
        className={cn(
          "p-3 sm:p-4 overflow-x-auto text-[11px] sm:text-[13px] font-mono leading-relaxed text-left",
          copied && "ring-1 ring-emerald-500/30 transition-shadow"
        )}
        style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
      >
        <code className="block whitespace-pre">{code}</code>
      </pre>

      {/* بج کپی موفق */}
      {copied && (
        <div className="pointer-events-none absolute top-9 right-3 sm:top-10 sm:right-4 bg-emerald-600 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded animate-cmdbar-fade">
          کپی شد
        </div>
      )}
    </div>
  )
}

/** نسخه جمع‌وجور با ارتفاع کم و بدون حاشیه — مناسب برای جدول‌ها یا لیست‌ها */
export function InlineCode({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <code
      dir="ltr"
      className={cn(
        "bg-muted border border-border/70 text-foreground rounded px-1.5 py-0.5 text-[12px] font-mono inline-block align-baseline",
        className
      )}
    >
      {children}
    </code>
  )
}
