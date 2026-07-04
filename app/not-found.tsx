// not-found.tsx — صفحه ۴۰۴
// در Next.js 15، این فایل باید client component باشد.
// برای افزودن metadata، در یک فایل جداگانه و از طریق route segment metadata
// تعریف می‌شود. در اینجا، فایل کلاینت باقی می‌ماند و metadata از طریق
// segmentConfig در parent layout قابل تعریف است.

import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Search, ArrowRight, BookOpen } from "lucide-react"

export const metadata: Metadata = {
  title: "صفحه یافت نشد — ۴۰۴",
  description: "صفحه مورد نظر شما یافت نشد. به صفحه اصلی بازگردید یا مستندات را مرور کنید.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "صفحه یافت نشد",
    description: "صفحه مورد نظر شما یافت نشد.",
    type: "website",
  },
}

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="hero-pattern"></div>
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -left-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <div className="mb-8">
          <span className="text-[8rem] sm:text-[10rem] md:text-[12rem] font-black text-primary/10 leading-none select-none">
            ۴۰۴
          </span>
        </div>

        <Card className="quote-card max-w-2xl mx-auto p-6 md:p-8 text-center mb-10">
          <CardContent className="pt-4">
            <blockquote className="persian-quote text-xl md:text-2xl font-semibold text-foreground leading-relaxed mb-4">
              سالکی گم کرده است میان راه
              <br />
              هر دری که می‌زند به رویش نه
            </blockquote>
            <footer className="poet-attribution">مولانا جلال‌الدین رومی</footer>
          </CardContent>
        </Card>

        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            صفحه مورد نظر یافت نشد
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
            مانند سالکی که در جستجوی دری است، شما نیز به صفحه‌ای رسیده‌اید که وجود ندارد.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 persian-button shadow-lg">
              <Home className="w-5 h-5 ml-2" />
              بازگشت به خانه
            </Button>
          </Link>
          <Link href="/docs">
            <Button
              variant="outline"
              size="lg"
              className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 persian-button bg-transparent"
            >
              <BookOpen className="w-5 h-5 ml-2" />
              مستندات API
            </Button>
          </Link>
          <Link href="/examples">
            <Button
              variant="outline"
              size="lg"
              className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 persian-button bg-transparent"
            >
              <Search className="w-5 h-5 ml-2" />
              نمونه‌ها
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <Link
            href="/docs"
            className="group flex items-center justify-center gap-2 p-4 rounded-xl border border-border bg-card/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
              مستندات
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
          </Link>
          <Link
            href="/examples"
            className="group flex items-center justify-center gap-2 p-4 rounded-xl border border-border bg-card/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
              کدهای نمونه
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
          </Link>
          <Link
            href="/contribute"
            className="group flex items-center justify-center gap-2 p-4 rounded-xl border border-border bg-card/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
              مشارکت
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  )
}
