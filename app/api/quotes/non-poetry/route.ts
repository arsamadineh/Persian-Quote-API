import { type NextRequest, NextResponse } from "next/server";
import nonPoetryQuotes from "@/lib/data/non-poetry-quotes.json";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const limitParam = searchParams.get("limit");
  const pageParam = searchParams.get("page");
  const random = searchParams.get("random") === "true";
  const author = searchParams.get("author");

  let quotes = [...nonPoetryQuotes];

  // Apply filters
  if (author) {
    quotes = quotes.filter((q) => q.author === author);
  }

  // Get quotes
  if (random) {
    // Blazing fast Fisher-Yates shuffle for a random sample or just sort randomly
    quotes = quotes.sort(() => Math.random() - 0.5);
  }

  // Pagination & limits
  const page = pageParam ? Math.max(1, parseInt(pageParam)) : 1;
  const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam))) : 10;
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedQuotes = quotes.slice(startIndex, endIndex);

  return NextResponse.json(
    {
      success: true,
      data: paginatedQuotes,
      count: paginatedQuotes.length,
      total: quotes.length,
      meta: { limit, page, random, author },
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
