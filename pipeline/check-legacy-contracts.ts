// بررسی قراردادهای طلایی قدیمی (/api) بدون نیاز به سرور شبکه‌ای.
//
// ۳۰ مورد از data/golden/contracts/index.json روی موتور محلی اجرا می‌شود.
// قراردادهای قطعی (random=false) بدنه‌به‌بدنه مقایسه می‌شوند؛ قراردادهای
// تصادفی فقط از نظر کد وضعیت و شکل پاسخ بررسی می‌گردند.
//
// اجرا: bun pipeline/check-legacy-contracts.ts

import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { engine, createNextHandler } from "@/lib/engine/instance";
import { GET as embedGet } from "@/app/api/embed/route";

const ROOT = process.cwd();
const CONTRACT_DIR = path.join(ROOT, "data", "golden", "contracts");
const handler = createNextHandler(engine);

interface IndexEntry {
  slug: string;
  path: string;
  status: number;
  file: string;
}

function isDeterministic(p: string): boolean {
  return p.includes("random=false");
}

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>).sort()) {
      if (k === "uptimeMs" || k === "timestamp" || k === "instanceId" || k === "raw" || k === "total") continue;
      out[k] = normalize(v);
    }
    return out;
  }
  return value;
}

async function main(): Promise<void> {
  const index = JSON.parse(fs.readFileSync(path.join(CONTRACT_DIR, "index.json"), "utf-8")) as IndexEntry[];
  let passed = 0;
  const failures: string[] = [];

  for (const entry of index) {
    const golden = JSON.parse(fs.readFileSync(path.join(CONTRACT_DIR, entry.file), "utf-8")) as {
      statusCode: number;
      body: unknown;
    };
    const url = new URL(entry.path, "http://localhost");
    const res = url.pathname === "/api/embed"
      ? await embedGet(new NextRequest(url.toString()))
      : await handler(new Request(url.toString()));

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("json")) {
      // HTML مثل /api/embed به شعر تصادفی و مبدأ درخواست وابسته است؛
      // بنابراین فقط کد وضعیت، نوع محتوا و ساختار HTML بررسی می‌شود.
      const text = await res.text();
      const goldenText = golden.body as string;
      const hasContainer = text.includes("refresh-btn") && goldenText.includes("refresh-btn");
      if (res.status !== golden.statusCode || !contentType.includes("html") || !hasContainer) {
        failures.push(`${entry.slug}:html_contract`);
        continue;
      }
      passed++;
      continue;
    }

    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    if (res.status !== golden.statusCode) {
      failures.push(`${entry.slug}:status ${res.status} vs ${golden.statusCode}`);
      continue;
    }
    if (body === null) {
      failures.push(`${entry.slug}:not_json`);
      continue;
    }

    if (isDeterministic(entry.path)) {
      const a = JSON.stringify(normalize(body));
      const b = JSON.stringify(normalize(golden.body));
      if (a !== b) {
        failures.push(`${entry.slug}:body_mismatch`);
        continue;
      }
    } else {
      const g = golden.body as Record<string, unknown>;
      const c = body as Record<string, unknown>;
      if ("success" in g && c.success !== g.success) {
        failures.push(`${entry.slug}:success_flag`);
        continue;
      }
      const gk = Object.keys(g).sort().join(",");
      const ck = Object.keys(c).sort().join(",");
      if (gk !== ck) {
        failures.push(`${entry.slug}:keys ${ck} vs ${gk}`);
        continue;
      }
    }
    passed++;
  }

  console.log(`Legacy contracts: ${passed}/${index.length} pass`);
  if (failures.length > 0) {
    console.error(`Failures: ${failures.join("; ")}`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
