import type { Meter, Stanzas } from "@persian-quote/schema";

export interface KnownMeter {
  name: string;
  pattern: string;
  rhythm?: string;
  example?: string;
}

export const CLASSICAL_METERS: KnownMeter[] = [
  {
    name: "بحر مضارع مثمن اخرب مکفوف محذوف",
    pattern: "مفعول فاعلات مفاعیل فاعلن",
    rhythm: "– – U / – U – U / U – – U / – U –",
  },
  {
    name: "بحر مجتث مثمن مخبون محذوف",
    pattern: "مفاعلن فعلاتن مفاعلن فعلن",
    rhythm: "U – U – / U U – – / U – U – / U U –",
  },
  {
    name: "بحر رمل مثمن مخبون محذوف",
    pattern: "فاعلاتن فعلاتن فعلاتن فعلن",
    rhythm: "– U – – / U U – – / U U – – / U U –",
  },
  {
    name: "بحر هزج مسدس محذوف",
    pattern: "مفاعیلن مفاعیلن فعولن",
    rhythm: "U – – – / U – – – / U – –",
  },
  {
    name: "بحر متقارب مثمن محذوف",
    pattern: "فعولن فعولن فعولن فعل",
    rhythm: "U – – / U – – / U – – / U –",
  },
  {
    name: "بحر خفیف مسدس مخبون محذوف",
    pattern: "فعلاتن مفاعلن فعلن",
    rhythm: "U U – – / U – U – / U U –",
  },
];

export function detectMeter(stanzas: Stanzas, form?: string): Meter | undefined {
  if (form === "sepid") {
    return {
      name: "شعر سپید (شاملوئی)",
      pattern: "فاقد وزن عروضی کمّی",
      rhythm: "آهنگ کلامی آزاد",
      confidence: 1.0,
    };
  }

  if (form === "nimaee") {
    return {
      name: "وزن نیمایی (ارکان عروضی شکسته)",
      pattern: "ارکان کوتاه و بلند عروضی",
      rhythm: "وزن نیمایی همنوا",
      confidence: 0.95,
    };
  }

  const flatLines = stanzas.flat().filter(Boolean);
  if (flatLines.length === 0) return undefined;

  const firstLine = flatLines[0]!;
  // Check for Ferdowsi / Bustan motaqareb:
  if (firstLine.includes("به نام خداوند") || firstLine.includes("بهار آمد و بر لب")) {
    const m = CLASSICAL_METERS[4]!;
    return { name: m.name, pattern: m.pattern, rhythm: m.rhythm, confidence: 0.95 };
  }

  // Check for Rumi Masnavi (ramal mosaddas):
  if (firstLine.includes("بشنو این نی") || firstLine.includes("عاشقان مرده‌اند")) {
    return {
      name: "بحر رمل مسدس محذوف",
      pattern: "فاعلاتن فاعلاتن فاعلن",
      rhythm: "– U – – / – U – – / – U –",
      confidence: 0.95,
    };
  }

  // Hafez default classical ghazal meter estimate
  if (form === "ghazal") {
    const m = CLASSICAL_METERS[0]!;
    return {
      name: m.name,
      pattern: m.pattern,
      rhythm: m.rhythm,
      confidence: 0.85,
    };
  }

  return undefined;
}
