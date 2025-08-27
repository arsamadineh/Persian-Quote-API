"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QuoteWidget } from "@/components/quote-cards/quote-widget"
import { BookOpen, Code, Play, RefreshCw, Search, Users, Heart, Sparkles } from "lucide-react"
import Link from "next/link"

export default function ExamplesPage() {
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPoet, setSelectedPoet] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [poets, setPoets] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    // Load poets and categories
    Promise.all([fetch("/api/poets"), fetch("/api/categories")]).then(async ([poetsRes, categoriesRes]) => {
      const poetsData = await poetsRes.json()
      const categoriesData = await categoriesRes.json()

      if (poetsData.success) setPoets(poetsData.data)
      if (categoriesData.success) setCategories(categoriesData.data)
    })
  }, [])

  const testApiCall = async (endpoint: string, params: Record<string, string> = {}) => {
    setLoading(true)
    try {
      const url = new URL(endpoint, window.location.origin)
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value)
      })

      const response = await fetch(url.toString())
      const data = await response.json()
      setApiResponse({ endpoint: url.toString(), data, status: response.status })
    } catch (error) {
      setApiResponse({ error: "خطا در دریافت داده‌ها" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">API اشعار فارسی</h1>
                <p className="text-sm text-muted-foreground">نمونه‌های کاربردی</p>
              </div>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-foreground hover:text-primary transition-colors">
                خانه
              </Link>
              <Link href="/docs" className="text-foreground hover:text-primary transition-colors">
                مستندات
              </Link>
              <Link href="/embed" className="text-foreground hover:text-primary transition-colors">
                ویجت
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">نمونه‌های کاربردی و تست زنده</h1>
          <p className="text-xl text-muted-foreground">
            API را به صورت تعاملی تست کنید و نمونه‌های مختلف استفاده را مشاهده کنید
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Interactive API Tester */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" />
                  تست تعاملی API
                </CardTitle>
                <CardDescription>API را به صورت زنده تست کنید و نتایج را مشاهده کنید</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="random" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="random">تصادفی</TabsTrigger>
                    <TabsTrigger value="poet">شاعر</TabsTrigger>
                    <TabsTrigger value="category">دسته</TabsTrigger>
                    <TabsTrigger value="search">جستجو</TabsTrigger>
                  </TabsList>

                  <TabsContent value="random" className="space-y-4">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">دریافت اشعار تصادفی از تمام شاعران</p>
                      <Button
                        onClick={() => testApiCall("/api/quotes", { random: "true", limit: "3" })}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                        ) : (
                          <Play className="w-4 h-4 ml-2" />
                        )}
                        دریافت 3 شعر تصادفی
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="poet" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>انتخاب شاعر</Label>
                        <Select value={selectedPoet} onValueChange={setSelectedPoet}>
                          <SelectTrigger>
                            <SelectValue placeholder="شاعر مورد نظر را انتخاب کنید" />
                          </SelectTrigger>
                          <SelectContent>
                            {poets.map((poet) => (
                              <SelectItem key={poet.id} value={poet.name_persian}>
                                {poet.name_persian}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={() => testApiCall(`/api/quotes/${encodeURIComponent(selectedPoet)}`, { limit: "5" })}
                        disabled={loading || !selectedPoet}
                        className="w-full"
                      >
                        {loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                        ) : (
                          <Users className="w-4 h-4 ml-2" />
                        )}
                        دریافت اشعار {selectedPoet}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="category" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>انتخاب دسته‌بندی</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="دسته‌بندی مورد نظر را انتخاب کنید" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.name_persian}>
                                {category.name_persian}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={() =>
                          testApiCall(`/api/quotes/category/${encodeURIComponent(selectedCategory)}`, { limit: "5" })
                        }
                        disabled={loading || !selectedCategory}
                        className="w-full"
                      >
                        {loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                        ) : (
                          <Heart className="w-4 h-4 ml-2" />
                        )}
                        دریافت اشعار {selectedCategory}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="search" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>کلمه یا عبارت جستجو</Label>
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="مثال: عشق، زندگی، دوستی"
                        />
                      </div>
                      <Button
                        onClick={() => testApiCall("/api/quotes/search", { q: searchQuery, limit: "5" })}
                        disabled={loading || !searchQuery.trim()}
                        className="w-full"
                      >
                        {loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                        ) : (
                          <Search className="w-4 h-4 ml-2" />
                        )}
                        جستجو در اشعار
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* API Response Display */}
            {apiResponse && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" />
                    پاسخ API
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={apiResponse.status === 200 ? "default" : "destructive"}>
                        {apiResponse.status || "خطا"}
                      </Badge>
                      <span className="text-sm text-muted-foreground font-mono ltr:text-left" dir="ltr">
                        {apiResponse.endpoint}
                      </span>
                    </div>
                    <div className="bg-muted rounded-lg overflow-hidden">
                      <div className="bg-muted-foreground/10 px-4 py-2 border-b border-border">
                        <span className="text-xs font-medium text-muted-foreground">JSON Response</span>
                      </div>
                      <pre className="p-4 text-sm overflow-x-auto max-h-96 ltr:text-left" dir="ltr">
                        <code className="language-json">
                          {JSON.stringify(apiResponse.data || apiResponse.error, null, 2)}
                        </code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Live Examples */}
          <div className="space-y-6">
            {/* Widget Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  نمونه ویجت‌ها
                </CardTitle>
                <CardDescription>ویجت‌های مختلف با قالب‌های متنوع</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="elegant" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="elegant">شیک</TabsTrigger>
                    <TabsTrigger value="minimal">مینیمال</TabsTrigger>
                    <TabsTrigger value="classic">کلاسیک</TabsTrigger>
                  </TabsList>

                  <TabsContent value="elegant">
                    <QuoteWidget theme="elegant" size="medium" showEnglish={false} />
                  </TabsContent>

                  <TabsContent value="minimal">
                    <QuoteWidget theme="minimal" size="small" showEnglish={true} />
                  </TabsContent>

                  <TabsContent value="classic">
                    <QuoteWidget theme="classic" size="large" showEnglish={false} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Integration Examples */}
            <Card>
              <CardHeader>
                <CardTitle>نمونه‌های ادغام</CardTitle>
                <CardDescription>نحوه استفاده در پلتفرم‌های مختلف</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="react" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="react">React</TabsTrigger>
                    <TabsTrigger value="vue">Vue.js</TabsTrigger>
                    <TabsTrigger value="vanilla">JavaScript</TabsTrigger>
                  </TabsList>

                  <TabsContent value="react" className="space-y-4">
                    <div className="bg-muted rounded-lg overflow-hidden">
                      <div className="bg-muted-foreground/10 px-4 py-2 border-b border-border flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">React Component</span>
                        <Badge variant="outline" className="text-xs">
                          JSX
                        </Badge>
                      </div>
                      <pre className="p-4 text-sm overflow-x-auto ltr:text-left" dir="ltr">
                        <code className="language-jsx">{`import { useState, useEffect } from 'react';

function PersianQuote() {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    fetch('/api/quotes?random=true&limit=1')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQuote(data.data[0]);
        }
      });
  }, []);

  if (!quote) return <div>در حال بارگذاری...</div>;

  return (
    <div className="quote-card">
      <blockquote>{quote.text_persian}</blockquote>
      <cite>— {quote.poet}</cite>
    </div>
  );
}`}</code>
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="vue" className="space-y-4">
                    <div className="bg-muted rounded-lg overflow-hidden">
                      <div className="bg-muted-foreground/10 px-4 py-2 border-b border-border flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Vue.js Component</span>
                        <Badge variant="outline" className="text-xs">
                          Vue
                        </Badge>
                      </div>
                      <pre className="p-4 text-sm overflow-x-auto ltr:text-left" dir="ltr">
                        <code className="language-vue">{`<template>
  <div v-if="quote" class="quote-card">
    <blockquote>{{ quote.text_persian }}</blockquote>
    <cite>— {{ quote.poet }}</cite>
  </div>
  <div v-else>در حال بارگذاری...</div>
</template>

<script>
export default {
  data() {
    return {
      quote: null
    }
  },
  async mounted() {
    const response = await fetch('/api/quotes?random=true&limit=1');
    const data = await response.json();
    if (data.success) {
      this.quote = data.data[0];
    }
  }
}
</script>`}</code>
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="vanilla" className="space-y-4">
                    <div className="bg-muted rounded-lg overflow-hidden">
                      <div className="bg-muted-foreground/10 px-4 py-2 border-b border-border flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Vanilla JavaScript</span>
                        <Badge variant="outline" className="text-xs">
                          JS
                        </Badge>
                      </div>
                      <pre className="p-4 text-sm overflow-x-auto ltr:text-left" dir="ltr">
                        <code className="language-javascript">{`async function loadPersianQuote() {
  try {
    const response = await fetch('/api/quotes?random=true&limit=1');
    const data = await response.json();
    
    if (data.success && data.data.length > 0) {
      const quote = data.data[0];
      document.getElementById('quote-text').textContent = quote.text_persian;
      document.getElementById('quote-poet').textContent = '— ' + quote.poet;
    }
  } catch (error) {
    console.error('خطا در دریافت شعر:', error);
  }
}

// بارگذاری شعر هنگام لود صفحه
document.addEventListener('DOMContentLoaded', loadPersianQuote);`}</code>
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Use Cases */}
            <Card>
              <CardHeader>
                <CardTitle>موارد استفاده</CardTitle>
                <CardDescription>ایده‌هایی برای استفاده از API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-semibold mb-2">وبلاگ ادبی</h4>
                    <p className="text-sm text-muted-foreground mb-2">نمایش شعر روز در سایدبار یا انتهای مطالب</p>
                    <Badge variant="secondary" className="text-xs">
                      تازه‌سازی روزانه
                    </Badge>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-semibold mb-2">اپلیکیشن موبایل</h4>
                    <p className="text-sm text-muted-foreground mb-2">ارسال نوتیفیکیشن با اشعار زیبا</p>
                    <Badge variant="secondary" className="text-xs">
                      API تصادفی
                    </Badge>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-semibold mb-2">سایت آموزشی</h4>
                    <p className="text-sm text-muted-foreground mb-2">آموزش ادبیات فارسی با اشعار تعاملی</p>
                    <Badge variant="secondary" className="text-xs">
                      فیلتر بر اساس شاعر
                    </Badge>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-semibold mb-2">شبکه اجتماعی</h4>
                    <p className="text-sm text-muted-foreground mb-2">اشتراک‌گذاری اشعار در پست‌ها</p>
                    <Badge variant="secondary" className="text-xs">
                      جستجو موضوعی
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Examples Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-foreground mb-6">نمونه‌های پیشرفته</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Daily Quote Example */}
            <Card>
              <CardHeader>
                <CardTitle>شعر روز</CardTitle>
                <CardDescription>نمایش شعر ثابت برای یک روز کامل</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    با استفاده از تاریخ به عنوان seed، می‌توانید شعر ثابتی برای هر روز نمایش دهید
                  </AlertDescription>
                </Alert>
                <div className="bg-muted rounded-lg overflow-hidden">
                  <div className="bg-muted-foreground/10 px-4 py-2 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Daily Quote Algorithm</span>
                    <Badge variant="outline" className="text-xs">
                      JS
                    </Badge>
                  </div>
                  <pre className="p-4 text-sm overflow-x-auto ltr:text-left" dir="ltr">
                    <code className="language-javascript">{`// شعر روز با seed ثابت
const today = new Date().toDateString();
const seed = today.split('').reduce((a, b) => {
  a = ((a << 5) - a) + b.charCodeAt(0);
  return a & a;
}, 0);

fetch(\`/api/quotes?limit=100\`)
  .then(res => res.json())
  .then(data => {
    const index = Math.abs(seed) % data.data.length;
    const dailyQuote = data.data[index];
    // نمایش شعر روز
  });`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Quote Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>مقایسه شاعران</CardTitle>
                <CardDescription>نمایش اشعار چند شاعر در کنار هم</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <QuoteWidget poet="مولانا جلال‌الدین رومی" theme="elegant" size="small" />
                  <QuoteWidget poet="حافظ شیرازی" theme="classic" size="small" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
