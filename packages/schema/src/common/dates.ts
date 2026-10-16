import { z } from 'zod';

export const JalaliDateSchema = z.object({
  y: z.number().int().min(1).max(2500),
  m: z.number().int().min(1).max(12).optional(),
  d: z.number().int().min(1).max(31).optional(),
});

export type JalaliDate = z.infer<typeof JalaliDateSchema>;

export const GregorianDateStringSchema = z.string().regex(
  /^\d{4}(-\d{2}(-\d{2})?)?$/,
  "Gregorian date must be in YYYY, YYYY-MM, or YYYY-MM-DD format"
);

export const HistoricalDateSchema = z.object({
  year_jalali: z.number().int().optional(),
  year_gregorian: z.number().int().optional(),
  century_hijri: z.number().int().optional(),
  place: z.string().optional(),
});

export type HistoricalDate = z.infer<typeof HistoricalDateSchema>;
