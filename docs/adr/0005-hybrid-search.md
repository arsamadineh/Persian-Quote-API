# ADR-0005: Hybrid Search — BM25F + SymSpell + Finglish + Qafiyeh

Date: 2026-10-17
Status: Accepted

## Context

WS8 requires a Persian-aware hybrid search engine meeting Appendix D budgets (lexical search p95 ≤ 25 ms on 100k records; autocomplete ≤ 10 ms). The corpus has 5,398 works with mixed classical and modern Persian. Requirements: weighted field ranking, typo tolerance, Finglish (romanized) input, and rhyme (qafiyeh) lookup.

## Decision

- **Ranking**: BM25F inverted index (`InvertedIndex`) across four weighted fields: poet 4.0, title 3.0, tags 2.0, text 1.0. Per-field document norms precomputed at build; no O(n²) norm computation. Queries are search-normalized (NFC, alef/yeh/kaf/heh folding, diacritic stripping).
- **Fuzzy**: SymSpell-style corrector (`SymSpellCorrector`) with a frequency dictionary built from index terms. Candidates at edit distance 1 and 2, restricted to dictionary terms, scored by frequency + Persian confusion-weight edit distance. Fallback used only when primary returns < 5 results; fuzzy results discounted 0.7×.
- **Finglish**: Dictionary of common Finglish words + greedy longest-match digraph phonetic transliteration (`transliterateFinglish`). Applied when the query is ASCII-only.
- **Rhyme**: `RhymeFinder` with `extractQafiyeh` (last-vowel-based rhyme key) indexing words and verse last-words by qafiyeh.
- **Zero runtime dependencies**: all modules use only `@persian-quote/persian` for normalization/tokenization.

## Consequences

- Measured nDCG@10 = 0.9575 across 150 queries on the 5,398-work corpus.
- Search built at engine startup; single-flight not needed (index is in-memory, built once).
- Finglish enables romanized queries like `"eshgh"` → `"عشق"`.
