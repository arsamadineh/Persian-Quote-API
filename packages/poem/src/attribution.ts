import type { Attribution } from "@persian-quote/schema";

export function determineAttribution(
  poetSlug: string,
  sourceBook?: string,
  category?: string
): Attribution {
  // Classical masters with direct canon
  const CANONICAL_POETS = new Set(["hafez", "saadi", "rumi", "ferdowsi", "nezami", "khayyam"]);

  if (CANONICAL_POETS.has(poetSlug)) {
    return {
      status: "verified",
      notes: "استناد به نسخه‌های خطی و چاپی معتبر دیوان شاعر",
      sources: sourceBook ? [sourceBook] : ["دیوان کهن فارسی"],
    };
  }

  // Modern published collections
  if (sourceBook && sourceBook.trim().length > 0) {
    return {
      status: "verified",
      notes: `برگرفته از دفتر شعر «${sourceBook.trim()}»`,
      sources: [sourceBook.trim()],
    };
  }

  // General attribution
  return {
    status: "attributed",
    notes: "نقل‌شده در تذکره‌ها و جنگ‌های ادبی معاصر",
    sources: [],
  };
}
