import type { Engine, EngineConfig } from '../types';
import { TighEngine } from '../server';
import { toWebResponse } from '../server';

export function createEngine(config?: Partial<EngineConfig>): TighEngine {
  return new TighEngine(config);
}

/**
 * Next.js App Router adapter. Use in route.ts files:
 *   import { createNextHandler } from '@persian-quote/core/adapters/next';
 *   import { engine } from '@/lib/core-engine';
 *   export const GET = createNextHandler(engine);
 */
export function createNextHandler(engine: Engine) {
  return async (req: Request, ctx: { params?: Promise<Record<string, string>> } = {}): Promise<Response> => {
    const response = await engine.fetch(req);
    return response;
  };
}
