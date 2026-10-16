export interface FuzzyOptions {
  maxDistance?: number;
}

export function levenshteinDistance(a: string, b: string, options: FuzzyOptions = {}): number {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const { maxDistance = Infinity } = options;
  if (Math.abs(a.length - b.length) > maxDistance) {
    return maxDistance + 1;
  }

  const s1 = a.length <= b.length ? a : b;
  const s2 = a.length <= b.length ? b : a;
  const m = s1.length;
  const n = s2.length;

  let prev = new Int32Array(m + 1);
  let curr = new Int32Array(m + 1);

  for (let i = 0; i <= m; i++) prev[i] = i;

  for (let j = 1; j <= n; j++) {
    curr[0] = j;
    const char2 = s2.charCodeAt(j - 1);
    let minInRow = curr[0]!;

    for (let i = 1; i <= m; i++) {
      const char1 = s1.charCodeAt(i - 1);
      const cost = char1 === char2 ? 0 : 1;
      const val = Math.min(
        prev[i]! + 1,        // deletion
        curr[i - 1]! + 1,    // insertion
        prev[i - 1]! + cost  // substitution
      );
      curr[i] = val;
      if (val < minInRow) minInRow = val;
    }

    if (minInRow > maxDistance) return maxDistance + 1;

    const tmp = prev;
    prev = curr;
    curr = tmp;
  }

  return prev[m]!;
}

export function fuzzyMatch(a: string, b: string, options: FuzzyOptions = {}): number {
  if (!a && !b) return 1.0;
  if (!a || !b) return 0.0;
  if (a === b) return 1.0;

  const maxLen = Math.max(a.length, b.length);
  const dist = levenshteinDistance(a, b, options);
  if (dist > maxLen) return 0.0;
  return Math.max(0, 1 - dist / maxLen);
}
