import { type NextRequest, NextResponse } from "next/server"
import sampleQuotes from "@/lib/data/poetry-quotes.json"
import hafez from "@/lib/data/hafez.json"
import shereno from "@/lib/data/shereno.json"
import nonPoetryQuotes from "@/lib/data/non-poetry-quotes.json"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const totals = {
    quotes: sampleQuotes.length + hafez.length + shereno.length + nonPoetryQuotes.length,
    poets: 6, // Rumi, Hafez, Saadi, Ferdowsi, Nima, Sohrab
    categories: 5, // عشق, عرفان, محبت, طبیعت, اخلاق
    api_calls: 15403, // Mocked total requests
  }

  const mockStats = {
    totals,
    recent_calls: [
      { endpoint: "/api/quotes/hafez", status_code: 200, created_at: new Date().toISOString() },
      { endpoint: "/api/quotes/non-poetry", status_code: 200, created_at: new Date(Date.now() - 5000).toISOString() },
      { endpoint: "/api/quotes/shereno", status_code: 200, created_at: new Date(Date.now() - 15000).toISOString() },
    ],
    popular_endpoints: [
      { endpoint: "/api/quotes/hafez", count: 1243 },
      { endpoint: "/api/quotes/non-poetry", count: 982 },
      { endpoint: "/api/quotes/shereno", count: 874 },
      { endpoint: "/api/quotes", count: 521 },
    ],
  }

  return NextResponse.json(
    {
      success: true,
      data: mockStats,
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
