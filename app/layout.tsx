import type React from "react"
import type { Metadata } from "next"
import { Vazirmatn } from "next/font/google"
import "./globals.css"

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-vazirmatn",
})

export const metadata: Metadata = {
  title: "API اشعار فارسی - Persian Quotes API",
  description: "مجموعه‌ای از بهترین اشعار شاعران بزرگ فارسی - Collection of the finest Persian poetry quotes",
  generator: "v0.app",
  keywords: "Persian poetry, Rumi, Hafez, Saadi, Ferdowsi, اشعار فارسی, حافظ, مولانا, سعدی",
  authors: [{ name: "Persian Quotes API" }],
  openGraph: {
    title: "API اشعار فارسی - Persian Quotes API",
    description: "مجموعه‌ای از بهترین اشعار شاعران بزرگ فارسی",
    type: "website",
    locale: "fa_IR",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" className="rtl">
      <body className={`${vazirmatn.variable} font-vazirmatn persian-text antialiased`}>{children}</body>
    </html>
  )
}
