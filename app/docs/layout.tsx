// لایه مسیر /docs — تنها برای صدور metadata سئو.
// صفحه اصلی app/docs/page.tsx یک client component است،
// بنابراین metadata باید در این لایه server component تعریف شود.

import type { Metadata } from "next"

const SITE_URL = "https://pq.arsamadineh.ir"
const PAGE_URL = `${SITE_URL}/docs`

export const metadata: Metadata = {
  title: "مستندات API — مرجع کامل اندپوینت‌ها و موتور تیغ",
  description:
    "مستندات کامل API اشعار فارسی: مرجع همه اندپوینت‌ها، معماری موتور تیغ (Trie Router، LRU Cache، Rate Limiter، Circuit Breaker، Metrics)، راهنمای شروع سریع، فورک و توسعه، و پرامپت‌های آماده برای دستیارهای کدنویسی.",
  keywords: [
    "مستندات API فارسی",
    "Persian API documentation",
    "مرجع API",
    "Tigh engine docs",
    "Trie router documentation",
    "LRU cache implementation",
    "rate limiter",
    "circuit breaker pattern",
    "API documentation Persian poetry",
  ],
  alternates: {
    canonical: "/docs",
  },
  openGraph: {
    title: "مستندات API اشعار فارسی و موتور تیغ",
    description:
      "مرجع کامل اندپوینت‌ها، معماری موتور، و راهنمای توسعه. شامل نمونه کد در cURL، JavaScript، Python، PHP و Go.",
    url: PAGE_URL,
    type: "article",
    images: [
      {
        url: "/og-image.svg",
        alt: "مستندات API اشعار فارسی",
      },
    ],
  },
  twitter: {
    title: "مستندات API اشعار فارسی",
    description: "مرجع کامل اندپوینت‌ها و موتور تیغ با نمونه کد در چند زبان.",
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "مستندات API اشعار فارسی و موتور تیغ",
      description:
        "مرجع کامل اندپوینت‌ها، معماری موتور، و راهنمای توسعه برای API اشعار فارسی.",
      inLanguage: "fa-IR",
      author: { "@id": `${SITE_URL}#organization` },
      publisher: { "@id": `${SITE_URL}#organization` },
      datePublished: "2024-03-22",
      dateModified: "2026-07-04",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": PAGE_URL,
      },
      articleSection: "Documentation",
      keywords:
        "API, Persian poetry, Tigh engine, REST API, TypeScript, open source",
      proficiencyLevel: "Beginner",
    },
    {
      "@type": "HowTo",
      "@id": `${PAGE_URL}#quickstart`,
      name: "شروع سریع با API اشعار فارسی",
      description:
        "اولین درخواست HTTP در کمتر از ۳۰ ثانیه، بدون ثبت‌نام و بدون کلید API.",
      totalTime: "PT30S",
      estimatedCost: {
        "@type": "MonetaryAmount",
        currency: "USD",
        value: "0",
      },
      tool: [
        { "@type": "HowToTool", name: "cURL" },
        { "@type": "HowToTool", name: "مرورگر" },
        { "@type": "HowToTool", name: "Node.js" },
      ],
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "دریافت شعر تصادفی",
          text: "یک درخواست GET به آدرس /api/quotes?random=true&limit=1 ارسال کنید.",
          url: `${PAGE_URL}#quickstart`,
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "دریافت فال حافظ",
          text: "به آدرس /api/quotes/hafez?random=true&limit=1 درخواست بفرستید.",
          url: `${PAGE_URL}#hafez`,
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "جستجو در اشعار",
          text: "از اندپوینت /api/quotes/search?q=کلمه استفاده کنید.",
          url: `${PAGE_URL}#search`,
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "آیا برای استفاده از API به ثبت‌نام نیاز دارم؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "خیر. تمام اندپوینت‌ها کاملاً عمومی هستند و بدون نیاز به کلید یا توکن قابل استفاده‌اند.",
          },
        },
        {
          "@type": "Question",
          name: "هزینه استفاده چقدر است؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "رایگان. بدون محدودیت پرداخت. تنها رعایت استفاده منصفانه (حداکثر ۱۲۰ درخواست در دقیقه) لازم است.",
          },
        },
        {
          "@type": "Question",
          name: "چه شاعرانی در پایگاه داده موجود است؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "مولانا، حافظ، سعدی، فردوسی، نیما یوشیج، سهراب سپهری، خیام، و ده‌ها شاعر دیگر.",
          },
        },
        {
          "@type": "Question",
          name: "آیا ترجمه انگلیسی اشعار موجود است؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "بله. بخش عمده‌ای از اشعار شامل ترجمه انگلیسی در فیلد text_english هستند.",
          },
        },
        {
          "@type": "Question",
          name: "موتور تیغ چیست؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "موتور اختصاصی پروژه برای مسیریابی، کش، محدودسازی نرخ، و جمع‌آوری متریک. TypeScript خالص.",
          },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "خانه", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "مستندات", item: PAGE_URL },
      ],
    },
  ],
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
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
