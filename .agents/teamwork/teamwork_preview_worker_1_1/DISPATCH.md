# Dispatch: worker_1_1 (Phase 1 Foundations Implementation Worker)

## Context
You are worker_1_1, the implementation worker for Phase 1 (Foundations).
Your working directory is `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_worker_1_1/`.

## Mandatory Reading Before Starting Work
1. `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md` (Full requirements, R1-R22, WS1, WS2, Appendix A, Appendix D)
2. `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/AGENTS.md` (Mandatory changelog rules in `lib/changelog.ts`, zero emojis, zero AI clichés, zero tool branding)
3. `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_1/PROJECT.md` (Architecture, milestones, and Feature Inventory)
4. Explorer 1_1 Handoff: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_1/handoff.md` (Monorepo architecture, package.json templates, tsconfig.json, next.config.mjs)
5. Explorer 1_2 Handoff: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_2/handoff.md` (packages/schema canonical Zod models, problem details, golden contracts, OpenAPI generator)
6. Explorer 1_3 Handoff: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_3/handoff.md` and analysis: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_3/analysis.md` (packages/persian algorithms, fast-check property tests, branch coverage)

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Detailed Task Requirements

### 1. Monorepo Configuration (WS1 / Explorer 1_1)
- Update root `package.json`:
  - Add `"workspaces": ["apps/*", "packages/*"]`.
  - Add devDependencies: `"fast-check": "^3.23.2"`, `"@persian-quote/schema": "workspace:*"`, `"@persian-quote/persian": "workspace:*"`.
- Update root `tsconfig.json`:
  - Configure paths:
    ```json
    "@persian-quote/schema": ["./packages/schema/src/index.ts"],
    "@persian-quote/schema/*": ["./packages/schema/src/*"],
    "@persian-quote/persian": ["./packages/persian/src/index.ts"],
    "@persian-quote/persian/*": ["./packages/persian/src/*"],
    "@/*": ["./*", "./apps/web/*"]
    ```
  - Ensure no deprecated `baseUrl` option is added.
- Update `next.config.mjs`:
  - Add `transpilePackages: ["@persian-quote/schema", "@persian-quote/persian"]`.
- Create `apps/web/package.json` scaffolding per Explorer 1_1 template.
- Run `bun install` to establish workspace symlinks in `node_modules/@persian-quote/`.

### 2. Implement `packages/schema` (WS1 / Explorer 1_2)
- Scaffold `packages/schema/package.json` and `packages/schema/tsconfig.json`.
- Implement full canonical models:
  - `src/common/id.ts`: `StableIdSchema` (`poet-slug.collection-slug.number`), parser & formatter.
  - `src/common/dates.ts`: `JalaliDateSchema`, `HistoricalDateSchema`.
  - `src/common/rights.ts`: `RightsSchema`, `RightsStatusEnum` (`public_domain`, `copyright_verified`, `quarantined`).
  - `src/common/attribution.ts`: `AttributionSchema`, `AttributionStatusEnum` (`verified`, `attributed`, `disputed`).
  - `src/common/meter.ts`: `MeterSchema`.
  - `src/common/colophon.ts`: `ColophonSchema`.
  - `src/models/poem.ts`: `PoemSchema`, `StanzaSchema`, `ExcerptSchema`, `PoeticFormEnum`. Stanzas represented as `string[][]` (`[beyt][mesra]`). Accompanying `text_plain`.
  - `src/models/poet.ts`: `PoetSchema`, `HistoricalEraEnum`.
  - `src/models/collection.ts`: `CollectionSchema`.
  - `src/api/problem-details.ts`: RFC 9457 `ProblemDetailsSchema` and factory function `createProblemDetails`.
  - `src/api/legacy/quotes.ts`, `catalogs.ts`, `stats.ts`: Legacy schemas validating the 30 golden contracts.
  - `src/generators/openapi.ts` & `json-schema.ts`: Native zero-dependency OpenAPI 3.1 & JSON Schema Draft 2020-12 generator.
  - `src/index.ts`: Re-export all schemas, types, and generators.
- Create tests in `packages/schema/test/`:
  - `poem.test.ts`: Test valid/invalid poems, verify Acceptance Fixtures A1 and A2 against PoemSchema.
  - `poet.test.ts` & `collection.test.ts`.
  - `problem-details.test.ts`: Conformance to RFC 9457.
  - `legacy.test.ts`: Validate all 30 golden contract files in `data/golden/contracts/`.
  - `openapi.test.ts`: Validate generated OpenAPI schemas.

### 3. Implement `packages/persian` (WS2 / Explorer 1_3)
- Scaffold `packages/persian/package.json` and `packages/persian/tsconfig.json`. Runtime dependencies must be empty `{}` (Zero-dependency hot path R10).
- Implement all 10 modules:
  - `src/normalizer.ts`:
    - `normalizeDisplay`: Unicode NFC, typography corrections (Arabic Yeh/Kaf to Persian, `ۀ` -> `هٔ`, strip tatweel `\u0640`), preserve diacritics and internal ZWNJ.
    - `normalizeSearch`: Fold alef (`آأإٱ` -> `ا`), yeh (`يىئ` -> `ی`), kaf (`ك` -> `ک`), waw hamza (`ؤ` -> `و`), heh (`ةۀ` -> `ه`), strip diacritics (`[\u064B-\u0652\u0654\u0670]`), map digits to ASCII, unify ZWNJ.
  - `src/cleaner.ts`:
    - `cleanLine`: Strip tatweel and invisible marks (`\u200e\u200f\u200b\ufeff`), collapse whitespace, fix punctuation spacing (no space before `، ؛ ؟ ! . : ) »`, single space after, no space after `( «`), trim whitespace and edge ZWNJs. Must preserve letter fingerprint immutability (R4).
  - `src/tokenizer.ts`: `tokenize` with word boundary and ZWNJ handling.
  - `src/stemmer.ts`: `lightStem` removing common Persian plural suffixes (`ها`, `های`, `ان`, `ات`), verbal prefixes (`می`, `نمی`), and possessives without over-stemming.
  - `src/digits.ts`: `toAsciiDigits`, `toPersianDigits`, `toArabicDigits`.
  - `src/calendar.ts`: Native astronomical Birashk algorithm for `jalaliToGregorian` and `gregorianToJalali`, `isJalaliLeapYear`, `daysInJalaliMonth`, `parseJalaliDate`.
  - `src/bidi.ts`: `bidiIsolate` wrapping strings in Unicode First Strong Isolate (`\u2068...\u2069`), `detectDirection`, `stripBidiControls`.
  - `src/finglish.ts`: `finglishQuery` with high-priority poet dictionary lookup + phoneme decomposition.
  - `src/fuzzy.ts`: Native single-row dynamic programming buffer `levenshteinDistance` and `fuzzyMatch`.
  - `src/index.ts`: Re-export all functions.
- Create tests in `packages/persian/test/`:
  - Unit tests covering all 10 modules ensuring high branch coverage.
  - `property.test.ts` using `fast-check` covering:
    - Idempotency (`f(f(x)) === f(x)`) for `normalizeDisplay`, `normalizeSearch`, `cleanLine`, `toAsciiDigits`, `toPersianDigits`, `lightStem`.
    - Bidirectional reversibility: `gregorianToJalali(jalaliToGregorian(y, m, d))` round-trip across valid dates.
    - Digit invertibility.
    - Crash resistance: `fc.fullUnicodeString()` across all functions with 0 crashes.
    - Levenshtein metric invariants (identity, symmetry, triangle inequality).
  - Verify branch coverage with `bun test --coverage packages/persian/test` reaches >= 90%.

### 4. Verification and Reports
- Run `bun test`: All 86 legacy tests + new schema tests + new persian tests must pass.
- Run `bun run build`: Next.js must build all routes with exit code 0.
- Run `bun x tsc --noEmit`: Strict typecheck must exit 0.
- Author `docs/reports/phase-1.md` documenting architecture, test counts, branch coverage metrics, and verification steps.
- Update `docs/agent/PROGRESS.md`.
- Update `lib/changelog.ts` strictly following AGENTS.md rules:
  - Version: Persian digits (e.g. `"۳.۹.۰"`).
  - `isoDate`: "2026-10-16".
  - `date`: Persian date (e.g. `"۲۵ مهر ۱۴۰۵"`).
  - Typed changes (`added`, `changed`, etc.).
  - Fluent Persian, active voice, zero emojis, zero AI clichés, zero vendor names.

Write your handoff report to `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_worker_1_1/handoff.md` and report back via send_message.


## 2026-10-16T03:28:33Z
You are worker_1_1, the implementation worker for Phase 1 (Foundations). Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_worker_1_1/.
Read:
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/AGENTS.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_1/PROJECT.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_worker_1_1/DISPATCH.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_1/handoff.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_2/handoff.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_3/handoff.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_3/analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Execute the Phase 1 tasks completely:
1. Configure Bun workspaces in root package.json, root tsconfig.json, next.config.mjs, and apps/web/package.json. Run bun install.
2. Implement packages/schema (@persian-quote/schema) with canonical Zod models (Poem, Poet, Collection, Stanza, Colophon, Attribution, Rights, ProblemDetails RFC 9457), legacy schemas for 30 golden contracts, and native OpenAPI 3.1 & JSON Schema generator. Add tests verifying fixtures A1/A2 and all 30 legacy contracts.
3. Implement packages/persian (@persian-quote/persian) zero-dependency NLP engine across all 10 modules: normalizeDisplay, normalizeSearch, cleanLine (preserving letter fingerprint R4), tokenize, lightStem, toAsciiDigits, toPersianDigits, toArabicDigits, jalaliToGregorian, gregorianToJalali, bidiIsolate, finglishQuery, and levenshteinDistance/fuzzyMatch. Add comprehensive unit tests and fast-check property-based tests verifying idempotency, reversibility, crash-resistance, and achieve >= 90% branch coverage.
4. Verify: bun test (all 86 existing tests + new package tests), bun run build (Next.js 16 routes build 0 errors), and bun x tsc --noEmit.
5. Author docs/reports/phase-1.md, update docs/agent/PROGRESS.md, and update lib/changelog.ts per AGENTS.md (Persian semver, dates, typed changes, zero emojis, active voice).
Write your handoff report to /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_worker_1_1/handoff.md and report back via send_message.
