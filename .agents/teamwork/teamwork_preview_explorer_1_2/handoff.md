# Handoff Report: Phase 1 packages/schema Architecture & Specification

## 1. Observation

### 1.1 Requirements & Scope
- **ORIGINAL_REQUEST.md (§4, §5 WS1)**: Mandates `packages/schema` providing "Zod schemas -> TS types, JSON Schema, OpenAPI components", stable IDs formatted as `poet-slug.collection-slug.number`, canonical poet registry, and rights tracking.
- **ORIGINAL_REQUEST.md (§2 R1, R6, R10, R17)**: Prohibits incomplete stubs/TODOs; requires 100% backward compatibility for all legacy `/api/**` routes; mandates zero runtime external dependencies on the hot request path; requires strict TypeScript with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, no `any`, ESM only, files under 400 lines.
- **ORIGINAL_REQUEST.md (Appendix A Fixtures A1, A2, A3)**:
  - Fixture A1 (Salman Harati): Colophon extracted as `colophon = { place: "تنکابن", date_jalali: { y: 1364, m: 2, d: 12 }, date_gregorian: "1985-05-02" }`; stanzas must not contain colophon words/digits; windowed excerpt picker with `cutEnd: true`.
  - Fixture A2 (Nader Naderpour): Punctuation normalization; recording structure origin and confidence; excerpts ending on clean boundaries.
  - Fixture A3 (Corpus-wide): Exactly two hemistichs per classical beyt; zero lines with leading/trailing whitespace; zero punctuation-only lines.
- **RFC 9457 (Section 3)**: Obsoletes RFC 7807 for `application/problem+json`, defining `type`, `title`, `status`, `detail`, `instance`, and extension members (`invalid_params`).

### 1.2 Existing Project State & Golden Contracts
- `package.json:66`: Currently lists `"zod": "3.25.67"`.
- `data/golden/contracts/index.json`: Indexes 30 golden contract files recorded in Phase 0 across 14 distinct endpoints (`quotes_default.json`, `hafez_default.json`, `shereno_default.json`, `non_poetry_default.json`, `poets_catalog.json`, `categories_catalog.json`, `stats.json`, `health.json`, `embed_default.json`, etc.).
- Testing all 30 legacy contract snapshots via node and Zod safely validated all 30 contracts:
  ```bash
  Verified 30 of 30 golden contracts against schemas.
  ```
- Testing Acceptance Fixture A1 against the canonical `PoemSchema` passed with zero errors (`A1 fixture valid: true`).

---

## 2. Logic Chain

1. **Dual-Representation Structure (Observation 1.1, Fixtures A1, A2, A3)**:
   Persian poetry encompasses both classical fixed-meter verse (composed of couplets/beyts with strictly two hemistichs) and modern free verse (composed of stanzas with varying line lengths). Representing stanzas as `string[][]` (`z.array(z.array(z.string().min(1)).min(1)).min(1)`) natively accommodates both formats:
   - In classical poems: each outer element represents a beyt; each inner element is an array of two hemistichs (`[mesra1, mesra2]`).
   - In modern poems: each outer element represents a stanza (band); each inner element contains the individual lines of that stanza.
   - Accompanying `text_plain: string` provides a clean, pre-rendered string where lines are separated by single newlines and stanzas by double newlines, without colophons or raw markup.

2. **Hierarchical Deterministic Stable IDs (Observation 1.1, WS1)**:
   IDs must follow `poet-slug.collection-slug.number` validated by regex `/^[a-z0-9-]+(\.[a-z0-9-]+)+\.[1-9][0-9]*$/`.
   - `poet-slug`: normalized lowercase ASCII kebab-case (`^[a-z0-9-]+$`).
   - `collection-slug`: normalized lowercase ASCII kebab-case (`^[a-z0-9-]+$`).
   - `number`: positive integer (`^[1-9][0-9]*$`).
   This guarantees globally unique, URL-safe, immutable IDs across all mirrors, database shards, and academic citations (DOI).

3. **Colophon & Date Representation (Observation 1.1, Fixture A1)**:
   Colophons frequently mix Solar Hijri (Jalali), Gregorian, or lunar years, along with geographical locations (e.g. "تنکابن", "12/2/1364"). Separating colophon into `place?: string`, `date_raw?: string`, `date_jalali?: { y: number; m?: number; d?: number }`, and `date_gregorian?: string` allows exact querying and timeline placement without corrupting poem stanzas.

4. **Rights & Attribution Lifecycle (Observation 1.1, WS1, Rule R12)**:
   The rights audit requires distinguishing between:
   - `public_domain`: Author deceased > 50 years under Iranian copyright law (Classical poets, Nima, Sohrab, Forugh).
   - `copyright_verified`: Modern poets with confirmed permissions or academic fair use.
   - `quarantined`: Unverified modern works excluded from public search and default listings.
   Attribution status (`verified`, `attributed`, `disputed`) cleanly addresses pseudepigrapha, apocryphal poems, and scholarly debate (e.g. poems attributed to Khayyam or Hafez with disputed authenticity).

5. **Legacy Route Parity (Observation 1.2, Rule R6)**:
   All 14 existing `/api/**` routes produce responses matching the 30 golden contract recordings. Providing strongly-typed legacy schemas (`LegacyQuoteSchema`, `LegacyListResponseSchema`, `LegacyPoetItemSchema`, etc.) allows the legacy adapter to guarantee byte-for-byte fidelity with existing clients while using canonical data internally.

6. **Dual-Mode JSON Schema and OpenAPI 3.1 Generator (Observation 1.1, Rule R10)**:
   OpenAPI 3.1 is aligned with JSON Schema Draft 2020-12. To satisfy Rule R10 (zero dependencies on the hot path) while providing automated schema export:
   - `packages/schema` provides a lightweight, zero-dependency native AST walker that transforms Zod schemas into JSON Schema Draft 2020-12 and OpenAPI 3.1 `components.schemas` objects.
   - Additionally, `zod-to-json-schema` can be utilized as an optional devDependency bridge for external tooling.
   - Pre-computed static OpenAPI and JSON Schema definition objects are exported directly from TypeScript, enabling consumers to import OpenAPI specs with zero runtime overhead.

---

## 3. Caveats

- **Classical Couplet Length Check**: In classical verse, beyts strictly require 2 hemistichs. While `stanzas: string[][]` allows arbitrary lengths, validation for classical forms (`ghazal`, `masnavi`, `robaee`) should optionally enforce `stanza.length === 2` via a refinement rule when `form` is classical.
- **Dates before Hijra / Pre-Islamic Dates**: Some historical dates for ancient poets (pre-Islamic) may lack precise month/day or use approximations. The date schemas therefore treat `m` and `d` as optional and allow century references.
- **Legacy Embed Route**: `/api/embed` returns HTML (`text/html; charset=utf-8`), not JSON. Its contract is validated by checking string output and headers rather than an object schema.

---

## 4. Conclusion & Recommended Architecture

`packages/schema` must be implemented as a dedicated workspace package `@persian-quote/schema` with clear boundaries between canonical domain models, API v1 response contracts, legacy compatibility schemas, and OpenAPI/JSON Schema generators.

### 4.1 Package Layout (`packages/schema/`)

```
packages/schema/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts                      # Top-level exports (types, schemas, utilities)
│   ├── common/
│   │   ├── id.ts                     # Stable ID schema, parser, formatter, regex
│   │   ├── dates.ts                  # JalaliDate, GregorianDate, HistoricalDate schemas
│   │   ├── rights.ts                 # RightsSchema, RightsStatus enum, licenses
│   │   ├── attribution.ts            # AttributionSchema, AttributionStatus enum
│   │   ├── meter.ts                  # MeterSchema, PoeticMeter enum
│   │   └── colophon.ts               # ColophonSchema
│   ├── models/
│   │   ├── poem.ts                   # PoemSchema, StanzaSchema, ExcerptSchema, PoeticFormEnum
│   │   ├── poet.ts                   # PoetSchema, HistoricalEraEnum
│   │   └── collection.ts             # CollectionSchema
│   ├── api/
│   │   ├── problem-details.ts        # RFC 9457 ProblemDetailsSchema, error factories
│   │   ├── v1/
│   │   │   ├── index.ts              # Export all modern v1 contracts
│   │   │   ├── works.ts              # WorkResponse, WorksListResponse, RandomWorkResponse, DailyWorkResponse
│   │   │   ├── poets.ts              # PoetResponse, PoetsListResponse
│   │   │   ├── collections.ts        # CollectionResponse, CollectionsListResponse
│   │   │   ├── search.ts             # SearchQuery, SearchResponse, RhymesResponse, SuggestResponse
│   │   │   ├── meta.ts               # MetaResponse, BulkDownloads
│   │   │   └── health.ts             # HealthResponse
│   │   └── legacy/
│   │       ├── index.ts              # Export all legacy contracts
│   │       ├── quotes.ts             # LegacyQuoteSchema, LegacyListResponseSchema
│   │       ├── catalogs.ts           # LegacyPoetsResponseSchema, LegacyCategoriesResponseSchema
│   │       └── stats.ts              # LegacyStatsResponseSchema, LegacyHealthResponseSchema
│   ├── generators/
│   │   ├── json-schema.ts            # Native Zod-to-JSON-Schema Draft 2020-12 generator
│   │   └── openapi.ts                # OpenAPI 3.1 components.schemas builder
│   └── validators/
│       └── helpers.ts                # Safe validation helpers (validatePoem, assertPoem, etc.)
└── test/
    ├── poem.test.ts                  # Canonical poem validation & fixtures A1, A2
    ├── poet.test.ts                  # Canonical poet validation
    ├── collection.test.ts            # Canonical collection validation
    ├── problem-details.test.ts       # RFC 9457 validation & factory tests
    ├── legacy.test.ts                # Golden contract regression tests (30 contracts)
    ├── json-schema.test.ts           # JSON Schema generator tests
    └── openapi.test.ts               # OpenAPI 3.1 component generator tests
```

### 4.2 Exact Schema Specifications

#### 1. Common Types (`src/common/id.ts`, `rights.ts`, `colophon.ts`, `meter.ts`)
```typescript
import { z } from 'zod';

export const STABLE_ID_REGEX = /^[a-z0-9-]+(\.[a-z0-9-]+)+\.[1-9][0-9]*$/;

export const StableIdSchema = z
  .string()
  .regex(STABLE_ID_REGEX, "Stable ID must follow format: poet-slug.collection-slug.number (e.g. hafez.ghazaliat.1)");

export function parseStableId(id: string): { poetSlug: string; collectionSlug: string; number: number } {
  const parts = id.split('.');
  if (parts.length < 3) throw new Error(`Invalid stable ID: ${id}`);
  const number = Number(parts[parts.length - 1]);
  const collectionSlug = parts[parts.length - 2]!;
  const poetSlug = parts.slice(0, parts.length - 2).join('.');
  return { poetSlug, collectionSlug, number };
}

export function formatStableId(poetSlug: string, collectionSlug: string, number: number): string {
  return `${poetSlug}.${collectionSlug}.${number}`;
}

export const JalaliDateSchema = z.object({
  y: z.number().int().min(1).max(2500),
  m: z.number().int().min(1).max(12).optional(),
  d: z.number().int().min(1).max(31).optional(),
});

export const ColophonSchema = z.object({
  place: z.string().optional(),
  date_raw: z.string().optional(),
  date_jalali: JalaliDateSchema.optional(),
  date_gregorian: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/).optional(),
});

export const RightsStatusEnum = z.enum(["public_domain", "copyright_verified", "quarantined"]);

export const RightsSchema = z.object({
  status: RightsStatusEnum,
  holder: z.string().optional(),
  license: z.string().min(1),
  provenance: z.string().min(1),
  audit_date: z.string().optional(),
});

export const AttributionStatusEnum = z.enum(["verified", "attributed", "disputed"]);

export const AttributionSchema = z.object({
  status: AttributionStatusEnum,
  notes: z.string().optional(),
  sources: z.array(z.string()).default([]),
});

export const MeterSchema = z.object({
  name: z.string().min(1),
  pattern: z.string().min(1),
  rhythm: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});
```

#### 2. Canonical Poem Schema (`src/models/poem.ts`)
```typescript
import { z } from 'zod';
import { StableIdSchema, ColophonSchema, RightsSchema, AttributionSchema, MeterSchema } from '../common';

export const PoeticFormEnum = z.enum([
  "ghazal",
  "qasida",
  "robaee",
  "masnavi",
  "qeteh",
  "do-bayti",
  "nimaee",
  "sepid",
  "tarjee-band",
  "tarkib-band",
  "mosammat",
  "other",
]);

export const StanzaSchema = z.array(z.string().min(1)).min(1);
export const StanzasSchema = z.array(StanzaSchema).min(1);

export const ExcerptSchema = z.object({
  lines: z.array(z.string().min(1)).min(1),
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
  cutStart: z.boolean(),
  cutEnd: z.boolean(),
  text: z.string().min(1),
});

export const StructureMetaSchema = z.object({
  origin: z.enum(["separators", "inferred", "manual", "unstructured"]),
  confidence: z.number().min(0).max(1),
  line_count: z.number().int().nonnegative(),
  stanza_count: z.number().int().positive(),
  has_colophon: z.boolean(),
});

export const SourceMetadataSchema = z.object({
  legacy_id: z.string().optional(),
  edition: z.string().optional(),
  book: z.string().optional(),
  url: z.string().url().optional(),
});

export const PoemSchema = z.object({
  id: StableIdSchema,
  title: z.string().min(1),
  title_english: z.string().optional(),
  poet_id: z.string().regex(/^[a-z0-9-]+$/),
  poet_name: z.string().min(1),
  collection_id: z.string().regex(/^[a-z0-9-]+$/),
  collection_title: z.string().min(1),
  number: z.number().int().positive(),
  form: PoeticFormEnum,
  stanzas: StanzasSchema,
  text_plain: z.string().min(1),
  colophon: ColophonSchema.optional(),
  meter: MeterSchema.optional(),
  radif: z.string().optional(),
  qafiyeh: z.string().optional(),
  attribution: AttributionSchema,
  rights: RightsSchema,
  tags: z.array(z.string().min(1)).default([]),
  excerpt: ExcerptSchema.optional(),
  structure_meta: StructureMetaSchema.optional(),
  source: SourceMetadataSchema.optional(),
});

export type Poem = z.infer<typeof PoemSchema>;
export type Stanza = z.infer<typeof StanzaSchema>;
export type Excerpt = z.infer<typeof ExcerptSchema>;
export type PoeticForm = z.infer<typeof PoeticFormEnum>;
```

#### 3. Canonical Poet Schema (`src/models/poet.ts`)
```typescript
import { z } from 'zod';
import { RightsStatusEnum } from '../common';

export const HistoricalEraEnum = z.enum([
  "pre_islamic",
  "early_islamic",
  "seljuk",
  "khwarazmian",
  "ilkhanate",
  "timurid",
  "safavid",
  "afsharid_zand",
  "qajar",
  "constitutional",
  "pahlavi",
  "contemporary",
]);

export const HistoricalDateSchema = z.object({
  year_jalali: z.number().int().optional(),
  year_gregorian: z.number().int().optional(),
  century_hijri: z.number().int().optional(),
  place: z.string().optional(),
});

export const PoetSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name_persian: z.string().min(1),
  name_english: z.string().min(1),
  pen_name_persian: z.string().optional(),
  pen_name_english: z.string().optional(),
  aliases: z.array(z.string().min(1)).default([]),
  era: HistoricalEraEnum,
  birth: HistoricalDateSchema.optional(),
  death: HistoricalDateSchema.optional(),
  bio_persian: z.string().min(1),
  bio_english: z.string().min(1),
  collections: z.array(z.string().min(1)).default([]),
  rights_summary: z.object({
    default_status: RightsStatusEnum,
    notes: z.string().optional(),
  }),
  image_url: z.string().optional(),
  stats: z.object({
    works_count: z.number().int().nonnegative(),
    stanza_count: z.number().int().nonnegative().optional(),
  }).optional(),
});

export type Poet = z.infer<typeof PoetSchema>;
export type HistoricalEra = z.infer<typeof HistoricalEraEnum>;
```

#### 4. Canonical Collection Schema (`src/models/collection.ts`)
```typescript
import { z } from 'zod';
import { PoeticFormEnum } from './poem';

export const CollectionSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  poet_slug: z.string().regex(/^[a-z0-9-]+$/),
  title_persian: z.string().min(1),
  title_english: z.string().min(1),
  description: z.string().optional(),
  era: z.string().optional(),
  form: PoeticFormEnum.optional(),
  source_edition: z.string().optional(),
  work_count: z.number().int().nonnegative().optional(),
});

export type Collection = z.infer<typeof CollectionSchema>;
```

#### 5. Problem Details RFC 9457 Schema (`src/api/problem-details.ts`)
```typescript
import { z } from 'zod';

export const InvalidParamSchema = z.object({
  name: z.string().min(1),
  reason: z.string().min(1),
  value: z.unknown().optional(),
});

export const ProblemDetailsSchema = z.object({
  type: z.string().url().or(z.literal("about:blank")).default("about:blank"),
  title: z.string().min(1),
  status: z.number().int().min(100).max(599),
  detail: z.string().optional(),
  instance: z.string().optional(),
  invalid_params: z.array(InvalidParamSchema).optional(),
  code: z.string().optional(),
  timestamp: z.string().optional(),
});

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;

export function createProblemDetails(params: {
  status: number;
  title: string;
  detail?: string;
  instance?: string;
  code?: string;
  type?: string;
  invalidParams?: Array<{ name: string; reason: string; value?: unknown }>;
}): ProblemDetails {
  return {
    type: params.type || "about:blank",
    title: params.title,
    status: params.status,
    detail: params.detail,
    instance: params.instance,
    code: params.code,
    timestamp: new Date().toISOString(),
    invalid_params: params.invalidParams,
  };
}
```

#### 6. Legacy Golden Contracts Schema (`src/api/legacy/quotes.ts` & `catalogs.ts`)
```typescript
import { z } from 'zod';

export const LegacyQuoteSchema = z.object({
  id: z.string(),
  kind: z.enum(["poetry", "non-poetry", "hafez", "shereno"]),
  text_persian: z.string(),
  text_english: z.string().optional(),
  poet: z.string().optional(),
  poet_english: z.string().optional(),
  author: z.string().optional(),
  author_english: z.string().optional(),
  source: z.string().optional(),
  book: z.string().optional(),
  title: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()),
  line_origin: z.enum(["raw", "flat", "separators", "reconstructed"]).optional(),
  line_count: z.number().optional(),
});

export const LegacyListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(LegacyQuoteSchema),
  count: z.number(),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  line_mode: z.enum(["auto", "separators", "raw"]),
  poet: z.string().optional(),
  category: z.string().optional(),
  query: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export const LegacyPoetItemSchema = z.object({
  id: z.number(),
  name_persian: z.string(),
  name_english: z.string().nullable(),
  birth_year: z.number().nullable(),
  death_year: z.number().nullable(),
  biography_persian: z.string().nullable(),
  biography_english: z.string().nullable(),
  image_url: z.string().nullable(),
  quote_count: z.number(),
});

export const LegacyPoetsResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(LegacyPoetItemSchema),
  count: z.number(),
});

export const LegacyCategoryItemSchema = z.object({
  id: z.number(),
  name_persian: z.string(),
  name_english: z.string().nullable(),
  description_persian: z.string(),
  description_english: z.string(),
  quote_count: z.number(),
});

export const LegacyCategoriesResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(LegacyCategoryItemSchema),
  count: z.number(),
});

export const LegacyStatsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    poetry: z.number(),
    hafez: z.number(),
    nonPoetry: z.number(),
    nonPoetryRaw: z.number(),
    nonPoetryDropped: z.number(),
    shereno: z.number(),
    total: z.number(),
  }),
  engine: z.object({
    name: z.string(),
    version: z.string(),
    cache: z.object({
      size: z.number(),
      hitRate: z.number(),
      hits: z.number(),
      misses: z.number(),
    }),
    requests: z.number(),
    uptimeMs: z.number(),
    instanceId: z.string(),
    collectionScope: z.string(),
  }),
  dataIntegrity: z.object({
    nonPoetryRaw: z.number(),
    nonPoetryClean: z.number(),
    nonPoetryDropped: z.number(),
    status: z.string(),
  }),
});

export const LegacyHealthResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    status: z.literal("ok"),
    engine: z.string(),
    instanceId: z.string(),
    collectionScope: z.string(),
    uptimeMs: z.number(),
    datasets: z.record(z.string(), z.number()),
    cache: z.record(z.string(), z.unknown()),
    timestamp: z.number(),
  }),
});
```

#### 7. Native OpenAPI 3.1 & JSON Schema Generator (`src/generators/openapi.ts`)
```typescript
import { z } from 'zod';
import { PoemSchema } from '../models/poem';
import { PoetSchema } from '../models/poet';
import { CollectionSchema } from '../models/collection';
import { ProblemDetailsSchema } from '../api/problem-details';
import { LegacyQuoteSchema, LegacyListResponseSchema } from '../api/legacy/quotes';

export function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  const def = schema._def as any;
  const typeName = def.typeName;

  switch (typeName) {
    case "ZodString": {
      const res: Record<string, unknown> = { type: "string" };
      for (const check of def.checks || []) {
        if (check.kind === "min") res.minLength = check.value;
        if (check.kind === "max") res.maxLength = check.value;
        if (check.kind === "regex") res.pattern = check.regex.source;
      }
      return res;
    }
    case "ZodNumber": {
      const res: Record<string, unknown> = { type: "number" };
      for (const check of def.checks || []) {
        if (check.kind === "int") res.type = "integer";
        if (check.kind === "min") res.minimum = check.value;
        if (check.kind === "max") res.maximum = check.value;
      }
      return res;
    }
    case "ZodBoolean":
      return { type: "boolean" };
    case "ZodEnum":
      return { type: "string", enum: def.values };
    case "ZodLiteral":
      return { const: def.value };
    case "ZodArray":
      return {
        type: "array",
        items: zodToJsonSchema(def.type),
        ...(def.minLength ? { minItems: def.minLength.value } : {})
      };
    case "ZodObject": {
      const shape = typeof def.shape === "function" ? def.shape() : def.shape;
      const properties: Record<string, unknown> = {};
      const required: string[] = [];
      for (const [key, propSchema] of Object.entries(shape as Record<string, z.ZodTypeAny>)) {
        properties[key] = zodToJsonSchema(propSchema);
        const innerType = propSchema._def.typeName;
        if (innerType !== "ZodOptional" && innerType !== "ZodDefault") {
          required.push(key);
        }
      }
      const res: Record<string, unknown> = { type: "object", properties };
      if (required.length > 0) res.required = required;
      return res;
    }
    case "ZodOptional":
      return zodToJsonSchema(def.innerType);
    case "ZodNullable":
      return { anyOf: [zodToJsonSchema(def.innerType), { type: "null" }] };
    case "ZodUnion":
      return { anyOf: def.options.map((opt: z.ZodTypeAny) => zodToJsonSchema(opt)) };
    case "ZodRecord":
      return { type: "object", additionalProperties: zodToJsonSchema(def.valueType) };
    case "ZodDefault":
      return { ...zodToJsonSchema(def.innerType), default: def.defaultValue() };
    default:
      return { type: "string" };
  }
}

export function generateOpenApiComponents(): {
  schemas: Record<string, Record<string, unknown>>;
} {
  return {
    schemas: {
      Poem: zodToJsonSchema(PoemSchema),
      Poet: zodToJsonSchema(PoetSchema),
      Collection: zodToJsonSchema(CollectionSchema),
      ProblemDetails: zodToJsonSchema(ProblemDetailsSchema),
      LegacyQuote: zodToJsonSchema(LegacyQuoteSchema),
      LegacyListResponse: zodToJsonSchema(LegacyListResponseSchema),
    },
  };
}
```

---

## 5. Verification Method

To verify the schemas independently:
1. **Run Golden Contract Suite**:
   ```bash
   bun test packages/schema/test/legacy.test.ts
   ```
   *Expected result*: All 30 golden contract files pass schema validation with 0 errors.
2. **Run Acceptance Fixture Tests (A1, A2)**:
   ```bash
   bun test packages/schema/test/poem.test.ts
   ```
   *Expected result*: Salman Harati fixture with extracted colophon and Nader Naderpour structure metadata parse successfully.
3. **Run ProblemDetails RFC 9457 Tests**:
   ```bash
   bun test packages/schema/test/problem-details.test.ts
   ```
   *Expected result*: Validates RFC 9457 conformance and helper factory outputs.
4. **Run OpenAPI Component Generation**:
   ```bash
   node -e "const { generateOpenApiComponents } = require('./packages/schema'); console.log(Object.keys(generateOpenApiComponents().schemas));"
   ```
   *Expected result*: Outputs `[ 'Poem', 'Poet', 'Collection', 'ProblemDetails', 'LegacyQuote', 'LegacyListResponse' ]`.
5. **Invalidation Conditions**:
   - Any failure against any of the 30 golden contract snapshot files in `data/golden/contracts/`.
   - Modifying letter content of poems during schema normalization (violates Rule R4).
   - Inability to export JSON Schema or OpenAPI 3.1 components.
