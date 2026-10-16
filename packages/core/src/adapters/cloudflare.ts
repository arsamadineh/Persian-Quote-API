import { TighEngine, toWebResponse } from '../index';

/**
 * Cloudflare Workers adapter.
 *   export default { fetch: createCloudflareHandler(engine) };
 */
export function createCloudflareHandler(engine: TighEngine) {
  return async (request: Request): Promise<Response> => {
    return engine.fetch(request);
  };
}
