import { z } from 'zod';
import { JalaliDateSchema, GregorianDateStringSchema } from './dates';

export const ColophonSchema = z.object({
  place: z.string().optional(),
  date_raw: z.string().optional(),
  date_jalali: JalaliDateSchema.optional(),
  date_gregorian: GregorianDateStringSchema.optional(),
});

export type Colophon = z.infer<typeof ColophonSchema>;
