import { describe, it, expect } from 'bun:test';
import { CollectionSchema, assertCollection, validateCollection } from '../src';

describe('packages/schema: Collection Schema', () => {
  it('validates canonical collection definitions', () => {
    const collection = {
      slug: "ghazaliat",
      poet_slug: "hafez",
      title_persian: "غزلیات حافظ",
      title_english: "Ghazals of Hafez",
      description: "مجموعه کامل غزل‌های خواجه حافظ شیرازی بر اساس تصحیح قزوینی-غنی",
      era: "timurid",
      form: "ghazal" as const,
      source_edition: "تصحیح علامه قزوینی و دکتر قاسم غنی",
      work_count: 495,
    };

    const validated = assertCollection(collection);
    expect(validated.slug).toBe("ghazaliat");
    expect(validated.poet_slug).toBe("hafez");
    expect(validated.form).toBe("ghazal");
  });

  it('rejects invalid collection schema instances', () => {
    const invalidCollection = {
      slug: "INVALID SLUG",
      poet_slug: "hafez",
      title_persian: "",
      title_english: "",
    };

    const res = validateCollection(invalidCollection);
    expect(res.success).toBe(false);
  });
});
