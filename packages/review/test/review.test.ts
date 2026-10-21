import { describe, test, expect } from "bun:test";
import { validatePatch, toggleBreak, insertBreak, removeBreak } from "../src";
import type { ReviewItem, HumanPatch } from "../../../contracts/review";

describe("review: validatePatch", () => {
  const item: ReviewItem = { workId: "w1", flat: "a b c d", proposed: [["a b"], ["c d"]], confidence: 0.5, flags: [] };
  test("accepts fingerprint-preserving patch", () => {
    const p: HumanPatch = { workId: "w1", stanzas: [["a b"], ["c d"]], reviewer: "r", at: "t" };
    expect(validatePatch(item, p).ok).toBe(true);
  });
  test("rejects letter-changing patch", () => {
    const p: HumanPatch = { workId: "w1", stanzas: [["a b"], ["c x"]], reviewer: "r", at: "t" };
    expect(validatePatch(item, p).ok).toBe(false);
    expect(validatePatch(item, p).reason).toBe("fingerprint_changed");
  });
  test("rejects workId mismatch", () => {
    const p: HumanPatch = { workId: "w2", stanzas: [["a b"], ["c d"]], reviewer: "r", at: "t" };
    expect(validatePatch(item, p).ok).toBe(false);
  });
});

describe("review: keyboard break model", () => {
  test("toggle/insert/remove", () => {
    const s = { tokens: ["a", "b", "c"], breaks: new Set<number>() };
    const t = toggleBreak(s, 1);
    expect(t.breaks.has(1)).toBe(true);
    const r = removeBreak(t, 1);
    expect(r.breaks.has(1)).toBe(false);
    const i = insertBreak(s, 2);
    expect(i.breaks.has(2)).toBe(true);
  });
});
