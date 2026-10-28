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

interface InternalDoc {
  id: string;
  fields: Record<string, string>;
  normalizedText: string;
  stanzas?: string[][];
  metadata: Record<string, unknown>;
}

/**
 * Hybrid search engine over the canonical corpus.
 *
 * Combines:
 * - Multi-term BM25F inverted index across weighted fields (text, title, poet, tags)
 * - Term coordination, stanza-level co-occurrence, and exact-phrase boosting
 * - Per-token SymSpell fuzzy matching with Persian confusion weights
 * - Finglish reverse transliteration (romanized -> Persian)
 */
export class SearchEngine {
  private index: InvertedIndex;
  private docs: InternalDoc[] = [];
  private docMap: Map<string, InternalDoc> = new Map();

  constructor(index: InvertedIndex, docs: InternalDoc[]) {
    this.index = index;
    this.docs = docs;
    for (const d of docs) {
      this.docMap.set(d.id, d);
    }
  }

  /** Build a SearchEngine from canonical works. */
  static fromWorks(works: Array<{
    id: string;
    title: string;
    text_plain: string;
    stanzas?: string[][];
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
    const docs: InternalDoc[] = [];

    for (const w of works) {
      const fields = {
        text: w.text_plain ?? '',
        title: w.title ?? '',
        poet: `${w.poet_name ?? ''} ${w.poet_id ?? ''}`,
        tags: (w.tags ?? []).join(' '),
      };
      index.add(w.id, fields, {
        id: w.id,
        title: w.title,
        text_plain: w.text_plain,
        stanzas: w.stanzas,
        poet_name: w.poet_name,
        poet_id: w.poet_id,
        collection_id: w.collection_id,
        collection_title: w.collection_title,
        form: w.form,
        tags: w.tags,
        rights: w.rights,
      });
      docs.push({
        id: w.id,
        fields,
        normalizedText: normalizeSearch(w.text_plain ?? ''),
        stanzas: w.stanzas,
        metadata: index.getDoc(w.id)!,
      });
    }

    index.build();
    return new SearchEngine(index, docs);
  }

  /** Apply document filters. */
  private matchesFilter(id: string, opts: SearchOptions): boolean {
    const doc = this.docMap.get(id);
    if (!doc) return false;
    const m = doc.metadata;
    if (opts.poet) {
      const p = opts.poet.trim().toLowerCase();
      const isMolana =
        p === 'rumi' ||
        p === 'molavi' ||
        p === 'molana' ||
        opts.poet.includes('مولا') ||
        opts.poet.includes('مولوی') ||
        opts.poet.includes('رومی');
      const mPoetId = String(m.poet_id || '').toLowerCase();
      const mPoetName = String(m.poet_name || '');
      if (isMolana) {
        if (
          mPoetId !== 'molavi' &&
          mPoetId !== 'rumi' &&
          !mPoetName.includes('مولا') &&
          !mPoetName.includes('مولوی')
        ) {
          return false;
        }
      } else if (m.poet_id !== opts.poet && m.poet_name !== opts.poet && !mPoetName.includes(opts.poet)) {
        return false;
      }
    }
    if (opts.collection && m.collection_id !== opts.collection) return false;
    if (opts.form && m.form !== opts.form) return false;
    if (opts.tag && !(m.tags as string[]).includes(opts.tag)) return false;
    return true;
  }

  /** Extract the best matching stanza (beyt) inside a work for a query. */
  private findBestStanza(
    doc: InternalDoc,
    normalizedQuery: string,
    queryTerms: string[]
  ): { stanza: string[]; index: number; termHits: number; exactPhrase: boolean } | null {
    const stanzas = doc.stanzas;
    if (!Array.isArray(stanzas) || stanzas.length === 0) return null;

    let bestIdx = 0;
    let bestTermHits = -1;
    let bestExact = false;

    for (let i = 0; i < stanzas.length; i++) {
      const st = stanzas[i]!;
      const normStanza = normalizeSearch(st.join(' '));
      const exact = normalizedQuery.length >= 2 && normStanza.includes(normalizedQuery);
      let hits = 0;
      for (const term of queryTerms) {
        if (normStanza.includes(term)) hits++;
      }
      if (
        (exact && !bestExact) ||
        (exact === bestExact && hits > bestTermHits)
      ) {
        bestExact = exact;
        bestTermHits = hits;
        bestIdx = i;
        if (exact && hits === queryTerms.length) break;
      }
    }

    return {
      stanza: stanzas[bestIdx]!,
      index: bestIdx,
      termHits: Math.max(0, bestTermHits),
      exactPhrase: bestExact,
    };
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

    const queryTerms = normalizedQuery.split(/\s+/).filter((t) => t.length > 0);
    if (queryTerms.length === 0) {
      return {
        query,
        normalizedQuery,
        items: [],
        count: 0,
        total: 0,
        offset,
        limit,
        fuzzyUsed,
        finglishUsed,
      };
    }

    // Aggregate per-document scores across all query terms
    const combined = new Map<
      string,
      { score: number; matches: Set<string>; termHits: number }
    >();

    const addTermResults = (
      termMap: Map<string, { score: number; matches: string[] }>,
      weightMultiplier: number,
      countedDocs: Set<string>
    ) => {
      for (const [docId, s] of termMap) {
        if (!this.matchesFilter(docId, opts)) continue;
        const isFirstForThisQueryTerm = !countedDocs.has(docId);
        if (isFirstForThisQueryTerm) countedDocs.add(docId);

        const existing = combined.get(docId);
        if (existing) {
          existing.score += s.score * weightMultiplier;
          if (isFirstForThisQueryTerm) existing.termHits += 1;
          for (const m of s.matches) existing.matches.add(m);
        } else {
          combined.set(docId, {
            score: s.score * weightMultiplier,
            matches: new Set(s.matches),
            termHits: 1,
          });
        }
      }
    };

    for (const term of queryTerms) {
      const countedForTerm = new Set<string>();
      const exactMatches = this.index.searchTerm(term);
      addTermResults(exactMatches, 1.0, countedForTerm);

      // Handle common attached/detached suffix variants (e.g. سالها <-> سال, میرود <-> رود)
      if (term.length > 3 && term.endsWith('ها')) {
        const stem = term.slice(0, -2);
        if (stem.length >= 2) {
          addTermResults(this.index.searchTerm(stem), 0.75, countedForTerm);
        }
      }

      // Per-token fuzzy fallback when exact matches for this token are sparse
      if (opts.fuzzy !== false && exactMatches.size < 5) {
        const fuzzyTerms = symSpellCorrect(term);
        for (const ft of fuzzyTerms) {
          if (ft !== term) {
            const fm = this.index.searchTerm(ft);
            if (fm.size > 0) {
              fuzzyUsed = true;
              addTermResults(fm, 0.7, countedForTerm);
            }
          }
        }
      }
    }

    // Determine maximum term hits achieved by any document
    let maxTermHits = 0;
    for (const entry of combined.values()) {
      if (entry.termHits > maxTermHits) maxTermHits = entry.termHits;
    }

    // Minimum required term hits when multi-word query has strong multi-term matches
    const minRequiredHits =
      queryTerms.length >= 2 && maxTermHits >= 2
        ? Math.max(2, Math.floor(maxTermHits * 0.6))
        : 1;

    // Score coordination and sort initial candidates
    const candidates: Array<{ id: string; score: number; matches: string[]; termHits: number }> = [];
    for (const [id, entry] of combined) {
      if (entry.termHits < minRequiredHits) continue;
      const coordRatio = entry.termHits / queryTerms.length;
      let finalScore = entry.score * Math.pow(coordRatio, 2);
      if (entry.termHits === queryTerms.length && queryTerms.length > 1) {
        finalScore *= 3.0;
      }
      candidates.push({
        id,
        score: finalScore,
        matches: Array.from(entry.matches),
        termHits: entry.termHits,
      });
    }

    candidates.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id, 'fa'));

    // Refine top candidates with exact-phrase and stanza-level co-occurrence boosting
    const topSlice = candidates.slice(0, 60);
    for (const c of topSlice) {
      const doc = this.docMap.get(c.id);
      if (!doc) continue;

      if (queryTerms.length > 1 && doc.normalizedText.includes(normalizedQuery)) {
        c.score += 40;
      }

      const bestStanza = this.findBestStanza(doc, normalizedQuery, queryTerms);
      if (bestStanza) {
        if (bestStanza.exactPhrase) {
          c.score += 50;
        } else if (queryTerms.length > 1 && bestStanza.termHits === queryTerms.length) {
          c.score += 25;
        }
      }
    }

    topSlice.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id, 'fa'));
    const rankedAll = [...topSlice, ...candidates.slice(60)];

    const total = rankedAll.length;
    const pageCandidates = rankedAll.slice(offset, offset + limit);

    const items: SearchResult[] = pageCandidates.map((c) => {
      const internalDoc = this.docMap.get(c.id);
      const baseMeta = this.index.getDoc(c.id) ?? {};
      const bestStanza = internalDoc
        ? this.findBestStanza(internalDoc, normalizedQuery, queryTerms)
        : null;

      return {
        id: c.id,
        score: Number(c.score.toFixed(4)),
        matches: c.matches,
        doc: {
          ...baseMeta,
          ...(bestStanza
            ? {
                matched_beyt: bestStanza.stanza,
                matched_beyt_number: bestStanza.index + 1,
              }
            : {}),
        },
      };
    });

    return {
      query,
      normalizedQuery,
      items,
      count: items.length,
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
