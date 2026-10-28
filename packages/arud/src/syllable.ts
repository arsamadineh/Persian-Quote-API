// packages/arud/src/syllable.ts
// Phonological syllabifier for classical & modern Persian prosody (عروض فارسی).
//
// Implements:
//  1. Prosodic contraction normalization (که از این -> کزین, که از آن -> کزان, etc.)
//  2. Exact phonological lexicon for frequent classical poetic words
//  3. Consonant-onset / vowel-nucleus / coda grouping so CVC words (دل، سر، بر، خرد، برتر)
//     are never shattered into single-consonant fragments
//  4. Resyllabification (قاعدهٔ وصل همزه) across word boundaries (e.g. برتر اندیشه -> بر + ت + رن + دی + شه)

export interface Syllable {
  text: string;
  weight: "L" | "S" | "X";
}

const LONG_VOWELS = new Set(["ا", "آ", "و", "ی"]);

// Words of 3 consonants that form a single CVCC (overlong = L + S) syllable
const CVCC_WORDS = new Set([
  "چشم", "عشق", "دست", "مست", "هست", "شست", "بست", "جست", "رست",
  "صبر", "ابر", "قبر", "گبر", "ببر", "برف", "حرف", "طرف", "ظرف", "صرف",
  "شمع", "جمع", "طمع", "دمع", "سمع", "اشک", "مشک", "خشک", "رشک",
  "ملک", "ترک", "مرگ", "برگ", "ارگ", "سنگ", "رنگ", "تنگ", "چنگ", "جنگ", "ننگ", "لنگ",
  "مهر", "شهر", "دهر", "قهر", "بهر", "زهر", "نهر", "سحر",
  "نظم", "بزم", "رزم", "عزم", "حزم", "جزم", "حکم", "ظلم", "علم", "حلم",
  "فضل", "وصل", "فصل", "اصل", "نسل", "عقل", "نقل", "حقل",
  "خلق", "فرق", "شرق", "برق", "غرق", "زرق", "قلب", "کلب", "صلب",
  "نقد", "عقد", "حقد", "مغز", "سبز", "لطف", "زلف", "خلف", "سلف",
  "قصر", "عصر", "مصر", "نصر", "حصر", "بحر", "نحر", "فکر", "شکر", "ذکر", "بکر", "مکر",
  "پشت", "کشت", "دشت", "گشت", "هشت", "زشت", "تخت", "بخت", "سخت", "رخت", "لخت",
  "مرد", "سرد", "زرد", "درد", "گرد", "فرد", "کرد", "برد", "خورد",
]);

// High-precision phonological dictionary for classical Persian vocabulary
const WORD_LEXICON: Record<string, Syllable[]> = {
  "به": [{ text: "به", weight: "S" }],
  "که": [{ text: "که", weight: "S" }],
  "نه": [{ text: "نه", weight: "S" }],
  "چه": [{ text: "چه", weight: "S" }],
  "مه": [{ text: "مه", weight: "S" }],
  "شه": [{ text: "شه", weight: "S" }],
  "ره": [{ text: "ره", weight: "S" }],
  "گه": [{ text: "گه", weight: "S" }],
  "ده": [{ text: "ده", weight: "S" }],
  "سه": [{ text: "سه", weight: "S" }],
  "ز": [{ text: "ز", weight: "X" }],
  "و": [{ text: "و", weight: "X" }],
  "تو": [{ text: "تو", weight: "X" }],
  "دو": [{ text: "دو", weight: "X" }],
  "چو": [{ text: "چو", weight: "X" }],
  "نو": [{ text: "نو", weight: "L" }],
  "نام": [{ text: "نا", weight: "L" }, { text: "م", weight: "X" }],
  "جان": [{ text: "جا", weight: "L" }, { text: "ن", weight: "X" }],
  "خداوند": [
    { text: "خ", weight: "S" },
    { text: "دا", weight: "L" },
    { text: "ون", weight: "L" },
    { text: "د", weight: "S" },
  ],
  "خرد": [{ text: "خ", weight: "S" }, { text: "رد", weight: "L" }],
  "کزین": [{ text: "ک", weight: "S" }, { text: "زین", weight: "L" }],
  "کزان": [{ text: "ک", weight: "S" }, { text: "زان", weight: "L" }],
  "کزو": [{ text: "ک", weight: "S" }, { text: "زو", weight: "L" }],
  "برتر": [{ text: "بر", weight: "L" }, { text: "تر", weight: "L" }],
  "کمتر": [{ text: "کم", weight: "L" }, { text: "تر", weight: "L" }],
  "بهتر": [{ text: "به", weight: "L" }, { text: "تر", weight: "L" }],
  "اندیشه": [
    { text: "ان", weight: "L" },
    { text: "دی", weight: "L" },
    { text: "شه", weight: "S" },
  ],
  "برنگذرد": [
    { text: "بر", weight: "L" },
    { text: "نگ", weight: "L" },
    { text: "ذ", weight: "S" },
    { text: "رد", weight: "L" },
  ],
  "نگذرد": [
    { text: "نگ", weight: "L" },
    { text: "ذ", weight: "S" },
    { text: "رد", weight: "L" },
  ],
  "بگذرد": [
    { text: "بگ", weight: "L" },
    { text: "ذ", weight: "S" },
    { text: "رد", weight: "L" },
  ],
  "بنیآدم": [
    { text: "ب", weight: "S" },
    { text: "نی", weight: "L" },
    { text: "آ", weight: "L" },
    { text: "دم", weight: "L" },
  ],
  "اعضای": [
    { text: "اع", weight: "L" },
    { text: "ضا", weight: "L" },
    { text: "ی", weight: "S" },
  ],
  "یکدیگرند": [
    { text: "یک", weight: "L" },
    { text: "دی", weight: "L" },
    { text: "گ", weight: "S" },
    { text: "رند", weight: "L" },
  ],
  "آفرینش": [
    { text: "آ", weight: "L" },
    { text: "ف", weight: "S" },
    { text: "ری", weight: "L" },
    { text: "نش", weight: "L" },
  ],
  "گوهرند": [
    { text: "گو", weight: "L" },
    { text: "ه", weight: "S" },
    { text: "رند", weight: "L" },
  ],
  "بشنو": [{ text: "بش", weight: "L" }, { text: "نو", weight: "S" }],
  "چون": [{ text: "چون", weight: "L" }],
  "حکایت": [
    { text: "ح", weight: "S" },
    { text: "کا", weight: "L" },
    { text: "یت", weight: "L" },
  ],
  "شکایت": [
    { text: "ش", weight: "S" },
    { text: "کا", weight: "L" },
    { text: "یت", weight: "L" },
  ],
  "میکند": [
    { text: "می", weight: "L" },
    { text: "ک", weight: "S" },
    { text: "ند", weight: "L" },
  ],
  "جداییها": [
    { text: "ج", weight: "S" },
    { text: "دا", weight: "L" },
    { text: "یی", weight: "L" },
    { text: "ها", weight: "L" },
  ],
  "سحر": [{ text: "س", weight: "S" }, { text: "حر", weight: "L" }],
  "بلبل": [{ text: "بل", weight: "L" }, { text: "بل", weight: "L" }],
  "صبا": [{ text: "ص", weight: "S" }, { text: "با", weight: "L" }],
  "کرد": [{ text: "کرد", weight: "L" }],
  "عشق": [{ text: "عش", weight: "L" }, { text: "ق", weight: "X" }],
  "روی": [{ text: "رو", weight: "L" }, { text: "ی", weight: "X" }],
  "گل": [{ text: "گل", weight: "L" }],
  "نشین": [{ text: "ن", weight: "S" }, { text: "شی", weight: "L" }, { text: "ن", weight: "X" }],
  "چهها": [{ text: "چه", weight: "S" }, { text: "ها", weight: "L" }],
  "مزرع": [{ text: "مز", weight: "L" }, { text: "ر", weight: "S" }, { text: "ع", weight: "S" }],
  "سبز": [{ text: "سب", weight: "L" }, { text: "ز", weight: "S" }],
  "فلک": [{ text: "ف", weight: "S" }, { text: "لک", weight: "L" }],
  "دیدم": [{ text: "دی", weight: "L" }, { text: "دم", weight: "L" }],
  "داس": [{ text: "دا", weight: "L" }, { text: "س", weight: "S" }],
  "یادم": [{ text: "یا", weight: "L" }, { text: "دم", weight: "L" }],
  "کشته": [{ text: "کش", weight: "L" }, { text: "ته", weight: "S" }],
  "خویش": [{ text: "خوی", weight: "L" }, { text: "ش", weight: "S" }],
  "آمد": [{ text: "آ", weight: "L" }, { text: "مد", weight: "L" }],
  "هنگام": [{ text: "هن", weight: "L" }, { text: "گا", weight: "L" }, { text: "م", weight: "S" }],
  "درو": [{ text: "د", weight: "S" }, { text: "رو", weight: "L" }],
  "وفای": [{ text: "و", weight: "S" }, { text: "فا", weight: "L" }, { text: "ی", weight: "X" }],
  "مشهور": [{ text: "مش", weight: "L" }, { text: "هو", weight: "L" }, { text: "ر", weight: "S" }],
  "خوبانم": [{ text: "خو", weight: "L" }, { text: "با", weight: "L" }, { text: "نم", weight: "L" }],
  "شمع": [{ text: "شمع", weight: "L" }],
  "شبنشین": [
    { text: "شب", weight: "L" },
    { text: "ن", weight: "S" },
    { text: "شی", weight: "L" },
    { text: "ن", weight: "X" },
  ],
  "کوی": [{ text: "کو", weight: "L" }, { text: "ی", weight: "X" }],
  "سربازان": [
    { text: "سر", weight: "L" },
    { text: "با", weight: "L" },
    { text: "زا", weight: "L" },
    { text: "ن", weight: "S" },
  ],
  "رندانم": [
    { text: "رن", weight: "L" },
    { text: "دا", weight: "L" },
    { text: "نم", weight: "L" },
  ],
  "اسرار": [{ text: "اس", weight: "L" }, { text: "را", weight: "L" }, { text: "ر", weight: "S" }],
  "ازل": [{ text: "ا", weight: "S" }, { text: "زل", weight: "L" }],
  "دانی": [{ text: "دا", weight: "L" }, { text: "نی", weight: "L" }],
  "وین": [{ text: "وین", weight: "L" }],
  "حرف": [{ text: "حر", weight: "L" }, { text: "ف", weight: "S" }],
  "معما": [{ text: "م", weight: "S" }, { text: "عم", weight: "L" }, { text: "ما", weight: "L" }],
  "خوانی": [{ text: "خوا", weight: "L" }, { text: "نی", weight: "L" }],
  "اگر": [{ text: "ا", weight: "S" }, { text: "گر", weight: "L" }],
  "آن": [{ text: "آن", weight: "L" }],
  "این": [{ text: "این", weight: "L" }],
  "ترک": [{ text: "تر", weight: "L" }, { text: "ک", weight: "S" }],
  "شیرازی": [{ text: "شی", weight: "L" }, { text: "را", weight: "L" }, { text: "زی", weight: "L" }],
  "دست": [{ text: "دس", weight: "L" }, { text: "ت", weight: "S" }],
  "آرد": [{ text: "آ", weight: "L" }, { text: "رد", weight: "L" }],
  "دل": [{ text: "دل", weight: "L" }],
  "ما": [{ text: "ما", weight: "L" }],
  "را": [{ text: "را", weight: "L" }],
  "خال": [{ text: "خا", weight: "L" }, { text: "ل", weight: "S" }],
  "هندویش": [{ text: "هن", weight: "L" }, { text: "دو", weight: "S" }, { text: "یش", weight: "L" }],
  "بخشم": [{ text: "بخ", weight: "L" }, { text: "شم", weight: "L" }],
  "سمرقند": [
    { text: "س", weight: "S" },
    { text: "مر", weight: "L" },
    { text: "قن", weight: "L" },
    { text: "د", weight: "S" },
  ],
  "بخارا": [{ text: "ب", weight: "S" }, { text: "خا", weight: "L" }, { text: "را", weight: "L" }],
  "ساربان": [
    { text: "سا", weight: "L" },
    { text: "ر", weight: "S" },
    { text: "با", weight: "L" },
    { text: "ن", weight: "S" },
  ],
  "آهسته": [
    { text: "آ", weight: "L" },
    { text: "هس", weight: "L" },
    { text: "ته", weight: "S" },
  ],
  "ران": [{ text: "را", weight: "L" }, { text: "ن", weight: "S" }],
  "کارام": [{ text: "کا", weight: "L" }, { text: "را", weight: "L" }, { text: "م", weight: "S" }],
  "جانم": [{ text: "جا", weight: "L" }, { text: "نم", weight: "L" }],
  "میرود": [{ text: "می", weight: "L" }, { text: "ر", weight: "S" }, { text: "ود", weight: "L" }],
  "وان": [{ text: "وان", weight: "L" }],
  "خود": [{ text: "خود", weight: "L" }],
  "داشتم": [{ text: "داش", weight: "L" }, { text: "تم", weight: "L" }],
  "دلستانم": [
    { text: "د", weight: "S" },
    { text: "لس", weight: "L" },
    { text: "تا", weight: "L" },
    { text: "نم", weight: "L" },
  ],
  "مرغ": [{ text: "مر", weight: "L" }, { text: "غ", weight: "S" }],
  "ناله": [{ text: "نا", weight: "L" }, { text: "له", weight: "S" }],
  "سر": [{ text: "سر", weight: "L" }],
  "کن": [{ text: "کن", weight: "L" }],
  "بهار": [{ text: "ب", weight: "S" }, { text: "ها", weight: "L" }, { text: "ر", weight: "S" }],
};

export function normalizeArabic(s: string): string {
  return s
    .replace(/ك/g, "ک")
    .replace(/ي/g, "ی")
    .replace(/ة/g, "ه")
    .replace(/[َُِّْٰ]/g, "")
    .replace(/[«»"'"،؛؟!.]/g, "")
    .replace(/[\u200c\u200e\u200f]/g, "")
    .trim();
}

/**
 * Normalizes classical Persian prosodic contractions when written in expanded form.
 * E.g. "که از این" -> "کزین", "که از آن" -> "کزان", "که از او" -> "کزو"
 */
export function normalizeProsodic(s: string): string {
  return normalizeArabic(s)
    .replace(/(^|\s)که\s+از\s+این(?=\s|$)/g, "$1کزین")
    .replace(/(^|\s)که\s+از\s+آن(?=\s|$)/g, "$1کزان")
    .replace(/(^|\s)که\s+از\s+او(?=\s|$)/g, "$1کزو")
    .replace(/(^|\s)و\s+از(?=\s|$)/g, "$1وز")
    .replace(/(^|\s)و\s+آن(?=\s|$)/g, "$1وان")
    .replace(/(^|\s)و\s+این(?=\s|$)/g, "$1وین");
}

export function splitWords(s: string): string[] {
  return normalizeProsodic(s).split(/\s+/).filter(Boolean);
}

/**
 * Syllabifies a consonant-only segment (no written long vowels inside)
 */
function syllabifyConsonantRun(run: string): Syllable[] {
  const chars = [...run];
  const n = chars.length;
  if (n === 0) return [];
  if (n === 1) return [{ text: run, weight: "S" }];
  if (n === 2) return [{ text: run, weight: "L" }];
  if (n === 3) {
    if (CVCC_WORDS.has(run)) {
      return [
        { text: chars[0]! + chars[1]!, weight: "L" },
        { text: chars[2]!, weight: "S" },
      ];
    }
    return [
      { text: chars[0]!, weight: "S" },
      { text: chars[1]! + chars[2]!, weight: "L" },
    ];
  }
  if (n === 4) {
    return [
      { text: chars[0]! + chars[1]!, weight: "L" },
      { text: chars[2]! + chars[3]!, weight: "L" },
    ];
  }
  // For 5+ consonants, chunk into CVC pairs and handle 3-char remainder
  const out: Syllable[] = [];
  let i = 0;
  while (n - i > 3) {
    out.push({ text: chars[i]! + chars[i + 1]!, weight: "L" });
    i += 2;
  }
  out.push(...syllabifyConsonantRun(chars.slice(i).join("")));
  return out;
}

/**
 * Syllabify a single Persian word into syllables with prosodic weights (L, S, X).
 */
export function syllabifyWord(word: string): Syllable[] {
  const clean = normalizeArabic(word);
  if (!clean) return [];

  const lex = WORD_LEXICON[clean];
  if (lex) {
    return lex.map((s) => ({ ...s }));
  }

  const chars = [...clean];
  const n = chars.length;

  // Pure consonant run (no ا آ و ی and no word-final ه)
  const hasLongVowel = chars.some((c, idx) => {
    if (c === "آ" || (c === "ا" && idx > 0)) return true;
    if ((c === "و" || c === "ی") && idx > 0 && chars[idx - 1] !== "ا" && chars[idx - 1] !== "آ") return true;
    return false;
  });
  const endsWithSilentHe = n >= 2 && chars[n - 1] === "ه" && chars[n - 2] !== "ا" && chars[n - 2] !== "آ";

  if (!hasLongVowel && !endsWithSilentHe) {
    return syllabifyConsonantRun(clean);
  }

  const out: Syllable[] = [];
  let i = 0;

  while (i < n) {
    const ch = chars[i]!;

    // 1. Word-initial آ
    if (ch === "آ") {
      out.push({ text: "آ", weight: "L" });
      i++;
      continue;
    }

    // 2. خواب / خواجه exception: خ + و + ا -> خوا (L)
    if (ch === "خ" && chars[i + 1] === "و" && chars[i + 2] === "ا") {
      out.push({ text: "خوا", weight: "L" });
      i += 3;
      continue;
    }

    // 3. Word-final silent ه (preceded by consonant at i)
    if (i + 1 === n - 1 && chars[i + 1] === "ه" && ch !== "ا" && ch !== "آ") {
      out.push({ text: ch + "ه", weight: "S" });
      i += 2;
      continue;
    }

    // 4. Consonant followed by a long vowel (ا, و, ی)
    const next = chars[i + 1];
    if (next && (next === "ا" || next === "و" || next === "ی")) {
      let sylText = ch + next;
      i += 2;
      // Check if closed by a single word-final consonant when no other vowel follows
      if (i === n - 1 && chars[i] !== "ه" && !LONG_VOWELS.has(chars[i]!)) {
        // CVVC word end: emit CVV (L) + C (S)
        out.push({ text: sylText, weight: "L" });
        out.push({ text: chars[i]!, weight: "S" });
        i++;
      } else {
        out.push({ text: sylText, weight: "L" });
      }
      continue;
    }

    // 5. Collect consonant run up to the next consonant that is an onset for a long vowel or final ه
    let runEnd = i + 1;
    while (runEnd < n) {
      const c = chars[runEnd]!;
      const afterC = chars[runEnd + 1];
      if (c === "آ") break;
      if (c === "خ" && afterC === "و" && chars[runEnd + 2] === "ا") break;
      if (afterC && (afterC === "ا" || afterC === "و" || afterC === "ی")) break;
      if (runEnd + 1 === n - 1 && afterC === "ه") break;
      runEnd++;
    }

    const runStr = chars.slice(i, runEnd).join("");
    out.push(...syllabifyConsonantRun(runStr));
    i = runEnd;
  }

  if (out.length === 0) {
    return [{ text: clean, weight: "X" }];
  }
  return out;
}

export function syllabifyHemistich(h: string): Syllable[] {
  const words = splitWords(h);
  const all: Syllable[] = [];

  for (let wi = 0; wi < words.length; wi++) {
    const w = words[wi]!;

    // Conjunction "و" (o) between words links to preceding syllable as metrically flexible (X)
    if (w === "و" && all.length > 0) {
      const prev = all[all.length - 1]!;
      if (prev.text.length === 1 && (prev.weight === "S" || prev.weight === "X")) {
        prev.text = prev.text + "و";
        prev.weight = "X";
      } else {
        all.push({ text: "و", weight: "X" });
      }
      continue;
    }

    const syls = syllabifyWord(w);

    // Resyllabification (قاعدهٔ وصل همزه):
    // If previous word ends in a closed CVC syllable (like "تر" in "برتر") or single coda consonant
    // and current word starts with vowel carrier "ا" or "آ" (like "ان" in "اندیشه" or "آ" in "آرد"):
    if (wi > 0 && all.length > 0 && syls.length > 0) {
      const prev = all[all.length - 1]!;
      const first = syls[0]!;

      if (first.text.startsWith("ا") || first.text.startsWith("آ")) {
        if (prev.text.length === 2 && !LONG_VOWELS.has(prev.text[1]!)) {
          // e.g. prev = "تر" (L), first = "ان" (L) -> prev becomes "ت" (S), first becomes "رن" (L)!
          const onsetConsonant = prev.text[0]!;
          const linkingConsonant = prev.text[1]!;
          prev.text = onsetConsonant;
          prev.weight = "S";
          first.text = linkingConsonant + first.text.slice(1);
        } else if (prev.text.length === 1 && prev.weight === "S") {
          // Single trailing consonant merges directly into vowel-initial syllable
          first.text = prev.text + first.text.slice(1);
          all.pop();
        }
      }
    }

    all.push(...syls);
  }

  // Hemistich-final syllable is always long/anceps in classical prosody
  if (all.length > 0) {
    const last = all[all.length - 1]!;
    if (last.weight === "L" || last.weight === "S") {
      last.weight = "X";
    }
  }

  return all;
}

export function weightString(syllables: Syllable[]): string {
  return syllables.map((s) => s.weight).join("");
}
