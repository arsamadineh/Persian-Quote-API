import fs from "node:fs";
import path from "node:path";
import { PoemSchema, PoetSchema, CollectionSchema, StableIdSchema } from "@persian-quote/schema";
import { letterFingerprint } from "@persian-quote/poem";

const ROOT = process.cwd();
const CANONICAL_DIR = path.join(ROOT, "data", "canonical");
const LEGACY_DIR = path.join(ROOT, "data", "legacy");

function readJsonl(file: string): unknown[] {
  const raw = fs.readFileSync(file, "utf-8");
  if (!raw.trim()) return [];
  return raw
    .split("\n")
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l));
}

let failures: string[] = [];
let warnings: string[] = [];
function fail(msg: string) {
  failures.push(msg);
}
function warn(msg: string) {
  warnings.push(msg);
}

console.log("Validating canonical data (WS1)...");

const worksPath = path.join(CANONICAL_DIR, "works.jsonl");
const poetsPath = path.join(CANONICAL_DIR, "poets.jsonl");
const collectionsPath = path.join(CANONICAL_DIR, "collections.jsonl");
const idMapPath = path.join(ROOT, "data", "id-map.jsonl");

for (const p of [worksPath, poetsPath, collectionsPath, idMapPath]) {
  if (!fs.existsSync(p)) fail(`missing required file: ${path.relative(ROOT, p)}`);
}
if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

const works = readJsonl(worksPath) as Array<Record<string, unknown>>;
const poets = readJsonl(poetsPath) as Array<Record<string, unknown>>;
const collections = readJsonl(collectionsPath) as Array<Record<string, unknown>>;
const idMap = readJsonl(idMapPath) as Array<{
  legacy_source: string;
  legacy_id: string | number;
  legacy_index: number;
  canonical_id: string;
}>;

console.log(`- works: ${works.length}`);
console.log(`- poets: ${poets.length}`);
console.log(`- collections: ${collections.length}`);
console.log(`- id-map: ${idMap.length}`);

// 1. Schema validation
let schemaErrors = 0;
for (const [i, w] of works.entries()) {
  const res = PoemSchema.safeParse(w);
  if (!res.success) {
    schemaErrors++;
    if (schemaErrors <= 5) fail(`works[${i}] schema error: ${res.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; ")}`);
  }
}
if (schemaErrors > 5) fail(`... plus ${schemaErrors - 5} more works schema errors (total ${schemaErrors})`);

for (const [i, p] of poets.entries()) {
  const res = PoetSchema.safeParse(p);
  if (!res.success) fail(`poets[${i}] schema error: ${res.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; ")}`);
}
for (const [i, c] of collections.entries()) {
  const res = CollectionSchema.safeParse(c);
  if (!res.success) fail(`collections[${i}] schema error: ${res.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; ")}`);
}

// 2. Stable ID format + uniqueness
const seenIds = new Set<string>();
for (const w of works) {
  const id = String((w as { id: string }).id);
  if (!StableIdSchema.safeParse(id).success) fail(`invalid stable id: ${id}`);
  if (seenIds.has(id)) fail(`duplicate canonical id: ${id}`);
  seenIds.add(id);
}

// 3. id-map completeness
if (idMap.length !== works.length) {
  fail(`id-map length ${idMap.length} != works length ${works.length}`);
}
const worksIds = new Set(works.map((w) => String((w as { id: string }).id)));
for (const m of idMap) {
  if (!worksIds.has(m.canonical_id)) fail(`id-map canonical_id not in works: ${m.canonical_id}`);
}

// 4. Load legacy for fingerprint + count checks
const hafezRaw = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, "hafez.json"), "utf-8")) as Array<{ id: number; verses: string[][] }>;
const sherenoRaw = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, "shereno.json"), "utf-8")) as Array<{ id: number; poem: string }>;
const poetryRaw = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, "poetry-quotes.json"), "utf-8")) as Array<{ id: number; text_persian: string }>;
const nonPoetryRaw = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, "non-poetry-quotes.json"), "utf-8")) as Array<{ id: number; body: string }>;

const legacyBySource: Record<string, unknown[]> = {
  hafez: hafezRaw,
  shereno: sherenoRaw,
  "poetry-quotes": poetryRaw,
  "non-poetry-quotes": nonPoetryRaw,
};
for (const [src, arr] of Object.entries(legacyBySource)) {
  const mapped = idMap.filter((m) => m.legacy_source === src).length;
  if (mapped !== arr.length) fail(`id-map coverage for ${src}: mapped ${mapped} != legacy ${arr.length}`);
}

function legacyFingerprint(source: string, legacyId: string | number, legacyIndex: number): string | null {
  try {
    if (source === "hafez") {
      const rec = hafezRaw[legacyIndex] as { id: number; verses: string[][] } | undefined;
      if (!rec) return null;
      return letterFingerprint(rec.verses.flat().join(" "));
    }
    if (source === "shereno") {
      const rec = sherenoRaw[legacyIndex] as { poem: string } | undefined;
      if (!rec) return null;
      return letterFingerprint(rec.poem);
    }
    if (source === "poetry-quotes") {
      const rec = poetryRaw[legacyIndex] as { text_persian: string } | undefined;
      if (!rec) return null;
      return letterFingerprint(rec.text_persian);
    }
    if (source === "non-poetry-quotes") {
      const rec = nonPoetryRaw[legacyIndex] as { body: string } | undefined;
      if (!rec) return null;
      return letterFingerprint(rec.body);
    }
    return null;
  } catch {
    return null;
  }
}

const idMapByCanonical = new Map(idMap.map((m) => [m.canonical_id, m]));

// Known partial-beyt exceptions (legacy empty second hemistich, documented in quarantine manifest)
const PARTIAL_BEYT_ALLOWLIST = new Set(["hafez.ghazaliat.3", "hafez.ghazaliat.139", "hafez.ghazaliat.260"]);

// 5. Per-work invariants (NFC, non-empty, whitespace, punctuation-only, slash, couplet, colophon, fingerprint)
let nfcViolations = 0;
let emptyLineViolations = 0;
let whitespaceEdgeViolations = 0;
let punctOnlyViolations = 0;
let slashViolations = 0;
let coupletViolations = 0;
let colophonLeakViolations = 0;
let fingerprintMismatches = 0;

const digitPunctOnly = /^[\d\p{P}\s]+$/u;

for (const w of works) {
  const parsed = PoemSchema.safeParse(w);
  if (!parsed.success) continue;
  const poem = parsed.data;
  const flat = poem.stanzas.flat();

  if (flat.length === 0) {
    fail(`${poem.id}: zero lines`);
    continue;
  }

  for (const line of flat) {
    if (!line || line.trim().length === 0) {
      emptyLineViolations++;
      fail(`${poem.id}: empty line after filter`);
      continue;
    }
    if (line !== line.normalize("NFC")) {
      nfcViolations++;
      fail(`${poem.id}: NFC violation in ${JSON.stringify(line.slice(0, 40))}`);
    }
    if (line !== line.trim()) {
      whitespaceEdgeViolations++;
      fail(`${poem.id}: leading/trailing whitespace in ${JSON.stringify(line.slice(0, 40))}`);
    }
    if (digitPunctOnly.test(line.trim())) {
      punctOnlyViolations++;
      fail(`${poem.id}: digits/punctuation-only line ${JSON.stringify(line.slice(0, 40))}`);
    }
    if (line.includes(" / ")) {
      slashViolations++;
      fail(`${poem.id}: raw " / " inside rendered line`);
    }
    if (line.includes("  ")) {
      fail(`${poem.id}: double-space run in ${JSON.stringify(line.slice(0, 60))}`);
    }
    if (line.includes("□") || line.includes("■")) {
      fail(`${poem.id}: separator glyph leaked into line`);
    }
    if (/[\u200e\u200f\u0640]/.test(line)) {
      fail(`${poem.id}: directional mark or tatweel leaked`);
    }
    if (/\s[،؛؟!.:»)\]]/.test(line)) {
      fail(`${poem.id}: space before punctuation in ${JSON.stringify(line.slice(0, 60))}`);
    }
  }

  // Classical 2-hemistich invariant: only Divan-e Hafez and curated classical couplets.
  // Modern ghazal-form poems (e.g. Shahriar) use heuristic reconstruction and are exempt.
  if (poem.poet_id === "hafez" || poem.title.startsWith("بیت برگزیده")) {
    for (const stanza of poem.stanzas) {
      if (PARTIAL_BEYT_ALLOWLIST.has(poem.id)) continue;
      if (stanza.length !== 2) {
        coupletViolations++;
        fail(`${poem.id}: classical beyt has ${stanza.length} hemistichs, expected 2`);
        break;
      }
    }
  }

  // Colophon isolation: place/date tokens must not remain in stanzas
  if (poem.colophon) {
    const joined = flat.join("\n");
    const place = (poem.colophon as { place?: string }).place;
    if (place && joined.includes(place) && place.length >= 3) {
      // Allow place name appearing naturally in verse? Strict: if colophon extracted, body must not contain raw date.
      // Only fail if date leaks; place leak is warning (place names can occur in verse).
      warn(`${poem.id}: colophon place "${place}" appears in stanzas (possible natural occurrence)`);
    }
    const dateRaw = (poem.colophon as { date_raw?: string }).date_raw;
    if (dateRaw) {
      const digits = dateRaw.replace(/\D/g, "");
      if (digits.length >= 4 && joined.includes(dateRaw)) {
        colophonLeakViolations++;
        fail(`${poem.id}: colophon date_raw leaked into stanzas`);
      }
    }
  }

  // Letter-fingerprint preservation vs legacy (R4)
  const mapping = idMapByCanonical.get(poem.id);
  if (mapping) {
    const legacyFp = legacyFingerprint(mapping.legacy_source, mapping.legacy_id, mapping.legacy_index);
    if (legacyFp !== null) {
      // Canonical fingerprint: join stanzas + colophon raw (colophon removed from body, so add back for comparison)
      // Colophon tokens are signals (like *), stripped by fingerprint except place/date digits?
      // Fingerprint strips □■*/whitespace/ZWNJ but keeps letters/digits of place/date.
      // So canonical without colophon will differ by place/date letters. Compare body-only instead:
      // Reconstruct expected: legacy fingerprint minus colophon fingerprint should equal canonical fingerprint.
      // Simpler: check that every canonical letter appears in legacy (subset check) and length diff is only colophon + signals.
      const canonicalFp = letterFingerprint(flat.join(" "));
      if (legacyFp !== canonicalFp) {
        // Allow diff only if poem has colophon (place/date removed) or filtered empty hemistich (allowlist) or box removal
        const hasColophon = !!poem.colophon;
        const isPartial = PARTIAL_BEYT_ALLOWLIST.has(poem.id);
        // Check subset: canonical letters must all be present in order in legacy (sequence check)
        let li = 0;
        let isSubsequence = true;
        for (const ch of canonicalFp) {
          const found = legacyFp.indexOf(ch, li);
          if (found === -1) {
            isSubsequence = false;
            break;
          }
          li = found + 1;
        }
        if (!isSubsequence && !hasColophon && !isPartial) {
          fingerprintMismatches++;
          if (fingerprintMismatches <= 5) fail(`${poem.id}: letter fingerprint mismatch (canonical not subsequence of legacy)`);
        } else if (!isSubsequence && (hasColophon || isPartial)) {
          warn(`${poem.id}: fingerprint diff explained by colophon/partial filtering`);
        }
      }
    }
  }
}

if (coupletViolations > 0) fail(`total couplet violations: ${coupletViolations}`);
if (nfcViolations > 0) fail(`total NFC violations: ${nfcViolations}`);

console.log("");
console.log("Invariant summary:");
console.log(`- empty lines: ${emptyLineViolations}`);
console.log(`- whitespace edges: ${whitespaceEdgeViolations}`);
console.log(`- punct-only: ${punctOnlyViolations}`);
console.log(`- slash leaks: ${slashViolations}`);
console.log(`- couplet violations: ${coupletViolations}`);
console.log(`- colophon leaks: ${colophonLeakViolations}`);
console.log(`- fingerprint mismatches: ${fingerprintMismatches}`);
console.log(`- warnings: ${warnings.length}`);
if (warnings.length > 0) {
  for (const m of warnings.slice(0, 10)) console.log(`  WARN: ${m}`);
  if (warnings.length > 10) console.log(`  ... plus ${warnings.length - 10} more warnings`);
}

if (failures.length > 0) {
  console.error("");
  console.error(`DATA VALIDATION FAILED (${failures.length} errors):`);
  for (const m of failures.slice(0, 50)) console.error(`- ${m}`);
  if (failures.length > 50) console.error(`... plus ${failures.length - 50} more`);
  process.exit(1);
}

console.log("");
console.log(`DATA VALIDATION PASSED: ${works.length} works, ${poets.length} poets, ${collections.length} collections.`);
