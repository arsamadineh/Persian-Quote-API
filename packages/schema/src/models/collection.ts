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
