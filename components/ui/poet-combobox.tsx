"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PoetOption {
  value: string
  label: string
  count?: number
}

interface PoetComboboxProps {
  options: PoetOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  allLabel?: string
  className?: string
}

// کامبوباکس جستجوشونده برای لیست طولانی شاعران.
// بدون وابستگی جدید — دراپ‌داون کنترل‌شده با فیلتر زندهٔ متن فارسی.
export function PoetCombobox({
  options,
  value,
  onChange,
  placeholder = "شاعر را انتخاب کنید",
  allLabel = "همه شاعران",
  className,
}: PoetComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const selected = options.find((o) => o.value === value)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.value.toLowerCase().includes(q)),
    )
  }, [options, query])

  // بستن دراپ‌داون با کلیک بیرون یا Escape
  React.useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    // فوکس روی فیلد جستجو هنگام باز شدن
    requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  function choose(v: string) {
    onChange(v)
    setOpen(false)
    setQuery("")
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors",
          "hover:border-primary/40 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "dark:bg-input/30 dark:hover:bg-input/50",
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={cn("flex min-w-0 items-center gap-2 truncate", !selected && "text-muted-foreground")}>
          <Users className="size-4 shrink-0 opacity-60" />
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          {selected && typeof selected.count === "number" && (
            <span className="shrink-0 rounded-full bg-primary/10 px-1.5 text-[10px] font-medium text-primary">
              {selected.count.toLocaleString("fa-IR")}
            </span>
          )}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی شاعر…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              dir="rtl"
            />
          </div>

          <div className="max-h-60 overflow-y-auto py-1" role="listbox">
            <button
              type="button"
              onClick={() => choose("all")}
              className={cn(
                "flex w-full items-center justify-between gap-2 px-3 py-1.5 text-sm transition-colors hover:bg-accent",
                value === "" || value === "all" ? "bg-accent text-accent-foreground" : "text-foreground",
              )}
              role="option"
              aria-selected={value === "" || value === "all"}
            >
              <span className="truncate">{allLabel}</span>
              {value === "" || value === "all" ? <Check className="size-4 shrink-0 text-primary" /> : null}
            </button>

            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">شاعری یافت نشد</p>
            )}

            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => choose(o.value)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-3 py-1.5 text-sm transition-colors hover:bg-accent",
                  value === o.value ? "bg-accent text-accent-foreground" : "text-foreground",
                )}
                role="option"
                aria-selected={value === o.value}
              >
                <span className="truncate">{o.label}</span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {typeof o.count === "number" && (
                    <span className="rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground">
                      {o.count.toLocaleString("fa-IR")}
                    </span>
                  )}
                  {value === o.value && <Check className="size-4 text-primary" />}
                </span>
              </button>
            ))}
          </div>

          {options.length > 8 && (
            <div className="border-t border-border/60 px-3 py-1.5 text-center text-[10px] text-muted-foreground">
              {filtered.length} از {options.length} شاعر
            </div>
          )}
        </div>
      )}
    </div>
  )
}
