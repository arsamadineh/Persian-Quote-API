import type { TabDef, WorkbenchCtx } from "../../types";
const def: TabDef = {
  id: "teach",
  order: 8,
  title: { fa: "آموزش", en: "Teach" },
  async load() {
    return {
      mount(el: HTMLElement, ctx: WorkbenchCtx) {
        el.textContent = "آموزش";
        return () => { el.textContent = ""; };
      },
    };
  },
};
export default def;
