import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Quote } from "lucide-react"
import { cn, formatVerse } from "@/lib/utils"

interface QuoteData {
  text_persian: string
  text_english?: string
  poet: string
  poet_english?: string
  source?: string
  category?: string
  tags?: string[]
}

interface QuoteCardProps {
  quote: QuoteData
  theme?: "default" | "elegant" | "minimal" | "classic" | "modern"
  size?: "small" | "medium" | "large"
  showEnglish?: boolean
  showSource?: boolean
  showCategory?: boolean
  className?: string
}

export function QuoteCard({
  quote,
  theme = "default",
  size = "medium",
  showEnglish = false,
  showSource = true,
  showCategory = true,
  className,
}: QuoteCardProps) {
  const sizeClasses = {
    small: "p-4 max-w-sm",
    medium: "p-6 max-w-md",
    large: "p-8 max-w-lg",
  }

  const themeClasses = {
    default: "bg-card border-border shadow-md",
    elegant: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/60 dark:to-orange-950/60 border-amber-200 dark:border-amber-800 shadow-lg text-stone-900 dark:text-amber-50",
    minimal: "bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700 shadow-sm text-stone-900 dark:text-stone-100",
    classic: "bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-yellow-950/60 dark:to-amber-950/60 border-amber-300 dark:border-amber-700 shadow-xl text-stone-900 dark:text-amber-50",
    modern: "bg-gradient-to-r from-slate-50 to-stone-50 dark:from-slate-900 dark:to-stone-900 border-slate-200 dark:border-slate-700 shadow-lg text-slate-900 dark:text-slate-100",
  }

  const textSizes = {
    small: "text-base",
    medium: "text-lg",
    large: "text-xl",
  }

  return (
    <Card className={cn("rtl persian-text quote-card mx-auto", sizeClasses[size], themeClasses[theme], className)}>
      <CardContent className="space-y-4">
        {/* Quote Icon */}
        <div className="flex justify-center">
          <Quote className="w-6 h-6 text-primary/60" />
        </div>

        {/* Persian Text */}
        <blockquote
          className={cn("persian-quote text-center leading-relaxed font-medium whitespace-pre-wrap", textSizes[size])}
        >
          {formatVerse(quote.text_persian)}
        </blockquote>

        {/* English Translation */}
        {showEnglish && quote.text_english && (
          <blockquote className="text-center text-muted-foreground italic text-sm leading-relaxed" dir="ltr">
            "{quote.text_english}"
          </blockquote>
        )}

        {/* Poet Attribution */}
        <div className="text-center">
          <p className="poet-attribution">{quote.poet}</p>
          {showEnglish && quote.poet_english && (
            <p className="text-sm text-muted-foreground" dir="ltr">
              — {quote.poet_english}
            </p>
          )}
        </div>

        {/* Source and Category */}
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          {showSource && quote.source && (
            <Badge variant="secondary" className="text-xs shadow-sm">
              {quote.source}
            </Badge>
          )}
          {showCategory && quote.category && (
            <Badge variant="outline" className="text-xs shadow-sm">
              {quote.category}
            </Badge>
          )}
        </div>

        {/* API Attribution */}
        <div className="text-center pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            از{" "}
            <a href="/" className="text-primary hover:underline font-medium">
              API اشعار فارسی
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
