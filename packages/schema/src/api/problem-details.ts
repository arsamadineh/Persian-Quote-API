import { z } from 'zod';

export const InvalidParamSchema = z.object({
  name: z.string().min(1),
  reason: z.string().min(1),
  value: z.unknown().optional(),
});

export type InvalidParam = z.infer<typeof InvalidParamSchema>;

export const ProblemDetailsSchema = z.object({
  type: z.string().default("about:blank"),
  title: z.string().min(1),
  status: z.number().int().min(100).max(599),
  detail: z.string().optional(),
  instance: z.string().optional(),
  invalid_params: z.array(InvalidParamSchema).optional(),
  code: z.string().optional(),
  timestamp: z.string().optional(),
});

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;

export interface CreateProblemDetailsParams {
  status: number;
  title: string;
  detail?: string;
  instance?: string;
  code?: string;
  type?: string;
  invalidParams?: Array<{ name: string; reason: string; value?: unknown }>;
  timestamp?: string;
}

export function createProblemDetails(params: CreateProblemDetailsParams): ProblemDetails {
  const result: ProblemDetails = {
    type: params.type || "about:blank",
    title: params.title,
    status: params.status,
    timestamp: params.timestamp || new Date().toISOString(),
  };

  if (params.detail !== undefined) result.detail = params.detail;
  if (params.instance !== undefined) result.instance = params.instance;
  if (params.code !== undefined) result.code = params.code;
  if (params.invalidParams !== undefined) result.invalid_params = params.invalidParams;

  return result;
}
