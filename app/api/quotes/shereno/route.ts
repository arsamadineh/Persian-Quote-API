import { engine, createNextHandler } from "@/lib/engine/instance";

export const dynamic = "force-dynamic";

const handler = createNextHandler(engine);

export async function GET(request: Request, context?: { params: Promise<Record<string, string>> }) {
  return handler(request, context);
}
