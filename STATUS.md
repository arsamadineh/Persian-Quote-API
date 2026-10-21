# Project Status

## Wave Status
- [x] wave0: Orchestrator diagnosis, honest eval harness, fixtures, contracts installed
- [x] L1: Structure v2 (packages/poem) implemented S0-S8, all golden shots pass, ECE 0.0279, latency 1.79ms, victory confirmed
- [x] L3: excerpts + widget wiring (excerpt caps, seeded RNG, /api/embed, escape, CSP)
- [x] L8: distribution (pq-server binary, DEPLOY.fa.md, mirror manifest)
- [x] L9: review console + learning loop (validatePatch, scripts/learn, review tab)
- [x] L11: stylometry (Burrows' Delta, PCA, clustering, attribute with abstain)
- [x] L12: semantic atlas scaffold (graceful degradation, proxy scores not measured)
- [x] L13: query parser (28 tests) + MCP tool + 10 research prompts
- [x] L14: publishing kit (facts.json, benchmarks, papers, citation, notebooks, datasheet)

## Diagnosis (Wave 0.2)
- Works by kind x structure.origin: classical x separators: 566, classical x inferred: 50, modern x separators: 874 (nimaee: 798, sepid: 76), modern x inferred: 3414, prose x separators: 494
- Modern works with >= 1 real separator: 874; LLM/boundary_model runs: 0 (never executed)
- Eval leakage: YES (splitBySignals tested against its own synthetic double-space/asterisk signals); Poet split: NO
- 5 worst modern works (words/line <= 4): ahmad-shamlou.general.67 (2.18), gheysar-aminpour.general.34 (2.40), salman-harati.general.9 (2.78), salman-harati.general.19 (2.92), gheysar-aminpour.general.2 (3.24)
- /api/embed & web component: NO max_words parameter passed, pickExcerpt not called (classical dumps 20+ lines, modern naive char-trim)

## Honest Baseline (docs/evidence/phase-2/structure-f1.json)
- Line boundary: Precision 0.1008 | Recall 0.2422 | F1 0.1423
- Stanza boundary: Precision 0.0000 | Recall 0.0000 | F1 0.0000
- Per-form Line F1: ghazal 0.1851 | nimaee 0.1203 | sepid 0.0913
- Leave-poet-out 5-fold Line F1: fold1: 0.0854 | fold2: 0.0527 | fold3: 0.1356 | fold4: 0.1647 | fold5: 0.2342

## L2 Results (measured)
- Rebuild: structure_version poem-1.0.0-de50403407b0; 5398 works; fingerprint 1.0000; two runs byte-identical (sha256 stable); cached rerun 0.98s.
- Eval gate (sample300, leave-poet-out): line F1 0.2898; per-form ghazal 0.6925 | nimaee 0.1266 | sepid 0.2454 | other 0.0000; ECE 0.0622 (<= 0.08); gate PASSED.
- Confidence bands: >=0.9 0.2230 | 0.7-0.9 0.7770 | <0.7 0.0000.
- Legacy contracts: 30/30 pass in-process (volume fields total/raw and dynamic embed HTML excluded); tests 128 pass; data:validate clean.
- Review queue: 5398 items; first-500 max poet share 0.05.
- Note: /v1 exposure needed additive edits to packages/core/src/routes.ts (outside L2 row); lib/changelog.ts and STATUS.md are required by AGENTS.md.

## L3 Results (measured)
- Widget core gzip: 2719 bytes (limit 4096). Excerpt test: 4 shots x 3 sizes = 12 cases pass; medium line count <= 8; word caps small<=25 medium<=45 large<=70; no dangling end.
- /api/embed: pickExcerpt with size caps and seeded RNG; escaping applied; frame-ancestors * header added.

## L5 Build Decision
- Stack: Vite + Preact (runtime ~3 KB), TypeScript, no CSS framework; Tailwind dropped to keep bundle small.
- Tab discovery: import.meta.glob("./tabs/*/tab.ts", { eager: true }) sorted by order; discoverTabs() tested.
- Data: public pack brotli'd per-poet chunks, lazy-loaded; private corpus via IndexedDB/OPFS in a worker pool.
- PWA: hand-written sw.js (~80 lines), precache shell + runtime-cache packs, versioned cleanup.
- Measured: private 5000 lines ingest+index = 1149 ms (target <= 3000); search p95 not measured; initial JS not measured (no Vite build).

## L6 Results (measured)
- identifyVerse: hit@1 1.00, hit@5 1.00 on 40 damaged queries (1-3 missing/changed words); p95 8.15 ms over 842 entries.
- collation round-trip: 3-witness fixture passes (TEI emitted).
- docx: not implemented (lazy-load deferred); cite returns formatted strings only.
- tests: 8 pass.

## L7 Results (measured)
- makeQuiz deterministic (same seed -> same quiz) verified.
- Moodle XML well-formed (basic) verified; CSV/GIFT/printable HTML non-empty.
- pilot/ docs: 4 files, each <= 500 words, Persian, numbers from STATUS.md.
- Class pack URL round-trip: not implemented (compression deferred).

## L8 Results (measured)
- Binary: /tmp/opencode/pq-server linux-x64, 77c5fb2d7f866d179814ac5dca4cdaaa4d75cf9bcf2be88dafd9786f4aae10f4, cold start to /v1/health 165.6 ms.
- Platforms not run: windows-x64, macos-arm64 (not available here).
- Mirror manifest: app/.well-known/pq-endpoints.json/route.ts.
- Dockerfile/docker-compose: pre-existing, not re-tested.

## L9 Results (measured)
- validatePatch: accepts fingerprint-preserving, rejects letter changes (tested).
- scripts/learn: runs end-to-end on synthetic patch set, prints before/after (0.2898 -> 0.2950, promoted=true).
- Review console tab: stub mount only.

## L10 Results (measured)
- Echo pipeline: 108706 units, 12206 candidates, 206 echoes (same_poet_dup 172, partial 18, formula 13, quote 3); runtime 15.7 s; output byte-identical across runs.

## L11 Results (measured)
- Leave-one-poem-out attribution (10 largest classical poets): <=100 words 0.0000 (n=15), 100-300 words 0.1154 (n=26), >300 words 1.0000 (n=6). Abstain under 200 words enforced.

## L12 Results (measured)
- Proxy scores: not measured (no model available; lexical fallback only). Atlas points generated via char-ngram PCA. Graceful degradation enforced.

## L13 Results (measured)
- parseQuery: 28 tests pass (>=25 examples).
- MCP tool list includes query_corpus.

## L14 Results (measured)
- paper:facts runs -> papers/facts.json.
- 5 notebooks present (each minimal).
- Citation files present.

## Contract Conflicts
- None (contracts/ and prompts/ cleanly installed; all 30 legacy contracts pass)

## Escalations
- NEEDS-BOOST L4: consistency 0.4% vs target >= 90% (3 attempts: full-pattern alignment, foot-based segmentation, syllable final-X toggle); coverage 0.4%; hypotheses: (1) curated foot patterns do not match the actual Hafez meters in this corpus, (2) syllabifier produces unstable weights across hemistichs of one ghazal. Tried: 6 meters with footPattern, min-cost alignment, poem-level voting on candidate[0], removing final-X ambiguity. Open: needs verified meter table from an authoritative source and a calibrated syllabifier.
