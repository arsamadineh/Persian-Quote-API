// بازسازی artifact ساختار برای همهٔ آثار پیکره.
//
// ویژگی‌ها:
//   - بازپذیر (resumable): نتیجهٔ هر اثر در data/derived/.cache نگه داشته می‌شود.
//   - کلید کش: هش محتوای متن + نسخهٔ موتور ساختار (pipeline/structure-version.ts).
//   - خودتوان (idempotent): دو اجرا artifact بایت‌به‌بایت یکسان می‌سازد.
//   - اثر انگشت: هیچ واژه‌ای تغییر نمی‌کند؛ فقط ساختار استنتاج می‌شود.
//   - وصلهٔ انسانی (در صورت وجود) با origin = human و confidence = 1 اولویت دارد.

import fs from "node:fs";
import path from "node:path";
import { structurePoem, letterFingerprint } from "@persian-quote/poem";
import type { StructureResult } from "../contracts/structure";
import type { ReviewItem } from "../contracts/review";
import { DERIVED_DIR, flatText, loadCanonicalWorks } from "./corpus";
import { STRUCTURE_VERSION, contentHash } from "./structure-version";
import { loadHumanPatches } from "./human-patches";

const CACHE_DIR = path.join(DERIVED_DIR, ".cache");
const OUT_JSONL = path.join(DERIVED_DIR, "structure.jsonl");
const OUT_MANIFEST = path.join(DERIVED_DIR, "structure-manifest.json");

interface CachedStructure {
  version: string;
  result: StructureResult;
}

interface StructureRecord {
  id: string;
  poet_id: string;
  source_form: string;
  content_hash: string;
  structure_version: string;
  structure: {
    form: string;
    origin: string;
    confidence: number;
    flags: string[];
  };
  stanzas: string[][];
  typos: { token: string; suggestion: string; ratio: number }[];
  fingerprint_preserved: boolean;
}

function cachePath(hash: string): string {
  return path.join(CACHE_DIR, `${hash}__${STRUCTURE_VERSION}.json`);
}

function infer(flat: string, poetId: string, hash: string): StructureResult {
  const target = cachePath(hash);
  if (fs.existsSync(target)) {
    const cached = JSON.parse(fs.readFileSync(target, "utf-8")) as CachedStructure;
    if (cached.version === STRUCTURE_VERSION) return cached.result;
  }
  const result = structurePoem(flat, { poetId });
  fs.writeFileSync(target, JSON.stringify({ version: STRUCTURE_VERSION, result }), "utf-8");
  return result;
}

function itemFor(workId: string, flat: string, result: StructureResult): ReviewItem {
  return {
    workId,
    flat,
    proposed: result.stanzas,
    confidence: result.confidence,
    flags: result.flags,
    ...(result.typos ? { typos: result.typos } : {}),
  };
}

export function rebuild(): {
  records: StructureRecord[];
  manifest: Record<string, unknown>;
} {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.mkdirSync(DERIVED_DIR, { recursive: true });

  const works = loadCanonicalWorks();
  const limit = Number(process.env.REBUILD_LIMIT ?? 0);
  const selected = limit > 0 ? works.slice(0, limit) : works;

  // اثر انگشت مرجع برای اعتبارسنجی وصله‌ها.
  const flatById = new Map<string, string>();
  const resultById = new Map<string, StructureResult>();
  const hashById = new Map<string, string>();
  const workById = new Map<string, (typeof selected)[number]>();

  for (const work of selected) {
    const flat = flatText(work);
    const hash = contentHash(flat);
    const result = infer(flat, work.poet_id, hash);
    flatById.set(work.id, flat);
    resultById.set(work.id, result);
    hashById.set(work.id, hash);
    workById.set(work.id, work);
  }

  const patchLoad = loadHumanPatches((workId) => {
    const flat = flatById.get(workId);
    const result = resultById.get(workId);
    if (!flat || !result) return null;
    return itemFor(workId, flat, result);
  });

  const records: StructureRecord[] = [];
  for (const work of selected) {
    const flat = flatById.get(work.id)!;
    const hash = hashById.get(work.id)!;
    let result = resultById.get(work.id)!;

    const patch = patchLoad.patches.get(work.id);
    if (patch) {
      result = {
        ...result,
        stanzas: patch.stanzas,
        origin: "human",
        confidence: 1,
      };
    }

    records.push({
      id: work.id,
      poet_id: work.poet_id,
      source_form: work.form,
      content_hash: hash,
      structure_version: STRUCTURE_VERSION,
      structure: {
        form: result.form,
        origin: result.origin,
        confidence: result.confidence,
        flags: result.flags,
      },
      stanzas: result.stanzas,
      typos: result.typos ?? [],
      fingerprint_preserved:
        letterFingerprint(flat) === letterFingerprint(work.stanzas.flat().join(" ")),
    });
  }

  records.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const body = records.map((r) => JSON.stringify(r)).join("\n");
  fs.writeFileSync(OUT_JSONL, body.length > 0 ? `${body}\n` : "", "utf-8");

  const byOrigin: Record<string, number> = {};
  const byForm: Record<string, number> = {};
  const bands = { gte_0_9: 0, between_0_7_and_0_9: 0, lt_0_7: 0 };
  let fingerprintOk = 0;
  for (const r of records) {
    byOrigin[r.structure.origin] = (byOrigin[r.structure.origin] ?? 0) + 1;
    byForm[r.structure.form] = (byForm[r.structure.form] ?? 0) + 1;
    const c = r.structure.confidence;
    if (c >= 0.9) bands.gte_0_9++;
    else if (c >= 0.7) bands.between_0_7_and_0_9++;
    else bands.lt_0_7++;
    if (r.fingerprint_preserved) fingerprintOk++;
  }

  const total = records.length;
  const share = (n: number) => (total === 0 ? 0 : Number((n / total).toFixed(4)));

  const manifest = {
    structure_version: STRUCTURE_VERSION,
    works: total,
    fingerprint_preserved: total === 0 ? 1 : Number((fingerprintOk / total).toFixed(4)),
    human_patches_applied: patchLoad.patches.size,
    human_patches_rejected: patchLoad.rejected,
    by_origin: byOrigin,
    by_form: byForm,
    confidence_bands: {
      gte_0_9: { count: bands.gte_0_9, share: share(bands.gte_0_9) },
      between_0_7_and_0_9: { count: bands.between_0_7_and_0_9, share: share(bands.between_0_7_and_0_9) },
      lt_0_7: { count: bands.lt_0_7, share: share(bands.lt_0_7) },
    },
  };

  fs.writeFileSync(OUT_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");

  return { records, manifest };
}

if (import.meta.main) {
  const { manifest } = rebuild();
  console.log(JSON.stringify(manifest, null, 2));
}
