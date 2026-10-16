# Phase 2: Canonical Data & Structure Engine Implementation Report

## 1. Executive Summary

Phase 2 (WS1, WS2/WS3, WS4 foundations) is complete and verified. Legacy JSON sources were migrated into canonical JSONL records with stable hierarchical IDs, rights audit, quarantine tracking, schema validation, and structure evaluation. All Appendix A fixtures pass.

Measured on Linux x86_64, Bun 1.4.3:
- Canonical works: 5398 (497 Hafez + 4400 Shereno + 7 classical + 494 aphorisms)
- Poets: 45, Collections: 59, ID mappings: 5398
- Quarantine events: 4 (3 empty hemistichs filtered, 1 missing author attributed)
- Validation: `bun run data:validate` passes with zero invariant violations
- Structure F1: line 1.0, stanza 1.0, fingerprint preservation 1.0
- Tests: `bun test` 216 pass, 0 fail; `bun x tsc --noEmit` 0 errors

## 2. WS1 — Canonical Data Migration & Provenance

### Inputs (byte-identical, R5)
- `data/legacy/hafez.json` (497 records, duplicate IDs 3, 10, 139, 260)
- `data/legacy/shereno.json` (4400 records)
- `data/legacy/poetry-quotes.json` (7 records)
- `data/legacy/non-poetry-quotes.json` (494 records)

### Pipeline
- `pipeline/migrate-legacy.ts` (`bun run build:data`):
  - Hafez: trim and filter empty hemistichs per couplet; keep single-hemistich fragments with quarantine reason `empty_hemistich_filtered`; drop fully empty poems (none occurred).
  - Shereno: `analyzeStructure` with defensive re-filtering; map extracted colophon to `ColophonSchema`; fallback title and collection titles when blank.
  - Classical: split on ` / `, filter empties, quarantine if empty.
  - Aphorisms: fallback author to `نامشخص` with slug `general`; quarantine event `missing_author_attributed_to_unknown` for ID 487.
  - Synchronous JSONL writes to avoid truncation.
- Outputs:
  - `data/canonical/works.jsonl` (5398), `hafez.jsonl` (497), `shereno.jsonl` (4400), `poetry.jsonl` (7), `non-poetry.jsonl` (494)
  - `data/canonical/poets.jsonl` (45), `collections.jsonl` (59)
  - `data/id-map.jsonl` and `data/canonical/id-map.jsonl` (5398 rows with `legacy_index` disambiguation)
  - `docs/audit/rights-audit.csv` (45 poets, display policies `full` and `excerpt`)
  - `data/quarantine/manifest.json` and `quarantine.jsonl` (4 events)
- Evidence: `docs/evidence/phase-2/migrate.log`

### Rights Audit
- Classical masters (`hafez`, `saadi`, `rumi`, `ferdowsi`, `forough-farrokhzad` public domain in registry) use `full`.
- Contemporary poets default to `copyright_verified` with `excerpt` for educational use.
- See `docs/audit/rights-audit.csv`.

## 3. WS2 & WS3 — Poem Structure Engine

### Changes in `packages/poem`
- `cleanLine`: NFC normalization, punctuation spacing fix for `!`/`:` before `]`, stripping of leading/trailing `/*□■`.
- `letterFingerprint`: NFC plus stripping of `□■` as signals.
- `splitBySignals`: stanza breaks on `*` and `□■` and blank lines; line breaks on double space, newline, and ` / `; filtering of digits/punctuation-only signal lines.
- `extractColophon`: prefix restricted to month/season names; 2-digit `d/m/yy` mapped to `13yy`; year-only dates with double-space separation extracted.
- `packages/persian/cleaner.ts`: matching NFC and bracket fixes.

### Evaluation Harness
- `pipeline/eval-structure.ts` (`bun run eval:structure`):
  - Round-trip 995 multi-line works through double-space and ` * ` signals.
  - Line boundary P/R/F1: 1.0/1.0/1.0 (TP 24377, FP 0, FN 0).
  - Stanza boundary P/R/F1: 1.0/1.0/1.0 (TP 4839, FP 0, FN 0).
  - Fingerprint preservation: 1.0.
- Evidence: `docs/evidence/phase-2/structure-f1.json`, `eval.log`

### Appendix A
- A1 (Salman Harati): place `تنکابن`, date `12/2/1364`, Jalali 1364/2/12, Gregorian 1985-05-02; body contains no colophon tokens; no double-space runs; excerpt 21 words within 25.
- A2 (Nader Naderpour): `همواره، در` with single space after `،`; no space before punctuation.
- A3: zero whitespace-edge, zero punct-only, zero ` / ` leaks; 4184/4184 classical beyts with 2 hemistichs (3 partial fragments allowlisted in ADR-0003).
- E2E: `bun test tests/e2e/tier1-features/acceptance-fixtures.test.ts` 6 pass.

## 4. WS4 Foundations (Excerpt, Rhyme, Meter)

Existing engines verified through `packages/poem` tests (15 pass):
- `pickExcerpt` respects `maxWords` with whole-line windows and cut flags.
- `detectRadifAndQafiyeh` and `detectMeter` annotate classical meters.
- `determineAttribution` classifies canon versus modern collections.

## 5. Verification Matrix

| Target | Command | Result |
|---|---|---|
| Migration | `bun pipeline/migrate-legacy.ts` | Pass, 5398 works, log in `docs/evidence/phase-2/migrate.log` |
| Validation | `bun run data:validate` | Pass, zero violations, log in `validate.log` |
| Structure eval | `bun pipeline/eval-structure.ts` | Pass, F1 1.0, JSON in `structure-f1.json` |
| Acceptance | `bun test tests/e2e/tier1-features/acceptance-fixtures.test.ts` | 6 pass |
| Full suite | `bun test` | 216 pass, 0 fail |
| Packages | `bun test packages/` | 130 pass, 0 fail |
| Typecheck | `bun x tsc --noEmit` | 0 errors |

## 6. Decisions

- ADR-0001: JSONL with stable hierarchical IDs and `legacy_index` disambiguation.
- ADR-0002: signal handling for `□■`, digits-only filtering, 2-digit year mapping, NFC.
- ADR-0003: partial beyt allowlist for three Hafez fragments.

## 7. Next

Phase 3 (Tigh v1 engine, storage build, API v1) can now build on stable canonical data and validated structure primitives.
