import type { TabDef, WorkbenchCtx } from "../../types";

const def: TabDef = {
  id: "home",
  order: 1,
  title: { fa: "home", en: "home" },
  async load() {
    return {
      mount(el: HTMLElement, ctx: WorkbenchCtx) {
        el.textContent = "home";
        return () => { el.textContent = ""; };
      },
    };
  },
};

export default def;
