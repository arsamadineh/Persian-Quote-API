#!/usr/bin/env bun
/**
 * Standalone E2E Test Runner for Persian Quote API Rebuild.
 * Executes all 4 tiers of requirement-driven opaque-box tests.
 * Usage:
 *   bun run tests/e2e/runner.ts
 *   TEST_BASE_URL=http://localhost:3000 bun run tests/e2e/runner.ts
 */

import { spawn } from "node:child_process";

interface TierRun {
  tier: string;
  name: string;
  dir: string;
}

const TIERS: TierRun[] = [
  { tier: "Tier 1", name: "Feature Coverage", dir: "tests/e2e/tier1-features/" },
  { tier: "Tier 2", name: "Boundary & Corner Cases", dir: "tests/e2e/tier2-boundaries/" },
  { tier: "Tier 3", name: "Pairwise Combinations", dir: "tests/e2e/tier3-combinations/" },
  { tier: "Tier 4", name: "Real-World Scenarios", dir: "tests/e2e/tier4-scenarios/" },
];

async function runCommand(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn("bun", args, {
      env: { ...process.env },
      stdio: ["inherit", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (d) => {
      stdout += d.toString();
      process.stdout.write(d);
    });

    child.stderr?.on("data", (d) => {
      stderr += d.toString();
      process.stderr.write(d);
    });

    child.on("close", (code) => {
      resolve({ code: code ?? 0, stdout, stderr });
    });
  });
}

async function main() {
  console.log("================================================================================");
  console.log("             PERSIAN QUOTE API — E2E TEST RUNNER (TIERS 1-4)");
  console.log("================================================================================");
  console.log(`Execution Mode: ${process.env.TEST_BASE_URL ? `Network (${process.env.TEST_BASE_URL})` : "In-Memory Adapter"}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log("--------------------------------------------------------------------------------\n");

  const startTime = Date.now();
  let totalFailed = 0;

  for (const item of TIERS) {
    console.log(`\n>>> Running [${item.tier}: ${item.name}] from ${item.dir}...`);
    const { code } = await runCommand(["test", item.dir]);
    if (code !== 0) {
      totalFailed++;
      console.error(`FAILED: ${item.tier} finished with exit code ${code}`);
    } else {
      console.log(`PASSED: ${item.tier} completed successfully.`);
    }
  }

  const durationMs = Date.now() - startTime;
  console.log("\n================================================================================");
  console.log("                         E2E TEST SUMMARY");
  console.log("================================================================================");
  console.log(`Total Tiers Executed: ${TIERS.length}`);
  console.log(`Tiers Passed:         ${TIERS.length - totalFailed}`);
  console.log(`Tiers Failed:         ${totalFailed}`);
  console.log(`Total Duration:       ${(durationMs / 1000).toFixed(2)}s`);
  console.log("================================================================================");

  if (totalFailed > 0) {
    console.error(`E2E Test Runner failed with ${totalFailed} failing tier(s).`);
    process.exit(1);
  } else {
    console.log("ALL E2E TEST TIERS COMPLETED SUCCESSFULLY (100% PASS RATE).");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Runner execution fatal error:", err);
  process.exit(1);
});
