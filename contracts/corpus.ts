// contracts/corpus.ts — shared types (FROZEN; change requests go to STATUS.md)
export interface WorkRef {
  id: string;                       // stable id, e.g. "hafez.ghazaliat.3"
  poetId: string;
  poetName: string;
  title?: string;
  collection?: string;
  kind: 'classical' | 'modern' | 'prose';
  form?: string;                    // ghazal | rubai | masnavi | nimai | free_verse | ...
  deathYearCE?: number;             // for chronology/direction only; may be undefined
}
export interface Work extends WorkRef {
  stanzas: string[][];
  beyts?: [string, string][];       // classical only
  structure?: { origin: string; confidence: number; form: string };
  meter?: string | null;
  radif?: string | null;
  qafiyeh?: string | null;
}
export interface Corpus { works: readonly Work[] }

export interface KwicRow { workId: string; poetId: string; lineIndex: number; left: string; hit: string; right: string }
export interface DiffToken { text: string; kind: 'same' | 'changed' | 'missing' | 'extra' }
export interface VerseMatch { workId: string; beytIndex?: number; lineIndex: number; text: string; score: number; diff: DiffToken[]; disputed?: boolean }
export interface VerseIndex { readonly size: number }
export interface CollationTable { witnesses: string[]; rows: { base: string; readings: Record<string, string | null>; variant: boolean }[] }
export interface Quiz { kind: string; workId: string; prompt: string; options?: string[]; answer: string | string[]; explanation?: string }
