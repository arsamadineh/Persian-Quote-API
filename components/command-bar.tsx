"use client"

// فرمان‌پالت سراسری (⌘K / Ctrl+K). در ریشه برنامه mount می‌شود.
// هر جزء دیگر (دکمه نوار بالا، ورودی جستجو در صفحه مستندات) می‌تواند با
// dispatchEvent(new CustomEvent("command-bar:open")) آن را باز کند.
// هیچ کتابخانه خارجی استفاده نشده — جستجو بر مبنای lib/docs-index است.

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BookOpen,
  Cpu,
  Code,
  Copy,
  CornerDownLeft,
  ExternalLink,
  Hash,
  Hash as HashIcon,
  Lightbulb,
  Search,
  Sparkles,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { searchDocs, DOC_CATEGORIES, type DocItem, type DocItemCategory } from "@/lib/docs-index"

const CATEGORY_ICON: Record<DocItemCategory, typeof Search> = {
  endpoint: Hash,
  engine: Cpu,
  guide: BookOpen,
  concept: Lightbulb,
  snippet: Code,
  prompt: Sparkles,
}

const SHORTCUT_LABEL = "Ctrl K" // نمایش فارسی: «Ctrl K» در سیستم‌های غیر Mac

export function CommandBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [platform, setPlatform] = useState<"mac" | "other">(typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "mac" : "other")

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // باز و بسته کردن از رویداد سراسری
  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener("command-bar:open", onOpen as EventListener)
    return () => window.removeEventListener("command-bar:open", onOpen as EventListener)
  }, [])

  // شنود میان‌بر صفحه‌کلید برای ⌘K / Ctrl K (در فاز capture پیش از inputها)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = platform === "mac" ? e.metaKey : e.ctrlKey
      if (mod && (e.key === "k" || e.key === "K")) {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === "/" && !open) {
        const t = e.target as HTMLElement | null
        const tag = t?.tagName?.toLowerCase()
        const editable = t?.isContentEditable
        const inField = tag === "input" || tag === "textarea" || tag === "select" || editable
        if (!inField) {
          e.preventDefault()
          setOpen(true)
        }
      }
    }
    document.addEventListener("keydown", onKey, true)
    return () => document.removeEventListener("keydown", onKey, true)
  }, [platform, open])

  // روی ایالات باز — قفل اسکرول بدن، فوکوس به ورودی، بازگرداندن فوکوس هنگام بسته شدن
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const t = setTimeout(() => inputRef.current?.focus(), 30)

    const onDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setOpen(false)
      }
    }
    document.addEventListener("keydown", onDown)

    return () => {
      document.body.style.overflow = prevOverflow
      clearTimeout(t)
      document.removeEventListener("keydown", onDown)
    }
  }, [open])

  // محاسبه نتایج جستجو
  const results = useMemo(() => searchDocs(query, 50), [query])

  // گروه‌بندی برای نمایش بهتر
  const grouped = useMemo(() => {
    const order: DocItemCategory[] = ["endpoint", "guide", "engine", "concept", "snippet", "prompt"]
    const map = new Map<DocItemCategory, DocItem[]>()
    for (const it of results) {
      const list = map.get(it.category) || []
      list.push(it)
      map.set(it.category, list)
    }
    return order.filter((c) => (map.get(c)?.length || 0) > 0).map((c) => ({
      category: c,
      items: map.get(c)!,
    }))
  }, [results])

  // لیست مسطح برای ناوبری کیبورد
  const flatIndex = useMemo(() => grouped.flatMap((g) => g.items), [grouped])

  // بازنشانی انتخاب هنگام تغییر نتایج
  useEffect(() => {
    setSelected(0)
  }, [query])

  // اسکرول خودکار مورد انتخاب‌شده به دید
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${selected}"]`)
    if (el) el.scrollIntoView({ block: "nearest" })
  }, [selected])

  const copyPayload = useCallback(async (item: DocItem) => {
    if (!item.payload) return false
    try {
      await navigator.clipboard.writeText(item.payload)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId((c) => (c === item.id ? null : c)), 1400)
      return true
    } catch {
      // روش جایگزین برای مرورگرهای بدون Clipboard API
      const ta = document.createElement("textarea")
      ta.value = item.payload
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId((c) => (c === item.id ? null : c)), 1400)
      return true
    }
  }, [])

  const onPick = useCallback(
    async (item: DocItem) => {
      if (item.payload) {
        await copyPayload(item)
        // برای snippet و prompt، پس از کپی، پالت بسته نمی‌شود — کاربر ممکن است بخواهد چند بار کپی کند
        return
      }
      setOpen(false)
      const [path, hash] = item.href.split("#")
      router.push(item.href)
      if (hash && path === window.location.pathname) {
        // پرش به هش پس از لود شدن صفحه
        setTimeout(() => {
          const tgt = document.getElementById(hash)
          tgt?.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 80)
      }
    },
    [copyPayload, router]
  )

  // ناوبری صفحه‌کلید
  const onKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, Math.max(flatIndex.length - 1, 0)))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        const item = flatIndex[selected]
        if (item) onPick(item)
      }
    },
    [flatIndex, selected, onPick]
  )

  if (!open) return null

  const shortcutLabel = platform === "mac" ? "⌘ K" : "Ctrl K"

  return (
    <div
      className="cmdbar-root fixed inset-0 z-[100] flex items-start justify-center sm:items-center px-3 pt-[10vh] sm:pt-0"
      role="dialog"
      aria-modal="true"
      aria-label="جستجوی فرمان"
    >
      {/* پس‌زمینه محو */}
      <button
        type="button"
        aria-label="بستن فرمان‌پالت"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-background/70 backdrop-blur-md cursor-default animate-cmdbar-fade"
      />

      {/* پنل */}
      <div className="cmdbar-panel relative w-full max-w-2xl bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden animate-cmdbar-rise">
        {/* ورودی */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            dir="rtl"
            inputMode="search"
            placeholder="جستجو در اندپوینت‌ها، راهنما، و موتور..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60 text-foreground"
            aria-controls="cmdbar-results"
            aria-activedescendant={flatIndex[selected]?.id}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
              aria-label="پاک کردن"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="cmdbar-kbd text-[10px] font-mono text-muted-foreground bg-background border border-border rounded px-1.5 py-0.5 shrink-0">
            {shortcutLabel}
          </span>
        </div>

        {/* نتایج */}
        <div
          id="cmdbar-results"
          ref={listRef}
          role="listbox"
          className="max-h-[60vh] sm:max-h-[55vh] overflow-y-auto"
        >
          {flatIndex.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted-foreground text-sm">
              نتیجه‌ای برای «{query}» یافت نشد.
              <div className="mt-2 text-xs opacity-70">پیشنهاد: جستجوی «حافظ»، «engine»، یا «deploy»</div>
            </div>
          ) : (
            grouped.map((group, gi) => {
              const Icon = CATEGORY_ICON[group.category] || HashIcon
              return (
                <div key={group.category} className="py-1">
                  <div className="px-4 pt-3 pb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                    <Icon className="w-3 h-3" />
                    {DOC_CATEGORIES[group.category]?.label || group.category}
                    <span className="mr-auto text-[10px] opacity-50 font-mono">
                      {group.items.length}
                    </span>
                  </div>
                  {group.items.map((item) => {
                    let flatIdx = 0
                    for (const g of grouped) {
                      if (g.category === group.category) {
                        flatIdx = g.items.indexOf(item)
                        break
                      }
                      flatIdx += g.items.length
                    }
                    const idx = grouped
                      .slice(0, grouped.findIndex((g) => g.category === group.category))
                      .reduce((acc, g) => acc + g.items.length, 0) + flatIdx
                    const isSelected = idx === selected
                    return (
                      <CmdItem
                        key={item.id}
                        item={item}
                        index={idx}
                        selected={isSelected}
                        copied={copiedId === item.id}
                        query={query}
                        onHover={() => setSelected(idx)}
                        onPick={() => onPick(item)}
                      />
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* پاورقی */}
        <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" />
              انتخاب
            </span>
            <span className="flex items-center gap-1">
              <ArrowRight className="w-3 h-3 rotate-180" />
              پیمایش
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-background border border-border text-[10px]">Esc</kbd>
              بستن
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="opacity-70">{flatIndex.length} نتیجه</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CmdItemProps {
  item: DocItem
  index: number
  selected: boolean
  copied: boolean
  query: string
  onHover: () => void
  onPick: () => void
}

function CmdItem({ item, index, selected, copied, query, onHover, onPick }: CmdItemProps) {
  const Icon = CATEGORY_ICON[item.category] || HashIcon
  const isCopyable = !!item.payload

  return (
    <div
      data-idx={index}
      id={item.id}
      role="option"
      aria-selected={selected}
      onMouseEnter={onHover}
      onClick={onPick}
      className={cn(
        "px-3 py-2.5 mx-2 rounded-lg cursor-pointer transition-colors duration-100 flex items-center gap-3",
        "animate-cmdbar-item",
        selected
          ? "bg-primary/10 ring-1 ring-primary/30"
          : "bg-transparent hover:bg-muted/40"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
          selected
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-muted/40 text-muted-foreground border-border"
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-semibold truncate", selected ? "text-primary" : "text-foreground")}>
            <Highlight text={item.title} query={query} />
          </span>
          {item.titleEn && (
            <span className="text-[10px] text-muted-foreground/70 font-mono truncate" dir="ltr">
              {item.titleEn}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">
          <Highlight text={item.desc} query={query} />
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-1.5">
        {isCopyable && (
          copied ? (
            <span className="cmdbar-chip bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
              <Copy className="w-3 h-3" />
              کپی شد
            </span>
          ) : (
            <span className="cmdbar-chip bg-muted text-muted-foreground border-border">
              <Copy className="w-3 h-3" />
              کپی
            </span>
          )
        )}
        {!isCopyable && (
          <span className="cmdbar-chip bg-primary/10 text-primary border-primary/30">
            <ExternalLink className="w-3 h-3" />
            باز کردن
          </span>
        )}
      </div>
    </div>
  )
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const q = query.trim()
  const lower = text.toLowerCase()
  const needle = q.toLowerCase()
  const idx = lower.indexOf(needle)
  if (idx < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-foreground rounded px-0.5 py-0">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  )
}
