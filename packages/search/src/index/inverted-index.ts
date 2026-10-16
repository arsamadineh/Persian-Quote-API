import { normalizeSearch, tokenize } from '@persian-quote/persian';

/** A single posting in a term's inverted list. */
export interface Posting {
  docId: string;
  freq: number;
}

/** Per-field inverted index entry. */
interface FieldIndex {
  postings: Map<string, Posting[]>;
  docLengths: Map<string, number>;
  docNorms: Map<string, number>;
  numDocs: number;
  avgdl: number;
}

/**
 * Inverted index supporting BM25F scoring across multiple weighted fields.
 *
 * Fields are indexed separately; each field maintains its own postings and
 * length statistics. BM25F combines per-field scores with configurable weights.
 */
export class InvertedIndex {
  private readonly fields: string[];
  private readonly fieldWeights: Record<string, number>;
  private readonly k1: number;
  private readonly b: number;

  private index: Record<string, FieldIndex> = {};
  private docs: Map<string, Record<string, unknown>> = new Map();
  private totalDocs = 0;
  private built = false;

  constructor(
    fields: string[],
    fieldWeights: Record<string, number>,
    options?: { k1?: number; b?: number }
  ) {
    this.fields = fields;
    this.fieldWeights = fieldWeights;
    this.k1 = options?.k1 ?? 1.2;
    this.b = options?.b ?? 0.75;
    for (const f of fields) {
      this.index[f] = {
        postings: new Map(),
        docLengths: new Map(),
        docNorms: new Map(),
        numDocs: 0,
        avgdl: 0,
      };
    }
  }

  /** Tokenize + search-normalize a text into terms. */
  private tokenizeText(text: string): string[] {
    const normalized = normalizeSearch(text ?? '');
    return tokenize(normalized).filter((t) => t.length > 0);
  }

  /** Add a document to the index. */
  add(docId: string, fields: Record<string, string>, metadata?: Record<string, unknown>): void {
    if (this.built) throw new Error('Cannot add documents after build()');
    this.docs.set(docId, metadata ?? {});
    this.totalDocs++;

    for (const field of this.fields) {
      const findex = this.index[field];
      const text = fields[field] ?? '';
      const tokens = this.tokenizeText(text);

      const tf: Map<string, number> = new Map();
      for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);

      const docLen = tokens.length;
      findex.docLengths.set(docId, docLen);

      for (const [term, freq] of tf) {
        let postings = findex.postings.get(term);
        if (!postings) {
          postings = [];
          findex.postings.set(term, postings);
        }
        postings.push({ docId, freq });
      }
    }
  }

  /** Finalize index: compute average document lengths and per-doc norms. */
  build(): void {
    for (const field of this.fields) {
      const findex = this.index[field];
      const lengths = Array.from(findex.docLengths.values());
      findex.numDocs = findex.docLengths.size;
      findex.avgdl =
        lengths.length > 0 ? lengths.reduce((a, c) => a + c, 0) / lengths.length : 0;

      for (const [docId, len] of findex.docLengths) {
        const norm = findex.avgdl > 0 ? Math.min(2, findex.avgdl / Math.max(1, len)) : 1;
        findex.docNorms.set(docId, norm);
      }
    }
    this.built = true;
  }

  /** IDF for a term in a field (BM25 style, with smoothing). */
  private idf(field: string, term: string): number {
    const findex = this.index[field];
    const postings = findex.postings.get(term);
    const df = postings ? postings.length : 0;
    const N = Math.max(1, this.totalDocs);
    return Math.log((N - df + 0.5) / (df + 0.5)) + 1;
  }

  /** BM25 score for a single term in a single field. */
  private bm25(field: string, term: string, docId: string): number {
    const findex = this.index[field];
    const postings = findex.postings.get(term);
    if (!postings) return 0;
    const p = postings.find((x) => x.docId === docId);
    if (!p) return 0;

    const tf = p.freq;
    const norm = findex.docNorms.get(docId) ?? 1;
    const idf = this.idf(field, term);
    const denominator = tf + this.k1 * (1 - this.b + this.b * norm);
    return idf * ((tf * (this.k1 + 1)) / denominator);
  }

  /** Search a single term across all fields, returning scored docs. */
  searchTerm(term: string): Map<string, { score: number; matches: string[] }> {
    const results = new Map<string, { score: number; matches: string[] }>();
    const normalized = normalizeSearch(term);
    if (!normalized) return results;

    for (const field of this.fields) {
      const weight = this.fieldWeights[field] ?? 1;
      const postings = this.index[field].postings.get(normalized);
      if (!postings) continue;
      for (const p of postings) {
        const score = this.bm25(field, normalized, p.docId) * weight;
        const existing = results.get(p.docId);
        if (existing) {
          existing.score += score;
          existing.matches.push(field);
        } else {
          results.set(p.docId, { score, matches: [field] });
        }
      }
    }
    return results;
  }

  /** Get stored metadata for a doc. */
  getDoc(docId: string): Record<string, unknown> | undefined {
    return this.docs.get(docId);
  }

  get totalDocumentCount(): number {
    return this.totalDocs;
  }

  get fieldCount(): number {
    return this.fields.length;
  }
}
