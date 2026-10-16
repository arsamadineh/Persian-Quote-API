import { z } from 'zod';

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

export type LegacyPoetItem = z.infer<typeof LegacyPoetItemSchema>;

export const LegacyPoetsResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(LegacyPoetItemSchema),
  count: z.number(),
});

export type LegacyPoetsResponse = z.infer<typeof LegacyPoetsResponseSchema>;

export const LegacyCategoryItemSchema = z.object({
  id: z.number(),
  name_persian: z.string(),
  name_english: z.string().nullable(),
  description_persian: z.string(),
  description_english: z.string(),
  quote_count: z.number(),
});

export type LegacyCategoryItem = z.infer<typeof LegacyCategoryItemSchema>;

export const LegacyCategoriesResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(LegacyCategoryItemSchema),
  count: z.number(),
});

export type LegacyCategoriesResponse = z.infer<typeof LegacyCategoriesResponseSchema>;
