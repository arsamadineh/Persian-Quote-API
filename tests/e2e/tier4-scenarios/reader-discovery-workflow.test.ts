import { describe, test, expect } from "bun:test";
import { e2eJson, assertPersianTypography } from "../harness";

describe("Tier 4 E2E Scenario: Literary Reader Discovery & Line Layout Inspection", () => {
  test("T4-SCENARIO-03: Reader discovers poet, switches line modes (auto vs raw vs separators), and drills into categories", async () => {
    // Step 1: Reader fetches poet catalog
    const poetsRes = await e2eJson("/api/poets");
    expect(poetsRes.status).toBe(200);
    expect(poetsRes.body.count).toBeGreaterThan(0);

    // Pick Sohrab Sepehri from catalog
    const sohrab = poetsRes.body.data.find((p: any) => p.name_persian.includes("سهراب سپهری"));
    expect(sohrab).toBeDefined();

    const poetEncoded = encodeURIComponent("سهراب سپهری");

    // Step 2: Reader fetches poems under auto line reconstruction mode
    const autoRes = await e2eJson(`/api/quotes/shereno?poet=${poetEncoded}&lines=auto&limit=1`);
    expect(autoRes.status).toBe(200);
    expect(autoRes.body.data.length).toBe(1);
    const autoQuote = autoRes.body.data[0];
    expect(autoQuote.line_origin).toBeDefined();
    assertPersianTypography(autoQuote.text_persian);

    // Step 3: Reader switches to raw line mode (original untouched string)
    const rawRes = await e2eJson(`/api/quotes/shereno?poet=${poetEncoded}&lines=raw&limit=1`);
    expect(rawRes.status).toBe(200);
    const rawQuote = rawRes.body.data[0];
    expect(rawQuote.line_origin).toBe("raw");
    expect(String(rawQuote.text_persian).includes("\n")).toBe(false);

    // Step 4: Reader explores available categories
    const categoriesRes = await e2eJson("/api/categories");
    expect(categoriesRes.status).toBe(200);
    expect(categoriesRes.body.data.length).toBeGreaterThan(0);
    const firstCategory = categoriesRes.body.data[0];

    // Step 5: Reader drills down into poems for that category
    const catEncoded = encodeURIComponent(firstCategory.name_persian);
    const categoryQuotes = await e2eJson(`/api/quotes/category/${catEncoded}?limit=3`);
    expect(categoryQuotes.status).toBe(200);
    expect(decodeURIComponent(categoryQuotes.body.category)).toBe(firstCategory.name_persian);
    expect(Array.isArray(categoryQuotes.body.data)).toBe(true);
  });

  test("T4-SCENARIO-04: Non-poetry aphorism reading and data hygiene audit", async () => {
    // Reader fetches aphorisms and checks data integrity metadata
    const aphorisms = await e2eJson("/api/quotes/non-poetry?limit=5");
    expect(aphorisms.status).toBe(200);
    expect(aphorisms.body.success).toBe(true);
    expect(aphorisms.body.data.length).toBe(5);

    expect(aphorisms.body.meta).toBeDefined();
    expect(aphorisms.body.meta.raw).toBeGreaterThan(0);
    expect(aphorisms.body.meta.dropped).toBeGreaterThanOrEqual(0);

    for (const item of aphorisms.body.data) {
      expect(item.text_persian).toBeDefined();
      expect(item.author).toBeDefined();
      assertPersianTypography(item.text_persian);
    }
  });
});
