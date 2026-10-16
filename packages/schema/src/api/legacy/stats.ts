import { z } from 'zod';

export const LegacyStatsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    poetry: z.number(),
    hafez: z.number(),
    nonPoetry: z.number(),
    nonPoetryRaw: z.number(),
    nonPoetryDropped: z.number(),
    shereno: z.number(),
    total: z.number(),
  }),
  engine: z.object({
    name: z.string(),
    version: z.string(),
    cache: z.object({
      size: z.number(),
      hitRate: z.number(),
      hits: z.number(),
      misses: z.number(),
    }),
    requests: z.number(),
    uptimeMs: z.number(),
    instanceId: z.string(),
    collectionScope: z.string(),
  }),
  dataIntegrity: z.object({
    nonPoetryRaw: z.number(),
    nonPoetryClean: z.number(),
    nonPoetryDropped: z.number(),
    status: z.string(),
  }),
});

export type LegacyStatsResponse = z.infer<typeof LegacyStatsResponseSchema>;

export const LegacyHealthResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    status: z.literal("ok"),
    engine: z.string(),
    instanceId: z.string(),
    collectionScope: z.string(),
    uptimeMs: z.number(),
    datasets: z.record(z.string(), z.number()),
    cache: z.record(z.string(), z.unknown()),
    timestamp: z.number(),
  }),
});

export type LegacyHealthResponse = z.infer<typeof LegacyHealthResponseSchema>;
