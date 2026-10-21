import { describe, test, expect } from "bun:test";
import { buildProfile, burrowsDelta, attribute, ABSTAIN_MESSAGE, clusterPoets, pcaPoints } from "../src";

describe("style: abstain on short text", () => {
  test("returns empty under 200 words", () => {
    const p = buildProfile("p1", ["کلمه ".repeat(50)]);
    const res = attribute("متن کوتاه", [p]);
    expect(res.length).toBe(0);
  });
  test("abstain message", () => {
    expect(ABSTAIN_MESSAGE()).toContain("کوتاه");
  });
});

describe("style: delta + cluster + pca", () => {
  test("burrowsDelta returns sorted", () => {
    const p1 = buildProfile("p1", ["کلمهٔ نخست ".repeat(250)]);
    const p2 = buildProfile("p2", ["واژهٔ دوم ".repeat(250)]);
    const res = burrowsDelta("کلمهٔ نخست ".repeat(200), [p1, p2]);
    expect(res.length).toBe(2);
    expect(res[0]!.delta).toBeLessThanOrEqual(res[1]!.delta);
  });
  test("clusterPoets returns merges", () => {
    const p1 = buildProfile("p1", ["الف ".repeat(50)]);
    const p2 = buildProfile("p2", ["ب ".repeat(50)]);
    const c = clusterPoets([p1, p2]);
    expect(c.merges.length).toBe(1);
  });
  test("pcaPoints returns coords", () => {
    const p1 = buildProfile("p1", ["الف ".repeat(50)]);
    const p2 = buildProfile("p2", ["ب ".repeat(50)]);
    const pts = pcaPoints([p1, p2]);
    expect(pts.length).toBe(2);
    expect(typeof pts[0]!.x).toBe("number");
  });
});
