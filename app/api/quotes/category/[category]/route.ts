import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { category: string } }) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "20")
  const random = searchParams.get("random") === "true"

  try {
    const categoryName = decodeURIComponent(params.category)

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
      .eq("category", categoryName)
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
      return NextResponse.json({ error: "No quotes found for this category", category: categoryName }, { status: 404 })
    }

    const finalQuotes = random ? quotes.sort(() => Math.random() - 0.5).slice(0, limit) : quotes

    return NextResponse.json(
      {
        success: true,
        data: finalQuotes,
        count: finalQuotes.length,
        category: categoryName,
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
