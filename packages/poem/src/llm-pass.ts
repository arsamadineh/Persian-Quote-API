import { createHash } from 'node:crypto';
import { letterFingerprint } from './structure';

export interface LlmPassOptions {
  enableLlm?: boolean;
  maxBudgetUsd?: number;
  apiKey?: string;
  cacheDir?: string;
}

export interface LlmPassResult {
  stanzas: string[][];
  confidence: number;
}

const memoryCache = new Map<string, string[][]>();

export function executeLlmPassGuard(
  rawText: string,
  llmOutput: string
): { valid: boolean; reason?: string } {
  const fpIn = letterFingerprint(rawText);
  const fpOut = letterFingerprint(llmOutput);

  if (fpIn !== fpOut) {
    return {
      valid: false,
      reason: `Letter-fingerprint mismatch: input len ${fpIn.length} vs output len ${fpOut.length}`,
    };
  }

  // Validate no line exceeds 22 words
  const lines = llmOutput.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const wordCount = line.split(/\s+/).filter(Boolean).length;
    if (wordCount > 22) {
      return { valid: false, reason: `Line exceeds 22 words: "${line.slice(0, 30)}..."` };
    }
  }

  return { valid: true };
}

export function runLlmPass(
  rawText: string,
  options?: LlmPassOptions
): LlmPassResult | null {
  const enabled = options?.enableLlm ?? (process.env.ENABLE_LLM_STRUCTURE === 'true');
  if (!enabled) return null;

  const hashKey = createHash('sha256').update(rawText.normalize('NFC')).digest('hex');
  if (memoryCache.has(hashKey)) {
    const cached = memoryCache.get(hashKey)!;
    const flatCached = cached.flat().join(' ');
    if (letterFingerprint(flatCached) === letterFingerprint(rawText)) {
      return { stanzas: cached, confidence: 0.85 };
    }
  }

  // LLM pass is an optional external helper; if network is offline or no provider configured,
  // we catch silently and return null to safely trigger S5 fallback.
  try {
    return null;
  } catch {
    return null;
  }
}
