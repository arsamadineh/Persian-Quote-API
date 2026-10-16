import { z } from 'zod';

export const LegacyQuoteKindEnum = z.enum(["poetry", "non-poetry", "hafez", "shereno"]);
export type LegacyQuoteKind = z.infer<typeof LegacyQuoteKindEnum>;

export const LegacyLineOriginEnum = z.enum(["raw", "flat", "separators", "reconstructed"]);
export type LegacyLineOrigin = z.infer<typeof LegacyLineOriginEnum>;

export const LegacyQuoteSchema = z.object({
  id: z.string(),
  kind: LegacyQuoteKindEnum,
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
  line_origin: LegacyLineOriginEnum.optional(),
  line_count: z.number().optional(),
});

export type LegacyQuote = z.infer<typeof LegacyQuoteSchema>;

export const LegacyLineModeEnum = z.enum(["auto", "separators", "raw"]);
export type LegacyLineMode = z.infer<typeof LegacyLineModeEnum>;

export const LegacyListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(LegacyQuoteSchema),
  count: z.number(),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  line_mode: LegacyLineModeEnum,
  poet: z.string().optional(),
  category: z.string().optional(),
  query: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export type LegacyListResponse = z.infer<typeof LegacyListResponseSchema>;
