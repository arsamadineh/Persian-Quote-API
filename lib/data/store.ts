import poetryRaw from "@/lib/data/poetry-quotes.json";
import hafezRaw from "@/lib/data/hafez.json";
import nonPoetryRaw from "@/lib/data/non-poetry-quotes.json";
import sherenoRaw from "@/lib/data/shereno.json";
import {
  analyzePoem,
  layoutAnalyzedPoem,
  type LineMode,
  type PoemLayout,
  type PoemSource,
} from "@/lib/data/poem-lines";

// ============================================================================
// مخزن یکپارچه داده‌ها (Data Store)
// هر مجموعه‌داده را یک بار بارگذاری، نرمال‌سازی و نمایه می‌کند تا تمام اندپوینت‌ها
// از یک منبع واحد و حافظه‌محور استفاده کنند. هنگام بارگذاری، داده‌ها به‌طور خودکار
// پاک‌سازی (حذف تکراری، حذف ورودی‌های خالی، نرمال‌سازی متن) می‌شوند.
//
// ساختار نمایش متن شعر نو از دو لایه تشکیل می‌شود:
//   - لایهٔ داده: متنی که فقط شکست خط‌های واقعی منبع را دارد.
//   - لایهٔ نمایش: متنی که برای خوانایی، شکست خط بازسازی‌شده هم می‌گیرد.
// خروجی هر اندپوینت از presentQuotes می‌گذرد و منبع شکست خط را اعلام می‌کند.
// ============================================================================

export type QuoteKind = "poetry" | "non-poetry" | "hafez" | "shereno";

export interface NormalizedQuote {
  id: string;
  kind: QuoteKind;
  /**
   * متن فارسی. برای شعر کلاسیک، غیرشعری و حافظ، همان متن نهایی است.
   * برای شعر نو متن خام منبع است؛ سطر‌بندی آن در لایهٔ نمایش (presentQuote) انجام می‌شود.
   */
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
    bioEn: "Sohrab Sepehri was a notable Iranian painter and poet, known for his clean, nature-inspired modern verse",
    birth: 1928,
    death: 1980,
  },
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// ---------------------------------------------------------------------------
// نرمال‌سازی متن
// ---------------------------------------------------------------------------

// نگاشت نویسه‌های پرکاربرد به شکل یکسان‌شده. هر نویسهٔ دیگری که در این دسته
// بیفتد اما نگاشت نداشته باشد، حذف می‌شود (اعراب، کشیده و نویسه‌های نامرئی).
const SPECIAL_CHAR_RE =
  /[يىكةۀـ\u064B-\u065F\u0670\u200B-\u200F\u202A-\u202E\u0660-\u0669\u06F0-\u06F9]/g;
const SPECIAL_CHAR_MAP: Record<string, string> = {
  "ي": "ی",
  "ى": "ی",
  "ك": "ک",
  "ة": "ه",
  "ۀ": "ه",
  "ـ": "",
  "\u200b": "",
  "\u200c": "",
  "\u200d": "",
  "\u200e": "",
  "\u200f": "",
  "\u202a": "",
  "\u202b": "",
  "\u202c": "",
  "\u202d": "",
  "\u202e": "",
};
const NON_TOKEN_RE = /[^\p{L}\p{N}]+/gu;

function mapSpecialChar(char: string): string {
  const mapped = SPECIAL_CHAR_MAP[char];
  if (mapped !== undefined) return mapped;
  const code = char.charCodeAt(0);
  if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
  if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0);
  return "";
}

/**
 * نرمال‌سازی مشترک فارسی و لاتین برای جستجو و تشخیص نام شاعر.
 * این تابع شکل‌های ی/ي، ک/ك، نیم‌فاصله، اعراب و نشانه‌گذاری را یکسان می‌کند.
 * پیاده‌سازی در یک گذر نویسه‌محور انجام می‌شود تا واکشی متن‌های بلند ارزان باشد.
 */
export function normalizeText(value: string): string {
  return value
    .normalize("NFC")
    .replace(SPECIAL_CHAR_RE, mapSpecialChar)
    .replace(NON_TOKEN_RE, " ")
    .trim()
    .toLowerCase();
}

function normKey(s: string): string {
  return normalizeText(s);
}

/**
 * ساخت رشتهٔ جستجو و ثبت مرز بخش متن.
 * `headLength` محل پایان بخش متن در رشتهٔ نرمال‌شده است؛ با آن، امتیازدهی
 * می‌تواند بی‌آنکه متن دوباره نرمال شود، تشخیص دهد واژه در متن شعر آمده یا در فراداده.
 */
function composeSearch(
  textParts: (string | undefined)[],
  metaParts: (string | undefined)[],
): { search: string; headLength: number } {
  const chunks: string[] = [];
  for (const part of textParts) {
    if (part) chunks.push(normalizeText(String(part)));
  }
  const headLength = chunks.join(" ").length;
  for (const part of metaParts) {
    if (part) chunks.push(normalizeText(String(part)));
  }
  return { search: chunks.join(" "), headLength };
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

// ---------------------------------------------------------------------------
// ساخت آیتم‌های نرمال‌شده
// ---------------------------------------------------------------------------

// فیلدهای کمکی جستجو روی خود آیتم و به‌صورت غیرقابل‌شمارش نگه داشته می‌شوند؛
// بنابراین در پاسخ JSON ظاهر نمی‌شوند اما دسترسی به آن‌ها ارزان است.
const SCORE_FIELDS = Symbol("scoreFields");

interface ScoreFields {
  headLength: number;
  authorTarget: string;
  titleTarget: string;
}

type ScoredQuote = NormalizedQuote & { [SCORE_FIELDS]?: ScoreFields };

function attachScoreFields(
  quote: NormalizedQuote,
  textParts: (string | undefined)[],
  metaParts: (string | undefined)[],
  authorParts: (string | undefined)[],
  titleParts: (string | undefined)[],
): void {
  const { search, headLength } = composeSearch(textParts, metaParts);
  quote.search = search;
  Object.defineProperty(quote, SCORE_FIELDS, {
    value: {
      headLength,
      authorTarget: normalizeText(authorParts.filter(Boolean).map(String).join(" ")),
      titleTarget: normalizeText(titleParts.filter(Boolean).map(String).join(" ")),
    } satisfies ScoreFields,
    enumerable: false,
    configurable: true,
  });
}

function scoreFieldsOf(quote: NormalizedQuote): ScoreFields {
  const existing = (quote as ScoredQuote)[SCORE_FIELDS];
  if (existing) return existing;
  // مسیر جانشین برای آیتم‌هایی که با کپی‌برداری ساخته شده‌اند.
  const fields: ScoreFields = {
    headLength: quote.search.length,
    authorTarget: normalizeText(
      [quote.author, quote.author_english, quote.poet, quote.poet_english].filter(Boolean).join(" "),
    ),
    titleTarget: normalizeText([quote.title, quote.category, ...quote.tags].filter(Boolean).join(" ")),
  };
  Object.defineProperty(quote, SCORE_FIELDS, { value: fields, enumerable: false, configurable: true });
  return fields;
}

// --- نرمال‌سازی اشعار کلاسیک ---
const poetry: NormalizedQuote[] = (poetryRaw as any[]).map((q, i) => {
  const text_persian = String(q.text_persian ?? "");
  const tags: string[] = Array.isArray(q.tags) ? q.tags : [];
  const quote: NormalizedQuote = {
    id: `p-${q.id ?? i + 1}`,
    kind: "poetry",
    text_persian,
    text_english: q.text_english,
    poet: q.poet,
    poet_english: q.poet_english,
    source: q.source,
    category: q.category,
    tags,
    search: "",
  };
  attachScoreFields(
    quote,
    [text_persian, q.text_english],
    [q.poet, q.poet_english, q.category, ...tags],
    [q.poet, q.poet_english],
    [q.category, ...tags],
  );
  return quote;
});

// --- نرمال‌سازی غزل‌های حافظ ---
const hafez: NormalizedQuote[] = (hafezRaw as any[]).map((g) => {
  const verses: string[][] = Array.isArray(g.verses) ? g.verses : [];
  const text_persian = verses
    .map((v) => (Array.isArray(v) ? v.join(" / ") : String(v)))
    .join("\n");
  const quote: NormalizedQuote = {
    id: `h-${g.id}`,
    kind: "hafez",
    text_persian,
    poet: "حافظ",
    poet_english: "Hafez",
    source: "دیوان حافظ",
    category: "غزل",
    tags: ["حافظ", "غزل"],
    search: "",
  };
  // شامل املای رایج اشتباه «هافظ» برای جستجوی بهتر
  attachScoreFields(
    quote,
    [text_persian],
    ["حافظ", "هافظ", "غزل", "دیوان حافظ"],
    ["حافظ", "Hafez"],
    [quote.category, ...quote.tags],
  );
  return quote;
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
  const textEnglish =
    typeof q.body_english === "string" && q.body_english.trim()
      ? q.body_english.trim()
      : typeof q.text_english === "string"
        ? q.text_english.trim()
        : undefined;

  const quote: NormalizedQuote = {
    id: `np-${q.id}`,
    kind: "non-poetry",
    text_persian: body.trim(),
    text_english: textEnglish,
    author,
    author_english: q.author_english,
    source: q.source,
    category: q.category,
    tags,
    search: "",
  };
  attachScoreFields(
    quote,
    [body],
    [author, q.author_english, q.source, q.category, ...tags],
    [author, q.author_english],
    [q.category, ...tags],
  );
  nonPoetry.push(quote);
}

// --- نرمال‌سازی شعر نو ---
//
// متن شعر نو در زمان بارگذاری فقط کپی می‌شود؛ تحلیل نوشتاری و ساخت سطرها
// در زمان نمایش و به‌صورت تنبل (lazy) انجام می‌گیرد تا راه‌اندازی سرویس سریع بماند.
// هر شعر سه شکل دارد:
//   raw        : متن دست‌نخوردهٔ منبع
//   separators : متن با شکست خط‌های واقعی (ستاره و فاصلهٔ دوگانه)
//   reconstructed : سطرهای بازسازی‌شده برای متنی که هیچ نشانه‌ای ندارد
const shereno: NormalizedQuote[] = [];
const sherenoSources = new WeakMap<NormalizedQuote, PoemSource>();
const layoutCache = new WeakMap<NormalizedQuote, Map<LineMode, PoemLayout>>();

for (const q of sherenoRaw as any[]) {
  const rawPoem = typeof q.poem === "string" ? q.poem.trim() : "";
  const poet = typeof q.poet === "string" ? q.poet.trim() : "";
  if (!rawPoem) continue;

  const title = typeof q.title === "string" ? q.title.trim() : "";
  const book = typeof q.book === "string" ? q.book.trim() : "";
  const tags = ["شعر نو", poet].filter(Boolean) as string[];
  const quote: NormalizedQuote = {
    id: `sn-${q.id}`,
    kind: "shereno",
    text_persian: rawPoem,
    poet,
    poet_english: SHERENO_POET_EN[poet],
    title,
    book,
    source: book,
    tags,
    search: "",
  };
  attachScoreFields(quote, [rawPoem], [poet, title, book], [poet], [title, ...tags]);
  shereno.push(quote);
}

/**
 * چیدمان سطری یک شعر با حالت درخواستی مصرف‌کننده.
 * تحلیل متن و ساخت سطرها یک بار برای هر آیتم و هر حالت انجام و نگه داشته می‌شود.
 */
function layoutFor(quote: NormalizedQuote, mode: LineMode): PoemLayout | null {
  if (quote.kind !== "shereno") return null;

  let perItem = layoutCache.get(quote);
  if (!perItem) {
    perItem = new Map();
    layoutCache.set(quote, perItem);
  }
  const cached = perItem.get(mode);
  if (cached) return cached;

  let source = sherenoSources.get(quote);
  if (!source) {
    source = analyzePoem(quote.text_persian);
    sherenoSources.set(quote, source);
  }

  // حالت پیش‌فرض فقط وقتی بازسازی می‌کند که منبع هیچ نشانه‌ای نداشته باشد.
  const effectiveMode: LineMode = mode === "auto" && source.hasBreaks ? "separators" : mode;
  const layout = layoutAnalyzedPoem(source, effectiveMode);
  perItem.set(mode, layout);
  return layout;
}

/**
 * تبدیل آیتم داخلی مخزن به شکل قابل انتشار در پاسخ API.
 * فیلدهای داخلی (رشتهٔ جستجو) حذف می‌شوند و متن شعر با شکست خط مناسب حالت
 * درخواستی برگردانده می‌شود. برای شعر نو، منبع سطرها در line_origin اعلام می‌شود.
 */
export function presentQuote(quote: NormalizedQuote, mode: LineMode = "auto"): Record<string, any> {
  const layout = layoutFor(quote, mode);
  const rest: Record<string, unknown> = { ...quote };
  delete rest.search;
  return {
    ...rest,
    text_persian: layout ? layout.text : quote.text_persian,
    line_origin: layout ? layout.origin : undefined,
    line_count: layout ? layout.lineCount : undefined,
  };
}

export function presentQuotes(quotes: NormalizedQuote[], mode: LineMode = "auto"): Record<string, any>[] {
  return quotes.map((quote) => presentQuote(quote, mode));
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

// ورودی‌ها از پیش نرمال شده‌اند؛ این تابع بدون نرمال‌سازی دوباره کار می‌کند.
function scoreNormalized(query: string, value: string): number {
  if (!query || !value) return 0;
  if (query === value) return 1;
  if (canonicalPoetName(query) === canonicalPoetName(value)) return 0.99;
  if (value.includes(query) || query.includes(value)) return 0.9;
  if (query.length < 3 || value.length < 3) return 0;
  return 1 - levenshtein(query, value) / Math.max(query.length, value.length);
}

function poetScore(needle: string, candidate: string): number {
  return scoreNormalized(normalizeText(needle), normalizeText(candidate));
}

function matchPoet(q: NormalizedQuote, needle: string): boolean {
  const query = normalizeText(needle);
  const candidates = [q.poet, q.poet_english].filter((value): value is string => Boolean(value));
  if (candidates.length === 0) return false;
  const score = Math.max(...candidates.map((candidate) => scoreNormalized(query, normalizeText(candidate))));
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

// ---------------------------------------------------------------------------
// نمایهٔ نویسندگان برای تطبیق فازی
// تطبیق تقریبی نام شاعر روی نام‌های یکتا انجام می‌شود، نه روی هر آیتم.
// ---------------------------------------------------------------------------

interface AuthorGroup {
  target: string;
  indices: number[];
}

let authorGroups: AuthorGroup[] | null = null;

function getAuthorGroups(): AuthorGroup[] {
  if (authorGroups) return authorGroups;
  const groups = new Map<string, AuthorGroup>();
  for (let i = 0; i < all.length; i++) {
    const target = scoreFieldsOf(all[i]).authorTarget;
    const group = groups.get(target);
    if (group) group.indices.push(i);
    else groups.set(target, { target, indices: [i] });
  }
  authorGroups = [...groups.values()];
  return authorGroups;
}

const fuzzyCache = new Map<string, Set<number>>();

// مجموعهٔ اندیس آیتم‌هایی که نام شاعرشان به‌طور تقریبی با واژهٔ پرس‌وجو می‌خواند.
function fuzzyAuthorMatches(term: string): Set<number> {
  const cached = fuzzyCache.get(term);
  if (cached) return cached;

  const matched = new Set<number>();
  if (term.length >= 3) {
    const threshold = term.length < 4 ? 0.9 : 0.75;
    for (const group of getAuthorGroups()) {
      if (group.target && scoreNormalized(term, group.target) >= threshold) {
        for (const index of group.indices) matched.add(index);
      }
    }
  }
  if (fuzzyCache.size > 512) fuzzyCache.clear();
  fuzzyCache.set(term, matched);
  return matched;
}

// ---------------------------------------------------------------------------
// صفحات و نمونه‌گیری
// ---------------------------------------------------------------------------

// نمونه‌گیری تصادفی بدون کپی کل آرایه (الگوریتم مخزن)
export function randomSample<T>(arr: T[], limit: number): T[] {
  const n = Math.min(limit, arr.length);
  if (n <= 0) return [];
  if (arr.length <= n) return arr.slice();
  const reservoir = arr.slice(0, n);
  for (let i = n; i < arr.length; i++) {
    const j = Math.floor(Math.random() * (i + 1));
    if (j < n) reservoir[j] = arr[i];
  }
  return reservoir;
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

// جستجو در هر دو نمایه شعر کلاسیک و شعر نو برای یک شاعر مشخص
export function getQuotesForPoet(poet: string): NormalizedQuote[] {
  const fromPoetry = quotesForPoet(poetryByPoetIndex, poet);
  const fromShereno = quotesForPoet(sherenoByPoetIndex, poet);
  return [...fromPoetry, ...fromShereno];
}

export function getQuotes(sp: URLSearchParams): ListResult<NormalizedQuote> {
  const poet = sp.get("poet");
  if (poet !== null) {
    return resolve(getQuotesForPoet(poet), parseOptions(sp));
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
        const fields = scoreFieldsOf(quote);
        return (
          scoreNormalized(needle, fields.authorTarget) >= (needle.length < 4 ? 0.9 : 0.72) ||
          (quote.author_english ? poetScore(needle, quote.author_english) >= 0.72 : false)
        );
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
  const rawQuery = (sp.get("q") || sp.get("query") || "").trim();
  const q = normalizeText(rawQuery);
  const opts = parseOptions(sp);
  if (!q) {
    // بدون پرس‌وجو: تمام مجموعه‌ها (تصادفی در صورت درخواست)
    return resolve(all, opts);
  }

  // تفکیک پرس‌وجو به کلمات مستقل برای جستجوی چندکلمه‌ای
  const terms = q.split(/\s+/).filter(Boolean);
  // تطبیق فازی فقط برای واژه‌هایی لازم است که ممکن است در متن نباشند.
  const fuzzySets = terms.map((term) => (term.length >= 3 ? null : new Set<number>()));

  const scoredItems: Array<{ quote: NormalizedQuote; score: number }> = [];

  for (let index = 0; index < all.length; index++) {
    const item = all[index];
    const fields = scoreFieldsOf(item);
    let score = 0;
    let allMatched = true;

    for (let t = 0; t < terms.length; t++) {
      const term = terms[t];
      const at = item.search.indexOf(term);
      if (at !== -1) {
        // امتیازدهی بر اساس بخشی که واژه در آن دیده شده است
        if (fields.authorTarget.includes(term)) {
          score += 15;
        } else if (fields.titleTarget.includes(term)) {
          score += 8;
        } else if (at + term.length <= fields.headLength) {
          score += 3;
        } else {
          score += 1;
        }
        continue;
      }

      // واژه در رشتهٔ جستجو نبود؛ فقط نام شاعر به‌صورت تقریبی بررسی می‌شود
      let fuzzy = fuzzySets[t];
      if (!fuzzy) {
        fuzzy = fuzzyAuthorMatches(term);
        fuzzySets[t] = fuzzy;
      }
      if (fuzzy.has(index)) {
        score += 10;
      } else {
        allMatched = false;
        break;
      }
    }

    if (allMatched && score > 0) {
      // پاداش برای تطبیق عبارت کامل پشت‌سرهم
      if (item.search.includes(q)) {
        score += 25;
      }
      scoredItems.push({ quote: item, score });
    }
  }

  // مرتب‌سازی بر اساس امتیاز نزولی
  scoredItems.sort((a, b) => b.score - a.score);
  const filtered = scoredItems.map((entry) => entry.quote);

  return resolve(filtered, opts);
}

let poetsCache: { data: any[]; count: number } | null = null;

export function getPoets(): { data: any[]; count: number } {
  if (poetsCache) return poetsCache;

  const counts = new Map<string, number>();
  const displayNames = new Map<string, string>();
  for (const q of [...poetry, ...hafez, ...shereno]) {
    const key = q.poet ? canonicalPoetName(q.poet) : "نامشخص";
    counts.set(key, (counts.get(key) || 0) + 1);
    if (!displayNames.has(key) && q.poet) displayNames.set(key, q.poet);
  }

  const bioByEnglish = new Map<string, { english: string; bioFa: string; bioEn: string; birth?: number; death?: number }>();
  for (const candidate of Object.values(POET_BIOS)) {
    bioByEnglish.set(normalizeText(candidate.english), candidate);
  }

  const data = [...counts.entries()].map(([name, quote_count], i) => {
    const displayName = displayNames.get(name) ?? name;
    const bio = POET_BIOS[name] ?? POET_BIOS[displayName] ?? bioByEnglish.get(name);
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

  poetsCache = { data, count: data.length };
  return poetsCache;
}

let categoriesCache: { data: any[]; count: number } | null = null;

export function getCategories(): { data: any[]; count: number } {
  if (categoriesCache) return categoriesCache;

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

  categoriesCache = { data, count: data.length };
  return categoriesCache;
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
