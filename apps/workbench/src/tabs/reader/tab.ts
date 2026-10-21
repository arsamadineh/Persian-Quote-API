import type { TabDef, WorkbenchCtx } from "../../types";

const def: TabDef = {
  id: "reader",
  order: 2,
  title: { fa: "reader", en: "reader" },
  async load() {
    return {
      mount(el: HTMLElement, ctx: WorkbenchCtx) {
        el.textContent = "reader";
        return () => { el.textContent = ""; };
      },
    };
  },
};

export default def;
