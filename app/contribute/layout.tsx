import type { Metadata } from "next"

const SITE_URL = "https://pq.arsamadineh.ir"
const PAGE_URL = `${SITE_URL}/contribute`

export const metadata: Metadata = {
  title: "مشارکت — شعر جدید اضافه کنید",
  description:
    "شعر جدید به پایگاه داده اشعار فارسی اضافه کنید. فرم ساده برای افزودن شعر، شاعر، منبع، و دسته‌بندی. هر مشارکت یک Pull Request در گیت‌هاب ایجاد می‌کند.",
  keywords: [
    "مشارکت در پروژه",
    "contribute poetry",
    "add new quote",
    "افزودن شعر",
    "open source contribution Persian",
  ],
  alternates: {
    canonical: "/contribute",
  },
  openGraph: {
    title: "مشارکت در API اشعار فارسی",
    description: "شعر جدید اضافه کنید. هر مشارکت یک PR در گیت‌هاب ایجاد می‌کند.",
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
      name: "مشارکت در API اشعار فارسی",
      description: "فرم افزودن شعر جدید به پایگاه داده.",
      inLanguage: "fa-IR",
      isPartOf: { "@id": `${SITE_URL}#website` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${SITE_URL}/og-image.svg`,
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "خانه", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "مشارکت", item: PAGE_URL },
      ],
    },
  ],
}

export default function ContributeLayout({ children }: { children: React.ReactNode }) {
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
