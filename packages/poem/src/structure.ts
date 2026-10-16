import { cleanLine as cleanPersianLine, assertPersianTypography } from "@persian-quote/persian";
import type { Stanzas, StructureMeta } from "@persian-quote/schema";
import { extractColophon, type ExtractedColophon } from "./colophon";

export const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
export const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function cleanLine(s: string): string {
  if (!s) return "";
  return s
    .normalize("NFC")
    .replace(/[\u200e\u200f]/g, "")
    .replace(/\u0640/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([،؛؟!.:)»\]])/g, "$1")
    .replace(/([(«\[])\s+/g, "$1")
    .replace(/([،؛؟])(?=[^\s\d)»"'\]،؛؟!.:])/g, "$1 ")
    .replace(/([!:])(?=[^\s\d)»"'\]،؛؟!.:])/g, "$1 ")
    .replace(/^[\s/*□■]+/u, "")
    .replace(/[\s/*□■]+$/u, "")
    .trim();
}

export function letterFingerprint(s: string): string {
  if (!s) return "";
  return s.normalize("NFC").replace(/[\s\u200c\u200e\u200f\u0640*\/□■]+/g, "");
}

export function splitBySignals(raw: string): Stanzas | null {
  if (!raw || typeof raw !== "string") return null;

  const hasSignal =
    /\*/.test(raw) ||
    /[□■]/.test(raw) ||
    /\n/.test(raw) ||
    /\S\s{2,}\S/.test(raw) ||
    /\s\/\s/.test(raw);

  if (!hasSignal) return null;

  // Digits/punctuation-only lines (section numbers, ellipsis separators, stray dates)
  // are editorial signals, not poem content. Filter them to satisfy A3 invariants.
  const isSignalOnly = (l: string): boolean => /^[\d\p{P}\s/□■*\-–—_…\.]+$/u.test(l);

  const stanzas = raw
    .split(/\s*\*+\s*|\s*[□■]+\s*|\n\s*\n/)
    .map((block) =>
      block
        .split(/\s{2,}|\n|\s\/\s/)
        .map(cleanLine)
        .filter((l) => l.length > 0)
        .filter((l) => l !== "□" && l !== "■")
        .filter((l) => !isSignalOnly(l))
    )
    .filter((b) => b.length > 0);

  return stanzas.length > 0 ? stanzas : null;
}

const wordCount = (s: string): number => s.split(/\s+/).filter(Boolean).length;

export function looksStructured(stanzas: Stanzas): boolean {
  const flat = stanzas.flat();
  if (flat.length < 2) return false;
  const counts = flat.map(wordCount).sort((a, b) => a - b);
  const median = counts[Math.floor(counts.length / 2)] ?? 0;
  const max = counts[counts.length - 1] ?? 0;
  return median >= 2 && median <= 12 && max <= 22;
}

// ---------------------------------------------------------------------------
// Linguistic constants for heuristic line reconstruction fallback
// ---------------------------------------------------------------------------
const TARGET_LINE_LENGTH = 24;
const MIN_LINE_LENGTH = 8;
const MAX_LINE_LENGTH = 64;
const MIN_TOKENS_FOR_REFLOW = 12;

const INSEPARABLE_END = new Set(["می", "نمی", "بی"]);
const INSEPARABLE_START = new Set(["را", "است", "هست", "نیست", "بود", "شد", "تر", "می", "نمی", "بی"]);

const AWKWARD_LINE_END = new Set([
  "و", "که", "به", "از", "در", "با", "تا", "بر", "این", "آن", "یک",
  "چه", "اگر", "نه", "ولی", "اما", "چون", "یا", "نیز", "همان", "چنین",
  "مرا", "ترا", "او", "ما", "شما", "آنها", "مگر", "زیرا",
]);

const GOOD_LINE_END = new Set(["،", "؛", "؟", "!", ":", "…", "."]);
const LEADING_MARKS = /^[«("'\[]+/;
const TRAILING_MARKS = /[،؛؟!:.…»)"'\]]+$/;

function bareToken(token: string): string {
  return token.replace(LEADING_MARKS, "").replace(TRAILING_MARKS, "");
}

export function reconstructLines(text: string): string[] {
  const cleaned = cleanLine(text);
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const count = tokens.length;
  if (count < MIN_TOKENS_FOR_REFLOW) return tokens.length ? [tokens.join(" ")] : [];

  const lengths = new Int32Array(count);
  const blockedStartAt = new Uint8Array(count);
  const blockedEndBefore = new Uint8Array(count);
  const awkwardEnd = new Uint8Array(count);
  const goodEnd = new Uint8Array(count);

  for (let i = 0; i < count; i++) {
    const token = tokens[i] ?? "";
    const bare = bareToken(token);
    lengths[i] = token.length;
    blockedStartAt[i] = INSEPARABLE_START.has(bare) ? 1 : 0;
    blockedEndBefore[i] = INSEPARABLE_END.has(bare) ? 1 : 0;
    awkwardEnd[i] = AWKWARD_LINE_END.has(bare) ? 1 : 0;
    const lastChar = token[token.length - 1];
    goodEnd[i] = lastChar && GOOD_LINE_END.has(lastChar) ? 1 : 0;
  }

  const cost = new Float64Array(count + 1);
  const parent = new Int32Array(count + 1);
  cost.fill(Infinity);
  cost[0] = 0;

  for (let i = 0; i < count; i++) {
    const c = cost[i];
    if (c === Infinity || c === undefined) continue;

    let lineLen = 0;
    for (let j = i + 1; j <= count; j++) {
      const tokenLen = lengths[j - 1] ?? 0;
      lineLen += (j === i + 1 ? 0 : 1) + tokenLen;

      if (lineLen > MAX_LINE_LENGTH) break;
      if (lineLen < MIN_LINE_LENGTH && j < count) continue;

      if (j < count && blockedStartAt[j] === 1) continue;
      if (blockedEndBefore[j - 1] === 1) continue;

      const diff = lineLen - TARGET_LINE_LENGTH;
      let stepCost = diff * diff;

      if (awkwardEnd[j - 1] === 1) stepCost += 16;
      if (goodEnd[j - 1] === 1) stepCost = Math.max(0, stepCost - 8);

      const totalCost = c + stepCost;
      const currentCost = cost[j] ?? Infinity;
      if (totalCost < currentCost) {
        cost[j] = totalCost;
        parent[j] = i;
      }
    }
  }

  const lines: string[] = [];
  let curr = count;
  while (curr > 0) {
    const prev = parent[curr] ?? 0;
    lines.unshift(tokens.slice(prev, curr).join(" "));
    curr = prev;
  }

  return lines.length > 0 ? lines : [tokens.join(" ")];
}

export interface AnalyzedStructure {
  body: string;
  stanzas: Stanzas;
  colophon?: ExtractedColophon;
  origin: "separators" | "inferred" | "heuristic";
  confidence: number;
  text_plain: string;
}

export function analyzeStructure(raw: string): AnalyzedStructure {
  const { body, colophon } = extractColophon(raw);
  const signalStanzas = splitBySignals(body);

  if (signalStanzas && signalStanzas.length > 0) {
    const isStructured = looksStructured(signalStanzas);
    const origin = isStructured ? "separators" : "separators";
    const confidence = isStructured ? 1.0 : 0.92;
    const text_plain = signalStanzas.map((st) => st.join("\n")).join("\n\n");
    return {
      body,
      stanzas: signalStanzas,
      colophon,
      origin,
      confidence,
      text_plain,
    };
  }

  // Fallback to heuristic reconstruction
  const reconstructed = reconstructLines(body);
  const stanzas: Stanzas = reconstructed.length > 0 ? [reconstructed] : [[cleanLine(body)]];
  const text_plain = stanzas.map((st) => st.join("\n")).join("\n\n");

  return {
    body,
    stanzas,
    colophon,
    origin: "heuristic",
    confidence: 0.85,
    text_plain,
  };
}
