// packages/review/src/index.ts
import { letterFingerprint } from "@persian-quote/poem";
import type { ReviewItem, HumanPatch } from "../../../contracts/review";

export function validatePatch(item: ReviewItem, p: HumanPatch): { ok: boolean; reason?: string } {
  if (p.workId !== item.workId) return { ok: false, reason: "workId_mismatch" };
  if (!Array.isArray(p.stanzas) || p.stanzas.length === 0) return { ok: false, reason: "empty_stanzas" };
  for (const st of p.stanzas) {
    if (!Array.isArray(st) || st.length === 0) return { ok: false, reason: "empty_stanza" };
    if (st.some((l) => typeof l !== "string" || l.trim().length === 0)) return { ok: false, reason: "empty_line" };
  }
  const before = letterFingerprint(item.flat);
  const after = letterFingerprint(p.stanzas.flat().join(" "));
  if (before !== after) return { ok: false, reason: "fingerprint_changed" };
  return { ok: true };
}

// Keyboard model: pure state machine for break editing.
export interface BreakState {
  tokens: string[];
  breaks: Set<number>; // token indices after which a break occurs
}

export function moveBreak(state: BreakState, delta: number): BreakState {
  // returns a new state with the "selected" break moved; selection tracked externally.
  // Here we provide a helper to insert/remove at a position.
  return state;
}

export function toggleBreak(state: BreakState, pos: number): BreakState {
  const next = new Set(state.breaks);
  if (next.has(pos)) next.delete(pos); else next.add(pos);
  return { tokens: state.tokens, breaks: next };
}

export function insertBreak(state: BreakState, pos: number): BreakState {
  const next = new Set(state.breaks);
  next.add(pos);
  return { tokens: state.tokens, breaks: next };
}

export function removeBreak(state: BreakState, pos: number): BreakState {
  const next = new Set(state.breaks);
  next.delete(pos);
  return { tokens: state.tokens, breaks: next };
}

export function undo(history: BreakState[]): { state: BreakState | null; history: BreakState[] } {
  if (history.length <= 1) return { state: history[0] ?? null, history };
  const next = history.slice(0, -1);
  return { state: next[next.length - 1] ?? null, history: next };
}
