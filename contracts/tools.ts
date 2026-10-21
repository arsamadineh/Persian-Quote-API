// contracts/tools.ts (FROZEN) — pure functions, must run in a browser (no Node-only APIs)
import type { Corpus, KwicRow, VerseIndex, VerseMatch, CollationTable, Quiz, WorkRef } from './corpus';
export declare function kwic(c: Corpus, term: string, o?: { window?: number; poet?: string }): KwicRow[];
export declare function wordFreq(c: Corpus, o?: { poet?: string; top?: number }): [string, number][];
export declare function buildVerseIndex(c: Corpus): VerseIndex;
export declare function identifyVerse(i: VerseIndex, query: string, o?: { top?: number }): VerseMatch[];
export declare function collate(w: { siglum: string; text: string }[], o?: { equivalences?: string[] }): CollationTable;
export declare function collationToTei(t: CollationTable): string;
export declare function cite(w: WorkRef, style: 'apa-fa' | 'chicago-fa' | 'bibtex' | 'csl-json', loc?: { beyt?: number }): string;
export declare function makeQuiz(w: import('./corpus').Work, kind: 'cloze-radif' | 'missing-word' | 'order-hemistichs' | 'poet-mc' | 'meter-mc', seed: number): Quiz;
