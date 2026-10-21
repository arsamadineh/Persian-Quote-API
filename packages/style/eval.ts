// packages/style/eval.ts — leave-one-poem-out attribution accuracy.
// Run: bun packages/style/eval.ts
import fs from "node:fs";
import path from "node:path";
import { buildProfile, attribute } from "./src";

const ROOT = process.cwd();
const FILE = path.join(ROOT, "data", "canonical", "works.jsonl");

interface Work { id: string; poet_id: string; poet_name: string; form: string; stanzas: string[][] }

function main() {
  const works = fs.readFileSync(FILE, "utf-8").trim().split("\n").map((l) => JSON.parse(l) as Work);
  // 10 largest classical poets
  const counts = new Map<string, number>();
  for (const w of works) if (w.form === "ghazal" || w.form === "qasida" || w.form === "masnavi") counts.set(w.poet_id, (counts.get(w.poet_id) ?? 0) + 1);
  const topPoets = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([p]) => p);

  const bands = { "<=100": { total: 0, hit: 0 }, "100-300": { total: 0, hit: 0 }, ">300": { total: 0, hit: 0 } };

  for (const poet of topPoets) {
    const poetWorks = works.filter((w) => w.poet_id === poet).slice(0, 5);
    for (const held of poetWorks) {
      const others = works.filter((w) => w.poet_id !== poet || w.id !== held.id);
      // build profiles per poet from others
      const byPoet = new Map<string, string[]>();
      for (const w of others) {
        if (!topPoets.includes(w.poet_id)) continue;
        if (!byPoet.has(w.poet_id)) byPoet.set(w.poet_id, []);
        byPoet.get(w.poet_id)!.push(w.stanzas.flat().join(" "));
      }
      const profiles = [...byPoet.entries()].map(([id, texts]) => buildProfile(id, texts));
      const text = held.stanzas.flat().join(" ");
      const words = text.split(/\s+/).filter(Boolean).length;
      const band = words <= 100 ? "<=100" : words <= 300 ? "100-300" : ">300";
      const res = attribute(text, profiles);
      bands[band].total++;
      if (res.length > 0 && res[0]!.id === poet) bands[band].hit++;
    }
  }
  const out: Record<string, { total: number; accuracy: number }> = {};
  for (const [b, v] of Object.entries(bands)) {
    out[b] = { total: v.total, accuracy: v.total === 0 ? 0 : Number((v.hit / v.total).toFixed(4)) };
  }
  console.log(JSON.stringify({ bands: out }, null, 2));
}

main();
