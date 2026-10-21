import type { TabDef, WorkbenchCtx } from "../../types";

const def: TabDef = {
  id: "freq",
  order: 5,
  title: { fa: "freq", en: "freq" },
  async load() {
    return {
      mount(el: HTMLElement, ctx: WorkbenchCtx) {
        el.textContent = "freq";
        return () => { el.textContent = ""; };
      },
    };
  },
};

export default def;
