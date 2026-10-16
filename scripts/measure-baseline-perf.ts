import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";
const OUT_FILE = path.resolve(process.cwd(), "docs/evidence/phase-0/performance/baseline.json");
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });

function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function benchmarkEndpoint(endpoint: string, count = 500) {
  // Warmup
  for (let i = 0; i < 20; i++) {
    await fetch(`${BASE_URL}${endpoint}`);
  }

  const timings: number[] = [];
  for (let i = 0; i < count; i++) {
    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}${endpoint}`);
    await res.text();
    timings.push(performance.now() - t0);
  }

  const sum = timings.reduce((a, b) => a + b, 0);
  return {
    endpoint,
    samples: count,
    avgMs: Number((sum / count).toFixed(3)),
    minMs: Number(Math.min(...timings).toFixed(3)),
    maxMs: Number(Math.max(...timings).toFixed(3)),
    p50Ms: Number(percentile(timings, 50).toFixed(3)),
    p90Ms: Number(percentile(timings, 90).toFixed(3)),
    p95Ms: Number(percentile(timings, 95).toFixed(3)),
    p99Ms: Number(percentile(timings, 99).toFixed(3)),
  };
}

async function measureColdStart() {
  const testPort = 3011;
  const testUrl = `http://127.0.0.1:${testPort}`;
  console.log(`[COLD-START] Measuring cold start on port ${testPort}...`);

  const tStart = performance.now();
  const server = spawn("bun", ["run", "start", "-p", String(testPort)], {
    cwd: process.cwd(),
    stdio: "ignore",
    detached: false,
  });

  let healthColdStartMs = -1;
  let hafezColdStartMs = -1;

  try {
    // Poll until health responds
    while (performance.now() - tStart < 15000) {
      try {
        const res = await fetch(`${testUrl}/api/health`, { signal: AbortSignal.timeout(500) });
        if (res.status === 200) {
          healthColdStartMs = Number((performance.now() - tStart).toFixed(2));
          break;
        }
      } catch {
        await new Promise((r) => setTimeout(r, 20));
      }
    }

    const tHafez0 = performance.now();
    const hafezRes = await fetch(`${testUrl}/api/quotes/hafez?limit=1`);
    await hafezRes.text();
    hafezColdStartMs = Number((performance.now() - tHafez0).toFixed(2));
  } finally {
    server.kill("SIGTERM");
  }

  console.log(`[COLD-START] Health cold start: ${healthColdStartMs} ms, First dataset query: ${hafezColdStartMs} ms`);
  return {
    serverBootToHealthFirstByteMs: healthColdStartMs,
    firstDatasetQueryLatencyMs: hafezColdStartMs,
  };
}

async function run() {
  console.log("[PERF] Starting baseline performance measurements...");

  // 1. Cold start
  const coldStart = await measureColdStart();

  // 2. Memory baseline (from stats endpoint)
  const initialStatsRes = await fetch(`${BASE_URL}/api/engine/stats`);
  const initialStats = await initialStatsRes.json();

  // 3. Warm latency benchmarks
  const endpoints = [
    "/api/health",
    "/api/stats",
    "/api/quotes/hafez?limit=5",
    "/api/quotes/shereno?limit=5",
    "/api/quotes/search?q=" + encodeURIComponent("عشق") + "&limit=5",
    "/api/poets",
  ];

  const results: Record<string, any> = {};
  for (const ep of endpoints) {
    console.log(`[PERF] Benchmarking ${ep} (500 requests)...`);
    results[ep] = await benchmarkEndpoint(ep, 500);
  }

  // 4. Memory post-traffic
  const postStatsRes = await fetch(`${BASE_URL}/api/engine/stats`);
  const postStats = await postStatsRes.json();

  // 5. Engine router microbenchmark
  console.log("[PERF] Running router and cache microbenchmark...");
  const benchRes = await fetch(`${BASE_URL}/api/engine/benchmark?iterations=5000`);
  const benchData = await benchRes.json();

  const output = {
    timestamp: new Date().toISOString(),
    environment: {
      bun: Bun.version,
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    coldStart,
    memoryProfile: {
      initial: initialStats.metrics?.memory,
      postBenchmarks: postStats.metrics?.memory,
      processResidentSetSizeBytes: process.memoryUsage().rss,
      heapUsedBytes: process.memoryUsage().heapUsed,
    },
    engineMicrobenchmark: benchData,
    latencyBenchmarks: results,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(`[PERF] Baseline performance saved to ${OUT_FILE}`);
}

run().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
