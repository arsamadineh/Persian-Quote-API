# L10 — Intertext echo graph (`packages/echo`, `pipeline/echo`, tab `echo`) · class M · mode: teamwork lane
Read `_COMMON.md`. Detect who echoes whom: quotation, تضمین, اقتباس, formulaic phrases — a digital-humanities feature almost no Persian tool offers.

## Offline pipeline (`pipeline/echo`)
1. Units = hemistichs (classical) and lines (modern), search-normalized. Shingles = word 3-grams (fall back to char 5-grams for ≤ 4-word units).
2. MinHash (128 permutations, deterministic seed) + LSH banding → candidate pairs **across different works**.
3. Verify: Jaccard ≥ 0.5 **and** token-level edit similarity; classify: `quote` (≥ 0.95), `partial` (0.5–0.95), `formula` (the shingle set appears in ≥ 8 works → formulaic, down-ranked/hidden by default), `same_poet_dup` (same poet → flagged for data cleaning, not an echo).
4. Direction: only when both poets' chronology is known (`deathYearCE`): earlier → later; otherwise undirected. Never guess direction.
5. Output `echoes.jsonl` (`Echo`, `contracts/research.ts`) plus `echo-review.csv` with a stratified sample of 50 pairs per kind for human spot checks. Report counts per kind and runtime (target ≤ 60 s at current corpus size; scale test on 10× synthetic).

## UI (`src/tabs/echo/tab.ts`)
- Per-work «پژواک‌ها» panel: matches with similarity, kind, side-by-side highlighting of shared words, link to both works.
- **Poet-to-poet flow diagram** (Canvas2D chord or Sankey, no heavy lib): who echoes whom, filter by kind/threshold/era, click a flow → list of pairs. Export CSV.
- Limits line (H7): «تشخیص خودکار؛ ممکن است عبارات رایج را شامل شود.»
**Done (T1):** deterministic output (two runs identical); counts per kind printed; a hand-built fixture of 5 known near-duplicates is recovered (recall 5/5) and 5 unrelated pairs are not (precision 5/5); UI mounts in a DOM test.
