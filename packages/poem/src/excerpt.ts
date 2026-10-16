import type { Stanzas } from "@persian-quote/schema";

export interface ExcerptOptions {
  minWords?: number;
  targetWords?: number;
  maxWords?: number;
  topK?: number;
  rng?: () => number;
  strictBlocks?: boolean;
}

export interface Excerpt {
  lines: string[];
  start: number;
  end: number;
  cutStart: boolean;
  cutEnd: boolean;
  text: string;
}

const SENT_END = /[.!؟?…؛]$/;
const SOFT_END = /[،,:]$/;
const BAD_START = new Set(["و", "که", "را", "تا", "یا", "است", "بود", "شد", "هست", "نیست", "هم", "نیز"]);
const BAD_END = new Set([
  "و", "که", "تا", "یا", "از", "به", "در", "با", "بر", "چون", "ای", "می", "نمی", "بی", "همی", "اگر", "ولی", "اما",
]);

const wc = (s: string) => s.split(/\s+/).filter(Boolean).length;
const strip = (w: string) => w.replace(/[\p{P}\p{S}]/gu, "");

interface FlatLine {
  text: string;
  words: number;
  blockStart: boolean;
  blockEnd: boolean;
}

function scoreWindow(flat: FlatLine[], i: number, j: number, words: number, target: number): number {
  const first = flat[i]?.text ?? "";
  const lastLine = flat[j - 1]?.text ?? "";
  const prev = i > 0 ? (flat[i - 1]?.text ?? "") : "";
  let s = 0;

  s -= 4 * ((words - target) / target) ** 2;

  if (i === 0) s += 2;
  if (flat[i]?.blockStart) s += 3;
  if (SENT_END.test(prev)) s += 2;
  else if (SOFT_END.test(prev)) s += 0.5;

  const firstWord = strip((first.split(/\s+/)[0] ?? ""));
  if (BAD_START.has(firstWord)) s -= 3;

  if (SENT_END.test(lastLine)) s += 4;
  else if (SOFT_END.test(lastLine)) s += 1;
  if (flat[j - 1]?.blockEnd) s += 3;
  if (j === flat.length) s += 1;

  if (!/[\p{P}]$/u.test(lastLine)) {
    const lastWord = strip(lastLine.split(/\s+/).pop() ?? "");
    if (BAD_END.has(lastWord)) s -= 4;
  }

  const text = flat.slice(i, j).map((l) => l.text).join(" ");
  const count = (re: RegExp) => (text.match(re) ?? []).length;
  if (count(/«/g) !== count(/»/g)) s -= 3;
  if (count(/\(/g) !== count(/\)/g)) s -= 3;

  return s;
}

export function pickExcerpt(stanzas: Stanzas, opts: ExcerptOptions = {}): Excerpt {
  const {
    minWords = 6,
    targetWords = 20,
    maxWords = 45,
    topK = 1,
    rng = Math.random,
    strictBlocks = false,
  } = opts;

  const flat: FlatLine[] = [];
  for (const block of stanzas) {
    block.forEach((text, k) =>
      flat.push({
        text,
        words: wc(text),
        blockStart: k === 0,
        blockEnd: k === block.length - 1,
      })
    );
  }

  if (flat.length === 0) {
    return {
      lines: [""],
      start: 0,
      end: 0,
      cutStart: false,
      cutEnd: false,
      text: "",
    };
  }

  const total = flat.reduce((a, l) => a + l.words, 0);
  const whole = (): Excerpt => {
    const lines = flat.map((l) => l.text);
    return {
      lines,
      start: 0,
      end: flat.length,
      cutStart: false,
      cutEnd: false,
      text: lines.join("\n"),
    };
  };

  if (total <= maxWords) return whole();

  const collect = (strict: boolean) => {
    const best = new Map<number, { i: number; j: number; score: number }>();
    for (let i = 0; i < flat.length; i++) {
      let words = 0;
      for (let j = i; j < flat.length; j++) {
        const nextWords = words + (flat[j]?.words ?? 0);
        if (nextWords > maxWords) break;
        words = nextWords;
        if (words < minWords && j + 1 < flat.length) continue;
        if (strict && !(flat[i]?.blockStart && flat[j]?.blockEnd)) continue;

        const score = scoreWindow(flat, i, j + 1, words, targetWords);
        const cur = best.get(i);
        if (!cur || score > cur.score) {
          best.set(i, { i, j: j + 1, score });
        }
      }
    }
    return [...best.values()].sort((a, b) => b.score - a.score);
  };

  let cands = strictBlocks ? collect(true) : [];
  if (!cands.length) cands = collect(false);

  if (!cands.length) {
    // If no window met constraints, take the first line that fits within maxWords
    const firstLine = flat[0]?.text ?? "";
    return {
      lines: [firstLine],
      start: 0,
      end: 1,
      cutStart: false,
      cutEnd: flat.length > 1,
      text: firstLine + (flat.length > 1 ? "…" : ""),
    };
  }

  const pick = cands[Math.floor(rng() * Math.min(topK, cands.length))]!;
  const pickedLines = flat.slice(pick.i, pick.j).map((l) => l.text);
  const cutStart = pick.i > 0;
  const cutEnd = pick.j < flat.length;

  let text = pickedLines.join("\n");
  if (cutStart) text = `… ${text}`;
  if (cutEnd) text = `${text} …`;

  return {
    lines: pickedLines,
    start: pick.i,
    end: pick.j,
    cutStart,
    cutEnd,
    text,
  };
}
