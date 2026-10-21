import type { TabDef, WorkbenchCtx } from "../../types";
const def: TabDef = {
  id: "tools",
  order: 7,
  title: { fa: "ابزارها", en: "Tools" },
  async load() {
    return {
      mount(el: HTMLElement, ctx: WorkbenchCtx) {
        el.textContent = "ابزارها";
        return () => { el.textContent = ""; };
      },
    };
  },
};
export default def;
