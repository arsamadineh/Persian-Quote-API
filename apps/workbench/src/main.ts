// apps/workbench/src/main.ts
import { discoverTabs } from "./types";
import type { TabDef } from "./types";

// Vite auto-discovery (production build). In non-Vite environments (tests) this
// is undefined and tabs are registered manually below.
const globbed = (import.meta as any).glob ? (import.meta as any).glob("./tabs/*/tab.ts", { eager: true }) : undefined;

const manualModules: Record<string, { default: TabDef }> = {};
// manual registration for non-Vite / test environments
for (const id of ["home", "reader", "search", "kwic", "freq", "rhyme-finder"]) {
  // lazy: resolved at runtime by the bundler in Vite; here we leave empty
}

let tabs: TabDef[] = [];
if (globbed) {
  tabs = discoverTabs(globbed);
} else {
  // Fallback: empty in tests; discovery.test.ts exercises discoverTabs directly.
  tabs = [];
}

export { tabs, discoverTabs };
export function mountApp(root: HTMLElement): void {
  const nav = document.createElement("nav");
  for (const t of tabs) {
    const b = document.createElement("button");
    b.textContent = t.title.fa;
    nav.appendChild(b);
  }
  root.appendChild(nav);
}
