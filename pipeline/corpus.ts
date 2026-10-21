// دسترسی مشترک به پیکرهٔ متنی برای اسکریپت‌های بازسازی، ارزیابی و صف بازبینی.

import fs from "node:fs";
import path from "node:path";
import { cleanLine } from "@persian-quote/poem";

export const ROOT = process.cwd();
export const CANONICAL_DIR = path.join(ROOT, "data", "canonical");
export const DERIVED_DIR = path.join(ROOT, "data", "derived");

export interface CorpusWork {
  id: string;
  poet_id: string;
  form: string;
  stanzas: string[][];
  text_plain: string;
}

export function readJsonl<T>(file: string): T[] {
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf-8");
  return raw
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as T);
}

export function loadCanonicalWorks(): CorpusWork[] {
  return readJsonl<CorpusWork>(path.join(CANONICAL_DIR, "works.jsonl"));
}

/**
 * متن تخت: بندها به یک رشتهٔ تک‌سطری تبدیل می‌شوند تا نشانه‌های شکست خط از بین
 * برود و موتور ساختار ناچار شود ساختار را از ویژگی‌های زبانی استنتاج کند.
 * واژه‌ها دست‌نخورده می‌مانند؛ فقط فاصله‌ها و نشانه‌های جداکننده تأثیر می‌گیرند.
 */
export function flatText(work: { stanzas: string[][] }): string {
  return work.stanzas
    .flat()
    .map((line) => cleanLine(line))
    .filter((line) => line.length > 0)
    .join(" ");
}

export function letterOnly(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
