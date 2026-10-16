import { describe, test, expect } from "bun:test";
import { e2eJson, e2eFetch, assertPersianTypography } from "../harness";

describe("Tier 4 E2E Scenario: Hafez Divination & Widget Workflow", () => {
  test("T4-SCENARIO-01: End-to-end user ritual from health check to Hafez divination and iframe embedding", async () => {
    // Step 1: Client checks service health
    const health = await e2eJson("/api/health");
    expect(health.status).toBe(200);
    expect(health.body.success).toBe(true);
    expect(health.body.data.status).toBe("ok");

    // Step 2: Client performs Hafez divination (fal) by requesting a random ghazal
    const fal = await e2eJson("/api/quotes/hafez?random=true&limit=1");
    expect(fal.status).toBe(200);
    expect(fal.body.success).toBe(true);
    expect(fal.body.data.length).toBe(1);

    const ghazal = fal.body.data[0];
    expect(ghazal.poet).toContain("حافظ");
    expect(typeof ghazal.text_persian).toBe("string");
    expect(ghazal.text_persian.length).toBeGreaterThan(10);
    assertPersianTypography(ghazal.text_persian);

    // Step 3: Client generates and fetches an embed widget for this poet
    const poetParam = encodeURIComponent("حافظ");
    const widgetRes = await e2eFetch(`/api/embed?poet=${poetParam}&theme=elegant`);
    expect(widgetRes.status).toBe(200);
    expect(widgetRes.headers.get("content-type")).toContain("text/html");

    const html = await widgetRes.text();
    expect(html).toContain("persian-quote-widget");
    expect(html).toContain("quote-text");
    expect(html).toContain("حافظ");
    expect(html).toContain("quote-attribution");
  });

  test("T4-SCENARIO-02: User searches Hafez by philosophical theme and receives ranked verses", async () => {
    const query = encodeURIComponent("صبر و ظفر");
    const searchRes = await e2eJson(`/api/quotes/search?q=${query}&limit=3`);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.success).toBe(true);
    expect(Array.isArray(searchRes.body.data)).toBe(true);
    expect(searchRes.body.data.length).toBeGreaterThan(0);

    for (const item of searchRes.body.data) {
      assertPersianTypography(item.text_persian);
    }
  });
});
