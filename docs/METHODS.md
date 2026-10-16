# Persian Quote API — Methods

## 1. Data pipeline

Legacy JSON sources (`data/legacy/`) are preserved byte-identical with SHA-256
checksums (`data/legacy/SHA256SUMS`). The migration pipeline
(`pipeline/migrate-legacy.ts`) converts them into canonical JSONL records
(`data/canonical/`), assigns stable hierarchical IDs
(`poet-slug.collection-slug.number`), and records every legacy-to-canonical
mapping in `data/id-map.jsonl` with `legacy_index` to disambiguate duplicate
legacy IDs.

Records that fail structural validation (empty hemistichs, missing authors) are
quarantined in `data/quarantine/` with machine-readable reason codes
(`data/quarantine/manifest.json`). Validation is performed by
`pipeline/validate-data.ts` (`bun run data:validate`), which checks JSON Schema,
NFC Unicode normalization, non-empty lines, absence of leading/trailing
whitespace and punctuation-only lines, absence of raw ` / ` in rendered lines,
the classical two-hemistich invariant, colophon isolation, and letter-fingerprint
preservation.

## 2. Poem structure

The poem structure engine (`packages/poem`) performs:

- **Colophon extraction** (`extractColophon`): isolates trailing `place, date`
  footers (e.g. `تنکابن، 12/2/1364`) into structured metadata with Jalali and
  Gregorian conversion, restricted to plausible Jalali years (1250–1450) and
  Gregorian years (1850–2100). Two-digit years (`27/2/88`) are mapped to `13yy`.
- **Signal splitting** (`splitBySignals`): `*`, `□`, `■`, blank lines, double
  spaces, newlines, and ` / ` mark stanza and line breaks.
- **Letter fingerprint** (`letterFingerprint`): `s.replace(/[\s\u200c*\/□■]+/g,'')`
  is verified before and after restructuring; no character-altering heuristic is
  permitted (Rule R4).
- **Line reconstruction** (`reconstructLines`): dynamic-programming balanced
  line breaking for unstructured modern poems, penalizing breaks before
  inseparable clitics.

Structure boundaries are evaluated by `pipeline/eval-structure.ts`
(`bun run eval:structure`), reporting precision, recall, and F1.

## 3. Search

Hybrid Persian-aware search (`packages/search`) combines:

- **BM25F** over weighted fields: poet 4.0, title 3.0, tags 2.0, text 1.0.
- **SymSpell fuzzy matching** with Persian confusion weights
  (ی/ي, ک/ك, ه/ة, ا/آ, س/ص/ث, ت/ط, ز/ذ/ض/ظ).
- **Finglish reverse transliteration** (romanized → Persian, e.g. `eshgh` → `عشق`).
- **Qafiyhe rhyme finding** (`extractQafiyeh`, `RhymeFinder`).

Search quality is evaluated by `pipeline/eval-search.ts` (`bun run eval:search`)
over 150 queries, reporting nDCG@10 and MRR@10.

## 4. API engine

Tigh v1 (`packages/core`) is a zero-dependency Web-standard engine
(`fetch(Request) → Promise<Response>`) with:

- Compiled radix (Patricia) router with zero-allocation parameter extraction.
- Prebuilt response cache storing `Uint8Array` fragments (S3-FIFO + W-TinyLFU
  admission, single-flight coalescing) — no `JSON.stringify` on the hot path.
- GCRA rate limiter emitting IETF `RateLimit`/`RateLimit-Policy` plus legacy
  `X-RateLimit-*` headers.
- Circuit breaker (closed/open/half-open) and bounded DDSketch telemetry
  (P50–P99, no unbounded memory growth).
- Conformance adapters for Next.js, Cloudflare Workers, Bun.serve, and Node.js.

RFC 9457 `application/problem+json` is used for all errors.

## 5. Verification

- `bun test`: full suite, 260+ tests, 0 failures.
- `bun x tsc --noEmit`: strict TypeScript, 0 errors (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, no `any`).
- `bun run data:validate`: canonical data invariants, 0 violations.
- `bun run eval:structure`: structure F1 = 1.0.
- `bun run eval:search`: 150 queries, measured nDCG@10 and MRR@10.
