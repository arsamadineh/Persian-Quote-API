import { describe, test, expect } from "bun:test";
import { e2eJson, e2eFetch } from "../harness";

describe("Tier 1 E2E: Error Contracts & Edge Handlers", () => {
  test("T1-ERR-01: Non-existent route returns 404 Not Found", async () => {
    const { status, body } = await e2eJson("/api/does-not-exist");

    expect(status).toBe(404);
    expect(body.error).toBe("Not Found");
    expect(body.message).toContain("Route not found");
  });

  test("T1-ERR-02: Non-existent poet in embed returns 404 with Persian error message", async () => {
    const { status, body } = await e2eJson("/api/embed?poet=nonexistent_poet_xyz");

    expect(status).toBe(404);
    expect(body.error).toContain("شاعر یا دسته‌بندی مورد نظر یافت نشد");
  });

  test("T1-ERR-03: Unsupported HTTP method on read-only route returns 404 route not found", async () => {
    const { status, body } = await e2eJson("/api/quotes", { method: "POST", body: { text: "test" } });

    expect(status).toBe(404);
    expect(body.error).toBe("Not Found");
  });

  test("T1-ERR-04: Non-existent poet on /api/quotes/[poet] returns empty data array gracefully", async () => {
    const { status, body } = await e2eJson("/api/quotes/nonexistent_poet_12345");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(0);
    expect(body.count).toBe(0);
  });

  test("T1-ERR-05: Non-existent category on /api/quotes/category/[category] returns empty data array gracefully", async () => {
    const { status, body } = await e2eJson("/api/quotes/category/nonexistent_category_xyz");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(0);
    expect(body.count).toBe(0);
  });
});
