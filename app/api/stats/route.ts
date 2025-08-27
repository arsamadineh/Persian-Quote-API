import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  try {
    // Get total counts
    const [quotesCount, poetsCount, categoriesCount, apiCallsCount] = await Promise.all([
      supabase.from("persian_quotes").select("*", { count: "exact", head: true }),
      supabase.from("poets").select("*", { count: "exact", head: true }),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("api_stats").select("*", { count: "exact", head: true }),
    ])

    // Get recent API calls (last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: recentCalls } = await supabase
      .from("api_stats")
      .select("endpoint, status_code, created_at")
      .gte("created_at", yesterday.toISOString())
      .order("created_at", { ascending: false })
      .limit(100)

    // Get most popular endpoints
    const { data: popularEndpoints } = await supabase
      .from("api_stats")
      .select("endpoint")
      .gte("created_at", yesterday.toISOString())

    const endpointCounts =
      popularEndpoints?.reduce((acc: Record<string, number>, call) => {
        acc[call.endpoint] = (acc[call.endpoint] || 0) + 1
        return acc
      }, {}) || {}

    return NextResponse.json(
      {
        success: true,
        data: {
          totals: {
            quotes: quotesCount.count || 0,
            poets: poetsCount.count || 0,
            categories: categoriesCount.count || 0,
            api_calls: apiCallsCount.count || 0,
          },
          recent_calls: recentCalls || [],
          popular_endpoints: Object.entries(endpointCounts)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 10)
            .map(([endpoint, count]) => ({ endpoint, count })),
        },
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
    console.error("Stats API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
