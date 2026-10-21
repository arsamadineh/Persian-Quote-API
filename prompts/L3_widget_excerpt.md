# L3 — Excerpts and widget wiring · class S · after L1 · mode: normal
Read `_COMMON.md`. Production widgets ignore the excerpt engine (a "medium" widget showed 20+ lines).
1. Wire `pickExcerpt` (from the earlier `poem-structure.ts` design: score windows of whole lines; start bonus at stanza start / after sentence punctuation; end bonus on sentence end / stanza end; penalties for starting on continuation words and ending on dangling words; quadratic length penalty) into: the `<persian-quote>` web component, `/api/embed`, and the `/embed` builder preview. Classical forms = whole beyts only (1–2).
2. Word caps: small ≤ 25, medium ≤ 45, large ≤ 70; honor `max_words`. Seeded RNG for random picks (seed = request seed).
3. Precompute the best excerpt per size at build time; request time = lookup.
4. Rendering: each line its own block; `text-wrap: balance`; hanging indent for wrapped lines; beyts as two columns ≥ 480 px, stacked below; «…» + link when cut; a small «ساختار تقریبی» badge when `confidence < 0.7`; use the `typeset` layer for display.
5. Escape every interpolated string; `frame-ancestors *` only on the embed route.
**Done (T1):** unit test renders the 4 shot poems × 3 sizes and asserts word caps, no dangling end, line count ≤ 8 for medium. One 3-page smoke at T2 only. Core web component ≤ 4 KB gzip (measure once).
