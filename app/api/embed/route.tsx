import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Widget configuration
  const theme = searchParams.get("theme") || "default"
  const size = searchParams.get("size") || "medium"
  const poet = searchParams.get("poet")
  const category = searchParams.get("category")
  const showEnglish = searchParams.get("english") === "true"
  const showSource = searchParams.get("source") !== "false"
  const showCategory = searchParams.get("category_badge") !== "false"
  const autoRefresh = searchParams.get("auto_refresh") === "true"
  const refreshInterval = Number.parseInt(searchParams.get("refresh_interval") || "30000")

  try {
    const supabase = await createClient()

    // Build query
    let query = supabase.from("persian_quotes").select("*").limit(1)

    if (poet) {
      query = query.eq("poet", poet)
    }
    if (category) {
      query = query.eq("category", category)
    }

    const { data: quotes, error } = await query.order("created_at", { ascending: false })

    if (error || !quotes || quotes.length === 0) {
      return new NextResponse("شعری یافت نشد", { status: 404 })
    }

    const quote = quotes[Math.floor(Math.random() * quotes.length)]

    // Generate CSS based on theme
    const themeStyles = {
      default: `
        background: white;
        border: 1px solid #e5e7eb;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      `,
      elegant: `
        background: linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%);
        border: 1px solid #f59e0b;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      `,
      minimal: `
        background: white;
        border: 1px solid #d1d5db;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      `,
      classic: `
        background: linear-gradient(to bottom, #fffbeb 0%, #fef3c7 100%);
        border: 1px solid #d97706;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      `,
      modern: `
        background: linear-gradient(to right, #f8fafc 0%, #f1f5f9 100%);
        border: 1px solid #cbd5e1;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      `,
    }

    const sizeStyles = {
      small: "max-width: 320px; padding: 16px; font-size: 14px;",
      medium: "max-width: 400px; padding: 24px; font-size: 16px;",
      large: "max-width: 500px; padding: 32px; font-size: 18px;",
    }

    // Generate HTML widget
    const html = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Persian Quote Widget</title>
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        .persian-quote-widget {
            font-family: 'Vazirmatn', 'Tahoma', sans-serif;
            direction: rtl;
            text-align: right;
            line-height: 1.8;
            ${themeStyles[theme as keyof typeof themeStyles] || themeStyles.default}
            ${sizeStyles[size as keyof typeof sizeStyles] || sizeStyles.medium}
            border-radius: 12px;
            margin: 0 auto;
        }
        
        .quote-icon {
            text-align: center;
            margin-bottom: 16px;
            color: #d97706;
            font-size: 24px;
        }
        
        .quote-text {
            text-align: center;
            margin-bottom: 16px;
            font-weight: 500;
            color: #374151;
            line-height: 1.8;
        }
        
        .quote-english {
            text-align: center;
            margin-bottom: 16px;
            font-style: italic;
            color: #6b7280;
            font-size: 0.9em;
            direction: ltr;
        }
        
        .quote-poet {
            text-align: center;
            margin-bottom: 16px;
            color: #d97706;
            font-weight: 600;
        }
        
        .quote-poet-english {
            text-align: center;
            margin-bottom: 16px;
            color: #6b7280;
            font-size: 0.9em;
            direction: ltr;
        }
        
        .quote-meta {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-bottom: 16px;
            flex-wrap: wrap;
        }
        
        .quote-badge {
            background: #f3f4f6;
            color: #374151;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.75em;
            border: 1px solid #e5e7eb;
        }
        
        .quote-attribution {
            text-align: center;
            padding-top: 16px;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
            font-size: 0.75em;
            color: #6b7280;
        }
        
        .quote-attribution a {
            color: #d97706;
            text-decoration: none;
        }
        
        .quote-attribution a:hover {
            text-decoration: underline;
        }
        
        .refresh-btn {
            display: block;
            margin: 16px auto 0;
            background: #d97706;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-family: inherit;
            font-size: 0.9em;
        }
        
        .refresh-btn:hover {
            background: #b45309;
        }
    </style>
</head>
<body>
    <div class="persian-quote-widget" id="persian-quote-widget">
        <div class="quote-icon">❝</div>
        <div class="quote-text">${quote.text_persian}</div>
        ${showEnglish && quote.text_english ? `<div class="quote-english">"${quote.text_english}"</div>` : ""}
        <div class="quote-poet">— ${quote.poet}</div>
        ${showEnglish && quote.poet_english ? `<div class="quote-poet-english">— ${quote.poet_english}</div>` : ""}
        <div class="quote-meta">
            ${showSource && quote.source ? `<span class="quote-badge">${quote.source}</span>` : ""}
            ${showCategory && quote.category ? `<span class="quote-badge">${quote.category}</span>` : ""}
        </div>
        <div class="quote-attribution">
            از <a href="${request.nextUrl.origin}" target="_blank">API اشعار فارسی</a>
        </div>
        ${!autoRefresh ? '<button class="refresh-btn" onclick="refreshQuote()">شعر جدید</button>' : ""}
    </div>
    
    <script>
        ${
          autoRefresh
            ? `
        setInterval(function() {
            location.reload();
        }, ${refreshInterval});
        `
            : `
        function refreshQuote() {
            location.reload();
        }
        `
        }
    </script>
</body>
</html>`

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("Embed API error:", error)
    return new NextResponse("خطا در دریافت شعر", { status: 500 })
  }
}
