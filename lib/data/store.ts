import poetryRaw from "@/lib/data/poetry-quotes.json";
import hafezRaw from "@/lib/data/hafez.json";
import nonPoetryRaw from "@/lib/data/non-poetry-quotes.json";
import sherenoRaw from "@/lib/data/shereno.json";

// ============================================================================
// مخزن یکپارچه داده‌ها (Data Store)
// هر مجموعه‌داده را یک بار بارگذاری، نرمال‌سازی و نمایه می‌کند تا تمام اندپوینت‌ها
// از یک منبع واحد و حافظه‌محور استفاده کنند. هنگام بارگذاری، داده‌ها به‌طور خودکار
// پاک‌سازی (حذف تکراری، حذف ورودی‌های خالی، نرمال‌سازی متن) می‌شوند.
// ============================================================================

export type QuoteKind = "poetry" | "non-poetry" | "hafez" | "shereno";

export interface NormalizedQuote {
  id: string;
  kind: QuoteKind;
  text_persian: string;
  text_english?: string;
  author?: string;
  author_english?: string;
  poet?: string;
  poet_english?: string;
  source?: string;
  book?: string;
  title?: string;
  category?: string;
  tags: string[];
  search: string;
}

export interface ListResult<T> {
  data: T[];
  count: number;
  total: number;
  page: number;
  limit: number;
}

export interface QueryOptions {
  limit: number;
  page: number;
  random: boolean;
}

export interface Stats {
  poetry: number;
  hafez: number;
  nonPoetry: number;
  nonPoetryRaw: number;
  nonPoetryDropped: number;
  shereno: number;
  total: number;
}

// نقشه نام انگلیسی شاعران شعر نو (برای جستجو و نمایش یکپارچه)
const SHERENO_POET_EN: Record<string, string> = {
  "نیما یوشیج": "Nima Yushij",
  "سهراب سپهری": "Sohrab Sepehri",
  "احمد شاملو": "Ahmad Shamlou",
  "فروغ فرخزاد": "Forugh Farrokhzad",
  "مهدی اخوان ثالث": "Mehdi Akhavan-Sales",
  "سیاوش کسرایی": "Siavash Kasraei",
  "نادر نادرپور": "Nader Naderpour",
  "هوشنگ ایرانی": "Houshang Irani",
  "یدالله رویایی": "Yadollah Royaee",
  "طاهره صفارزاده": "Tahereh Saffarzadeh",
};

// بیوگرافی شاعران شناخته‌شده (برای اندپوینت شاعران)
const POET_BIOS: Record<
  string,
  { english: string; bioFa: string; bioEn: string; birth?: number; death?: number }
> = {
  "مولانا": {
    english: "Rumi",
    bioFa: "مولانا جلال‌الدین محمد بلخی معروف به رومی، شاعر و عارف بزرگ قرن هفتم هجری",
    bioEn: "Jalal ad-Din Muhammad Rumi, a 13th-century Persian poet, Islamic scholar, theologian, and Sufi mystic",
    birth: 1207,
    death: 1273,
  },
  "حافظ": {
    english: "Hafez",
    bioFa: "خواجه شمس‌الدین محمد حافظ شیرازی، شاعر بزرگ غزل‌سرای ایرانی قرن هشتم هجری",
    bioEn: "Khwāje Shams-od-Dīn Moḥammad Hāfeẓ-e Shīrāzī, known by his pen name Hafez, was a Persian lyric poet",
    birth: 1315,
    death: 1390,
  },
  "سعدی": {
    english: "Saadi",
    bioFa: "ابومحمد مصلح‌الدین بن عبدالله شیرازی معروف به سعدی، شاعر و نویسنده بزرگ ایرانی",
    bioEn: "Abū-Muḥammad Muṣliḥ al-Dīn bin Abdallāh Shīrāzī, better known by his pen name Saadi, was a Persian poet and prose writer",
    birth: 1210,
    death: 1291,
  },
  "فردوسی": {
    english: "Ferdowsi",
    bioFa: "حکیم ابوالقاسم فردوسی توسی، بزرگ‌ترین حماسه‌سرای ایران و سرایندهٔ شاهنامه",
    bioEn: "Ferdowsi was a Persian poet and the author of Shahnameh, one of the world's longest epic poems",
    birth: 940,
    death: 1020,
  },
  "نیما یوشیج": {
    english: "Nima Yushij",
    bioFa: "علی اسفندیاری معروف به نیما یوشیج، شاعر معاصر ایرانی و بنیان‌گذار شعر نو فارسی",
    bioEn: "Nima Yushij, born Ali Esfandiari, was a contemporary Persian poet who started the 'New Poetry' movement",
    birth: 1897,
    death: 1960,
  },
  "سهراب سپهری": {
    english: "Sohrab Sepehri",
    bioFa: "سهراب سپهری، شاعر، نویسنده و نقاش معاصر ایرانی و یکی از مهم‌ترین شاعران نوپرداز",
    bioEn: "Sohrab Sepehri was a notable Iranian poet and painter, known for his clean, nature-inspired modern verse",
    birth: 1928,
    death: 1980,
  },
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// کلید نرمال‌شده برای تشخیص تکراری (بدون فاصله‌های اضافه و نویسه نامرئی)
// نرمال‌سازی مشترک فارسی و لاتین برای جستجو و تشخیص نام شاعر.
// این تابع شکل‌های ی/ي، ک/ك، نیم‌فاصله، اعراب و نشانه‌گذاری را یکسان می‌کند.
export function normalizeText(value: string): string {
  return value
    .normalize("NFC")
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ة/g, "ه")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[ـ]/g, "")
    .replace(/[\u200c\u200d\u200e\u200f]/g, "")
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();
}

function normKey(s: string): string {
  return normalizeText(s);
}

function buildSearch(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).map((part) => normalizeText(String(part))).join(" ");
}

// نام‌های رایج، املای لاتین و غلط‌های متداول به یک نام canonical نگاشت می‌شوند.
// نام‌هایی که در این فهرست نیستند با شکل نرمال‌شدهٔ خودشان کار می‌کنند.
const POET_ALIAS_ENTRIES: Array<[string, string]> = [
  ["مولانا", "مولانا"],
  ["مولوی", "مولانا"],
  ["رومی", "مولانا"],
  ["جلال الدین رومی", "مولانا"],
  ["مولانا جلال الدین رومی", "مولانا"],
  ["rumi", "مولانا"],
  ["mawlana", "مولانا"],
  ["mevlana", "مولانا"],
  ["حافظ", "حافظ"],
  ["حافظ شیرازی", "حافظ"],
  ["هافظ", "حافظ"],
  ["hafez", "حافظ"],
  ["hafiz", "حافظ"],
  ["سعدی", "سعدی"],
  ["سعدی شیرازی", "سعدی"],
  ["saadi", "سعدی"],
  ["فردوسی", "فردوسی"],
  ["حکیم ابوالقاسم فردوسی", "فردوسی"],
  ["ferdowsi", "فردوسی"],
  ["firdawsi", "فردوسی"],
  ["نیما", "نیما یوشیج"],
  ["نیما یوشیج", "نیما یوشیج"],
  ["nima", "نیما یوشیج"],
  ["nima yushij", "نیما یوشیج"],
  ["علی اسفندیاری", "نیما یوشیج"],
  ["سهراب", "سهراب سپهری"],
  ["سهراب سپهری", "سهراب سپهری"],
  ["sohrab", "سهراب سپهری"],
  ["sohrab sepehri", "سهراب سپهری"],
];
const POET_ALIAS_MAP = new Map(
  POET_ALIAS_ENTRIES.map(([alias, canonical]) => [normalizeText(alias), normalizeText(canonical)]),
);

function canonicalPoetName(name: string): string {
  const normalized = normalizeText(name);
  return POET_ALIAS_MAP.get(normalized) ?? normalized;
}

function decodeNeedle(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// --- نرمال‌سازی اشعار کلاسیک ---
const poetry: NormalizedQuote[] = (poetryRaw as any[]).map((q, i) => {
  const text_persian = String(q.text_persian ?? "");
  const tags: string[] = Array.isArray(q.tags) ? q.tags : [];
  return {
    id: `p-${q.id ?? i + 1}`,
    kind: "poetry",
    text_persian,
    text_english: q.text_english,
    poet: q.poet,
    poet_english: q.poet_english,
    source: q.source,
    category: q.category,
    tags,
    search: buildSearch(text_persian, q.text_english, q.poet, q.poet_english, q.category, ...tags),
  };
});

// --- نرمال‌سازی غزل‌های حافظ ---
const hafez: NormalizedQuote[] = (hafezRaw as any[]).map((g) => {
  const verses: string[][] = Array.isArray(g.verses) ? g.verses : [];
  const text_persian = verses
    .map((v) => (Array.isArray(v) ? v.join(" / ") : String(v)))
    .join("\n");
  return {
    id: `h-${g.id}`,
    kind: "hafez",
    text_persian,
    poet: "حافظ",
    poet_english: "Hafez",
    source: "دیوان حافظ",
    category: "غزل",
    tags: ["حافظ", "غزل"],
    // شامل املای رایج اشتباه «هافظ» برای جستجوی بهتر
    search: buildSearch(text_persian, "حافظ", "هافظ", "غزل", "دیوان حافظ"),
  };
});

// --- نرمال‌سازی جملات غیرشعری (با حذف تکراری و ورودی‌های ناقص) ---
const seenBodies = new Set<string>();
let nonPoetryDropped = 0;
const nonPoetryRawCount = (nonPoetryRaw as any[]).length;
const nonPoetry: NormalizedQuote[] = [];

for (const q of nonPoetryRaw as any[]) {
  const body = typeof q.body === "string" ? q.body : "";
  const author = typeof q.author === "string" ? q.author.trim() : "";
  // حذف ورودی‌های خالی یا بدون منتسب
  if (!body.trim() || !author) {
    nonPoetryDropped++;
    continue;
  }
  const key = normKey(body);
  // حذف نقل‌قول تکراری
  if (seenBodies.has(key)) {
    nonPoetryDropped++;
    continue;
  }
  seenBodies.add(key);
  const tags: string[] = Array.isArray(q.tags) ? q.tags : [];
  nonPoetry.push({
    id: `np-${q.id}`,
    kind: "non-poetry",
    text_persian: body.trim(),
    author,
    author_english: q.author_english,
    source: q.source,
    category: q.category,
    tags,
    search: buildSearch(body, author, q.author_english, q.source, q.category, ...tags),
  });
}

// --- نرمال‌سازی شعر نو (شعرنو) ---
const shereno: NormalizedQuote[] = [];

for (const q of sherenoRaw as any[]) {
  const poem = typeof q.poem === "string" ? q.poem.trim() : "";
  const poet = typeof q.poet === "string" ? q.poet.trim() : "";
  if (!poem) continue;
  const tags = ["شعر نو", poet].filter(Boolean) as string[];
  shereno.push({
    id: `sn-${q.id}`,
    kind: "shereno",
    text_persian: poem,
    poet,
    poet_english: SHERENO_POET_EN[poet],
    title: q.title,
    book: q.book,
    source: q.book,
    tags,
    search: buildSearch(poem, poet, q.title, q.book),
  });
}

function buildPoetIndex(items: NormalizedQuote[]): Map<string, NormalizedQuote[]> {
  const index = new Map<string, NormalizedQuote[]>();
  for (const quote of items) {
    if (!quote.poet) continue;
    const key = canonicalPoetName(quote.poet);
    const list = index.get(key);
    if (list) list.push(quote);
    else index.set(key, [quote]);
  }
  return index;
}

const poetryByPoetIndex = buildPoetIndex(poetry);
const sherenoByPoetIndex = buildPoetIndex(shereno);

function levenshtein(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const saved = previous[j];
      previous[j] = a[i - 1] === b[j - 1]
        ? diagonal
        : Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + 1);
      diagonal = saved;
    }
  }
  return previous[b.length];
}

function poetScore(needle: string, candidate: string): number {
  const query = normalizeText(needle);
  const value = normalizeText(candidate);
  if (!query || !value) return 0;
  if (query === value) return 1;
  if (canonicalPoetName(query) === canonicalPoetName(value)) return 0.99;
  if (value.includes(query) || query.includes(value)) return 0.9;
  if (query.length < 3 || value.length < 3) return 0;
  return 1 - levenshtein(query, value) / Math.max(query.length, value.length);
}

function matchPoet(q: NormalizedQuote, needle: string): boolean {
  const query = normalizeText(needle);
  const candidates = [q.poet, q.poet_english].filter((value): value is string => Boolean(value));
  const score = Math.max(...candidates.map((candidate) => poetScore(query, candidate)));
  return score >= (query.length < 4 ? 0.9 : 0.72);
}

// تطابق دقیق و alias از نمایه خوانده می‌شود؛ فقط برای املای ناشناخته، fuzzy scan انجام می‌گیرد.
function quotesForPoet(index: Map<string, NormalizedQuote[]>, needle: string): NormalizedQuote[] {
  const query = normalizeText(decodeNeedle(needle));
  if (!query) return [];
  const canonical = canonicalPoetName(query);
  const exact = index.get(canonical);
  if (exact) return exact;

  const out: NormalizedQuote[] = [];
  for (const [key, list] of index) {
    if (key.includes(query) || query.includes(key)) {
      out.push(...list);
      continue;
    }
    const representative = list[0];
    if (representative && matchPoet(representative, query)) out.push(...list);
  }
  return out;
}

function sherenoForPoet(needle: string): NormalizedQuote[] {
  return quotesForPoet(sherenoByPoetIndex, needle);
}

const all: NormalizedQuote[] = [...poetry, ...nonPoetry, ...hafez, ...shereno];

// نمونه‌گیری تصادفی درست (Fisher–Yates) به جای مرتب‌سازی ناقص Math.random()-0.5
export function randomSample<T>(arr: T[], limit: number): T[] {
  const pool = arr.slice();
  const n = Math.min(limit, pool.length);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

export function paginate<T>(arr: T[], page: number, limit: number): ListResult<T> {
  const start = (page - 1) * limit;
  const slice = arr.slice(start, start + limit);
  return { data: slice, count: slice.length, total: arr.length, page, limit };
}

function parseOptions(sp: URLSearchParams): QueryOptions {
  const limit = clamp(Number.parseInt(sp.get("limit") || "10", 10) || 10, 1, 100);
  const page = Math.max(1, Number.parseInt(sp.get("page") || "1", 10) || 1);
  const random = sp.get("random") === "true";
  return { limit, page, random };
}

function resolve<T>(arr: T[], opts: QueryOptions): ListResult<T> {
  if (opts.random) {
    const data = randomSample(arr, opts.limit);
    return { data, count: data.length, total: arr.length, page: opts.page, limit: opts.limit };
  }
  return paginate(arr, opts.page, opts.limit);
}

export const dataset = {
  poetry,
  hafez,
  nonPoetry,
  shereno,
  all,
  nonPoetryRawCount,
  nonPoetryDropped,
};

// --- اندپوینت‌ها ---

export function getQuotes(sp: URLSearchParams): ListResult<NormalizedQuote> {
  const poet = sp.get("poet");
  if (poet !== null) {
    const filtered = quotesForPoet(poetryByPoetIndex, poet);
    return resolve(filtered, parseOptions(sp));
  }
  return resolve(poetry, parseOptions(sp));
}

export function getQuotesByPoet(poet: string, sp: URLSearchParams): ListResult<NormalizedQuote> {
  const filtered = quotesForPoet(poetryByPoetIndex, poet);
  return resolve(filtered, parseOptions(sp));
}

export function getHafez(sp: URLSearchParams): ListResult<NormalizedQuote> {
  let data = hafez.slice();
  const idParam = sp.get("id");
  const query = sp.get("q") || sp.get("query");
  if (idParam) {
    const id = Number.parseInt(idParam, 10);
    if (!Number.isNaN(id)) data = data.filter((g) => g.id === `h-${id}`);
  }
  if (query) {
    const q = normalizeText(query);
    data = data.filter((g) => g.search.includes(q));
  }
  const opts = parseOptions(sp);
  if (opts.random) {
    const rnd = randomSample(data, opts.limit);
    return { data: rnd, count: rnd.length, total: data.length, page: opts.page, limit: opts.limit };
  }
  return paginate(data, opts.page, opts.limit);
}

export function getNonPoetry(sp: URLSearchParams): ListResult<NormalizedQuote> {
  const author = sp.get("author");
  const data = author !== null
    ? nonPoetry.filter((quote) => {
        const needle = normalizeText(decodeNeedle(author));
        return Boolean(quote.author && poetScore(needle, quote.author) >= (needle.length < 4 ? 0.9 : 0.72)) ||
          Boolean(quote.author_english && poetScore(needle, quote.author_english) >= 0.72);
      })
    : nonPoetry;
  return resolve(data, parseOptions(sp));
}

export function getShereno(sp: URLSearchParams): ListResult<NormalizedQuote> {
  const poet = sp.get("poet");
  const title = sp.get("title");
  let data: NormalizedQuote[];
  if (poet !== null) {
    // بازیابی سریع از نمایه به جای پیمایش کل مجموعه (شعر نو بزرگ)
    data = sherenoForPoet(poet);
  } else {
    data = shereno;
  }
  if (title) {
    const t = normalizeText(title);
    data = data.filter((q) => q.title && normalizeText(q.title).includes(t));
  }
  return resolve(data, parseOptions(sp));
}

export function getByCategory(category: string, sp: URLSearchParams): ListResult<NormalizedQuote> {
  const cat = decodeNeedle(category);
  let items = poetry.filter((q) => q.category === cat);

  // برای دسته‌های عرفان و عشق، غزل‌های حافظ را برای غنای بیشتر اضافه می‌کنیم
  if (cat === "عرفان" || cat === "عشق") {
    const hafezQuotes = hafez.slice(0, 50).map((g) => ({
      ...g,
      category: cat,
      tags: [cat, "شعر"],
    }));
    items = [...items, ...hafezQuotes];
  }

  const opts = parseOptions(sp);
  if (opts.random) {
    const rnd = randomSample(items, opts.limit);
    return { data: rnd, count: rnd.length, total: items.length, page: opts.page, limit: opts.limit };
  }
  return paginate(items, opts.page, opts.limit);
}

export function searchQuotes(sp: URLSearchParams): ListResult<NormalizedQuote> {
  const q = normalizeText((sp.get("q") || sp.get("query") || "").trim());
  const opts = parseOptions(sp);
  if (!q) {
    // بدون پرس‌وجو: تمام مجموعه‌ها (تصادفی در صورت درخواست)
    return resolve(all, opts);
  }
  const filtered = all.filter((item) => item.search.includes(q));
  return resolve(filtered, opts);
}

export function getPoets(): { data: any[]; count: number } {
  const counts = new Map<string, number>();
  for (const q of [...poetry, ...hafez, ...shereno]) {
    const key = q.poet ? canonicalPoetName(q.poet) : "نامشخص";
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const data = [...counts.entries()].map(([name, quote_count], i) => {
    const displayName = [...poetry, ...hafez, ...shereno].find((quote) => quote.poet && canonicalPoetName(quote.poet) === name)?.poet ?? name;
    const bio = POET_BIOS[name] ?? POET_BIOS[displayName] ?? Object.values(POET_BIOS).find((candidate) => normalizeText(candidate.english) === name);
    return {
      id: i + 1,
      name_persian: displayName,
      name_english: bio?.english ?? null,
      birth_year: bio?.birth ?? null,
      death_year: bio?.death ?? null,
      biography_persian: bio?.bioFa ?? null,
      biography_english: bio?.bioEn ?? null,
      image_url: null,
      quote_count,
    };
  });
  return { data, count: data.length };
}

export function getCategories(): { data: any[]; count: number } {
  const counts = new Map<string, number>();
  for (const q of poetry) {
    if (q.category) counts.set(q.category, (counts.get(q.category) || 0) + 1);
  }
  const data = [...counts.entries()].map(([name, quote_count], i) => ({
    id: i + 1,
    name_persian: name,
    name_english: null,
    description_persian: `اشعار در مورد ${name}`,
    description_english: `Poems about ${name}`,
    quote_count,
  }));
  return { data, count: data.length };
}

export function getStats(): Stats {
  return {
    poetry: poetry.length,
    hafez: hafez.length,
    nonPoetry: nonPoetry.length,
    nonPoetryRaw: nonPoetryRawCount,
    nonPoetryDropped: nonPoetryDropped,
    shereno: shereno.length,
    total: all.length,
  };
}
