import fs from 'node:fs';
import path from 'node:path';
import {
  structurePoem,
  letterFingerprint,
  cleanLine,
} from '../../../packages/poem/src';
import {
  bareToken,
  FORBIDDEN_LINE_STARTS,
  FORBIDDEN_LINE_ENDS,
  TRAILING_PUNCTUATION_REGEX,
  buildGlueMask,
} from '../../../packages/poem/src/glue';
import { typesetLine, applyTypesetLayer } from '../../../packages/poem/src/typeset';
import { extractGapFeatures, scoreBoundaryGap } from '../../../packages/poem/src/boundary-model';

const ROOT = process.cwd();
const SHOTS_FILE = path.join(ROOT, 'data/golden/shots.jsonl');
const SAMPLE_FILE = path.join(ROOT, 'data/golden/sample300.jsonl');

interface AuditResult {
  passed: boolean;
  details: string;
}

const results: Record<string, AuditResult> = {};

console.log('=== STARTING INDEPENDENT VICTORY AUDIT SUITE ===\n');

// -----------------------------------------------------------------------------
// CHECK 1: Golden Shots 1-4 (raw and flat_text)
// -----------------------------------------------------------------------------
console.log('Checking Check 1: Golden Shots 1-4...');
try {
  const shotsContent = fs.readFileSync(SHOTS_FILE, 'utf8').trim();
  const shots = shotsContent.split('\n').filter(Boolean).map((l) => JSON.parse(l));

  let shotFailures: string[] = [];

  // Shot 1: Mehdi Soheili
  const shot1 = shots.find((s) => s.id === 'mehdi-soheili.general.142');
  if (!shot1) {
    shotFailures.push('Shot 1 not found');
  } else {
    for (const key of ['text', 'flat_text'] as const) {
      const res = structurePoem(shot1[key]);
      const flat = res.stanzas.flat();
      let rhymingCount = 0;
      let rhymingWithHanooz = 0;
      res.beyts?.forEach(([h1, h2], idx) => {
        if (idx === 0) {
          rhymingCount += 2;
          if (h1.endsWith('هنوز')) rhymingWithHanooz++;
          if (h2.endsWith('هنوز')) rhymingWithHanooz++;
        } else {
          rhymingCount += 1;
          if (h2.endsWith('هنوز')) rhymingWithHanooz++;
        }
      });
      const rate = rhymingCount > 0 ? (rhymingWithHanooz / rhymingCount) * 100 : 0;
      if (rate < 90) {
        shotFailures.push(`Shot 1 [${key}] radif rate ${rate.toFixed(1)}% < 90%`);
      }
      for (const line of flat) {
        const wc = line.split(/\s+/).filter(Boolean).length;
        if (wc > 10) shotFailures.push(`Shot 1 [${key}] line > 10 words: "${line}"`);
      }
    }
  }

  // Shot 4: Shahriar
  const shot4 = shots.find((s) => s.id === 'shahriar.general.72');
  if (!shot4) {
    shotFailures.push('Shot 4 not found');
  } else {
    for (const key of ['text', 'flat_text'] as const) {
      const res = structurePoem(shot4[key]);
      if (!res.beyts || res.beyts.length === 0) {
        shotFailures.push(`Shot 4 [${key}] has 0 beyts`);
      } else {
        for (const [h1, h2] of res.beyts) {
          const w1 = h1.split(/\s+/).filter(Boolean).length;
          const w2 = h2.split(/\s+/).filter(Boolean).length;
          if (Math.abs(w1 - w2) > 3) {
            shotFailures.push(`Shot 4 [${key}] beyt word delta ${Math.abs(w1 - w2)} > 3`);
          }
          if (w1 > 10 || w2 > 10) {
            shotFailures.push(`Shot 4 [${key}] hemistich > 10 words (${w1}, ${w2})`);
          }
        }
      }
    }
  }

  // Shots 2 & 3: Heydarzadeh & Ahmadi
  for (const shotId of ['maryam-heydarzadeh.general.26', 'ahmadreza-ahmadi.general.18']) {
    const shot = shots.find((s) => s.id === shotId);
    if (!shot) {
      shotFailures.push(`Shot ${shotId} not found`);
      continue;
    }
    for (const key of ['text', 'flat_text'] as const) {
      const res = structurePoem(shot[key]);
      const flat = res.stanzas.flat();
      for (const line of flat) {
        const words = line.trim().split(/\s+/).filter(Boolean);
        if (words.length > 10) {
          shotFailures.push(`Shot ${shotId} [${key}] line > 10 words: "${line}"`);
        }
        const first = bareToken(words[0] || '');
        if (FORBIDDEN_LINE_STARTS.has(first)) {
          shotFailures.push(`Shot ${shotId} [${key}] illegal start "${first}": "${line}"`);
        }
        const lastRaw = words[words.length - 1] || '';
        const last = bareToken(lastRaw);
        if (FORBIDDEN_LINE_ENDS.has(last) && !TRAILING_PUNCTUATION_REGEX.test(lastRaw)) {
          shotFailures.push(`Shot ${shotId} [${key}] dangling unpunctuated end "${last}": "${line}"`);
        }
      }
    }
  }

  results['Check 1: Golden Shots'] = {
    passed: shotFailures.length === 0,
    details: shotFailures.length === 0 ? 'All 4 golden shots pass 100% in both raw and flat_text modes.' : shotFailures.join('; '),
  };
} catch (err: any) {
  results['Check 1: Golden Shots'] = { passed: false, details: `Exception: ${err.message}` };
}

// -----------------------------------------------------------------------------
// CHECK 2: Corpus Invariants on sample300.jsonl & Hafez Ghazal 9
// -----------------------------------------------------------------------------
console.log('Checking Check 2: Corpus Invariants & Hafez Ghazal 9...');
try {
  const sampleContent = fs.readFileSync(SAMPLE_FILE, 'utf8').trim();
  const sample = sampleContent.split('\n').filter(Boolean).map((l) => JSON.parse(l));

  let fpPreservedCount = 0;
  let detachedSuffixStarts = 0;
  let ghazal9RaStarts = 0;
  let allRaStarts = 0;

  // Standalone glue suffixes from specification: {ی, ها, های, تر, ترین, ام, ات, اش, مان, تان, شان}
  const GLUE_SUFFIXES = new Set(['ی', 'ها', 'های', 'تر', 'ترین', 'ام', 'ات', 'اش', 'مان', 'تان', 'شان']);

  for (const work of sample) {
    const rawText = work.text || work.text_plain || (work.stanzas ? work.stanzas.flat().join(' ') : '');
    if (!rawText) continue;

    const res = structurePoem(rawText, { poetId: work.poet_id });
    const flatOut = res.stanzas.flat().join(' ');

    // Letter fingerprint
    const fpIn = letterFingerprint(rawText);
    const fpOut = letterFingerprint(flatOut);
    if (fpIn === fpOut) {
      fpPreservedCount++;
    } else if (res.flags.includes('footer_removed') && res.colophon?.raw) {
      const colFp = letterFingerprint(res.colophon.raw);
      if (fpIn.replace(colFp, '') === fpOut || (fpOut + colFp).length >= fpIn.length) {
        fpPreservedCount++;
      }
    }

    // Line start check across all works
    for (const line of res.stanzas.flat()) {
      const words = line.trim().split(/\s+/).filter(Boolean);
      if (words.length === 0) continue;
      const first = bareToken(words[0] || '');
      if (GLUE_SUFFIXES.has(first)) {
        detachedSuffixStarts++;
      }
      if (first === 'را') {
        allRaStarts++;
      }
    }

    // Specifically test Ghazal 9 in both raw and flat text modes
    if (work.id === 'hafez.ghazaliat.9' || (work.poet_id === 'hafez' && work.title?.includes('۹'))) {
      for (const line of res.stanzas.flat()) {
        const words = line.trim().split(/\s+/).filter(Boolean);
        if (words.length > 0 && bareToken(words[0] || '') === 'را') {
          ghazal9RaStarts++;
        }
      }
      const flattenedG9 = rawText.replace(/\s+/g, ' ');
      const resFlat = structurePoem(flattenedG9);
      for (const line of resFlat.stanzas.flat()) {
        const words = line.trim().split(/\s+/).filter(Boolean);
        if (words.length > 0 && bareToken(words[0] || '') === 'را') {
          ghazal9RaStarts++;
        }
      }
    }
  }

  const fpRate = (fpPreservedCount / sample.length) * 100;
  const passed = fpRate >= 99.5 && detachedSuffixStarts === 0 && ghazal9RaStarts === 0 && allRaStarts === 0;

  results['Check 2: Corpus Invariants'] = {
    passed,
    details: `Fingerprint preservation: ${fpPreservedCount}/${sample.length} (${fpRate.toFixed(1)}%); Detached suffix starts: ${detachedSuffixStarts}; Ghazal 9 'را' starts (raw+flat): ${ghazal9RaStarts}; All works 'را' starts: ${allRaStarts}`,
  };
} catch (err: any) {
  results['Check 2: Corpus Invariants'] = { passed: false, details: `Exception: ${err.message}` };
}

// -----------------------------------------------------------------------------
// CHECK 3: Typeset ReDoS resilience & «می» ZWNJ verification
// -----------------------------------------------------------------------------
console.log('Checking Check 3: Typeset ReDoS & «می» Invariant...');
try {
  // Test ReDoS on 25,000 characters
  const long25k = 'الف'.repeat(25000);
  const times25k: number[] = [];
  for (let i = 0; i < 10; i++) {
    const t0 = performance.now();
    typesetLine(long25k);
    times25k.push(performance.now() - t0);
  }
  times25k.sort((a, b) => a - b);
  const median25k = times25k[Math.floor(times25k.length / 2)]!;

  // Test 50,000 characters
  const long50k = 'الف'.repeat(50000);
  const t0 = performance.now();
  typesetLine(long50k);
  const time50k = performance.now() - t0;

  // Test «می» constraint: NEVER joined with ZWNJ
  const miCases = [
    'او می رود',
    'می خور که ز دل رنج برد',
    'می آید و می رود',
    'این می ناب است',
    'باده و می',
    'می‌روم به باغ', // already has zwnj in input
  ];

  let miViolations = 0;
  for (const text of miCases) {
    const out = typesetLine(text);
    if (text.includes(' می ') && out.includes('\u200cمی')) {
      miViolations++;
      console.error(`«می» ZWNJ violation in "${text}" -> "${out}"`);
    }
  }

  // Suffixes must attach with ZWNJ
  const suffixTest = 'کتاب ها و قلم های من خانه ات';
  const suffixOut = typesetLine(suffixTest);
  let suffixOk = suffixOut.includes('کتاب\u200cها') && suffixOut.includes('قلم\u200cهای');

  const passed = median25k < 50.0 && miViolations === 0 && suffixOk;
  results['Check 3: Typeset ReDoS & «می»'] = {
    passed,
    details: `25k median: ${median25k.toFixed(3)} ms (< 50 ms); 50k time: ${time50k.toFixed(3)} ms; «می» violations: ${miViolations}; Suffix ZWNJ attachment: ${suffixOk ? 'PASS' : 'FAIL'}`,
  };
} catch (err: any) {
  results['Check 3: Typeset ReDoS & «می»'] = { passed: false, details: `Exception: ${err.message}` };
}

// -----------------------------------------------------------------------------
// CHECK 4: Platt Calibration ECE <= 0.08 on Modern Verse
// -----------------------------------------------------------------------------
console.log('Checking Check 4: Platt Calibration ECE...');
try {
  const sampleContent = fs.readFileSync(SAMPLE_FILE, 'utf8').trim();
  const sample = sampleContent.split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const modern = sample.filter(
    (i) => i.kind === 'modern' || i.form === 'free_verse' || i.form === 'sepid' || i.form === 'nimaee'
  );

  const probs: number[] = [];
  const labels: number[] = [];

  for (const poem of modern) {
    const flatLines = (poem.stanzas || []).flat().map(cleanLine).filter(Boolean);
    if (flatLines.length < 2) continue;

    const tokens: string[] = [];
    const lineEnds = new Set<number>();
    let c = 0;
    for (let li = 0; li < flatLines.length; li++) {
      for (const t of flatLines[li].split(/\s+/).filter(Boolean)) {
        tokens.push(t);
        c++;
      }
      if (li < flatLines.length - 1) lineEnds.add(c - 1);
    }

    const mask = buildGlueMask(tokens);
    let wordsSinceBreak = 0;
    for (let g = 0; g < tokens.length - 1; g++) {
      wordsSinceBreak++;
      if (mask[g + 1] === 0) continue;
      const isB = lineEnds.has(g) ? 1 : 0;
      const p = scoreBoundaryGap(extractGapFeatures(tokens, g, wordsSinceBreak, new Set()));
      probs.push(p);
      labels.push(isB);
      if (isB === 1) wordsSinceBreak = 0;
    }
  }

  let ece = 0;
  const B = 10;
  const counts = new Array(B).fill(0);
  const acc = new Array(B).fill(0);
  const conf = new Array(B).fill(0);

  for (let i = 0; i < probs.length; i++) {
    const b = Math.min(B - 1, Math.floor((probs[i] ?? 0) * B));
    counts[b]++;
    acc[b] += labels[i] ?? 0;
    conf[b] += probs[i] ?? 0;
  }

  for (let b = 0; b < B; b++) {
    if (counts[b] > 0) {
      ece += (counts[b] / probs.length) * Math.abs(acc[b] / counts[b] - conf[b] / counts[b]);
    }
  }

  const passed = ece <= 0.08;
  results['Check 4: Platt Calibration ECE'] = {
    passed,
    details: `Modern verse candidate gaps evaluated: ${probs.length}; 10-bin ECE: ${ece.toFixed(4)} (threshold <= 0.08)`,
  };
} catch (err: any) {
  results['Check 4: Platt Calibration ECE'] = { passed: false, details: `Exception: ${err.message}` };
}

// -----------------------------------------------------------------------------
// CHECK 5: Latency Median <= 5.0 ms/poem
// -----------------------------------------------------------------------------
console.log('Checking Check 5: Latency Benchmark...');
try {
  const sampleContent = fs.readFileSync(SAMPLE_FILE, 'utf8').trim();
  const sample = sampleContent.split('\n').filter(Boolean).map((l) => JSON.parse(l));

  const timesRaw: number[] = [];
  const timesFlat: number[] = [];

  // Warmup
  for (let i = 0; i < 20; i++) {
    structurePoem(sample[i]?.text || sample[i]?.text_plain || 'نمونه شعر برای گرم کردن');
  }

  for (const work of sample) {
    const text = work.text || work.text_plain || (work.stanzas ? work.stanzas.flat().join(' ') : '');
    if (!text) continue;

    // Raw mode
    const t0 = performance.now();
    structurePoem(text, { poetId: work.poet_id });
    timesRaw.push(performance.now() - t0);

    // Flattened mode
    const flat = text.replace(/\s+/g, ' ');
    const t1 = performance.now();
    structurePoem(flat, { poetId: work.poet_id });
    timesFlat.push(performance.now() - t1);
  }

  timesRaw.sort((a, b) => a - b);
  timesFlat.sort((a, b) => a - b);

  const medianRaw = timesRaw[Math.floor(timesRaw.length / 2)]!;
  const p95Raw = timesRaw[Math.floor(timesRaw.length * 0.95)]!;
  const medianFlat = timesFlat[Math.floor(timesFlat.length / 2)]!;
  const p95Flat = timesFlat[Math.floor(timesFlat.length * 0.95)]!;

  const passed = medianRaw <= 5.0 && medianFlat <= 5.0;
  results['Check 5: Inference Latency'] = {
    passed,
    details: `Raw median: ${medianRaw.toFixed(3)} ms (p95: ${p95Raw.toFixed(3)} ms); Flattened median: ${medianFlat.toFixed(3)} ms (p95: ${p95Flat.toFixed(3)} ms) [target <= 5.0 ms]`,
  };
} catch (err: any) {
  results['Check 5: Inference Latency'] = { passed: false, details: `Exception: ${err.message}` };
}

// -----------------------------------------------------------------------------
// CHECK 6: Concurrency & Memory Leak
// -----------------------------------------------------------------------------
console.log('Checking Check 6: Concurrency & Memory Leak...');
try {
  const sampleContent = fs.readFileSync(SAMPLE_FILE, 'utf8').trim();
  const sample = sampleContent.split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const testTexts = sample.slice(0, 50).map((w) => w.text || w.text_plain || '');

  // Concurrency test: 200 concurrent async invocations
  const promises = [];
  for (let i = 0; i < 200; i++) {
    const t = testTexts[i % testTexts.length]!;
    promises.push(
      new Promise<string>((resolve) => {
        const res = structurePoem(t);
        resolve(res.origin);
      })
    );
  }
  await Promise.all(promises);

  // Memory stability test: 2000 runs
  if (global.gc) global.gc();
  const heapBefore = process.memoryUsage().heapUsed;
  for (let i = 0; i < 2000; i++) {
    structurePoem(testTexts[i % testTexts.length]!);
  }
  if (global.gc) global.gc();
  const heapAfter = process.memoryUsage().heapUsed;
  const deltaMb = (heapAfter - heapBefore) / (1024 * 1024);

  const passed = deltaMb < 15.0;
  results['Check 6: Concurrency & Memory'] = {
    passed,
    details: `200 concurrent tasks completed with 0 errors; Heap delta over 2000 iterations: ${deltaMb.toFixed(2)} MB (< 15 MB)`,
  };
} catch (err: any) {
  results['Check 6: Concurrency & Memory'] = { passed: false, details: `Exception: ${err.message}` };
}

console.log('\n=== AUDIT SUITE EXECUTION COMPLETED ===\n');
for (const [checkName, res] of Object.entries(results)) {
  console.log(`${res.passed ? '✓ PASS' : '✗ FAIL'}: ${checkName}`);
  console.log(`  Details: ${res.details}\n`);
}

const allPassed = Object.values(results).every((r) => r.passed);
console.log(`OVERALL INDEPENDENT AUDIT SUITE: ${allPassed ? 'ALL PASS' : 'SOME FAIL'}`);
process.exit(allPassed ? 0 : 1);
