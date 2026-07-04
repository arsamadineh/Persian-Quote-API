"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { QuoteWidget } from "@/components/quote-cards/quote-widget"
import { Copy, ExternalLink, BookOpen } from "lucide-react"
import Link from "next/link"

export default function EmbedPage() {
  const [config, setConfig] = useState({
    theme: "default",
    size: "medium",
    poet: "",
    category: "",
    showEnglish: false,
    showSource: true,
    showCategory: true,
    autoRefresh: false,
    refreshInterval: 30000,
  })

  const [poets, setPoets] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [embedCode, setEmbedCode] = useState("")
  const [iframeCode, setIframeCode] = useState("")

  useEffect(() => {
    // Fetch poets and categories
    Promise.all([fetch("/api/poets"), fetch("/api/categories")]).then(async ([poetsRes, categoriesRes]) => {
      const poetsData = await poetsRes.json()
      const categoriesData = await categoriesRes.json()

      if (poetsData.success) setPoets(poetsData.data)
      if (categoriesData.success) setCategories(categoriesData.data)
    })
  }, [])

  useEffect(() => {
    // Generate embed codes
    const params = new URLSearchParams()
    if (config.theme !== "default") params.set("theme", config.theme)
    if (config.size !== "medium") params.set("size", config.size)
    if (config.poet) params.set("poet", config.poet)
    if (config.category) params.set("category", config.category)
    if (config.showEnglish) params.set("english", "true")
    if (!config.showSource) params.set("source", "false")
    if (!config.showCategory) params.set("category_badge", "false")
    if (config.autoRefresh) params.set("auto_refresh", "true")
    if (config.refreshInterval !== 30000) params.set("refresh_interval", config.refreshInterval.toString())

    const embedUrl = `${window.location.origin}/api/embed?${params.toString()}`
    const iframeUrl = `${window.location.origin}/api/embed?${params.toString()}`

    setEmbedCode(`<iframe src="${embedUrl}" width="100%" height="400" frameborder="0" scrolling="no"></iframe>`)
    setIframeCode(iframeUrl)
  }, [config])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">ساخت ویجت قابل تعبیه</h1>
          <p className="text-xl text-muted-foreground">
            ویجت اشعار فارسی را با تنظیمات دلخواه خود بسازید و در وب‌سایت خود قرار دهید
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات ویجت</CardTitle>
                <CardDescription>ظاهر و رفتار ویجت خود را شخصی‌سازی کنید</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Selection */}
                <div className="space-y-2">
                  <Label>قالب ظاهری</Label>
                  <Select value={config.theme} onValueChange={(value) => setConfig({ ...config, theme: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">پیش‌فرض</SelectItem>
                      <SelectItem value="elegant">شیک</SelectItem>
                      <SelectItem value="minimal">مینیمال</SelectItem>
                      <SelectItem value="classic">کلاسیک</SelectItem>
                      <SelectItem value="modern">مدرن</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Size Selection */}
                <div className="space-y-2">
                  <Label>اندازه</Label>
                  <Select value={config.size} onValueChange={(value) => setConfig({ ...config, size: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">کوچک</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="large">بزرگ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Poet Filter */}
                <div className="space-y-2">
                  <Label>شاعر (اختیاری)</Label>
                  <Select value={config.poet} onValueChange={(value) => setConfig({ ...config, poet: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="همه شاعران" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه شاعران</SelectItem>
                      {poets.map((poet) => (
                        <SelectItem key={poet.id} value={poet.name_persian}>
                          {poet.name_persian}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <Label>دسته‌بندی (اختیاری)</Label>
                  <Select value={config.category} onValueChange={(value) => setConfig({ ...config, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="همه دسته‌ها" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه دسته‌ها</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name_persian}>
                          {category.name_persian}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Display Options */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-3 border-b border-border/40">
                    <Label htmlFor="show-english" className="cursor-pointer text-sm font-medium">نمایش ترجمه انگلیسی</Label>
                    <div dir="ltr">
                      <Switch
                        id="show-english"
                        checked={config.showEnglish}
                        onCheckedChange={(checked) => setConfig({ ...config, showEnglish: checked })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-border/40">
                    <Label htmlFor="show-source" className="cursor-pointer text-sm font-medium">نمایش منبع</Label>
                    <div dir="ltr">
                      <Switch
                        id="show-source"
                        checked={config.showSource}
                        onCheckedChange={(checked) => setConfig({ ...config, showSource: checked })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-border/40">
                    <Label htmlFor="show-category" className="cursor-pointer text-sm font-medium">نمایش دسته‌بندی</Label>
                    <div dir="ltr">
                      <Switch
                        id="show-category"
                        checked={config.showCategory}
                        onCheckedChange={(checked) => setConfig({ ...config, showCategory: checked })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <Label htmlFor="auto-refresh" className="cursor-pointer text-sm font-medium">تازه‌سازی خودکار</Label>
                    <div dir="ltr">
                      <Switch
                        id="auto-refresh"
                        checked={config.autoRefresh}
                        onCheckedChange={(checked) => setConfig({ ...config, autoRefresh: checked })}
                      />
                    </div>
                  </div>

                  {config.autoRefresh && (
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="refresh-interval">فاصله تازه‌سازی (ثانیه)</Label>
                      <Input
                        id="refresh-interval"
                        type="number"
                        min="10"
                        max="300"
                        value={config.refreshInterval / 1000}
                        onChange={(e) =>
                          setConfig({ ...config, refreshInterval: Number.parseInt(e.target.value) * 1000 })
                        }
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Embed Codes */}
            <Card>
              <CardHeader>
                <CardTitle>کد تعبیه</CardTitle>
                <CardDescription>این کدها را در وب‌سایت خود قرار دهید</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="iframe" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="iframe">iframe</TabsTrigger>
                    <TabsTrigger value="direct">لینک مستقیم</TabsTrigger>
                  </TabsList>

                  <TabsContent value="iframe" className="space-y-4">
                    <div className="space-y-2">
                      <Label>کد HTML</Label>
                      <div className="relative">
                        <textarea
                          className="w-full h-24 p-3 pr-12 text-sm bg-muted rounded-lg resize-none font-mono border border-border/50 focus:outline-none"
                          value={embedCode}
                          readOnly
                          dir="ltr"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 w-8 h-8 bg-background/80 hover:bg-muted border border-border/50"
                          onClick={() => copyToClipboard(embedCode)}
                          title="کپی کد"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="direct" className="space-y-4">
                    <div className="space-y-2">
                      <Label>لینک مستقیم</Label>
                      <div className="relative">
                        <Input value={iframeCode} readOnly className="font-mono text-sm pl-20" dir="ltr" />
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 flex gap-1" dir="ltr">
                          <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => copyToClipboard(iframeCode)} title="کپی">
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="w-8 h-8" asChild>
                            <a href={iframeCode} target="_blank" rel="noopener noreferrer" title="باز کردن">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>پیش‌نمایش</CardTitle>
                <CardDescription>ویجت شما اینگونه نمایش داده خواهد شد</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <QuoteWidget
                    poet={config.poet && config.poet !== "all" ? config.poet : undefined}
                    category={config.category && config.category !== "all" ? config.category : undefined}
                    theme={config.theme as any}
                    size={config.size as any}
                    showEnglish={config.showEnglish}
                    showSource={config.showSource}
                    showCategory={config.showCategory}
                    autoRefresh={config.autoRefresh}
                    refreshInterval={config.refreshInterval}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Usage Examples */}
            <Card>
              <CardHeader>
                <CardTitle>نمونه‌های کاربردی</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">وبلاگ ادبی</h4>
                  <p className="text-sm text-muted-foreground">
                    ویجت اشعار را در سایدبار یا انتهای مطالب وبلاگ خود قرار دهید
                  </p>
                  <Badge variant="secondary">قالب: کلاسیک</Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">وب‌سایت آموزشی</h4>
                  <p className="text-sm text-muted-foreground">
                    برای آشنایی دانش‌آموزان با ادبیات فارسی از ویجت استفاده کنید
                  </p>
                  <Badge variant="secondary">قالب: مدرن</Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">اپلیکیشن موبایل</h4>
                  <p className="text-sm text-muted-foreground">در WebView اپلیکیشن خود از لینک مستقیم استفاده کنید</p>
                  <Badge variant="secondary">قالب: مینیمال</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
