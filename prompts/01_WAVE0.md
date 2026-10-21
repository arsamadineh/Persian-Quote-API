# WAVE 0 — Orchestrator (single agent, normal mode, ≤ 30 tool calls)
Read `_COMMON.md`. Goal: find out why dashboard and screenshots disagree, build shared fixtures, install contracts.

## 0.1 Install contracts and prompts
Copy `contracts/` and `prompts/` into the repo root if absent (if `contracts/` already exists from an earlier prompt, merge; never overwrite a function signature that code already uses — record conflicts in STATUS.md). Create `STATUS.md`.

## 0.2 Diagnose (one output, ≤ 25 lines)
Production shows uniform 3–6-word lines, detached `ی/ها` at line starts, lines ending on `و/تو/به`, the radif «هنوز» placed at the START of lines, and 20+ lines in a medium widget. Yet `eval:structure` reports F1 = 1.0. Perfect F1 on inferred structure is almost always leakage. Produce and print:
1. Works by `kind × structure.origin`.
2. Modern works with ≥ 1 real separator; whether any `llm`/`boundary_model` inference ever ran.
3. Does the eval predictor see the separators it is scored against? Is the split by poet?
4. Five worst modern works by mean words/line ≤ 4 (IDs).
5. Does `/api/embed` + the web component pass `max_words` and call the excerpt picker?
Fix the eval harness now: flatten before predicting; **leave-poet-out** folds (≥ 5); report per form; commit the new honest baseline JSON. If the new numbers are low, that is the expected truth, not a failure of Wave 0.

## 0.3 Fixtures
- `data/golden/sample300.jsonl`: seeded (seed 42), stratified by kind and poet, includes ≥ 40 classical works with real beyts and ≥ 80 modern works with real separators.
- `data/golden/shots.jsonl`: find by opening phrase and store id + flat text:
  1. «مر من طی شد و دل در پی سارست هنوز» (classical, radif «هنوز»; مهدی سهیلی)
  2. «یه باز بذار حرف بزنم، دیگه نه حرف سفره نه حرف تیر» (colloquial, anaphora «نه»)
  3. «دست تو چه قدر تاخیر دارد وقتی که چای گرم می شود» (free verse, epiphora «تو مرده بودی»)
  4. «یار و همسر نگرفتم که گرو بود سرم» (classical, rhyme -رم, no radif)
- `data/golden/legacy30/`: confirm the 30 legacy contract goldens exist and run green.

## 0.4 Done
STATUS.md has the diagnosis block, baseline numbers, and `[x] wave0`. Final report ≤ 8 lines. Print the first token-usage reading if the harness exposes one (`/usage`).
