import { describe, it, expect } from 'bun:test';
import { PoetSchema, assertPoet, validatePoet } from '../src';

describe('packages/schema: Poet Schema', () => {
  it('validates canonical poet definitions', () => {
    const hafez = {
      slug: "hafez",
      name_persian: "حافظ شیرازی",
      name_english: "Hafez Shirazi",
      pen_name_persian: "حافظ",
      pen_name_english: "Hafez",
      aliases: ["خواجه حافظ", "لسان‌الغیب"],
      era: "timurid" as const,
      birth: { year_gregorian: 1315, place: "شیراز" },
      death: { year_gregorian: 1390, place: "شیراز" },
      bio_persian: "خواجه شمس‌الدین محمد حافظ شیرازی غزل‌سرای بزرگ قرن هشتم هجری است.",
      bio_english: "Khwaja Shams-ud-Din Muhammad Hafez-e Shirazi was a 14th century Persian lyric poet.",
      collections: ["ghazaliat"],
      rights_summary: {
        default_status: "public_domain" as const,
        notes: "Historical author deceased > 600 years ago.",
      },
      stats: {
        works_count: 497,
        stanza_count: 4000,
      },
    };

    const validated = assertPoet(hafez);
    expect(validated.slug).toBe("hafez");
    expect(validated.era).toBe("timurid");
    expect(validated.rights_summary.default_status).toBe("public_domain");
  });

  it('rejects invalid poet schema instances', () => {
    const invalidPoet = {
      slug: "Invalid_Slug!",
      name_persian: "",
      name_english: "",
      era: "future_era",
      bio_persian: "",
      bio_english: "",
      rights_summary: {
        default_status: "unknown_status",
      },
    };

    const res = validatePoet(invalidPoet);
    expect(res.success).toBe(false);
  });
});
