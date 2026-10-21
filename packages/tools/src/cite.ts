// packages/tools/src/cite.ts
import type { WorkRef } from "../../../contracts/corpus";

export function cite(
  w: WorkRef,
  style: "apa-fa" | "chicago-fa" | "bibtex" | "csl-json",
  loc?: { beyt?: number }
): string {
  const poet = w.poetName || w.poetId;
  const poemNo = w.title ? w.title : (w.id.split(".").pop() ?? "");
  const beyt = loc?.beyt;
  const locStr = beyt !== undefined ? `، بیت ${toPersian(beyt)}` : "";
  const base = `${poet}، ${w.collection ?? ""}`.trim();

  switch (style) {
    case "apa-fa":
      return `(${poet}، ${poemNo}${locStr})`;
    case "chicago-fa":
      return `${poet}. ${poemNo}${locStr}.`;
    case "bibtex":
      return `@misc{${w.id.replace(/\./g, "_")},\n  author = {${poet}},\n  title = {${w.title ?? w.id}},\n  year = {}\n}`;
    case "csl-json":
      return JSON.stringify({
        id: w.id,
        type: "poem",
        author: [{ family: poet }],
        title: w.title ?? w.id,
      });
    default:
      return `(${poet}، ${poemNo}${locStr})`;
  }
}

function toPersian(n: number): string {
  const d = "۰۱۲۳۴۵۶۷۸۹";
  return String(n).replace(/\d/g, (c) => d[Number(c)]!);
}
