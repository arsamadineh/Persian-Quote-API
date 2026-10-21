// contracts/review.ts (FROZEN)
export interface ReviewItem { workId: string; flat: string; proposed: string[][]; confidence: number; flags: string[]; typos?: { token: string; suggestion: string; ratio: number }[] }
export interface HumanPatch {
  workId: string; stanzas: string[][]; reviewer: string; at: string;
  typoDecisions?: { token: string; accepted: boolean; replacement?: string; justification?: string }[];
}
/** Structure edits must keep the letter-fingerprint identical; typo fixes are separate decisions needing justification. */
export declare function validatePatch(item: ReviewItem, p: HumanPatch): { ok: boolean; reason?: string };
