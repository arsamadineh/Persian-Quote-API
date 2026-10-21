// packages/tools/src/collate.ts
import type { CollationTable } from "../../../contracts/corpus";

const EQUIV_CLASSES: Record<string, string[]> = {
  kaf: ["ک", "ك"],
  yeh: ["ی", "ي", "ى"],
  heh: ["ه", "ة", "ۀ"],
  zwnj: ["\u200c"],
  hamza: ["ء", "أ", "إ", "ؤ", "ئ"],
  digits: ["۰", "0", "٠"],
};

export function normalizeWitness(text: string, equivalences: string[] = []): string[] {
  let t = text.normalize("NFC");
  if (equivalences.includes("kaf")) for (const v of EQUIV_CLASSES.kaf!) t = t.replace(new RegExp(v, "g"), "ک");
  if (equivalences.includes("yeh")) for (const v of EQUIV_CLASSES.yeh!) t = t.replace(new RegExp(v, "g"), "ی");
  if (equivalences.includes("heh")) for (const v of EQUIV_CLASSES.heh!) t = t.replace(new RegExp(v, "g"), "ه");
  if (equivalences.includes("zwnj")) t = t.replace(/\u200c/g, "");
  if (equivalences.includes("hamza")) for (const v of EQUIV_CLASSES.hamza!) t = t.replace(new RegExp(v, "g"), "ء");
  return t.split(/\s+/).filter(Boolean);
}

function needlemanWunsch(a: string[], b: string[]): { aligned: [string | null, string | null][] } {
  const n = a.length, m = b.length;
  const gap = -1;
  const match = 2, mismatch = -1;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) dp[i]![0] = dp[i - 1]![0]! + gap;
  for (let j = 1; j <= m; j++) dp[0]![j] = dp[0]![j - 1]! + gap;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const sc = a[i - 1] === b[j - 1] ? match : mismatch;
      dp[i]![j] = Math.max(
        dp[i - 1]![j - 1]! + sc,
        dp[i - 1]![j]! + gap,
        dp[i]![j - 1]! + gap
      );
    }
  }
  // backtrack
  const aligned: [string | null, string | null][] = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const sc = a[i - 1] === b[j - 1] ? match : mismatch;
      if (dp[i]![j] === dp[i - 1]![j - 1]! + sc) {
        aligned.unshift([a[i - 1]!, b[j - 1]!]);
        i--; j--;
        continue;
      }
    }
    if (i > 0 && dp[i]![j] === dp[i - 1]![j]! + gap) {
      aligned.unshift([a[i - 1]!, null]);
      i--;
    } else {
      aligned.unshift([null, b[j - 1]!]);
      j--;
    }
  }
  return { aligned };
}

export function collate(
  witnesses: { siglum: string; text: string }[],
  o: { equivalences?: string[] } = {}
): CollationTable {
  const eqs = o.equivalences ?? ["kaf", "yeh", "heh", "zwnj", "hamza"];
  const toks = witnesses.map((w) => ({ siglum: w.siglum, tokens: normalizeWitness(w.text, eqs) }));
  if (toks.length === 0) return { witnesses: [], rows: [] };
  if (toks.length === 1) {
    return { witnesses: [toks[0]!.siglum], rows: toks[0]!.tokens.map((t) => ({ base: t, readings: { [toks[0]!.siglum]: t }, variant: false })) };
  }
  // progressive alignment against first witness as base
  const base = toks[0]!;
  const alignedAll: Map<number, Record<string, string | null>> = new Map();
  // align each witness to base
  const baseTokens = base.tokens;
  const alignmentMap: { siglum: string; aligned: (string | null)[] }[] = [{ siglum: base.siglum, aligned: baseTokens.map((t) => t) }];
  for (let wi = 1; wi < toks.length; wi++) {
    const w = toks[wi]!;
    const { aligned } = needlemanWunsch(baseTokens, w.tokens);
    // build aligned array for this witness (second column)
    const wAligned = aligned.map(([, b]) => b);
    alignmentMap.push({ siglum: w.siglum, aligned: wAligned });
  }
  // base aligned is first column
  const baseAligned = alignmentMap[0]!.aligned;
  // but base aligned from NW with itself? We used baseTokens directly. Let's rebuild baseAligned from first alignment (first witness).
  const firstNW = needlemanWunsch(baseTokens, toks[1]!.tokens);
  const baseAlignedFirst = firstNW.aligned.map(([a]) => a);
  // use baseAlignedFirst as canonical base columns
  const nRows = baseAlignedFirst.length;
  const rows: CollationTable["rows"] = [];
  for (let r = 0; r < nRows; r++) {
    const baseTok = baseAlignedFirst[r] ?? null;
    const readings: Record<string, string | null> = {};
    let variant = false;
    const vals = new Set<string>();
    for (const am of alignmentMap) {
      // find corresponding token: for base witness use baseAlignedFirst; others use their aligned
      let tok: string | null;
      if (am.siglum === base.siglum) tok = baseAlignedFirst[r] ?? null;
      else tok = am.aligned[r] ?? null;
      readings[am.siglum] = tok;
      if (tok !== null) vals.add(tok);
    }
    if (vals.size > 1) variant = true;
    rows.push({ base: baseTok ?? "", readings, variant });
  }
  return { witnesses: toks.map((t) => t.siglum), rows };
}

export function collationToTei(t: CollationTable): string {
  const lines: string[] = [];
  lines.push("<app>");
  for (const row of t.rows) {
    if (!row.variant) {
      lines.push(`  <lem>${escapeXml(row.base)}</lem>`);
    } else {
      lines.push(`  <app>`);
      lines.push(`    <lem>${escapeXml(row.base)}</lem>`);
      for (const [wit, rdg] of Object.entries(row.readings)) {
        if (rdg !== null && rdg !== row.base) {
          lines.push(`    <rdg wit="#${wit}">${escapeXml(rdg)}</rdg>`);
        }
      }
      lines.push(`  </app>`);
    }
  }
  lines.push("</app>");
  return lines.join("\n");
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
