# L2 — Eval, rebuild, review queue (`pipeline/`) · class S · after L1 merges · mode: normal
Read `_COMMON.md`.
1. Rebuild all artifacts with `structurePoem` (resumable; cache key = content hash + `structure-version` from L1). Idempotent: two runs → byte-identical artifacts.
2. Keep the leave-poet-out harness as the CI gate (fail if any form's F1 drops > 1 point vs committed baseline). Add a second gate: ECE ≤ 0.08.
3. Emit `docs/review-queue.jsonl` (`ReviewItem` from `contracts/review.ts`), sorted by **uncertainty sampling** (confidence closest to 0.5 first), diversified so no poet exceeds 5% of the first 500 items. Also `docs/review-queue.csv` (id, poet, confidence, flags, top typo).
4. Expose `structure.origin`, `confidence`, `form` in `/v1` works and legacy `line_origin`; add `meta.confidence_bands` (share of works per band: ≥0.9, 0.7–0.9, <0.7) to `/v1/meta`.
5. Apply `data/golden/human/*.jsonl` patches (from L9) when present: validated with `validatePatch`, origin `human`, confidence 1.0, override model output.
**Done (T1):** artifacts rebuild idempotently; legacy 30 contracts pass; band shares printed. Report ≤ 8 lines.
