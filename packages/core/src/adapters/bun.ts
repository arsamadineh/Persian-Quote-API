import { TighEngine } from '../index';

/**
 * Bun.serve adapter.
 *   Bun.serve({ fetch: createBunHandler(engine), port: 3000 });
 */
export function createBunHandler(engine: TighEngine) {
  return (request: Request): Promise<Response> => engine.fetch(request);
}
