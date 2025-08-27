import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const q = searchParams.get("q")
  const limit = Number.parseInt(searchParams.get("limit") || "20")
  const lang = searchParams.get("lang") || "both" // 'persian', 'english', or 'both'

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ error: "Search query must be at least 2 characters long" }, { status: 400 })
  }

  try {
    const searchTerm = q.trim()

    let query = supabase
      .from("persian_quotes")
      .select(`
        id,
        text_persian,
        text_english,
        poet,
        poet_english,
        source,
        category,
        tags,
        created_at
      `)
      .limit(Math.min(limit, 50))

    // Build search conditions based on language preference
    if (lang === "persian") {
      query = query.or(`text_persian.ilike.%${searchTerm}%,poet.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
    } else if (lang === "english") {
      query = query.or(`text_english.ilike.%${searchTerm}%,poet_english.ilike.%${searchTerm}%`)
    } else {
      // Search both languages
      query = query.or(
        `text_persian.ilike.%${searchTerm}%,text_english.ilike.%${searchTerm}%,poet.ilike.%${searchTerm}%,poet_english.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`,
      )
    }

    const { data: quotes, error } = await query.order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Search failed", details: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        data: quotes || [],
        count: quotes?.length || 0,
        query: searchTerm,
        language: lang,
        meta: { limit },
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    )
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
