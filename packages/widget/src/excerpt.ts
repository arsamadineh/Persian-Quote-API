/**
 * excerpt helpers for the <persian-quote> web component.
 *
 * Wraps packages/poem pickExcerpt with word caps, seeded RNG, and classical-form
 * handling (whole beyts only, 1–2).
 */

import { pickExcerpt, type Excerpt } from "@persian-quote/poem";

export const SIZE_CAPS: Record<string, number> = {
  small: 25,
  medium: 45,
  large: 70,
};

export function capFor(size: string): number {
  return SIZE_CAPS[size] ?? SIZE_CAPS.medium;
}

/** Deterministic RNG (LCG) so repeated requests with the same seed agree. */
export function seededRng(seed: number): () => number {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export interface ExcerptArgs {
  stanzas: string[][];
  size?: string;
  maxWords?: number;
  seed?: number;
  classical?: boolean;
}

export function excerptFor(args: ExcerptArgs): Excerpt {
  const cap = args.maxWords ?? capFor(args.size ?? "medium");
  const rng = args.seed === undefined ? Math.random : seededRng(args.seed);
  const classical = args.classical ?? false;
  return pickExcerpt(args.stanzas, {
    maxWords: cap,
    targetWords: Math.max(8, Math.floor(cap * 0.6)),
    minWords: Math.max(4, Math.floor(cap * 0.3)),
    topK: 3,
    rng,
    strictBlocks: classical,
  });
}

export { pickExcerpt };
export type { Excerpt };
