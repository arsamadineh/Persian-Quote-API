# L4 — Arud lab (`packages/arud`, tab `arud`) · class L · mode: teamwork lane (normal first; `/boost` via NEEDS-BOOST)
Read `_COMMON.md`. Implement `contracts/arud.ts`. This is the tool every literature student needs: تقطیع.

## Engine
1. **Letters → syllable lattice.** Persian omits short vowels, so do not force one reading. Long vowels `ا آ و ی` (و after خ before ا is silent: `خواب`), final `ه` = short vowel, tashdid doubles, word-final clusters close syllables. Unknown weights → `X`. Apply resyllabification (وصل) across word joins and the hemistich-final long/short equivalence.
2. **Meter table.** The ~30–40 common Persian meters (name, feet, base pattern, allowed substitutions/زحاف). **Build it from cited authoritative public references; put source URLs in the file header; never invent a pattern.** If a source's terms prohibit reuse, record facts only (patterns are facts) and cite.
3. **Matching = min-cost alignment** of the lattice against each meter's pattern automaton with substitution costs. `candidates` = top 3 by score.
4. **Poem-level voting.** All beyts of a ghazal/qasida share one meter: vote across beyts, then re-parse outliers under the winning meter. Only show a meter name when poem-level confidence ≥ 0.8; otherwise «نامطمئن» plus candidates.
5. Cache per hemistich; scanning a 100-beyt poem ≤ 150 ms.

## Evaluation (no labels needed, labels optional)
- **Consistency:** % of Hafez ghazals where ≥ 80% of beyts agree on one meter (target ≥ 90%); coverage = share of works with a confident meter.
- **Labels (evaluation only):** if a legitimately licensed source gives meters for some works, compute per-meter precision; **a meter name ships only if its measured precision ≥ 0.9**, else it displays as uncertain.
- Report: consistency, coverage, per-meter precision (where labels exist), top confusion pairs.

## UI (`src/tabs/arud/tab.ts`, framework-agnostic `mount`)
Syllable table per hemistich (text / weight L-S-X / foot / foot name), matched meter + substitutions applied in plain Persian, **editable weights** (tap a syllable to toggle; live re-match), «چرا این بحر؟» explanation, compare-two-hemistichs mode, print view. Footer: «دقت این ابزار: …٪ بر پایه …» from the measured numbers (H7).
**Done (T1):** numbers above printed; UI mounts in a jsdom test. If consistency < 0.85 after two attempts → NEEDS-BOOST.
