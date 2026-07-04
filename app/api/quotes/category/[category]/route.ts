import { type NextRequest, NextResponse } from "next/server"
import sampleQuotes from "@/lib/data/poetry-quotes.json"
import hafez from "@/lib/data/hafez.json"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { category: string } }) {
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "20")
  const random = searchParams.get("random") === "true"

  const categoryName = decodeURIComponent(params.category)

  let allQuotes = sampleQuotes.filter((q) => q.category === categoryName)
    .map(q => ({ ...q, created_at: new Date().toISOString() }))

  // If category is "عرفان" or "عشق", we can also pull some from Hafez data to make it richer
  if (categoryName === "عرفان" || categoryName === "عشق") {
    const hafezQuotes = hafez.slice(0, 50).map((ghazal: any) => ({
      id: 1000 + ghazal.id,
      text_persian: ghazal.verses.slice(0, 2).map((v: string[]) => v.join(" / ")).join("\n"),
      text_english: `Ghazal #${ghazal.id}`,
      poet: "حافظ شیرازی",
      poet_english: "Hafez",
      source: "دیوان حافظ",
      category: categoryName,
      tags: [categoryName, "شعر"],
      created_at: new Date().toISOString()
    }))
    allQuotes = [...allQuotes, ...hafezQuotes]
  }

  const finalQuotes = random
    ? allQuotes.sort(() => Math.random() - 0.5).slice(0, limit)
    : allQuotes.slice(0, limit)

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
    }
  )
}
