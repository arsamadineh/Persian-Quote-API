import type { Metadata } from "next"

const SITE_URL = "https://pq.arsamadineh.ir"
const PAGE_URL = `${SITE_URL}/terms`

export const metadata: Metadata = {
  title: "شرایط استفاده",
  description:
    "شرایط و قوانین استفاده از API اشعار فارسی. مجوز MIT برای کد، مالکیت عمومی برای اشعار. استفاده مجاز، استفاده ممنوع، محدودیت‌های نرخ، و سلب مسئولیت.",
  keywords: ["شرایط استفاده", "terms of service", "MIT license", "استفاده مجاز"],
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "شرایط استفاده",
    description: "مجوز MIT برای کد، مالکیت عمومی برای اشعار.",
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
      name: "شرایط استفاده API اشعار فارسی",
      description: "شرایط و قوانین استفاده از سرویس.",
      inLanguage: "fa-IR",
      isPartOf: { "@id": `${SITE_URL}#website` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "خانه", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "شرایط استفاده", item: PAGE_URL },
      ],
    },
  ],
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
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
