import { z } from 'zod';

export const AttributionStatusEnum = z.enum(["verified", "attributed", "disputed"]);
export type AttributionStatus = z.infer<typeof AttributionStatusEnum>;

export const AttributionSchema = z.object({
  status: AttributionStatusEnum,
  notes: z.string().optional(),
  sources: z.array(z.string()).default([]),
});

export type Attribution = z.infer<typeof AttributionSchema>;
