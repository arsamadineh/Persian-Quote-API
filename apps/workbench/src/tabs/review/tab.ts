import type { TabDef, WorkbenchCtx } from "../../types";
const def: TabDef = {
  id: "review",
  order: 9,
  title: { fa: "بازبینی", en: "Review" },
  async load() {
    return {
      mount(el: HTMLElement, ctx: WorkbenchCtx) {
        el.textContent = "بازبینی";
        return () => { el.textContent = ""; };
      },
    };
  },
};
export default def;
