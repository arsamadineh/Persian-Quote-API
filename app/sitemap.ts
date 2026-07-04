import type { MetadataRoute } from "next"
import { LATEST_VERSION } from "@/lib/changelog"

const SITE_URL = "https://pq.arsamadineh.ir"

// ── صفحات رابط کاربری ─────────────────────────────────
const UI_PAGES: Array<{
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
}> = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/docs", priority: 0.95, changeFrequency: "weekly" },
  { path: "/sakhtar", priority: 0.85, changeFrequency: "weekly" },
  { path: "/examples", priority: 0.85, changeFrequency: "monthly" },
  { path: "/embed", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contribute", priority: 0.7, changeFrequency: "monthly" },
  { path: "/changelog", priority: 0.6, changeFrequency: "weekly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
]

// ── اندپوینت‌های API ───────────────────────────────────
const API_ENDPOINTS: Array<{
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
}> = [
  { path: "/api/quotes", priority: 0.9, changeFrequency: "weekly" },
  { path: "/api/quotes/random", priority: 0.9, changeFrequency: "daily" },
  { path: "/api/quotes/search", priority: 0.85, changeFrequency: "weekly" },
  { path: "/api/quotes/hafez", priority: 0.9, changeFrequency: "monthly" },
  { path: "/api/quotes/shereno", priority: 0.85, changeFrequency: "monthly" },
  { path: "/api/quotes/non-poetry", priority: 0.8, changeFrequency: "monthly" },
  { path: "/api/poets", priority: 0.7, changeFrequency: "monthly" },
  { path: "/api/categories", priority: 0.7, changeFrequency: "monthly" },
  { path: "/api/stats", priority: 0.6, changeFrequency: "daily" },
  { path: "/api/embed", priority: 0.7, changeFrequency: "monthly" },
  { path: "/api/engine/stats", priority: 0.6, changeFrequency: "daily" },
  { path: "/api/engine/benchmark", priority: 0.5, changeFrequency: "weekly" },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const ui: MetadataRoute.Sitemap = UI_PAGES.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
    alternates: {
      languages: {
        "fa-IR": `${SITE_URL}${p.path}`,
        "x-default": `${SITE_URL}${p.path}`,
        en: `${SITE_URL}${p.path}`,
      },
    },
  }))

  const api: MetadataRoute.Sitemap = API_ENDPOINTS.map((e) => ({
    url: `${SITE_URL}${e.path}`,
    lastModified: now,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
    // API endpoints: do not include in normal language alternates
    alternates: {
      languages: {
        "fa-IR": `${SITE_URL}${e.path}`,
        "x-default": `${SITE_URL}${e.path}`,
      },
    },
  }))

  return [...ui, ...api]
}

// Re-export برای استفاده در سایر فایل‌ها
export const SITE_LAST_MODIFIED = LATEST_VERSION.isoDate
