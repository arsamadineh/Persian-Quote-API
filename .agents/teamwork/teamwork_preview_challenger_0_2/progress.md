# Progress — challenger_0_2

Last visited: 2026-10-16T02:30:00Z

- [x] Initialized BRIEFING.md and DISPATCH.md
- [x] Run baseline `bun test` (85 pass, 724 expect calls) and `bun run tests/e2e/runner.ts` (4 tiers pass)
- [x] Inspect test files in `tests/e2e/` (runner, harness, and 10 test suites across 4 tiers)
- [x] Verify Acceptance Fixture A1 (Salman Harati colophon & stanza cleanliness):
  - Place extraction verified, absence in body verified.
  - Defect found: `date_jalali` ({y:1364,m:2,d:12}) and `date_gregorian` ("1985-05-02") NOT verified (only raw string date).
  - Defect found: Excerpt assertion is vacuous (`lines.length > 0` on 8-word poem; does not assert `cutEnd: true` or ellipsis).
- [x] Verify Acceptance Fixture A2 (Nader Naderpour punctuation spacing & excerpt boundaries):
  - Punctuation spacing and clean excerpt boundaries verified.
  - Defect found: `structure.origin` and `confidence` NOT verified.
- [x] Verify Acceptance Fixture A3 (corpus-wide scans: whitespace, tatweel, hemistich counts):
  - Defect found: Artificially narrowed to `dataset.poetry.slice(0, 100)` which contains only 7 records!
  - Empirical verification on `dataset.all` (5,396 records) reveals 1,548 spaces before punctuation, 114 Tatweels, 42 digit/punct-only lines.
  - Defect found: "Every classical beyt has exactly two hemistichs" is completely unasserted (0 assertions).
- [x] Verify Letter-fingerprint immutability (R4):
  - Strictly checks `expect(cleanedFp).toBe(originalFp)`.
  - Defect found: `letterFingerprint` regex only strips `[\s\u200c*\/]`, but not directional marks `\u200e\u200f`. There are 11 poems in `shereno.json` with directional marks where `cleanLine` stripping breaks fingerprint equality.
- [x] Execute mutation tests to confirm tests catch regressions:
  - 4 mutations caught (cleanLine punctuation, colophon body stripping, R4 letter mutation, pagination boundary clamping).
  - 2 mutations missed (vacuous excerpt assertion in A1, unasserted classical beyt hemistich count in A3/A6).
- [x] Formulate verdict: **REJECT** for `acceptance-fixtures.test.ts` (due to vacuous assertions, incomplete contract validation, and artificial scope narrowing) while recognizing HTTP E2E suites as solid.
- [ ] Compile evidence and write handoff report (`handoff.md`)
- [ ] Send verdict and findings via `send_message`
