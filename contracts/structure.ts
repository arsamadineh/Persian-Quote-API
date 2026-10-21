// contracts/structure.ts (FROZEN)
export type Form = 'classical_rhymed' | 'free_verse' | 'colloquial' | 'prose';
export interface StructureResult {
  form: Form;
  stanzas: string[][];
  beyts?: [string, string][];
  origin: 'source' | 'separators' | 'rhyme_grid' | 'boundary_model' | 'llm' | 'heuristic' | 'human';
  confidence: number;                                  // calibrated 0..1
  flags: ('low_confidence' | 'possible_typo' | 'footer_removed')[];
  typos?: { token: string; suggestion: string; ratio: number }[];   // flags only, never auto-applied
  typeset?: string[][];                                // derived display layer (ZWNJ-attached suffixes)
  colophon?: { place?: string; raw: string; jalali?: { y: number; m: number; d: number }; gregorian?: string };
}
export declare function structurePoem(text: string, o?: { poetId?: string }): StructureResult;
