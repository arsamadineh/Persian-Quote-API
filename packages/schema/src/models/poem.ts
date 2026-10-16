import { z } from 'zod';
import {
  StableIdSchema,
  ColophonSchema,
  RightsSchema,
  AttributionSchema,
  MeterSchema,
} from '../common';

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

export type PoeticForm = z.infer<typeof PoeticFormEnum>;

export const StanzaSchema = z.array(z.string().min(1)).min(1);
export const StanzasSchema = z.array(StanzaSchema).min(1);

export type Stanza = z.infer<typeof StanzaSchema>;
export type Stanzas = z.infer<typeof StanzasSchema>;

export const ExcerptSchema = z.object({
  lines: z.array(z.string().min(1)).min(1),
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
  cutStart: z.boolean(),
  cutEnd: z.boolean(),
  text: z.string().min(1),
});

export type Excerpt = z.infer<typeof ExcerptSchema>;

export const StructureOriginEnum = z.enum(["separators", "inferred", "manual", "unstructured"]);
export type StructureOrigin = z.infer<typeof StructureOriginEnum>;

export const StructureMetaSchema = z.object({
  origin: StructureOriginEnum,
  confidence: z.number().min(0).max(1),
  line_count: z.number().int().nonnegative(),
  stanza_count: z.number().int().positive(),
  has_colophon: z.boolean(),
});

export type StructureMeta = z.infer<typeof StructureMetaSchema>;

export const SourceMetadataSchema = z.object({
  legacy_id: z.string().optional(),
  edition: z.string().optional(),
  book: z.string().optional(),
  url: z.string().url().optional(),
});

export type SourceMetadata = z.infer<typeof SourceMetadataSchema>;

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
