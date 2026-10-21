// packages/tools/quiz/index.ts
import type { Work, Quiz } from "../../../contracts/corpus";

function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0x100000000; };
}

function toPersian(n: number): string {
  const d = "۰۱۲۳۴۵۶۷۸۹";
  return String(n).replace(/\d/g, (c) => d[Number(c)]!);
}

function shuffle<T>(arr: T[], r: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function makeQuiz(
  w: Work,
  kind: "cloze-radif" | "missing-word" | "order-hemistichs" | "poet-mc" | "meter-mc",
  seed: number
): Quiz {
  const r = rng(seed);
  const lines = w.stanzas.flat().filter(Boolean);
  const hemistichs = w.beyts ? w.beyts.flat() : lines;
  const poet = w.poetName;

  switch (kind) {
    case "cloze-radif": {
      // hide the last word of the first hemistich (radif/qafiyeh proxy)
      const line = lines[0] ?? "";
      const toks = line.split(/\s+/).filter(Boolean);
      const answer = toks[toks.length - 1] ?? "";
      const prompt = toks.slice(0, -1).join(" ") + " ___";
      return { kind, workId: w.id, prompt, answer, explanation: `اثر ${w.id}، بیت ۱` };
    }
    case "missing-word": {
      const line = lines[Math.floor(r() * lines.length)] ?? "";
      const toks = line.split(/\s+/).filter(Boolean);
      if (toks.length === 0) return { kind, workId: w.id, prompt: "", answer: "" };
      const idx = Math.floor(r() * toks.length);
      const answer = toks[idx]!;
      const prompt = toks.map((t, i) => (i === idx ? "___" : t)).join(" ");
      return { kind, workId: w.id, prompt, answer, explanation: `اثر ${w.id}` };
    }
    case "order-hemistichs": {
      const pair = hemistichs.slice(0, 2);
      const shuffled = shuffle(pair, r);
      return { kind, workId: w.id, prompt: shuffled.join(" / "), answer: pair.join(" / "), explanation: `اثر ${w.id}` };
    }
    case "poet-mc": {
      return { kind, workId: w.id, prompt: lines[0] ?? "", answer: poet, options: [poet], explanation: `اثر ${w.id}` };
    }
    case "meter-mc": {
      // only if L4 confidence >= 0.8 (not available here) -> skip by returning null-ish
      return { kind, workId: w.id, prompt: lines[0] ?? "", answer: w.meter ?? "نامطمئن", explanation: `اثر ${w.id}` };
    }
    default:
      return { kind, workId: w.id, prompt: lines[0] ?? "", answer: lines[0] ?? "" };
  }
}

export function makeAssignment(works: Work[], poet: string | null, n: number, seed: number): Quiz[] {
  const r = rng(seed);
  const pool = poet ? works.filter((w) => w.poetId === poet) : works;
  const out: Quiz[] = [];
  for (let i = 0; i < n; i++) {
    const w = pool[Math.floor(r() * pool.length)];
    if (!w) continue;
    const kinds: Array<"cloze-radif" | "missing-word" | "order-hemistichs" | "poet-mc"> = ["cloze-radif", "missing-word", "order-hemistichs", "poet-mc"];
    const k = kinds[Math.floor(r() * kinds.length)]!;
    out.push(makeQuiz(w, k, seed + i));
  }
  return out;
}

// --- exports ---
export function toCsv(quizzes: Quiz[]): string {
  const lines = ["kind,workId,prompt,answer"];
  for (const q of quizzes) {
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    lines.push([q.kind, q.workId, esc(q.prompt), esc(String(q.answer))].join(","));
  }
  return lines.join("\n");
}

export function toMoodleXml(quizzes: Quiz[]): string {
  const out: string[] = ['<?xml version="1.0" encoding="UTF-8"?>', "<quiz>"];
  for (const q of quizzes) {
    out.push("  <question type=\"shortanswer\">");
    out.push(`    <name><text>${escapeXml(q.kind)}</text></name>`);
    out.push(`    <questiontext format="html"><text><![CDATA[${q.prompt}]]></text></questiontext>`);
    out.push(`    <answer fraction="100"><text>${escapeXml(String(q.answer))}</text></answer>`);
    out.push("  </question>");
  }
  out.push("</quiz>");
  return out.join("\n");
}

export function toGift(quizzes: Quiz[]): string {
  return quizzes.map((q) => `::${q.workId}:: ${q.prompt} {=${q.answer}}`).join("\n\n");
}

export function toPrintableHtml(quizzes: Quiz[]): string {
  const items = quizzes.map((q, i) => `<li>${i + 1}. ${escapeHtml(q.prompt)}</li>`).join("\n");
  const key = quizzes.map((q, i) => `<li>${i + 1}. ${escapeHtml(String(q.answer))}</li>`).join("\n");
  return `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"><title>آزمون</title>
<style>@media print { .key { page-break-before: always; } }</style></head><body>
<h1>آزمون</h1><ol>${items}</ol>
<div class="key"><h2>کلید پاسخ</h2><ol>${key}</ol></div>
</body></html>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
