import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const random = searchParams.get("random") === "true"
  const poet = searchParams.get("poet")
  const category = searchParams.get("category")

  const sampleQuotes = [
    {
      id: 1,
      text_persian: "عاشقان مرده‌اند در عشق زنده / تا ابد در دل جانان پاینده",
      text_english: "Lovers are dead in love, yet alive / Forever enduring in the beloved's heart",
      poet: "مولانا جلال‌الدین رومی",
      poet_english: "Rumi",
      source: "دیوان شمس",
      category: "عشق",
      tags: ["عشق", "زندگی", "معنویت"],
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      text_persian: "دوش از مسجد سوی میخانه آمد پیرِ ما / ای خدا این چه منزل است که پیر ما آمد",
      text_english:
        "Last night our elder came from mosque to tavern / O God, what a station this is, that our elder came",
      poet: "حافظ شیرازی",
      poet_english: "Hafez",
      source: "دیوان حافظ",
      category: "عرفان",
      tags: ["عرفان", "حکمت", "زندگی"],
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      text_persian: "هر که را در دل محبت جای است / جان او را آرامش و صفای است",
      text_english: "Whoever has love's place in their heart / Their soul has peace and purity",
      poet: "سعدی شیرازی",
      poet_english: "Saadi",
      source: "بوستان",
      category: "محبت",
      tags: ["محبت", "آرامش", "معنویت"],
      created_at: new Date().toISOString(),
    },
    {
      id: 4,
      text_persian: "بهار آمد و بر لب جوی آب / نشست و چنین گفت با آفتاب",
      text_english: "Spring came and sat by the stream's edge / And spoke thus to the sun",
      poet: "فردوسی",
      poet_english: "Ferdowsi",
      source: "شاهنامه",
      category: "طبیعت",
      tags: ["طبیعت", "بهار", "زیبایی"],
      created_at: new Date().toISOString(),
    },
    {
      id: 5,
      text_persian: "گر همه کافران جهان گردند مؤمن / من ز عشق تو نگردم کافر ای جان",
      text_english: "If all the world's unbelievers become faithful / I will not become faithless to your love, O soul",
      poet: "حافظ شیرازی",
      poet_english: "Hafez",
      source: "دیوان حافظ",
      category: "عشق",
      tags: ["عشق", "وفاداری", "عرفان"],
      created_at: new Date().toISOString(),
    },
    {
      id: 6,
      text_persian: "خوشا آن روز که از خود بروم / وز سر عشق به جان آن شوم",
      text_english: "Blessed is the day I leave myself behind / And become the soul of that beloved through love",
      poet: "مولانا جلال‌الدین رومی",
      poet_english: "Rumi",
      source: "مثنوی معنوی",
      category: "عرفان",
      tags: ["عرفان", "عشق", "فنا"],
      created_at: new Date().toISOString(),
    },
    {
      id: 7,
      text_persian: "آدمی را آرزو باید که نیکو باشد / ور نه از حیوان پست‌تر خواهد بود",
      text_english: "A human must have noble aspirations / Otherwise they will be lower than animals",
      poet: "سعدی شیرازی",
      poet_english: "Saadi",
      source: "گلستان",
      category: "اخلاق",
      tags: ["اخلاق", "انسانیت", "تعالی"],
      created_at: new Date().toISOString(),
    },
  ]

  try {
    const supabase = await createClient()

    // Test if database is accessible by checking if we can create a client and make a simple query
    const { data: testData, error: testError } = await supabase.from("persian_quotes").select("id").limit(1)

    if (testError) {
      throw new Error("Database not accessible")
    }

    // If we get here, database is working, proceed with full query
    let query = supabase.from("persian_quotes").select(`
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

    // Apply filters
    if (poet) {
      query = query.eq("poet", poet)
    }

    if (category) {
      query = query.eq("category", category)
    }

    // Apply limit
    query = query.limit(Math.min(limit, 100))

    // Get quotes
    if (random) {
      query = query.order("created_at", { ascending: false })
    } else {
      query = query.order("created_at", { ascending: false })
    }

    const { data: quotes, error } = await query

    if (error) {
      throw new Error("Query failed")
    }

    const finalQuotes = random && quotes ? quotes.sort(() => Math.random() - 0.5).slice(0, limit) : quotes

    return NextResponse.json(
      {
        success: true,
        data: finalQuotes,
        count: finalQuotes?.length || 0,
        meta: { limit, random, poet, category },
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
    console.log("[v0] Database not available, using sample data:", error)

    let filteredQuotes = sampleQuotes

    // Apply filters to sample data
    if (poet) {
      filteredQuotes = filteredQuotes.filter((q) => q.poet === poet || q.poet_english === poet)
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
          category,
          note: "Using sample data - run database setup scripts for full collection",
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
}
