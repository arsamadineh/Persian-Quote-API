# 90 — GATES and the VERIFIER (read by the verifier agent and the orchestrator only)

## §V Verifier protocol (one agent, fastest model, writes no features)
Run exactly the tier requested. Return **≤ 10 lines**: tier, pass/fail, failing test names, one minimal repro for the first failure. Also check: (1) `git diff --name-only` stays inside the lane's ownership row in `_COMMON.md`; (2) `contracts/` unchanged; (3) no docs added outside the allowed list; (4) no number in any report lacks a measurement source. Reject the lane otherwise. Never create test frameworks. Never run a higher tier than requested.

## Gate A — after L1 + L2 + L3 merged (normal mode, T2 once)
Pass criteria (print a table): the 4 shots correct per L1; corpus defect scans = 0; leave-poet-out F1 per form ≥ committed baseline and the L1 targets reported; ECE; legacy 30 contracts green; widget caps hold; `data:validate` clean. Fail → NEEDS-BOOST on the failing stage (see `98_BOOST_ESCALATION.md`), max 2 escalations, then report honestly.

## Gate B — all lanes merged (normal mode, T2 once)
1. Full `bun test`, `bunx tsc --noEmit`, `data:validate`, legacy 30 contracts.
2. 3-page Playwright smoke (home, workbench, reader) + one offline check (network off: cached pack + private corpus work).
3. axe on 5 pages (home, reader, workbench, arud, tools): 0 serious/critical.
4. Security quickies: CSP/frame-ancestors headers present as real headers; grep proves no undeclared third-party requests; `bun audit` summary; embed output escaping test.
5. One `oha` 20 s run on cached reads (one result line). Bundle sizes: workbench initial JS, widget core.
6. Notebooks execute (L14).
7. **Wow-demo script (all must run; each prints PASS/FAIL + one measured number):**
   1. Paste a half-remembered verse → correct poet/work in the top 5 (L6), time shown.
   2. Open arud lab on a Hafez beyt → meter + editable syllables, confidence shown (L4).
   3. Drag a 5,000-line private text file → searchable in ≤ 3 s, network off (L5).
   4. Open a flagged poem in the review console → fix a break by keyboard → export a valid patch (L9).
   5. Open the echo graph for Hafez → flows render, a pair opens side-by-side (L10).
   6. Atlas renders; «مشابه این» works; semantic search works after model download or states lexical-only (L12).
   7. Generate a Moodle quiz and a class-pack URL; re-import it (L7).
   8. `pq-server` starts offline and serves the workbench (L8).
Final report ≤ 25 lines: lanes done/partial/not-run; one table of measured numbers only; open owner decisions (rights policy for living poets, who reviews `review-queue.csv`, pilot professors, Iran-hosted mirror, tokens for Zenodo/HF); exact commands to build `pq-server` and run the workbench.
