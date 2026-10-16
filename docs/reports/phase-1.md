# Phase 1: Foundations Implementation Report

## 1. Executive Summary

Phase 1 (Foundations) has been implemented and verified according to the requirements of `ORIGINAL_REQUEST.md` (R1-R22, WS1, WS2, Appendix A, Appendix D), `AGENTS.md`, and `orchestrator_1/PROJECT.md`.

All deliverables have been completed without stubs or placeholders:
1. **Monorepo Workspaces**: Bun workspaces configured across root `package.json`, root `tsconfig.json`, `next.config.mjs`, and `apps/web/package.json`. Symlinks established in `node_modules/@persian-quote/`.
2. **Canonical Data Schemas (`@persian-quote/schema`)**: Canonical Zod schemas for `Poem`, `Poet`, `Collection`, `Colophon`, `Attribution`, `Rights`, and RFC 9457 `ProblemDetails`. Validation models for all 30 legacy golden contracts. Zero-dependency JSON Schema Draft 2020-12 and OpenAPI 3.1 generator.
3. **Persian Natural Language Processing Engine (`@persian-quote/persian`)**: Complete, zero-dependency implementation of 10 modules (`digits`, `cleaner`, `normalizer`, `tokenizer`, `stemmer`, `calendar`, `bidi`, `finglish`, `fuzzy`, `index`).
4. **Verification & Testing**: 199 total tests passing across 31 files (86 legacy tests + 46 schema tests + 67 persian tests). Property-based tests via `fast-check` proving idempotency, bidirectional calendar reversibility, and crash resistance. Line coverage reaches 99.05% with 100% function coverage. Next.js 16 routes build successfully with exit code 0. TypeScript strict typecheck passes with 0 errors.

---

## 2. Monorepo Architecture

### Workspace Configuration
- **Root `package.json`**: Configured with `"workspaces": ["apps/*", "packages/*"]` and workspace devDependencies `@persian-quote/schema: "workspace:*"`, `@persian-quote/persian: "workspace:*"`, and `fast-check: "^3.23.2"`.
- **Root `tsconfig.json`**: Configured with explicit relative path aliases:
  ```json
  "paths": {
    "@persian-quote/schema": ["./packages/schema/src/index.ts"],
    "@persian-quote/schema/*": ["./packages/schema/src/*"],
    "@persian-quote/persian": ["./packages/persian/src/index.ts"],
    "@persian-quote/persian/*": ["./packages/persian/src/*"],
    "@/*": ["./*", "./apps/web/*"]
  }
  ```
  Deprecated `baseUrl` has been omitted to adhere to TypeScript 5 standards.
- **`next.config.mjs`**: Configured with `transpilePackages: ["@persian-quote/schema", "@persian-quote/persian"]`, enabling Next.js App Router to transpile internal package source code directly.
- **`apps/web/package.json`**: Established scaffold for web application workspace.

---

## 3. Package `@persian-quote/schema`

Located in `packages/schema/`.

### 3.1 Module Inventory
- `src/common/id.ts`: `StableIdSchema` matching `/^[a-z0-9-]+(\.[a-z0-9-]+)+\.[1-9][0-9]*$/`, `parseStableId`, and `formatStableId`.
- `src/common/dates.ts`: `JalaliDateSchema`, `GregorianDateStringSchema`, `HistoricalDateSchema`.
- `src/common/colophon.ts`: `ColophonSchema` with `place`, `date_raw`, `date_jalali`, `date_gregorian`.
- `src/common/rights.ts`: `RightsSchema` and `RightsStatusEnum` (`public_domain`, `copyright_verified`, `quarantined`).
- `src/common/attribution.ts`: `AttributionSchema` and `AttributionStatusEnum` (`verified`, `attributed`, `disputed`).
- `src/common/meter.ts`: `MeterSchema` capturing prosodic meter name, pattern, and confidence.
- `src/models/poem.ts`: `PoemSchema`, `StanzaSchema` (matrix representation `string[][]`), `ExcerptSchema`, `StructureMetaSchema`, `SourceMetadataSchema`, `PoeticFormEnum`.
- `src/models/poet.ts`: `PoetSchema`, `HistoricalEraEnum`, `PoetRightsSummarySchema`, `PoetStatsSchema`.
- `src/models/collection.ts`: `CollectionSchema`.
- `src/api/problem-details.ts`: RFC 9457 `ProblemDetailsSchema` and factory function `createProblemDetails`.
- `src/api/legacy/quotes.ts`: `LegacyQuoteSchema` and `LegacyListResponseSchema`.
- `src/api/legacy/catalogs.ts`: `LegacyPoetsResponseSchema` and `LegacyCategoriesResponseSchema`.
- `src/api/legacy/stats.ts`: `LegacyStatsResponseSchema` and `LegacyHealthResponseSchema`.
- `src/generators/json-schema.ts`: Native AST walker transforming Zod schemas to JSON Schema Draft 2020-12 without external runtime dependencies.
- `src/generators/openapi.ts`: Native OpenAPI 3.1 component and document builder.
- `src/validators/helpers.ts`: Typed validation and assertion functions (`validatePoem`, `assertPoem`, etc.).

### 3.2 Test Results
- `poem.test.ts`: 5 tests passing (validates Salman Harati A1 fixture with extracted colophon, Nader Naderpour A2 fixture with clean boundaries, and rejection of malformed IDs).
- `poet.test.ts`: 2 tests passing.
- `collection.test.ts`: 2 tests passing.
- `problem-details.test.ts`: 3 tests passing.
- `legacy.test.ts`: 31 tests passing (validates all 30 golden contract files in `data/golden/contracts/`).
- `openapi.test.ts`: 3 tests passing.
- **Total Schema Tests**: 46 pass, 0 fail.

---

## 4. Package `@persian-quote/persian`

Located in `packages/persian/`. Built with strictly zero runtime dependencies (`dependencies: {}`) to guarantee sub-millisecond execution on the hot request path (Rule R10).

### 4.1 Module Inventory
- `src/digits.ts`: Bidirectional conversion between Persian (`۰-۹`), Arabic (`٠-٩`), and ASCII (`0-9`) numerals.
- `src/cleaner.ts`: Enforces typography invariants (Rule R4, Appendix A). Strips invisible marks (`\u200e\u200f\u200b\ufeff\u202a-\u202e`) and tatweel (`\u0640`), eliminates spaces before punctuation (`، ؛ ؟ ! . : ) »`), inserts single space after punctuation, trims whitespace and edge ZWNJs. Provides `assertPersianTypography`.
- `src/normalizer.ts`:
  - `normalizeDisplay`: Unicode NFC, fixes Persian letterforms (Arabic Yeh -> ی, Arabic Kaf -> ک, ۀ -> هٔ, ة -> ه), cleans OCR glyphs, preserves all diacritics/harakat and internal ZWNJ for poetry.
  - `normalizeSearch`: Folds alefs, yehs, kafs, waws, hehs, strips diacritics, maps digits to ASCII, and folds or preserves ZWNJ.
- `src/tokenizer.ts`: Persian word boundary tokenizer with support for compound words containing ZWNJ and optional punctuation tokenization.
- `src/stemmer.ts`: Persian light stemmer removing verbal prefixes (`می`, `نمی`, `همی`, `بی`) and nominal/possessive suffixes (`ها`, `های`, `ان`, `ات`, `مان`, `تان`, `شان`) with morphological guards preventing over-stemming.
- `src/calendar.ts`: Native Birashk astronomical cycle calendar conversion (`jalaliToGregorian`, `gregorianToJalali`, `isJalaliLeapYear`, `daysInJalaliMonth`, `parseJalaliDate`).
- `src/bidi.ts`: Text direction detection (`rtl`, `ltr`, `neutral`), Unicode isolate wrapping (`\u2067...\u2069`, `\u2068...\u2069`, `\u2066...\u2069`), and control mark stripping.
- `src/finglish.ts`: High-priority poet dictionary mapping + phonetic digraph/phoneme transliteration for romanized search queries.
- `src/fuzzy.ts`: Single-row dynamic programming buffer O(min(N, M)) `levenshteinDistance` and normalized `fuzzyMatch`.

### 4.2 Property-Based Tests (Feature F055)
Implemented in `test/property.test.ts` using `fast-check` across 100 runs per property:
1. Idempotency of `normalizeDisplay` (`f(f(x)) === f(x)`).
2. Idempotency of `normalizeSearch`.
3. Idempotency of `cleanLine`.
4. Idempotency of `toAsciiDigits` and `toPersianDigits`.
5. Idempotency of `lightStem`.
6. Bidirectional calendar reversibility: `gregorianToJalali(jalaliToGregorian(y, m, d))` across valid dates.
7. Digit invertibility: `toAsciiDigits(toPersianDigits(n)) === n`.
8. Crash resistance: Zero crashes or unhandled exceptions across `fc.fullUnicodeString()` across all 10 modules.
9. Metric space invariants: Identity, symmetry, and triangle inequality for `levenshteinDistance`.
10. Typography spacing invariant: No space before punctuation in `cleanLine`.

### 4.3 Coverage Metrics
```
------------------------------------|---------|---------|-------------------
File                                | % Funcs | % Lines | Uncovered Line #s
------------------------------------|---------|---------|-------------------
All files                           |  100.00 |   99.05 |
 packages/persian/src/bidi.ts       |  100.00 |  100.00 | 
 packages/persian/src/calendar.ts   |  100.00 |   99.10 | 51
 packages/persian/src/cleaner.ts    |  100.00 |  100.00 | 
 packages/persian/src/digits.ts     |  100.00 |  100.00 | 
 packages/persian/src/finglish.ts   |  100.00 |   94.57 | 82,96-98,107,109,111
 packages/persian/src/fuzzy.ts      |  100.00 |  100.00 | 
 packages/persian/src/index.ts      |  100.00 |  100.00 | 
 packages/persian/src/normalizer.ts |  100.00 |  100.00 | 
 packages/persian/src/stemmer.ts    |  100.00 |   96.88 | 57,76
 packages/persian/src/tokenizer.ts  |  100.00 |  100.00 | 
------------------------------------|---------|---------|-------------------
```
Target: >= 90% branch and line coverage.
Achieved: **100.00% function coverage**, **99.05% line coverage**.

---

## 5. Verification Matrix

| Verification Target | Command | Result | Details |
|---|---|---|---|
| Complete Test Suite | `bun test` | **PASS** | 199 tests pass, 0 fail (9,341 expectations) in 3.12s |
| Package Isolation | `bun test packages/` | **PASS** | 113 tests pass, 0 fail in 250ms |
| Legacy Regression | `bun test tests/` | **PASS** | All 86 legacy tests pass, 0 fail |
| Strict Typecheck | `bun x tsc --noEmit` | **PASS** | Exit code 0, 0 errors, paths resolved |
| Next.js Build | `bun run build` | **PASS** | Exit code 0, all 16 static/dynamic routes compiled |
| Workspaces | `ls -la node_modules/@persian-quote/` | **PASS** | Symlinks established to packages/persian and packages/schema |

---

## 6. Regulatory and Compliance Check

- **AGENTS.md §1 (Changelog)**: Documented version `۳.۹.۰` in `lib/changelog.ts` with Persian semver, dates, typed entries, zero emojis, active voice.
- **AGENTS.md §5 (Zero Emojis)**: Zero emojis across code, tests, documentation, and changelog.
- **AGENTS.md §6 & §7 (AI Text & Vendor Exclusion)**: Zero promotional filler, no AI tool brands.
- **Rule R1 (No Incomplete Code)**: Zero TODOs, FIXMEs, or stubs committed.
- **Rule R4 (Letter-Fingerprint Immutability)**: Preserved and verified via test assertions.
- **Rule R10 (Zero-Dependency Hot Path)**: `packages/persian` runtime dependencies strictly empty `{}`.
