import { describe, test, expect } from "bun:test";
import { precomputeNeighbours, atlasPoints, rrfFuse } from "../src";

describe("semantic", () => {
  test("precomputeNeighbours returns top-k", () => {
    const items = [{ id: "a", text: "بهار آمد" }, { id: "b", text: "بهار شد" }, { id: "c", text: "شب تاریک" }];
    const n = precomputeNeighbours(items, 2);
    expect(n.a.length).toBe(2);
  });
  test("atlasPoints returns coords", () => {
    const items = [{ id: "a", text: "بهار" }, { id: "b", text: "شب" }];
    const pts = atlasPoints(items);
    expect(pts.length).toBe(2);
  });
  test("rrfFuse merges", () => {
    const out = rrfFuse([["a", "b"], ["b", "c"]]);
    expect(out).toContain("b");
  });
});
