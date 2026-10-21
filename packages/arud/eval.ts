// packages/arud/eval.ts
// Consistency + coverage evaluation on Hafez ghazals.
// Run: bun packages/arud/eval.ts

import fs from "node:fs";
import path from "node:path";
import { scanPoem } from "./src/scan";

const ROOT = process.cwd();
const FILE = path.join(ROOT, "data", "canonical", "hafez.jsonl");

interface Work { id: string; form: string; stanzas: string[][] }

function main() {
  const works = fs.readFileSync(FILE, "utf-8").trim().split("\n").map((l) => JSON.parse(l) as Work);
  let consistent = 0;
  let covered = 0;
  const meterCounts = new Map<string, number>();
  for (const w of works) {
    const beyts = w.stanzas.map((s) => [s[0] ?? "", s[1] ?? ""] as [string, string]);
    const r = scanPoem(beyts);
    if (r.meter) {
      covered++;
      meterCounts.set(r.meter, (meterCounts.get(r.meter) ?? 0) + 1);
    }
    // per-beyt agreement: fraction of hemistichs whose best meter == poem winner
    const winner = r.meter;
    if (winner) {
      let agree = 0;
      let total = 0;
      for (const pair of r.perBeyt) {
        for (const hr of pair) {
          total++;
          if (hr.meter === winner || (hr.candidates[0]?.meter === winner)) agree++;
        }
      }
      if (total > 0 && agree / total >= 0.8) consistent++;
    }
  }
  const consistency = works.length === 0 ? 0 : consistent / works.length;
  const coverage = works.length === 0 ? 0 : covered / works.length;
  console.log(JSON.stringify({
    works: works.length,
    consistent,
    consistency: Number(consistency.toFixed(4)),
    covered,
    coverage: Number(coverage.toFixed(4)),
    meter_distribution: Object.fromEntries([...meterCounts.entries()].sort((a, b) => b[1] - a[1])),
  }, null, 2));
  console.log(`Consistency: ${(consistency * 100).toFixed(1)}% (target >= 90%)`);
  console.log(`Coverage: ${(coverage * 100).toFixed(1)}%`);
}

main();
