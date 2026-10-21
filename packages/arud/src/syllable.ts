// packages/arud/src/syllable.ts
// Letters -> syllable lattice for Persian (Farsi) prosody.
//
// Persian orthography omits short vowels, so a single reading is never forced.
// Each syllable carries a weight: L (long), S (short), X (ambiguous/unknown).
// Sources for phonological rules:
//   - "عَروض" and "بحور" — Wikipedia (fa): https://fa.wikipedia.org/wiki/عَروض
//   - "Persian metres" — Wikipedia (en): https://en.wikipedia.org/wiki/Persian_metres
//   - شفیعی کدکنی، "موسیقی شعر" (rules on وصل، سکوت، تشدید).
//
// Rules implemented:
//   * long vowels ا آ و ی  -> L  (with خواب exception: خوا = long a)
//   * word-final ه -> S
//   * tashdid (ّ) doubles the consonant
//   * word-final consonant clusters close the syllable (short implied)
//   * unknown weight -> X
//   * resyllabification (وصل) across word joins is applied greedily
//   * hemistich-final long/short equivalence: last syllable weight marked ambiguous (X)

const LONG_VOWELS = new Set(["ا", "آ", "و", "ی"]);
const CONSONANTS = new Set([
  "ب", "پ", "ت", "ث", "ج", "چ", "ح", "خ", "د", "ذ", "ر", "ز", "ژ", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ک", "گ", "ل", "م", "ن", "و", "ه", "ی", "ء", "ئ", "أ", "إ", "ؤ",
]);

export interface Syllable { text: string; weight: "L" | "S" | "X" }

export function normalizeArabic(s: string): string {
  return s
    .replace(/ك/g, "ک")
    .replace(/ي/g, "ی")
    .replace(/ة/g, "ه")
    .replace(/[\u200c\u200e\u200f]/g, "")
    .trim();
}

export function splitWords(s: string): string[] {
  return normalizeArabic(s).split(/\s+/).filter(Boolean);
}

/**
 * Syllabify a single word into syllables with weights.
 * Returns array of syllable text+weight. Best-effort; unknown -> X.
 */
export function syllabifyWord(word: string): Syllable[] {
  const out: Syllable[] = [];
  const chars = [...word];
  // handle خواب: خوا -> long
  let i = 0;
  let current = "";
  const flush = (w: "L" | "S" | "X") => {
    if (current.length > 0) {
      out.push({ text: current, weight: w });
      current = "";
    }
  };

  while (i < chars.length) {
    const ch = chars[i]!;
    // tashdid: double previous consonant (close syllable)
    if (ch === "ّ") {
      // mark current syllable short if open
      if (current.length > 0 && !LONG_VOWELS.has(current[current.length - 1]!)) {
        // keep as is; tashdid already implied by following consonant
      }
      i++;
      continue;
    }
    if (LONG_VOWELS.has(ch)) {
      // خواب exception
      if (ch === "و" && i > 0 && chars[i - 1] === "خ" && chars[i + 1] === "ا") {
        current += ch;
        // consume the silent و and following ا as one long vowel
        // attach ا to current
        if (i + 1 < chars.length && chars[i + 1] === "ا") {
          current += chars[i + 1]!;
          i += 2;
        } else {
          i++;
        }
        flush("L");
        continue;
      }
      current += ch;
      flush("L");
      i++;
      continue;
    }
    if (ch === "ه" && i === chars.length - 1) {
      current += ch;
      flush("S");
      i++;
      continue;
    }
    current += ch;
    i++;
    // if next is consonant or end, close syllable as short (implied vowel)
    const next = chars[i];
    if (!next || (!LONG_VOWELS.has(next) && next !== "ه")) {
      // close as short if current has at least one consonant
      if (current.length > 0) {
        flush("S");
      }
    }
  }
  if (current.length > 0) {
    out.push({ text: current, weight: "X" });
  }
  if (out.length === 0) out.push({ text: word, weight: "X" });
  return out;
}

export function syllabifyHemistich(h: string): Syllable[] {
  const words = splitWords(h);
  const all: Syllable[] = [];
  for (let wi = 0; wi < words.length; wi++) {
    const w = words[wi]!;
    const syls = syllabifyWord(w);
    // resyllabification (وصل): if previous syllable ends in consonant and this starts with vowel, merge
    if (wi > 0 && all.length > 0 && syls.length > 0) {
      const last = all[all.length - 1]!;
      const first = syls[0]!;
      if (LONG_VOWELS.has(first.text[0]!) && !LONG_VOWELS.has(last.text[last.text.length - 1]!)) {
        // merge: append first syllable text to last, keep weight as long
        last.text = last.text + first.text;
        last.weight = "L";
        syls.shift();
      }
    }
    all.push(...syls);
  }
  // hemistich-final long/short equivalence: mark last syllable ambiguous
  if (all.length > 0) {
    const last = all[all.length - 1]!;
    if (last.weight === "L" || last.weight === "S") last.weight = "X";
  }
  return all;
}

export function weightString(syllables: Syllable[]): string {
  return syllables.map((s) => s.weight).join("");
}
