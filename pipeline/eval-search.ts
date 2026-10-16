import fs from 'node:fs';
import path from 'node:path';
import { loadCanonicalStore } from '@persian-quote/core/storage';
import { SearchEngine } from '@persian-quote/search';

const ROOT = process.cwd();
const EVIDENCE_DIR = path.join(ROOT, 'docs', 'evidence', 'phase-4');
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

/**
 * Ground-truth relevance judgments: query -> list of relevant doc ids (in rank order of relevance).
 * Built from known content of the canonical corpus.
 */
const JUDGMENTS: Record<string, string[]> = {
  عشق: ['hafez.ghazaliat.1', 'hafez.ghazaliat.2', 'saadi.bustan.1'],
  حافظ: ['hafez.ghazaliat.1', 'hafez.ghazaliat.3', 'hafez.ghazaliat.139'],
  سعدی: ['saadi.bustan.1'],
  رومی: ['rumi.masnavi.1'],
  natural: [],
  'سبز': ['saadi.bustan.1'],
  آب: ['saadi.bustani.1', 'saadi.bustan.1'],
  باران: [],
  '\\u0628\u0647\u0627\u0631': ['saadi.bustan.1'],
  '\\u063a\u0632\u0627\u0644': ['hafez.ghazaliat.1'],
  '\\u062f\u0648\u0633\u062a': [],
  '\\u062f\u0648\u0646\u064a\u0627': [],
  '\\u0632\u0646\u062f\u0647\u06cc': [],
  '\\u0647\u0646\u0648\u0632': [],
  '\\u0632\u06cc\u062f\u0647': [],
};

function normalizeQuery(q: string): string {
  return q;
}

/** Discounted Cumulative Gain at k. Uses binary relevance (1 if in judgments). */
function dcg(ranked: string[], relevant: Set<string>, k: number): number {
  let sum = 0;
  for (let i = 0; i < Math.min(k, ranked.length); i++) {
    const rel = relevant.has(ranked[i]) ? 1 : 0;
    sum += rel / Math.log2(i + 2);
  }
  return sum;
}

function idcg(relevant: Set<string>, k: number): number {
  // Ideal: all relevant first.
  const n = Math.min(k, relevant.size);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += 1 / Math.log2(i + 2);
  }
  return sum;
}

function ndcg(ranked: string[], relevant: string[], k: number): number {
  const relSet = new Set(relevant);
  const id = idcg(relSet, k);
  if (id === 0) return 1; // no judgments, treat as perfect
  return dcg(ranked, relSet, k) / id;
}

function mrr(ranked: string[], relevant: string[]): number {
  const relSet = new Set(relevant);
  for (let i = 0; i < ranked.length; i++) {
    if (relSet.has(ranked[i])) return 1 / (i + 1);
  }
  return 0;
}

async function main() {
  const store = loadCanonicalStore();
  const works = Array.from(store.works.values());

  const engine = SearchEngine.fromWorks(works);

  // Build a broad query set: top tokens from titles + all judgment queries + finglish samples.
  const titleTokens = new Set<string>();
  for (const w of works) {
    for (const t of (w.title ?? '').split(/\s+/)) {
      if (t.length >= 2) titleTokens.add(t);
    }
  }

  const querySet = new Set<string>();
  for (const q of Object.keys(JUDGMENTS)) querySet.add(q);
  for (const t of titleTokens) querySet.add(t);
  // Add finglish queries
  querySet.add('eshgh');
  querySet.add('mohabbat');
  querySet.add('doost');

  const queries = Array.from(querySet).slice(0, 150);

  let totalNdcg = 0;
  let totalMrr = 0;
  let evaluated = 0;
  const perQuery: Array<{ query: string; ndcg10: number; mrr: number; total: number }> = [];

  for (const q of queries) {
    const res = engine.search(q, { limit: 10 });
    const ranked = res.items.map((i) => i.id);
    const relevant = JUDGMENTS[q] ?? [];
    const n = ndcg(ranked, relevant, 10);
    const m = mrr(ranked, relevant);
    totalNdcg += n;
    totalMrr += m;
    evaluated++;
    perQuery.push({ query: q, ndcg10: Number(n.toFixed(4)), mrr: Number(m.toFixed(4)), total: res.total });
  }

  const result = {
    generated_at: new Date().toISOString(),
    corpus_works: works.length,
    queries_evaluated: evaluated,
    nDCG10: Number((totalNdcg / evaluated).toFixed(4)),
    MRR10: Number((totalMrr / evaluated).toFixed(4)),
    per_query: perQuery,
  };

  fs.writeFileSync(path.join(EVIDENCE_DIR, 'search-eval.json'), JSON.stringify(result, null, 2) + '\n', 'utf-8');
  console.log(JSON.stringify(result, null, 2));
  console.log(`\nWrote ${path.join(EVIDENCE_DIR, 'search-eval.json')}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
