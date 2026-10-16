import fs from "node:fs";
import path from "node:path";
import { splitBySignals, cleanLine, letterFingerprint, extractColophon, pickExcerpt } from "@persian-quote/poem";

const ROOT = process.cwd();
const CANONICAL_DIR = path.join(ROOT, "data", "canonical");
const EVIDENCE_DIR = path.join(ROOT, "docs", "evidence", "phase-2");
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

function readJsonl(file: string): Array<Record<string, unknown>> {
  const raw = fs.readFileSync(file, "utf-8");
  return raw.split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
}

const works = readJsonl(path.join(CANONICAL_DIR, "works.jsonl")) as Array<{
  id: string;
  poet_id: string;
  stanzas: string[][];
  colophon?: { place?: string; date_raw?: string; date_jalali?: { y: number; m?: number; d?: number } };
  form: string;
  title: string;
}>;

console.log(`Evaluating structure engine on ${works.length} canonical works...`);

// --- Boundary precision/recall via round-trip ---
// Reconstruct raw with explicit signals (double-space for line breaks, " * " for stanza breaks),
// then run splitBySignals and compare recovered boundaries to original.
let tpLines = 0;
let fpLines = 0;
let fnLines = 0;
let tpStanzas = 0;
let fpStanzas = 0;
let fnStanzas = 0;
let roundTripWorks = 0;
let fingerprintPreserved = 0;
let fingerprintTotal = 0;

for (const w of works.slice(0, 1000)) {
  // Skip single-line aphorisms (no boundaries to evaluate)
  if (w.stanzas.flat().length < 2) continue;
  const originalStanzas = w.stanzas;
  const originalLineCount = originalStanzas.flat().length;
  const originalStanzaCount = originalStanzas.length;

  // Reconstruct raw: lines joined by double space, stanzas by " * "
  const raw = originalStanzas.map((st) => st.join("  ")).join(" * ");

  // Fingerprint preservation (R4)
  fingerprintTotal++;
  if (letterFingerprint(raw) === letterFingerprint(originalStanzas.flat().join(" "))) {
    // Note: raw includes " * " signals which fingerprint strips (like *), so should match
    // Our fingerprint strips * and whitespace, so signals don't affect it.
    fingerprintPreserved++;
  }

  const recovered = splitBySignals(raw);
  if (!recovered) {
    fnLines += originalLineCount;
    fnStanzas += originalStanzaCount;
    continue;
  }
  roundTripWorks++;

  const recoveredLineCount = recovered.flat().length;
  const recoveredStanzaCount = recovered.length;

  // Line boundary F1: compare line counts and content (exact match)
  const minLines = Math.min(originalLineCount, recoveredLineCount);
  // Count exact line matches in order
  const origFlat = originalStanzas.flat();
  const recFlat = recovered.flat();
  let matched = 0;
  for (let i = 0; i < minLines; i++) {
    if (origFlat[i] === recFlat[i]) matched++;
  }
  tpLines += matched;
  fpLines += recoveredLineCount - matched;
  fnLines += originalLineCount - matched;

  // Stanza boundary F1: compare stanza counts (exact stanza content match)
  let matchedStanzas = 0;
  const minStanzas = Math.min(originalStanzaCount, recoveredStanzaCount);
  for (let i = 0; i < minStanzas; i++) {
    const o = originalStanzas[i]?.join("\n") ?? "";
    const r = recovered[i]?.join("\n") ?? "";
    if (o === r) matchedStanzas++;
  }
  tpStanzas += matchedStanzas;
  fpStanzas += recoveredStanzaCount - matchedStanzas;
  fnStanzas += originalStanzaCount - matchedStanzas;
}

function prf(tp: number, fp: number, fn: number) {
  const precision = tp + fp === 0 ? 1 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 1 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { precision, recall, f1, tp, fp, fn };
}

const lineMetrics = prf(tpLines, fpLines, fnLines);
const stanzaMetrics = prf(tpStanzas, fpStanzas, fnStanzas);

// --- Appendix A fixture checks ---
const a1Raw = `در حاشیهٔ جاده‌های مه گرفته
صدای باران می‌آمد
یک سبد ستاره چیده بودم برای تو
کوزه‌ای پر از آب زلال آوردم
دسته‌ای گل از نگاه آفتاب چیدم
یک عبا برای شانه‌های مهربان تو در شبان سرد
چارقی برای گام‌های تو در هجوم درد
تنکابن، 12/2/1364`;

const a1Col = extractColophon(a1Raw);
const a1Pass =
  a1Col.colophon?.place === "تنکابن" &&
  a1Col.colophon?.date_raw === "12/2/1364" &&
  (a1Col.colophon?.date_jalali as { y: number; m?: number; d?: number } | undefined)?.y === 1364 &&
  !a1Col.body.includes("تنکابن") &&
  !a1Col.body.includes("1364");

const a1Lines = a1Col.body.split("\n").map(cleanLine).filter(Boolean);
const a1NoDoubleSpace = a1Lines.every((l) => !/\s{2,}/.test(l));
const a1Excerpt = pickExcerpt([a1Lines], { maxWords: 25 });
const a1ExcerptWords = a1Excerpt.lines.reduce((s, l) => s + l.split(/\s+/).filter(Boolean).length, 0);
const a1ExcerptPass = a1ExcerptWords <= 25 && a1Excerpt.lines.length > 0;

const a2Raw = "همواره ،در امتداد شب ،سکوت جاری بود .";
const a2Clean = cleanLine(a2Raw);
const a2Pass = a2Clean.includes("همواره، در") && !a2Clean.includes(" ،") && !a2Clean.includes(" .");

// A3 corpus scans (same as validate-data, but counted here for F1 report)
let a3Whitespace = 0;
let a3PunctOnly = 0;
let a3Slash = 0;
let a3ClassicalOk = 0;
let a3ClassicalTotal = 0;
const PARTIAL = new Set(["hafez.ghazaliat.3", "hafez.ghazaliat.139", "hafez.ghazaliat.260"]);
for (const w of works) {
  for (const line of w.stanzas.flat()) {
    if (line !== line.trim()) a3Whitespace++;
    if (/^[\d\p{P}\s]+$/u.test(line.trim())) a3PunctOnly++;
    if (line.includes(" / ")) a3Slash++;
  }
  if (w.poet_id === "hafez" && !PARTIAL.has(w.id)) {
    for (const st of w.stanzas) {
      a3ClassicalTotal++;
      if (st.length === 2) a3ClassicalOk++;
    }
  }
}
const a3Pass = a3Whitespace === 0 && a3PunctOnly === 0 && a3Slash === 0 && a3ClassicalOk === a3ClassicalTotal;

const result = {
  generated_at: new Date().toISOString(),
  corpus: {
    works_evaluated: works.length,
    round_trip_sample: roundTripWorks,
  },
  line_boundary: {
    precision: Number(lineMetrics.precision.toFixed(4)),
    recall: Number(lineMetrics.recall.toFixed(4)),
    f1: Number(lineMetrics.f1.toFixed(4)),
    tp: lineMetrics.tp,
    fp: lineMetrics.fp,
    fn: lineMetrics.fn,
  },
  stanza_boundary: {
    precision: Number(stanzaMetrics.precision.toFixed(4)),
    recall: Number(stanzaMetrics.recall.toFixed(4)),
    f1: Number(stanzaMetrics.f1.toFixed(4)),
    tp: stanzaMetrics.tp,
    fp: stanzaMetrics.fp,
    fn: stanzaMetrics.fn,
  },
  fingerprint_preservation_rate: fingerprintTotal === 0 ? 1 : Number((fingerprintPreserved / fingerprintTotal).toFixed(4)),
  appendix_a: {
    A1_colophon_place: a1Col.colophon?.place ?? null,
    A1_colophon_date_raw: a1Col.colophon?.date_raw ?? null,
    A1_pass: a1Pass && a1NoDoubleSpace && a1ExcerptPass,
    A1_excerpt_words: a1ExcerptWords,
    A2_cleaned: a2Clean,
    A2_pass: a2Pass,
    A3_whitespace_violations: a3Whitespace,
    A3_punct_only_violations: a3PunctOnly,
    A3_slash_violations: a3Slash,
    A3_classical_beyts_ok: a3ClassicalOk,
    A3_classical_beyts_total: a3ClassicalTotal,
    A3_pass: a3Pass,
  },
};

fs.writeFileSync(path.join(EVIDENCE_DIR, "structure-f1.json"), JSON.stringify(result, null, 2) + "\n", "utf-8");
console.log(JSON.stringify(result, null, 2));
console.log(`\nWrote ${path.join(EVIDENCE_DIR, "structure-f1.json")}`);

if (!result.appendix_a.A1_pass || !result.appendix_a.A2_pass || !result.appendix_a.A3_pass) {
  console.error("APPENDIX A FIXTURE FAILURE");
  process.exit(1);
}
if (result.line_boundary.f1 < 0.95 || result.stanza_boundary.f1 < 0.95) {
  console.error("BOUNDARY F1 BELOW 0.95 THRESHOLD");
  process.exit(1);
}
console.log("STRUCTURE EVALUATION PASSED");
