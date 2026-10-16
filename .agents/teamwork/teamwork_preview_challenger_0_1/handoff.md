# Phase 0 Safety Net Empirical Challenge Report

**Agent**: `teamwork_preview_challenger_0_1`  
**Verdict**: **APPROVE**  
**Date**: 2026-10-16T02:27:00Z  

---

## 1. Observation

All verification commands were executed directly on the host system without relying on claims or prior logs.

### 1.1 Legacy Dataset Snapshot & Checksum Integrity
1. Checksum verification of source vs snapshot:
   - Command: `sha256sum lib/data/*.json`
     ```
     d1bba4d76fc191150da6114cabd6b6eb94338ea08ce61e31b72fba1510064572  lib/data/hafez.json
     e8649722cec2a8cc3dbb9da035989643973d5922e406e6b7f3e60fd3a746dd25  lib/data/non-poetry-quotes.json
     90e007c504cf94f18bb153a79416ac9fd8cb0db492ad3d437d62b0e72083c7f9  lib/data/poetry-quotes.json
     fe0818cd5ea807c39e131bdca3780828bee3da7827b3eed8a185d512f4ce606b  lib/data/shereno.json
     ```
   - Command: `cd data/legacy && sha256sum -c SHA256SUMS`
     ```
     hafez.json: OK
     non-poetry-quotes.json: OK
     poetry-quotes.json: OK
     shereno.json: OK
     ```
   - Binary identity via `cmp`:
     - `hafez.json`: IDENTICAL (694,755 bytes)
     - `non-poetry-quotes.json`: IDENTICAL (214,737 bytes)
     - `poetry-quotes.json`: IDENTICAL (3,110 bytes)
     - `shereno.json`: IDENTICAL (5,981,895 bytes)
2. Permissions:
   - Output of `stat -c "%a %n" data/legacy/*`:
     ```
     444 data/legacy/hafez.json
     444 data/legacy/manifest.json
     444 data/legacy/non-poetry-quotes.json
     444 data/legacy/poetry-quotes.json
     444 data/legacy/SHA256SUMS
     444 data/legacy/shereno.json
     ```
   - Write mutation test: A Python test opening `data/legacy/hafez.json` with mode `"w"` raised `PermissionError: [Errno 13] Permission denied`.
   - Directory permission observation: `stat -c "%a %n" data/legacy` returned `755 data/legacy`.
3. Manifest Validation:
   - Evaluated `data/legacy/manifest.json` against all 4 files: All `sizeBytes`, `sha256`, `recordCount`, and JSON `keys` accurately describe the physical files.

### 1.2 Golden Contract Recording Conformance
1. Inventory verification:
   - `data/golden/contracts/index.json` contains exactly 30 contract records.
   - Filesystem scan of `data/golden/contracts/*.json` contains exactly 30 contract files plus `index.json`. The symmetric difference is empty.
2. Runtime conformance verification:
   - Executed test harness querying every path registered in `index.json` against the application router.
   - Status codes: 30/30 returned status `200`.
   - Headers: All responses returned expected `Content-Type: application/json; charset=utf-8` or `text/html; charset=utf-8`.
   - Body parity:
     - All deterministic queries (`random=false`, search, categories, poets catalog) matched the golden payloads in count, total, and data array shape.
     - Non-deterministic queries (`quotes_default`, `hafez_default`, `shereno_default`) matched the contract schema (`success: true`, proper key sets, and expected data item counts).
     - Embed endpoints returned valid rendered HTML matching the golden contract structure.

### 1.3 Playwright Baseline Visual Screenshots
1. Inventory and Format:
   - Exactly 36 PNG files exist in `docs/evidence/phase-0/screenshots/`.
   - Every file begins with the 8-byte PNG header (`\x89PNG\r\n\x1a\n`).
   - File sizes range from 105,744 bytes (`contribute-mobile-light.png`) to 2,469,295 bytes (`docs-desktop-dark.png`). None are stubbed or empty.
2. Theme Application:
   - For every page and viewport pair, `light.png` and `dark.png` binary contents are non-identical. Visual contrast and dark mode classes were actively applied during capture.
3. Viewport Dimensions:
   - All 18 desktop screenshots have an exact width of `1280px`.
   - 16 of the 18 mobile screenshots have an exact width of `390px`.
   - **Discovered Layout Flaw**: `terms-mobile-dark.png` and `terms-mobile-light.png` have dimensions `420 x 9321`. In `app/terms/page.tsx`, an unconstrained code block in the MIT License block lacks word-break wrapping, causing a 30px horizontal scroll overflow on mobile viewports. The baseline screenshots faithfully capture this real defect.
4. Gallery:
   - `docs/evidence/phase-0/screenshots/gallery.md` links all 36 PNG files using relative markdown image syntax.

### 1.4 Baseline Performance Measurements Reproducibility
1. Recorded in `docs/evidence/phase-0/performance/baseline.json`:
   - Cold Start: `serverBootToHealthFirstByteMs` = 5,600.61 ms, `firstDatasetQueryLatencyMs` = 15.86 ms.
   - Warm Latencies (p50): Health (2.89 ms), Stats (2.35 ms), Hafez limit=5 (3.77 ms), Shereno limit=5 (1.65 ms), Search limit=5 (1.63 ms), Poets (1.45 ms).
   - Microbenchmarks: Router (374.19 ns/op), Cache Set (2,926 ns/op), Cache Get (559,720 ns/op).
2. Independent Replication:
   - Re-running benchmark on the running engine in Bun yielded sub-millisecond in-process router latency and reproduced the severe cache lookup degradation: `cacheGetNsPerOp` measured between 84,818 ns and 559,720 ns (up to 560 µs), empirically confirming the O(N) array splice eviction defect in the Tigh 0.0.1-beta cache.
   - Bun process memory measured ~32 MB RSS on initial boot and scaled to ~50 MB under full dataset load, matching the recorded baseline.

### 1.5 Test Suite Status
- Command: `bun test`
- Result: 85 passed, 0 failed, 724 expect() calls across 15 test files in 1.45s.

---

## 2. Logic Chain

1. **R5 Compliance (Data Immutability)**:
   - Observation 1.1 proves that `data/legacy/*.json` files are 100% byte-identical to `lib/data/*.json`, with matching SHA-256 sums and `0444` file permissions that block write calls. The legacy dataset is securely frozen.
2. **R6 Compliance (Legacy Contract Parity)**:
   - Observation 1.2 proves that all 30 legacy contract cases are cataloged in `index.json`, present on disk, and match live engine output. This ensures that any regressions introduced during engine rewrites in Phase 3 can be caught immediately.
3. **R18 Compliance (Visual Regression Baseline)**:
   - Observation 1.3 proves that all 36 screenshots covering 9 pages across 2 viewports and 2 color schemes are captured and valid. The discovery that `/terms` mobile images are 420px wide rather than 390px confirms that the screenshot tool captured actual DOM rendering including horizontal overflow flaws, providing an authentic baseline.
4. **R2 & R14 Compliance (Performance Reproducibility)**:
   - Observation 1.4 confirms that reported baseline numbers represent real measurements and that the architectural cache defect (560 µs lookup) is reproducible.
5. **Conclusion Derivation**:
   - Because observations 1.1 through 1.5 satisfy the exit criteria defined in `ORIGINAL_REQUEST.md` for Phase 0 without synthetic data or missing deliverables, the safety net is approved.

---

## 3. Caveats

1. **Directory Write Permission**:
   - Files in `data/legacy/` have `0444` permissions, which prevents file modification. However, `data/legacy/` directory itself has permission `0755`. In POSIX systems, a write-permitted parent directory allows deleting or renaming read-only files. For maximum safety in production pipelines, `chmod 0555 data/legacy` can be applied.
2. **Horizontal Overflow on Legacy `/terms` Page**:
   - Mobile screenshots for `/terms` captured at 390px viewport width expand to 420px due to unconstrained English license text. This is a pre-existing UI bug in the legacy template, not a defect in the screenshot capture process.
3. **Loopback vs Network Latency**:
   - In-process microbenchmarks run faster (sub-millisecond) than the recorded network baseline (1-4 ms), which reflects loopback HTTP stack overhead. This difference is consistent with standard network stack behavior.

---

## 4. Conclusion

**Verdict: APPROVE**

The Phase 0 safety net deliverables meet all requirements:
1. `data/legacy/`: Byte-identical freeze with validated SHA-256 checksums and write-protected files.
2. `data/golden/contracts/`: Complete 30-case contract suite with 100% runtime conformance.
3. `docs/evidence/phase-0/screenshots/`: 36 valid, distinct, full-page screenshots with documentation in `gallery.md`.
4. `docs/evidence/phase-0/performance/baseline.json`: Empirically verified and reproducible metrics.
5. `bun test`: All 85 unit and E2E tests passing.

The repository is safely stabilized for Phase 1 (Foundations).

---

## 5. Verification Method

To reproduce the findings in this report independently:

1. **Verify Legacy Hashes and Binary Identity**:
   ```bash
   cd data/legacy && sha256sum -c SHA256SUMS && cd ../..
   for f in hafez non-poetry-quotes poetry-quotes shereno; do
     cmp "lib/data/$f.json" "data/legacy/$f.json"
   done
   ```

2. **Verify Golden Contracts**:
   ```bash
   bun -e '
   import { e2eJson } from "./tests/e2e/harness.ts";
   const idx = JSON.parse(await Bun.file("data/golden/contracts/index.json").text());
   for (const c of idx) {
     const res = await e2eJson(c.path);
     if (res.status !== c.status) throw new Error("Mismatch on " + c.slug);
   }
   console.log("30/30 contracts verified.");
   '
   ```

3. **Verify Screenshot Integrity**:
   ```bash
   python3 -c '
   import glob, struct
   pngs = glob.glob("docs/evidence/phase-0/screenshots/*.png")
   assert len(pngs) == 36
   for p in pngs:
       with open(p, "rb") as f:
           h = f.read(24)
       assert h[:8] == b"\x89PNG\r\n\x1a\n"
   print("36/36 screenshots valid PNGs.");
   '
   ```

4. **Run Full Test Suite**:
   ```bash
   bun test
   ```
