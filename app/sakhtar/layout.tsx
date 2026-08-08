// لایه مسیر /sakhtar — معرفی موتور تیغ.
// metadata اینجا تعریف می‌شود چون صفحه اصلی client component است.

import type { Metadata } from "next"

const SITE_URL = "https://pq.arsamadineh.ir"
const PAGE_URL = `${SITE_URL}/sakhtar`

export const metadata: Metadata = {
  title: "موتور تیغ — موتور API فارسی با Trie Router، LRU Cache، و Circuit Breaker",
  description:
    "موتور تیغ: اولین موتور API متن‌باز فارسی برای پردازش درخواست‌های HTTP. شامل مسیریاب Trie با O(۱)، کش LRU با TTL، محدودساز نرخ با سه الگوریتم، مدار شکن خودترمیم، متریک P50-P99، و اداپتور Next.js. TypeScript خالص و مجوز MIT.",
  keywords: [
    "موتور تیغ",
    "Tigh engine",
    "موتور API فارسی",
    "Trie router",
    "LRU cache",
    "rate limiter",
    "circuit breaker",
    "middleware pipeline",
    "metrics",
    "TypeScript engine",
    "zero dependencies",
    "Next.js adapter",
    "REST engine Persian",
  ],
  alternates: {
    canonical: "/sakhtar",
  },
  openGraph: {
    title: "موتور تیغ — موتور API فارسی با عملکرد بالا",
    description:
      "موتور API متن‌باز فارسی با مسیریاب Trie، کش LRU، محدودساز نرخ، مدار شکن و متریک زنده.",
    url: PAGE_URL,
    type: "article",
    images: [
      {
        url: "/og-image.svg",
        alt: "موتور تیغ - Tigh Engine",
      },
    ],
  },
  twitter: {
    title: "موتور تیغ — موتور API فارسی",
    description:
      "موتور API با Trie Router، LRU Cache، Rate Limiter، Circuit Breaker و TypeScript خالص.",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareSourceCode",
      "@id": `${PAGE_URL}#tigh`,
      name: "Tigh Engine",
      alternateName: "موتور تیغ",
      description:
        "موتور API با عملکرد بالا، نوشته‌شده در TypeScript خالص. شامل مسیریاب Trie، کش LRU با TTL، محدودساز نرخ با سه استراتژی (Token Bucket، Sliding Window، Fixed Window)، مدار شکن خودترمیم‌شونده با سه حالت (Closed، Open، Half-Open)، متریک با حافظه حلقوی و محاسبه P50-P99، و پایپلاین Middleware با CORS، زمان‌سنجی، و فشرده‌سازی. مجوز MIT.",
      url: PAGE_URL,
      downloadUrl: "https://github.com/arsamadineh/Persian-Quote-API",
      codeRepository: "https://github.com/arsamadineh/Persian-Quote-API",
      programmingLanguage: {
        "@type": "ComputerLanguage",
        name: "TypeScript",
        alternateName: "ts",
      },
      runtimePlatform: ["Node.js", "Bun", "Deno"],
      targetProduct: {
        "@type": "SoftwareApplication",
        name: "Next.js",
        applicationCategory: "WebFramework",
      },
      license: "https://opensource.org/licenses/MIT",
      creator: { "@id": `${SITE_URL}#organization` },
      dateCreated: "2026-07-04",
      dateModified: "2026-08-08",
      version: "0.0.1-beta",
      fileSize: "اندازه در زمان build تعیین می‌شود",
      keywords:
        "Trie router, LRU cache, rate limiter, circuit breaker, metrics, middleware, zero dependencies, TypeScript, API engine, Persian",
      isAccessibleForFree: true,
    },
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "موتور تیغ: معماری و ماژول‌ها",
      description:
        "بررسی کامل معماری موتور تیغ شامل Trie Router، TighCache، TighRateLimiter، TighCircuitBreaker، TighMetrics، و TighMiddleware.",
      inLanguage: "fa-IR",
      author: { "@id": `${SITE_URL}#organization` },
      publisher: { "@id": `${SITE_URL}#organization` },
      mainEntityOfPage: { "@type": "WebPage", "@id": PAGE_URL },
      articleSection: "Engine Architecture",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "خانه", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "موتور تیغ", item: PAGE_URL },
      ],
    },
  ],
}

export default function SakhtarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
