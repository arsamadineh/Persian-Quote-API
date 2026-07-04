"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CHANGE_TYPES, CHANGELOG, LATEST_VERSION, type ChangeType } from "@/lib/changelog"

const STORAGE_KEY = "pq-changelog-last-seen"

function readLastSeen(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeLastSeen(version: string) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, version)
  } catch {
    // شکست خاموش در صورت عدم دسترسی به localStorage
  }
}

export function UpdateModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const lastSeen = readLastSeen()
    // در اولین بازدید، مقدار ثبت می‌شود ولی مودال نمایش داده نمی‌شود.
    if (lastSeen === null) {
      writeLastSeen(LATEST_VERSION.version)
      return
    }
    if (lastSeen !== LATEST_VERSION.version) {
      setOpen(true)
    }
  }, [])

  const dismiss = () => {
    writeLastSeen(LATEST_VERSION.version)
    setOpen(false)
  }

  if (!open) return null

  // آخرین نسخه را به گروه‌های دسته‌بندی‌شده تبدیل می‌کنیم.
  const groups = new Map<ChangeType, string[]>()
  for (const change of LATEST_VERSION.changes) {
    if (!groups.has(change.type)) groups.set(change.type, [])
    groups.get(change.type)!.push(change.description)
  }
  const orderedGroups = Array.from(groups.entries()).sort(
    ([a], [b]) => CHANGE_TYPES[a].order - CHANGE_TYPES[b].order
  )

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-labelledby="changelog-modal-title"
      className="fixed inset-x-0 bottom-4 z-50 mx-auto md:bottom-6 md:left-6 md:right-auto md:mx-0 md:max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-card border border-border rounded-xl shadow-lg p-5 mx-4 md:mx-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">نسخه جدید</p>
            <h2
              id="changelog-modal-title"
              className="text-lg font-bold text-foreground leading-tight"
            >
              {LATEST_VERSION.version}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{LATEST_VERSION.date}</p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="بستن"
            className="text-muted-foreground hover:text-foreground text-xl leading-none w-6 h-6 flex items-center justify-center -mt-1 -ml-1"
          >
            ×
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
          {orderedGroups.map(([type, items]) => (
            <div key={type}>
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                {CHANGE_TYPES[type].label}
              </p>
              <ul className="space-y-1.5 pr-4">
                {items.map((desc, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-foreground/90 leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-muted-foreground mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/60 shrink-0" />
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Link
            href="/changelog"
            onClick={dismiss}
            className="flex-1 text-center text-sm font-medium text-foreground hover:text-primary border border-border rounded-md py-2 px-3 transition-colors"
          >
            مشاهده همه تغییرات
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="flex-1 text-center text-sm font-medium bg-foreground text-background rounded-md py-2 px-3 hover:opacity-90 transition-opacity"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  )
}

// جلوگیری از حذف CHANGELOG از tree-shaking اگر در آینده نیاز به استفاده مستقیم شد.
// در حال حاضر فقط برای خواندن type استفاده می‌شود.
void CHANGELOG
