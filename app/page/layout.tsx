import type { Metadata } from "next"

const SITE_URL = "https://pq.arsamadineh.ir"

// لایه مسیر / برای metadata و JSON-LD اختصاصی صفحه اصلی.
// صفحه اصلی app/page.tsx یک client component است.

export const metadata: Metadata = {
  // بیشتر metadata در layout.tsx ریشه تعریف شده است. اینجا فقط override برای صفحه اصلی.
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "API اشعار فارسی — Persian Quotes API: رایگان، متن‌باز، بدون نیاز به کلید",
    description:
      "گنجینه‌ای از ۵۰۰۰+ شعر کلاسیک و معاصر فارسی، دیوان کامل حافظ، ۴۴۰۰+ شعر نو، و ۴۹۰+ سخن بزرگان. با موتور اختصاصی تیغ. رایگان، متن‌باز، MIT. بدون ثبت‌نام، بدون کلید API.",
    url: "/",
    type: "website",
  },
  twitter: {
    title: "API اشعار فارسی — Persian Quotes API",
    description: "۵۰۰۰+ شعر، دیوان حافظ، شعر نو، سخنان بزرگان. موتور تیغ. رایگان و متن‌باز.",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}#home`,
      url: SITE_URL,
      name: "API اشعار فارسی - Persian Quotes API",
      description:
        "API رایگان و متن‌باز برای دسترسی به گنجینه اشعار شاعران بزرگ فارسی و سخنان بزرگان جهان.",
      inLanguage: "fa-IR",
      isPartOf: { "@id": `${SITE_URL}#website` },
      about: { "@id": `${SITE_URL}#app` },
      mainEntity: { "@id": `${SITE_URL}#app` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${SITE_URL}/og-image.svg`,
        width: 1200,
        height: 630,
      },
      significantLink: [
        `${SITE_URL}/docs`,
        `${SITE_URL}/sakhtar`,
        `${SITE_URL}/examples`,
        `${SITE_URL}/embed`,
        `${SITE_URL}/contribute`,
        `${SITE_URL}/changelog`,
        "https://github.com/arsamadineh/Persian-Quote-API",
      ],
    },
  ],
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
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
