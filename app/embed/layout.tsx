import type { Metadata } from "next"

const SITE_URL = "https://pq.arsamadineh.ir"
const PAGE_URL = `${SITE_URL}/embed`

export const metadata: Metadata = {
  title: "سازنده ویجت — ویجت قابل تعبیه اشعار فارسی",
  description:
    "سازنده ویجت HTML برای نمایش اشعار فارسی در سایت شخص ثالث. پنج قالب ظاهری، سه اندازه، فیلتر شاعر و موضوع، نمایش ترجمه انگلیسی، و تازه‌سازی خودکار. کپی کد iframe و قرار دادن در سایت.",
  keywords: [
    "ویجت اشعار فارسی",
    "Persian poetry widget",
    "embeddable widget",
    "iframe widget",
    "quote widget",
    "شعر برای سایت",
  ],
  alternates: {
    canonical: "/embed",
  },
  openGraph: {
    title: "سازنده ویجت اشعار فارسی",
    description: "ویجت HTML قابل تعبیه در سایت شخص ثالث. پنج قالب، سه اندازه، فیلتر کامل.",
    url: PAGE_URL,
    type: "website",
  },
  twitter: {
    title: "ویجت اشعار فارسی",
    description: "سازنده ویجت قابل تعبیه برای سایت شما.",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${PAGE_URL}#widget`,
      name: "سازنده ویجت اشعار فارسی",
      description: "ابزار آنلاین برای ساخت ویجت HTML قابل تعبیه در سایت شخص ثالث.",
      applicationCategory: "MultimediaApplication",
      applicationSubCategory: "Widget Builder",
      operatingSystem: "Any",
      browserRequirements: "Modern browser with JavaScript",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      isAccessibleForFree: true,
      featureList: [
        "پنج قالب ظاهری",
        "سه اندازه",
        "فیلتر شاعر و موضوع",
        "نمایش ترجمه انگلیسی",
        "تازه‌سازی خودکار",
        "کد iframe آماده",
      ],
    },
    {
      "@type": "HowTo",
      name: "تعبیه ویجت در سایت",
      description: "نحوه قرار دادن ویجت اشعار فارسی در سایت شخص ثالث.",
      totalTime: "PT2M",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "تنظیم ظاهر ویجت",
          text: "قالب، اندازه، شاعر، و موضوع را در سازنده انتخاب کنید.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "کپی کد iframe",
          text: "کد HTML تولیدشده را کپی کنید.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "قرار دادن در سایت",
          text: "کد را در هر بخشی از سایت خود paste کنید.",
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "خانه", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "سازنده ویجت", item: PAGE_URL },
      ],
    },
  ],
}

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
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
