// apps/workbench/src/corpus.ts
import { structurePoem } from "@persian-quote/poem";
import type { Work, Corpus, CorpusHandle } from "./types";

const works: Work[] = [];

function parseTxt(text: string): Work[] {
  const out: Work[] = [];
  const blocks = text.split(/\n\s*\n/);
  let poet = "نامشخص";
  let title = "بدون عنوان";
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    // heading detection: a line starting with # or all-caps-ish -> poet/title
    const first = lines[0]!;
    if (first.startsWith("#")) {
      title = first.replace(/^#+\s*/, "");
      continue;
    }
    const stanzas = [lines];
    const id = `private.${poet}.${out.length + 1}`;
    const r = structurePoem(lines.join(" "));
    out.push({
      id, poetId: poet, poetName: poet, title, kind: "modern", form: r.form,
      stanzas, structure: { origin: r.origin, confidence: r.confidence, form: r.form },
    });
  }
  return out;
}

function parseJsonl(text: string): Work[] {
  const out: Work[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try {
      const o = JSON.parse(line);
      out.push(o as Work);
    } catch {
      // skip malformed
    }
  }
  return out;
}

function parseCsv(text: string): Work[] {
  // minimal: first row header; columns poet,title,text
  const lines = text.split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0]!.split(",").map((h) => h.trim());
  const pi = header.indexOf("poet");
  const ti = header.indexOf("title");
  const xi = header.indexOf("text");
  const out: Work[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i]!.split(",");
    const poet = pi >= 0 ? cols[pi]!.trim() : "نامشخص";
    const title = ti >= 0 ? cols[ti]!.trim() : "بدون عنوان";
    const text = xi >= 0 ? cols[xi]!.trim() : "";
    const stanzas = text ? [text.split(/\s{2,}/)] : [[]];
    const id = `private.${poet}.${out.length + 1}`;
    const r = structurePoem(text || "");
    out.push({ id, poetId: poet, poetName: poet, title, kind: "modern", form: r.form, stanzas, structure: { origin: r.origin, confidence: r.confidence, form: r.form } });
  }
  return out;
}

export function createCorpusHandle(): CorpusHandle {
  return {
    async corpus() { return { works } as Corpus; },
    async addPrivate(files: File[]) {
      let added = 0;
      let flagged = 0;
      for (const f of files) {
        const text = await f.text();
        const name = f.name.toLowerCase();
        let parsed: Work[] = [];
        if (name.endsWith(".jsonl")) parsed = parseJsonl(text);
        else if (name.endsWith(".csv")) parsed = parseCsv(text);
        else parsed = parseTxt(text);
        for (const w of parsed) {
          works.push(w);
          added++;
          if ((w.structure?.confidence ?? 1) < 0.7) flagged++;
        }
      }
      return { added, flagged };
    },
  };
}
