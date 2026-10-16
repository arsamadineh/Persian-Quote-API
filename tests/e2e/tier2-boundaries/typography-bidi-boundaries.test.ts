import { describe, test, expect } from "bun:test";
import { cleanLine, toAsciiDigits, assertPersianTypography } from "../harness";
import { normalizePoemTypography } from "@/lib/data/poem-lines";
import { normalizeText } from "@/lib/data/store";

describe("Tier 2 E2E: Typography & BiDi Boundaries", () => {
  test("T2-TYPO-01: Preserves ZWNJ (U+200C) in compound words across normalization", () => {
    const raw = "او می‌رود به سوی خانه‌ها و دل‌انگیزترین نواها را می‌شنود.";
    const cleaned = cleanLine(raw);

    expect(cleaned).toContain("می\u200cرود");
    expect(cleaned).toContain("خانه\u200cها");
    expect(cleaned).toContain("دل\u200cانگیزترین");
    expect(cleaned).toContain("می\u200cشنود");
  });

  test("T2-TYPO-02: Completely strips invisible LTR/RTL directional marks", () => {
    const rawWithMarks = "شعر فارسی\u200e با نشانه‌های پنهان\u200f جهت‌نما";
    const cleaned = cleanLine(rawWithMarks);

    expect(cleaned).not.toContain("\u200e");
    expect(cleaned).not.toContain("\u200f");
    expect(cleaned).toBe("شعر فارسی با نشانه‌های پنهان جهت‌نما");
  });

  test("T2-TYPO-03: Completely strips Tatweel / Kashida (U+0640)", () => {
    const rawWithTatweel = "شـــعر کـــشیده با تـــطویل";
    const normalized = normalizeText(rawWithTatweel);

    expect(normalized).not.toContain("\u0640");
    expect(normalized).not.toContain("ـ");
    expect(normalized).toBe("شعر کشیده با تطویل");
  });

  test("T2-TYPO-04: Quotation marks « and » normalize internal spacing", () => {
    const rawQuotes = "گفت : « سلام بر اهل دل » و رفت .";
    const cleaned = cleanLine(rawQuotes);

    expect(cleaned).toBe("گفت: «سلام بر اهل دل» و رفت.");
    assertPersianTypography(cleaned);
  });

  test("T2-TYPO-05: Bidirectional digit conversion handles mixed Persian and Arabic numerals", () => {
    const mixedDigits = "سال ۱۳۶۴ شمسی و سال 1985 میلادی و تاریخ ٠١/٠٢";
    const ascii = toAsciiDigits(mixedDigits);

    expect(ascii).toContain("1364");
    expect(ascii).toContain("1985");
    expect(ascii).toContain("01/02");
    expect(ascii).not.toMatch(/[۰-۹٠-٩]/);
  });
});
