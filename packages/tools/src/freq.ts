// packages/tools/src/freq.ts
import { normalizeSearch } from "@persian-quote/persian";
import { tokenize } from "@persian-quote/persian";
import { lightStem } from "@persian-quote/persian";
import type { Corpus } from "../../../contracts/corpus";

export function wordFreq(
  c: Corpus,
  o: { poet?: string; top?: number; stem?: boolean } = {}
): [string, number][] {
  const counts = new Map<string, number>();
  let totalTokens = 0;
  for (const w of c.works) {
    if (o.poet && w.poetId !== o.poet) continue;
    for (const stanza of w.stanzas) {
      for (const line of stanza) {
        const toks = tokenize(normalizeSearch(line));
        for (const t of toks) {
          const key = o.stem ? lightStem(t) : t;
          counts.set(key, (counts.get(key) ?? 0) + 1);
          totalTokens++;
        }
      }
    }
  }
  const top = o.top ?? 50;
  const arr = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return arr.slice(0, top).map(([term, n]) => [term, n]);
}
