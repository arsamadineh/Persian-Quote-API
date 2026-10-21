import type { TabDef, WorkbenchCtx } from "../../types";
const def: TabDef = {
  id: "echo",
  order: 10,
  title: { fa: "پژواک", en: "Echo" },
  async load() {
    return { mount(el: HTMLElement, ctx: WorkbenchCtx) { el.textContent = "پژواک"; return () => { el.textContent = ""; }; } };
  },
};
export default def;
