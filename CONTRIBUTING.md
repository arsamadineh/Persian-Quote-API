# Contributing to Persian Quote API

Thank you for your interest in contributing. This project is an academic-grade
Persian literature platform. All contributions are reviewed for data integrity,
linguistic correctness, and performance budgets.

## 1. How to contribute

1. Fork the repository and create a branch from `rebuild/v1`.
2. Make your change (code, data, or documentation).
3. Add or update tests and record evidence under `docs/evidence/`.
4. Update `lib/changelog.ts` with a Persian entry (see AGENTS.md §1).
5. Run `bun test`, `bun x tsc --noEmit`, and `bun run data:validate`.
6. Open a pull request against `rebuild/v1`.

## 2. Adding poems or data

New poems are contributed as validated JSON records, not SQL. Use the
`/contribute` flow on the site, which generates a validated JSON PR. All
contributed text must preserve letter identity (Rule R4): only whitespace and
structure changes are permitted, validated by
`s.replace(/[\s\u200c*\/]+/g, '')`.

## 3. Code style

- Strict TypeScript (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), no `any`.
- ESM only, zero external dependencies on the request hot path (Rule R10).
- Persian text: NFC, ZWNJ preserved, `<bdi>` for bidi isolation, correct
  punctuation spacing (`cleanLine`).
- No emojis in code, commits, or changelogs (Rule R5).
- Changelog entries in Persian, following AGENTS.md §1.

## 4. Performance budgets (Appendix D)

Router match ≤ 150 ns static / ≤ 400 ns param; cache-hit handler ≤ 10 µs;
`GET /v1/works/{id}` ≤ 50 µs; lexical search p95 ≤ 25 ms; cold start ≤ 100 ms.

## 5. Governance

All data changes are recorded in `lib/changelog.ts`. Legacy data is never
deleted (Rule R5); snapshots live under `data/legacy/` with SHA-256 checksums.
See `AGENTS.md` for the full contributor contract.
