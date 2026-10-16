import { InvertedIndex } from '../index/inverted-index';
import { normalizeSearch } from '@persian-quote/persian';
import { symSpellCorrect } from '../fuzzy/symspell';
import { transliterateFinglish } from '../transliteration/finglish';

export interface SearchResult {
  id: string;
  score: number;
  matches: string[];
  doc: Record<string, unknown>;
}

export interface SearchOptions {
  poet?: string;
  collection?: string;
  form?: string;
  tag?: string;
  limit?: number;
  offset?: number;
  fuzzy?: boolean;
  finglish?: boolean;
}

export interface SearchResponse {
  query: string;
  normalizedQuery: string;
  items: SearchResult[];
  count: number;
  total: number;
  offset: number;
  limit: number;
  fuzzyUsed: boolean;
  finglishUsed: boolean;
}

/**
 * Hybrid search engine over the canonical corpus.
 *
 * Combines:
 * - BM25F inverted index across weighted fields (text, title, poet, tags).
 * - SymSpell fuzzy matching with Persian confusion weights.
 * - Finglish reverse transliteration (romanized -> Persian).
 */
export class SearchEngine {
  private index: InvertedIndex;
  private docs: Array<{ id: string; fields: Record<string, string>; metadata: Record<string, unknown> }> = [];

  constructor(index: InvertedIndex, docs: Array<{ id: string; fields: Record<string, string>; metadata: Record<string, unknown> }>) {
    this.index = index;
    this.docs = docs;
  }

  /** Build a SearchEngine from canonical works. */
  static fromWorks(works: Array<{
    id: string;
    title: string;
    text_plain: string;
    poet_name: string;
    poet_id: string;
    collection_id: string;
    collection_title: string;
    form: string;
    tags: string[];
    rights?: { status: string };
  }>): SearchEngine {
    const index = new InvertedIndex(
      ['text', 'title', 'poet', 'tags'],
      { text: 1.0, title: 3.0, poet: 4.0, tags: 2.0 }
    );
    const docs: Array<{ id: string; fields: Record<string, string>; metadata: Record<string, unknown> }> = [];

    for (const w of works) {
      const fields = {
        text: w.text_plain ?? '',
        title: w.title ?? '',
        poet: `${w.poet_name ?? ''} ${w.poet_id ?? ''}`,
        tags: (w.tags ?? []).join(' '),
      };
      index.add(w.id, fields, {
        title: w.title,
        text_plain: w.text_plain,
        poet_name: w.poet_name,
        poet_id: w.poet_id,
        collection_id: w.collection_id,
        collection_title: w.collection_title,
        form: w.form,
        tags: w.tags,
        rights: w.rights,
      });
      docs.push({ id: w.id, fields, metadata: index.getDoc(w.id)! });
    }

    index.build();
    return new SearchEngine(index, docs);
  }

  /** Apply document filters. */
  private filterDocs(
    docIds: string[],
    opts: SearchOptions
  ): string[] {
    return docIds.filter((id) => {
      const doc = this.docs.find((d) => d.id === id)!;
      const m = doc.metadata;
      if (opts.poet && m.poet_id !== opts.poet) return false;
      if (opts.collection && m.collection_id !== opts.collection) return false;
      if (opts.form && m.form !== opts.form) return false;
      if (opts.tag && !(m.tags as string[]).includes(opts.tag)) return false;
      return true;
    });
  }

  /** Rank candidate doc ids by score. */
  private rank(candidates: Map<string, { score: number; matches: string[] }>): SearchResult[] {
    return Array.from(candidates.entries())
      .map(([id, s]) => ({
        id,
        score: s.score,
        matches: s.matches,
        doc: this.index.getDoc(id) ?? {},
      }))
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id, 'fa'));
  }

  search(query: string, opts: SearchOptions = {}): SearchResponse {
    const limit = Math.min(Math.max(Number(opts.limit ?? 20), 1), 100);
    const offset = Math.max(Number(opts.offset ?? 0), 0);

    let fuzzyUsed = false;
    let finglishUsed = false;
    let normalizedQuery = normalizeSearch(query ?? '');

    // Finglish transliteration: romanized query -> Persian.
    if (opts.finglish !== false && /^[a-zA-Z\s]+$/.test(query ?? '')) {
      const transliterated = transliterateFinglish(query);
      if (transliterated && transliterated !== query) {
        normalizedQuery = normalizeSearch(transliterated);
        finglishUsed = true;
      }
    }

    // Primary search on the (possibly transliterated) normalized query.
    const primary = this.index.searchTerm(normalizedQuery);
    let results = this.rank(primary);

    // Fallback: fuzzy matching if primary returns too few results.
    if (opts.fuzzy !== false && results.length < 5) {
      const fuzzyTerms = symSpellCorrect(normalizedQuery);
      if (fuzzyTerms.length > 0 && fuzzyTerms[0] !== normalizedQuery) {
        fuzzyUsed = true;
        const fuzzyResults = new Map<string, { score: number; matches: string[] }>();
        for (const t of fuzzyTerms) {
          for (const [id, s] of this.index.searchTerm(t)) {
            const existing = fuzzyResults.get(id);
            if (existing) {
              existing.score += s.score * 0.7; // fuzzy results discounted
              for (const m of s.matches) if (!existing.matches.includes(m)) existing.matches.push(m);
            } else {
              fuzzyResults.set(id, { score: s.score * 0.7, matches: [...s.matches] });
            }
          }
        }
        const fuzzyRanked = this.rank(fuzzyResults);
        // Merge fuzzy results not already present, appended after primary.
        const primaryIds = new Set(results.map((r) => r.id));
        for (const r of fuzzyRanked) {
          if (!primaryIds.has(r.id)) results.push(r);
        }
      }
    }

    // Apply filters.
    const filtered = results.filter((r) => {
      const doc = this.docs.find((d) => d.id === r.id)!;
      return this.filterDocs([r.id], opts).length > 0;
    });

    const total = filtered.length;
    const page = filtered.slice(offset, offset + limit);

    return {
      query,
      normalizedQuery,
      items: page,
      count: page.length,
      total,
      offset,
      limit,
      fuzzyUsed,
      finglishUsed,
    };
  }

  /** Autocomplete suggestions for a prefix. */
  suggest(prefix: string, limit = 20): { items: string[]; count: number } {
    const norm = normalizeSearch(prefix ?? '');
    if (!norm) return { items: [], count: 0 };
    const matches = new Set<string>();
    for (const doc of this.docs) {
      const haystack = `${doc.fields.title} ${doc.fields.poet} ${doc.fields.tags}`.normalize('NFC');
      if (haystack.includes(norm)) {
        matches.add(doc.fields.title);
        if (matches.size >= limit) break;
      }
    }
    return { items: Array.from(matches), count: matches.size };
  }
}
