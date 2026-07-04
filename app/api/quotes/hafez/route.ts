import { type NextRequest, NextResponse } from "next/server";
import hafez from "@/lib/data/hafez.json";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const limitParam = searchParams.get("limit");
  const pageParam = searchParams.get("page");
  const random = searchParams.get("random") === "true";
  const idParam = searchParams.get("id");
  const query = searchParams.get("q") || searchParams.get("query");

  let data = [...hafez];

  // Filter by ID (Ghazal Number)
  if (idParam) {
    const id = parseInt(idParam);
    if (!isNaN(id)) {
      data = data.filter((g) => g.id === id);
    }
  }

  // Filter by search query
  if (query) {
    data = data.filter((g) =>
      g.verses.some(
        (verse) =>
          verse[0].includes(query) || verse[1].includes(query)
      )
    );
  }

  // Handle Randomization
  if (random) {
    data = data.sort(() => Math.random() - 0.5);
  }

  // Pagination & limits
  const page = pageParam ? Math.max(1, parseInt(pageParam)) : 1;
  const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam))) : 10;
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedGhazals = data.slice(startIndex, endIndex);

  return NextResponse.json(
    {
      success: true,
      data: paginatedGhazals,
      count: paginatedGhazals.length,
      total: data.length,
      meta: { limit, page, random, id: idParam, query },
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
