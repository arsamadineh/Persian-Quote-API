import { describe, it, expect } from 'bun:test';
import {
  PoemSchema,
  PoeticFormEnum,
  parseStableId,
  formatStableId,
  validatePoem,
  assertPoem,
} from '../src';

describe('packages/schema: Poem & ID Schemas', () => {
  it('parses and formats stable IDs accurately', () => {
    const parsed = parseStableId('hafez.ghazaliat.1');
    expect(parsed).toEqual({
      poetSlug: 'hafez',
      collectionSlug: 'ghazaliat',
      number: 1,
    });

    const formatted = formatStableId('hafez', 'ghazaliat', 1);
    expect(formatted).toBe('hafez.ghazaliat.1');

    // Multi-segment poet slug
    const multi = parseStableId('salman-harati.az-asman-e-sabz.42');
    expect(multi).toEqual({
      poetSlug: 'salman-harati',
      collectionSlug: 'az-asman-e-sabz',
      number: 42,
    });
  });

  it('rejects invalid stable IDs', () => {
    expect(() => parseStableId('invalid')).toThrow();
    expect(() => parseStableId('hafez.1')).toThrow();
    expect(() => parseStableId('Hafez.Ghazaliat.1')).toThrow();
    expect(() => parseStableId('hafez.ghazaliat.0')).toThrow();
    expect(() => formatStableId('hafez', 'ghazaliat', 0)).toThrow();
  });

  it('validates Acceptance Fixture A1: Salman Harati ("از آسمان سبز")', () => {
    const fixtureA1 = {
      id: "salman-harati.az-asman-e-sabz.1",
      title: "از آسمان سبز",
      poet_id: "salman-harati",
      poet_name: "سلمان هراتی",
      collection_id: "az-asman-e-sabz",
      collection_title: "از آسمان سبز",
      number: 1,
      form: "nimaee" as const,
      stanzas: [
        [
          "دیروز اگر سوخت ای دوست، سنگر",
          "امروز دار و ندار من است این دل",
        ],
        [
          "جاده سرشار از عطر شهادت بود",
          "و آسمان آبی‌تر از همیشه",
        ],
      ],
      text_plain: "دیروز اگر سوخت ای دوست، سنگر\nامروز دار و ندار من است این دل\n\nجاده سرشار از عطر شهادت بود\nو آسمان آبی‌تر از همیشه",
      colophon: {
        place: "تنکابن",
        date_raw: "12/2/1364",
        date_jalali: { y: 1364, m: 2, d: 12 },
        date_gregorian: "1985-05-02",
      },
      attribution: {
        status: "verified" as const,
        sources: ["دیوان سلمان هراتی، نشر قدیانی"],
      },
      rights: {
        status: "public_domain" as const,
        license: "CC-BY-4.0",
        provenance: "Ingested from primary modern poetry corpus",
        audit_date: "2026-10-16",
      },
      tags: ["دفاع مقدس", "معاصر", "شعر نیمایی"],
      excerpt: {
        lines: ["دیروز اگر سوخت ای دوست، سنگر", "امروز دار و ندار من است این دل"],
        start: 0,
        end: 1,
        cutStart: false,
        cutEnd: true,
        text: "دیروز اگر سوخت ای دوست، سنگر امروز دار و ندار من است این دل ...",
      },
      structure_meta: {
        origin: "manual" as const,
        confidence: 1.0,
        line_count: 4,
        stanza_count: 2,
        has_colophon: true,
      },
    };

    const validated = assertPoem(fixtureA1);
    expect(validated.id).toBe("salman-harati.az-asman-e-sabz.1");
    expect(validated.colophon?.place).toBe("تنکابن");
    expect(validated.colophon?.date_jalali?.y).toBe(1364);

    // Verify invariant: colophon words/digits do not appear in stanzas
    const flattened = validated.stanzas.flat().join(" ");
    expect(flattened.includes("تنکابن")).toBe(false);
    expect(flattened.includes("1364")).toBe(false);
    expect(flattened.includes("12/2")).toBe(false);
  });

  it('validates Acceptance Fixture A2: Nader Naderpour ("خون و خاکستر")', () => {
    const fixtureA2 = {
      id: "nader-naderpour.khoon-va-khakestar.1",
      title: "خون و خاکستر",
      poet_id: "nader-naderpour",
      poet_name: "نادر نادرپور",
      collection_id: "khoon-va-khakestar",
      collection_title: "خون و خاکستر",
      number: 1,
      form: "nimaee" as const,
      stanzas: [
        [
          "همواره، در افق ابری",
          "تصویر تو می‌درخشد",
        ],
      ],
      text_plain: "همواره، در افق ابری\nتصویر تو می‌درخشد",
      attribution: {
        status: "verified" as const,
        sources: ["مجموعه اشعار نادر نادرپور"],
      },
      rights: {
        status: "copyright_verified" as const,
        license: "Fair Use / Academic Research",
        provenance: "Modern verified corpus audit",
        audit_date: "2026-10-16",
      },
      tags: ["معاصر", "نیمایی"],
      excerpt: {
        lines: ["همواره، در افق ابری"],
        start: 0,
        end: 0,
        cutStart: false,
        cutEnd: false,
        text: "همواره، در افق ابری",
      },
      structure_meta: {
        origin: "separators" as const,
        confidence: 0.95,
        line_count: 2,
        stanza_count: 1,
        has_colophon: false,
      },
    };

    const res = validatePoem(fixtureA2);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.structure_meta?.origin).toBe("separators");
      expect(res.data.text_plain).toContain("همواره، در");
    }
  });

  it('rejects poems with missing or malformed fields', () => {
    const invalidPoem = {
      id: "invalid-id",
      title: "",
      poet_id: "Hafez", // uppercase disallowed
      number: -1,
      form: "not-a-form",
      stanzas: [],
    };

    const res = validatePoem(invalidPoem);
    expect(res.success).toBe(false);
  });
});
