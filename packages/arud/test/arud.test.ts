import "./dom-shim";
import { describe, test, expect } from "bun:test";
import { scanHemistich, scanPoem, mount, syllabifyHemistich, weightString } from "../src";

describe("packages/arud: scan smoke", () => {
  test("scanHemistich returns a result with candidates", () => {
    const r = scanHemistich("مرغ سحر ناله سر کن");
    expect(r).toBeTruthy();
    expect(Array.isArray(r.syllables)).toBe(true);
    expect(r.syllables.length).toBeGreaterThan(0);
    expect(Array.isArray(r.candidates)).toBe(true);
    expect(r.candidates.length).toBe(3);
  });

  test("scanPoem votes across beyts", () => {
    const beyts: [string, string][] = [["مرغ سحر ناله سر کن", "دمی به آه و ناله سر کن"]];
    const r = scanPoem(beyts);
    expect(r.perBeyt.length).toBe(1);
    expect(typeof r.confidence).toBe("number");
  });

  test("syllabifyHemistich produces weights", () => {
    const s = syllabifyHemistich("بهار آمد");
    expect(s.length).toBeGreaterThan(0);
    const w = weightString(s);
    expect(w.length).toBe(s.length);
    expect(/^[LSX]+$/.test(w)).toBe(true);
  });
});

describe("packages/arud: mount (jsdom)", () => {
  test("mounts into a container", () => {
    const container = { appendChild: () => {}, style: {} } as any;
    const handle = mount(container);
    expect(typeof handle.destroy).toBe("function");
    handle.destroy();
  });
});
