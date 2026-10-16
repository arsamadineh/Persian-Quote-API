import fs from "node:fs";
import path from "node:path";
import {
  PoemSchema,
  PoetSchema,
  CollectionSchema,
  type Poem,
  type Poet,
  type Collection,
  type PoeticForm,
} from "@persian-quote/schema";
import { toPersianDigits, cleanLine as cleanPersianLine } from "@persian-quote/persian";
import {
  extractColophon,
  cleanLine,
  splitBySignals,
  reconstructLines,
  looksStructured,
  letterFingerprint,
  analyzeStructure,
  pickExcerpt,
  detectRadifAndQafiyeh,
  detectMeter,
  determineAttribution,
} from "@persian-quote/poem";

const ROOT_DIR = process.cwd();
const LEGACY_DIR = path.join(ROOT_DIR, "data", "legacy");
const CANONICAL_DIR = path.join(ROOT_DIR, "data", "canonical");
const QUARANTINE_DIR = path.join(ROOT_DIR, "data", "quarantine");
const AUDIT_DIR = path.join(ROOT_DIR, "docs", "audit");

// Ensure directories exist
fs.mkdirSync(CANONICAL_DIR, { recursive: true });
fs.mkdirSync(QUARANTINE_DIR, { recursive: true });
fs.mkdirSync(AUDIT_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Poet Registry & Metadata
// ---------------------------------------------------------------------------
interface PoetMeta {
  slug: string;
  nameFa: string;
  nameEn: string;
  era:
    | "pre_islamic"
    | "early_islamic"
    | "seljuk"
    | "khwarazmian"
    | "ilkhanate"
    | "timurid"
    | "safavid"
    | "afsharid_zand"
    | "qajar"
    | "constitutional"
    | "pahlavi"
    | "contemporary";
  birth?: number;
  death?: number;
  bioFa: string;
  bioEn: string;
  defaultStatus: "public_domain" | "copyright_verified";
  displayPolicy: "full" | "excerpt" | "metadata_only";
}

const POET_REGISTRY: Record<string, PoetMeta> = {
  hafez: {
    slug: "hafez",
    nameFa: "حافظ شیرازی",
    nameEn: "Hafez Shirazi",
    era: "timurid",
    birth: 1315,
    death: 1390,
    bioFa: "خواجه شمس‌الدین محمد حافظ شیرازی، بزرگ‌ترین غزل‌سرای زبان فارسی در سده هشتم هجری.",
    bioEn: "Khwaje Shams al-Din Muhammad Hafez Shirazi, celebrated Persian lyric poet of the 14th century.",
    defaultStatus: "public_domain",
    displayPolicy: "full",
  },
  saadi: {
    slug: "saadi",
    nameFa: "سعدی شیرازی",
    nameEn: "Saadi Shirazi",
    era: "ilkhanate",
    birth: 1210,
    death: 1291,
    bioFa: "ابومحمد مصلح‌الدین بن عبدالله شیرازی معروف به سعدی، استاد سخن و سراینده گلستان و بوستان.",
    bioEn: "Abu-Muhammad Muslih al-Din bin Abdallah Shirazi, known as Saadi, master of Persian eloquence.",
    defaultStatus: "public_domain",
    displayPolicy: "full",
  },
  rumi: {
    slug: "rumi",
    nameFa: "مولانا جلال‌الدین رومی",
    nameEn: "Jalal al-Din Rumi",
    era: "ilkhanate",
    birth: 1207,
    death: 1273,
    bioFa: "مولانا جلال‌الدین محمد بلخی، عارف و شاعر نامدار قرن هفتم هجری و سراینده مثنوی معنوی.",
    bioEn: "Jalal al-Din Muhammad Rumi, 13th-century Persian poet, mystic, and Sufi master.",
    defaultStatus: "public_domain",
    displayPolicy: "full",
  },
  ferdowsi: {
    slug: "ferdowsi",
    nameFa: "فردوسی",
    nameEn: "Ferdowsi",
    era: "early_islamic",
    birth: 940,
    death: 1020,
    bioFa: "حکیم ابوالقاسم فردوسی توسی، سراینده شاهنامه و پاسدار زبان و هویت ملی فارسی.",
    bioEn: "Hakim Abul-Qasim Ferdowsi Tusi, author of the Shahnameh, the national epic of Greater Iran.",
    defaultStatus: "public_domain",
    displayPolicy: "full",
  },
  "nima-yushij": {
    slug: "nima-yushij",
    nameFa: "نیما یوشیج",
    nameEn: "Nima Yushij",
    era: "pahlavi",
    birth: 1897,
    death: 1960,
    bioFa: "علی اسفندیاری مشهور به نیما یوشیج، پدر شعر نو فارسی و بنیان‌گذار وزن نیمایی.",
    bioEn: "Nima Yushij, born Ali Esfandiari, pioneer of modern Persian poetry.",
    defaultStatus: "public_domain",
    displayPolicy: "full",
  },
  "sohrab-sepehri": {
    slug: "sohrab-sepehri",
    nameFa: "سهراب سپهری",
    nameEn: "Sohrab Sepehri",
    era: "contemporary",
    birth: 1928,
    death: 1980,
    bioFa: "سهراب سپهری، شاعر، نقاش و نویسنده برجسته معاصر و سراینده هشت کتاب.",
    bioEn: "Sohrab Sepehri, notable Iranian painter and poet of modern nature verse.",
    defaultStatus: "copyright_verified",
    displayPolicy: "excerpt",
  },
  "ahmad-shamlou": {
    slug: "ahmad-shamlou",
    nameFa: "احمد شاملو",
    nameEn: "Ahmad Shamlou",
    era: "contemporary",
    birth: 1925,
    death: 2000,
    bioFa: "احمد شاملو با تخلص الف. بامداد، پایه‌گذار شعر سپید در ادبیات معاصر فارسی.",
    bioEn: "Ahmad Shamlou, pen name A. Bamdad, creator of Persian blank verse (Sepid poetry).",
    defaultStatus: "copyright_verified",
    displayPolicy: "excerpt",
  },
  "forough-farrokhzad": {
    slug: "forough-farrokhzad",
    nameFa: "فروغ فرخزاد",
    nameEn: "Forough Farrokhzad",
    era: "pahlavi",
    birth: 1935,
    death: 1967,
    bioFa: "فروغ فرخزاد، شاعر جسور و نواندیش معاصر ایران و سراینده تولدی دیگر.",
    bioEn: "Forough Farrokhzad, modernist poet and film director of international renown.",
    defaultStatus: "public_domain",
    displayPolicy: "full",
  },
  "mehdi-akhavan-sales": {
    slug: "mehdi-akhavan-sales",
    nameFa: "مهدی اخوان ثالث",
    nameEn: "Mehdi Akhavan-Sales",
    era: "contemporary",
    birth: 1929,
    death: 1990,
    bioFa: "مهدی اخوان ثالث با تخلص م. امید، پیونددهنده سبک خراسانی با شعر نو فارسی.",
    bioEn: "Mehdi Akhavan-Sales, prominent modern Persian poet bridging classical and modern styles.",
    defaultStatus: "copyright_verified",
    displayPolicy: "excerpt",
  },
  "fereydoon-moshiri": {
    slug: "fereydoon-moshiri",
    nameFa: "فریدون مشیری",
    nameEn: "Fereydoon Moshiri",
    era: "contemporary",
    birth: 1926,
    death: 2000,
    bioFa: "فریدون مشیری، شاعر تغزلی و مردم‌گرای معاصر با زبانی ساده، زلال و صمیمی.",
    bioEn: "Fereydoon Moshiri, renowned contemporary Persian lyric poet known for clarity and warmth.",
    defaultStatus: "copyright_verified",
    displayPolicy: "excerpt",
  },
  "salman-harati": {
    slug: "salman-harati",
    nameFa: "سلمان هراتی",
    nameEn: "Salman Harati",
    era: "contemporary",
    birth: 1959,
    death: 1986,
    bioFa: "سلمان هراتی، از شاعران برجسته و آرمان‌گرای دهه شصت و سراینده از آسمان سبز.",
    bioEn: "Salman Harati, notable modern poet known for sincere social and pastoral verse.",
    defaultStatus: "copyright_verified",
    displayPolicy: "excerpt",
  },
  "nader-naderpour": {
    slug: "nader-naderpour",
    nameFa: "نادر نادرپور",
    nameEn: "Nader Naderpour",
    era: "contemporary",
    birth: 1929,
    death: 2000,
    bioFa: "نادر نادرپور، شاعر تصویرگرا و ادیب معاصر و از پیشگامان شعر نو نیمایی.",
    bioEn: "Nader Naderpour, acclaimed poet and translator known for vivid modern Persian imagery.",
    defaultStatus: "copyright_verified",
    displayPolicy: "excerpt",
  },
  "houshang-ebtehaj": {
    slug: "houshang-ebtehaj",
    nameFa: "هوشنگ ابتهاج",
    nameEn: "Houshang Ebtehaj",
    era: "contemporary",
    birth: 1928,
    death: 2022,
    bioFa: "امیرهوشنگ ابتهاج با تخلص هـ. ا. سایه، شاعر غزل‌سرا و پژوهشگر نامی موسیقی و ادبیات.",
    bioEn: "Houshang Ebtehaj, pen name Sayeh, master of classical ghazal and modern Persian verse.",
    defaultStatus: "copyright_verified",
    displayPolicy: "excerpt",
  },
  "gheysar-aminpour": {
    slug: "gheysar-aminpour",
    nameFa: "قیصر امین پور",
    nameEn: "Gheysar Aminpour",
    era: "contemporary",
    birth: 1959,
    death: 2007,
    bioFa: "قیصر امین‌پور، ادیب، پژوهشگر و شاعر معاصر با اشعار دلنشین و ساختارمند.",
    bioEn: "Gheysar Aminpour, influential contemporary Iranian poet and academic.",
    defaultStatus: "copyright_verified",
    displayPolicy: "excerpt",
  },
  shahriar: {
    slug: "shahriar",
    nameFa: "شهریار",
    nameEn: "Shahriar",
    era: "pahlavi",
    birth: 1906,
    death: 1988,
    bioFa: "سید محمدحسین بهجت تبریزی ملقب به شهریار، از بزرگ‌ترین غزل‌سرایان سده معاصر.",
    bioEn: "Seyyed Mohammad-Hossein Behjat Tabrizi, known as Shahriar, great lyric poet.",
    defaultStatus: "copyright_verified",
    displayPolicy: "excerpt",
  },
};

// Generic slugifier for poets and collections
function slugify(s: string): string {
  const ascii = s
    .toLowerCase()
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .trim();

  // Known poet mappings
  if (ascii.includes("حافظ")) return "hafez";
  if (ascii.includes("سعدی")) return "saadi";
  if (ascii.includes("مولانا") || ascii.includes("رومی")) return "rumi";
  if (ascii.includes("فردوسی")) return "ferdowsi";
  if (ascii.includes("نیما")) return "nima-yushij";
  if (ascii.includes("سپهری")) return "sohrab-sepehri";
  if (ascii.includes("شاملو")) return "ahmad-shamlou";
  if (ascii.includes("فرخزاد")) return "forough-farrokhzad";
  if (ascii.includes("اخوان")) return "mehdi-akhavan-sales";
  if (ascii.includes("مشیری")) return "fereydoon-moshiri";
  if (ascii.includes("هراتی")) return "salman-harati";
  if (ascii.includes("نادرپور")) return "nader-naderpour";
  if (ascii.includes("ابتهاج") || ascii.includes("سایه")) return "houshang-ebtehaj";
  if (ascii.includes("امین پور") || ascii.includes("امین‌پور")) return "gheysar-aminpour";
  if (ascii.includes("شهریار")) return "shahriar";
  if (ascii.includes("م.آزاد")) return "m-azad";
  if (ascii.includes("هیوا مسیح")) return "hiva-masih";
  if (ascii.includes("منوچهر آتشی")) return "manouchehr-atashi";
  if (ascii.includes("حمید مصدق")) return "hamid-mosaddegh";
  if (ascii.includes("حسین پناهی")) return "hossein-panahi";
  if (ascii.includes("مهدی سهیلی")) return "mehdi-soheili";
  if (ascii.includes("رویا زرین")) return "roya-zarrin";
  if (ascii.includes("سپانلو")) return "mohammad-ali-sepanlou";
  if (ascii.includes("شفیعی کدکنی")) return "shafiei-kadkani";
  if (ascii.includes("سیما یاری")) return "sima-yari";
  if (ascii.includes("نصرت رحمانی")) return "nosrat-rahmani";
  if (ascii.includes("پیمان آزاد")) return "peyman-azad";
  if (ascii.includes("ساناز کریمی")) return "sanaz-karimi";
  if (ascii.includes("ناهید عباسی")) return "nahid-abbasi";
  if (ascii.includes("پروانه فتاحی")) return "parvaneh-fattahi";
  if (ascii.includes("اردلان سرفراز")) return "ardalan-sarfaraz";
  if (ascii.includes("احمدرضا احمدی")) return "ahmadreza-ahmadi";
  if (ascii.includes("ایرج جنتی")) return "iraj-jannati-ataei";
  if (ascii.includes("محمد علی بهمنی")) return "mohammad-ali-bahmani";
  if (ascii.includes("صمد نارونی")) return "samad-narooni";
  if (ascii.includes("فرخ تمیمی")) return "farrokh-tamimi";
  if (ascii.includes("محمد بیابانی")) return "mohammad-biabani";
  if (ascii.includes("یغما گلروئی")) return "yaghma-golrouee";
  if (ascii.includes("مریم حیدرزاده")) return "maryam-heydarzadeh";
  if (ascii.includes("قاسم حسن نژاد")) return "ghasem-hassannejad";
  if (ascii.includes("حسین منزوی")) return "hossein-monzavi";
  if (ascii.includes("مسعود فردمنش")) return "masoud-fardmanesh";
  if (ascii.includes("سید علی صالحی")) return "seyed-ali-salehi";
  if (ascii.includes("طاهره صفارزاده")) return "tahereh-saffarzadeh";

  // Book collections
  if (ascii.includes("آسمان سبز")) return "az-asemane-sabz";
  if (ascii.includes("خون و خاکستر")) return "khoon-o-khakestar";
  if (ascii.includes("صدای پای آب")) return "sedaye-paye-ab";
  if (ascii.includes("مسافر")) return "mosafer";
  if (ascii.includes("حجم سبز")) return "hajme-sabz";
  if (ascii.includes("تولدی دیگر")) return "tavalodi-digar";
  if (ascii.includes("ایمان بیاوریم")) return "iman-biavarim";
  if (ascii.includes("زمستان")) return "zemestan";
  if (ascii.includes("آخر شاهنامه")) return "akhare-shahnameh";
  if (ascii.includes("هوای تازه")) return "havaye-tazeh";
  if (ascii.includes("آیدا در آینه")) return "ayda-dar-ayeneh";
  if (ascii.includes("مجموعه اشعار")) return "majmooeye-ashar";
  if (ascii.includes("غزلیات")) return "ghazaliat";
  if (ascii.includes("بوستان")) return "bustan";
  if (ascii.includes("گلستان")) return "golestan";
  if (ascii.includes("مثنوی")) return "masnavi";
  if (ascii.includes("شاهنامه")) return "shahnameh";
  if (ascii.includes("دیوان شمس")) return "divan-e-shams";

  // Fallback: transliterate or replace non-latin with dash
  const clean = ascii
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return clean || "general";
}

function getPoetMeta(poetName: string): PoetMeta {
  const slug = slugify(poetName);
  const found = POET_REGISTRY[slug];
  if (found) return found;

  return {
    slug,
    nameFa: poetName.trim(),
    nameEn: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    era: "contemporary",
    bioFa: `${poetName.trim()}، شاعر معاصر ایرانی.`,
    bioEn: `${slug} is a contemporary Persian poet.`,
    defaultStatus: "copyright_verified",
    displayPolicy: "excerpt",
  };
}

// ---------------------------------------------------------------------------
// Migration Process
// ---------------------------------------------------------------------------
console.log("Starting Canonical Data Migration (Phase 2, WS1)...");

const idMapEntries: Array<{
  legacy_source: string;
  legacy_id: string | number;
  legacy_index: number;
  canonical_id: string;
}> = [];
const quarantineRecords: Array<{
  legacy_source: string;
  legacy_id: string | number;
  legacy_index: number;
  reason_code: string;
  detail: string;
  raw_excerpt: string;
}> = [];
const allPoets = new Map<string, Poet>();
const allCollections = new Map<string, Collection>();
const poetCounters = new Map<string, number>();

function nextPoemId(poetSlug: string, collectionSlug: string): { id: string; num: number } {
  const key = `${poetSlug}.${collectionSlug}`;
  const nextNum = (poetCounters.get(key) || 0) + 1;
  poetCounters.set(key, nextNum);
  return {
    id: `${poetSlug}.${collectionSlug}.${nextNum}`,
    num: nextNum,
  };
}

// 1. Migrate Hafez
console.log("Migrating Hafez (497 ghazals)...");
const hafezRaw = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, "hafez.json"), "utf-8")) as Array<{
  id: number;
  title: string;
  poet: string;
  verses: string[][];
}>;

const hafezPoetMeta = getPoetMeta("حافظ شیرازی");
const hafezPoems: Poem[] = [];

hafezRaw.forEach((item, index) => {
  const { id, num } = nextPoemId("hafez", "ghazaliat");
  // Trim and filter empty/whitespace hemistichs (R4 structure-only fix).
  // Preserves letter content; only removes empty strings that fail z.string().min(1).
  const stanzas = item.verses
    .map((couplet) =>
      (couplet as string[])
        .map((h) => cleanLine(String(h ?? "")))
        .filter((line: string) => line && line.trim().length > 0)
    )
    .filter((couplet) => couplet.length > 0);
  // Track partial beyts where an empty hemistich was filtered (legacy has 3 such fragments).
  const originalCoupletCount = item.verses.length;
  const filteredHemistichs = item.verses.reduce(
    (acc, c) => acc + c.filter((h) => !h || !String(h).trim()).length,
    0
  );
  if (filteredHemistichs > 0) {
    quarantineRecords.push({
      legacy_source: "hafez",
      legacy_id: item.id,
      legacy_index: index,
      reason_code: "empty_hemistich_filtered",
      detail: `filtered ${filteredHemistichs} empty hemistich(s); kept ${stanzas.length}/${originalCoupletCount} couplets`,
      raw_excerpt: JSON.stringify(item.verses[0]).slice(0, 200),
    });
  }
  // If every couplet was empty, quarantine the whole poem and skip canonical emission.
  if (stanzas.length === 0) {
    quarantineRecords.push({
      legacy_source: "hafez",
      legacy_id: item.id,
      legacy_index: index,
      reason_code: "empty_poem_after_filter",
      detail: "all couplets empty after trim/filter",
      raw_excerpt: JSON.stringify(item).slice(0, 500),
    });
    return;
  }
  const text_plain = stanzas.map((c) => c.join(" / ")).join("\n");
  const totalLines = stanzas.flat().length;

  const poem: Poem = {
    id,
    title: `غزل ${toPersianDigits(String(num))}`,
    title_english: `Ghazal ${num}`,
    poet_id: hafezPoetMeta.slug,
    poet_name: hafezPoetMeta.nameFa,
    collection_id: "ghazaliat",
    collection_title: "دیوان حافظ",
    number: num,
    form: "ghazal",
    stanzas,
    text_plain,
    meter: detectMeter(stanzas, "ghazal"),
    radif: detectRadifAndQafiyeh(stanzas).radif,
    qafiyeh: detectRadifAndQafiyeh(stanzas).qafiyeh,
    attribution: {
      status: "verified",
      notes: "استناد به نسخه مصحح قزوینی-غنی",
      sources: ["دیوان حافظ"],
    },
    rights: {
      status: "public_domain",
      license: "Public Domain / CC0",
      provenance: "دیوان حافظ شیرازی (سده هشتم هجری)",
      audit_date: "2026-10-16",
    },
    tags: ["حافظ", "غزل", "عرفان", "عشق"],
    excerpt: pickExcerpt(stanzas, { maxWords: 25 }),
    structure_meta: {
      origin: "separators",
      confidence: 1.0,
      line_count: totalLines,
      stanza_count: stanzas.length,
      has_colophon: false,
    },
    source: {
      legacy_id: String(item.id),
      edition: "قزوینی-غنی",
      book: "دیوان حافظ",
    },
  };

  PoemSchema.parse(poem);
  hafezPoems.push(poem);
  idMapEntries.push({ legacy_source: "hafez", legacy_id: item.id, legacy_index: index, canonical_id: id });
});

// 2. Migrate Shereno (4,400 modern poems)
console.log("Migrating Shereno (4,400 poems)...");
const sherenoRaw = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, "shereno.json"), "utf-8")) as Array<{
  id: number;
  poem: string;
  poet: string;
  title: string;
  book: string;
}>;

const sherenoPoems: Poem[] = [];

sherenoRaw.forEach((item, legacyIndex) => {
  const poetMeta = getPoetMeta(item.poet);
  const collectionSlug = slugify(item.book || "ashar");
  const { id, num } = nextPoemId(poetMeta.slug, collectionSlug);

  const rawPoem = String(item.poem ?? "");
  if (!rawPoem.trim()) {
    quarantineRecords.push({
      legacy_source: "shereno",
      legacy_id: item.id,
      legacy_index: legacyIndex,
      reason_code: "empty_source_text",
      detail: "source poem text empty after trim",
      raw_excerpt: rawPoem.slice(0, 200),
    });
    return;
  }

  const { body, colophon, stanzas: rawStanzas, origin, confidence, text_plain: rawTextPlain } = analyzeStructure(rawPoem);

  // Defensive trim/filter (structure-only, R4): drop empty and signal-only lines (section numbers, ellipsis).
  const isSignalOnlyLine = (l: string): boolean => /^[\d\p{P}\s/□■*\-–—_….]+$/u.test(l);
  const stanzas = rawStanzas
    .map((block) =>
      block
        .map((l) => cleanLine(String(l ?? "")))
        .filter((line: string) => line && line.trim().length > 0)
        .filter((line: string) => !isSignalOnlyLine(line))
    )
    .filter((block) => block.length > 0);
  if (stanzas.length === 0) {
    quarantineRecords.push({
      legacy_source: "shereno",
      legacy_id: item.id,
      legacy_index: legacyIndex,
      reason_code: "empty_after_structure",
      detail: "no non-empty lines after signal split and filter",
      raw_excerpt: rawPoem.slice(0, 500),
    });
    return;
  }
  const text_plain = stanzas.map((st) => st.join("\n")).join("\n\n");

  // Map extracted colophon to canonical ColophonSchema (strip helper `date` field).
  const canonicalColophon = colophon
    ? {
        ...(colophon.place ? { place: colophon.place } : {}),
        ...(colophon.date_raw ? { date_raw: colophon.date_raw } : {}),
        ...(colophon.date_jalali ? { date_jalali: colophon.date_jalali } : {}),
        ...(colophon.date_gregorian ? { date_gregorian: colophon.date_gregorian } : {}),
      }
    : undefined;

  // Form detection
  let form: PoeticForm = "nimaee";
  if (poetMeta.slug === "ahmad-shamlou") form = "sepid";
  else if (item.book?.includes("غزل") || item.title?.includes("غزل")) form = "ghazal";

  // Rights status based on meta
  const poemTitle = cleanLine(String(item.title ?? "")) || `شعر ${toPersianDigits(String(num))}`;
  const collectionTitle = cleanLine(String(item.book ?? "")) || "مجموعه اشعار";
  const poem: Poem = {
    id,
    title: poemTitle,
    poet_id: poetMeta.slug,
    poet_name: poetMeta.nameFa,
    collection_id: collectionSlug,
    collection_title: collectionTitle,
    number: num,
    form,
    stanzas,
    text_plain,
    ...(canonicalColophon && Object.keys(canonicalColophon).length > 0 ? { colophon: canonicalColophon } : {}),
    meter: detectMeter(stanzas, form),
    radif: detectRadifAndQafiyeh(stanzas).radif,
    qafiyeh: detectRadifAndQafiyeh(stanzas).qafiyeh,
    attribution: determineAttribution(poetMeta.slug, item.book),
    rights: {
      status: poetMeta.defaultStatus,
      license: poetMeta.defaultStatus === "public_domain" ? "Public Domain" : "Educational Fair Use",
      provenance: `مجموعه ${item.book || "اشعار"} - ${poetMeta.nameFa}`,
      audit_date: "2026-10-16",
    },
    tags: [poetMeta.nameFa, form, item.book].filter(Boolean) as string[],
    excerpt: pickExcerpt(stanzas, { maxWords: 30 }),
    structure_meta: {
      origin: origin === "heuristic" ? "inferred" : "separators",
      confidence,
      line_count: stanzas.flat().length,
      stanza_count: stanzas.length,
      has_colophon: !!colophon,
    },
    source: {
      legacy_id: String(item.id),
      book: item.book,
    },
  };

  PoemSchema.parse(poem);
  sherenoPoems.push(poem);
  idMapEntries.push({ legacy_source: "shereno", legacy_id: item.id, legacy_index: legacyIndex, canonical_id: id });
});

// 3. Migrate Poetry Quotes (Classical Couplets)
console.log("Migrating Classical Poetry Quotes...");
const poetryRaw = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, "poetry-quotes.json"), "utf-8")) as Array<{
  id: number;
  text_persian: string;
  text_english?: string;
  poet: string;
  poet_english?: string;
  source?: string;
  category?: string;
  tags: string[];
}>;

const classicalPoems: Poem[] = [];

poetryRaw.forEach((item, legacyIndex) => {
  const poetMeta = getPoetMeta(item.poet);
  const collectionSlug = slugify(item.source || "gozideh");
  const { id, num } = nextPoemId(poetMeta.slug, collectionSlug);

  const parts = String(item.text_persian ?? "")
    .split(" / ")
    .map((s) => cleanLine(s))
    .filter((line: string) => line && line.trim().length > 0);
  if (parts.length === 0) {
    quarantineRecords.push({
      legacy_source: "poetry-quotes",
      legacy_id: item.id,
      legacy_index: legacyIndex,
      reason_code: "empty_couplet_after_filter",
      detail: "classical couplet empty after trim/filter",
      raw_excerpt: String(item.text_persian).slice(0, 200),
    });
    return;
  }
  const stanzas: string[][] = [parts];
  const text_plain = parts.join(" / ");

  const poem: Poem = {
    id,
    title: `بیت برگزیده ${toPersianDigits(String(num))}`,
    title_english: `Selected Verse ${num}`,
    poet_id: poetMeta.slug,
    poet_name: poetMeta.nameFa,
    collection_id: collectionSlug,
    collection_title: cleanLine(item.source || "گزیده اشعار"),
    number: num,
    form: "ghazal",
    stanzas,
    text_plain,
    meter: detectMeter(stanzas, "ghazal"),
    attribution: {
      status: "verified",
      notes: "گزیده ادبی کهن",
      sources: item.source ? [item.source] : [],
    },
    rights: {
      status: "public_domain",
      license: "Public Domain / CC0",
      provenance: item.source || "ادبیات کلاسیک فارسی",
      audit_date: "2026-10-16",
    },
    tags: item.tags || [item.category || "حکمت"],
    excerpt: {
      lines: parts,
      start: 0,
      end: parts.length,
      cutStart: false,
      cutEnd: false,
      text: text_plain,
    },
    structure_meta: {
      origin: "separators",
      confidence: 1.0,
      line_count: parts.length,
      stanza_count: 1,
      has_colophon: false,
    },
    source: {
      legacy_id: String(item.id),
      book: item.source,
    },
  };

  PoemSchema.parse(poem);
  classicalPoems.push(poem);
  idMapEntries.push({ legacy_source: "poetry-quotes", legacy_id: item.id, legacy_index: legacyIndex, canonical_id: id });
});

// 4. Migrate Non-Poetry Quotes (Aphorisms)
console.log("Migrating Non-Poetry Aphorisms (494 quotes)...");
const nonPoetryRaw = JSON.parse(fs.readFileSync(path.join(LEGACY_DIR, "non-poetry-quotes.json"), "utf-8")) as Array<{
  id: number;
  body: string;
  author: string;
}>;

const aphorismPoems: Poem[] = [];

nonPoetryRaw.forEach((item, legacyIndex) => {
  const authorRaw = String(item.author ?? "").trim();
  const authorClean = cleanLine(authorRaw || "نامشخص") || "نامشخص";
  const authorSlug = slugify(authorClean) || "general";
  const { id, num } = nextPoemId(authorSlug, "aphorisms");

  const cleanedBody = cleanLine(String(item.body ?? ""));
  if (!cleanedBody) {
    quarantineRecords.push({
      legacy_source: "non-poetry-quotes",
      legacy_id: item.id,
      legacy_index: legacyIndex,
      reason_code: "empty_body_after_clean",
      detail: "aphorism body empty after cleanLine",
      raw_excerpt: String(item.body).slice(0, 200),
    });
    return;
  }
  if (!authorRaw) {
    quarantineRecords.push({
      legacy_source: "non-poetry-quotes",
      legacy_id: item.id,
      legacy_index: legacyIndex,
      reason_code: "missing_author_attributed_to_unknown",
      detail: "empty author; attributed to نامشخص/general",
      raw_excerpt: cleanedBody.slice(0, 200),
    });
  }
  const stanzas: string[][] = [[cleanedBody]];

  const poem: Poem = {
    id,
    title: `سخن ${toPersianDigits(String(num))}`,
    poet_id: authorSlug,
    poet_name: authorClean,
    collection_id: "aphorisms",
    collection_title: "سخنان و اندیشه‌ها",
    number: num,
    form: "other",
    stanzas,
    text_plain: cleanedBody,
    attribution: {
      status: "attributed",
      notes: "سخنان و جملات بزرگان",
      sources: [],
    },
    rights: {
      status: "public_domain",
      license: "Public Domain / Fair Use Quotation",
      provenance: "نقل‌قول‌های مشهور",
      audit_date: "2026-10-16",
    },
    tags: ["سخنان بزرگان", "حکمت", "تفکر"],
    excerpt: {
      lines: [cleanedBody],
      start: 0,
      end: 1,
      cutStart: false,
      cutEnd: false,
      text: cleanedBody,
    },
    structure_meta: {
      origin: "separators",
      confidence: 1.0,
      line_count: 1,
      stanza_count: 1,
      has_colophon: false,
    },
    source: {
      legacy_id: String(item.id),
    },
  };

  PoemSchema.parse(poem);
  aphorismPoems.push(poem);
  idMapEntries.push({ legacy_source: "non-poetry-quotes", legacy_id: item.id, legacy_index: legacyIndex, canonical_id: id });
});

// 5. Build Registry of Poets & Collections
console.log("Building Poet & Collection Registries...");

const allLoadedPoems = [...hafezPoems, ...sherenoPoems, ...classicalPoems, ...aphorismPoems];

for (const p of allLoadedPoems) {
  // Poets
  if (!allPoets.has(p.poet_id)) {
    const meta = POET_REGISTRY[p.poet_id] || getPoetMeta(p.poet_name);
    const poetObj: Poet = {
      slug: p.poet_id,
      name_persian: p.poet_name,
      name_english: meta.nameEn,
      aliases: [],
      era: meta.era,
      birth: meta.birth ? { year_gregorian: meta.birth } : undefined,
      death: meta.death ? { year_gregorian: meta.death } : undefined,
      bio_persian: meta.bioFa,
      bio_english: meta.bioEn,
      collections: [p.collection_id],
      rights_summary: {
        default_status: meta.defaultStatus,
        notes: meta.displayPolicy,
      },
      stats: {
        works_count: 1,
        stanza_count: p.stanzas.length,
      },
    };
    allPoets.set(p.poet_id, poetObj);
  } else {
    const poetObj = allPoets.get(p.poet_id)!;
    if (!poetObj.collections.includes(p.collection_id)) {
      poetObj.collections.push(p.collection_id);
    }
    if (poetObj.stats) {
      poetObj.stats.works_count++;
      poetObj.stats.stanza_count = (poetObj.stats.stanza_count || 0) + p.stanzas.length;
    }
  }

  // Collections
  const colKey = `${p.poet_id}.${p.collection_id}`;
  if (!allCollections.has(colKey)) {
    const colObj: Collection = {
      slug: p.collection_id,
      poet_slug: p.poet_id,
      title_persian: p.collection_title,
      title_english: p.collection_id
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      form: p.form,
      work_count: 1,
    };
    allCollections.set(colKey, colObj);
  } else {
    const colObj = allCollections.get(colKey)!;
    colObj.work_count = (colObj.work_count || 0) + 1;
  }
}

// Validate all poets and collections
for (const poet of allPoets.values()) {
  PoetSchema.parse(poet);
}
for (const col of allCollections.values()) {
  CollectionSchema.parse(col);
}

// 6. Write JSONL files (synchronous to avoid truncation on process exit)
function writeJsonl(filePath: string, records: unknown[]) {
  const payload = records.map((r) => JSON.stringify(r)).join("\n") + (records.length > 0 ? "\n" : "");
  fs.writeFileSync(filePath, payload, "utf-8");
}

console.log("Writing canonical JSONL files...");
writeJsonl(path.join(CANONICAL_DIR, "hafez.jsonl"), hafezPoems);
writeJsonl(path.join(CANONICAL_DIR, "shereno.jsonl"), sherenoPoems);
writeJsonl(path.join(CANONICAL_DIR, "poetry.jsonl"), classicalPoems);
writeJsonl(path.join(CANONICAL_DIR, "non-poetry.jsonl"), aphorismPoems);
writeJsonl(
  path.join(CANONICAL_DIR, "works.jsonl"),
  [...hafezPoems, ...sherenoPoems, ...classicalPoems, ...aphorismPoems]
);
writeJsonl(path.join(CANONICAL_DIR, "poets.jsonl"), Array.from(allPoets.values()));
writeJsonl(path.join(CANONICAL_DIR, "collections.jsonl"), Array.from(allCollections.values()));
writeJsonl(path.join(ROOT_DIR, "data", "id-map.jsonl"), idMapEntries);
writeJsonl(path.join(CANONICAL_DIR, "id-map.jsonl"), idMapEntries);

// 7. Write Rights Audit CSV
console.log("Generating Rights Audit CSV at docs/audit/rights-audit.csv...");
const csvHeader = "poet_slug,poet_name,era,birth,death,rights_status,display_policy,rationale,license\n";
const csvRows = Array.from(allPoets.values()).map((p) => {
  const meta = POET_REGISTRY[p.slug] || getPoetMeta(p.name_persian);
  const birth = p.birth?.year_gregorian || "";
  const death = p.death?.year_gregorian || "";
  const rationale =
    meta.defaultStatus === "public_domain"
      ? "تألیف بیش از ۵۰ یا ۷۰ سال پیش / مالکیت عمومی"
      : "استفاده آموزشی و پژوهشی غیرانتفاعی طبق موازین دسترسی منصفانه";
  const license = meta.defaultStatus === "public_domain" ? "Public Domain / CC0" : "Educational Fair Use";
  return `"${p.slug}","${p.name_persian}","${p.era}","${birth}","${death}","${meta.defaultStatus}","${meta.displayPolicy}","${rationale}","${license}"`;
});
fs.writeFileSync(path.join(AUDIT_DIR, "rights-audit.csv"), csvHeader + csvRows.join("\n") + "\n", "utf-8");

// 8. Write Quarantine Manifest + per-record files (R5: machine-readable reason codes)
const reasonCounts = new Map<string, number>();
for (const q of quarantineRecords) {
  reasonCounts.set(q.reason_code, (reasonCounts.get(q.reason_code) ?? 0) + 1);
}
fs.writeFileSync(
  path.join(QUARANTINE_DIR, "manifest.json"),
  JSON.stringify(
    {
      audit_date: "2026-10-16",
      quarantined_records_count: quarantineRecords.length,
      reasons: Array.from(reasonCounts.entries()).map(([code, count]) => ({ code, count })),
      records: quarantineRecords,
    },
    null,
    2
  ) + "\n",
  "utf-8"
);
if (quarantineRecords.length > 0) {
  writeJsonl(path.join(QUARANTINE_DIR, "quarantine.jsonl"), quarantineRecords);
}

console.log("Migration summary:");
console.log(`- Hafez: ${hafezPoems.length} works`);
console.log(`- Shereno: ${sherenoPoems.length} works`);
console.log(`- Classical quotes: ${classicalPoems.length} works`);
console.log(`- Aphorisms: ${aphorismPoems.length} works`);
console.log(`- Total canonical works: ${allLoadedPoems.length}`);
console.log(`- Total poets: ${allPoets.size}`);
console.log(`- Total collections: ${allCollections.size}`);
console.log(`- ID mappings: ${idMapEntries.length}`);
console.log(`- Quarantined events: ${quarantineRecords.length}`);
console.log("Canonical Data Migration Complete!");
