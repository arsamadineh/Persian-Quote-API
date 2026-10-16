import { describe, test, expect } from "bun:test";
import * as fc from "fast-check";
import {
  extractColophon,
  cleanLine,
  splitBySignals,
  looksStructured,
  reconstructLines,
  letterFingerprint,
  analyzeStructure,
  pickExcerpt,
  detectRadifAndQafiyeh,
  detectMeter,
  determineAttribution,
} from "../src";

describe("packages/poem: Structure & Colophon Engine", () => {
  test("Fixture A1: Salman Harati colophon extraction & structured dates", () => {
    const rawHarati = `
در حاشیهٔ جاده‌های مه گرفته
صدای باران می‌آمد
یک سبد ستاره چیده بودم برای تو
کوزه‌ای پر از آب زلال آوردم
دسته‌ای گل از نگاه آفتاب چیدم
یک عبا برای شانه‌های مهربان تو در شبان سرد
چارقی برای گام‌های تو در هجوم درد
تنکابن، 12/2/1364
`.trim();

    const result = extractColophon(rawHarati);
    expect(result.colophon).toBeDefined();
    expect(result.colophon?.place).toBe("تنکابن");
    expect(result.colophon?.date).toBe("12/2/1364");
    expect(result.colophon?.date_raw).toBe("12/2/1364");
    expect(result.colophon?.date_jalali).toEqual({ y: 1364, m: 2, d: 12 });
    expect(result.colophon?.date_gregorian).toBe("1985-05-02");

    // Colophon tokens stripped from poem body
    expect(result.body).not.toContain("تنکابن");
    expect(result.body).not.toContain("1364");
    expect(result.body).not.toContain("12/2");

    // Cleaned body passes cleanLine
    const cleaned = cleanLine(result.body);
    expect(cleaned).not.toMatch(/\s{2,}/);
    expect(cleaned).not.toMatch(/\s+[،؛؟]/);
  });

  test("Colophon extraction with seasonal year", () => {
    const raw = "در میان کوهستان سرد و برفی\nزمستان 1331";
    const res = extractColophon(raw);
    expect(res.colophon).toBeDefined();
    expect(res.colophon?.date_jalali?.y).toBe(1331);
    expect(res.colophon?.date_jalali?.m).toBe(10);
    expect(res.body).toBe("در میان کوهستان سرد و برفی");
  });

  test("Colophon extraction returns untouched body when no colophon exists", () => {
    const raw = "ای صبا نکهتی از خاک ره یار بیار\nببر اندوه دل و مژده دلدار بیار";
    const res = extractColophon(raw);
    expect(res.colophon).toBeUndefined();
    expect(res.body).toBe(raw);
  });

  test("Fixture A2: Punctuation spacing & normalization", () => {
    const raw = "همواره ،در امتداد شب ،سکوت جاری بود .";
    const cleaned = cleanLine(raw);
    expect(cleaned).toContain("همواره، در");
    expect(cleaned).not.toContain(" ،");
    expect(cleaned).not.toContain(" .");
  });

  test("Fixture A3: Signal splitting by asterisks and hemistichs", () => {
    const raw = "بند اول مصراع اول / بند اول مصراع دوم\n*\nبند دوم مصراع اول / بند دوم مصراع دوم";
    const stanzas = splitBySignals(raw);
    expect(stanzas).not.toBeNull();
    expect(stanzas?.length).toBe(2);
    expect(stanzas?.[0]?.length).toBe(2);
    expect(stanzas?.[1]?.length).toBe(2);
    expect(stanzas?.[0]?.[0]).toBe("بند اول مصراع اول");
    expect(stanzas?.[0]?.[1]).toBe("بند اول مصراع دوم");
  });

  test("looksStructured evaluates line count and length distributions", () => {
    const structured = [
      ["در حاشیهٔ جاده‌های مه گرفته", "صدای باران می‌آمد"],
      ["یک سبد ستاره چیده بودم برای تو", "کوزه‌ای پر از آب زلال آوردم"],
    ];
    expect(looksStructured(structured)).toBe(true);

    const unstructured = [["این یک سطر بسیار بسیار بسیار بسیار بسیار بسیار بسیار بسیار بسیار طولانی است"]];
    expect(looksStructured(unstructured)).toBe(false);
  });

  test("reconstructLines generates balanced lines on unformatted text", () => {
    const longText =
      "من چهره ام گرفته من قایقم نشسته به خشکی با قایقم نشسته به خشکی فریاد می زنم وامانده در عذابم انداخته است در راه پر مخافت این ساحل خراب و فاصله است آب امدادی ای رفیقان با من";
    const lines = reconstructLines(longText);
    expect(lines.length).toBeGreaterThan(1);
    for (const l of lines) {
      expect(l.length).toBeLessThanOrEqual(64);
    }
    // Preserves letter fingerprint
    expect(letterFingerprint(lines.join(" "))).toBe(letterFingerprint(longText));
  });

  test("analyzeStructure produces complete structure metadata", () => {
    const raw = "سحر با باد می‌گفتم حدیث آرزومندی / خطاب آمد که واثق شو به الطاف خداوندی";
    const analyzed = analyzeStructure(raw);
    expect(analyzed.origin).toBe("separators");
    expect(analyzed.confidence).toBeGreaterThanOrEqual(0.9);
    expect(analyzed.stanzas.length).toBe(1);
    expect(analyzed.stanzas[0]?.length).toBe(2);
  });
});

describe("packages/poem: Excerpt Engine", () => {
  test("pickExcerpt limits word count and flags cutEnd", () => {
    const stanzas = [
      [
        "در حاشیهٔ جاده‌های مه گرفته",
        "صدای باران می‌آمد",
        "یک سبد ستاره چیده بودم برای تو",
        "کوزه‌ای پر از آب زلال آوردم",
        "دسته‌ای گل از نگاه آفتاب چیدم",
        "یک عبا برای شانه‌های مهربان تو در شبان سرد",
        "چارقی برای گام‌های تو در هجوم درد",
      ],
    ];

    const excerpt = pickExcerpt(stanzas, { maxWords: 25 });
    expect(excerpt.cutEnd).toBe(true);
    expect(excerpt.cutStart).toBe(false);
    const totalWords = excerpt.lines.reduce((s, l) => s + l.split(/\s+/).filter(Boolean).length, 0);
    expect(totalWords).toBeLessThanOrEqual(25);
  });

  test("pickExcerpt avoids bad trailing conjunctions", () => {
    const stanzas = [
      ["همواره، در امتداد شب", "سکوت جاری بود."],
      ["و ماه از فراز ابرها", "به خاک تیره می‌نگریست."],
    ];
    const excerpt = pickExcerpt(stanzas, { maxWords: 15 });
    expect(excerpt.lines.length).toBeGreaterThan(0);
    const lastLine = excerpt.lines[excerpt.lines.length - 1]!;
    expect(lastLine).not.toMatch(/\s(?:و|که|تا|یا|از|به|در|با|بر)$/);
    expect(lastLine).toMatch(/[.!؟?…؛]$/);
  });
});

describe("packages/poem: Rhyme, Meter & Attribution", () => {
  test("detectRadifAndQafiyeh detects classical radif and qafiyeh", () => {
    const hafezGhazal2 = [
      ["صلاح کار کجا و من خراب کجا", "ببین تفاوت ره کز کجاست تا به کجا"],
      ["دلم ز صومعه بگرفت و خرقه سالوس", "کجاست دیر مغان و شراب ناب کجا"],
      ["چه نسبت است به رندی صلاح و تقوا را", "سماع وعظ کجا نغمه رباب کجا"],
    ];

    const rhyme = detectRadifAndQafiyeh(hafezGhazal2);
    expect(rhyme.radif).toBe("کجا");
    expect(rhyme.qafiyeh).toBeDefined();
  });

  test("detectMeter annotates Ferdowsi and Hafez meters", () => {
    const ferdowsi = [["به نام خداوند جان و خرد", "کزین برتر اندیشه برنگذرد"]];
    const m1 = detectMeter(ferdowsi, "masnavi");
    expect(m1?.name).toContain("متقارب");

    const hafez = [["صلاح کار کجا و من خراب کجا", "ببین تفاوت ره کز کجاست تا به کجا"]];
    const m2 = detectMeter(hafez, "ghazal");
    expect(m2?.name).toContain("مضارع");
  });

  test("determineAttribution classifies canon vs modern collections", () => {
    const a1 = determineAttribution("hafez");
    expect(a1.status).toBe("verified");

    const a2 = determineAttribution("nader-naderpour", "خون و خاکستر");
    expect(a2.status).toBe("verified");
    expect(a2.sources).toContain("خون و خاکستر");

    const a3 = determineAttribution("unknown-poet");
    expect(a3.status).toBe("attributed");
  });
});

describe("packages/poem: Property-Based Invariants", () => {
  test("cleanLine is idempotent", () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const c1 = cleanLine(s);
        const c2 = cleanLine(c1);
        expect(c2).toBe(c1);
      }),
      { numRuns: 100 }
    );
  });

  test("letterFingerprint matches between raw and cleaned Persian lines (R4)", () => {
    // Generate Persian-like text with various whitespace and punctuation
    const persianArbitrary = fc
      .array(
        fc.constantFrom(
          "سحر",
          "با",
          "باد",
          "می‌گفتم",
          "حدیث",
          "آرزومندی",
          "خطاب",
          "آمد",
          "که",
          "واثق",
          "شو",
          "به",
          "الطاف",
          "خداوندی",
          "،",
          "؛",
          "!",
          " "
        ),
        { minLength: 2, maxLength: 20 }
      )
      .map((arr) => arr.join(" "));

    fc.assert(
      fc.property(persianArbitrary, (text) => {
        const cleaned = cleanLine(text);
        expect(letterFingerprint(cleaned)).toBe(letterFingerprint(text));
      }),
      { numRuns: 100 }
    );
  });
});
