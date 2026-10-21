// contracts/research.ts (FROZEN) — echo graph, stylometry, semantic, query
export interface Echo {
  a: { workId: string; line: number }; b: { workId: string; line: number };
  similarity: number;                                   // 0..1
  kind: 'quote' | 'partial' | 'formula' | 'same_poet_dup';
  direction?: 'a->b' | 'b->a';                          // only when chronology is known
}
export interface StyleProfile { id: string; words: number; mfw: Record<string, number>; charGrams: Record<string, number> }
export declare function attribute(text: string, profiles: StyleProfile[], o?: { top?: number; bootstrap?: number }): { id: string; delta: number; confidence: number }[];
export interface EmbedProvider { readonly dim: number; embed(texts: string[]): Promise<Float32Array[]> }
export interface AtlasPoint { id: string; x: number; y: number; cluster: number; label?: string }
export interface QueryFilters { poet?: string[]; form?: string[]; meter?: string[]; radif?: string; qafiyeh?: string; era?: { from?: number; to?: number }; tag?: string[]; text?: string }
export declare function parseQuery(q: string): { filters: QueryFilters; explain: string; confidence: number };
