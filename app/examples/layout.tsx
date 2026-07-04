import type { Metadata } from "next"

const SITE_URL = "https://pq.arsamadineh.ir"
const PAGE_URL = `${SITE_URL}/examples`

export const metadata: Metadata = {
  title: "نمونه‌های کاربردی — کد واقعی برای API اشعار فارسی",
  description:
    "نمونه کد تعاملی برای API اشعار فارسی در cURL، JavaScript، Python، PHP، و Go. تست زنده اندپوینت‌ها، نمایش خروجی JSON، و چهار سناریوی واقعی برای استفاده در اپلیکیشن.",
  keywords: [
    "نمونه کد API فارسی",
    "Persian API code examples",
    "JavaScript fetch API",
    "Python requests example",
    "PHP cURL example",
    "API testing",
    "live API demo",
  ],
  alternates: {
    canonical: "/examples",
  },
  openGraph: {
    title: "نمونه کد برای API اشعار فارسی",
    description: "نمونه تعاملی در چند زبان برنامه‌نویسی + تست زنده.",
    url: PAGE_URL,
    type: "website",
  },
  twitter: {
    title: "نمونه کد API اشعار فارسی",
    description: "تست زنده در cURL، JavaScript، Python، PHP و Go.",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Course",
      "@id": `${PAGE_URL}#course`,
      name: "نمونه‌های کاربردی API اشعار فارسی",
      description: "نمونه کد تعاملی برای استفاده از API در پروژه‌های واقعی.",
      provider: { "@id": `${SITE_URL}#organization` },
      inLanguage: "fa-IR",
      educationalLevel: "Beginner",
      isAccessibleForFree: true,
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: "PT15M",
      },
    },
    {
      "@type": "HowTo",
      name: "نمایش شعر روز در سایت",
      description: "هر روز یک شعر جدید به بازدیدکنندگان نشان دهید.",
      totalTime: "PT5M",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "تنظیم seed بر اساس تاریخ",
          text: "از تاریخ روز به عنوان seed برای انتخاب شعر استفاده کنید.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "دریافت ۱۰۰ شعر",
          text: "یک درخواست با limit=100 ارسال و در سمت کلاینت انتخاب کنید.",
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "خانه", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "نمونه‌ها", item: PAGE_URL },
      ],
    },
  ],
}

export default function ExamplesLayout({ children }: { children: React.ReactNode }) {
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
