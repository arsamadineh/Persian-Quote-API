// ارزیابی صادقانهٔ ساختار — دروازهٔ CI.
//
// روش: متن هر اثر پیش از پیش‌بینی تخت می‌شود (بندها و شکست خط‌ها حذف می‌گردند)
// تا موتور هیچ نشانه‌ای از ساختار واقعی نبیند. ارزیابی با leave-poet-out پنج‌تایی
// انجام می‌شود. دو دروازه اعمال می‌شود:
//   ۱. افت F1 سطر هیچ فرمی نسبت به خط پایهٔ ثبت‌شده از ۱ واحد بیشتر نباشد.
//   ۲. ECE ≤ ۰٫۰۸.
//
// اجرا:  bun pipeline/eval-structure.ts
//        EVAL_CORPUS=full bun pipeline/eval-structure.ts
//        bun pipeline/eval-structure.ts --update-baseline

import fs from "node:fs";
import path from "node:path";
import {
  cleanLine,
  letterFingerprint,
  extractColophon,
  pickExcerpt,
  structurePoem,
} from "@persian-quote/poem";
import { ROOT, loadCanonicalWorks, flatText } from "./corpus";
import { STRUCTURE_VERSION } from "./structure-version";

const SAMPLE_FILE = path.join(ROOT, "data", "golden", "sample300.jsonl");
const BASELINE_DIR = path.join(ROOT, "pipeline", "baselines");
const BASELINE_FILE = path.join(BASELINE_DIR, "structure-baseline.json");
const LATEST_FILE = path.join(BASELINE_DIR, "structure-eval-latest.json");

const F1_DROP_TOLERANCE = 0.01;
const ECE_MAX = 0.08;
const ECE_BINS = 10;

interface EvalWork {
  id: string;
  poet_id: string;
  form: string;
  stanzas: string[][];
}

function loadSample(): EvalWork[] {
  const raw = fs.readFileSync(SAMPLE_FILE, "utf-8");
  return raw
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as EvalWork);
}

function loadCorpus(): EvalWork[] {
  if (process.env.EVAL_CORPUS === "full") {
    return loadCanonicalWorks() as EvalWork[];
  }
  return loadSample();
}

function prf(tp: number, fp: number, fn: number) {
  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return {
    precision: Number(precision.toFixed(4)),
    recall: Number(recall.toFixed(4)),
    f1: Number(f1.toFixed(4)),
    tp,
    fp,
    fn,
  };
}

function boundariesOf(stanzas: string[][]): { lines: Set<number>; stanzas: Set<number>; count: number } {
  const lines = new Set<number>();
  const stanzaBreaks = new Set<number>();
  let index = 0;
  for (let si = 0; si < stanzas.length; si++) {
    const stanza = stanzas[si]!;
    for (let li = 0; li < stanza.length; li++) {
      index += cleanLine(stanza[li]!).split(/\s+/).filter(Boolean).length;
      if (li < stanza.length - 1 || si < stanzas.length - 1) lines.add(index - 1);
    }
    if (si < stanzas.length - 1) stanzaBreaks.add(index - 1);
  }
  return { lines, stanzas: stanzaBreaks, count: index };
}

interface FormAcc {
  tpLines: number;
  fpLines: number;
  fnLines: number;
  tpStanzas: number;
  fpStanzas: number;
  fnStanzas: number;
  works: number;
}

function newAcc(): FormAcc {
  return { tpLines: 0, fpLines: 0, fnLines: 0, tpStanzas: 0, fpStanzas: 0, fnStanzas: 0, works: 0 };
}

/** خطای کالیبراسیون مورد انتظار با ۱۰ سطل یکنواخت روی [۰،۱]. */
function computeEce(pairs: Array<[number, number]>): number {
  if (pairs.length === 0) return 0;
  const bins = Array.from({ length: ECE_BINS }, () => ({ n: 0, sumConf: 0, sumCorr: 0 }));
  for (const [conf, corr] of pairs) {
    const idx = Math.min(ECE_BINS - 1, Math.max(0, Math.floor(conf * ECE_BINS)));
    const bin = bins[idx]!;
    bin.n++;
    bin.sumConf += conf;
    bin.sumCorr += corr;
  }
  let ece = 0;
  for (const bin of bins) {
    if (bin.n === 0) continue;
    ece += (bin.n / pairs.length) * Math.abs(bin.sumConf / bin.n - bin.sumCorr / bin.n);
  }
  return Number(ece.toFixed(4));
}

export interface EvalResult {
  corpus: string;
  structure_version: string;
  works: number;
  poets: number;
  per_form: Record<string, { works: number; line: ReturnType<typeof prf>; stanza: ReturnType<typeof prf> }>;
  overall_line: ReturnType<typeof prf>;
  overall_stanza: ReturnType<typeof prf>;
  ece: number;
  ece_f1: number;
  fold_f1: number[];
  fingerprint_preservation_rate: number;
  confidence_bands: { gte_0_9: number; between_0_7_and_0_9: number; lt_0_7: number };
  appendix_a: Record<string, unknown>;
}

export function runEval(): EvalResult {
  const corpusName = process.env.EVAL_CORPUS === "full" ? "canonical" : "sample300";
  const works = loadCorpus();

  const poets = Array.from(new Set(works.map((w) => w.poet_id))).sort();
  const poetFold = new Map<string, number>();
  poets.forEach((p, i) => poetFold.set(p, i % 5));

  const perForm = new Map<string, FormAcc>();
  const foldAcc = Array.from({ length: 5 }, newAcc);
  const overall = newAcc();

  let fingerprintOk = 0;
  let fingerprintTotal = 0;

  // جفت‌های (confidence, correctness) برای ECE
  const calibration: Array<[number, number]> = [];
  const calibrationF1: Array<[number, number]> = [];
  const bands = { gte_0_9: 0, between_0_7_and_0_9: 0, lt_0_7: 0 };

  for (const work of works) {
    const form = work.form || "other";
    const acc = perForm.get(form) ?? newAcc();
    perForm.set(form, acc);
    const fold = foldAcc[poetFold.get(work.poet_id) ?? 0]!;

    const flat = flatText(work);
    fingerprintTotal++;
    if (letterFingerprint(flat) === letterFingerprint(work.stanzas.flat().join(" "))) fingerprintOk++;

    const predicted = structurePoem(flat, { poetId: work.poet_id });
    const c = predicted.confidence;
    if (c >= 0.9) bands.gte_0_9++;
    else if (c >= 0.7) bands.between_0_7_and_0_9++;
    else bands.lt_0_7++;

    const truth = boundariesOf(work.stanzas);
    const pred = boundariesOf(predicted.stanzas);

    let lineTp = 0;
    let lineFp = 0;
    let lineFn = 0;
    for (const b of pred.lines) {
      if (truth.lines.has(b)) lineTp++;
      else lineFp++;
    }
    for (const b of truth.lines) if (!pred.lines.has(b)) lineFn++;

    let stTp = 0;
    let stFp = 0;
    let stFn = 0;
    for (const b of pred.stanzas) {
      if (truth.stanzas.has(b)) stTp++;
      else stFp++;
    }
    for (const b of truth.stanzas) if (!pred.stanzas.has(b)) stFn++;

    for (const target of [acc, fold, overall]) {
      target.tpLines += lineTp;
      target.fpLines += lineFp;
      target.fnLines += lineFn;
      target.tpStanzas += stTp;
      target.fpStanzas += stFp;
      target.fnStanzas += stFn;
      target.works++;
    }

    // متغیر درستی برای ECE: دقت برچسب‌گذاری هر شکاف واژگانی.
    // مفهوم confidence: احتمال درست بودن تصمیم شکست/عدم‌شکست در شکاف‌های سطر.
    // هر شکاف یا شکست سطر است یا نیست؛ دقت = (TP + TN) / همهٔ شکاف‌ها.
    const linePrf = prf(lineTp, lineFp, lineFn);
    const totalGaps = Math.max(1, truth.count - 1);
    const trueNegative = Math.max(0, totalGaps - lineTp - lineFp - lineFn);
    const boundaryAccuracy = (lineTp + trueNegative) / totalGaps;
    calibration.push([c, boundaryAccuracy]);
    calibrationF1.push([c, linePrf.f1]);
  }

  const perFormResult: EvalResult["per_form"] = {};
  for (const [form, acc] of [...perForm.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    perFormResult[form] = {
      works: acc.works,
      line: prf(acc.tpLines, acc.fpLines, acc.fnLines),
      stanza: prf(acc.tpStanzas, acc.fpStanzas, acc.fnStanzas),
    };
  }

  // ECE با ۱۰ سطل یکنواخت روی [۰،۱]
  const ece = computeEce(calibration);
  const eceF1 = computeEce(calibrationF1);

  return {
    corpus: corpusName,
    structure_version: STRUCTURE_VERSION,
    works: works.length,
    poets: poets.length,
    per_form: perFormResult,
    overall_line: prf(overall.tpLines, overall.fpLines, overall.fnLines),
    overall_stanza: prf(overall.tpStanzas, overall.fpStanzas, overall.fnStanzas),
    ece: Number(ece.toFixed(4)),
    ece_f1: Number(eceF1.toFixed(4)),
    fold_f1: foldAcc.map((acc) => prf(acc.tpLines, acc.fpLines, acc.fnLines).f1),
    fingerprint_preservation_rate: fingerprintTotal === 0 ? 1 : Number((fingerprintOk / fingerprintTotal).toFixed(4)),
    confidence_bands: bands,
    appendix_a: appendixA(),
  };
}

// --- چک‌های پیوست الف (بدون تغییر نسبت به نسخهٔ پیشین) ---
function appendixA(): Record<string, unknown> {
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
    (a1Col.colophon?.date_jalali as { y: number } | undefined)?.y === 1364 &&
    !a1Col.body.includes("تنکابن") &&
    !a1Col.body.includes("1364");

  const a1Lines = a1Col.body.split("\n").map(cleanLine).filter(Boolean);
  const a1NoDoubleSpace = a1Lines.every((l) => !/\s{2,}/.test(l));
  const a1Excerpt = pickExcerpt([a1Lines], { maxWords: 25 });
  const a1ExcerptWords = a1Excerpt.lines.reduce((s, l) => s + l.split(/\s+/).filter(Boolean).length, 0);

  const a2Raw = "همواره ،در امتداد شب ،سکوت جاری بود .";
  const a2Clean = cleanLine(a2Raw);
  const a2Pass = a2Clean.includes("همواره، در") && !a2Clean.includes(" ،") && !a2Clean.includes(" .");

  const works = loadCanonicalWorks();
  let whitespace = 0;
  let punctOnly = 0;
  let slash = 0;
  let classicalOk = 0;
  let classicalTotal = 0;
  const partial = new Set(["hafez.ghazaliat.3", "hafez.ghazaliat.139", "hafez.ghazaliat.260"]);
  for (const w of works) {
    for (const line of (w.stanzas || []).flat()) {
      if (line !== line.trim()) whitespace++;
      if (/^[\d\p{P}\s]+$/u.test(line.trim())) punctOnly++;
      if (line.includes(" / ")) slash++;
    }
    if (w.poet_id === "hafez" && !partial.has(w.id)) {
      for (const st of w.stanzas || []) {
        classicalTotal++;
        if (st.length === 2) classicalOk++;
      }
    }
  }

  return {
    A1_pass: a1Pass && a1NoDoubleSpace && a1ExcerptWords <= 25 && a1Excerpt.lines.length > 0,
    A1_excerpt_words: a1ExcerptWords,
    A2_pass: a2Pass,
    A3_pass: whitespace === 0 && punctOnly === 0 && slash === 0 && classicalOk === classicalTotal,
    A3_whitespace_violations: whitespace,
    A3_punct_only_violations: punctOnly,
    A3_slash_violations: slash,
  };
}

interface Baseline {
  corpus: string;
  structure_version: string;
  per_form: Record<string, { line_f1: number }>;
  ece: number;
}

function updateBaseline(result: EvalResult): void {
  fs.mkdirSync(BASELINE_DIR, { recursive: true });
  const baseline: Baseline = {
    corpus: result.corpus,
    structure_version: result.structure_version,
    per_form: Object.fromEntries(Object.entries(result.per_form).map(([f, v]) => [f, { line_f1: v.line.f1 }])),
    ece: result.ece,
  };
  fs.writeFileSync(BASELINE_FILE, `${JSON.stringify(baseline, null, 2)}\n`, "utf-8");
  console.log(`Baseline written to ${BASELINE_FILE}`);
}

function checkGates(result: EvalResult): { failures: string[] } {
  const failures: string[] = [];
  if (!fs.existsSync(BASELINE_FILE)) {
    failures.push(`baseline_missing:${BASELINE_FILE}`);
    return { failures };
  }
  const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, "utf-8")) as Baseline;
  for (const [form, ref] of Object.entries(baseline.per_form)) {
    const current = result.per_form[form];
    if (!current) {
      failures.push(`${form}:missing(current) baseline=${ref.line_f1}`);
      continue;
    }
    const drop = ref.line_f1 - current.line.f1;
    if (drop > F1_DROP_TOLERANCE) {
      failures.push(`${form}:F1 ${current.line.f1} vs ${ref.line_f1} (drop ${drop.toFixed(4)})`);
    }
  }
  if (result.ece > ECE_MAX) {
    failures.push(`ECE ${result.ece} > ${ECE_MAX}`);
  }
  return { failures };
}

if (import.meta.main) {
  const result = runEval();
  fs.mkdirSync(BASELINE_DIR, { recursive: true });
  fs.writeFileSync(LATEST_FILE, `${JSON.stringify(result, null, 2)}\n`, "utf-8");

  if (process.argv.includes("--update-baseline")) {
    updateBaseline(result);
  }

  const { failures } = checkGates(result);

  const table = Object.entries(result.per_form).map(([form, v]) => ({
    form,
    works: v.works,
    line_f1: v.line.f1,
    stanza_f1: v.stanza.f1,
  }));
  console.log(JSON.stringify({ ...result, per_form_table: table, gate_failures: failures }, null, 2));
  console.log(
    `\nEval: corpus=${result.corpus} works=${result.works} line_f1=${result.overall_line.f1} ece=${result.ece}`
  );
  const bands = result.confidence_bands;
  const total = Math.max(1, result.works);
  console.log(
    `Confidence bands (share): >=0.9 ${(bands.gte_0_9 / total).toFixed(4)} | ` +
      `0.7-0.9 ${(bands.between_0_7_and_0_9 / total).toFixed(4)} | ` +
      `<0.7 ${(bands.lt_0_7 / total).toFixed(4)}`
  );

  if (!result.appendix_a.A1_pass || !result.appendix_a.A2_pass || !result.appendix_a.A3_pass) {
    console.error("APPENDIX A FIXTURE FAILURE");
    process.exit(1);
  }
  if (failures.length > 0) {
    console.error(`STRUCTURE GATE FAILED: ${failures.join("; ")}`);
    process.exit(1);
  }
  console.log("STRUCTURE GATE PASSED");
}
