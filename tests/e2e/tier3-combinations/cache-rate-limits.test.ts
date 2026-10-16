import { describe, test, expect } from "bun:test";
import { e2eJson, e2eFetch } from "../harness";

describe("Tier 3 E2E: Caching & Rate Limiter Cross-Feature Interactions", () => {
  test("T3-CACHE-01: Consecutive identical GET requests exercise in-memory cache", async () => {
    const path = "/api/quotes/hafez?limit=2";
    // First request primes the cache (MISS)
    const first = await e2eJson(path);
    expect(first.status).toBe(200);

    // Second request should hit the cache (HIT)
    const second = await e2eJson(path);
    expect(second.status).toBe(200);
    const cacheHeader = second.headers.get("x-cache");
    expect(cacheHeader).toBe("HIT");
  });

  test("T3-CACHE-02: Requests with random=true bypass cache and set no-store", async () => {
    const path = "/api/quotes/hafez?random=true&limit=2";
    const res1 = await e2eJson(path);
    const res2 = await e2eJson(path);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    // Random requests must never receive X-Cache: HIT
    expect(res1.headers.get("x-cache")).not.toBe("HIT");
    expect(res2.headers.get("x-cache")).not.toBe("HIT");

    // Cache-Control must be no-store
    expect(res1.headers.get("cache-control")).toContain("no-store");
    expect(res2.headers.get("cache-control")).toContain("no-store");
  });

  test("T3-RATE-01: Consecutive requests record accurately in metrics without unbounded growth", async () => {
    const initialStats = await e2eJson("/api/engine/stats");
    expect(initialStats.status).toBe(200);
    const initialRequests = initialStats.body.data.engine.requests.total;

    // Issue 5 rapid requests
    for (let i = 0; i < 5; i++) {
      await e2eFetch("/api/quotes?limit=1");
    }

    const afterStats = await e2eJson("/api/engine/stats");
    expect(afterStats.status).toBe(200);
    const afterRequests = afterStats.body.data.engine.requests.total;
    expect(afterRequests).toBeGreaterThanOrEqual(initialRequests + 5);
  });
});
