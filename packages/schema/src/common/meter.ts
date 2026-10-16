import { z } from 'zod';

export const MeterSchema = z.object({
  name: z.string().min(1),
  pattern: z.string().min(1),
  rhythm: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export type Meter = z.infer<typeof MeterSchema>;
