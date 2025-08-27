import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const includeStats = searchParams.get("stats") === "true"

  try {
    const { data: tableCheck, error: tableError } = await supabase
      .from("categories")
      .select("count", { count: "exact", head: true })

    if (tableError && tableError.code === "42P01") {
      // Table doesn't exist, return sample categories data
      const sampleCategories = [
        {
          id: 1,
          name_persian: "عشق",
          name_english: "Love",
          description_persian: "اشعار در مورد عشق و محبت",
          description_english: "Poems about love and affection",
          created_at: new Date().toISOString(),
          quote_count: includeStats ? 1 : undefined,
        },
        {
          id: 2,
          name_persian: "عرفان",
          name_english: "Mysticism",
          description_persian: "اشعار عرفانی و معنوی",
          description_english: "Mystical and spiritual poems",
          created_at: new Date().toISOString(),
          quote_count: includeStats ? 1 : undefined,
        },
        {
          id: 3,
          name_persian: "محبت",
          name_english: "Affection",
          description_persian: "اشعار در مورد محبت و دوستی",
          description_english: "Poems about affection and friendship",
          created_at: new Date().toISOString(),
          quote_count: includeStats ? 1 : undefined,
        },
      ]

      return NextResponse.json(
        {
          success: true,
          data: sampleCategories,
          count: sampleCategories.length,
          meta: {
            includeStats,
            note: "Using sample data - please run database setup scripts",
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
    }

    const query = supabase
      .from("categories")
      .select(`
        id,
        name_persian,
        name_english,
        description_persian,
        description_english,
        created_at
      `)
      .order("name_persian", { ascending: true })

    const { data: categories, error } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch categories", details: error.message }, { status: 500 })
    }

    let categoriesWithStats = categories

    // If stats requested, get quote counts for each category
    if (includeStats && categories) {
      categoriesWithStats = await Promise.all(
        categories.map(async (category) => {
          const { count } = await supabase
            .from("persian_quotes")
            .select("*", { count: "exact", head: true })
            .eq("category", category.name_persian)

          return {
            ...category,
            quote_count: count || 0,
          }
        }),
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: categoriesWithStats,
        count: categoriesWithStats?.length || 0,
        meta: { includeStats },
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
    console.error("Categories API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
