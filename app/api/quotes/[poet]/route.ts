import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { poet: string } }) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "20")
  const random = searchParams.get("random") === "true"

  try {
    // Decode the poet name from URL
    const poetName = decodeURIComponent(params.poet)

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
      .or(`poet.eq.${poetName},poet_english.ilike.%${poetName}%`)
      .limit(Math.min(limit, 100))

    if (random) {
      query = query.order("created_at", { ascending: false })
    } else {
      query = query.order("created_at", { ascending: false })
    }

    const { data: quotes, error } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch quotes", details: error.message }, { status: 500 })
    }

    if (!quotes || quotes.length === 0) {
      return NextResponse.json({ error: "No quotes found for this poet", poet: poetName }, { status: 404 })
    }

    // Shuffle if random requested
    const finalQuotes = random ? quotes.sort(() => Math.random() - 0.5).slice(0, limit) : quotes

    return NextResponse.json(
      {
        success: true,
        data: finalQuotes,
        count: finalQuotes.length,
        poet: poetName,
        meta: { limit, random },
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
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
