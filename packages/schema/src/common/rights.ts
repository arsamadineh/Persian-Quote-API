import { z } from 'zod';

export const RightsStatusEnum = z.enum(["public_domain", "copyright_verified", "quarantined"]);
export type RightsStatus = z.infer<typeof RightsStatusEnum>;

export const RightsSchema = z.object({
  status: RightsStatusEnum,
  holder: z.string().optional(),
  license: z.string().min(1),
  provenance: z.string().min(1),
  audit_date: z.string().optional(),
});

export type Rights = z.infer<typeof RightsSchema>;
