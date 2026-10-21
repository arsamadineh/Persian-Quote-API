import type { TabDef, WorkbenchCtx } from "../../types";
const def: TabDef = { id: "atlas", order: 12, title: { fa: "نقشه", en: "Atlas" }, async load() { return { mount(el: HTMLElement, ctx: WorkbenchCtx) { el.textContent = "نقشه"; return () => { el.textContent = ""; }; } }; } };
export default def;
