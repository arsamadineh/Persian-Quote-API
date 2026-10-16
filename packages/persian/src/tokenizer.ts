export interface TokenizeOptions {
  includePunctuation?: boolean;
}

const WORD_TOKEN_REGEX = /[\p{L}\p{M}\p{N}]+(?:\u200c[\p{L}\p{M}\p{N}]+)*/gu;
const WORD_OR_PUNCT_REGEX = /[\p{L}\p{M}\p{N}]+(?:\u200c[\p{L}\p{M}\p{N}]+)*|[^\s\p{L}\p{M}\p{N}\u200c]+/gu;

export function tokenize(s: string, options: TokenizeOptions = {}): string[] {
  if (!s) return [];
  const { includePunctuation = false } = options;
  const regex = includePunctuation ? WORD_OR_PUNCT_REGEX : WORD_TOKEN_REGEX;
  const matches = s.normalize('NFC').match(regex);
  if (!matches) return [];

  return matches.map((token) => {
    return token.replace(/^[\u200c]+|[\u200c]+$/g, '');
  }).filter((t) => t.length > 0);
}
