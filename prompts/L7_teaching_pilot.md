# L7 — Teaching kit and pilot pack (`packages/tools/quiz`, tab `teach`, `pilot/`) · class M · mode: teamwork lane (small)
Read `_COMMON.md`.

## `makeQuiz` (deterministic by seed)
`cloze-radif` (hide the radif/qafiyeh word), `missing-word` (hide a content word; distractors from the poet's own vocabulary by frequency band), `order-hemistichs` (shuffle), `poet-mc` (distractors from the same era), `meter-mc` (only if L4 confidence ≥ 0.8; skip otherwise). Each item has an `explanation` citing the work id.
Exports: CSV, Moodle XML, GIFT, printable RTL HTML (print CSS, answer key on a separate page).

## Tab `teach`
- **Assignment generator:** pick a poet/form/difficulty → N questions + answer key.
- **Classroom (projector) mode:** huge type, reveal-line-by-line, hide/reveal radif, timer, beyt-by-beyt navigation with keyboard.
- **Annotations:** local-first (IndexedDB), W3C Web Annotation JSON-LD export/import. **Class pack:** reading list + annotations as a compressed URL fragment (`CompressionStream` + base64url, hard size guard with a clear error). No server, no accounts.

## `pilot/` (Persian, each ≤ 500 words, plain Markdown)
`proposal.md` (one-page letter template for a department head), `course-8weeks.md` (عروض، سبک‌شناسی، تصحیح متون، ادبیات معاصر using the tools, week by week), `assignments.md` (5 assignments with rubrics), `faq.md` («داده‌ها از کجا آمده‌اند؟ دقت چقدر است؟ چطور ارجاع بدهم؟ متن‌های خودم را می‌توانم بارگذاری کنم؟»). Numbers in these files come from `STATUS.md` measured values only (H4).
**Done (T1):** schema check on quiz exports (Moodle XML well-formed); class pack round-trips through a URL; determinism test (same seed → same quiz).
