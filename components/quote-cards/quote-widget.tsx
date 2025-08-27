"use client"

import { useEffect, useState } from "react"
import { QuoteCard } from "./quote-card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface QuoteWidgetProps {
  poet?: string
  category?: string
  theme?: "default" | "elegant" | "minimal" | "classic" | "modern"
  size?: "small" | "medium" | "large"
  showEnglish?: boolean
  showSource?: boolean
  showCategory?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
  className?: string
}

export function QuoteWidget({
  poet,
  category,
  theme = "default",
  size = "medium",
  showEnglish = false,
  showSource = true,
  showCategory = true,
  autoRefresh = false,
  refreshInterval = 30000,
  className,
}: QuoteWidgetProps) {
  const [quote, setQuote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuote = async () => {
    try {
      setLoading(true)
      setError(null)

      let url = "/api/quotes?random=true&limit=1"
      if (poet) url += `&poet=${encodeURIComponent(poet)}`
      if (category) url += `&category=${encodeURIComponent(category)}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.success && data.data.length > 0) {
        setQuote(data.data[0])
      } else {
        setError("شعری یافت نشد")
      }
    } catch (err) {
      setError("خطا در دریافت شعر")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuote()
  }, [poet, category])

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchQuote, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-muted-foreground mb-4">{error || "شعری یافت نشد"}</p>
        <Button onClick={fetchQuote} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 ml-2" />
          تلاش مجدد
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      <QuoteCard
        quote={quote}
        theme={theme}
        size={size}
        showEnglish={showEnglish}
        showSource={showSource}
        showCategory={showCategory}
      />
      {!autoRefresh && (
        <div className="flex justify-center mt-4">
          <Button onClick={fetchQuote} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 ml-2" />
            شعر جدید
          </Button>
        </div>
      )}
    </div>
  )
}
