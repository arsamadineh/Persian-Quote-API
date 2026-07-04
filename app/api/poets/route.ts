import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const includeStats = searchParams.get("stats") === "true"

  const samplePoets = [
    {
      id: 1,
      name_persian: "مولانا جلال‌الدین رومی",
      name_english: "Rumi",
      birth_year: 1207,
      death_year: 1273,
      biography_persian: "مولانا جلال‌الدین محمد بلخی معروف به رومی، شاعر و عارف بزرگ قرن هفتم هجری",
      biography_english: "Jalal ad-Din Muhammad Rumi, was a 13th-century Persian poet, Islamic scholar, theologian, and Sufi mystic",
      image_url: null,
      created_at: new Date().toISOString(),
      quote_count: includeStats ? 150 : undefined,
    },
    {
      id: 2,
      name_persian: "حافظ شیرازی",
      name_english: "Hafez",
      birth_year: 1315,
      death_year: 1390,
      biography_persian: "خواجه شمس‌الدین محمد حافظ شیرازی، شاعر بزرگ غزل‌سرای ایرانی قرن هشتم هجری",
      biography_english: "Khwāje Shams-od-Dīn Moḥammad Hāfeẓ-e Shīrāzī, known by his pen name Hafez, was a Persian lyric poet",
      image_url: null,
      created_at: new Date().toISOString(),
      quote_count: includeStats ? 495 : undefined,
    },
    {
      id: 3,
      name_persian: "سعدی شیرازی",
      name_english: "Saadi",
      birth_year: 1210,
      death_year: 1291,
      biography_persian: "ابومحمد مصلح‌الدین بن عبدالله شیرازی معروف به سعدی، شاعر و نویسنده بزرگ ایرانی",
      biography_english: "Abū-Muḥammad Muṣliḥ al-Dīn bin Abdallāh Shīrāzī, better known by his pen name Saadi, was a Persian poet and prose writer",
      image_url: null,
      created_at: new Date().toISOString(),
      quote_count: includeStats ? 200 : undefined,
    },
    {
      id: 4,
      name_persian: "فردوسی",
      name_english: "Ferdowsi",
      birth_year: 940,
      death_year: 1020,
      biography_persian: "حکیم ابوالقاسم فردوسی توسی، بزرگ‌ترین حماسه‌سرای ایران و سرایندهٔ شاهنامه",
      biography_english: "Ferdowsi was a Persian poet and the author of Shahnameh, which is one of the world's longest epic poems.",
      image_url: null,
      created_at: new Date().toISOString(),
      quote_count: includeStats ? 80 : undefined,
    },
    {
      id: 5,
      name_persian: "نیما یوشیج",
      name_english: "Nima Yushij",
      birth_year: 1897,
      death_year: 1960,
      biography_persian: "علی اسفندیاری معروف به نیما یوشیج، شاعر معاصر ایرانی و بنیان‌گذار شعر نو فارسی",
      biography_english: "Nima Yushij, born Ali Esfandiari, was a contemporary Persian poet who started the 'New Poetry' movement.",
      image_url: null,
      created_at: new Date().toISOString(),
      quote_count: includeStats ? 2400 : undefined,
    },
    {
      id: 6,
      name_persian: "سهراب سپهری",
      name_english: "Sohrab Sepehri",
      birth_year: 1928,
      death_year: 1980,
      biography_persian: "سهراب سپهری، شاعر، نویسنده و نقاش معاصر ایرانی و یکی از مهم‌ترین شاعران نوپرداز",
      biography_english: "Sohrab Sepehri was a notable Iranian poet and painter, known for his clean, nature-inspired modern verse.",
      image_url: null,
      created_at: new Date().toISOString(),
      quote_count: includeStats ? 2000 : undefined,
    }
  ]

  return NextResponse.json(
    {
      success: true,
      data: samplePoets,
      count: samplePoets.length,
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
