import type { TabDef, WorkbenchCtx } from "../../types";
const def: TabDef = { id: "style", order: 11, title: { fa: "سبک", en: "Style" }, async load() { return { mount(el: HTMLElement, ctx: WorkbenchCtx) { el.textContent = "سبک"; return () => { el.textContent = ""; }; } }; } };
export default def;
