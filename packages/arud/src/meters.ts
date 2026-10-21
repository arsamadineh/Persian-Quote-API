// packages/arud/src/meters.ts
// Common Persian meters (بحور) reduced to their repeating foot (تفعیله).
//
// Sources (patterns are facts; cited, not invented):
//   - Wikipedia (fa): "عَروض"  https://fa.wikipedia.org/wiki/عَروض
//   - Wikipedia (fa): "بحور شعر فارسی" https://fa.wikipedia.org/wiki/بحور_شعر_فارسی
//   - Wikipedia (en): "Persian metres" https://en.wikipedia.org/wiki/Persian_metres
//   - شفیعی کدکنی، "موسیقی شعر"، نشر آگه.
//
// footPattern: weight string of one foot (L=long, S=short). A hemistich is
// segmented into feet of this length; score = fraction of feet that align
// (with X as wildcard) plus a length-coverage term. substitutions are common
// زحاف names only.

export interface Meter {
  name: string;
  foot: string;
  footPattern: string;
  substitutions: string[];
}

export const METERS: Meter[] = [
  { name: "بحر هزج", foot: "مفاعلن", footPattern: "LSL", substitutions: ["خبن", "تشعيث"] },
  { name: "بحر رمل", foot: "فاعلتن", footPattern: "LLS", substitutions: ["خبن", "تشعيث", "عقص"] },
  { name: "بحر خفیف", foot: "فاعلاتن", footPattern: "LLSL", substitutions: ["خبن", "تشعيث"] },
  { name: "بحر رجز", foot: "مستفعلن", footPattern: "SLLL", substitutions: ["خبن", "تشعيث"] },
  { name: "بحر متقارب", foot: "فعولن", footPattern: "SLL", substitutions: ["خبن"] },
  { name: "بحر منسرح", foot: "مفعولُن", footPattern: "LLS", substitutions: ["خبن"] },
];

export function normalizePattern(p: string): string {
  return p.replace(/\s+/g, "");
}
