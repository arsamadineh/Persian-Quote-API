# L6 — Scholar tools (`packages/tools/{kwic,identify,collate,cite}`, tab `tools`) · class M · mode: teamwork lane
Read `_COMMON.md`. Implement the `contracts/tools.ts` functions below. Pure TS, browser-safe, ≤ 10 table-driven tests each.

## `kwic` / `wordFreq`
KWIC over normalized search text mapped back to display offsets; window in words; filter by poet; sort by left/right context. `wordFreq` on search-normalized tokens with a poetry-aware light stemmer toggle; top-N with per-10k normalization and poet comparison.

## `identifyVerse` — «این بیت از کیست؟» (the crowd-pleaser)
Index: char-3-gram inverted index over hemistichs and beyts (search-normalized, ZWNJ-insensitive). Query handling: normalize → exact phrase → shingle-overlap candidates → rerank by weighted Jaccard + token-level fuzzy using Persian-confusion edit costs; order-insensitive for partial memory. Return `VerseMatch` with `diff` against what the user typed (same/changed/missing/extra words) so they see how their memory differs. `disputed` when the corpus attribution status is disputed. Latency: ≤ 100 ms over 100k lines (measure once).
**Measure:** 20+ scripted queries from random corpus beyts, each damaged by 1–3 missing/changed words → report hit@1 and hit@5.

## `collate` — نسخه‌بدل
Inputs: ≥ 2 witnesses `{siglum,text}`. Normalization by user-toggleable equivalence classes (ک/ك, ی/ي, ه/ة, ZWNJ variants, hamza forms, digit scripts). Align at token level: Needleman–Wunsch for 2 witnesses; progressive/center-star for N. Output `CollationTable` (base reading + per-witness reading or null + `variant` flag). `collationToTei` emits TEI-P5 critical apparatus (`<app><lem/><rdg wit="#A"/></app>`). UI exports: CSV, RTL Word table (via L6's `docx` use), TEI snippet.

## `cite`
Persian academic styles. **Divans are cited by poet / poem number / beyt number** (the scholarly norm), e.g. `(حافظ، غزل ۱، بیت ۳)`; add a reference entry only when edition metadata exists (never invent page numbers). Styles: `apa-fa`, `chicago-fa`, `bibtex`, `csl-json`. UI: "copy as formatted RTL block" (HTML clipboard that pastes cleanly into Word/Google Docs) and `.docx` export with RTL paragraphs and run-level RTL, font stack `B Nazanin, Vazirmatn`. `docx` is the only new dependency allowed in this lane; lazy-load it.

## Tab `tools` (`src/tabs/tools/tab.ts`)
Sub-views: verse finder, concordance, frequency, collation, cite/export. Every result shows confidence/limits (H7).
**Done (T1):** tests green; hit@1/hit@5 printed; collation round-trip test on a 3-witness fixture; docx opens (zip + XML well-formedness check).
