import Link from "next/link"
import { Github, Twitter, Send, Mail, ArrowUpRight, Code, BookOpen, Users, History, Globe } from "lucide-react"

export function Footer() {
  // سال شمسی جاری برای نمایش در کپی‌رایت
  const shamsiYear = "۱۴۰۵"

  return (
    <footer className="border-t border-border bg-background mt-12">
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {/* ═══ بخش اصلی: برند + پیوندها ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 mb-8 sm:mb-10">
          {/* برند — تمام عرض در موبایل، ۵ ستون در دسکتاپ */}
          <div className="sm:col-span-2 lg:col-span-5 flex flex-col items-center sm:items-start gap-4 text-center sm:text-right">
            <Link href="/" className="inline-block transition-opacity hover:opacity-80">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                API اشعار فارسی
              </span>
            </Link>
            <p className="text-muted-foreground leading-relaxed text-sm max-w-md">
              دسترسی آزاد به گنجینه‌ای از اشعار شاعران بزرگ فارسی برای توسعه‌دهندگان.
              این پروژه به‌طور کامل توسط آرسام آدینه ساخته و تامین مالی شده است.
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 mt-1">
              <a
                href="https://github.com/arsamadineh/Persian-Quote-API"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="گیت‌هاب"
                className="w-11 h-11 sm:w-9 sm:h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/dev_arsam"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (توییتر)"
                className="w-11 h-11 sm:w-9 sm:h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://t.me/arsamadineh"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="تلگرام"
                className="w-11 h-11 sm:w-9 sm:h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@arsamadineh.ir"
                aria-label="ایمیل"
                className="w-11 h-11 sm:w-9 sm:h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* منابع — تمام عرض در موبایل، ۳ ستون در دسکتاپ */}
          <div className="lg:col-span-3 text-center sm:text-right">
            <h4 className="text-foreground font-semibold mb-3 sm:mb-4 text-sm">
              منابع
            </h4>
            <ul className="space-y-2.5 sm:space-y-3 text-sm">
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 py-1">
                  <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                  مستندات API
                </Link>
              </li>
              <li>
                <Link href="/examples" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 py-1">
                  <Code className="w-3.5 h-3.5 flex-shrink-0" />
                  کدهای نمونه
                </Link>
              </li>
              <li>
                <Link href="/embed" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 py-1">
                  <Users className="w-3.5 h-3.5 flex-shrink-0" />
                  ویجت آماده
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 py-1">
                  <History className="w-3.5 h-3.5 flex-shrink-0" />
                  تغییرات
                </Link>
              </li>
            </ul>
          </div>

          {/* توسعه‌دهنده — تمام عرض در موبایل، ۴ ستون در دسکتاپ */}
          <div className="lg:col-span-4 text-center sm:text-right">
            <h4 className="text-foreground font-semibold mb-3 sm:mb-4 text-sm">
              توسعه‌دهنده
            </h4>
            <p className="text-base font-semibold text-foreground mb-3">
              آرسام آدینه
            </p>
            <ul className="space-y-2.5 sm:space-y-2 text-sm">
              <li>
                <a
                  href="https://arsamadineh.ir"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 py-1"
                >
                  <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>وب‌سایت شخصی</span>
                  <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/arsamadineh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 py-1"
                >
                  <Github className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>گیت‌هاب</span>
                  <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/dev_arsam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 py-1"
                >
                  <Twitter className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>X (توییتر)</span>
                  <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/arsamadineh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 py-1"
                >
                  <Send className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>تلگرام</span>
                  <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@arsamadineh.ir"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 py-1 break-all sm:break-normal"
                >
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">contact@arsamadineh.ir</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ═══ نوار پایین: کپی‌رایت + پیوندهای حقوقی ═══ */}
        <div className="pt-6 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-3 text-center sm:text-right">
          <p className="text-muted-foreground text-xs sm:text-sm">
            <span>© {shamsiYear}</span>
            <span className="mx-1.5">·</span>
            <span>تمامی حقوق محفوظ است</span>
          </p>
          <div className="flex items-center justify-center gap-4 sm:gap-5 text-xs sm:text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors py-1">
              حریم خصوصی
            </Link>
            <span className="text-border">|</span>
            <Link href="/terms" className="hover:text-foreground transition-colors py-1">
              شرایط استفاده
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
