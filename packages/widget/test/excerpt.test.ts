import { describe, test, expect } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { structurePoem } from "@persian-quote/poem";
import { excerptFor, capFor } from "../src/excerpt";

const ROOT = path.resolve(import.meta.dir, "..", "..", "..");
const SHOTS_FILE = path.join(ROOT, "data", "golden", "shots.jsonl");

const BAD_END = new Set([
  "و", "که", "تا", "یا", "از", "به", "در", "با", "بر", "چون", "ای", "می", "نمی", "بی", "همی", "اگر", "ولی", "اما",
]);

function words(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

function lastWord(line: string): string {
  const toks = line.trim().split(/\s+/).filter(Boolean);
  return toks[toks.length - 1]?.replace(/[\p{P}]/gu, "") ?? "";
}

function hasDanglingEnd(lines: string[]): boolean {
  if (lines.length === 0) return false;
  const last = lastWord(lines[lines.length - 1]!);
  const punct = /[،؛؟!:.…]$/.test(lines[lines.length - 1]!.trim());
  return !punct && BAD_END.has(last);
}

let shots: any[] = [];
try {
  shots = fs.readFileSync(SHOTS_FILE, "utf-8").trim().split("\n").map((l) => JSON.parse(l));
} catch {
  shots = [];
}

describe("packages/widget: excerpt caps (4 shots x 3 sizes)", () => {
  test("shots fixture present", () => {
    expect(shots.length).toBeGreaterThanOrEqual(4);
  });

  for (const shot of shots) {
    for (const size of ["small", "medium", "large"] as const) {
      test(`${shot.id} / ${size}`, () => {
        const res = structurePoem(shot.text ?? shot.flat_text);
        const classical = String(res.form ?? "").startsWith("classical");
        const ex = excerptFor({ stanzas: res.stanzas, size, seed: 42, classical });
        const cap = capFor(size);
        const totalWords = ex.lines.reduce((s, l) => s + words(l), 0);
        expect(totalWords).toBeLessThanOrEqual(cap);
        expect(hasDanglingEnd(ex.lines)).toBe(false);
        if (size === "medium") {
          expect(ex.lines.length).toBeLessThanOrEqual(8);
        }
        expect(ex.lines.length).toBeGreaterThan(0);
      });
    }
  }
});
