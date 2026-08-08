"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Code, Heart, Search, Star, Users, PenTool, Copy, Check, Send, Twitter, Mail, Github, Zap } from "lucide-react"
import Link from "next/link"

function ApiPlayground() {
  const [activeTab, setActiveTab] = useState(0)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState("https://pq.arsamadineh.ir")

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const apiTabs = [
    {
      title: "دریافت شعر تصادفی",
      endpoint: "/api/quotes?random=true&limit=1",
      description: "دریافت یک یا چند بیت شعر به صورت تصادفی از تمام شاعران بزرگ با امکان فیلتر.",
      params: [
        { name: "random", type: "boolean", required: "اختیاری", desc: "دریافت تصادفی (پیش‌فرض true)" },
        { name: "limit", type: "number", required: "اختیاری", desc: "تعداد اشعار بازگشتی (حداکثر ۱۰۰)" },
        { name: "poet", type: "string", required: "اختیاری", desc: "فیلتر براساس نام شاعر (مثال: حافظ)" },
      ],
      response: `{
  "success": true,
  "data": [
    {
      "id": 1,
      "text_persian": "عاشقان مرده‌اند در عشق زنده\\nتا ابد در دل جانان پاینده",
      "text_english": "Lovers are dead in love, yet alive...",
      "poet": "مولانا جلال‌الدین رومی",
      "poet_english": "Rumi",
      "source": "دیوان شمس",
      "category": "عشق",
      "tags": ["عشق", "معنویت"]
    }
  ],
  "count": 1
}`
    },
    {
      title: "فال حافظ (تصادفی)",
      endpoint: "/api/quotes/hafez?random=true&limit=1",
      description: "دریافت یک غزل کامل از دیوان خواجه حافظ شیرازی برای گرفتن فال یا مطالعه غزل.",
      params: [
        { name: "id", type: "number", required: "اختیاری", desc: "دریافت غزل با شماره مشخص (۱ تا ۵۰۰)" },
        { name: "random", type: "boolean", required: "اختیاری", desc: "دریافت یک غزل تصادفی (فال)" },
        { name: "q", type: "string", required: "اختیاری", desc: "جستجو در متن غزل‌ها" }
      ],
      response: `{
  "success": true,
  "data": [
    {
      "id": 1,
      "verses": [
        ["الا یا ایها الساقی ادر کاسا و ناولها", "که عشق آسان نمود اول ولی افتاد مشکل‌ها"],
        ["به بوی نافه کاخر صبا زان طره بگشاید", "ز تاب جعد مشکینش چه خون افتاد در دل‌ها"]
      ],
      "poet": "حافظ شیرازی",
      "source": "دیوان حافظ"
    }
  ],
  "count": 1,
  "total": 497
}`
    },
    {
      title: "شعر نو معاصر",
      endpoint: "/api/quotes/shereno?random=true&limit=1",
      description: "دسترسی به مجموعه شعر نو معاصر از نیما یوشیج، سهراب سپهری و دیگر شاعران معاصر.",
      params: [
        { name: "poet", type: "string", required: "اختیاری", desc: "نام شاعر نو (نیما یوشیج یا سهراب سپهری)" },
        { name: "title", type: "string", required: "اختیاری", desc: "جستجو در عنوان اشعار" },
        { name: "limit", type: "number", required: "اختیاری", desc: "تعداد اشعار بازگشتی" }
      ],
      response: `{
  "success": true,
  "data": [
    {
      "id": 2,
      "title": "قایق",
      "poem": "من چهره‌ام گرفته/ من قایقم نشسته به خشکی...",
      "poet": "نیما یوشیج",
      "book": "مجموعه اشعار"
    }
  ],
  "count": 1,
  "total": "از پاسخ واقعی API خوانده می‌شود"
}`
    },
    {
      title: "سخنان بزرگان",
      endpoint: "/api/quotes/non-poetry?random=true&limit=1",
      description: "دسترسی به گلچینی از سخنان ارزشمند و کلمات قصار از اندیشمندان جهان.",
      params: [
        { name: "author", type: "string", required: "اختیاری", desc: "فیلتر براساس نام گوینده (مثال: انیشتین)" },
        { name: "limit", type: "number", required: "اختیاری", desc: "تعداد سخنان بازگشتی" }
      ],
      response: `{
  "success": true,
  "data": [
    {
      "id": 2,
      "body": "راه حل صحیح موفقیت این است که اشتیاق شما به پیروزی بیشتر از ترس شما از شکست باشد.",
      "author": "آلبرت انیشتین"
    }
  ],
  "count": 1,
  "total": "از پاسخ واقعی API خوانده می‌شود"
}`
    }
  ]

  const handleCopy = () => {
    const fullUrl = window.location.origin + apiTabs[activeTab].endpoint
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function highlightJson(json: string) {
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
      let cls = 'text-amber-500 dark:text-amber-400'; // string value
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-sky-500 dark:text-sky-400 font-semibold'; // key
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-emerald-500 dark:text-emerald-400 font-semibold'; // boolean
      } else if (/null/.test(match)) {
        cls = 'text-stone-400 font-semibold'; // null
      } else {
        cls = 'text-indigo-500 dark:text-indigo-400'; // number
      }
      return `<span class="${cls}">${match}</span>`;
    });
  }

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Tabs Selector - horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
        {apiTabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveTab(idx)
              setCopied(false)
            }}
            className={`flex-none text-right p-3 md:p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group min-w-[160px] md:min-w-[200px] ${
              activeTab === idx
                ? "bg-card border-primary text-primary shadow-sm ring-1 ring-primary/20"
                : "bg-card/50 border-border hover:border-primary/40 text-foreground/80 hover:text-foreground"
            }`}
          >
            <div className="flex flex-col gap-1">
              <span className="font-bold text-xs md:text-base">{tab.title}</span>
              <span className="text-[10px] md:text-[11px] text-muted-foreground font-mono truncate" dir="ltr">
                {tab.endpoint.split('?')[0]}
              </span>
            </div>
            <div className={`w-2 h-2 rounded-full transition-transform shrink-0 ${activeTab === idx ? "bg-primary scale-125" : "bg-muted-foreground/30 group-hover:bg-primary/50"}`}></div>
          </button>
        ))}
      </div>

      {/* Details & Terminal Side */}
      <div className="flex flex-col gap-4">
        {/* Endpoint Bar */}
        <div className="flex items-center gap-2 bg-card p-2 md:p-3 rounded-xl border border-border/80 shadow-xs">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-2 md:px-3 py-1 font-bold text-xs shrink-0">GET</Badge>
          <div className="flex-1 overflow-x-auto whitespace-nowrap text-[10px] md:text-sm font-mono text-muted-foreground text-left py-1" dir="ltr">
            <span className="text-foreground/45 font-sans">URL: </span>
            <span className="text-foreground/60">{origin}</span>
            <span className="text-primary font-semibold">{apiTabs[activeTab].endpoint}</span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-lg shrink-0 w-8 h-8 hover:bg-muted" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
          </Button>
        </div>

        {/* Description & Params Card */}
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="pt-4 md:pt-6 space-y-3 md:space-y-4 px-3 md:px-6">
            <p className="text-xs md:text-base text-foreground/80 leading-relaxed font-medium">
              {apiTabs[activeTab].description}
            </p>

            <div className="space-y-3">
              <h4 className="font-bold text-xs md:text-sm text-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-primary rounded-full"></span>
                پارامترهای ورودی
              </h4>
              <div className="overflow-x-auto border border-border/60 rounded-lg">
                <table className="w-full text-right text-[11px] md:text-sm border-collapse min-w-[480px]">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
                      <th className="p-2 md:p-3 text-right">نام پارامتر</th>
                      <th className="p-2 md:p-3 text-center">نوع</th>
                      <th className="p-2 md:p-3 text-center">وضعیت</th>
                      <th className="p-2 md:p-3 text-right">توضیحات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-medium">
                    {apiTabs[activeTab].params.map((p, idx) => (
                      <tr key={idx} className="hover:bg-muted/10">
                        <td className="p-2 md:p-3 font-mono text-left font-semibold text-primary" dir="ltr">{p.name}</td>
                        <td className="p-2 md:p-3 text-center font-mono text-muted-foreground text-[10px] md:text-xs">{p.type}</td>
                        <td className="p-2 md:p-3 text-center"><Badge variant="secondary" className="text-[9px] md:text-[10px] py-0.5 px-1.5 md:px-2 bg-muted border border-border">{p.required}</Badge></td>
                        <td className="p-2 md:p-3 text-muted-foreground text-[11px] md:text-sm">{p.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* JSON Terminal Card */}
        <div className="relative rounded-2xl overflow-hidden border border-border bg-stone-950 dark:border-stone-850 shadow-lg flex flex-col min-h-[200px] md:min-h-[300px] max-h-[300px] md:max-h-[400px]">
          {/* Terminal Header */}
          <div className="bg-stone-900 border-b border-stone-800 px-3 md:px-4 py-2 md:py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/80"></div>
            </div>
            <span className="text-[9px] md:text-[11px] font-mono text-stone-400 tracking-wider">RESPONSE_PAYLOAD.JSON</span>
            <div className="w-12"></div>
          </div>
          {/* Terminal Content */}
          <pre className="p-3 md:p-5 font-mono text-[10px] md:text-sm overflow-auto text-left leading-relaxed flex-1 bg-stone-950" dir="ltr">
            <code 
              className="block"
              dangerouslySetInnerHTML={{ __html: highlightJson(apiTabs[activeTab].response) }}
            />
          </pre>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
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
            <Link href="/docs">
              <Button size="lg" className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 persian-button shadow-lg">
                <BookOpen className="w-5 h-5 ml-2" />
                شروع کنید
              </Button>
            </Link>
            <Link href="/docs">
              <Button
                variant="outline"
                size="lg"
                className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 persian-button bg-transparent"
              >
                <Code className="w-5 h-5 ml-2" />
                مشاهده مستندات
              </Button>
            </Link>
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
      <section className="py-12 md:py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">ویژگی‌های API</h3>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              ابزاری قدرتمند برای دسترسی به گنجینه ادب فارسی
            </p>
            <div className="decorative-border w-24 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <Card className="feature-card text-center p-4 md:p-6 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-sm">
                  <Search className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <CardTitle className="text-base md:text-xl">جستجوی پیشرفته</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base leading-relaxed">
                  جستجو در متن اشعار، نام شاعران و موضوعات مختلف با قابلیت فیلتر پیشرفته
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="feature-card text-center p-4 md:p-6 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-sm">
                  <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <CardTitle className="text-base md:text-xl">شاعران مشهور</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base leading-relaxed">
                  اشعار از بزرگان ادب فارسی: مولانا، حافظ، سعدی، فردوسی، خیام و بسیاری دیگر
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="feature-card text-center p-4 md:p-6 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-sm">
                  <Heart className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <CardTitle className="text-base md:text-xl">دسته‌بندی موضوعی</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base leading-relaxed">
                  اشعار بر اساس موضوعات مختلف: عشق، عرفان، حکمت، طبیعت و موضوعات دیگر
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="feature-card text-center p-4 md:p-6 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-sm">
                  <Code className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <CardTitle className="text-base md:text-xl">RESTful API</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base leading-relaxed">
                  API ساده و استاندارد با پشتیبانی از JSON و قابلیت استفاده در هر پلتفرم
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="feature-card text-center p-4 md:p-6 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-sm">
                  <Star className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <CardTitle className="text-base md:text-xl">رایگان و متن‌باز</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base leading-relaxed">
                  استفاده کاملاً رایگان بدون محدودیت با کد منبع باز در GitHub
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="feature-card text-center p-4 md:p-6 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-sm">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <CardTitle className="text-base md:text-xl">ترجمه انگلیسی</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base leading-relaxed">
                  بسیاری از اشعار همراه با ترجمه انگلیسی برای دسترسی جهانی
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="feature-card text-center p-4 md:p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <CardTitle className="text-base md:text-xl">سخنان بزرگان</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-sm md:text-base leading-relaxed">
                  نقل‌قول‌های ارزشمند و الهام‌بخش غیرشعری از اندیشمندان جهان
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="feature-card text-center p-4 md:p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <PenTool className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                </div>
                <CardTitle className="text-base md:text-xl">شعر نو</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-sm md:text-base leading-relaxed">
                  گنجینه‌ای از شعر نو شاعران معاصر مانند نیما یوشیج و سهراب سپهری
                </CardDescription>
              </CardContent>
            </Card>

            <Link href="/sakhtar">
              <Card className="feature-card text-center p-4 md:p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
                  </div>
                  <CardTitle className="text-base md:text-xl">موتور اختصاصی تیغ</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-sm md:text-base leading-relaxed">
                    موتور API با مسیریابی Trie، کش LRU، محدودسازی نرخ، و مدار شکن خودترمیم
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* API Preview Section */}
      <section className="py-12 md:py-20 px-4 bg-muted/10 border-y border-border/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">نمونه استفاده از API</h3>
            <p className="text-base md:text-lg text-muted-foreground">با چند خط کد ساده به گنجینه اشعار فارسی دسترسی پیدا کنید</p>
            <div className="decorative-border w-24 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
          </div>

          <ApiPlayground />
        </div>
      </section>

    </div>
  )
}
