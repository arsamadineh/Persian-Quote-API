import type { TabDef, WorkbenchCtx } from "../../types";

const def: TabDef = {
  id: "search",
  order: 3,
  title: { fa: "search", en: "search" },
  async load() {
    return {
      mount(el: HTMLElement, ctx: WorkbenchCtx) {
        el.textContent = "search";
        return () => { el.textContent = ""; };
      },
    };
  },
};

export default def;
