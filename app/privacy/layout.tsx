import type { Metadata } from "next"

const SITE_URL = "https://pq.arsamadineh.ir"
const PAGE_URL = `${SITE_URL}/privacy`

export const metadata: Metadata = {
  title: "سیاست حریم خصوصی",
  description:
    "سیاست حریم خصوصی API اشعار فارسی. بدون ثبت‌نام، بدون ردیابی، بدون کوکی، بدون تحلیل رفتار. فلسفه ما: یک سرویس رایگان نباید بهای حریم خصوصی شما را بپردازد.",
  keywords: ["حریم خصوصی", "privacy policy", "GDPR", "data protection"],
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "سیاست حریم خصوصی",
    description: "بدون ثبت‌نام، بدون ردیابی، بدون کوکی، بدون تحلیل.",
    url: PAGE_URL,
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#page`,
      name: "سیاست حریم خصوصی API اشعار فارسی",
      description: "سیاست شفاف درباره عدم جمع‌آوری داده‌های شخصی.",
      inLanguage: "fa-IR",
      isPartOf: { "@id": `${SITE_URL}#website` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "خانه", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "سیاست حریم خصوصی", item: PAGE_URL },
      ],
    },
  ],
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
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
