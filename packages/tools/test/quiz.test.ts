import { describe, test, expect } from "bun:test";
import { makeQuiz, toMoodleXml, toCsv, toGift, toPrintableHtml } from "../src";
import type { Work } from "../../../contracts/corpus";

const work: Work = {
  id: "h.1", poetId: "hafez", poetName: "حافظ", title: "غزل ۱", kind: "classical",
  stanzas: [["صلاح کار کجا و من خراب کجا", "ببين تفاوت ره کز کجاست تا به کجا"]],
  beyts: [["صلاح کار کجا و من خراب کجا", "ببين تفاوت ره کز کجاست تا به کجا"]],
};

describe("tools/quiz: determinism", () => {
  test("same seed -> same quiz", () => {
    const a = makeQuiz(work, "missing-word", 42);
    const b = makeQuiz(work, "missing-word", 42);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
  test("different seed may differ", () => {
    const a = makeQuiz(work, "missing-word", 42);
    const b = makeQuiz(work, "missing-word", 7);
    // not strictly required to differ, but prompt should be valid
    expect(a.prompt.length).toBeGreaterThan(0);
    expect(b.prompt.length).toBeGreaterThan(0);
  });
});

describe("tools/quiz: exports", () => {
  test("moodle xml well-formed (basic)", () => {
    const q = makeQuiz(work, "missing-word", 1);
    const xml = toMoodleXml([q]);
    expect(xml).toContain('<?xml');
    expect(xml).toContain("<quiz>");
    expect(xml).toContain("</quiz>");
    expect(xml).toContain("<question");
  });
  test("csv/gift/html non-empty", () => {
    const q = makeQuiz(work, "missing-word", 1);
    expect(toCsv([q]).length).toBeGreaterThan(0);
    expect(toGift([q]).length).toBeGreaterThan(0);
    expect(toPrintableHtml([q]).length).toBeGreaterThan(0);
  });
});
