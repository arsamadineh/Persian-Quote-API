// اعمال وصله‌های انسانی روی ساختار.
//
// وصله‌ها در data/golden/human/*.jsonl نگه داشته می‌شوند. هر خط یک HumanPatch
// است. قاعدهٔ سخت: هر ویرایش ساختاری باید اثر انگشت حرفی متن را دست‌نخورده
// بگذارد؛ تغییر واژه فقط از راه typoDecisions و با justification ممکن است.
// وصلهٔ معتبر بر خروجی مدل اولویت دارد: origin = human و confidence = 1.

import fs from "node:fs";
import path from "node:path";
import { letterFingerprint } from "@persian-quote/poem";
import type { HumanPatch, ReviewItem } from "../contracts/review";

export const HUMAN_DIR = path.join(process.cwd(), "data", "golden", "human");

function flatten(lines: string[][]): string {
  return lines.flat().join(" ");
}

/**
 * اعتبارسنجی وصله بر پایهٔ contracts/review.ts.
 * ساختار پیشنهادی باید همان حروف متن مرجع را داشته باشد و از بندهای تهی پرهیز کند.
 */
export function validatePatch(item: ReviewItem, patch: HumanPatch): { ok: boolean; reason?: string } {
  if (patch.workId !== item.workId) {
    return { ok: false, reason: "workId_mismatch" };
  }
  if (!Array.isArray(patch.stanzas) || patch.stanzas.length === 0) {
    return { ok: false, reason: "empty_stanzas" };
  }
  for (const stanza of patch.stanzas) {
    if (!Array.isArray(stanza) || stanza.length === 0) {
      return { ok: false, reason: "empty_stanza" };
    }
    if (stanza.some((line) => typeof line !== "string" || line.trim().length === 0)) {
      return { ok: false, reason: "empty_line" };
    }
  }

  const before = letterFingerprint(item.flat);
  const after = letterFingerprint(flatten(patch.stanzas));
  if (before !== after) {
    return { ok: false, reason: "fingerprint_changed" };
  }
  return { ok: true };
}

export interface HumanPatchLoad {
  patches: Map<string, HumanPatch>;
  rejected: Array<{ workId: string; reason: string }>;
}

/**
 * خواندن همهٔ وصله‌ها. وصلهٔ نامعتبر رد می‌شود و متن جایگزین آن اعمال نمی‌گردد.
 * item برای هر workId باید ساخته شود؛ در نبود آیتم، وصله بدون بررسی اثر انگشت
 * پذیرفته نمی‌شود.
 */
export function loadHumanPatches(buildItem: (workId: string) => ReviewItem | null): HumanPatchLoad {
  const patches = new Map<string, HumanPatch>();
  const rejected: Array<{ workId: string; reason: string }> = [];
  if (!fs.existsSync(HUMAN_DIR)) return { patches, rejected };

  const files = fs
    .readdirSync(HUMAN_DIR)
    .filter((f) => f.endsWith(".jsonl"))
    .sort();

  for (const file of files) {
    const raw = fs.readFileSync(path.join(HUMAN_DIR, file), "utf-8");
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      let patch: HumanPatch;
      try {
        patch = JSON.parse(line) as HumanPatch;
      } catch {
        rejected.push({ workId: `${file}:unparsable`, reason: "invalid_json" });
        continue;
      }
      const item = buildItem(patch.workId);
      if (!item) {
        rejected.push({ workId: patch.workId, reason: "unknown_work" });
        continue;
      }
      const verdict = validatePatch(item, patch);
      if (!verdict.ok) {
        rejected.push({ workId: patch.workId, reason: verdict.reason ?? "invalid" });
        continue;
      }
      patches.set(patch.workId, patch);
    }
  }
  return { patches, rejected };
}
