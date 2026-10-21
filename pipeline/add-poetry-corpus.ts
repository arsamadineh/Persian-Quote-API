// pipeline/add-poetry-corpus.ts — integrate data/poetry into canonical works.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CANON = path.join(ROOT, "data", "canonical");

function readJsonl(p: string): any[] {
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p, "utf-8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
}
function writeJsonl(p: string, rows: any[]) {
  fs.writeFileSync(p, rows.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf-8");
}

const poets = readJsonl(path.join(CANON, "poets.jsonl"));
const collections = readJsonl(path.join(CANON, "collections.jsonl"));
const works = readJsonl(path.join(CANON, "works.jsonl"));

const poetMeta: Record<string, any> = {
  molavi: { slug: "molavi", name_persian: "مولانا جلال‌الدین بلخی", name_english: "Rumi (Molavi)", era: "early_islamic", birth: { year_gregorian: 1207 }, death: { year_gregorian: 1273 }, bio_persian: "جلال‌الدین محمد بلخی، مولوی، سرایندهٔ مثنوی معنوی و دیوان شمس.", bio_english: "Jalal ad-Din Muhammad Balkhi (Rumi).", collections: ["masnavi"], rights_summary: { default_status: "public_domain", notes: "full" }, stats: { works_count: 0, stanza_count: 0 } },
};

// ensure molavi poet
if (!poets.find((p) => p.slug === "molavi")) poets.push(poetMeta.molavi);

// ensure molavi collection
if (!collections.find((c) => c.slug === "molavi")) {
  collections.push({ slug: "molavi", title_persian: "دیوان مولانا", title_english: "Divan of Rumi", poet_slug: "molavi", rights_summary: { default_status: "public_domain", notes: "full" } });
}

const existingIds = new Set(works.map((w) => w.id));

let added = 0;
for (const slug of ["molavi", "saadi", "ferdowsi"]) {
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "poetry", slug, "poems.json"), "utf-8"));
  const poet = d.poet;
  // find poet meta
  const pm = poets.find((p) => p.slug === slug);
  const poetName = pm?.name_persian || poet.name_fa;
  const collId = slug === "saadi" ? "bustan" : slug === "ferdowsi" ? "shahnameh" : "masnavi";
  const collTitle = collections.find((c) => c.slug === collId)?.title_persian || poetName;
  // offset to avoid id collisions
  const existingNums = works.filter((w) => w.collection_id === collId).map((w) => w.number || 0);
  const offset = existingNums.length > 0 ? Math.max(...existingNums) : 0;
  for (let pi = 0; pi < d.poems.length; pi++) {
    const poem = d.poems[pi];
    const num = offset + pi + 1;
    const id = `${slug}.${collId}.${num}`;
    if (existingIds.has(id)) continue;
    const stanzas = poem.beyts && poem.beyts.length > 0
      ? poem.beyts.map((b: string[]) => b.filter((x) => x && x.trim().length > 0))
      : [poem.verses.map((v: any) => v.text)];
    const flat = stanzas.flat().filter(Boolean);
    const lineCount = flat.length;
    const stanzaCount = stanzas.length || 1;
    const work = {
      id,
      title: poem.title,
      title_english: undefined,
      poet_id: slug,
      poet_name: poetName,
      collection_id: collId,
      collection_title: collTitle,
      number: parseInt(id.split(".").pop() || "0", 10) || 0,
      form: "other",
      stanzas,
      text_plain: flat.join("\n"),
      attribution: { status: "verified" },
      rights: { status: "public_domain", license: "public-domain", provenance: "amnghd/Persian_poems_corpus (normalized)" },
      tags: [],
      structure_meta: { origin: "separators", confidence: 1, line_count: lineCount, stanza_count: stanzaCount, has_colophon: false },
      structure: { origin: "separators", confidence: 1, form: "other" },
      source: { edition: "amnghd/Persian_poems_corpus" },
    };
    works.push(work);
    existingIds.add(id);
    added++;
  }
  // update poet stats
  if (pm) {
    const cnt = works.filter((w) => w.poet_id === slug).length;
    pm.stats = pm.stats || { works_count: 0, stanza_count: 0 };
    pm.stats.works_count = cnt;
  }
}

writeJsonl(path.join(CANON, "works.jsonl"), works);
writeJsonl(path.join(CANON, "poets.jsonl"), poets);
writeJsonl(path.join(CANON, "collections.jsonl"), collections);
console.log("added", added, "total works", works.length);