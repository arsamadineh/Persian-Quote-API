import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const includeStats = searchParams.get("stats") === "true"

  try {
    const { data: tableCheck, error: tableError } = await supabase
      .from("poets")
      .select("count", { count: "exact", head: true })

    if (tableError && tableError.code === "42P01") {
      // Table doesn't exist, return sample poets data
      const samplePoets = [
        {
          id: 1,
          name_persian: "مولانا جلال‌الدین رومی",
          name_english: "Rumi",
          birth_year: 1207,
          death_year: 1273,
          biography_persian: "مولانا جلال‌الدین محمد بلخی معروف به رومی، شاعر و عارف بزرگ قرن هفتم هجری",
          biography_english:
            "Jalal ad-Din Muhammad Rumi, was a 13th-century Persian poet, Islamic scholar, theologian, and Sufi mystic",
          image_url: null,
          created_at: new Date().toISOString(),
          quote_count: includeStats ? 1 : undefined,
        },
        {
          id: 2,
          name_persian: "حافظ شیرازی",
          name_english: "Hafez",
          birth_year: 1315,
          death_year: 1390,
          biography_persian: "خواجه شمس‌الدین محمد حافظ شیرازی، شاعر بزرگ غزل‌سرای ایرانی قرن هشتم هجری",
          biography_english:
            "Khwāje Shams-od-Dīn Moḥammad Hāfeẓ-e Shīrāzī, known by his pen name Hafez, was a Persian lyric poet",
          image_url: null,
          created_at: new Date().toISOString(),
          quote_count: includeStats ? 1 : undefined,
        },
        {
          id: 3,
          name_persian: "سعدی شیرازی",
          name_english: "Saadi",
          birth_year: 1210,
          death_year: 1291,
          biography_persian: "ابومحمد مصلح‌الدین بن عبدالله شیرازی معروف به سعدی، شاعر و نویسنده بزرگ ایرانی",
          biography_english:
            "Abū-Muḥammad Muṣliḥ al-Dīn bin Abdallāh Shīrāzī, better known by his pen name Saadi, was a Persian poet and prose writer",
          image_url: null,
          created_at: new Date().toISOString(),
          quote_count: includeStats ? 1 : undefined,
        },
      ]

      return NextResponse.json(
        {
          success: true,
          data: samplePoets,
          count: samplePoets.length,
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
      .from("poets")
      .select(`
        id,
        name_persian,
        name_english,
        birth_year,
        death_year,
        biography_persian,
        biography_english,
        image_url,
        created_at
      `)
      .order("birth_year", { ascending: true })

    const { data: poets, error } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch poets", details: error.message }, { status: 500 })
    }

    let poetsWithStats = poets

    // If stats requested, get quote counts for each poet
    if (includeStats && poets) {
      poetsWithStats = await Promise.all(
        poets.map(async (poet) => {
          const { count } = await supabase
            .from("persian_quotes")
            .select("*", { count: "exact", head: true })
            .eq("poet", poet.name_persian)

          return {
            ...poet,
            quote_count: count || 0,
          }
        }),
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: poetsWithStats,
        count: poetsWithStats?.length || 0,
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
    console.error("Poets API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
