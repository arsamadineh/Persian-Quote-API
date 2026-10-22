# Original User Request

## 2026-10-16T01:42:01Z

Rebuild "Persian Quote API" (pq.adicon.ir) from an in-memory JSON prototype into the reference open, university-grade Persian literature platform with canonical data modeling, a zero-dependency high-performance engine (Tigh v1), Persian-aware hybrid search, academic infrastructure, and modern web experience.

Working directory: /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API
Integrity mode: development

---

## 0. WHO YOU ARE AND HOW TO READ THIS

You are an autonomous, principal-level engineering agent. You combine five people in one: a staff backend/performance engineer, a data engineer, a Persian-language NLP specialist, an SRE, and a technical writer. You have full authority over this repository, including the right to restructure it, replace the data layer, and rewrite the engine, subject to the rules in section 2.

Every section is binding. Read all of it before touching code. Where it says MUST, NEVER, or "done means", that is a hard requirement. Where it says "evaluate", you MUST run a time-boxed, measured experiment and record the result. Guessing is not evaluating.

The owner is a solo developer who built and funds this project personally. The project must therefore be: cheap to run (target: near-zero cost at tens of millions of requests per month through caching), low-maintenance, and safe to open to the whole world and to universities.

You will work for a long time. That is expected. Do not stop early, do not summarize instead of doing, and do not hand work back that you could have done yourself.

---

## 1. MISSION AND NORTH STAR

Turn today's "9,000+ poems, in-memory JSON, custom engine" project into the reference open platform for Persian literature: correct data, beautiful structure, extremely fast, academically trustworthy, open and extensible, and cheap to operate. It must be able to grow 100x (to ~1M records and many millions of requests per day) without redesign.

Six pillars:
1. Correct — text is faithful, attribution is honest, structure (lines, stanzas, couplets) is right, rights are tracked.
2. Structured — poems are first-class structured objects (stanzas, lines, hemistichs, colophon, meter, rhyme), not strings.
3. Fast — measured, published, regression-gated performance. CDN-first; origin work is minimal.
4. Trustworthy for research — stable IDs, versioned immutable snapshots, citation, provenance, bulk data, reproducibility, DOI.
5. Open and extensible — OpenAPI 3.1, typed SDKs, MCP server, Web Component widget, plugin-style engine, self-hostable in one command, works offline.
6. Operable — real observability, runbooks, CI gates, security and privacy by design.

---

## 2. NON-NEGOTIABLE OPERATING RULES

- R1 — Finish what you start. Forbidden in committed code/docs: TODO, FIXME (unless tracked in PROGRESS.md as an owner decision), "left as an exercise", "similar for other endpoints", stubbed functions, mock data in production paths, commented-out code, placeholder numbers.
- R2 — Verify by running. Every claim needs evidence: command output, test results, benchmark logs, Playwright screenshots saved under docs/evidence/<phase>/.
- R3 — Never fabricate numbers. Counts, latencies, accuracy, hit rates, dataset sizes: measured, with raw output saved. Replace all placeholder values in live docs.
- R4 — Never alter poem wording from memory. All changes to poem content must be: (a) deterministic, documented normalization; (b) whitespace/structure-only changes validated by a letter-fingerprint check (identical letters after removing whitespace, ZWNJ, *, /); (c) imported from a cited source. LLMs may only change whitespace and structure, never words. Any model output that changes a letter is discarded.
- R5 — Never delete data. Keep byte-identical snapshot of original JSON under data/legacy/ with SHA-256 checksums. Quarantined records go to data/quarantine/ with a reason code.
- R6 — Backward compatibility. Every existing /api/** URL and response shape keeps working (lines=auto|separators|raw, line_origin, cacheBust, random, limit, 5 embed themes). New functionality lives under /v1. Record legacy contract snapshots in Phase 0.
- R7 — Be autonomous. Ask owner only when truly blocked. Otherwise decide, write Architecture Decision Record (docs/adr/NNNN-title.md), and proceed.
- R8 — Persist state. Maintain docs/agent/PROGRESS.md with checklists, status, measured numbers, decisions, and owner questions.
- R9 — Git discipline. Branch rebuild/v1. Small atomic commits, conventional commit messages, every commit green. Deploy-ready previews plus docs/runbooks/deploy.md.
- R10 — Dependency policy. Pin exact versions of latest stable dependencies. Request hot path stays zero-dependency. ADR entry for any new runtime dependency.
- R11 — Security and privacy by design. No secrets in repo; provide .env.example.
- R12 — Rights and provenance. Record license/terms, URL, retrieval date, transformations for every source.
- R13 — Persian correctness. Unicode NFC, ZWNJ, Persian/Arabic/Latin digits, punctuation, bidi mixing, font shaping. Never test only with ASCII.
- R14 — Performance is a feature. Budgets in Appendix D enforced in CI.
- R15 — Be ambitious and courageous. Replace engine, data model, repo layout if measurements demonstrate superiority.
- R16 — Honest reporting. End of every phase write docs/reports/phase-N.md.
- R17 — Code quality. TypeScript strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, no any, ESM only, Zod validation, files under ~400 lines, TSDoc.
- R18 — Do not break production UI. Capture Playwright screenshots before changing anything (Phase 0) and compare after.
- R19 — Use tools. Inspect whole repo, run app, fetch live site, use Playwright.
- R20 — Time-box and escalate smartly. Change approach and write ADR if failing twice.
- R21 — Hostile reviewer self-review before closing each phase.
- R22 — Languages. Code, comments, commits, ADRs in English. Public UI and public docs: Persian primary, English available. Note that any changes to lib/changelog.ts must adhere to repository guidelines (Farsi changelog, no emoji).

---

## 3. GROUND TRUTH — WHAT EXISTS TODAY

- Stack: Next.js 15 App Router, TypeScript, Bun for tooling/tests, Vercel deployment. Fonts: Vazirmatn. Pages: /, /docs, /examples, /embed, /api/embed, /sakhtar, /contribute, /changelog, /privacy, /terms.
- Data: lib/data/hafez.json, shereno.json, poetry-quotes.json, non-poetry-quotes.json loaded into memory by lib/data/store.ts.
- Engine: Tigh 0.0.1-beta in lib/engine/.
- Known defects:
  - D1: Footer leaks into poem body (تنکابن، 12/2/1364 rendered as poem lines).
  - D2: Raw gaps inside rendered lines (double spaces survive).
  - D3: Punctuation spacing (space before comma).
  - D4: Line breaks are guessed with ~24 chars/line target.
  - D5: Widget truncation is naive (can start mid-sentence, end on dangling word).
  - D6: Serverless state is per-instance.
  - D7: Substring search only.
  - D8: Inconsistent response shapes.
  - D9: Over-aggressive normalization destroying display fidelity.
  - D10: Blanket "Public Domain" claim unverified for modern poets.
  - D11: Contribution flow builds SQL for nonexistent database.
  - D12: Placeholder and obsolete tags in HTML head.
  - D13: Personal paths hardcoded in docs prompts.
  - D14: Fake/stale latency numbers.
  - D15: Docs inaccuracies.
  - D16: No stable IDs, no versioning, no citation.
  - D17: Inadequate pagination contract.
  - D18: Ad hoc error format.
  - D19: No ETag, Server-Timing, or precompression.
  - D20: Single origin reachability issues for Iranian universities.

---

## 4. TARGET ARCHITECTURE & REPO LAYOUT

Monorepo using Bun workspaces:
- apps/web: Next.js UI (home, docs, playground, reader, widget builder, /sakhtar, contribute)
- apps/api: Runtime entry points/adapters (workers, bun, node, docker)
- packages/core: Tigh v1 (router, cache, limiter, breaker, metrics, http helpers; ZERO deps)
- packages/schema: Zod schemas -> TS types, JSON Schema, OpenAPI components
- packages/persian: normalizer, tokenizer, light stemmer, digits, jalali, bidi, finglish-query
- packages/poem: structure engine, colophon, excerpt picker, radif/qafiyeh, meter
- packages/search: index builder + runtime searcher (lexical, fuzzy, semantic, hybrid)
- packages/store: DataSource interface, artifact reader/writer, SQLite adapter
- packages/sdk-ts & packages/sdk-py: TypeScript and Python SDKs
- packages/mcp: MCP server (Streamable HTTP + stdio)
- packages/widget: <persian-quote> Web Component
- pipeline/: build & evaluation steps
- data/: canonical, legacy, quarantine, golden
- docs/: adr, audit, evidence, reports, runbooks, agent/PROGRESS.md

---

## 5. WORKSTREAMS

- WS1: Canonical data model (Zod), stable IDs (poet-slug.collection-slug.number), poet registry, rights audit (docs/audit/rights-audit.csv), migration pipeline, data validation (bun run data:validate).
- WS2: Persian text layer (packages/persian): normalizeDisplay vs normalizeSearch, cleanLine, tokenize, lightStem, jalali conversion, bidi, finglishQuery, fuzzy helpers.
- WS3: Poem structure engine (packages/poem): colophon extraction (place, date), signal splitting, letter-fingerprint-validated LLM inference, heuristic fallback, rendering contract (stanzas/beyts + text_plain), boundary F1 evaluation harness (pipeline/eval-structure.ts).
- WS4: Excerpts and derived literary features: pickExcerpt, radif & qafiyeh rhyme detection, meter annotation, attribution status flagging, tag review.
- WS5: Build pipeline and immutable artifacts (pipeline/): reproducible bun run build:data producing runtime store shards, search index, SQLite DB with FTS5, static JSON shards, bulk exports (JSONL.zst, CSV, Parquet, TEI-P5 XML).
- WS6: Tigh v1 core (packages/core): zero-dependency fetch(Request) -> Response, compiled radix router, prebuilt response cache (S3-FIFO/W-TinyLFU) with single-flight request coalescing, GCRA rate limiter, circuit breaker, bounded telemetry, adapter conformance suite.
- WS7: API v1 and legacy compatibility layer: /v1/works, /v1/works/{id}, /v1/works/random, /v1/daily (Tehran midnight), /v1/fal, /v1/poets, /v1/collections, /v1/suggest, /v1/meta, /v1/health. Legacy /api/** contract parity. OpenAPI 3.1. RFC 9457 problem+json.
- WS8: Search: BM25F lexical, fuzzy/SymSpell, Finglish query understanding, hybrid semantic search with open embeddings and graceful fallback, rhyme finder (/v1/rhymes?word=), search evaluation set (>=150 queries) with nDCG@10 and MRR@10 baselines.
- WS9: Delivery & Operations: hosting benchmark ADR (Cloudflare Workers vs Vercel vs VPS), CDN caching evidence (curl transcripts), multi-origin mirrors, Docker containerization, DR drill, cost model.
- WS10: Web Component <persian-quote> (<4 KB gz, Shadow DOM, CSS custom props, accessible), hardened iframe /api/embed, server-side share cards.
- WS11: Web experience: reader pages (/p/{id}, /poets/{id}), instant search UI, playground with tested code snippets, live /sakhtar metrics, WCAG 2.2 AA accessibility, Vazirmatn font subset.
- WS12: Academic layer: CITATION.cff, Zenodo DOI preparation, bulk data cards, TS & Python SDKs with offline support, runnable Jupyter notebooks.
- WS13: AI-native surface: MCP server (Streamable HTTP + stdio), llms.txt and llms-full.txt, updated AGENTS.md.
- WS14: Quality engineering & CI/CD: unit, property-based, router fuzz, legacy contract tests, Schemathesis, Playwright E2E visual regression, axe accessibility, Lighthouse CI, dependency scanning. Modernized contribution workflow.
- WS15: Governance: README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, GOVERNANCE, ROADMAP, CHANGELOG, API-POLICY.

---

## 6. PHASES & EXIT GATES

- Phase 0 — Recon and safety net: Audit repo, measure baseline performance, snapshot legacy data to data/legacy/ with checksums, capture golden legacy contract snapshots, capture Playwright visual screenshots, write docs/audit/00-recon.md.
- Phase 1 — Foundations: Monorepo setup, packages/schema, packages/persian with 90%+ branch coverage and property tests.
- Phase 2 — Data: WS1 migration, WS3 structure engine with evaluation harness, WS4 excerpt/radif/qafiyeh, rights audit, acceptance fixtures A1, A2, A3 pass.
- Phase 3 — Engine, artifacts, API: WS5 storage benchmark ADR, WS6 Tigh v1, WS7 v1 + legacy layer + OpenAPI 3.1, adapter conformance green.
- Phase 4 — Search: WS8 hybrid search, rhyme finder, evaluation harness and baselines committed, graceful degradation chaos test.
- Phase 5 — Delivery and operations: WS9 hosting benchmark ADR, CDN caching verification, multi-origin mirrors, Docker containerization, load test report.
- Phase 6 — Experience and ecosystem: WS10 Web Component, WS11 Web app, WS12 SDKs & notebooks, WS13 MCP server.
- Phase 7 — Academic hardening, governance, final audit: WS14/WS15 governance docs, Appendix C self-audit checklist, docs/reports/FINAL.md.

---

## APPENDIX A — Acceptance Fixtures from Production (Must Pass)

- A1 — Salman Harati ("از آسمان سبز"):
  - Colophon extracted: text.colophon = { place: "تنکابن", date_jalali: {y:1364,m:2,d:12}, date_gregorian: "1985-05-02" }; none of "تنکابن", "12", "2", "1364" appear in stanzas.
  - No double space runs inside lines; passes cleanLine.
  - Poem rendered line-per-block; continuation lines visibly styled.
  - pickExcerpt(max_words=25) returns clean whole-line window, cutEnd is true with ellipsis.
- A2 — Nader Naderpour ("خون و خاکستر"):
  - No space before "،"; single space after it ("همواره، در").
  - Structure comes from evaluated best strategy; structure.origin and confidence recorded.
  - Excerpts end on clean sentence/stanza boundaries.
- A3 — Corpus-wide scans:
  - Zero lines starting/ending with whitespace.
  - Zero lines containing only digits or punctuation.
  - Zero spaces before "، ؛ ؟". No U+0640. No raw " / " inside rendered lines.
  - Every classical beyt has exactly two hemistichs.

---

## APPENDIX D — Performance Budgets

- Router match: static <= 150 ns, param <= 400 ns.
- Cache-hit handler CPU: <= 10 µs.
- GET /v1/works/{id} warm handler CPU: <= 50 µs.
- Cold start to first byte: <= 100 ms (current) / <= 250 ms (100x).
- Lexical search p95 server compute: <= 25 ms (100k) / <= 80 ms (1M).
- Hybrid search p95: <= 250 ms with automatic lexical fallback.
- Suggest server time: <= 10 ms.
- CDN cached TTFB p95: <= 50 ms.
- Uncached origin p99: <= 150 ms.
- Memory at 100x data: <= 128 MB.
- Web initial JS: <= 100 KB gzip.
- Widget core: <= 4 KB gzip.
- Load test: sustain >= 5,000 req/s cached reads.

---

## REFERENCE FILES (Starting Points)

### poem-structure.ts
```typescript
export type Stanzas = string[][];
export type Colophon = { place?: string; date: string };
export const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
export const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export function toAsciiDigits(s: string): string {
  return s.replace(/[۰-۹٠-٩]/g, (c) => {
    const p = PERSIAN_DIGITS.indexOf(c);
    return String(p >= 0 ? p : ARABIC_DIGITS.indexOf(c));
  });
}

export function cleanLine(s: string): string {
  return s
    .replace(/[\u200e\u200f]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([،؛؟!.:)»])/g, '$1')
    .replace(/([(«])\s+/g, '$1')
    .replace(/([،؛؟])(?=[^\s\d)»"'،؛؟!.])/g, '$1 ')
    .trim();
}

export function extractColophon(raw: string): { body: string; colophon?: Colophon } {
  const ascii = toAsciiDigits(raw);
  const m = ascii.match(/(?<!\d)(?:\d{1,2}\s*[\/\-.\s]\s*){0,2}(\d{4})\s*$/);
  if (!m || m.index === undefined) return { body: raw };

  const year = Number(m[1]);
  const plausible = (year >= 1250 && year <= 1450) || (year >= 1850 && year <= 2100);
  if (!plausible) return { body: raw };

  const date = m[0].trim().replace(/\s*[\/\-.\s]\s*/g, '/');
  let head = raw.slice(0, m.index).replace(/[\s\/\-–—]+$/, '');

  const chunks = head.split(/\s{2,}|\n|\*/);
  const last = chunks[chunks.length - 1];
  let place: string | undefined;

  const strict = last.match(/^\s*([\p{L}\u200c]+(?: [\p{L}\u200c]+){0,2})\s*[،,]\s*$/u);
  if (strict) {
    place = strict[1].trim();
    head = head.slice(0, head.length - last.length);
  } else {
    const loose = head.match(/(?<=\s)([\p{L}\u200c]+)\s*[،,]\s*$/u);
    if (loose) {
      place = loose[1];
      head = head.slice(0, loose.index);
    }
  }

  const setApart = /(?:\s{2,}|\n|\*)$/.test(raw.slice(0, m.index)) || /[\/\-.]/.test(m[0]);
  if (!place && !setApart) return { body: raw };

  return { body: head.trim(), colophon: { place, date } };
}

export function splitBySignals(raw: string): Stanzas | null {
  const hasSignal = /\*/.test(raw) || /\n/.test(raw) || /\S\s{2,}\S/.test(raw) || /\s\/\s/.test(raw);
  if (!hasSignal) return null;

  const stanzas = raw
    .split(/\s*\*+\s*|\n\s*\n/)
    .map((block) => block.split(/\s{2,}|\n|\s\/\s/).map(cleanLine).filter(Boolean))
    .filter((b) => b.length > 0);

  return stanzas.length ? stanzas : null;
}

const wc = (s: string) => s.split(/\s+/).filter(Boolean).length;

export function looksStructured(stanzas: Stanzas): boolean {
  const counts = stanzas.flat().map(wc).sort((a, b) => a - b);
  if (counts.length < 2) return false;
  const median = counts[Math.floor(counts.length / 2)];
  return median >= 2 && median <= 12 && counts[counts.length - 1] <= 22;
}

export type ExcerptOptions = {
  minWords?: number;
  targetWords?: number;
  maxWords?: number;
  topK?: number;
  rng?: () => number;
  strictBlocks?: boolean;
};

export type Excerpt = {
  lines: string[];
  start: number;
  end: number;
  cutStart: boolean;
  cutEnd: boolean;
};

const SENT_END = /[.!؟?…؛]$/;
const SOFT_END = /[،,:]$/;
const BAD_START = new Set(['و', 'که', 'را', 'تا', 'یا', 'است', 'بود', 'شد', 'هست', 'نیست', 'هم', 'نیز']);
const BAD_END = new Set([
  'و', 'که', 'تا', 'یا', 'از', 'به', 'در', 'با', 'بر', 'چون', 'ای', 'می', 'نمی', 'بی', 'همی', 'اگر', 'ولی', 'اما',
]);

const strip = (w: string) => w.replace(/[\p{P}\p{S}]/gu, '');
type FlatLine = { text: string; words: number; blockStart: boolean; blockEnd: boolean };

function scoreWindow(flat: FlatLine[], i: number, j: number, words: number, target: number): number {
  const first = flat[i].text;
  const lastLine = flat[j - 1].text;
  const prev = i > 0 ? flat[i - 1].text : '';
  let s = 0;

  s -= 4 * ((words - target) / target) ** 2;

  if (i === 0) s += 2;
  if (flat[i].blockStart) s += 3;
  if (SENT_END.test(prev)) s += 2;
  else if (SOFT_END.test(prev)) s += 0.5;
  const firstWord = strip(first.split(/\s+/)[0] ?? '');
  if (BAD_START.has(firstWord)) s -= 3;

  if (SENT_END.test(lastLine)) s += 4;
  else if (SOFT_END.test(lastLine)) s += 1;
  if (flat[j - 1].blockEnd) s += 3;
  if (j === flat.length) s += 1;
  if (!/[\p{P}]$/u.test(lastLine)) {
    const lastWord = strip(lastLine.split(/\s+/).pop() ?? '');
    if (BAD_END.has(lastWord)) s -= 4;
  }

  const text = flat.slice(i, j).map((l) => l.text).join(' ');
  const count = (re: RegExp) => (text.match(re) ?? []).length;
  if (count(/«/g) !== count(/»/g)) s -= 3;
  if (count(/\(/g) !== count(/\)/g)) s -= 3;

  return s;
}

export function pickExcerpt(stanzas: Stanzas, opts: ExcerptOptions = {}): Excerpt {
  const { minWords = 12, targetWords = 30, maxWords = 45, topK = 1, rng = Math.random, strictBlocks = false } = opts;

  const flat: FlatLine[] = [];
  for (const block of stanzas) {
    block.forEach((text, k) =>
      flat.push({ text, words: wc(text), blockStart: k === 0, blockEnd: k === block.length - 1 }),
    );
  }
  const total = flat.reduce((a, l) => a + l.words, 0);
  const whole = (): Excerpt => ({ lines: flat.map((l) => l.text), start: 0, end: flat.length, cutStart: false, cutEnd: false });
  if (total <= maxWords) return whole();

  const collect = (strict: boolean) => {
    const best = new Map<number, { i: number; j: number; score: number }>();
    for (let i = 0; i < flat.length; i++) {
      let words = 0;
      for (let j = i; j < flat.length; j++) {
        words += flat[j].words;
        if (words > maxWords) break;
        if (words < minWords) continue;
        if (strict && !(flat[i].blockStart && flat[j].blockEnd)) continue;
        const score = scoreWindow(flat, i, j + 1, words, targetWords);
        const cur = best.get(i);
        if (!cur || score > cur.score) best.set(i, { i, j: j + 1, score });
      }
    }
    return [...best.values()].sort((a, b) => b.score - a.score);
  };

  let cands = strictBlocks ? collect(true) : [];
  if (!cands.length) cands = collect(false);

  if (!cands.length) {
    return { lines: [flat[0].text], start: 0, end: 1, cutStart: false, cutEnd: flat.length > 1 };
  }

  const pick = cands[Math.floor(rng() * Math.min(topK, cands.length))];
  return {
    lines: flat.slice(pick.i, pick.j).map((l) => l.text),
    start: pick.i,
    end: pick.j,
    cutStart: pick.i > 0,
    cutEnd: pick.j < flat.length,
  };
}
```

### structure-poems.ts
```typescript
import fs from 'node:fs';
import { extractColophon, splitBySignals, looksStructured, cleanLine, type Stanzas, type Colophon } from '../lib/data/poem-structure';

type Raw = { id?: string | number; text: string; poet: string; title?: string; book?: string };
type Out = { stanzas: Stanzas | null; origin: 'separators' | 'inferred' | 'unstructured'; colophon?: Colophon };

const fingerprint = (s: string) => s.replace(/[\s\u200c*\/]+/g, '');
```

---

Begin with Phase 0. Do not write production code until the recon report, legacy snapshots, screenshots, and baselines exist. Then proceed through the phases without stopping until the final report is written. Be bold, be rigorous, and show your evidence.


## 2026-10-17T12:10:18Z

Implement Structure Engine v2 in packages/poem conforming to contracts/structure.ts (structurePoem), fixing line break leakage, detached prefixes/suffixes, and misaligned radif/rhymes across classical and modern Persian verse.

Working directory: /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API
Integrity mode: development

## Requirements

### R1. Deterministic Multi-Stage Pipeline & S1 Glue Constraints
Implement structurePoem(text, options) following stages S0 through S8. Stop at the first stage meeting confidence thresholds:
- S0 (Signals & Colophon): Extract colophon via existing extraction, then split by real separators (*, blank line, \n, double-space, spaced / ) if looksStructured (median 2–12 words/line, max <= 22). Origin separators, confidence 0.95.
- S1 (Hard Glue Constraints): Enforce across all downstream stages:
  - Never START a line with: ی ها های تر ترین ام ات اش مان تان شان (standalone tokens), را است بود شد نیست هست.
  - Never END a line (unless punctuation follows) with: ای می نمی بی همی و که تا یا از به در با بر چون اگر ولی اما.
  - Keep whole: X به X compounds (در به در, لا به لا, سر به سر, روز به روز), تو در تو, immediate identical repeats X X, and ezafe chains up to 3 tokens.

### R2. Form Classification (S2) & Classical Rhyme Grid (S3)
- S2 (Form Classifier): Classify Form (classical_rhymed, free_verse, colloquial, prose) using n-gram periodicity, rhyme regularity, length coefficient of variation, punctuation density, and colloquial markers.
- S3 (Rhyme Grid): For classical_rhymed:
  - Detect radif candidates (inter-occurrence gap CV <= 0.35) and qafiyeh. Repeating end-tokens end hemistichs (breaks placed AFTER).
  - Test hypotheses H1 (masnavi/rubai anchors every hemistich) vs H2 (ghazal/qasida anchors end beyts), snapping midpoints to glue-valid boundaries.
  - Emit beyts and stanzas (one per beyt) with calibrated confidence.

### R3. Modern Boundary Model (S4) & Heuristic Fallback (S5)
- S4 (Colloquial / Free Verse): Tiny pure-TypeScript logistic regression trained via SGD with weights stored in weights.json (inference = dot product, zero runtime deps). Evaluate leave-poet-out only. Calibrate probabilities (Platt/isotonic) to produce meaningful confidence.
- S5 (Heuristic Fallback): Dynamic programming with S1 glue constraints, no uniform-length target, and orphan penalties. Confidence <= 0.4, flag low_confidence.
- S6 (LLM Pass): Optional, batched, cached, budget-capped, letter-fingerprint verified pass only if confidence < 0.7.

### R4. Typo Flags (S7) & Typeset Layer (S8)
- S7 (Typo Flags): Non-neural frequency lexicon flagging tokens (count <= 2) when edit-distance-1/2 neighbors have >= 50x count. Stored in typos as flags only (never auto-applied).
- S8 (Typeset Layer): Derived separate layer attaching standalone suffixes (ی ها های تر ترین) to previous token with ZWNJ. Never touch می.

## Verification Resources
- data/golden/shots.jsonl: 4 golden shots with verified classical and modern behaviors.
- data/golden/sample300.jsonl: Stratified evaluation benchmark (300 works).
- data/golden/legacy30/: 30 legacy contract goldens.
- Corpus defect scanner in test harness.

## Acceptance Criteria

### Behavioral Fixtures (data/golden/shots.jsonl)
- [ ] Shot #1 (Mehdi Soheili): >= 90% of lines ending a hemistich end with «هنوز».
- [ ] Shot #4 (Shahriar): Beyts have 2 hemistichs of near-equal length.
- [ ] Shots #2 & #3 (Heydarzadeh & Ahmadi): Zero lines start with glue tokens or end dangling.
- [ ] All four shots format to <= 10-word lines.

### Corpus Invariants
- [ ] 0 lines across the corpus starting with a standalone glue-suffix token.
- [ ] 0 lines across the corpus ending on a dangling token without punctuation.
- [ ] Letter-fingerprint preservation rate is 100% across all evaluated works.

### Model & Performance Metrics
- [ ] Leave-poet-out boundary F1 on classical flattened Hafez >= 0.97.
- [ ] Leave-poet-out boundary F1 on free verse and colloquial reported honestly (target >= 0.80).
- [ ] Expected Calibration Error (ECE) <= 0.08.
- [ ] Median inference runtime <= 5 ms/poem.
- [ ] All unit and property tests in packages/poem pass green (bun test packages/poem).
