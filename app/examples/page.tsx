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
  const [hafezId, setHafezId] = useState("")
  const [hafezSearch, setHafezSearch] = useState("")
  const [sherenoPoet, setSherenoPoet] = useState("")
  const [sherenoTitle, setSherenoTitle] = useState("")
  const [nonpoetryAuthor, setNonpoetryAuthor] = useState("")

  useEffect(() => {
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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">نمونه‌های کاربردی و تست زنده</h1>
          <p className="text-base md:text-xl text-muted-foreground">
            API را به صورت تعاملی تست کنید و نمونه‌های مختلف استفاده را مشاهده کنید
          </p>
        </div>

        {/* Section 1: Widget Examples */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">ویجت‌های آماده</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="elegant" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
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
        </section>

        {/* Section 2: API Tester */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Play className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">تست تعاملی API</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="random" className="w-full">
                <TabsList className="flex w-full overflow-x-auto mb-6">
                  <TabsTrigger value="random" className="flex-none">تصادفی</TabsTrigger>
                  <TabsTrigger value="poet" className="flex-none">شاعر</TabsTrigger>
                  <TabsTrigger value="category" className="flex-none">دسته</TabsTrigger>
                  <TabsTrigger value="search" className="flex-none">جستجو</TabsTrigger>
                  <TabsTrigger value="hafez" className="flex-none">حافظ</TabsTrigger>
                  <TabsTrigger value="shereno" className="flex-none">شعر نو</TabsTrigger>
                  <TabsTrigger value="nonpoetry" className="flex-none">بزرگان</TabsTrigger>
                </TabsList>

                <TabsContent value="random" className="space-y-4">
                  <p className="text-sm text-muted-foreground">دریافت اشعار تصادفی از تمام شاعران</p>
                  <Button
                    onClick={() => testApiCall("/api/quotes", { random: "true", limit: "3" })}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin ml-2" /> : <Play className="w-4 h-4 ml-2" />}
                    دریافت 3 شعر تصادفی
                  </Button>
                </TabsContent>

                <TabsContent value="poet" className="space-y-4">
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
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin ml-2" /> : <Users className="w-4 h-4 ml-2" />}
                    دریافت اشعار {selectedPoet}
                  </Button>
                </TabsContent>

                <TabsContent value="category" className="space-y-4">
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
                    onClick={() => testApiCall(`/api/quotes/category/${encodeURIComponent(selectedCategory)}`, { limit: "5" })}
                    disabled={loading || !selectedCategory}
                    className="w-full"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin ml-2" /> : <Heart className="w-4 h-4 ml-2" />}
                    دریافت اشعار {selectedCategory}
                  </Button>
                </TabsContent>

                <TabsContent value="search" className="space-y-4">
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
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin ml-2" /> : <Search className="w-4 h-4 ml-2" />}
                    جستجو در اشعار
                  </Button>
                </TabsContent>

                <TabsContent value="hafez" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>شماره غزل (1 تا 497)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="497"
                        value={hafezId}
                        onChange={(e) => setHafezId(e.target.value)}
                        placeholder="مثال: 1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>جستجو در مصرع‌ها</Label>
                      <Input
                        value={hafezSearch}
                        onChange={(e) => setHafezSearch(e.target.value)}
                        placeholder="مثال: ساقی"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => testApiCall("/api/quotes/hafez", { id: hafezId, q: hafezSearch, limit: "5" })}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin ml-2" /> : <Play className="w-4 h-4 ml-2" />}
                    دریافت غزل حافظ
                  </Button>
                </TabsContent>

                <TabsContent value="shereno" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>شاعر (فیلتر)</Label>
                      <Input
                        value={sherenoPoet}
                        onChange={(e) => setSherenoPoet(e.target.value)}
                        placeholder="مثال: نیما یوشیج"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>عنوان شعر</Label>
                      <Input
                        value={sherenoTitle}
                        onChange={(e) => setSherenoTitle(e.target.value)}
                        placeholder="مثال: قایق"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => testApiCall("/api/quotes/shereno", { poet: sherenoPoet, title: sherenoTitle, limit: "3" })}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin ml-2" /> : <Play className="w-4 h-4 ml-2" />}
                    دریافت شعر نو
                  </Button>
                </TabsContent>

                <TabsContent value="nonpoetry" className="space-y-4">
                  <div className="space-y-2">
                    <Label>گوینده (نویسنده/اندیشمند)</Label>
                    <Input
                      value={nonpoetryAuthor}
                      onChange={(e) => setNonpoetryAuthor(e.target.value)}
                      placeholder="مثال: انیشتین، ایلان ماسک"
                    />
                  </div>
                  <Button
                    onClick={() => testApiCall("/api/quotes/non-poetry", { author: nonpoetryAuthor, limit: "5" })}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin ml-2" /> : <Play className="w-4 h-4 ml-2" />}
                    دریافت سخنان بزرگان
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* API Response */}
          {apiResponse && (
            <Card className="mt-6">
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
        </section>

        {/* Section 3: Integration Examples */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Code className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">نمونه کد</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="react" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="react">React</TabsTrigger>
                  <TabsTrigger value="vue">Vue.js</TabsTrigger>
                  <TabsTrigger value="vanilla">JavaScript</TabsTrigger>
                </TabsList>

                <TabsContent value="react">
                  <div className="bg-muted rounded-lg overflow-hidden">
                    <div className="bg-muted-foreground/10 px-4 py-2 border-b border-border flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">React Component</span>
                      <Badge variant="outline" className="text-xs">JSX</Badge>
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

                <TabsContent value="vue">
                  <div className="bg-muted rounded-lg overflow-hidden">
                    <div className="bg-muted-foreground/10 px-4 py-2 border-b border-border flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Vue.js Component</span>
                      <Badge variant="outline" className="text-xs">Vue</Badge>
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

                <TabsContent value="vanilla">
                  <div className="bg-muted rounded-lg overflow-hidden">
                    <div className="bg-muted-foreground/10 px-4 py-2 border-b border-border flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Vanilla JavaScript</span>
                      <Badge variant="outline" className="text-xs">JS</Badge>
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

document.addEventListener('DOMContentLoaded', loadPersianQuote);`}</code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        {/* Section 4: Advanced Examples */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">نمونه‌های پیشرفته</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="min-w-0 overflow-hidden">
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
                    <Badge variant="outline" className="text-xs">JS</Badge>
                  </div>
                  <pre className="p-4 text-sm overflow-x-auto ltr:text-left" dir="ltr">
                    <code className="language-javascript">{`const today = new Date().toDateString();
const seed = today.split('').reduce((a, b) => {
  a = ((a << 5) - a) + b.charCodeAt(0);
  return a & a;
}, 0);

fetch(\`/api/quotes?limit=100\`)
  .then(res => res.json())
  .then(data => {
    const index = Math.abs(seed) % data.data.length;
    const dailyQuote = data.data[index];
  });`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card className="min-w-0 overflow-hidden">
              <CardHeader>
                <CardTitle>مقایسه شاعران</CardTitle>
                <CardDescription>نمایش اشعار چند شاعر در کنار هم</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center">
                  <QuoteWidget poet="مولانا جلال‌الدین رومی" theme="elegant" size="small" />
                  <QuoteWidget poet="حافظ شیرازی" theme="classic" size="small" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 5: Use Cases */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">موارد استفاده</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">وبلاگ ادبی</h4>
                <p className="text-sm text-muted-foreground mb-3">نمایش شعر روز در سایدبار یا انتهای مطالب</p>
                <Badge variant="secondary" className="text-xs">تازه‌سازی روزانه</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">اپلیکیشن موبایل</h4>
                <p className="text-sm text-muted-foreground mb-3">ارسال نوتیفیکیشن با اشعار زیبا</p>
                <Badge variant="secondary" className="text-xs">API تصادفی</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">سایت آموزشی</h4>
                <p className="text-sm text-muted-foreground mb-3">آموزش ادبیات فارسی با اشعار تعاملی</p>
                <Badge variant="secondary" className="text-xs">فیلتر بر اساس شاعر</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">شبکه اجتماعی</h4>
                <p className="text-sm text-muted-foreground mb-3">اشتراک‌گذاری اشعار در پست‌ها</p>
                <Badge variant="secondary" className="text-xs">جستجو موضوعی</Badge>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
