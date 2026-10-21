const TYPESET_SUFFIX_REGEX = /(?<=[\p{L}\u200c])\s+(ی|ها|های|تر|ترین)(?=[^\p{L}\u200c]|$)/gu;

/**
 * Typesets a single line of poetry by attaching standalone suffixes
 * (ی, ها, های, تر, ترین) to the preceding word using a Zero-Width Non-Joiner (\u200c).
 *
 * Single-pass linear execution guarantees O(N) time and eliminates ReDoS backtracking.
 * Invariant: Never touches "می" (noun/verbal prefix).
 */
export function typesetLine(line: string): string {
  if (!line) return '';
  return line.replace(TYPESET_SUFFIX_REGEX, '\u200c$1');
}

/**
 * Applies the typeset layer across all stanzas and lines.
 */
export function applyTypesetLayer(stanzas: string[][]): string[][] {
  return stanzas.map((stanza) => stanza.map(typesetLine));
}
