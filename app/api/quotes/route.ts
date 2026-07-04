import { type NextRequest, NextResponse } from "next/server"
import sampleQuotes from "@/lib/data/poetry-quotes.json"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const random = searchParams.get("random") === "true"
  const poet = searchParams.get("poet")
  const category = searchParams.get("category")

  let filteredQuotes = sampleQuotes.map(q => ({ ...q, created_at: new Date().toISOString() }))

  // Apply filters to sample data
  if (poet) {
    const term = poet.toLowerCase()
    filteredQuotes = filteredQuotes.filter(
      (q) => q.poet.includes(poet) || q.poet_english.toLowerCase().includes(term)
    )
  }
  if (category) {
    filteredQuotes = filteredQuotes.filter((q) => q.category === category)
  }

  // Apply random selection and limit
  const finalQuotes = random
    ? filteredQuotes.sort(() => Math.random() - 0.5).slice(0, Math.min(limit, filteredQuotes.length))
    : filteredQuotes.slice(0, Math.min(limit, filteredQuotes.length))

  return NextResponse.json(
    {
      success: true,
      data: finalQuotes,
      count: finalQuotes.length,
      meta: {
        limit,
        random,
        poet,
        category
      },
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
