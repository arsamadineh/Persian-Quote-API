import { type NextRequest, NextResponse } from "next/server"
import sampleQuotes from "@/lib/data/poetry-quotes.json"
import hafez from "@/lib/data/hafez.json"
import shereno from "@/lib/data/shereno.json"
import nonPoetryQuotes from "@/lib/data/non-poetry-quotes.json"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const q = searchParams.get("q") || searchParams.get("query")
  const limit = Number.parseInt(searchParams.get("limit") || "20")
  const lang = searchParams.get("lang") || "both" // 'persian', 'english', or 'both'

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ error: "Search query must be at least 2 characters long" }, { status: 400 })
  }

  const searchTerm = q.trim().toLowerCase()

  // Compile search candidates
  let candidates: any[] = []

  // Add sample quotes
  candidates.push(...sampleQuotes.map(quote => ({
    id: `p-${quote.id}`,
    text_persian: quote.text_persian,
    text_english: quote.text_english,
    poet: quote.poet,
    poet_english: quote.poet_english,
    source: quote.source,
    category: quote.category,
    tags: quote.tags,
    type: "poetry"
  })))

  // Add Hafez ghazals
  candidates.push(...hafez.map(ghazal => ({
    id: `h-${ghazal.id}`,
    text_persian: ghazal.verses.map((v: string[]) => v.join(" / ")).join("\n"),
    text_english: `Ghazal #${ghazal.id}`,
    poet: "حافظ شیرازی",
    poet_english: "Hafez",
    source: "دیوان حافظ",
    category: "عرفان",
    tags: ["عرفان", "غزل"],
    type: "hafez"
  })))

  // Add Non-poetry quotes
  candidates.push(...nonPoetryQuotes.map(quote => ({
    id: `np-${quote.id}`,
    text_persian: quote.body,
    text_english: "",
    poet: quote.author,
    poet_english: "",
    source: "سخنان بزرگان",
    category: "حکمت",
    tags: ["سخنان بزرگان"],
    type: "non-poetry"
  })))

  // Add Sher-e-No
  candidates.push(...shereno.slice(0, 300).map(poem => ({
    id: `sn-${poem.id}`,
    text_persian: poem.poem,
    text_english: poem.title,
    poet: poem.poet,
    poet_english: poem.poet === "نیما یوشیج" ? "Nima Yushij" : "Sohrab Sepehri",
    source: poem.book,
    category: "شعر نو",
    tags: ["شعر نو", "معاصر"],
    type: "shereno"
  })))

  // Filter based on query and language
  let results = candidates.filter(item => {
    const matchPersian = item.text_persian.includes(searchTerm) || item.poet.includes(searchTerm) || (item.source && item.source.includes(searchTerm))
    const matchEnglish = item.text_english?.toLowerCase().includes(searchTerm) || item.poet_english?.toLowerCase().includes(searchTerm)
    
    if (lang === "persian") return matchPersian
    if (lang === "english") return matchEnglish
    return matchPersian || matchEnglish
  })

  // Limit and format final result
  const finalResults = results.slice(0, Math.min(limit, results.length)).map(item => ({
    id: item.id,
    text_persian: item.text_persian,
    text_english: item.text_english,
    poet: item.poet,
    poet_english: item.poet_english,
    source: item.source,
    category: item.category,
    tags: item.tags,
    created_at: new Date().toISOString()
  }))

  return NextResponse.json(
    {
      success: true,
      data: finalResults,
      count: finalResults.length,
      query: q,
      language: lang,
      meta: { limit }
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  )
}
