import { z } from 'zod';
import { RightsStatusEnum, HistoricalDateSchema } from '../common';

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

export type HistoricalEra = z.infer<typeof HistoricalEraEnum>;

export const PoetStatsSchema = z.object({
  works_count: z.number().int().nonnegative(),
  stanza_count: z.number().int().nonnegative().optional(),
});

export type PoetStats = z.infer<typeof PoetStatsSchema>;

export const PoetRightsSummarySchema = z.object({
  default_status: RightsStatusEnum,
  notes: z.string().optional(),
});

export type PoetRightsSummary = z.infer<typeof PoetRightsSummarySchema>;

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
  rights_summary: PoetRightsSummarySchema,
  image_url: z.string().optional(),
  stats: PoetStatsSchema.optional(),
});

export type Poet = z.infer<typeof PoetSchema>;
