import { TighEngine, jsonBody } from './server';
import type { EngineConfig } from './types';
import {
  healthHandler,
  metaHandler,
  worksListHandler,
  worksGetHandler,
  worksRandomHandler,
  dailyHandler,
  falHandler,
  poetsListHandler,
  poetsGetHandler,
  collectionsListHandler,
  collectionsGetHandler,
  formsHandler,
  metersHandler,
  tagsHandler,
  suggestHandler,
  rhymesHandler,
  searchHandler,
  legacyQuotesHandler,
  legacyHafezHandler,
  legacyStatsHandler,
  legacyHealthHandler,
} from './routes';

/**
 * Builds a fully routed TighEngine with /v1 and legacy /api routes.
 */
export function createAppEngine(config?: Partial<EngineConfig>): TighEngine {
  const engine = new TighEngine(config);

  // ---- /v1 ----
  engine.get('/v1/health', healthHandler, { cache: { ttl: 60000 } });
  engine.get('/v1/meta', metaHandler, { cache: { ttl: 300000 } });

  engine.get('/v1/works', worksListHandler, {
    cache: { ttl: 60000, key: (req) => `v1:works:${req.path}?${sortQueryKey(req.query)}` },
  });
  engine.get('/v1/works/random', worksRandomHandler);
  engine.get('/v1/daily', dailyHandler, { cache: { ttl: 86400000 } });
  engine.get('/v1/fal', falHandler, { cache: { ttl: 86400000 } });
  engine.get('/v1/works/[id]', worksGetHandler, { cache: { ttl: 300000 } });
  engine.get('/v1/poets', poetsListHandler, { cache: { ttl: 300000 } });
  engine.get('/v1/poets/[id]', poetsGetHandler, { cache: { ttl: 300000 } });
  engine.get('/v1/collections', collectionsListHandler, { cache: { ttl: 300000 } });
  engine.get('/v1/collections/[id]', collectionsGetHandler, { cache: { ttl: 300000 } });
  engine.get('/v1/forms', formsHandler, { cache: { ttl: 86400000 } });
  engine.get('/v1/meters', metersHandler, { cache: { ttl: 86400000 } });
  engine.get('/v1/tags', tagsHandler, { cache: { ttl: 86400000 } });
  engine.get('/v1/suggest', suggestHandler, { cache: { ttl: 60000 } });
  engine.get('/v1/search', (req) => jsonBody(searchHandler(req.query)), { cache: { ttl: 60000 } });
  engine.get('/v1/rhymes', rhymesHandler, { cache: { ttl: 60000 } });

  // ---- Legacy /api (backward compatibility, R6) ----
  engine.get('/api/quotes', legacyQuotesHandler, { cache: { ttl: 60000 } });
  engine.get('/api/quotes/hafez', legacyHafezHandler, { cache: { ttl: 300000 } });
  engine.get('/api/quotes/stats', legacyStatsHandler, { cache: { ttl: 300000 } });
  engine.get('/api/health', legacyHealthHandler, { cache: { ttl: 60000 } });
  engine.get('/api/quotes/stats', legacyStatsHandler, { cache: { ttl: 300000 } });

  return engine;
}

function sortQueryKey(query: Record<string, string>): string {
  return Object.keys(query)
    .sort()
    .map((k) => `${k}=${query[k]}`)
    .join('&');
}
