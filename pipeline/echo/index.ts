// pipeline/echo/index.ts — intertext echo detection (L10).
// Run: bun pipeline/echo/index.ts

import fs from "node:fs";
import path from "node:path";
import { normalizeSearch } from "@persian-quote/persian";
import { tokenize } from "@persian-quote/persian";

const ROOT = process.cwd();
const WORKS = path.join(ROOT, "data", "canonical", "works.jsonl");
const OUT_JSONL = path.join(ROOT, "docs", "echoes.jsonl");
const OUT_CSV = path.join(ROOT, "docs", "echo-review.csv");

const NUM_PERM = 128;
const NUM_BANDS = 16;
const ROWS_PER_BAND = NUM_PERM / NUM_BANDS;
const SEED = 42;

interface Unit {
  id: string;
  workId: string;
  poetId: string;
  poetName: string;
  deathYearCE?: number;
  kind: "hemistich" | "line";
  text: string;
  norm: string;
  tokens: string[];
  shingles: string[];
}

interface Echo {
  a: string; b: string; workA: string; workB: string;
  poetA: string; poetB: string;
  similarity: number; kind: "quote" | "partial" | "formula" | "same_poet_dup";
  direction: "a_to_b" | "b_to_a" | "undirected";
}

function hashStr(s: string, seed: number): number {
  let h = seed;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function shinglesOf(tokens: string[]): string[] {
  if (tokens.length <= 4) {
    // char 5-grams of joined text
    const s = tokens.join("");
    const out: string[] = [];
    for (let i = 0; i + 5 <= s.length; i++) out.push(s.slice(i, i + 5));
    return out.length > 0 ? out : [s];
  }
  const out: string[] = [];
  for (let i = 0; i + 3 <= tokens.length; i++) out.push(tokens.slice(i, i + 3).join(" "));
  return out;
}

function minHash(shingles: string[]): Uint32Array {
  const sig = new Uint32Array(NUM_PERM);
  for (let p = 0; p < NUM_PERM; p++) {
    let min = 0xffffffff;
    for (const sh of shingles) {
      const h = hashStr(sh, SEED + p * 997);
      if (h < min) min = h;
    }
    sig[p] = min === 0xffffffff ? 0 : min;
  }
  return sig;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function editSim(a: string[], b: string[]): number {
  // token-level similarity = 1 - normalized levenshtein
  const n = a.length, m = b.length;
  if (n === 0 && m === 0) return 1;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i]![0] = i;
  for (let j = 0; j <= m; j++) dp[0]![j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + cost);
    }
  }
  const dist = dp[n]![m]!;
  return 1 - dist / Math.max(n, m, 1);
}

function main() {
  const t0 = performance.now();
  const works = fs.readFileSync(WORKS, "utf-8").trim().split("\n").map((l) => JSON.parse(l));
  // build units
  const units: Unit[] = [];
  for (const w of works) {
    const deathYearCE = w.source?.deathYearCE ?? undefined;
    const isClassical = w.form && (w.form === "ghazal" || w.form === "qasida" || w.form === "masnavi" || w.form === "robaee");
    if (isClassical && Array.isArray(w.beyts)) {
      for (let bi = 0; bi < w.beyts.length; bi++) {
        const [h1, h2] = w.beyts[bi]!;
        for (const h of [h1, h2]) {
          const norm = normalizeSearch(h);
          const toks = tokenize(norm);
          units.push({ id: `${w.id}#b${bi}`, workId: w.id, poetId: w.poet_id, poetName: w.poet_name, deathYearCE, kind: "hemistich", text: h, norm, tokens: toks, shingles: shinglesOf(toks) });
        }
      }
    } else {
      const lines = (w.stanzas || []).flat();
      for (let li = 0; li < lines.length; li++) {
        const norm = normalizeSearch(lines[li]!);
        const toks = tokenize(norm);
        if (toks.length < 3) continue;
        units.push({ id: `${w.id}#l${li}`, workId: w.id, poetId: w.poet_id, poetName: w.poet_name, deathYearCE, kind: "line", text: lines[li]!, norm, tokens: toks, shingles: shinglesOf(toks) });
      }
    }
  }

  // compute minhash signatures
  const sigs = units.map((u) => minHash(u.shingles));

  // LSH banding -> candidate pairs
  const bands = Array.from({ length: NUM_BANDS }, () => new Map<string, number[]>());
  for (let i = 0; i < units.length; i++) {
    const sig = sigs[i]!;
    for (let b = 0; b < NUM_BANDS; b++) {
      const start = b * ROWS_PER_BAND;
      const key = sig.slice(start, start + ROWS_PER_BAND).join(",");
      const map = bands[b]!;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(i);
    }
  }

  const candidateSet = new Set<string>();
  for (const map of bands) {
    for (const ids of map.values()) {
      if (ids.length < 2) continue;
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const a = ids[i]!, b2 = ids[j]!;
          if (units[a]!.workId === units[b2]!.workId) continue;
          const key = a < b2 ? `${a}:${b2}` : `${b2}:${a}`;
          candidateSet.add(key);
        }
      }
    }
  }

  // formulaic shingle set: shingles appearing in >= 8 works
  const shingleWorkCount = new Map<string, Set<string>>();
  for (const u of units) {
    for (const sh of new Set(u.shingles)) {
      if (!shingleWorkCount.has(sh)) shingleWorkCount.set(sh, new Set());
      shingleWorkCount.get(sh)!.add(u.workId);
    }
  }
  const formulaShingles = new Set<string>();
  for (const [sh, works] of shingleWorkCount) {
    if (works.size >= 8) formulaShingles.add(sh);
  }

  // verify candidates
  const echoes: Echo[] = [];
  for (const key of candidateSet) {
    const [ia, ib] = key.split(":").map(Number);
    const uA = units[ia!]!, uB = units[ib!]!;
    const setA = new Set(uA.shingles);
    const setB = new Set(uB.shingles);
    const jac = jaccard(setA, setB);
    if (jac < 0.5) continue;
    const sim = editSim(uA.tokens, uB.tokens);
    // formula check
    const sharedFormula = uA.shingles.some((sh) => formulaShingles.has(sh) && setB.has(sh));
    let kind: Echo["kind"];
    if (uA.poetId === uB.poetId) kind = "same_poet_dup";
    else if (sharedFormula) kind = "formula";
    else if (jac >= 0.95) kind = "quote";
    else kind = "partial";

    // direction
    let direction: Echo["direction"] = "undirected";
    if (uA.deathYearCE !== undefined && uB.deathYearCE !== undefined) {
      if (uA.deathYearCE < uB.deathYearCE) direction = "a_to_b";
      else if (uB.deathYearCE < uA.deathYearCE) direction = "b_to_a";
    }

    echoes.push({
      a: uA.id, b: uB.id, workA: uA.workId, workB: uB.workId,
      poetA: uA.poetId, poetB: uB.poetId,
      similarity: Number(Math.max(jac, sim).toFixed(4)),
      kind, direction,
    });
  }

  // write echoes.jsonl
  fs.writeFileSync(OUT_JSONL, echoes.map((e) => JSON.stringify(e)).join("\n") + (echoes.length ? "\n" : ""), "utf-8");

  // echo-review.csv: stratified 50 per kind
  const byKind = new Map<string, Echo[]>();
  for (const e of echoes) {
    if (!byKind.has(e.kind)) byKind.set(e.kind, []);
    byKind.get(e.kind)!.push(e);
  }
  const sample: Echo[] = [];
  for (const [, arr] of byKind) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    sample.push(...shuffled.slice(0, 50));
  }
  const csvLines = ["a,b,workA,workB,poetA,poetB,similarity,kind,direction"];
  for (const e of sample) {
    csvLines.push([e.a, e.b, e.workA, e.workB, e.poetA, e.poetB, e.similarity, e.kind, e.direction].join(","));
  }
  fs.writeFileSync(OUT_CSV, csvLines.join("\n") + "\n", "utf-8");

  const counts: Record<string, number> = {};
  for (const e of echoes) counts[e.kind] = (counts[e.kind] ?? 0) + 1;
  const runtime = performance.now() - t0;
  console.log(JSON.stringify({ units: units.length, candidates: candidateSet.size, echoes: echoes.length, counts, runtime_ms: Number(runtime.toFixed(1)) }, null, 2));
}

main();
