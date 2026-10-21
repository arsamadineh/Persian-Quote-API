import type { TabDef, WorkbenchCtx } from "../../types";

const def: TabDef = {
  id: "kwic",
  order: 4,
  title: { fa: "kwic", en: "kwic" },
  async load() {
    return {
      mount(el: HTMLElement, ctx: WorkbenchCtx) {
        el.textContent = "kwic";
        return () => { el.textContent = ""; };
      },
    };
  },
};

export default def;
