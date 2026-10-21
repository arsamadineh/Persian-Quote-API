import { describe, test, expect } from "bun:test";
import { discoverTabs, type TabModule, type TabDef } from "../src/types";

function makeTab(id: string, order: number): TabDef {
  return { id, order, title: { fa: id, en: id }, async load() { return { mount() { return () => {}; } }; } };
}

describe("tab auto-discovery", () => {
  test("sorts by order", () => {
    const mods: Record<string, TabModule> = {
      "./tabs/b/tab.ts": { default: makeTab("b", 20) },
      "./tabs/a/tab.ts": { default: makeTab("a", 10) },
    };
    const tabs = discoverTabs(mods);
    expect(tabs.map((t) => t.id)).toEqual(["a", "b"]);
  });

  test("adding a dummy folder registers a tab", () => {
    const mods: Record<string, TabModule> = {
      "./tabs/home/tab.ts": { default: makeTab("home", 1) },
    };
    mods["./tabs/dummy/tab.ts"] = { default: makeTab("dummy", 99) };
    const tabs = discoverTabs(mods);
    expect(tabs.map((t) => t.id)).toContain("dummy");
  });
});
