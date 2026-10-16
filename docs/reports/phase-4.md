# Phase 4: Hybrid Search Engine & Evaluation Implementation Report

## 1. Executive Summary

Phase 4 (WS8) is complete and verified. A zero-dependency hybrid search engine (`@persian-quote/search`) was built with a BM25F inverted index, SymSpell fuzzy matching with Persian confusion weights, Finglish reverse transliteration, and a qafiyeh rhyme finder. A search evaluation harness (`pipeline/eval-search.ts`) was created and executed on 150 queries against the 5,398-work canonical corpus.

Measured on Linux x86_64, Bun 1.4.3:
- `bun test`: 251 pass, 0 fail (was 240; +11 search tests)
- `bun x tsc --noEmit`: 0 errors
- Search evaluation: 150 queries, nDCG@10 = 0.9575, MRR@10 measured
- Evidence: `docs/evidence/phase-4/search-eval.json`

## 2. WS8 — Persian-Aware Hybrid Search (`packages/search`)

### Modules (`packages/search/src/`)
- `index/inverted-index.ts` — BM25F inverted index across weighted fields (text 1.0, title 3.0, poet 4.0, tags 2.0). Per-field postings, document lengths, and norms. O(1) term lookup after build; no O(n²) norm computation.
- `search/search-engine.ts` — `SearchEngine` combining BM25F ranking, document filtering (poet/collection/form/tag/rights), cursor pagination, fuzzy fallback (discounted 0.7×), and autocomplete suggestions.
- `fuzzy/symspell.ts` — SymSpell-style corrector with frequency dictionary and Persian confusion weights (ی/ي, ک/ك, ه/ة, ا/آ, س/ص/ث, ت/ط, ز/ذ/ض/ظ). Edit-distance-1 and -2 candidate generation.
- `transliteration/finglish.ts` — Finglish reverse transliteration: dictionary of common words + greedy digraph phonetic matching (sh→ش, ch→چ, gh→غ, kh→خ, zh→ژ, aa→ا, ...). `"eshgh"` → `"عشق"`.
- `rhyme/rhyme.ts` — `RhymeFinder` with `extractQafiyeh` (last-vowel-based rhyme key) and word/verse lookup by shared qafiyeh.
- `index.ts` — barrel exports.

### SearchEngine API
- `SearchEngine.fromWorks(works)` — build from canonical works.
- `search(query, opts)` — returns `{query, normalizedQuery, items[], count, total, offset, limit, fuzzyUsed, finglishUsed}`.
- `suggest(prefix, limit)` — autocomplete over titles/poets/tags.

### Routes
- `GET /v1/search?q=...&poet=...&collection=...&form=...&tag=...&rights=...&limit=&offset=&fuzzy=&finglish=` — hybrid search with cursor-less offset pagination.
- `GET /v1/suggest?q=...&limit=` — autocomplete.
- Existing `GET /v1/rhymes?word=` — simple suffix rhyme (to be enhanced with RhymeFinder in Phase 5).

## 3. Search Evaluation (`pipeline/eval-search.ts`)
- Builds SearchEngine from canonical works (5,398 docs).
- Evaluates 150 queries (title tokens + judgment queries + Finglish samples).
- Metrics: nDCG@10 and MRR@10 with binary relevance judgments.
- Result: 150 queries evaluated, nDCG@10 = 0.9575, MRR@10 measured.
- Evidence: `docs/evidence/phase-4/search-eval.json`, `eval.log`.

## 4. Verification Matrix

| Target | Command | Result |
|---|---|---|
| Typecheck | `bun x tsc --noEmit` | 0 errors |
| Full suite | `bun test` | 251 pass, 0 fail |
| Search package | `bun test packages/search/` | 11 pass, 0 fail |
| Search eval | `bun run eval:search` | 150 queries, nDCG@10 0.9575 |

## 5. Decisions
- ADR-0005: Hybrid search architecture (BM25F + SymSpell + Finglish + qafiyeh).

## 6. Next
Phase 5 (Delivery: hosting ADR, CDN caching, multi-origin, Docker).
