// packages/tools/src/kwic.ts
import { normalizeSearch } from "@persian-quote/persian";
import { tokenize } from "@persian-quote/persian";
import type { Corpus, KwicRow } from "../../../contracts/corpus";

export function kwic(
  c: Corpus,
  term: string,
  o: { window?: number; poet?: string } = {}
): KwicRow[] {
  const window = o.window ?? 5;
  const normTerm = normalizeSearch(term);
  const termTokens = tokenize(normTerm);
  if (termTokens.length === 0) return [];

  const rows: KwicRow[] = [];
  for (const w of c.works) {
    if (o.poet && w.poetId !== o.poet) continue;
    for (let si = 0; si < w.stanzas.length; si++) {
      const stanza = w.stanzas[si]!;
      for (let li = 0; li < stanza.length; li++) {
        const line = stanza[li]!;
        const normLine = normalizeSearch(line);
        const toks = tokenize(normLine);
        // find term occurrences
        for (let i = 0; i < toks.length; i++) {
          // match term starting at i
          let match = true;
          for (let k = 0; k < termTokens.length; k++) {
            if (toks[i + k] !== termTokens[k]) { match = false; break; }
          }
          if (!match) continue;
          const left = toks.slice(Math.max(0, i - window), i).join(" ");
          const right = toks.slice(i + termTokens.length, i + termTokens.length + window).join(" ");
          rows.push({
            workId: w.id,
            poetId: w.poetId,
            lineIndex: li,
            left,
            hit: termTokens.join(" "),
            right,
          });
        }
      }
    }
  }
  // sort by left then right context
  rows.sort((a, b) => (a.left < b.left ? -1 : a.left > b.left ? 1 : a.right < b.right ? -1 : 1));
  return rows;
}
