import { type NextRequest, NextResponse } from "next/server";
import shereno from "@/lib/data/shereno.json";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const limitParam = searchParams.get("limit");
  const pageParam = searchParams.get("page");
  const random = searchParams.get("random") === "true";
  const poet = searchParams.get("poet");
  const title = searchParams.get("title");

  let poems = [...shereno];

  // Apply filters
  if (poet) {
    poems = poems.filter((p) => p.poet.includes(poet));
  }
  
  if (title) {
    poems = poems.filter((p) => p.title.includes(title));
  }

  // Get poems
  if (random) {
    // Blazing fast Fisher-Yates shuffle for a random sample or just sort randomly
    poems = poems.sort(() => Math.random() - 0.5);
  }

  // Pagination & limits
  const page = pageParam ? Math.max(1, parseInt(pageParam)) : 1;
  const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam))) : 10;
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedPoems = poems.slice(startIndex, endIndex);

  return NextResponse.json(
    {
      success: true,
      data: paginatedPoems,
      count: paginatedPoems.length,
      total: poems.length,
      meta: { limit, page, random, poet, title },
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
