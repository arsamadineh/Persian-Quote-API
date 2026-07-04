import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const includeStats = searchParams.get("stats") === "true"

  const sampleCategories = [
    {
      id: 1,
      name_persian: "عشق",
      name_english: "Love",
      description_persian: "اشعار در مورد عشق و محبت",
      description_english: "Poems about love and affection",
      created_at: new Date().toISOString(),
      quote_count: includeStats ? 350 : undefined,
    },
    {
      id: 2,
      name_persian: "عرفان",
      name_english: "Mysticism",
      description_persian: "اشعار عرفانی و معنوی",
      description_english: "Mystical and spiritual poems",
      created_at: new Date().toISOString(),
      quote_count: includeStats ? 450 : undefined,
    },
    {
      id: 3,
      name_persian: "محبت",
      name_english: "Affection",
      description_persian: "اشعار در مورد محبت و دوستی",
      description_english: "Poems about affection and friendship",
      created_at: new Date().toISOString(),
      quote_count: includeStats ? 280 : undefined,
    },
    {
      id: 4,
      name_persian: "طبیعت",
      name_english: "Nature",
      description_persian: "اشعار در توصیف زیبایی‌های طبیعت",
      description_english: "Poems describing the beauty of nature",
      created_at: new Date().toISOString(),
      quote_count: includeStats ? 120 : undefined,
    },
    {
      id: 5,
      name_persian: "اخلاق",
      name_english: "Ethics",
      description_persian: "اشعار اخلاقی و پندآموز",
      description_english: "Ethical and didactic poems",
      created_at: new Date().toISOString(),
      quote_count: includeStats ? 180 : undefined,
    }
  ]

  return NextResponse.json(
    {
      success: true,
      data: sampleCategories,
      count: sampleCategories.length,
      meta: { includeStats },
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
