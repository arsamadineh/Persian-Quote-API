"use client"
import { useState } from "react"
import { TypographyCanvas } from "@/components/typography-canvas"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Code, Heart, Menu, Search, Star, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">API اشعار فارسی</h1>
                <p className="text-sm text-muted-foreground">Persian Quotes API</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/docs" className="text-foreground hover:text-primary transition-colors font-medium">
                مستندات
              </Link>
              <Link href="/examples" className="text-foreground hover:text-primary transition-colors font-medium">
                نمونه‌ها
              </Link>
              <Link href="/contribute" className="text-foreground hover:text-primary transition-colors font-medium">
                مشارکت
              </Link>
              <a href="https://github.com/arsamadineh/Persian-Quote-API" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="persian-button bg-transparent">
                  <Code className="w-4 h-4 ml-2" />
                  GitHub
                </Button>
              </a>
            </nav>
            <div className="md:hidden">
              <Button variant="outline" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </div>
          </div>
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-card/95 backdrop-blur-sm shadow-lg">
              <nav className="flex flex-col items-center gap-4 py-6">
                <Link
                  href="/docs"
                  className="text-foreground hover:text-primary transition-colors font-medium text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  مستندات
                </Link>
                <Link
                  href="/examples"
                  className="text-foreground hover:text-primary transition-colors font-medium text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  نمونه‌ها
                </Link>
                <a href="https://github.com/arsamadineh/Persian-Quote-API" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="persian-button bg-transparent mt-2">
                    <Code className="w-4 h-4 ml-2" />
                    GitHub
                  </Button>
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-20 px-4 relative overflow-hidden">
        <div className="hero-pattern"></div>
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4 text-sm px-4 py-2 shadow-sm">
              🌟 رایگان و متن‌باز
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              گنجینه‌ای از
              <span className="text-primary block mt-2 relative">
                اشعار فارسی
                <div className="absolute -bottom-2 right-1/2 transform translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary to-accent rounded-full opacity-30"></div>
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              دسترسی آسان به هزاران بیت از اشعار بزرگان ادب فارسی شامل مولانا، حافظ، سعدی، فردوسی و دیگر شاعران بزرگ
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 persian-button shadow-lg">
              <BookOpen className="w-5 h-5 ml-2" />
              شروع کنید
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 persian-button bg-transparent"
            >
              <Code className="w-5 h-5 ml-2" />
              مشاهده مستندات
            </Button>
            <Link href="/contribute">
              <Button
                variant="outline"
                size="lg"
                className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 persian-button bg-transparent border-primary/30 hover:bg-primary/10"
              >
                <Heart className="w-5 h-5 ml-2 text-primary" />
                مشارکت در افزودن اشعار
              </Button>
            </Link>
          </div>

          {/* Sample Quote Card */}
          <Card className="quote-card max-w-2xl mx-auto p-6 md:p-8 text-center">
            <CardContent className="pt-6">
              <blockquote className="persian-quote text-xl md:text-2xl lg:text-3xl font-semibold text-foreground leading-relaxed mb-4">
                عاشقان مرده‌اند در عشق زنده
                <br />
                تا ابد در دل جانان پاینده
              </blockquote>
              <footer className="poet-attribution">مولانا جلال‌الدین رومی</footer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">ویژگی‌های API</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ابزاری قدرتمند برای دسترسی به گنجینه ادب فارسی
            </p>
            <div className="decorative-border w-24 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="feature-card text-center p-6 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">جستجوی پیشرفته</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  جستجو در متن اشعار، نام شاعران و موضوعات مختلف با قابلیت فیلتر پیشرفته
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="feature-card text-center p-6 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">شاعران مشهور</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  اشعار از بزرگان ادب فارسی: مولانا، حافظ، سعدی، فردوسی، خیام و بسیاری دیگر
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="feature-card text-center p-6 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">دسته‌بندی موضوعی</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  اشعار بر اساس موضوعات مختلف: عشق، عرفان، حکمت، طبیعت و موضوعات دیگر
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="feature-card text-center p-6 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">RESTful API</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  API ساده و استاندارد با پشتیبانی از JSON و قابلیت استفاده در هر پلتفرم
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="feature-card text-center p-6 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">رایگان و متن‌باز</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  استفاده کاملاً رایگان بدون محدودیت با کد منبع باز در GitHub
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="feature-card text-center p-6 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">ترجمه انگلیسی</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  بسیاری از اشعار همراه با ترجمه انگلیسی برای دسترسی جهانی
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* API Preview Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">نمونه استفاده از API</h3>
            <p className="text-lg text-muted-foreground">با چند خط کد ساده به گنجینه اشعار فارسی دسترسی پیدا کنید</p>
            <div className="decorative-border w-24 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 shadow-lg border-2 border-transparent hover:border-primary/20 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  دریافت شعر تصادفی
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto shadow-inner" dir="ltr">
                  <code className="whitespace-pre-wrap">{`GET /api/quotes?random=true&limit=1

{
  "success": true,
  "data": [{
    "text_persian": "عاشقان مرده‌اند در عشق زنده",
    "text_english": "Lovers are dead in love, alive",
    "poet": "مولانا جلال‌الدین رومی",
    "poet_english": "Rumi",
    "category": "عشق"
  }]
}`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card className="p-6 shadow-lg border-2 border-transparent hover:border-primary/20 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  جستجو در اشعار
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto shadow-inner" dir="ltr">
                  <code className="whitespace-pre-wrap">{`GET /api/quotes/search?q=عشق&limit=5

{
  "success": true,
  "data": [...],
  "count": 5,
  "query": "عشق"
}`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
          {/* Typography Canvas Section */}
          <section id="typography-canvas" className="w-full max-w-6xl mx-auto mb-20 px-4 md:px-0 mt-20">
            <div className="flex flex-col items-center gap-4 text-center mb-8">
              <h2 className="text-3xl font-bold font-vazirmatn">بوم تایپوگرافی پیشرفته</h2>
              <p className="text-muted-foreground text-lg font-serif">Advanced Typography Canvas</p>
            </div>
            <TypographyCanvas />
          </section>

      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                  <BookOpen className="w-5 h-5 text-primary-foreground" />
                </div>
                <h4 className="text-lg font-semibold">API اشعار فارسی</h4>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                گنجینه‌ای از بهترین اشعار شاعران بزرگ فارسی برای استفاده در پروژه‌های شما
              </p>
            </div>

            <div>
              <h5 className="font-semibold mb-4">پشتیبانی</h5>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="https://github.com/arsamadineh/Persian-Quote-API"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/arsamadineh/Persian-Quote-API/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    مسائل و پیشنهادات
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/arsamadineh/Persian-Quote-API/blob/main/CONTRIBUTING.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    راهنمای مشارکت
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <span>© ۱۴۰۴ API اشعار فارسی. تمامی حقوق محفوظ است.</span>
              <span className="text-primary">❦</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
