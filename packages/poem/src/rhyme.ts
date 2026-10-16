import type { Stanzas } from "@persian-quote/schema";

export interface RhymeDetectionResult {
  radif?: string;
  qafiyeh?: string;
}

const CLEAN_PUNCT = /[،؛؟!:.…»)"'\]«([/]/g;

function cleanWord(w: string): string {
  return w.replace(CLEAN_PUNCT, "").trim();
}

function tokenizeLine(line: string): string[] {
  return line
    .split(/\s+/)
    .map(cleanWord)
    .filter(Boolean);
}

/**
 * Detects radif (repeated word/phrase at end of rhyming hemistichs)
 * and qafiyeh (rhyming word/morpheme preceding radif).
 */
export function detectRadifAndQafiyeh(stanzas: Stanzas): RhymeDetectionResult {
  const flatLines = stanzas.flat().filter(Boolean);
  if (flatLines.length < 2) return {};

  // For classical ghazal/couplet structure:
  // Rhyming hemistichs are line 0, line 1, and every even line thereafter (2, 4, 6... in 0-indexed pairs: 1, 3, 5...)
  const rhymingCandidates: string[] = [];
  if (flatLines.length >= 2) {
    rhymingCandidates.push(flatLines[0]!, flatLines[1]!);
    for (let i = 3; i < flatLines.length; i += 2) {
      rhymingCandidates.push(flatLines[i]!);
    }
  }

  // Tokenize candidate lines
  const tokenized = rhymingCandidates.map(tokenizeLine);
  if (tokenized.length < 2) return {};

  // Find longest common suffix of words across rhyming lines
  let commonSuffixWords: string[] = [];
  const minLen = Math.min(...tokenized.map((t) => t.length));

  for (let offset = 1; offset <= Math.min(minLen, 4); offset++) {
    const wordAtOffset = tokenized[0]![tokenized[0]!.length - offset];
    if (!wordAtOffset) break;

    const allMatch = tokenized.every((tokens) => {
      const w = tokens[tokens.length - offset];
      return w === wordAtOffset;
    });

    if (allMatch) {
      commonSuffixWords.unshift(wordAtOffset);
    } else {
      break;
    }
  }

  let radif: string | undefined;
  let qafiyehWords: string[] = [];

  if (commonSuffixWords.length > 0) {
    radif = commonSuffixWords.join(" ");
    const radifLen = commonSuffixWords.length;
    for (const tokens of tokenized) {
      if (tokens.length > radifLen) {
        const qWord = tokens[tokens.length - 1 - radifLen];
        if (qWord) qafiyehWords.push(qWord);
      }
    }
  } else {
    // No exact radif. The last words themselves are the rhyming qafiyeh candidates
    for (const tokens of tokenized) {
      const lastWord = tokens[tokens.length - 1];
      if (lastWord) qafiyehWords.push(lastWord);
    }
  }

  let qafiyeh: string | undefined;
  if (qafiyehWords.length >= 2) {
    // Find common trailing letters (روف / روی) among qafiyeh words
    const firstQ = qafiyehWords[0]!;
    let commonChars = "";
    for (let c = 1; c <= Math.min(firstQ.length, 6); c++) {
      const charSuffix = firstQ.slice(-c);
      const allShare = qafiyehWords.every((w) => w.endsWith(charSuffix));
      if (allShare) {
        commonChars = charSuffix;
      } else {
        break;
      }
    }
    if (commonChars.length >= 1) {
      qafiyeh = qafiyehWords.slice(0, 3).join("، ");
    } else {
      qafiyeh = qafiyehWords[0];
    }
  } else if (qafiyehWords.length === 1) {
    qafiyeh = qafiyehWords[0];
  }

  return {
    ...(radif ? { radif } : {}),
    ...(qafiyeh ? { qafiyeh } : {}),
  };
}
