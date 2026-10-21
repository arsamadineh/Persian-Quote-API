# _COMMON — every agent reads this first (then ONLY its own lane file + `contracts/`)

## Economy contract (binding)
1. Read only: this file, your lane file, `contracts/`, your owned paths. Never re-read the repo. Use `rg -n`, then read ≤ 200 lines at a time. Never `cat` data; use `head -c 600`, `jq`, counts.
2. Pipe every command through `| tail -n 25`. Never paste logs. For failures print the test name + first error line only.
3. No ADRs, phase reports, evidence folders, per-task markdown. Docs allowed: `STATUS.md` (≤ 40 lines, one line per task), commit messages, your final report (≤ 8 lines), and files your lane explicitly lists.
4. Budget: aim ≤ 120 tool calls per lane; hard stop at 200 (commit what works, list the rest in STATUS.md). Any single task > 40 calls: simplify and move on.
5. LLM use inside the product build: cheapest capable model, temperature 0, batched, disk-cached by content hash, only on records flagged low-confidence, hard cap `LLM_BUDGET_USD` (default 5) that aborts. A model may change whitespace only; any changed letter → discard (letter-fingerprint check).

## Test tiers (the verifier enforces)
- **T0** after every task (< 10 s): `bun test <owned dir>` + `bunx tsc --noEmit` on your package. Property tests `numRuns: 50`.
- **T1** before declaring a lane done (< 60 s): T0 + contract conformance + your lane eval on `data/golden/sample300.jsonl`.
- **T2** only at Gates A and B (see `90_GATES.md`). `PQ_GATE=1` → property `numRuns: 500`.
- Never run Lighthouse, screenshots, full e2e or load tests outside T2.

## Hard rules
- **H1** Never change poem wording. Structure = whitespace only, fingerprint-verified (text minus whitespace, ZWNJ, `*`, `/` must be identical). Typos are flagged, never auto-fixed.
- **H2** Never delete data; quarantine with a reason code.
- **H3** The 30 legacy `/api/**` golden contracts keep passing.
- **H4** Report only measured numbers; unmeasured = "not measured". Never invent accuracy, sizes, timings.
- **H5** Do not touch the rights policy or deploy to production. The owner decides both.
- **H6** `contracts/` is frozen. If wrong, add a line under "Contract change requests" in STATUS.md and work around it.
- **H7** Honest UI: every derived feature (meter, form, echo, attribution, semantic hit) shows a confidence and a one-line «روش و محدودیت» (method & limits). Never present a guess as fact.

## Ownership (touch nothing outside your row)
| Lane | Owns |
|---|---|
| L1 | `packages/poem/**`, `data/golden/structure/**` |
| L2 | `pipeline/**` (except `pipeline/echo`, `pipeline/semantic`), `docs/review-queue*` |
| L3 | `packages/widget/**`, embed routes/components in `apps/web` |
| L4 | `packages/arud/**`, `apps/workbench/src/tabs/arud/**` |
| L5 | `apps/workbench/**` except `src/tabs/*` |
| L6 | `packages/tools/{kwic,identify,collate,cite}/**`, `src/tabs/tools/**` |
| L7 | `packages/tools/quiz/**`, `src/tabs/teach/**`, `pilot/**` |
| L8 | `dist/**`, `Dockerfile`, `docker-compose.yml`, `docs/DEPLOY.fa.md` |
| L9 | `packages/review/**`, `src/tabs/review/**`, `scripts/learn/**` |
| L10 | `packages/echo/**`, `pipeline/echo/**`, `src/tabs/echo/**` |
| L11 | `packages/style/**`, `src/tabs/style/**` |
| L12 | `packages/semantic/**`, `pipeline/semantic/**`, `src/tabs/atlas/**` |
| L13 | `packages/query/**`, `src/tabs/ask/**`, `prompts/research/**`, additive changes to `packages/mcp` |
| L14 | `papers/**`, `benchmarks/**`, `notebooks/**`, `CITATION.cff`, `.zenodo.json` |
(`src/tabs/*` = `apps/workbench/src/tabs/`.)

## Escalation protocol
If a lane gate fails twice, STOP. Append to STATUS.md: `NEEDS-BOOST Lx: <metric> <value> vs <target>; tried: <2 lines>; hypotheses: <2 lines>`. End your run. The human launches `/boost` with `98_BOOST_ESCALATION.md`.

## Persian-first conventions
UI strings Persian primary + English via a tiny `t()` map. RTL by default, `lang="fa"`, `<bdi>` around embedded Latin/digits. Vazirmatn subset. Digits: Persian in UI, source-faithful in data. Never insert ZWNJ into faithful text; never touch `می` (it can mean "wine").

## Final report (≤ 8 lines)
`Lx | done/partial/not-run | measured numbers | files changed (count) | open issues (≤ 2)`.
