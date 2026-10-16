import { describe, test, expect } from "bun:test";
import { e2eJson } from "../harness";

describe("Tier 3 E2E: Query Parameter Matrix Combinations", () => {
  test("T3-MATRIX-01: lines=raw + poet + limit=5 returns unformatted lines filtered by poet", async () => {
    const poet = encodeURIComponent("سهراب سپهری");
    const { status, body } = await e2eJson(`/api/quotes/shereno?poet=${poet}&lines=raw&limit=5`);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.line_mode).toBe("raw");
    expect(body.data.length).toBeLessThanOrEqual(5);

    for (const quote of body.data) {
      expect(quote.poet).toContain("سهراب سپهری");
      expect(quote.line_origin).toBe("raw");
      expect(String(quote.text_persian).includes("\n")).toBe(false);
    }
  });

  test("T3-MATRIX-02: lines=separators + limit=5 on shereno returns only source separators", async () => {
    const { status, body } = await e2eJson("/api/quotes/shereno?lines=separators&limit=5");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.line_mode).toBe("separators");
    expect(body.data.length).toBe(5);

    for (const quote of body.data) {
      expect(["separators", "flat"]).toContain(quote.line_origin);
    }
  });

  test("T3-MATRIX-03: lines=auto + random=true + limit=3 returns fresh sample with no-store cache", async () => {
    const { status, body, headers } = await e2eJson("/api/quotes/shereno?lines=auto&random=true&limit=3");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.length).toBe(3);
    expect(body.line_mode).toBe("auto");

    const cacheControl = headers.get("cache-control") || "";
    expect(cacheControl).toContain("no-store");
  });

  test("T3-MATRIX-04: Multi-term search q + limit=3 + page=2 navigates paginated search results", async () => {
    const query = encodeURIComponent("عشق جانان");
    const page1 = await e2eJson(`/api/quotes/search?q=${query}&limit=3&page=1`);
    const page2 = await e2eJson(`/api/quotes/search?q=${query}&limit=3&page=2`);

    expect(page1.status).toBe(200);
    expect(page2.status).toBe(200);
    expect(page1.body.page).toBe(1);
    expect(page2.body.page).toBe(2);

    if (page1.body.data.length > 0 && page2.body.data.length > 0) {
      // First quote of page 1 and page 2 should not be identical if enough results exist
      const id1 = page1.body.data[0].id ?? page1.body.data[0].text_persian;
      const id2 = page2.body.data[0].id ?? page2.body.data[0].text_persian;
      expect(id1).not.toBe(id2);
    }
  });
});
