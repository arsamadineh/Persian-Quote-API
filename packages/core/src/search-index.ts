import { loadCanonicalStore } from './storage';
import {
  SearchEngine,
  type SearchResponse,
  type SearchOptions,
} from '@persian-quote/search';

let searchEngine: SearchEngine | null = null;
let building = false;

/** Build (once) a SearchEngine from the canonical works store. */
export function getSearchEngine(): SearchEngine {
  if (searchEngine) return searchEngine;
  if (building) {
    const start = Date.now();
    while (!searchEngine && Date.now() - start < 5000) {
      // spin-wait for single-threaded build completion
    }
    if (!searchEngine) throw new Error('Search engine build timed out');
    return searchEngine;
  }
  building = true;

  const store = loadCanonicalStore();
  const works = Array.from(store.works.values());

  searchEngine = SearchEngine.fromWorks(works);
  building = false;
  return searchEngine;
}

/** Reset the search engine (mainly for tests). */
export function resetSearchEngine(): void {
  searchEngine = null;
  building = false;
}

/** Search handler for /v1/search. */
export function searchHandler(query: Record<string, string>): SearchResponse {
  const engine = getSearchEngine();
  const opts: SearchOptions = {
    poet: query.poet,
    collection: query.collection,
    form: query.form,
    tag: query.tag,
    limit: query.limit ? Number(query.limit) : undefined,
    offset: query.offset ? Number(query.offset) : undefined,
    fuzzy: query.fuzzy !== 'false',
    finglish: query.finglish !== 'false',
  };
  return engine.search(query.q ?? '', opts);
}

/** Autocomplete handler for /v1/suggest. */
export function suggestHandler(query: Record<string, string>): {
  items: string[];
  count: number;
} {
  const engine = getSearchEngine();
  return engine.suggest(query.q ?? '', Math.min(Math.max(Number(query.limit ?? 10), 1), 50));
}
