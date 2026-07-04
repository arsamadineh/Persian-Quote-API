import type { Metadata } from "next"

const SITE_URL = "https://pq.arsamadineh.ir"
const PAGE_URL = `${SITE_URL}/changelog`

export const metadata: Metadata = {
  title: "تغییرات — تاریخچه نسخه‌ها",
  description:
    "تاریخچه کامل نسخه‌های API اشعار فارسی: قابلیت‌های جدید، بهبودها، رفع خطاها، و حذف‌ها. هر تغییر در این صفحه در فایل lib/changelog.ts ثبت شده است.",
  keywords: ["changelog", "تاریخچه تغییرات", "release notes", "Persian API versions"],
  alternates: {
    canonical: "/changelog",
  },
  openGraph: {
    title: "تغییرات API اشعار فارسی",
    description: "تاریخچه کامل نسخه‌ها، بهبودها و رفع خطاها.",
    url: PAGE_URL,
    type: "website",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#page`,
      name: "تغییرات API اشعار فارسی",
      description: "تاریخچه کامل نسخه‌ها، بهبودها، رفع خطاها.",
      inLanguage: "fa-IR",
      isPartOf: { "@id": `${SITE_URL}#website` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "خانه", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "تغییرات", item: PAGE_URL },
      ],
    },
  ],
}

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
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
