# L9 — Review console + learning loop (`packages/review`, tab `review`, `scripts/learn`) · class M · mode: teamwork lane
Read `_COMMON.md`. This lane turns model uncertainty into verified data: literature graduate students fix the hard 10%, and every fix makes the model better.

## Console (`src/tabs/review/tab.ts`)
Loads `docs/review-queue.jsonl` (`ReviewItem`). Split view: flat source text with token indices vs proposed lines/beyts. **Keyboard-first**: `←/→` move the selected break by one token, `Enter` insert/remove a break at the cursor, `B` new stanza, `A` accept as proposed, `T` open typo decision (accept suggestion / reject / justify), `S` skip, `U` undo, `J/K` next/prev item. Autosave to IndexedDB; progress bar; session stats (items/hour). Reviewer name stored locally.
Export `human-patch.jsonl` (`HumanPatch`) and a prefilled GitHub PR/issue link. `validatePatch` enforces the fingerprint rule (structure edits cannot change a letter); typo fixes are separate decisions requiring a justification (source/edition) and are **never applied automatically**.

## Learning loop (`scripts/learn`)
`bun run learn`: merge `data/golden/human/*.jsonl` into the training/eval data, retrain the L1 boundary model (and form-classifier thresholds if learned), evaluate on a **held-out human-verified set that is never trained on**, and **auto-promote new weights only if held-out F1 improves ≥ 0.5 point and ECE does not worsen**; otherwise keep the old weights. Print a one-line before/after. Version weights (`weights.v<N>.json`).

## Done (T1)
Console unit/DOM tests for the keyboard model (break move/insert/remove/undo); `validatePatch` rejects a patch that changes a letter; `learn` runs end-to-end on a synthetic patch set and prints before/after. Time-to-review measured on 20 items by script (token-ops per item), reported.
