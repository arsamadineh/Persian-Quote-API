import { describe, test, expect } from "bun:test";
import { kwic, wordFreq, buildVerseIndex, identifyVerse, collate, collationToTei, cite } from "../src";
import type { Corpus, Work } from "../../../contracts/corpus";

const corpus: Corpus = {
  works: [
    { id: "w1", poetId: "p1", poetName: "شاعر یک", title: "غزل ۱", kind: "classical", stanzas: [["بهار آمد و گل شکفت", "نسیم صبح نوید داد"]], beyts: [["بهار آمد و گل شکفت", "نسیم صبح نوید داد"]] },
    { id: "w2", poetId: "p2", poetName: "شاعر دو", title: "غزل ۲", kind: "classical", stanzas: [["شب تاریک و بیم موج", "و گردابی چنین هائل"]] },
  ] as Work[],
};

describe("tools: kwic", () => {
  test("finds term", () => {
    const rows = kwic(corpus, "بهار");
    expect(rows.length).toBe(1);
    expect(rows[0]!.hit).toBe("بهار");
  });
  test("filter by poet", () => {
    const rows = kwic(corpus, "و", { poet: "p2" });
    expect(rows.every((r) => r.poetId === "p2")).toBe(true);
  });
});

describe("tools: wordFreq", () => {
  test("top-n", () => {
    const f = wordFreq(corpus, { top: 3 });
    expect(f.length).toBeLessThanOrEqual(3);
    expect(f[0]![1]).toBeGreaterThan(0);
  });
});

describe("tools: identifyVerse", () => {
  test("hit@1 on exact beyt", () => {
    const idx = buildVerseIndex(corpus);
    const res = identifyVerse(idx, "بهار آمد و گل شکفت");
    expect(res.length).toBeGreaterThan(0);
    expect(res[0]!.workId).toBe("w1");
  });
  test("damaged query still returns candidate", () => {
    const idx = buildVerseIndex(corpus);
    const res = identifyVerse(idx, "بهار آمد گل");
    expect(res.length).toBeGreaterThan(0);
  });
});

describe("tools: collate", () => {
  test("round-trip 3 witnesses", () => {
    const t = collate([
      { siglum: "A", text: "کتاب و قلم" },
      { siglum: "B", text: "کتاب و قلم" },
      { siglum: "C", text: "کتاب قلم" },
    ], { equivalences: ["kaf", "yeh", "heh", "zwnj"] });
    expect(t.witnesses.length).toBe(3);
    expect(t.rows.length).toBeGreaterThan(0);
    const tei = collationToTei(t);
    expect(tei).toContain("<app>");
  });
});

describe("tools: cite", () => {
  test("apa-fa format", () => {
    const s = cite({ id: "h.1", poetId: "hafez", poetName: "حافظ", title: "غزل ۱", kind: "classical" }, "apa-fa", { beyt: 3 });
    expect(s).toContain("حافظ");
    expect(s).toContain("بیت");
  });
  test("bibtex format", () => {
    const s = cite({ id: "h.1", poetId: "hafez", poetName: "حافظ", title: "غزل ۱", kind: "classical" }, "bibtex");
    expect(s).toContain("@misc");
  });
});
