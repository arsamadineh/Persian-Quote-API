import { describe, test, expect } from "bun:test";
import { e2eJson } from "../harness";

describe("Tier 2 E2E: Parameter Pollution & Encoding Stress", () => {
  test("T2-POLLUTE-01: Duplicate query parameters handled safely without crash", async () => {
    const { status, body } = await e2eJson("/api/quotes?limit=5&limit=2");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("T2-POLLUTE-02: Whitespace-padded query strings are trimmed correctly", async () => {
    const query = encodeURIComponent("   حافظ   ");
    const { status, body } = await e2eJson(`/api/quotes/search?q=${query}&limit=5`);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  test("T2-POLLUTE-03: Empty search query falls back to paginated dataset without error", async () => {
    const { status, body } = await e2eJson("/api/quotes/search?q=");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(10);
    expect(body.query).toBe("");
  });

  test("T2-POLLUTE-04: Unknown extra query parameters are ignored gracefully", async () => {
    const { status, body } = await e2eJson("/api/quotes?unknown_param_xyz=12345&hack_attempt=true&limit=5");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.limit).toBe(5);
    expect(body.data.length).toBe(5);
    // Extra parameters must not leak into top-level response keys
    expect(body).not.toHaveProperty("unknown_param_xyz");
    expect(body).not.toHaveProperty("hack_attempt");
  });

  test("T2-POLLUTE-05: Path traversal or dot-dot attempts in path fail safely with 404", async () => {
    const { status } = await e2eJson("/api/quotes/../../etc/passwd");

    // Must never return 200 or leak files
    expect([400, 404]).toContain(status);
  });
});
