// pipeline/clean-poetry.ts — clean and structure the three classical corpora.
// Run: bun pipeline/clean-poetry.ts

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const POETS = [
  { slug: "molavi", name_fa: "مولانا جلال‌الدین بلخی", name_en: "Rumi (Molavi)", file: "data/poetry/molavi/moulavi_norm.txt" },
  { slug: "saadi", name_fa: "سعدی شیرازی", name_en: "Saadi Shirazi", file: "data/poetry/saadi/saadi_norm.txt" },
  { slug: "ferdowsi", name_fa: "فردوسی", name_en: "Ferdowsi", file: "data/poetry/ferdowsi/ferdousi_norm.txt" },
];

function normalizePersian(s: string): string {
  return s
    .normalize("NFC")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/إ|أ|آ/g, (c) => (c === "آ" ? "آ" : "ا"))
    .replace(/\u200c{2,}/g, "\u200c")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([،؛؟!.:])/g, "$1")
    .trim();
}

for (const poet of POETS) {
  const raw = fs.readFileSync(path.join(ROOT, poet.file), "utf-8");
  const lines = raw.split("\n").map((l) => normalizePersian(l)).filter((l) => l.length > 0);
  // group contiguous lines into poems by blank-line separation in original
  const rawLines = raw.split("\n");
  const poems: string[][] = [];
  let current: string[] = [];
  for (const l of rawLines) {
    const n = normalizePersian(l);
    if (n.length === 0) {
      if (current.length > 0) { poems.push(current); current = []; }
    } else {
      current.push(n);
    }
  }
  if (current.length > 0) poems.push(current);

  // build beyts (pairs of hemistichs)
  // if a single poem is too large (e.g. Shahnameh), chunk into 200-line units
  const MAX_LINES = 200;
  let chunks: string[][] = [];
  if (poems.length === 1 && poems[0]!.length > MAX_LINES) {
    const p = poems[0]!;
    for (let i = 0; i < p.length; i += MAX_LINES) {
      chunks.push(p.slice(i, i + MAX_LINES));
    }
  } else {
    chunks = poems;
  }
  const structured = chunks.map((p, idx) => {
    const beyts: [string, string][] = [];
    for (let i = 0; i + 1 < p.length; i += 2) {
      beyts.push([p[i]!, p[i + 1]!]);
    }
    if (p.length % 2 === 1) beyts.push([p[p.length - 1]!, ""]);
    return {
      id: `${poet.slug}.${idx + 1}`,
      poet_id: poet.slug,
      title: `اثر ${idx + 1}`,
      category: "نامشخص",
      meter: null,
      url: null,
      verses: p.map((line, i) => ({
        order: i + 1,
        text: line,
        hemistich1: i % 2 === 0 ? line : null,
        hemistich2: i % 2 === 1 ? line : null,
      })),
      beyts,
    };
  });

  const outDir = path.join(ROOT, "data", "poetry", poet.slug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "poems.json"), JSON.stringify({
    poet: { id: poet.slug, name_fa: poet.name_fa, name_en: poet.name_en, slug: poet.slug },
    source: "https://github.com/amnghd/Persian_poems_corpus",
    cleaned_at: new Date().toISOString().slice(0, 10),
    poems: structured,
  }, null, 2), "utf-8");
  console.log(`${poet.slug}: ${chunks.length} poems, ${lines.length} lines`);
}