import { type NextRequest, NextResponse } from "next/server"
import sampleQuotes from "@/lib/data/poetry-quotes.json"
import hafez from "@/lib/data/hafez.json"
import shereno from "@/lib/data/shereno.json"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { poet: string } }) {
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "20")
  const random = searchParams.get("random") === "true"

  const poetName = decodeURIComponent(params.poet)

  // We can fetch from all local datasets (general poetry, hafez, or shereno) based on poet name match
  let allQuotes: any[] = []

  // Check if poet name matches Hafez
  if (poetName.includes("حافظ") || poetName.toLowerCase().includes("hafez")) {
    // Convert ghazals to quote format
    allQuotes = hafez.map((ghazal: any) => ({
      id: ghazal.id,
      text_persian: ghazal.verses.slice(0, 2).map((v: string[]) => v.join(" / ")).join("\n"),
      text_english: `Ghazal #${ghazal.id}`,
      poet: "حافظ شیرازی",
      poet_english: "Hafez",
      source: "دیوان حافظ",
      category: "عرفان",
      tags: ["عرفان", "غزل"],
      created_at: new Date().toISOString()
    }))
  } 
  // Check if poet name matches Sher-e-No poets
  else if (
    poetName.includes("نیما") || 
    poetName.includes("سهراب") || 
    poetName.includes("شاملو") || 
    poetName.includes("فرخزاد") || 
    poetName.toLowerCase().includes("sepehri") || 
    poetName.toLowerCase().includes("yushij")
  ) {
    const filteredShereno = shereno.filter((p: any) => p.poet.includes(poetName) || p.poet.toLowerCase().includes(poetName.toLowerCase()))
    allQuotes = filteredShereno.map((poem: any) => ({
      id: poem.id,
      text_persian: poem.poem.substring(0, 150) + "...",
      text_english: poem.title,
      poet: poem.poet,
      poet_english: poem.poet === "نیما یوشیج" ? "Nima Yushij" : poem.poet === "سهراب سپهری" ? "Sohrab Sepehri" : poem.poet,
      source: poem.book || "مجموعه اشعار",
      category: "شعر نو",
      tags: ["شعر نو", "معاصر"],
      created_at: new Date().toISOString()
    }))
  }
  // Otherwise search general sampleQuotes
  else {
    allQuotes = sampleQuotes.filter(
      (q) => q.poet.includes(poetName) || q.poet_english.toLowerCase().includes(poetName.toLowerCase())
    ).map(q => ({ ...q, created_at: new Date().toISOString() }))
  }

  const finalQuotes = random
    ? allQuotes.sort(() => Math.random() - 0.5).slice(0, limit)
    : allQuotes.slice(0, limit)

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
    }
  )
}
