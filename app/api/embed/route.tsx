import { type NextRequest, NextResponse } from "next/server"
import { dataset, getQuotesForPoet, presentQuote, type NormalizedQuote } from "@/lib/data/store"
import { formatVerse } from "@/lib/utils"
import { pickExcerpt } from "@persian-quote/poem"
import { loadCanonicalStore } from "@persian-quote/core/storage"

export const dynamic = "force-dynamic"

// کوتاه کردن متن شعر در مرز سطر و کلمه (بدون برش وسط کلمه)
function trimPoem(text: string, maxLines: number, maxChars: number): string {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length <= maxLines && text.length <= maxChars) return text;

  const kept: string[] = [];
  let used = 0;
  for (const line of lines) {
    if (kept.length >= maxLines || used + line.length > maxChars) break;
    kept.push(line);
    used += line.length + 1;
  }
  return kept.join("\n") + "…";
}

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

  // Gather quotes from the canonical store (includes all integrated corpora)
  let allQuotes: any[] = [];
  try {
    const store = loadCanonicalStore();
    let works = Array.from(store.works.values());
    if (poet) {
      const pNorm = poet.trim().toLowerCase();
      works = works.filter((w: any) =>
        w.poet_id?.toLowerCase() === pNorm ||
        w.poet_name === poet ||
        (w.poet_name && w.poet_name.includes(poet)) ||
        (w.poet_english && w.poet_english.toLowerCase() === pNorm)
      );
    }
    if (category) works = works.filter((w: any) => (w.tags || []).includes(category));
    allQuotes = works.map((w: any) => ({
      id: w.id,
      kind: "poetry",
      text_persian: (w.stanzas || []).flat().join("\n"),
      stanzas: w.stanzas,
      poet: w.poet_name,
      poet_english: undefined,
      source: w.collection_title,
      category: (w.tags || [])[0],
      text_english: undefined,
    }));
  } catch {
    // fallback to legacy store below
  }

  if (allQuotes.length === 0) {
    if (poet) allQuotes = getQuotesForPoet(poet);
    else if (category) allQuotes = dataset.poetry.filter((q: any) => q.category === category);
    else allQuotes = dataset.poetry;
  }

  if (allQuotes.length === 0) {
    return new NextResponse(
      JSON.stringify({ error: "شاعر یا دسته‌بندی مورد نظر یافت نشد" }),
      { status: 404, headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" } }
    )
  }

  const seedParam = searchParams.get("seed")
  const seed = seedParam ? Number(seedParam) : Math.floor(Math.random() * 1e9)
  const rng = (() => {
    let s = seed >>> 0 || 1;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0x100000000; };
  })();

  const raw = allQuotes[Math.floor(rng() * allQuotes.length)]

  const sizeCap = size === "small" ? 25 : size === "large" ? 70 : 45
  const maxWords = Math.min(sizeCap, Number(searchParams.get("max_words") || sizeCap))

  const stanzas = Array.isArray(raw.stanzas) ? raw.stanzas : [String(raw.text_persian).split("\n")]
  const ex = pickExcerpt(stanzas, {
    maxWords,
    targetWords: Math.max(8, Math.floor(maxWords * 0.6)),
    minWords: Math.max(4, Math.floor(maxWords * 0.3)),
    topK: 3,
    rng,
  })
  const displayText = ex.lines.join("\n") + (ex.cutEnd ? "\n…" : "")

  const quote = {
    text_persian: displayText,
    text_english: raw.text_english,
    poet: raw.poet,
    poet_english: raw.poet_english,
    source: raw.source,
    category: raw.category,
  }

  // Generate CSS based on theme
  const themeStyles = {
    default: `
      background: var(--card, white);
      border: 1px solid var(--border, #e7e5e4);
      color: var(--foreground, #1c1917);
    `,
    elegant: `
      background: linear-gradient(135deg, #fdf6e2 0%, #f7e1b5 100%);
      border: 1px solid #d97706;
      color: #78350f;
    `,
    minimal: `
      background: var(--background, white);
      border: 1px solid var(--border, #e5e7eb);
      color: var(--foreground, #111827);
    `,
    classic: `
      background: linear-gradient(to bottom, #fffbeb 0%, #fef3c7 100%);
      border: 1px solid #d97706;
      color: #78350f;
    `,
    modern: `
      background: linear-gradient(to right, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #cbd5e1;
      color: #1e293b;
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
    
    body {
      background: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
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
      box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.05);
    }
    
    .quote-icon {
      text-align: center;
      margin-bottom: 12px;
      color: #d97706;
      font-size: 24px;
    }
    
    .quote-text {
      text-align: center;
      margin-bottom: 16px;
      font-weight: 500;
      line-height: 1.8;
      white-space: pre-wrap;
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
      background: rgba(0, 0, 0, 0.05);
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.75em;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    .quote-attribution {
      text-align: center;
      padding-top: 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
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
      transition: background 0.2s;
    }
    
    .refresh-btn:hover {
      background: #b45309;
    }
  </style>
</head>
<body>
  <div class="persian-quote-widget" id="persian-quote-widget">
    <div class="quote-icon">❝</div>
    <div class="quote-text">${formatVerse(esc(quote.text_persian))}</div>
    ${showEnglish && quote.text_english ? `<div class="quote-english">"${quote.text_english}"</div>` : ""}
    <div class="quote-poet">— ${esc(quote.poet)}</div>
    ${showEnglish && quote.poet_english ? `<div class="quote-poet-english">— ${esc(quote.poet_english)}</div>` : ""}
    <div class="quote-meta">
      ${showSource && quote.source ? `<span class="quote-badge">${esc(quote.source)}</span>` : ""}
      ${showCategory && quote.category ? `<span class="quote-badge">${esc(quote.category)}</span>` : ""}
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
      "Content-Security-Policy": "frame-ancestors *",
    },
  })
}
