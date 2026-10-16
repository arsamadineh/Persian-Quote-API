import { describe, test, expect } from "bun:test";
import { e2eJson, assertPersianTypography } from "../harness";

describe("Tier 1 E2E: Legacy Quote Endpoints", () => {
  test("T1-LEGACY-01: GET /api/quotes returns paginated quote list with correct contract", async () => {
    const { status, body, headers } = await e2eJson("/api/quotes?limit=10&page=1");

    expect(status).toBe(200);
    expect(headers.get("content-type")).toContain("application/json");
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.count).toBe(body.data.length);
    expect(typeof body.total).toBe("number");
    expect(body.total).toBeGreaterThan(0);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(10);
    expect(body.line_mode).toBe("auto");

    const first = body.data[0];
    expect(first).toHaveProperty("poet");
    expect(first).toHaveProperty("text_persian");
    assertPersianTypography(String(first.text_persian));
  });

  test("T1-LEGACY-02: GET /api/quotes/hafez returns Hafez ghazals", async () => {
    const { status, body } = await e2eJson("/api/quotes/hafez?limit=5");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(5);
    for (const quote of body.data) {
      expect(quote.poet).toContain("حافظ");
      expect(typeof quote.text_persian).toBe("string");
      assertPersianTypography(quote.text_persian);
    }
  });

  test("T1-LEGACY-03: GET /api/quotes/shereno returns modern verse with line layout and origin", async () => {
    const { status, body } = await e2eJson("/api/quotes/shereno?limit=5");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(5);
    expect(body.line_mode).toBe("auto");
    expect(body.meta?.note).toBeDefined();

    for (const quote of body.data) {
      expect(quote).toHaveProperty("line_origin");
      expect(["raw", "flat", "separators", "reconstructed"]).toContain(quote.line_origin);
      expect(typeof quote.text_persian).toBe("string");
    }
  });

  test("T1-LEGACY-04: GET /api/quotes/non-poetry returns cleaned aphorisms with metadata", async () => {
    const { status, body } = await e2eJson("/api/quotes/non-poetry?limit=5");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(5);
    expect(body.meta).toBeDefined();
    expect(typeof body.meta.raw).toBe("number");
    expect(typeof body.meta.dropped).toBe("number");
  });

  test("T1-LEGACY-05: GET /api/quotes/search returns ranked search matches", async () => {
    const { status, body } = await e2eJson("/api/quotes/search?q=%D8%B9%D8%B4%D9%82&limit=5");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.query).toBe("عشق");

    // Results must contain query in text, poet, or title
    const matchesQuery = body.data.some(
      (q: any) =>
        q.text_persian?.includes("عشق") ||
        q.poet?.includes("عشق") ||
        q.title?.includes("عشق")
    );
    expect(matchesQuery).toBe(true);
  });

  test("T1-LEGACY-06: GET /api/quotes/[poet] filters specifically for given poet", async () => {
    const poetEncoded = encodeURIComponent("حافظ");
    const { status, body } = await e2eJson(`/api/quotes/${poetEncoded}?limit=5`);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(decodeURIComponent(body.poet)).toBe("حافظ");
    expect(body.data.length).toBeGreaterThan(0);
    for (const item of body.data) {
      expect(item.poet).toContain("حافظ");
    }
  });

  test("T1-LEGACY-07: GET /api/quotes/category/[category] filters by category", async () => {
    const categoryEncoded = encodeURIComponent("عرفانی");
    const { status, body } = await e2eJson(`/api/quotes/category/${categoryEncoded}?limit=5`);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(decodeURIComponent(body.category)).toBe("عرفانی");
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("T1-LEGACY-08: GET /api/quotes?random=true sets no-store cache header and returns data", async () => {
    const { status, body, headers } = await e2eJson("/api/quotes?random=true&limit=3");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.length).toBe(3);
    const cacheControl = headers.get("cache-control") || "";
    expect(cacheControl).toContain("no-store");
  });
});
