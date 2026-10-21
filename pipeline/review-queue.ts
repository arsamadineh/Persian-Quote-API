// ساخت صف بازبینی انسانی.
//
// ترتیب: نمونه‌گیری عدم‌قطعیت — هر چه confidence به ۰٫۵ نزدیک‌تر، زودتر.
// تنوع: در ۵۰۰ مورد نخست، سهم هیچ شاعر از ۵٪ (۲۵ مورد) بیشتر نمی‌شود.
// خروجی: docs/review-queue.jsonl (ReviewItem) و docs/review-queue.csv.

import fs from "node:fs";
import path from "node:path";
import type { ReviewItem } from "../contracts/review";
import { DERIVED_DIR, loadCanonicalWorks, flatText } from "./corpus";

const OUT_JSONL = path.join(process.cwd(), "docs", "review-queue.jsonl");
const OUT_CSV = path.join(process.cwd(), "docs", "review-queue.csv");
const STRUCTURE_FILE = path.join(DERIVED_DIR, "structure.jsonl");

const DIVERSIFY_WINDOW = 500;
const POET_CAP = Math.floor(DIVERSIFY_WINDOW * 0.05);

interface DerivedRecord {
  id: string;
  poet_id: string;
  structure: { form: string; origin: string; confidence: number; flags: string[] };
  stanzas: string[][];
  typos: { token: string; suggestion: string; ratio: number }[];
}

function readDerived(): DerivedRecord[] {
  const raw = fs.readFileSync(STRUCTURE_FILE, "utf-8");
  return raw
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as DerivedRecord);
}

function csvField(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function buildQueue(): { items: ReviewItem[]; poets: Map<string, string> } {
  const derived = readDerived();
  const works = loadCanonicalWorks();
  const flatById = new Map<string, string>();
  for (const work of works) flatById.set(work.id, flatText(work));

  const ranked = [...derived].sort((a, b) => {
    const da = Math.abs(a.structure.confidence - 0.5);
    const db = Math.abs(b.structure.confidence - 0.5);
    if (da !== db) return da - db;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  const first: DerivedRecord[] = [];
  const deferred: DerivedRecord[] = [];
  const perPoet = new Map<string, number>();
  for (const rec of ranked) {
    if (first.length >= DIVERSIFY_WINDOW) {
      deferred.push(rec);
      continue;
    }
    const used = perPoet.get(rec.poet_id) ?? 0;
    if (used >= POET_CAP) {
      deferred.push(rec);
      continue;
    }
    perPoet.set(rec.poet_id, used + 1);
    first.push(rec);
  }

  // اگر سقف شاعرها پنجره را پر نکرد، ترتیب عدم‌قطعیت ادامه می‌یابد.
  const ordered = first.length >= DIVERSIFY_WINDOW ? [...first, ...deferred] : [...ranked];

  const items: ReviewItem[] = [];
  const poets = new Map<string, string>();
  for (const rec of ordered) {
    const flat = flatById.get(rec.id) ?? "";
    poets.set(rec.id, rec.poet_id);
    items.push({
      workId: rec.id,
      flat,
      proposed: rec.stanzas,
      confidence: rec.structure.confidence,
      flags: rec.structure.flags,
      ...(rec.typos.length > 0 ? { typos: rec.typos } : {}),
    });
  }
  return { items, poets };
}

export function writeQueue(): { items: number; firstWindowMaxPoetShare: number } {
  const { items, poets } = buildQueue();

  const jsonl = items.map((item) => JSON.stringify(item)).join("\n");
  fs.writeFileSync(OUT_JSONL, items.length > 0 ? `${jsonl}\n` : "", "utf-8");

  const lines = ["id,poet,confidence,flags,top_typo"];
  for (const item of items) {
    const poet = poets.get(item.workId) ?? "";
    const flags = item.flags.join("|");
    const typos = item.typos ?? [];
    const top = typos.length > 0 ? `${typos[0]!.token}=>${typos[0]!.suggestion}` : "";
    lines.push(
      [csvField(item.workId), csvField(poet), String(item.confidence), csvField(flags), csvField(top)].join(",")
    );
  }
  fs.writeFileSync(OUT_CSV, `${lines.join("\n")}\n`, "utf-8");

  const windowCounts = new Map<string, number>();
  for (const item of items.slice(0, DIVERSIFY_WINDOW)) {
    const poet = poets.get(item.workId) ?? "";
    windowCounts.set(poet, (windowCounts.get(poet) ?? 0) + 1);
  }
  const maxShare =
    items.length === 0
      ? 0
      : Number((Math.max(0, ...windowCounts.values()) / Math.min(DIVERSIFY_WINDOW, items.length)).toFixed(4));

  return { items: items.length, firstWindowMaxPoetShare: maxShare };
}

if (import.meta.main) {
  const summary = writeQueue();
  console.log(JSON.stringify(summary, null, 2));
}
