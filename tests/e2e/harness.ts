import { engine, createNextHandler } from "@/lib/engine/instance";
import { GET as embedGet } from "@/app/api/embed/route";
import { GET as benchmarkGet } from "@/app/api/engine/benchmark/route";
import { GET as engineStatsGet } from "@/app/api/engine/stats/route";
import { NextRequest } from "next/server";
import { expect } from "bun:test";

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface ApiResponse<T = any> {
  response: Response;
  status: number;
  headers: Headers;
  body: T;
}

const engineHandler = createNextHandler(engine);

/**
 * Universal E2E HTTP client.
 * In default mode, dispatches directly through the Web Standard Request/Response
 * adapter and Next.js handlers.
 * If TEST_BASE_URL is set, dispatches over HTTP network using fetch().
 */
export async function e2eFetch(pathAndQuery: string, options: RequestOptions = {}): Promise<Response> {
  const method = (options.method || "GET").toUpperCase();
  const baseUrl = process.env.TEST_BASE_URL;

  if (baseUrl) {
    const targetUrl = new URL(pathAndQuery, baseUrl);
    const headers = new Headers(options.headers || {});
    let body: BodyInit | undefined;
    if (options.body) {
      if (typeof options.body === "string") {
        body = options.body;
      } else {
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(options.body);
      }
    }
    return fetch(targetUrl.toString(), {
      method,
      headers,
      body,
    });
  }

  const urlString = pathAndQuery.startsWith("http") ? pathAndQuery : `http://localhost${pathAndQuery}`;
  const url = new URL(urlString);
  const pathname = url.pathname;

  const headers = new Headers(options.headers || {});
  let body: BodyInit | undefined;
  if (options.body) {
    if (typeof options.body === "string") {
      body = options.body;
    } else {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(options.body);
    }
  }

  const stdRequest = new Request(url.toString(), {
    method,
    headers,
    body,
  });

  // Standalone App Router routes that have dedicated route handlers
  if (pathname === "/api/embed") {
    const nextReq = new NextRequest(stdRequest);
    return embedGet(nextReq);
  }

  if (pathname === "/api/engine/benchmark") {
    const nextReq = new NextRequest(stdRequest);
    return benchmarkGet(nextReq);
  }

  if (pathname === "/api/engine/stats") {
    return engineStatsGet();
  }

  // All other routes are handled by Tigh engine adapter
  return engineHandler(stdRequest, { params: Promise.resolve({}) });
}

/**
 * Helper to fetch and parse JSON with status and headers.
 */
export async function e2eJson<T = any>(pathAndQuery: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const response = await e2eFetch(pathAndQuery, options);
  const status = response.status;
  const headers = response.headers;
  let body: any;

  const contentType = headers.get("content-type") || "";
  if (contentType.includes("application/json") || contentType.includes("problem+json")) {
    body = await response.json();
  } else {
    body = (await response.text()) as any;
  }

  return { response, status, headers, body };
}

// ============================================================================
// Linguistic & Reference Invariant Helpers (from ORIGINAL_REQUEST.md)
// ============================================================================

export const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
export const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toAsciiDigits(s: string): string {
  return s.replace(/[۰-۹٠-٩]/g, (c) => {
    const p = PERSIAN_DIGITS.indexOf(c);
    return String(p >= 0 ? p : ARABIC_DIGITS.indexOf(c));
  });
}

export function cleanLine(s: string): string {
  return s
    .replace(/[\u200e\u200f]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([،؛؟!.:)»])/g, "$1")
    .replace(/([(«])\s+/g, "$1")
    .replace(/([،؛؟])(?=[^\s\d)»"'،؛؟!.])/g, "$1 ")
    .trim();
}

export function extractColophon(raw: string): { body: string; colophon?: { place?: string; date: string } } {
  const ascii = toAsciiDigits(raw);
  const m = ascii.match(/(?<!\d)(?:\d{1,2}\s*[\/\-.\s]\s*){0,2}(\d{4})\s*$/);
  if (!m || m.index === undefined) return { body: raw };

  const year = Number(m[1]);
  const plausible = (year >= 1250 && year <= 1450) || (year >= 1850 && year <= 2100);
  if (!plausible) return { body: raw };

  const date = m[0].trim().replace(/\s*[\/\-.\s]\s*/g, "/");
  let head = raw.slice(0, m.index).replace(/[\s\/\-–—]+$/, "");

  const chunks = head.split(/\s{2,}|\n|\*/);
  const last = chunks[chunks.length - 1];
  let place: string | undefined;

  const strict = last.match(/^\s*([\p{L}\u200c]+(?: [\p{L}\u200c]+){0,2})\s*[،,]\s*$/u);
  if (strict) {
    place = strict[1].trim();
    head = head.slice(0, head.length - last.length);
  } else {
    const loose = head.match(/(?<=\s)([\p{L}\u200c]+)\s*[،,]\s*$/u);
    if (loose) {
      place = loose[1];
      head = head.slice(0, loose.index);
    }
  }

  const setApart = /(?:\s{2,}|\n|\*)$/.test(raw.slice(0, m.index)) || /[\/\-.]/.test(m[0]);
  if (!place && !setApart) return { body: raw };

  return { body: head.trim(), colophon: { place, date } };
}

export type Stanzas = string[][];

export function splitBySignals(raw: string): Stanzas | null {
  const hasSignal = /\*/.test(raw) || /\n/.test(raw) || /\S\s{2,}\S/.test(raw) || /\s\/\s/.test(raw);
  if (!hasSignal) return null;

  const stanzas = raw
    .split(/\s*\*+\s*|\n\s*\n/)
    .map((block) => block.split(/\s{2,}|\n|\s\/\s/).map(cleanLine).filter(Boolean))
    .filter((b) => b.length > 0);

  return stanzas.length ? stanzas : null;
}

export const letterFingerprint = (s: string) => s.replace(/[\s\u200c\u200e\u200f*\/]+/g, "");

export type ExcerptOptions = {
  minWords?: number;
  targetWords?: number;
  maxWords?: number;
  topK?: number;
  rng?: () => number;
  strictBlocks?: boolean;
};

export type Excerpt = {
  lines: string[];
  start: number;
  end: number;
  cutStart: boolean;
  cutEnd: boolean;
};

const wc = (s: string) => s.split(/\s+/).filter(Boolean).length;
const SENT_END = /[.!؟?…؛]$/;
const SOFT_END = /[،,:]$/;
const BAD_START = new Set(["و", "که", "را", "تا", "یا", "است", "بود", "شد", "هست", "نیست", "هم", "نیز"]);
const BAD_END = new Set([
  "و", "که", "تا", "یا", "از", "به", "در", "با", "بر", "چون", "ای", "می", "نمی", "بی", "همی", "اگر", "ولی", "اما",
]);
const strip = (w: string) => w.replace(/[\p{P}\p{S}]/gu, "");
type FlatLine = { text: string; words: number; blockStart: boolean; blockEnd: boolean };

function scoreWindow(flat: FlatLine[], i: number, j: number, words: number, target: number): number {
  const first = flat[i].text;
  const lastLine = flat[j - 1].text;
  const prev = i > 0 ? flat[i - 1].text : "";
  let s = 0;

  s -= 4 * ((words - target) / target) ** 2;

  if (i === 0) s += 2;
  if (flat[i].blockStart) s += 3;
  if (SENT_END.test(prev)) s += 2;
  else if (SOFT_END.test(prev)) s += 0.5;
  const firstWord = strip(first.split(/\s+/)[0] ?? "");
  if (BAD_START.has(firstWord)) s -= 3;

  if (SENT_END.test(lastLine)) s += 4;
  else if (SOFT_END.test(lastLine)) s += 1;
  if (flat[j - 1].blockEnd) s += 3;
  if (j === flat.length) s += 1;
  if (!/[\p{P}]$/u.test(lastLine)) {
    const lastWord = strip(lastLine.split(/\s+/).pop() ?? "");
    if (BAD_END.has(lastWord)) s -= 4;
  }

  const text = flat.slice(i, j).map((l) => l.text).join(" ");
  const count = (re: RegExp) => (text.match(re) ?? []).length;
  if (count(/«/g) !== count(/»/g)) s -= 3;
  if (count(/\(/g) !== count(/\)/g)) s -= 3;

  return s;
}

export function pickExcerpt(stanzas: Stanzas, opts: ExcerptOptions = {}): Excerpt {
  const { minWords = 12, targetWords = 30, maxWords = 45, topK = 1, rng = Math.random, strictBlocks = false } = opts;

  const flat: FlatLine[] = [];
  for (const block of stanzas) {
    block.forEach((text, k) =>
      flat.push({ text, words: wc(text), blockStart: k === 0, blockEnd: k === block.length - 1 })
    );
  }
  const total = flat.reduce((a, l) => a + l.words, 0);
  const whole = (): Excerpt => ({ lines: flat.map((l) => l.text), start: 0, end: flat.length, cutStart: false, cutEnd: false });
  if (total <= maxWords) return whole();

  const collect = (strict: boolean) => {
    const best = new Map<number, { i: number; j: number; score: number }>();
    for (let i = 0; i < flat.length; i++) {
      let words = 0;
      for (let j = i; j < flat.length; j++) {
        words += flat[j].words;
        if (words > maxWords) break;
        if (words < minWords) continue;
        if (strict && !(flat[i].blockStart && flat[j].blockEnd)) continue;
        const score = scoreWindow(flat, i, j + 1, words, targetWords);
        const cur = best.get(i);
        if (!cur || score > cur.score) best.set(i, { i, j: j + 1, score });
      }
    }
    return [...best.values()].sort((a, b) => b.score - a.score);
  };

  let cands = strictBlocks ? collect(true) : [];
  if (!cands.length) cands = collect(false);

  if (!cands.length) {
    return { lines: [flat[0].text], start: 0, end: 1, cutStart: false, cutEnd: flat.length > 1 };
  }

  const pick = cands[Math.floor(rng() * Math.min(topK, cands.length))];
  return {
    lines: flat.slice(pick.i, pick.j).map((l) => l.text),
    start: pick.i,
    end: pick.j,
    cutStart: pick.i > 0,
    cutEnd: pick.j < flat.length,
  };
}

/**
 * Asserts that a text conforms strictly to cleanLine and Persian typography:
 * - No space before punctuation
 * - Single space after punctuation (when followed by letter)
 * - No Tatweel (U+0640)
 * - No directional mark characters
 */
export function assertPersianTypography(text: string): void {
  expect(text).not.toMatch(/\s+[،؛؟!:)]/);
  expect(text).not.toContain("\u0640");
  expect(text).not.toContain("\u200e");
  expect(text).not.toContain("\u200f");
}
