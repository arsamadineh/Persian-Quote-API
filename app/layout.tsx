import type React from "react"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Vazirmatn } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { UpdateModal } from "@/components/update-modal"
import { ThemeProvider } from "@/components/theme-provider"
import { CommandBar } from "@/components/command-bar"

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-vazirmatn",
})

const SITE_URL = "https://pq.arsamadineh.ir"
const SITE_NAME = "API اشعار فارسی"
const SITE_NAME_EN = "Persian Quotes API"
const TWITTER_HANDLE = "@dev_arsam"

// ── Viewport برای موبایل و PWA ─────────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
  colorScheme: "light dark",
}

// ── Metadata اصلی سایت ─────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_NAME_EN}: رایگان، متن‌باز، بدون نیاز به کلید`,
    template: `%s | ${SITE_NAME}`,
  },
  applicationName: SITE_NAME,
  generator: "Next.js 15",
  keywords: [
    // فارسی - کلیدی
    "API اشعار فارسی",
    "اشعار فارسی",
    "شعر فارسی",
    "گنجینه اشعار",
    "ادبیات فارسی",
    "شعر کلاسیک فارسی",
    "شعر نو فارسی",
    "نقل‌قول فارسی",
    "سخنان بزرگان",
    "API رایگان فارسی",
    "متن‌باز",
    "موتور تیغ",
    "موتور API فارسی",
    "موتور تیغ API",
    "Tigh engine",
    "حافظ",
    "مولانا",
    "سعدی",
    "فردوسی",
    "نیما یوشیج",
    "سهراب سپهری",
    "خیام",
    "فال حافظ",
    "دیوان حافظ",
    "مثنوی",
    "شاهنامه",
    "غزلیات",
    "رباعیات",
    "سخنان بزرگان",
    "ضرب‌المثل فارسی",
    // English
    "Persian poetry API",
    "Persian quotes API",
    "Farsi poetry",
    "Rumi API",
    "Hafez API",
    "Saadi quotes",
    "Ferdowsi API",
    "Persian literature",
    "Iranian poetry",
    "free poetry API",
    "open source API",
    "REST API Persian",
    "Tigh engine",
    "Tigh API engine",
    "Persian poetry database",
    "embeddable widget",
    "no auth API",
    "MIT license API",
    "next.js API",
    "Node.js Persian",
    "Bun runtime",
  ],
  authors: [
    { name: "آرسام آدینه", url: "https://arsamadineh.ir" },
    { name: "Arsam Adineh" },
  ],
  creator: "آرسام آدینه",
  publisher: "آرسام آدینه",
  category: "Developer API",
  classification: "Free Persian Poetry API, Open Source REST API",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "fa-IR": "/",
      "x-default": "/",
      en: "/",
    },
    types: {
      "application/llms+json": `${SITE_URL}/llms.txt`,
    },
  },
  description:
    "API رایگان و متن‌باز برای دسترسی به گنجینه‌ای از اشعار شاعران بزرگ فارسی شامل مولانا، حافظ، سعدی، فردوسی، نیما یوشیج، و سهراب سپهری، به همراه سخنان بزرگان جهان. شامل دیوان کامل حافظ، ۴۴۰۰+ شعر نو، و ۴۹۰+ نقل‌قول غیرشعری. دارای موتور اختصاصی «تیغ» با مسیریاب Trie، کش LRU، محدودساز نرخ، و مدار شکن خودترمیم. بدون نیاز به ثبت‌نام، بدون کلید API، بدون محدودیت پرداخت.",
  abstract:
    "Persian Quotes API: a free, open-source RESTful service for accessing a curated collection of Persian classical and modern poetry. Includes the Tigh engine, a high-performance TypeScript runtime for routing, caching, and rate-limiting. No signup, no API key, MIT-licensed.",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    alternateLocale: ["en_US"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_NAME_EN}`,
    description:
      "دسترسی آزاد به گنجینه اشعار شاعران بزرگ فارسی: مولانا، حافظ، سعدی، فردوسی، نیما، سهراب. همراه با موتور تیغ برای عملکرد بالا. بدون ثبت‌نام، بدون کلید، رایگان، متن‌باز.",
    countryName: "Iran",
    determiner: "the",
    emails: ["contact@arsamadineh.ir"],
    phoneNumbers: [],
    faxNumbers: [],
    images: [
      {
        url: "/og-image.svg",
        secureUrl: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "API اشعار فارسی - Persian Quotes API - گنجینه‌ای از اشعار شاعران بزرگ فارسی",
        type: "image/svg+xml",
      },
      {
        url: "/banner.svg",
        secureUrl: "/banner.svg",
        width: 1200,
        height: 320,
        alt: "نوار عنوان API اشعار فارسی",
        type: "image/svg+xml",
      },
    ],
    videos: [],
    audio: [],
  },
  twitter: {
    card: "summary_large_image",
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    creatorId: "dev_arsam",
    title: `${SITE_NAME} — ${SITE_NAME_EN}`,
    description:
      "دسترسی آزاد به گنجینه اشعار فارسی و سخنان بزرگان، از طریق API عمومی. همراه با موتور تیغ. رایگان، متن‌باز، بدون نیاز به ثبت‌نام.",
    images: {
      url: "/twitter-card.svg",
      alt: "API اشعار فارسی - توییت کارت",
    },
  },
  appLinks: {
    web: {
      url: SITE_URL,
      should_fallback: true,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml", sizes: "180x180" }],
    other: [
      {
        rel: "mask-icon",
        url: "/icon.svg",
        color: "#f59e0b",
      },
    ],
  },
  manifest: "/manifest.webmanifest",
  other: {
    // ── تأیید هویت موتورهای جستجو ─────────────────
    "google-site-verification": "verification_token_placeholder",
    "msvalidate.01": "bing_verification_token_placeholder",
    "yandex-verification": "yandex_verification_token_placeholder",

    // ── متادیتای عمومی ─────────────────────────────
    "application-name": SITE_NAME,
    "apple-mobile-web-app-title": SITE_NAME,
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
    "theme-color": "#f59e0b",
    "color-scheme": "light dark",
    "format-detection": "telephone=no",
    "HandheldFriendly": "True",
    "MobileOptimized": "320",
    "imagemode": "force",
    "layoutmode": "fitscreen",
    "screen-orientation": "portrait primary",
    "X-FRAME-OPTIONS": "SAMEORIGIN",

    // ── تأیید توزیع‌کنندگان و AI ─────────────────
    "ai-content-declaration": "human-authored, AI-discoverable",
    "content-language": "fa-IR, en-US",
    "rating": "general",
    "distribution": "global",
    "revisit-after": "3 days",
    "expires": "never",
    "pragma": "no-cache",
    "cache-control": "public, max-age=3600",
    "og:locale:alternate": "en_US",

    // ── Dublin Core متادیتا (برای AI Crawlers) ────
    "DC.title": SITE_NAME,
    "DC.creator": "آرسام آدینه",
    "DC.subject": "Persian Poetry, Persian Literature, REST API, Open Source",
    "DC.description":
      "Free open-source API for Persian poetry and quotes with Tigh engine",
    "DC.publisher": "آرسام آدینه",
    "DC.contributor": "آرسام آدینه",
    "DC.date": "2024-03-22",
    "DC.type": "Service",
    "DC.format": "text/html",
    "DC.identifier": SITE_URL,
    "DC.language": "fa",
    "DC.rights": "MIT License (code), Public Domain (content)",
    "DC.coverage": "World",
  },
}

// ── ساختار داده JSON-LD برای موتورهای جستجو ───────────
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: "آرسام آدینه",
      alternateName: "Arsam Adineh",
      url: "https://arsamadineh.ir",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.svg`,
        width: 512,
        height: 512,
      },
      sameAs: [
        "https://github.com/arsamadineh",
        "https://github.com/arsamadineh/Persian-Quote-API",
        "https://x.com/dev_arsam",
        "https://t.me/arsamadineh",
        "https://arsamadineh.ir",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: SITE_NAME_EN,
      description:
        "API رایگان و متن‌باز برای دسترسی به گنجینه اشعار شاعران بزرگ فارسی و سخنان بزرگان جهان.",
      inLanguage: "fa-IR",
      publisher: { "@id": `${SITE_URL}#organization` },
      copyrightYear: 2024,
      copyrightHolder: { "@id": `${SITE_URL}#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/api/quotes/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}#app`,
      name: SITE_NAME,
      alternateName: SITE_NAME_EN,
      url: SITE_URL,
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "REST API",
      operatingSystem: "Any",
      browserRequirements: "Requires modern browser with JavaScript",
      softwareVersion: "3.1.2",
      softwareRequirements: "Internet connection",
      fileSize: "8KB (engine bundle)",
      downloadUrl: "https://github.com/arsamadineh/Persian-Quote-API",
      softwareHelp: {
        "@type": "CreativeWork",
        url: `${SITE_URL}/docs`,
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: SITE_URL,
        seller: { "@id": `${SITE_URL}#organization` },
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "127",
        bestRating: "5",
        worstRating: "1",
      },
      featureList: [
        "بدون نیاز به احراز هویت",
        "بدون نیاز به کلید API",
        "CORS باز برای استفاده در مرورگر",
        "پشتیبانی کامل از UTF-8 و متن فارسی",
        "پاسخ‌های JSON با ساختار یکپارچه",
        "موتور داخلی با مسیریاب Trie",
        "کش LRU با TTL",
        "محدودساز نرخ با سه الگوریتم",
        "مدار شکن خودترمیم‌شونده",
        "متریک زنده و بنچمارک عملکرد",
        "ویجت HTML قابل تعبیه",
        "متن‌باز با مجوز MIT",
      ],
      author: { "@id": `${SITE_URL}#organization` },
      publisher: { "@id": `${SITE_URL}#organization` },
      isAccessibleForFree: true,
      keywords:
        "Persian poetry API, Rumi, Hafez, Saadi, Ferdowsi, Tigh engine, REST API, free, open source, MIT",
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": `${SITE_URL}#tigh-engine`,
      name: "Tigh Engine",
      alternateName: "موتور تیغ",
      description:
        "موتور API با عملکرد بالا، نوشته‌شده در TypeScript خالص. شامل مسیریاب Trie، کش LRU با TTL، محدودساز نرخ با سه استراتژی، مدار شکن، و متریک. صفر وابستگی خارجی، ۸ کیلوبایت bundle.",
      url: `${SITE_URL}/sakhtar`,
      downloadUrl: "https://github.com/arsamadineh/Persian-Quote-API",
      codeRepository: "https://github.com/arsamadineh/Persian-Quote-API",
      programmingLanguage: {
        "@type": "ComputerLanguage",
        name: "TypeScript",
        alternateName: "ts",
      },
      runtimePlatform: ["Node.js", "Bun", "Deno", "Next.js"],
      license: "https://opensource.org/licenses/MIT",
      creator: { "@id": `${SITE_URL}#organization` },
      dateCreated: "2026-07-04",
      dateModified: "2026-07-04",
      version: "0.0.1-beta",
      keywords:
        "Trie router, LRU cache, rate limiter, circuit breaker, metrics, middleware, zero dependencies, TypeScript",
      isAccessibleForFree: true,
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "خانه",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "مستندات",
          item: `${SITE_URL}/docs`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "موتور تیغ",
          item: `${SITE_URL}/sakhtar`,
        },
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" className="rtl" suppressHydrationWarning>
      <head>
        {/* JSON-LD structured data برای موتورهای جستجو و AI */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* لینک‌های متفرقه برای AI Crawlers */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs.txt" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="LLMs Full" />
        <link rel="contents" href="/changelog" title="تاریخچه تغییرات" />
        <link rel="author" href="https://arsamadineh.ir" title="آرسام آدینه" />
        <link rel="me" href="https://github.com/arsamadineh" />
        <link rel="me" href="https://x.com/dev_arsam" />
        {/* Preconnect برای عملکرد بهتر */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.github.com" />
        {/* فیلتر کنسول: پیام پیشنهاد نصب React DevTools را در محیط توسعه حذف می‌کند
            بدون تأثیر روی سایر لاگ‌ها (debug/warn/error دست‌نخورده باقی می‌مانند) */}
        <Script
          id="console-devtools-filter"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m='Download the React DevTools';var d=console.debug;if(typeof d==='function'){console.debug=function(){var a=arguments;if(a[0]&&typeof a[0]==='string'&&a[0].indexOf(m)!==-1)return;return d.apply(console,a);};}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${vazirmatn.variable} font-vazirmatn persian-text antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <UpdateModal />
            <CommandBar />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
