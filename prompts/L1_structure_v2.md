# L1 — Structure v2 (`packages/poem`) · class L · the visible bug · mode: teamwork lane (normal first; `/boost` only via NEEDS-BOOST)
Read `_COMMON.md`. Implement `structurePoem` from `contracts/structure.ts`. Stop at the first stage whose confidence ≥ its threshold; every stage is deterministic, fast (median ≤ 5 ms/poem) and unit-tested.

## Why the current output is wrong (from production screenshots)
Uniform 3–6-word lines (length-targeted DP); `ی`/`ها` starting lines (`ی مرگ`, `ی ما`); lines ending on `و/تو/به`; split compounds (`در به / دره`); the radif «هنوز» starting lines when it ENDS hemistichs; anaphora/epiphora ignored; classical poems treated as free verse.

## Stages
**S0 footer + signals.** Existing colophon extraction first, then real separators (`*`, blank line, newline, double space, spaced ` / `) if `looksStructured` (median 2–12 words/line, max ≤ 22). Origin `separators`, confidence 0.95.

**S1 glue constraints (hard; applied by every later stage, tested corpus-wide).**
- Never START a line with: `ی ها های تر ترین ام ات اش مان تان شان` (standalone tokens), `را است بود شد نیست هست`.
- Never END a line (unless punctuation follows) with: `ای می نمی بی همی و که تا یا از به در با بر چون اگر ولی اما`.
- Keep whole: `X به X` (`در به در`, `لا به لا`, `سر به سر`, `روز به روز`), `تو در تو`, immediate repeats `X X`, ezafe chains up to 3 tokens when the line would otherwise end on a noun+`ِ`.

**S2 form classifier → `Form`.** Features: periodicity of repeated line-final n-grams, rhyme-key regularity, line-length coefficient of variation, punctuation density, colloquial markers (`میاد نمیشه بذار دیگه یه`), mean words/hemistich. Hand-tuned thresholds first; replace with logistic regression only if it beats them on leave-poet-out.

**S3 `classical_rhymed` → rhyme grid (the big win).**
1. Candidate radif: n-gram (1–3 tokens) with ≥ 3 occurrences whose inter-occurrence gaps (chars) have CV ≤ 0.35; score = occurrences × n / (1 + CV). Candidate qafiyeh (no radif): final 2–3 letters shared regularly.
2. **A regularly repeating end-token ENDS a hemistich: the break goes AFTER it, never before.**
3. Hypotheses: H1 anchors end every hemistich (masnavi/rubai/matla'); H2 anchors end beyts (ghazal/qasida) → split each interval at its char-midpoint snapped to the best glue-valid boundary. Pick the hypothesis whose implied hemistich length lies in the prior (22–55 chars, mode 28–42); ties → lower hemistich-length variance.
4. Emit `beyts` (+ `stanzas` = one per beyt). Confidence = 1 − normalized variance × anchor coverage. If variance high → S5/S6.
Truth for tuning: Hafez (497 real ghazals) and all classical works with real beyts — flatten, predict, compare.

**S4 colloquial/free verse → boundary model.** Tiny logistic regression (write in TS, SGD; export `weights.json`; inference = dot product, no deps). One example per token gap. Features: glue class of left/right token; punctuation at gap; finite-verb-final guess (stem + `م ی د یم ید ند`, auxiliaries); **repeat features**: left token ends a repeated n-gram, right token starts one, repeat count (this lets the model learn start-vs-end direction of anaphora/epiphora instead of hard-coding it); chars since last break; z-score vs poet's mean line length; learned `P(token is line-final)` from training; conjunction/preposition flags; sentence-end flag. Train on works with real structure; **evaluate leave-poet-out only**. Calibrate (Platt or isotonic) so `confidence` is meaningful.

**S5 heuristic fallback.** Existing DP with glue constraints, no uniform-length target, orphan penalty. Confidence ≤ 0.4, flag `low_confidence`.

**S6 optional LLM pass** only if confidence < 0.7: batched, cached, budget-capped, fingerprint-verified, origin `llm`. Skip entirely if the model cannot be reached.

**S7 typo flags (no neural net).** Corpus token-frequency lexicon; flag a token with count ≤ 2 when an edit-distance-1/2 neighbour (Persian-confusion-aware cost) has ≥ 50× its count (`متظر→منتظر`). Store in `typos` (ratio). Flags only.

**S8 typeset layer.** Derived, separate: attach standalone `ی ها های تر ترین` to the previous word with ZWNJ. Never touch `می`.

## Acceptance (T1; report all)
- `shots.jsonl`: #1 every line that ends a hemistich in the source ends with «هنوز» (assert ≥ 90% of its lines); #4 beyts have 2 hemistichs of near-equal length; #2 and #3 produce no line starting with a glue token or ending dangling; all four print to ≤ 10-word lines.
- Corpus scans: 0 lines starting with a glue-suffix token; 0 lines ending on a dangling token without punctuation (counts printed; any >0 fails).
- Leave-poet-out boundary F1 **per form** (classical flattened Hafez target ≥ 0.97; free verse and colloquial: report truth, target ≥ 0.80), ECE ≤ 0.08, fingerprint preservation 100%, median runtime.
- If a target is missed twice → NEEDS-BOOST (see `_COMMON.md`).
