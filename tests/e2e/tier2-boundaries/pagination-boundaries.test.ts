import { describe, test, expect } from "bun:test";
import { e2eJson } from "../harness";

describe("Tier 2 E2E: Pagination & Limit Boundaries", () => {
  test("T2-PAGE-01: Negative or zero limit is clamped to minimum (1)", async () => {
    const { status, body } = await e2eJson("/api/quotes?limit=-10");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.limit).toBe(1);
    expect(body.data.length).toBe(1);
  });

  test("T2-PAGE-02: Excessive limit (9999) is clamped to maximum (100)", async () => {
    const { status, body } = await e2eJson("/api/quotes?limit=9999");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.limit).toBe(100);
    expect(body.data.length).toBeLessThanOrEqual(100);
  });

  test("T2-PAGE-03: Zero or negative page defaults safely to page 1", async () => {
    const { status, body } = await e2eJson("/api/quotes?page=0&limit=5");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.page).toBe(1);
    expect(body.data.length).toBe(5);
  });

  test("T2-PAGE-04: Non-numeric limit defaults to default limit 10", async () => {
    const { status, body } = await e2eJson("/api/quotes/hafez?limit=invalid_abc");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.limit).toBe(10);
    expect(body.data.length).toBe(10);
  });

  test("T2-PAGE-05: Page number beyond total dataset returns empty array gracefully", async () => {
    const { status, body } = await e2eJson("/api/quotes?page=999999&limit=10");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(0);
    expect(body.count).toBe(0);
    expect(body.page).toBe(999999);
  });
});
