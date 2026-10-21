import type { TabDef, WorkbenchCtx } from "../../types";

const def: TabDef = {
  id: "rhyme-finder",
  order: 6,
  title: { fa: "rhyme-finder", en: "rhyme-finder" },
  async load() {
    return {
      mount(el: HTMLElement, ctx: WorkbenchCtx) {
        el.textContent = "rhyme-finder";
        return () => { el.textContent = ""; };
      },
    };
  },
};

export default def;
