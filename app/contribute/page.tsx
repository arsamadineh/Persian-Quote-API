"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PenTool, GitPullRequest, Code, ArrowRight } from "lucide-react"

const formSchema = z.object({
  poetPersian: z.string().min(2, {
    message: "نام شاعر باید حداقل ۲ حرف باشد.",
  }),
  poetEnglish: z.string().min(2, {
    message: "نام انگلیسی شاعر الزامی است.",
  }),
  quotePersian: z.string().min(10, {
    message: "متن شعر باید حداقل ۱۰ حرف باشد.",
  }),
  quoteEnglish: z.string().min(10, {
    message: "ترجمه انگلیسی شعر الزامی است.",
  }),
  category: z.string().min(2, {
    message: "دسته‌بندی الزامی است.",
  }),
  source: z.string().min(2, {
    message: "منبع شعر الزامی است.",
  }),
})

export default function ContributePage() {
  const [isGenerating, setIsGenerating] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      poetPersian: "",
      poetEnglish: "",
      quotePersian: "",
      quoteEnglish: "",
      category: "",
      source: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true)

    // Generate SQL
    const sql = `
-- Contribution by Community
INSERT INTO public.poets (name_persian, name_english) VALUES ('${values.poetPersian.replace(/'/g, "''")}', '${values.poetEnglish.replace(/'/g, "''")}') ON CONFLICT (name_persian) DO NOTHING;
INSERT INTO public.persian_quotes (text_persian, text_english, poet, poet_english, source, category) VALUES ('${values.quotePersian.replace(/'/g, "''")}', '${values.quoteEnglish.replace(/'/g, "''")}', '${values.poetPersian.replace(/'/g, "''")}', '${values.poetEnglish.replace(/'/g, "''")}', '${values.source.replace(/'/g, "''")}', '${values.category.replace(/'/g, "''")}');
    `.trim()

    // Create GitHub New File URL
    const filename = `scripts/contributions/quote_${Date.now()}.sql`
    const repoUrl = "https://github.com/arsamadineh/Persian-Quote-API/new/main"

    // Construct the URL with parameters
    const url = new URL(repoUrl)
    url.searchParams.append('filename', filename)
    url.searchParams.append('value', sql)
    url.searchParams.append('message', `Add new quote by ${values.poetPersian}`)
    url.searchParams.append('description', `Adding a new quote to the database.\n\nPoet: ${values.poetPersian}\nQuote: ${values.quotePersian.substring(0, 30)}...`)

    // Redirect to GitHub
    setTimeout(() => {
      window.open(url.toString(), '_blank')
      setIsGenerating(false)
      form.reset()
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background font-vazirmatn selection:bg-primary/20 selection:text-primary" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <PenTool className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">API اشعار فارسی</span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <a href="/" className="transition-colors hover:text-primary">
              خانه
            </a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">مشارکت در گنجینه اشعار</h1>
            <p className="text-xl text-muted-foreground">
              با افزودن اشعار جدید، به غنی‌تر شدن این پایگاه داده کمک کنید.
            </p>
          </div>

          <Card className="border-2 border-primary/20 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Code className="w-6 h-6 text-primary" />
                فرم افزودن شعر جدید
              </CardTitle>
              <CardDescription className="text-base">
                اطلاعات شعر را وارد کنید. پس از تایید، مستقیماً برای ایجاد Pull Request به GitHub منتقل می‌شوید.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="poetPersian"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">نام شاعر (فارسی)</FormLabel>
                          <FormControl>
                            <Input placeholder="مثال: حافظ شیرازی" className="bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="poetEnglish"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">نام شاعر (انگلیسی)</FormLabel>
                          <FormControl>
                            <Input placeholder="مثال: Hafez" className="bg-background text-left" dir="ltr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="quotePersian"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">متن شعر (فارسی)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="متن شعر را اینجا وارد کنید..."
                            className="bg-background min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>برای مصرع دوم از علامت / استفاده کنید.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quoteEnglish"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">ترجمه شعر (انگلیسی)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="English translation..."
                            className="bg-background text-left min-h-[100px]"
                            dir="ltr"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">دسته‌بندی موضوعی</FormLabel>
                          <FormControl>
                            <Input placeholder="مثال: عشق، عرفان، حکمت" className="bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">منبع (کتاب)</FormLabel>
                          <FormControl>
                            <Input placeholder="مثال: دیوان حافظ، مثنوی معنوی" className="bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg flex items-center justify-center gap-2 group"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      "در حال آماده‌سازی..."
                    ) : (
                      <>
                        <GitPullRequest className="w-5 h-5" />
                        ثبت و ایجاد Pull Request
                        <ArrowRight className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
