// packages/tools/measure.ts
// Measure identifyVerse hit@1/hit@5 and latency.
// Run: bun packages/tools/measure.ts

import fs from "node:fs";
import path from "node:path";
import { buildVerseIndex, identifyVerse } from "./src/identify";
import type { Corpus, Work } from "../../contracts/corpus";

const ROOT = process.cwd();
const FILE = path.join(ROOT, "data", "canonical", "hafez.jsonl");

function main() {
  const works = fs.readFileSync(FILE, "utf-8").trim().split("\n").map((l) => JSON.parse(l) as Work);
  // build corpus of beyts
  const corpusWorks: Work[] = [];
  for (const w of works.slice(0, 50)) {
    const beyts = (w.beyts && w.beyts.length > 0) ? w.beyts : (w.stanzas || []).map((s) => [s[0] ?? "", s[1] ?? ""] as [string, string]);
    for (let bi = 0; bi < beyts.length; bi++) {
      const b = beyts[bi]!;
      corpusWorks.push({
        ...w,
        id: `${w.id}#${bi}`,
        stanzas: [[b[0], b[1]]],
        beyts: [b],
      });
    }
  }
  const corpus: Corpus = { works: corpusWorks };
  const idx = buildVerseIndex(corpus);

  // build queries: damage 1-3 words
  const rng = (s: number) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0x100000000; };
  const r = rng(42);
  let hit1 = 0, hit5 = 0, total = 0;
  const latencies: number[] = [];
  for (let q = 0; q < 40; q++) {
    const entry = corpusWorks[Math.floor(r() * corpusWorks.length)]!;
    const beyt = entry.beyts![0]!;
    const hemistich = r() < 0.5 ? beyt[0] : beyt[1];
    const toks = hemistich.split(/\s+/).filter(Boolean);
    // damage 1-3 words
    const damaged = [...toks];
    const nDamage = 1 + Math.floor(r() * 3);
    for (let d = 0; d < nDamage && damaged.length > 2; d++) {
      const idx2 = Math.floor(r() * damaged.length);
      if (r() < 0.5) damaged.splice(idx2, 1);
      else damaged[idx2] = "کلمه";
    }
    const query = damaged.join(" ");
    const t0 = performance.now();
    const res = identifyVerse(idx, query, { top: 5 });
    latencies.push(performance.now() - t0);
    total++;
    if (res.length > 0 && res[0]!.workId === entry.id) hit1++;
    if (res.some((x) => x.workId === entry.id)) hit5++;
  }
  latencies.sort((a, b) => a - b);
  const p95 = latencies[Math.floor(latencies.length * 0.95)]!;
  console.log(JSON.stringify({ total, hit1, hit5, hit1_rate: hit1 / total, hit5_rate: hit5 / total, p95_ms: Number(p95.toFixed(2)), index_size: idx.size }, null, 2));
}

main();
