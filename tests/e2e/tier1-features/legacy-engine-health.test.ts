import { describe, test, expect } from "bun:test";
import { e2eJson, e2eFetch } from "../harness";

describe("Tier 1 E2E: Legacy Engine, Health & Metrics", () => {
  test("T1-HEALTH-01: GET /api/health reports engine status and dataset counts", async () => {
    const { status, body, headers } = await e2eJson("/api/health");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("ok");
    expect(body.data.engine).toContain("تیغ");
    expect(typeof body.data.uptimeMs).toBe("number");
    expect(body.data.datasets).toBeDefined();
    expect(body.data.datasets.poetry).toBeGreaterThan(0);
    expect(body.data.datasets.hafez).toBeGreaterThan(0);
    expect(body.data.datasets.shereno).toBeGreaterThan(0);

    const cacheControl = headers.get("cache-control") || "";
    expect(cacheControl).toContain("no-store");
  });

  test("T1-STATS-01: GET /api/stats reports comprehensive platform statistics", async () => {
    const { status, body } = await e2eJson("/api/stats");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.total).toBeGreaterThan(0);
    expect(body.engine).toBeDefined();
    expect(body.engine.name).toBe("تیغ");
    expect(body.dataIntegrity).toBeDefined();
    expect(body.dataIntegrity.status).toBeDefined();
  });

  test("T1-ENGINE-STATS-01: GET /api/engine/stats returns granular telemetry and latency", async () => {
    const { status, body } = await e2eJson("/api/engine/stats");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.engine).toBe("تیغ");
    expect(body.data).toBeDefined();
    expect(body.data.totals).toBeDefined();
    expect(body.data.engine).toBeDefined();
    expect(body.data.engine.latency).toBeDefined();
    expect(body.data.engine.cache).toBeDefined();
    expect(typeof body.data.engine.cache.hitRate).toBe("number");
  });

  test("T1-ENGINE-BENCH-01: GET /api/engine/benchmark measures router and cache operations", async () => {
    const { status, body } = await e2eJson("/api/engine/benchmark?iterations=50");

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.benchmark).toBeDefined();
    expect(body.benchmark.summary).toBeDefined();
    expect(typeof body.benchmark.summary.routerNsPerOp).toBe("number");
    expect(typeof body.benchmark.summary.cacheGetNsPerOp).toBe("number");
  });

  test("T1-CORS-01: API responses include permissive CORS headers", async () => {
    const response = await e2eFetch("/api/quotes?limit=1");
    const origin = response.headers.get("access-control-allow-origin");
    expect(origin).toBe("*");
  });

  test("T1-CORS-02: OPTIONS preflight returns 204 with CORS headers", async () => {
    const response = await e2eFetch("/api/quotes", { method: "OPTIONS" });
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    const methods = response.headers.get("access-control-allow-methods") || "";
    expect(methods).toContain("OPTIONS");
    expect(methods).toContain("GET");
    const headers = response.headers.get("access-control-allow-headers") || "";
    expect(headers).toContain("Content-Type");
    expect(response.headers.get("access-control-max-age")).toBe("86400");
  });
});
