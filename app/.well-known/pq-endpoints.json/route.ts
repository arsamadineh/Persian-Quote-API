import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const manifest = {
    version: "1",
    endpoints: [
      { url: "https://api.persianquote.example/v1", priority: 1 },
      { url: "https://mirror.persianquote.example/v1", priority: 2 },
    ],
    updated: "2026-10-18",
  };
  return NextResponse.json(manifest, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
