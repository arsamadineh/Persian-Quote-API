import { describe, test, expect } from "bun:test";
import { e2eJson, e2eFetch, assertPersianTypography } from "../harness";

describe("Tier 1 E2E: Legacy Poets, Categories & Embed", () => {
  test("T1-POETS-01: GET /api/poets returns complete poet registry with count", async () => {
    const { status, body } = await e2eJson("/api/poets");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.count).toBe(body.data.length);
    expect(body.count).toBeGreaterThan(5);

    const first = body.data[0];
    expect(first).toHaveProperty("name_persian");
    expect(first).toHaveProperty("quote_count");
    expect(typeof first.quote_count).toBe("number");
    expect(first.quote_count).toBeGreaterThan(0);
  });

  test("T1-CATEGORIES-01: GET /api/categories returns distinct categories list", async () => {
    const { status, body } = await e2eJson("/api/categories");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.count).toBe(body.data.length);
    expect(body.count).toBeGreaterThan(0);

    const first = body.data[0];
    expect(first).toHaveProperty("name_persian");
    expect(first).toHaveProperty("quote_count");
  });

  test("T1-EMBED-01: GET /api/embed returns rendered HTML widget with Persian text", async () => {
    const response = await e2eFetch("/api/embed");
    const status = response.status;
    const contentType = response.headers.get("content-type") || "";
    const html = await response.text();

    expect(status).toBe(200);
    expect(contentType).toContain("text/html");
    expect(html).toContain("persian-quote-widget");
    expect(html).toContain("quote-text");
    expect(html).toContain("quote-poet");
    assertPersianTypography(html);
  });

  test("T1-EMBED-02: GET /api/embed?theme=classic applies requested theme", async () => {
    const response = await e2eFetch("/api/embed?theme=classic&size=small");
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("persian-quote-widget");
    expect(html).toContain("quote-attribution");
  });

  test("T1-EMBED-03: GET /api/embed?poet=سعدی filters embed quote to requested poet", async () => {
    const poetEncoded = encodeURIComponent("سعدی");
    const response = await e2eFetch(`/api/embed?poet=${poetEncoded}`);
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("سعدی");
  });
});
