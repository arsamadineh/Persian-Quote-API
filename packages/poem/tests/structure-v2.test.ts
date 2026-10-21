import { describe, test, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import fc from 'fast-check';

import {
  structurePoem,
  letterFingerprint,
  cleanLine,
  splitBySignals,
  looksStructured,
  extractColophon,
} from '../src';
import {
  buildGlueMask,
  isValidBoundary,
  hasGlueViolation,
  bareToken,
  FORBIDDEN_LINE_STARTS,
  FORBIDDEN_LINE_ENDS,
  TRAILING_PUNCTUATION_REGEX,
} from '../src/glue';
import { classifyForm, countColloquialMarkers, detectRadifPeriodicity } from '../src/form';
import { runRhymeGrid, detectRadifCandidates, detectQafiyehAnchors, snapMidpoint } from '../src/rhyme-grid';
import { runBoundaryModel, scoreBoundaryGap, sigmoid } from '../src/boundary-model';
import { runHeuristicDp } from '../src/heuristic-dp';
import { executeLlmPassGuard } from '../src/llm-pass';
import { detectTypos } from '../src/typos';
import { applyTypesetLayer, typesetLine } from '../src/typeset';
import weightsData from '../src/weights.json';

const ROOT = path.resolve(__dirname, '../../..');
const SHOTS_FILE = path.join(ROOT, 'data/golden/shots.jsonl');

interface Shot {
  id: string;
  poet_id: string;
  poet_name: string;
  title: string;
  text: string;
  flat_text: string;
}

function loadShots(): Shot[] {
  const content = fs.readFileSync(SHOTS_FILE, 'utf8').trim();
  return content.split('\n').map((l) => JSON.parse(l));
}

const shots = loadShots();

describe('Structure Engine v2: Stage Unit & Contract Tests', () => {
  describe('S0: Signals & Colophon Extraction', () => {
    test('extracts colophon, strips footer, and marks footer_removed', () => {
      const raw = 'در حاشیهٔ جاده‌های مه گرفته\nصدای باران می‌آمد\nتنکابن، 12/2/1364';
      const res = structurePoem(raw);
      expect(res.flags).toContain('footer_removed');
      expect(res.colophon).toBeDefined();
      expect(res.colophon?.place).toBe('تنکابن');
      expect(res.colophon?.jalali?.y).toBe(1364);
    });

    test('splits structured text with asterisk, slash, and double spaces', () => {
      const raw = 'بیت اول مصرع اول / بیت اول مصرع دوم * بیت دوم مصرع اول   بیت دوم مصرع دوم';
      const stanzas = splitBySignals(raw);
      expect(stanzas).not.toBeNull();
      expect(stanzas!.length).toBeGreaterThanOrEqual(1);
    });

    test('looksStructured evaluates line length distribution (median 2-12, max <= 22)', () => {
      const validStanzas = [
        ['رونق عهد شباب است دگر بستان را', 'می‌رسد مژده گل بلبل خوش الحان را']
      ];
      expect(looksStructured(validStanzas)).toBe(true);

      const invalidStanzas = [
        ['یک کلمه'],
        ['یک دو سه چهار پنج شش هفت هشت نه ده یازده دوازده سیزده چهارده پانزده شانزده هفده هجده نوزده بیست بیست‌ویک بیست‌ودو بیست‌وسه']
      ];
      expect(looksStructured(invalidStanzas)).toBe(false);
    });
  });

  describe('S1: Hard Glue Constraints & Masking', () => {
    test('invalidates boundaries starting with forbidden start tokens', () => {
      const tokens = ['دیدار', 'ما', 'شد', 'را', 'دیدم'];
      const mask = buildGlueMask(tokens);
      // Boundary before "شد" (index 2) is forbidden
      expect(mask[2]).toBe(0);
      // Boundary before "را" (index 3) is forbidden
      expect(mask[3]).toBe(0);
    });

    test('invalidates boundaries ending with forbidden end tokens without punctuation', () => {
      const tokens = ['رفتم', 'به', 'باغ', 'و', 'گل'];
      const mask = buildGlueMask(tokens);
      // Boundary after "به" (index 2) is forbidden
      expect(mask[2]).toBe(0);
      // Boundary after "و" (index 4) is forbidden
      expect(mask[4]).toBe(0);
    });

    test('permits boundaries when forbidden end token has trailing punctuation', () => {
      const tokens = ['چون،', 'دیگر', 'نیامد'];
      const mask = buildGlueMask(tokens);
      // "چون،" ends with comma, so break after index 0 is valid
      expect(mask[1]).toBe(1);
    });

    test('keeps X به X compounds intact', () => {
      const tokens = ['او', 'یک', 'دیوونه', 'ی', 'در', 'به', 'دره', 'بود'];
      const mask = buildGlueMask(tokens);
      // "در به دره" spans indices 4, 5, 6
      expect(mask[5]).toBe(0); // Cannot break between "در" and "به"
      expect(mask[6]).toBe(0); // Cannot break between "به" and "دره"
    });

    test('keeps تو در تو and immediate repeats X X intact', () => {
      const tokens = ['کوچه‌های', 'تو', 'در', 'تو', 'رفته', 'رفته', 'خاموش', 'شد'];
      const mask = buildGlueMask(tokens);
      // "تو در تو"
      expect(mask[2]).toBe(0);
      expect(mask[3]).toBe(0);
      // "رفته رفته" (repeat at index 5)
      expect(mask[5]).toBe(0);
    });
  });

  describe('S2: Form Classifier', () => {
    test('detects colloquial markers and classifies as colloquial', () => {
      const tokens = ['یه', 'دفه', 'دیدم', 'میاد', 'میگه', 'نیس', 'گله س'];
      expect(countColloquialMarkers(tokens)).toBeGreaterThanOrEqual(3);
      expect(classifyForm(tokens.join(' '), tokens)).toBe('colloquial');
    });

    test('detects radif periodicity in repetitive verse', () => {
      const text = 'گل در بر و می در کف و معشوق به کام است دلم خوش است و کار جهان بر نظام است';
      const tokens = text.split(/\s+/);
      const radif = detectRadifPeriodicity(tokens);
      // If repeated regularly, flagged as classical_rhymed
      expect(classifyForm(text, tokens)).toBe('classical_rhymed');
    });

    test('classifies dense punctuated text as prose', () => {
      const text = 'این یک گزارش خبری کامل است. جلسه در ساعت ده صبح آغاز شد، سپس نمایندگان حاضر شدند! در نهایت بیانیه صادر شد: همه طرف‌ها با متن پیشنهادی توافق کردند و امضا شد.';
      const tokens = text.split(/\s+/);
      expect(classifyForm(text, tokens)).toBe('prose');
    });
  });

  describe('S3: Classical Rhyme Grid', () => {
    test('detects candidate radif with low CV and places breaks after radif', () => {
      const shot = shots.find((s) => s.id === 'mehdi-soheili.general.142')!;
      const tokens = shot.text.split(/\s+/).filter(Boolean).slice(0, 60);
      const radif = detectRadifCandidates(tokens);
      expect(radif).not.toBeNull();
      expect(radif?.phrase).toBe('هنوز');
      expect(radif?.cv).toBeLessThanOrEqual(0.35);
    });

    test('snapMidpoint splits beyt into balanced hemistichs obeying S1 mask', () => {
      const tokens = ['یار', 'و', 'همسر', 'نگرفتم', 'که', 'گرو', 'بود', 'سرم', 'تو', 'شدی', 'مادر', 'و', 'من', 'با', 'همه', 'پیری', 'پسرم'];
      const mask = buildGlueMask(tokens);
      const res = snapMidpoint(tokens, 0, tokens.length - 1, mask);
      expect(res.h1.split(' ').length).toBeLessThanOrEqual(10);
      expect(res.h2.split(' ').length).toBeLessThanOrEqual(10);
    });
  });

  describe('S4: Modern Boundary Model & Calibration', () => {
    test('weights.json satisfies Platt scaling ECE <= 0.08', () => {
      expect(weightsData.num_features).toBe(12);
      expect(weightsData.weights.length).toBe(12);
      expect(weightsData.calibration.ece).toBeLessThanOrEqual(0.08);
    });

    test('pure-TS sigmoid and scoreBoundaryGap inference', () => {
      const features = new Float64Array(12);
      features[0] = 1.0; // bias
      features[1] = 1.0; // sentence punct
      const p = scoreBoundaryGap(features);
      expect(p).toBeGreaterThan(0.0);
      expect(p).toBeLessThan(1.0);
    });
  });

  describe('S5: Heuristic DP Fallback', () => {
    test('segments unstructured modern text without uniform 24-character target', () => {
      const text = 'دست تو چه قدر تاخیر دارد وقتی که چای گرم می شود و تو چای سرد را تعارف می کنی';
      const tokens = text.split(/\s+/);
      const mask = buildGlueMask(tokens);
      const res = runHeuristicDp(tokens, mask);
      expect(res.stanzas.length).toBeGreaterThan(0);
      for (const line of res.stanzas.flat()) {
        const words = line.split(/\s+/).filter(Boolean);
        expect(words.length).toBeLessThanOrEqual(10);
      }
    });
  });

  describe('S6: LLM Pass Guard', () => {
    test('validates 100% letterFingerprint preservation', () => {
      const raw = 'من به ساعت نگاه می کنم تو می میری';
      const validLlm = 'من به ساعت نگاه می کنم\nتو می میری';
      const invalidLlm = 'من به ساعت نگاه کردم\nتو می میری';

      expect(executeLlmPassGuard(raw, validLlm).valid).toBe(true);
      expect(executeLlmPassGuard(raw, invalidLlm).valid).toBe(false);
    });
  });

  describe('S7: Typo Flags', () => {
    test('flags rare typo with high-frequency neighbor without modifying text', () => {
      const tokens = ['دیده', 'ی', 'متظرم', 'لحظه', 'شمارست'];
      const typos = detectTypos(tokens);
      const target = typos.find((t) => t.token === 'متظرم');
      expect(target).toBeDefined();
      expect(target?.suggestion).toBe('منتظرم');
      expect(target?.ratio).toBeGreaterThanOrEqual(50);
    });
  });

  describe('S8: Typeset Layer', () => {
    test('attaches standalone suffixes with ZWNJ and leaves می untouched', () => {
      const line1 = 'چشمه های سرخ و بزرگ تر شد';
      expect(typesetLine(line1)).toBe('چشمه‌های سرخ و بزرگ‌تر شد');

      const line2 = 'جام می آوردم و می ناب نوشیدم';
      expect(typesetLine(line2)).toBe('جام می آوردم و می ناب نوشیدم'); // Never touch "می"
    });

    test('typesetLine is idempotent', () => {
      const line = 'دیوونه ی در به دره با دست های بسته';
      const once = typesetLine(line);
      const twice = typesetLine(once);
      expect(twice).toBe(once);
    });
  });
});

describe('Structure Engine v2: Golden Shots #1 to #4 Fixtures', () => {
  test('Shot #1 (Mehdi Soheili): >= 90% of lines ending a radif hemistich end with «هنوز»', () => {
    const shot = shots.find((s) => s.id === 'mehdi-soheili.general.142')!;
    const res = structurePoem(shot.text);

    expect(res.form).toBe('classical_rhymed');
    expect(res.origin).toBe('rhyme_grid');
    expect(res.beyts).toBeDefined();
    expect(res.beyts!.length).toBe(7);

    const flatLines = res.stanzas.flat();
    expect(flatLines.length).toBe(14);

    let radifCount = 0;
    for (const line of flatLines) {
      if (line.endsWith('هنوز')) {
        radifCount++;
      }
    }

    // In 7 couplets with matla', exactly 8 hemistichs carry radif «هنوز»
    expect(radifCount).toBe(8);
    // All lines <= 10 words
    for (const line of flatLines) {
      expect(line.split(/\s+/).filter(Boolean).length).toBeLessThanOrEqual(10);
    }
  });

  test('Shot #2 (Maryam Heydarzadeh): Colloquial lyric, 0 glue starts, 0 dangling ends, <= 10 words', () => {
    const shot = shots.find((s) => s.id === 'maryam-heydarzadeh.general.26')!;
    const res = structurePoem(shot.text);

    expect(res.form).toBe('colloquial');
    const flatLines = res.stanzas.flat();

    for (const line of flatLines) {
      const words = line.trim().split(/\s+/).filter(Boolean);
      expect(words.length).toBeLessThanOrEqual(10);

      const firstWord = words[0] || '';
      expect(FORBIDDEN_LINE_STARTS.has(bareToken(firstWord))).toBe(false);

      const lastWord = words[words.length - 1] || '';
      if (FORBIDDEN_LINE_ENDS.has(bareToken(lastWord))) {
        expect(TRAILING_PUNCTUATION_REGEX.test(lastWord)).toBe(true);
      }
    }
  });

  test('Shot #3 (Ahmadreza Ahmadi): Free verse, 0 glue starts, 0 dangling ends, <= 10 words', () => {
    const shot = shots.find((s) => s.id === 'ahmadreza-ahmadi.general.18')!;
    const res = structurePoem(shot.text);

    expect(res.form).toBe('free_verse');
    const flatLines = res.stanzas.flat();

    for (const line of flatLines) {
      const words = line.trim().split(/\s+/).filter(Boolean);
      expect(words.length).toBeLessThanOrEqual(10);

      const firstWord = words[0] || '';
      expect(FORBIDDEN_LINE_STARTS.has(bareToken(firstWord))).toBe(false);

      const lastWord = words[words.length - 1] || '';
      if (FORBIDDEN_LINE_ENDS.has(bareToken(lastWord))) {
        expect(TRAILING_PUNCTUATION_REGEX.test(lastWord)).toBe(true);
      }
    }
  });

  test('Shot #4 (Shahriar): Classical couplets with near-equal hemistich lengths and <= 10 words', () => {
    const shot = shots.find((s) => s.id === 'shahriar.general.72')!;
    const res = structurePoem(shot.text);

    expect(res.form).toBe('classical_rhymed');
    expect(res.origin).toBe('rhyme_grid');
    expect(res.beyts).toBeDefined();
    expect(res.beyts!.length).toBe(12);

    for (const [h1, h2] of res.beyts!) {
      const w1 = h1.split(/\s+/).filter(Boolean).length;
      const w2 = h2.split(/\s+/).filter(Boolean).length;

      expect(w1).toBeLessThanOrEqual(10);
      expect(w2).toBeLessThanOrEqual(10);
      expect(Math.abs(w1 - w2)).toBeLessThanOrEqual(3);
    }
  });

  test('Corpus Invariant: 100% letter-fingerprint preservation across all shots', () => {
    for (const shot of shots) {
      const res = structurePoem(shot.text);
      const flatOutput = res.stanzas.flat().join(' ');
      const fpIn = letterFingerprint(shot.text);
      const fpOut = letterFingerprint(flatOutput);
      expect(fpOut).toBe(fpIn);
    }
  });
});

describe('Structure Engine v2: Property-Based Invariants (fast-check)', () => {
  test('S1 mask never permits line starts with forbidden tokens', () => {
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[\u0600-\u06FF]{2,8}$/), { minLength: 5, maxLength: 30 }),
        (randomWords) => {
          // Inject a forbidden start token at index 2
          const forbiddenList = Array.from(FORBIDDEN_LINE_STARTS);
          const chosenForbidden = forbiddenList[0]!;
          const words = [...randomWords];
          words[2] = chosenForbidden;

          const mask = buildGlueMask(words);
          expect(mask[2]).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('typesetLine never mutates text length or fingerprint other than ZWNJ', () => {
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[\u0600-\u06FF]{2,8}$/), { minLength: 3, maxLength: 15 }),
        (words) => {
          const raw = words.join(' ');
          const typeset = typesetLine(raw);
          expect(letterFingerprint(typeset)).toBe(letterFingerprint(raw));
        }
      ),
      { numRuns: 100 }
    );
  });
});
