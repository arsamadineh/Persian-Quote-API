import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, ExternalLink, Info, Zap } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
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
                <p className="text-sm text-muted-foreground">مستندات API</p>
              </div>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-foreground hover:text-primary transition-colors">
                خانه
              </Link>
              <Link href="/examples" className="text-foreground hover:text-primary transition-colors">
                نمونه‌ها
              </Link>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 ml-2" />
                GitHub
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3">فهرست مطالب</h3>
                <nav className="space-y-2 text-sm">
                  <a href="#overview" className="block text-muted-foreground hover:text-primary transition-colors">
                    معرفی کلی
                  </a>
                  <a
                    href="#authentication"
                    className="block text-muted-foreground hover:text-primary transition-colors"
                  >
                    احراز هویت
                  </a>
                  <a href="#endpoints" className="block text-muted-foreground hover:text-primary transition-colors">
                    نقاط پایانی API
                  </a>
                  <a href="#quotes" className="block text-muted-foreground hover:text-primary transition-colors pr-4">
                    • دریافت اشعار
                  </a>
                  <a href="#poets" className="block text-muted-foreground hover:text-primary transition-colors pr-4">
                    • شاعران
                  </a>
                  <a
                    href="#categories"
                    className="block text-muted-foreground hover:text-primary transition-colors pr-4"
                  >
                    • دسته‌بندی‌ها
                  </a>
                  <a href="#search" className="block text-muted-foreground hover:text-primary transition-colors pr-4">
                    • جستجو
                  </a>
                  <a href="#errors" className="block text-muted-foreground hover:text-primary transition-colors">
                    مدیریت خطاها
                  </a>
                  <a href="#examples" className="block text-muted-foreground hover:text-primary transition-colors">
                    نمونه‌های کاربردی
                  </a>
                </nav>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview */}
            <section id="overview">
              <div className="mb-6">
                <Badge variant="secondary" className="mb-4">
                  نسخه ۱.۰
                </Badge>
                <h1 className="text-4xl font-bold text-foreground mb-4">مستندات API اشعار فارسی</h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  API رایگان و متن‌باز برای دسترسی به گنجینه‌ای از اشعار شاعران بزرگ فارسی
                </p>
              </div>

              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-base">
                  این API کاملاً رایگان است و نیازی به ثبت‌نام یا کلید API ندارد. فقط کافی است درخواست‌های HTTP ارسال کنید.
                </AlertDescription>
              </Alert>

              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    شروع سریع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">برای دریافت یک شعر تصادفی:</p>
                  <div className="bg-muted p-4 rounded-lg" dir="ltr">
                    <code className="text-sm">curl https://your-domain.com/api/quotes?random=true&limit=1</code>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Authentication */}
            <section id="authentication">
              <h2 className="text-3xl font-bold text-foreground mb-4">احراز هویت</h2>
              <Card className="p-6">
                <CardContent>
                  <p className="text-lg mb-4">
                    🎉 <strong>احراز هویت لازم نیست!</strong>
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    این API کاملاً عمومی است و نیازی به کلید API، توکن یا هر نوع احراز هویت ندارد. فقط کافی است
                    درخواست‌های HTTP ارسال کنید.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* API Endpoints */}
            <section id="endpoints">
              <h2 className="text-3xl font-bold text-foreground mb-6">نقاط پایانی API</h2>

              {/* Quotes Endpoint */}
              <div id="quotes" className="mb-8">
                <Card className="p-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">دریافت اشعار</CardTitle>
                      <Badge variant="outline">GET</Badge>
                    </div>
                    <CardDescription className="text-base">
                      دریافت اشعار با قابلیت فیلتر بر اساس شاعر، دسته‌بندی و انتخاب تصادفی
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">نقاط پایانی:</h4>
                      <div className="space-y-2 text-sm" dir="ltr">
                        <div className="bg-muted p-2 rounded font-mono">GET /api/quotes</div>
                        <div className="bg-muted p-2 rounded font-mono">GET /api/quotes/[poet]</div>
                        <div className="bg-muted p-2 rounded font-mono">GET /api/quotes/category/[category]</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">پارامترهای اختیاری:</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-right p-2">پارامتر</th>
                              <th className="text-right p-2">نوع</th>
                              <th className="text-right p-2">پیش‌فرض</th>
                              <th className="text-right p-2">توضیحات</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="p-2 font-mono">limit</td>
                              <td className="p-2">عدد</td>
                              <td className="p-2">10</td>
                              <td className="p-2">تعداد اشعار (حداکثر 100)</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-2 font-mono">random</td>
                              <td className="p-2">boolean</td>
                              <td className="p-2">false</td>
                              <td className="p-2">انتخاب تصادفی اشعار</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-2 font-mono">poet</td>
                              <td className="p-2">رشته</td>
                              <td className="p-2">-</td>
                              <td className="p-2">فیلتر بر اساس نام شاعر</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-2 font-mono">category</td>
                              <td className="p-2">رشته</td>
                              <td className="p-2">-</td>
                              <td className="p-2">فیلتر بر اساس دسته‌بندی</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <Tabs defaultValue="example" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="example">نمونه درخواست</TabsTrigger>
                        <TabsTrigger value="response">نمونه پاسخ</TabsTrigger>
                      </TabsList>
                      <TabsContent value="example" className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg" dir="ltr">
                          <code className="text-sm whitespace-pre-wrap">{`# دریافت 5 شعر تصادفی
GET /api/quotes?random=true&limit=5

# دریافت اشعار حافظ
GET /api/quotes/حافظ شیرازی

# دریافت اشعار عاشقانه
GET /api/quotes/category/عشق`}</code>
                        </div>
                      </TabsContent>
                      <TabsContent value="response" className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg" dir="ltr">
                          <code className="text-sm whitespace-pre-wrap">{`{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "text_persian": "عاشقان مرده‌اند در عشق زنده",
      "text_english": "Lovers are dead in love, alive",
      "poet": "مولانا جلال‌الدین رومی",
      "poet_english": "Rumi",
      "source": "مثنوی معنوی",
      "category": "عشق",
      "tags": ["عشق", "زندگی", "جاودانگی"],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1,
  "meta": {
    "limit": 1,
    "random": true
  }
}`}</code>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Search Endpoint */}
              <div id="search" className="mb-8">
                <Card className="p-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">جستجو در اشعار</CardTitle>
                      <Badge variant="outline">GET</Badge>
                    </div>
                    <CardDescription className="text-base">جستجو در متن اشعار، نام شاعران و برچسب‌ها</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">نقطه پایانی:</h4>
                      <div className="bg-muted p-2 rounded font-mono text-sm" dir="ltr">
                        GET /api/quotes/search
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">پارامترهای لازم:</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-right p-2">پارامتر</th>
                              <th className="text-right p-2">نوع</th>
                              <th className="text-right p-2">توضیحات</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="p-2 font-mono">q</td>
                              <td className="p-2">رشته</td>
                              <td className="p-2">کلمه یا عبارت جستجو (حداقل 2 کاراکتر)</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-2 font-mono">limit</td>
                              <td className="p-2">عدد</td>
                              <td className="p-2">تعداد نتایج (حداکثر 50)</td>
                            </tr>
                            <tr className="border-b">
                              <td className="p-2 font-mono">lang</td>
                              <td className="p-2">رشته</td>
                              <td className="p-2">زبان جستجو: persian, english, both</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg" dir="ltr">
                      <code className="text-sm">GET /api/quotes/search?q=عشق&limit=10&lang=persian</code>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Poets Endpoint */}
              <div id="poets" className="mb-8">
                <Card className="p-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">فهرست شاعران</CardTitle>
                      <Badge variant="outline">GET</Badge>
                    </div>
                    <CardDescription className="text-base">دریافت اطلاعات شاعران و آمار اشعار آن‌ها</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted p-2 rounded font-mono text-sm" dir="ltr">
                      GET /api/poets?stats=true
                    </div>
                    <p className="text-sm text-muted-foreground">پارامتر stats=true برای دریافت تعداد اشعار هر شاعر</p>
                  </CardContent>
                </Card>
              </div>

              {/* Categories Endpoint */}
              <div id="categories" className="mb-8">
                <Card className="p-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">دسته‌بندی‌ها</CardTitle>
                      <Badge variant="outline">GET</Badge>
                    </div>
                    <CardDescription className="text-base">دریافت فهرست دسته‌بندی‌های موضوعی اشعار</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted p-2 rounded font-mono text-sm" dir="ltr">
                      GET /api/categories?stats=true
                    </div>
                    <p className="text-sm text-muted-foreground">
                      شامل دسته‌بندی‌هایی مثل: عشق، عرفان، حکمت، طبیعت، زندگی
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Error Handling */}
            <section id="errors">
              <h2 className="text-3xl font-bold text-foreground mb-4">مدیریت خطاها</h2>
              <Card className="p-6">
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    API از کدهای استاندارد HTTP برای نشان دادن موفقیت یا شکست درخواست‌ها استفاده می‌کند:
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">200</Badge>
                      <span>درخواست موفق</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">400</Badge>
                      <span>درخواست نامعتبر (پارامترهای اشتباه)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">404</Badge>
                      <span>منبع یافت نشد</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">500</Badge>
                      <span>خطای سرور</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">نمونه پاسخ خطا:</h4>
                    <div className="bg-muted p-4 rounded-lg" dir="ltr">
                      <code className="text-sm whitespace-pre-wrap">{`{
  "error": "No quotes found for this poet",
  "poet": "شاعر نامعلوم"
}`}</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Code Examples */}
            <section id="examples">
              <h2 className="text-3xl font-bold text-foreground mb-4">نمونه‌های کاربردی</h2>

              <Tabs defaultValue="javascript" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                </TabsList>

                <TabsContent value="javascript">
                  <Card className="p-6">
                    <CardHeader>
                      <CardTitle>JavaScript / Node.js</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg" dir="ltr">
                        <code className="text-sm whitespace-pre-wrap">{`// دریافت شعر تصادفی
async function getRandomQuote() {
  try {
    const response = await fetch('/api/quotes?random=true&limit=1');
    const data = await response.json();
    
    if (data.success) {
      console.log(data.data[0].text_persian);
      console.log('- ' + data.data[0].poet);
    }
  } catch (error) {
    console.error('خطا در دریافت شعر:', error);
  }
}

// جستجو در اشعار
async function searchQuotes(query) {
  const response = await fetch(\`/api/quotes/search?q=\${encodeURIComponent(query)}\`);
  const data = await response.json();
  return data.data;
}`}</code>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="python">
                  <Card className="p-6">
                    <CardHeader>
                      <CardTitle>Python</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg" dir="ltr">
                        <code className="text-sm whitespace-pre-wrap">{`import requests
import json

# دریافت شعر تصادفی
def get_random_quote():
    url = "https://your-domain.com/api/quotes"
    params = {"random": "true", "limit": 1}
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data["success"]:
        quote = data["data"][0]
        print(f"{quote['text_persian']}")
        print(f"- {quote['poet']}")

# جستجو در اشعار
def search_quotes(query):
    url = "https://your-domain.com/api/quotes/search"
    params = {"q": query, "limit": 10}
    
    response = requests.get(url, params=params)
    return response.json()["data"]`}</code>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="php">
                  <Card className="p-6">
                    <CardHeader>
                      <CardTitle>PHP</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg" dir="ltr">
                        <code className="text-sm whitespace-pre-wrap">{`<?php
// دریافت شعر تصادفی
function getRandomQuote() {
    $url = "https://your-domain.com/api/quotes?random=true&limit=1";
    $response = file_get_contents($url);
    $data = json_decode($response, true);
    
    if ($data['success']) {
        $quote = $data['data'][0];
        echo $quote['text_persian'] . "\\n";
        echo "- " . $quote['poet'] . "\\n";
    }
}

// جستجو در اشعار
function searchQuotes($query) {
    $url = "https://your-domain.com/api/quotes/search?q=" . urlencode($query);
    $response = file_get_contents($url);
    $data = json_decode($response, true);
    
    return $data['data'];
}
?>`}</code>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="curl">
                  <Card className="p-6">
                    <CardHeader>
                      <CardTitle>cURL</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg" dir="ltr">
                        <code className="text-sm whitespace-pre-wrap">{`# دریافت شعر تصادفی
curl "https://your-domain.com/api/quotes?random=true&limit=1"

# دریافت اشعار حافظ
curl "https://your-domain.com/api/quotes/حافظ%20شیرازی"

# جستجو در اشعار
curl "https://your-domain.com/api/quotes/search?q=عشق&limit=5"

# دریافت فهرست شاعران
curl "https://your-domain.com/api/poets?stats=true"

# دریافت دسته‌بندی‌ها
curl "https://your-domain.com/api/categories"`}</code>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </section>

            {/* Rate Limiting */}
            <section>
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    محدودیت‌ها و نکات مهم
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• حداکثر 100 شعر در هر درخواست</li>
                    <li>• حداکثر 50 نتیجه برای جستجو</li>
                    <li>• جستجو حداقل 2 کاراکتر نیاز دارد</li>
                    <li>• تمام پاسخ‌ها در قالب JSON</li>
                    <li>• پشتیبانی از CORS برای استفاده در مرورگر</li>
                    <li>• رمزگذاری UTF-8 برای متن‌های فارسی</li>
                  </ul>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
