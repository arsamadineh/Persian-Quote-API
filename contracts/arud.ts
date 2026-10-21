// contracts/arud.ts (FROZEN)
export interface SyllableRow { text: string; weight: 'L' | 'S' | 'X'; foot?: string }   // X = ambiguous
export interface ScanResult {
  meter: string | null; feet: string[]; syllables: SyllableRow[];
  variants: string[];                       // substitutions applied (e.g. "خبن")
  confidence: number; candidates: { meter: string; score: number }[];
}
export declare function scanHemistich(h: string): ScanResult;
export declare function scanPoem(beyts: [string, string][]): { meter: string | null; confidence: number; perBeyt: ScanResult[][] };
