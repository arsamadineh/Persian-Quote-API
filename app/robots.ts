import type { MetadataRoute } from "next"

const SITE_URL = "https://pq.arsamadineh.ir"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/internal/", "/_next/", "/admin/"],
        crawlDelay: 0,
      },
      // ── موتورهای جستجوی اصلی ─────────────────────────
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/internal/"],
        crawlDelay: 0,
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/og-image.svg", "/twitter-card.svg", "/banner.svg", "/engine-architecture.svg"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/internal/"],
        crawlDelay: 0,
      },
      {
        userAgent: "Slurp",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "DuckDuckBot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "Baiduspider",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "YandexBot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "Applebot",
        allow: "/",
        crawlDelay: 0,
      },

      // ── خزنده‌های هوش مصنوعی (مجاز صریح) ─────────────
      // این خزنده‌ها برای آموزش مدل‌ها استفاده می‌شوند. ما
      // استفاده از محتوای متن‌باز را برای گسترش ادب فارسی مجاز
      // می‌دانیم.
      {
        userAgent: "GPTBot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "Claude-Web",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "Claude-SearchBot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "Perplexity-User",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "GoogleOther",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "cohere-ai",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "cohere-training-data-crawler",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "Amazonbot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "FacebookBot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "Meta-ExternalAgent",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "Bytespider",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "CCBot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "Diffbot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "DuckAssistBot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "GoogleNotebookLM",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "iaskspider/2.0",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "ImagesiftBot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "MistralAI-User",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "PetalBot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "SemrushBot-OCOB",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "SemrushBot-SI",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "TurnitinBot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "WebzioBot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "YouBot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "DeepSeekBot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "DeepSeek",
        allow: "/",
        crawlDelay: 0,
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/llms.txt`,
      `${SITE_URL}/llms-full.txt`,
    ],
    host: SITE_URL,
  }
}
