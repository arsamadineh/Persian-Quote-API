# Phase 0 Safety Net and Environment Readiness Report

## 1. Observation

### 1.1 Runtime Environment
- **Bun Version**: `1.4.3` (Commit `c6da4a4d3`). Verified via `bun --version`.
- **Node Version**: `v26.10.0`. Verified via `node --version`.
- **Git State**:
  - Current branch: `main`.
  - Upstream status: Ahead of `origin/main` by 2 commits.
  - Untracked files: `.agents/` and `PROJECT_SUMMARY.md`. No unstaged or staged modifications in working directory.
- **Package Scripts** (`package.json` lines 5–11):
  ```json
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "lint": "next lint",
    "start": "next start",
    "test": "bun test"
  }
  ```
- **Dependencies**: Initially `node_modules` was absent. Running `bun install` resolved and linked 316 packages in 49.42 seconds from local cache without lockfile conflicts.

### 1.2 Legacy Datasets Census (`lib/data/*.json`)
Exact measurements taken directly from disk using `sha256sum`, byte counts, and JSON parser analysis:

| File Path | Byte Size | Line Count | Raw Record Count | Active Store Count | SHA-256 Checksum | Top-Level Record Keys |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `lib/data/hafez.json` | 694,755 | 20,221 | 497 | 497 | `d1bba4d76fc191150da6114cabd6b6eb94338ea08ce61e31b72fba1510064572` | `id`, `title`, `poet`, `verses` |
| `lib/data/non-poetry-quotes.json` | 214,737 | 2,472 | 494 | 492 | `e8649722cec2a8cc3dbb9da035989643973d5922e406e6b7f3e60fd3a746dd25` | `id`, `body`, `author` |
| `lib/data/poetry-quotes.json` | 3,110 | 73 | 7 | 7 | `90e007c504cf94f18bb153a79416ac9fd8cb0db492ad3d437d62b0e72083c7f9` | `id`, `text_persian`, `text_english`, `poet`, `poet_english`, `source`, `category`, `tags` |
| `lib/data/shereno.json` | 5,981,895 | 1 (minified) | 4,400 | 4,400 | `fe0818cd5ea807c39e131bdca3780828bee3da7827b3eed8a185d512f4ce606b` | `id`, `poem`, `poet`, `title`, `book` |
| **Total** | **6,894,497** (~6.57 MB) | **22,767** | **5,398** | **5,396** | N/A | Total records in raw JSON: 5,398 |

*Data Note*: `lib/data/store.ts` (lines 92–96 and 184–189) automatically cleans `non-poetry-quotes.json` on load, discarding 2 records identified as empty or duplicate (`nonPoetryRaw = 494`, `nonPoetryClean = 492`, `nonPoetryDropped = 2`).

### 1.3 Test Tools & Browser Readiness
- **Bun Test**:
  - Command: `bun test`
  - Result: 30 passed, 0 failed, 70 expect() calls across 3 test files in 1.28s.
  - Test suites:
    1. `tests/store.test.ts` (8 tests)
    2. `tests/engine.test.ts` (7 tests)
    3. `tests/poem-lines.test.ts` (15 tests)
- **Playwright & Browsers**:
  - `playwright` CLI version 1.64.1 is cached.
  - System browser: `/usr/bin/google-chrome-stable` (Google Chrome 155.0.8059.79) is installed locally.
  - Headless test verified via:
    `bun -e "import { chromium } from 'playwright'; const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome-stable', args: ['--no-sandbox'] }); console.log(browser.version()); await browser.close();"`
    Result: Successfully launched and exited cleanly with version `155.0.8059.79`. No extra browser download required.

### 1.4 Production Build & Server Execution
- **Build**: `bun run build` completed with exit code 0.
  - Route tree: 16 routes compiled (9 static pages, 14 dynamic API endpoints, 3 icons/manifests).
  - First load shared JS: 101 kB.
- **Server Execution**:
  - Started via `bun run start -p 3009`.
  - HTTP `GET http://127.0.0.1:3009/api/health` returned:
    `{"success":true,"data":{"status":"ok","engine":"تیغ/0.0.1-beta","instanceId":"...","uptimeMs":1452,"datasets":{"poetry":7,"hafez":497,"nonPoetry":492,"shereno":4400,"total":5396},"cache":{"hits":0,"misses":0,"hitRate":0,"size":0,"memoryBytes":0},"timestamp":1792115793001}}`
  - HTTP `GET http://127.0.0.1:3009/api/quotes/hafez?limit=1` returned the expected ghazal record (`h-2`).

---

## 2. Logic Chain

1. **Safety Net Dependency Chain**:
   - In accordance with rule R5 ("Never delete data. Keep byte-identical snapshot of original JSON under data/legacy/ with SHA-256 checksums") and R6 ("Backward compatibility... Record legacy contract snapshots in Phase 0"), Phase 0 execution requires immutable preservation of input datasets and recording contract snapshots before any architecture or engine restructuring commences.
   - The exact sha256 checksums and record counts established in Observation 1.2 provide the baseline against which `data/legacy/` will be validated.

2. **Visual Regression Readiness**:
   - In accordance with rule R18 ("Do not break production UI. Capture Playwright screenshots before changing anything (Phase 0) and compare after"), visual baselines must be captured across all 9 existing routes.
   - Observation 1.3 confirms that `/usr/bin/google-chrome-stable` (v155) is directly usable by Playwright without downloading external binaries.
   - Therefore, headless screenshot capture can execute in local CI/offline environments immediately.

3. **Production Server Validation**:
   - Observation 1.4 verifies that `next build` and `next start` operate cleanly.
   - Consequently, both golden contract capture and baseline latency measurements can be executed directly against a live local server instance on `http://127.0.0.1:3000`.

---

## 3. Caveats

1. **Non-Poetry Deduplication Discrepancy**:
   - `lib/data/non-poetry-quotes.json` contains 494 JSON objects, but `lib/data/store.ts` loads only 492. When snapshotting to `data/legacy/`, the raw file with 494 records (hash `e8649722cec2a8cc3dbb9da035989643973d5922e406e6b7f3e60fd3a746dd25`) must be stored byte-for-byte, while `manifest.json` and `00-recon.md` document why `store.ts` drops 2 records.
2. **Git Branch Discipline**:
   - The repository is currently on `main`. Per rule R9 ("Branch rebuild/v1"), Phase 0 execution must create and switch to branch `rebuild/v1` prior to committing snapshots or baseline artifacts.
3. **Randomness in Endpoints**:
   - Legacy endpoints (`/api/quotes`, `/api/quotes/hafez`, etc.) default to random sorting unless `random=false` or specific pagination parameters are passed. Golden contract recordings must explicitly supply deterministic query parameters (e.g. `random=false&limit=5&page=1`) alongside default calls to ensure replayable verification.

---

## 4. Conclusion & Exact Phase 0 Execution Plan

The environment is fully validated and ready for Phase 0 execution. Below are the exact commands, scripts, protocols, and document structures for Phase 0.

### 4.1 Plan Component 1: Legacy Data Snapshot Command & Verification
Run the following deterministic bash script to create `data/legacy/` and freeze the 4 datasets:

```bash
#!/usr/bin/env bash
set -euo pipefail

# 1. Create target directory
mkdir -p data/legacy

# 2. Copy byte-identical legacy datasets
cp lib/data/hafez.json data/legacy/hafez.json
cp lib/data/non-poetry-quotes.json data/legacy/non-poetry-quotes.json
cp lib/data/poetry-quotes.json data/legacy/poetry-quotes.json
cp lib/data/shereno.json data/legacy/shereno.json

# 3. Generate SHA256 checksum manifest
cd data/legacy
sha256sum hafez.json non-poetry-quotes.json poetry-quotes.json shereno.json > SHA256SUMS

# 4. Verify checksums match exactly
sha256sum -c SHA256SUMS
cd ../..

# 5. Lock down file permissions to read-only
chmod 444 data/legacy/*.json data/legacy/SHA256SUMS
```

Create `data/legacy/manifest.json`:
```json
{
  "snapshotTimestamp": "2026-10-16T02:00:00Z",
  "files": [
    {
      "filename": "hafez.json",
      "path": "data/legacy/hafez.json",
      "sizeBytes": 694755,
      "lineCount": 20221,
      "recordCount": 497,
      "sha256": "d1bba4d76fc191150da6114cabd6b6eb94338ea08ce61e31b72fba1510064572",
      "keys": ["id", "title", "poet", "verses"]
    },
    {
      "filename": "non-poetry-quotes.json",
      "path": "data/legacy/non-poetry-quotes.json",
      "sizeBytes": 214737,
      "lineCount": 2472,
      "recordCount": 494,
      "activeStoreCount": 492,
      "droppedRecords": 2,
      "sha256": "e8649722cec2a8cc3dbb9da035989643973d5922e406e6b7f3e60fd3a746dd25",
      "keys": ["id", "body", "author"]
    },
    {
      "filename": "poetry-quotes.json",
      "path": "data/legacy/poetry-quotes.json",
      "sizeBytes": 3110,
      "lineCount": 73,
      "recordCount": 7,
      "sha256": "90e007c504cf94f18bb153a79416ac9fd8cb0db492ad3d437d62b0e72083c7f9",
      "keys": ["id", "text_persian", "text_english", "poet", "poet_english", "source", "category", "tags"]
    },
    {
      "filename": "shereno.json",
      "path": "data/legacy/shereno.json",
      "sizeBytes": 5981895,
      "lineCount": 1,
      "recordCount": 4400,
      "sha256": "fe0818cd5ea807c39e131bdca3780828bee3da7827b3eed8a185d512f4ce606b",
      "keys": ["id", "poem", "poet", "title", "book"]
    }
  ],
  "totals": {
    "fileCount": 4,
    "totalSizeBytes": 6894497,
    "totalRawRecords": 5398,
    "totalActiveRecords": 5396
  }
}
```

---

### 4.2 Plan Component 2: Golden Contract Recorder Script
The script `scripts/record-golden-contracts.ts` queries each legacy endpoint with deterministic parameters and saves the contract snapshot into `data/golden/contracts/<route-slug>.json`.

Target endpoint matrix (30 contract test cases):
1. `GET /api/quotes`
2. `GET /api/quotes?random=false&limit=5&page=1`
3. `GET /api/quotes?lines=auto&limit=3&random=false`
4. `GET /api/quotes?lines=separators&limit=3&random=false`
5. `GET /api/quotes?lines=raw&limit=3&random=false`
6. `GET /api/quotes/hafez`
7. `GET /api/quotes/hafez?random=false&limit=3`
8. `GET /api/quotes/hafez?lines=separators&random=false&limit=3`
9. `GET /api/quotes/hafez?lines=raw&random=false&limit=3`
10. `GET /api/quotes/non-poetry`
11. `GET /api/quotes/non-poetry?random=false&limit=3`
12. `GET /api/quotes/shereno`
13. `GET /api/quotes/shereno?random=false&limit=3`
14. `GET /api/quotes/shereno?lines=auto&random=false&limit=3`
15. `GET /api/quotes/shereno?lines=separators&random=false&limit=3`
16. `GET /api/quotes/shereno?lines=raw&random=false&limit=3`
17. `GET /api/quotes/search?q=عشق&limit=5`
18. `GET /api/quotes/search?q=حافظ&limit=5`
19. `GET /api/quotes/search?q=nonexistent123`
20. `GET /api/quotes/category/عارفانه?limit=3`
21. `GET /api/quotes/حافظ?limit=3`
22. `GET /api/quotes/مولانا?limit=3`
23. `GET /api/quotes/سهراب سپهری?limit=3`
24. `GET /api/quotes/نیما یوشیج?limit=3`
25. `GET /api/poets`
26. `GET /api/categories`
27. `GET /api/stats`
28. `GET /api/health`
29. `GET /api/embed?theme=default`
30. `GET /api/embed?theme=dark&theme=minimal&poet=حافظ`

Recorder script implementation:
```typescript
// scripts/record-golden-contracts.ts
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";
const OUT_DIR = path.resolve(process.cwd(), "data/golden/contracts");
fs.mkdirSync(OUT_DIR, { recursive: true });

const CASES = [
  { slug: "quotes_default", path: "/api/quotes" },
  { slug: "quotes_deterministic", path: "/api/quotes?random=false&limit=5&page=1" },
  { slug: "quotes_lines_auto", path: "/api/quotes?lines=auto&limit=3&random=false" },
  { slug: "quotes_lines_separators", path: "/api/quotes?lines=separators&limit=3&random=false" },
  { slug: "quotes_lines_raw", path: "/api/quotes?lines=raw&limit=3&random=false" },
  { slug: "hafez_default", path: "/api/quotes/hafez" },
  { slug: "hafez_deterministic", path: "/api/quotes/hafez?random=false&limit=3" },
  { slug: "hafez_lines_separators", path: "/api/quotes/hafez?lines=separators&random=false&limit=3" },
  { slug: "hafez_lines_raw", path: "/api/quotes/hafez?lines=raw&random=false&limit=3" },
  { slug: "non_poetry_default", path: "/api/quotes/non-poetry" },
  { slug: "non_poetry_deterministic", path: "/api/quotes/non-poetry?random=false&limit=3" },
  { slug: "shereno_default", path: "/api/quotes/shereno" },
  { slug: "shereno_deterministic", path: "/api/quotes/shereno?random=false&limit=3" },
  { slug: "shereno_lines_auto", path: "/api/quotes/shereno?lines=auto&random=false&limit=3" },
  { slug: "shereno_lines_separators", path: "/api/quotes/shereno?lines=separators&random=false&limit=3" },
  { slug: "shereno_lines_raw", path: "/api/quotes/shereno?lines=raw&random=false&limit=3" },
  { slug: "search_eshgh", path: "/api/quotes/search?q=عشق&limit=5" },
  { slug: "search_hafez", path: "/api/quotes/search?q=حافظ&limit=5" },
  { slug: "search_empty_match", path: "/api/quotes/search?q=nonexistentqueryxyz123" },
  { slug: "category_arefaneh", path: "/api/quotes/category/عارفانه?limit=3" },
  { slug: "poet_hafez", path: "/api/quotes/حافظ?limit=3" },
  { slug: "poet_molana", path: "/api/quotes/مولانا?limit=3" },
  { slug: "poet_sohrab", path: "/api/quotes/سهراب سپهری?limit=3" },
  { slug: "poet_nima", path: "/api/quotes/نیما یوشیج?limit=3" },
  { slug: "poets_catalog", path: "/api/poets" },
  { slug: "categories_catalog", path: "/api/categories" },
  { slug: "stats", path: "/api/stats" },
  { slug: "health", path: "/api/health" },
  { slug: "embed_default", path: "/api/embed?theme=default" },
  { slug: "embed_dark_hafez", path: "/api/embed?theme=dark&poet=حافظ" },
];

async function record() {
  const manifest: Array<{ slug: string; path: string; status: number; file: string }> = [];

  for (const c of CASES) {
    const url = `${BASE_URL}${c.path}`;
    const res = await fetch(url);
    const contentType = res.headers.get("content-type") || "";
    let body: any;
    if (contentType.includes("application/json")) {
      body = await res.json();
    } else {
      body = await res.text();
    }

    const payload = {
      slug: c.slug,
      requestPath: c.path,
      statusCode: res.status,
      headers: {
        contentType,
        cacheControl: res.headers.get("cache-control"),
        accessControlAllowOrigin: res.headers.get("access-control-allow-origin"),
      },
      body,
      recordedAt: new Date().toISOString(),
    };

    const targetFile = path.join(OUT_DIR, `${c.slug}.json`);
    fs.writeFileSync(targetFile, JSON.stringify(payload, null, 2), "utf8");
    manifest.push({ slug: c.slug, path: c.path, status: res.status, file: `${c.slug}.json` });
    console.log(`[CONTRACT] Recorded ${c.slug} (${res.status}) -> ${targetFile}`);
  }

  fs.writeFileSync(path.join(OUT_DIR, "index.json"), JSON.stringify(manifest, null, 2), "utf8");
}

record().catch((err) => {
  console.error("Recording failed:", err);
  process.exit(1);
});
```

Execution command:
`bun run scripts/record-golden-contracts.ts`

---

### 4.3 Plan Component 3: Playwright Baseline Screenshots Script
Captures visual screenshots for all 9 pages across Desktop (1280x800) and Mobile (390x844), in both Light and Dark themes.

Target pages:
1. `/` (Home)
2. `/docs` (Documentation)
3. `/examples` (Code Examples)
4. `/embed` (Embed Generator)
5. `/sakhtar` (Architecture & Metrics Dashboard)
6. `/contribute` (Contribution Page)
7. `/changelog` (Changelog)
8. `/privacy` (Privacy Policy)
9. `/terms` (Terms of Service)

Screenshot capture script:
```typescript
// scripts/capture-baseline-screenshots.ts
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";
const OUT_DIR = path.resolve(process.cwd(), "docs/evidence/phase-0/screenshots");
fs.mkdirSync(OUT_DIR, { recursive: true });

const PAGES = [
  { slug: "home", path: "/" },
  { slug: "docs", path: "/docs" },
  { slug: "examples", path: "/examples" },
  { slug: "embed", path: "/embed" },
  { slug: "sakhtar", path: "/sakhtar" },
  { slug: "contribute", path: "/contribute" },
  { slug: "changelog", path: "/changelog" },
  { slug: "privacy", path: "/privacy" },
  { slug: "terms", path: "/terms" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
];

const THEMES: Array<"light" | "dark"> = ["light", "dark"];

async function capture() {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome-stable",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const manifest: Array<{ page: string; viewport: string; theme: string; file: string }> = [];

  for (const pageDef of PAGES) {
    for (const vp of VIEWPORTS) {
      for (const theme of THEMES) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme,
        });
        const page = await context.newPage();
        const url = `${BASE_URL}${pageDef.path}`;

        await page.goto(url, { waitUntil: "networkidle" });
        // Wait briefly for font rendering / animations
        await page.waitForTimeout(500);

        const filename = `${pageDef.slug}-${vp.name}-${theme}.png`;
        const filePath = path.join(OUT_DIR, filename);

        await page.screenshot({ path: filePath, fullPage: true });
        manifest.push({ page: pageDef.slug, viewport: vp.name, theme, file: filename });
        console.log(`[SCREENSHOT] Captured ${filename}`);

        await context.close();
      }
    }
  }

  await browser.close();

  // Generate markdown gallery
  let markdown = `# Phase 0 Baseline Screenshots Gallery\n\n`;
  markdown += `Captured on ${new Date().toISOString()}\n\n`;
  for (const m of manifest) {
    markdown += `### ${m.page.toUpperCase()} (${m.viewport}, ${m.theme})\n\n`;
    markdown += `![${m.file}](${m.file})\n\n`;
  }
  fs.writeFileSync(path.join(OUT_DIR, "gallery.md"), markdown, "utf8");
}

capture().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
```

Execution command:
`bun run scripts/capture-baseline-screenshots.ts`

---

### 4.4 Plan Component 4: Baseline Performance Measurement Protocol

#### Protocol Specifications
1. **Target Endpoints**:
   - `/api/health`
   - `/api/stats`
   - `/api/quotes/hafez`
   - `/api/quotes/shereno`
   - `/api/quotes/search?q=عشق`
   - `/api/poets`
2. **Phase A: Cold Start Measurement**:
   - Kill running server.
   - Start fresh server instance.
   - Record time from process launch to first byte returned on `GET /api/health` and `GET /api/quotes/hafez`.
   - Budget target: Current baseline <= 100 ms.
3. **Phase B: Warm Latency Distribution**:
   - Send 20 warm-up requests.
   - Execute 500 serial requests per endpoint.
   - Record: p50, p90, p95, p99, min, max, average, and standard deviation.
4. **Phase C: Memory Profile**:
   - Capture `process.memoryUsage()` at 3 milestones:
     1. Pre-traffic baseline (fresh startup with datasets loaded).
     2. Mid-traffic (after 500 requests).
     3. Post-traffic (after 3,000 requests).
   - Log RSS, Heap Total, Heap Used, and External memory.
5. **Phase D: Router & Microbenchmark**:
   - Query `/api/engine/benchmark?iterations=5000`.
   - Record router match latency (nanoseconds per operation) and cache hit/miss ns/op.

Benchmark runner script:
```typescript
// scripts/measure-baseline-perf.ts
import fs from "node:fs";
import path from "node:path";

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
  for (let i = 0; i < 20; i++) await fetch(`${BASE_URL}${endpoint}`);

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

async function run() {
  const endpoints = [
    "/api/health",
    "/api/stats",
    "/api/quotes/hafez?limit=5",
    "/api/quotes/shereno?limit=5",
    "/api/quotes/search?q=عشق&limit=5",
    "/api/poets",
  ];

  const results: Record<string, any> = {};
  for (const ep of endpoints) {
    console.log(`Benchmarking ${ep}...`);
    results[ep] = await benchmarkEndpoint(ep, 500);
  }

  // Engine microbenchmark
  const benchRes = await fetch(`${BASE_URL}/api/engine/benchmark?iterations=5000`);
  const benchData = await benchRes.json();
  results.microbenchmark = benchData;

  const output = {
    timestamp: new Date().toISOString(),
    environment: {
      bun: Bun.version,
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    latencyBenchmarks: results,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), "utf8");
  console.log(`Saved baseline performance to ${OUT_FILE}`);
}

run();
```

---

### 4.5 Plan Component 5: Structure for `docs/audit/00-recon.md`

The formal reconnaissance document will be structured as follows:

```markdown
# 00-recon.md — Phase 0 Repository Reconnaissance & Safety Net Baseline

## 1. Executive Summary & Audit Scope
- Purpose of audit and Phase 0 objectives
- Core architectural transition: In-memory prototype -> Monorepo Tigh v1
- Methodologies, tooling, and verification criteria

## 2. Environment & Toolchain Census
- System specifications (Linux kernel, OS release)
- Runtime environments (Bun 1.4.3, Node v26.10.0)
- Package manager, lockfile analysis (bun.lock integrity), script evaluation
- Git branch baseline (`rebuild/v1` fork from `main`)

## 3. Dataset Audit & Provenance Verification
- Complete catalog of `lib/data/*.json`
  - Byte sizes, line counts, raw JSON record counts, active store counts
  - Exact SHA-256 hashes of frozen legacy assets
  - Snapshot verification in `data/legacy/`
- Data model defects & anomalies:
  - Non-poetry 2-record drop audit
  - Inconsistent schema across datasets (`poem` vs `verses` vs `body` vs `text_persian`)
  - Modern poet rights audit status (D10)

## 4. API Surface & Contract Specification
- Comprehensive routing catalog (14 endpoints)
- Query parameter matrices (`lines=auto|separators|raw`, `random`, `limit`, `page`, `category`, `poet`, `q`)
- Contract snapshot catalog in `data/golden/contracts/`
- Error handling behavior & status codes (D8, D18)

## 5. Web Surface & Visual Baselines
- Comprehensive catalog of all 9 Next.js pages
- Component stack (Radix UI, Tailwind CSS v4, Lucide icons, Vazirmatn fonts)
- Visual regression baselines catalog in `docs/evidence/phase-0/screenshots/`
- Accessibility review (WCAG 2.2 AA initial audit notes)

## 6. Systematic Audit of Known Defects (D1–D20)
- Detailed verification of defects D1 through D20 against current code:
  - D1: Footer/colophon leakage
  - D2: Raw double space gaps
  - D3: Punctuation spacing
  - D4: Naive line breaks
  - D5: Widget truncation
  - D6: Per-instance serverless state
  - D7: Substring search
  - D8: Inconsistent response shapes
  - D9: Over-aggressive normalization
  - D10: Blanket public domain assumption
  - D11: Contribution SQL build
  - D12: HTML head tags
  - D13: Hardcoded personal paths
  - D14: Fake latency numbers in docs
  - D15: Docs inaccuracies
  - D16: Missing stable IDs, versions, and citations
  - D17: Pagination contract limitations
  - D18: Ad hoc error formats
  - D19: Missing ETag, Server-Timing, precompression
  - D20: Single origin reachability

## 7. Performance & Resource Baseline Measurements
- Cold start latency measurements
- Warm TTFB distribution percentiles (p50, p90, p95, p99) for key endpoints
- Router & cache microbenchmarks (Tigh v0.0.1-beta vs Target Budgets in Appendix D)
- Process memory footprint (RSS, Heap) under load

## 8. Target Architecture & Workstream Roadmaps (WS1–WS15)
- Transition blueprint to Bun workspaces monorepo
- `packages/core`, `packages/schema`, `packages/persian`, `packages/poem`, `packages/search`, `packages/store`, `packages/widget`, `packages/mcp`, `apps/web`, `apps/api`
- Phase exit criteria matrix

## 9. Phase 0 Verification Checklist
- [ ] Snapshot copied to `data/legacy/` and locked read-only
- [ ] `data/legacy/SHA256SUMS` verified
- [ ] `data/golden/contracts/` populated (30 contract test cases)
- [ ] `docs/evidence/phase-0/screenshots/` populated (36 screenshots across 9 pages)
- [ ] `docs/evidence/phase-0/performance/baseline.json` committed
- [ ] Phase 0 sign-off
```

---

## 5. Verification Method

To independently verify all observations and readiness findings documented in this report:

1. **Verify Runtime & Git**:
   ```bash
   bun --version
   node --version
   git status
   ```

2. **Verify Dataset Hashes & Stats**:
   ```bash
   sha256sum lib/data/*.json
   wc -c lib/data/*.json
   ```

3. **Verify Existing Tests**:
   ```bash
   bun test
   ```
   *Expected result*: 30 tests pass across 3 files in ~1.3s.

4. **Verify Playwright Headless Capability with Local Chrome**:
   ```bash
   bun -e "import { chromium } from 'playwright'; const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome-stable', args: ['--no-sandbox'] }); console.log('Chrome:', browser.version()); await browser.close();"
   ```
   *Expected result*: Outputs `Chrome: 155.0.8059.79` and exits with code 0.

5. **Verify Production Build & Health Endpoint**:
   ```bash
   bun run build
   bun run start -p 3009 &
   SERVER_PID=$!
   sleep 2
   curl -s http://127.0.0.1:3009/api/health | grep '"status":"ok"'
   kill $SERVER_PID
   ```
   *Expected result*: Health endpoint returns `"status":"ok"` and `"engine":"تیغ/0.0.1-beta"`.
