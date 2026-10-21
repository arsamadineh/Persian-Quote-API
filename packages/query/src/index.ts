// packages/query/src/index.ts
import { normalizeSearch } from "@persian-quote/persian";
import { tokenize } from "@persian-quote/persian";
import type { QueryFilters } from "../../../contracts/research";

const POET_ALIASES: Record<string, string> = {
  "حافظ": "hafez", "سعدی": "saadi", "مولانا": "molana", "مولوی": "molana",
  "فردوسی": "ferdowsi", "نیما": "nima", "نیما یوشیج": "nima",
  "سهراب": "sohrab", "سهراب سپهری": "sohrab", "خیام": "khayyam",
  "عطار": "attar", "نظامی": "nezami", "حافظ شیرازی": "hafez",
};

const FORM_MAP: Record<string, string> = {
  "غزل": "ghazal", "غزل‌ها": "ghazal", "غزلها": "ghazal",
  "رباعی": "robaee", "رباعی‌ها": "robaee",
  "مثنوی": "masnavi", "قصیده": "qasida", "نیمایی": "nimaee", "شعر سپید": "sepid", "سپید": "sepid",
};

const METER_NAMES = ["هزج", "رمل", "خفیف", "رجز", "متقارب", "منسرح", "مضارع", "سریع", "مجتث"];

const ERA_MAP: Record<string, [number, number]> = {
  "قرن هفتم": [1200, 1300], "قرن هشتم": [1300, 1400], "قرن نهم": [1400, 1500],
  "پیش از ۱۳۰۰": [0, 1300], "بعد از ۱۳۰۰": [1300, 9999],
};

export function parseQuery(q: string): { filters: QueryFilters; explain: string; confidence: number } {
  const norm = normalizeSearch(q);
  const toks = tokenize(norm);
  const filters: QueryFilters = {};
  const understood: string[] = [];
  let confidence = 0.5;

  // poet
  for (const [alias, slug] of Object.entries(POET_ALIASES)) {
    if (norm.includes(normalizeSearch(alias))) {
      if (!filters.poet) filters.poet = [];
      filters.poet.push(slug);
      understood.push(alias);
      confidence += 0.15;
    }
  }

  // form
  for (const [name, form] of Object.entries(FORM_MAP)) {
    if (norm.includes(normalizeSearch(name))) {
      if (!filters.form) filters.form = [];
      if (!filters.form.includes(form)) filters.form.push(form);
      understood.push(name);
      confidence += 0.1;
    }
  }

  // meter
  for (const m of METER_NAMES) {
    if (norm.includes(normalizeSearch(m))) {
      if (!filters.meter) filters.meter = [];
      filters.meter.push(m);
      understood.push(`بحر ${m}`);
      confidence += 0.1;
    }
  }

  // radif: ردیف «X»
  const radifMatch = norm.match(/ردیف\s+(\S+)/);
  if (radifMatch) {
    filters.radif = radifMatch[1];
    understood.push(`ردیف «${radifMatch[1]}»`);
    confidence += 0.2;
  }

  // era
  for (const [name, [from, to]] of Object.entries(ERA_MAP)) {
    if (norm.includes(normalizeSearch(name))) {
      filters.era = { from, to };
      understood.push(name);
      confidence += 0.1;
    }
  }

  // free text: remaining tokens not captured -> text
  const captured = new Set(understood.join(" ").split(/\s+/));
  const free = toks.filter((t) => !captured.has(t));
  if (free.length > 0 && free.length <= 4) {
    filters.text = free.join(" ");
    understood.push(`متن «${filters.text}»`);
  }

  confidence = Math.min(1, confidence);
  const explain = understood.length > 0
    ? understood.join("، ")
    : "پرسش درک نشد";
  return { filters, explain, confidence };
}
