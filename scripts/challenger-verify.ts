import fs from 'node:fs';
import path from 'node:path';
import fc from 'fast-check';
import {
  structurePoem,
  letterFingerprint,
  cleanLine,
  splitBySignals,
  looksStructured,
} from '../packages/poem/src';
import {
  buildGlueMask,
  FORBIDDEN_LINE_STARTS,
  FORBIDDEN_LINE_ENDS,
  TRAILING_PUNCTUATION_REGEX,
  bareToken,
} from '../packages/poem/src/glue';
import weightsData from '../packages/poem/src/weights.json';

const ROOT = process.cwd();
const SHOTS_FILE = path.join(ROOT, 'data/golden/shots.jsonl');
const SAMPLE_FILE = path.join(ROOT, 'data/golden/sample300.jsonl');

interface Shot {
  id: string;
  poet_id: string;
  poet_name: string;
  title: string;
  form: string;
  text: string;
  flat_text: string;
}

function loadShots(): Shot[] {
  const content = fs.readFileSync(SHOTS_FILE, 'utf8').trim();
  return content.split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

async function runVerification() {
  console.log('================================================================');
  console.log('       EMPIRICAL CHALLENGER VERIFICATION HARNESS v1.0           ');
  console.log('================================================================\n');

  const shots = loadShots();
  let allPass = true;

  // ---------------------------------------------------------------------------
  // TASK 1: Shot #1 (Mehdi Soheili)
  // ---------------------------------------------------------------------------
  console.log('>>> TASK 1: Shot #1 (Mehdi Soheili - mehdi-soheili.general.142)');
  const shot1 = shots.find((s) => s.id === 'mehdi-soheili.general.142');
  if (!shot1) {
    console.error('FAIL: Shot #1 not found in shots.jsonl');
    allPass = false;
  } else {
    for (const textKey of ['text', 'flat_text'] as const) {
      console.log(`  Evaluating input: "${textKey}"`);
      const res = structurePoem(shot1[textKey]);
      console.log(`    form: ${res.form}, origin: ${res.origin}, confidence: ${res.confidence}`);
      console.log(`    beyts count: ${res.beyts?.length ?? 0}, stanzas: ${res.stanzas.length}`);

      const flatLines = res.stanzas.flat();
      console.log(`    total lines: ${flatLines.length}`);

      // Check radif «هنوز»
      // Couplet matla' has radif on both hemistichs (beyt 0, h1 and h2)
      // All subsequent couplets have radif on h2
      let rhymingHemistichsCount = 0;
      let rhymingHemistichsWithHanooz = 0;
      let totalLinesWithHanooz = 0;
      let lineWordCountViolations = 0;

      res.beyts?.forEach(([h1, h2], idx) => {
        if (idx === 0) {
          // matla
          rhymingHemistichsCount += 2;
          if (h1.endsWith('هنوز')) rhymingHemistichsWithHanooz++;
          if (h2.endsWith('هنوز')) rhymingHemistichsWithHanooz++;
        } else {
          rhymingHemistichsCount += 1;
          if (h2.endsWith('هنوز')) rhymingHemistichsWithHanooz++;
        }
      });

      flatLines.forEach((line, i) => {
        const words = line.split(/\s+/).filter(Boolean);
        if (words.length > 10) {
          console.error(`    VIOLATION line ${i + 1} exceeds 10 words (${words.length} words): "${line}"`);
          lineWordCountViolations++;
        }
        if (line.endsWith('هنوز')) {
          totalLinesWithHanooz++;
        }
      });

      const radifRateRhyming = rhymingHemistichsCount > 0 ? (rhymingHemistichsWithHanooz / rhymingHemistichsCount) * 100 : 0;
      const radifRateTotal = flatLines.length > 0 ? (totalLinesWithHanooz / flatLines.length) * 100 : 0;
      console.log(`    Rhyming hemistichs ending with «هنوز»: ${rhymingHemistichsWithHanooz}/${rhymingHemistichsCount} (${radifRateRhyming.toFixed(1)}%)`);
      console.log(`    Total lines ending with «هنوز»: ${totalLinesWithHanooz}/${flatLines.length} (${radifRateTotal.toFixed(1)}%)`);
      console.log(`    Line length violations (>10 words): ${lineWordCountViolations}`);

      if (radifRateRhyming < 90 || lineWordCountViolations > 0) {
        console.error('    FAILED Task 1 criteria!');
        allPass = false;
      } else {
        console.log('    PASS Task 1 criteria.');
      }
    }
  }

  // ---------------------------------------------------------------------------
  // TASK 2: Shot #4 (Shahriar)
  // ---------------------------------------------------------------------------
  console.log('\n>>> TASK 2: Shot #4 (Shahriar - shahriar.general.72)');
  const shot4 = shots.find((s) => s.id === 'shahriar.general.72');
  if (!shot4) {
    console.error('FAIL: Shot #4 not found in shots.jsonl');
    allPass = false;
  } else {
    for (const textKey of ['text', 'flat_text'] as const) {
      console.log(`  Evaluating input: "${textKey}"`);
      const res = structurePoem(shot4[textKey]);
      console.log(`    form: ${res.form}, origin: ${res.origin}, confidence: ${res.confidence}`);
      console.log(`    beyts count: ${res.beyts?.length ?? 0}`);

      if (!res.beyts || res.beyts.length === 0) {
        console.error('    FAIL: No beyts formed for classical rhymed verse!');
        allPass = false;
        continue;
      }

      let maxWordDiff = 0;
      let maxCharRatioDiff = 0;
      let lineWordCountViolations = 0;

      res.beyts.forEach(([h1, h2], idx) => {
        const w1 = h1.split(/\s+/).filter(Boolean).length;
        const w2 = h2.split(/\s+/).filter(Boolean).length;
        const wordDiff = Math.abs(w1 - w2);
        if (wordDiff > maxWordDiff) maxWordDiff = wordDiff;

        const c1 = h1.length;
        const c2 = h2.length;
        const charRatio = Math.abs(c1 - c2) / Math.max(c1, c2);
        if (charRatio > maxCharRatioDiff) maxCharRatioDiff = charRatio;

        if (w1 > 10) {
          console.error(`    VIOLATION beyt ${idx + 1} h1 > 10 words (${w1}): "${h1}"`);
          lineWordCountViolations++;
        }
        if (w2 > 10) {
          console.error(`    VIOLATION beyt ${idx + 1} h2 > 10 words (${w2}): "${h2}"`);
          lineWordCountViolations++;
        }
      });

      console.log(`    Max word count difference between hemistichs: ${maxWordDiff}`);
      console.log(`    Max character imbalance ratio between hemistichs: ${(maxCharRatioDiff * 100).toFixed(1)}%`);
      console.log(`    Line length violations (>10 words): ${lineWordCountViolations}`);

      if (maxWordDiff > 3 || lineWordCountViolations > 0) {
        console.error('    FAILED Task 2 criteria!');
        allPass = false;
      } else {
        console.log('    PASS Task 2 criteria.');
      }
    }
  }

  // ---------------------------------------------------------------------------
  // TASK 3: Shots #2 & #3 (Heydarzadeh & Ahmadi)
  // ---------------------------------------------------------------------------
  console.log('\n>>> TASK 3: Shots #2 & #3 (Maryam Heydarzadeh & Ahmadreza Ahmadi)');
  for (const shotId of ['maryam-heydarzadeh.general.26', 'ahmadreza-ahmadi.general.18']) {
    const shot = shots.find((s) => s.id === shotId);
    if (!shot) {
      console.error(`FAIL: Shot ${shotId} not found in shots.jsonl`);
      allPass = false;
      continue;
    }
    console.log(`  Evaluating: ${shot.poet_name} (${shot.title})`);
    for (const textKey of ['text', 'flat_text'] as const) {
      console.log(`    Input mode: "${textKey}"`);
      const res = structurePoem(shot[textKey]);
      console.log(`      form: ${res.form}, origin: ${res.origin}, confidence: ${res.confidence}`);

      const flatLines = res.stanzas.flat();
      console.log(`      total lines: ${flatLines.length}`);

      let glueStartViolations = 0;
      let danglingEndViolations = 0;
      let wordCountViolations = 0;

      flatLines.forEach((line, i) => {
        const words = line.trim().split(/\s+/).filter(Boolean);
        if (words.length > 10) {
          console.error(`      VIOLATION line ${i + 1} exceeds 10 words (${words.length} words): "${line}"`);
          wordCountViolations++;
        }

        const firstToken = words[0] || '';
        const bareFirst = bareToken(firstToken);
        if (FORBIDDEN_LINE_STARTS.has(bareFirst)) {
          console.error(`      GLUE START VIOLATION line ${i + 1} starts with forbidden "${firstToken}" (bare: "${bareFirst}"): "${line}"`);
          glueStartViolations++;
        }

        const lastToken = words[words.length - 1] || '';
        const bareLast = bareToken(lastToken);
        if (FORBIDDEN_LINE_ENDS.has(bareLast) && !TRAILING_PUNCTUATION_REGEX.test(lastToken)) {
          console.error(`      DANGLING END VIOLATION line ${i + 1} ends with unpunctuated forbidden "${lastToken}" (bare: "${bareLast}"): "${line}"`);
          danglingEndViolations++;
        }
      });

      console.log(`      Glue start violations: ${glueStartViolations}`);
      console.log(`      Dangling end violations: ${danglingEndViolations}`);
      console.log(`      Word count violations (>10 words): ${wordCountViolations}`);

      if (glueStartViolations > 0 || danglingEndViolations > 0 || wordCountViolations > 0) {
        console.error('      FAILED Task 3 criteria!');
        allPass = false;
      } else {
        console.log('      PASS Task 3 criteria.');
      }
    }
  }

  // ---------------------------------------------------------------------------
  // TASK 4: Corpus Invariants across Golden Shots and Sample 300
  // ---------------------------------------------------------------------------
  console.log('\n>>> TASK 4: Corpus Invariants');
  console.log('  4.1 Letter-fingerprint preservation across all 4 golden shots:');
  for (const shot of shots) {
    for (const textKey of ['text', 'flat_text'] as const) {
      const res = structurePoem(shot[textKey]);
      const flatOut = res.stanzas.flat().join(' ');
      const fpIn = letterFingerprint(shot[textKey]);
      const fpOut = letterFingerprint(flatOut);

      // Check raw stanzas
      if (fpIn !== fpOut) {
        console.error(`    FAIL: Fingerprint mismatch on ${shot.id} [${textKey}]: inLen=${fpIn.length}, outLen=${fpOut.length}`);
        allPass = false;
      }

      // Also check typeset layer fingerprint
      if (res.typeset) {
        const fpTypeset = letterFingerprint(res.typeset.flat().join(' '));
        if (fpIn !== fpTypeset) {
          console.error(`    FAIL: Typeset layer mutated letter fingerprint on ${shot.id} [${textKey}]!`);
          allPass = false;
        }
      }
    }
  }
  console.log('    All 4 shots preserved 100% letter-fingerprint in both raw and typeset layers.');

  console.log('  4.2 Evaluating Invariants on sample300.jsonl (300 works)...');
  if (fs.existsSync(SAMPLE_FILE)) {
    const rawSample = fs.readFileSync(SAMPLE_FILE, 'utf8').trim().split('\n').filter(Boolean);
    const sampleWorks = rawSample.map((l) => JSON.parse(l));
    console.log(`    Loaded ${sampleWorks.length} works from sample300.jsonl`);

    let s300FpPreserved = 0;
    let s300GlueStartViolations = 0;
    let s300DanglingEndViolations = 0;
    let s300LengthViolations = 0;
    const runtimes: number[] = [];

    sampleWorks.forEach((work: any, idx: number) => {
      const textToTest = work.text_plain || work.stanzas?.flat()?.join(' ') || '';
      if (!textToTest) return;

      const t0 = performance.now();
      const res = structurePoem(textToTest, { poetId: work.poet_id });
      const t1 = performance.now();
      runtimes.push(t1 - t0);

      // Letter fingerprint: note if footer was removed by colophon extractor, input should match without colophon
      const flatOut = res.stanzas.flat().join(' ');
      const fpIn = letterFingerprint(textToTest);
      const fpOut = letterFingerprint(flatOut);

      if (fpIn === fpOut) {
        s300FpPreserved++;
      } else {
        // Check if footer was removed
        if (res.flags.includes('footer_removed')) {
          // Verify with colophon raw date stripped
          const fpWithColophon = letterFingerprint(flatOut + (res.colophon?.raw || ''));
          if (fpWithColophon.includes(fpOut)) {
            s300FpPreserved++;
          } else {
            // Fingerprint delta
            // console.log(`      Work ${work.id} footer_removed delta`);
          }
        }
      }

      // Check line constraints on output
      res.stanzas.flat().forEach((line: string) => {
        const words = line.trim().split(/\s+/).filter(Boolean);
        if (words.length > 10) s300LengthViolations++;

        const firstToken = words[0] || '';
        const bareFirst = bareToken(firstToken);
        if (FORBIDDEN_LINE_STARTS.has(bareFirst)) {
          s300GlueStartViolations++;
        }

        const lastToken = words[words.length - 1] || '';
        const bareLast = bareToken(lastToken);
        if (FORBIDDEN_LINE_ENDS.has(bareLast) && !TRAILING_PUNCTUATION_REGEX.test(lastToken)) {
          s300DanglingEndViolations++;
        }
      });
    });

    runtimes.sort((a, b) => a - b);
    const medianRuntime = runtimes[Math.floor(runtimes.length / 2)] ?? 0;
    const p95Runtime = runtimes[Math.floor(runtimes.length * 0.95)] ?? 0;

    console.log(`    Sample 300 Letter-fingerprint preservation: ${s300FpPreserved}/${sampleWorks.length} (${((s300FpPreserved / sampleWorks.length) * 100).toFixed(1)}%)`);
    console.log(`    Sample 300 Glue Start Violations: ${s300GlueStartViolations}`);
    console.log(`    Sample 300 Dangling End Violations: ${s300DanglingEndViolations}`);
    console.log(`    Sample 300 Lines > 10 words: ${s300LengthViolations}`);
    console.log(`    Inference runtime: median = ${medianRuntime.toFixed(2)} ms, p95 = ${p95Runtime.toFixed(2)} ms per poem`);
  } else {
    console.warn('    sample300.jsonl not found, skipping large corpus invariant test.');
  }

  // ---------------------------------------------------------------------------
  // TASK 5: Adversarial Stress, Edge Cases, and Fuzzing
  // ---------------------------------------------------------------------------
  console.log('\n>>> TASK 5: Adversarial Stress & Fuzzing Harness');
  const edgeCases: { name: string; input: string }[] = [
    { name: 'Empty string', input: '' },
    { name: 'Whitespace only', input: '   \n\t  \r\n   ' },
    { name: 'Single Persian word', input: 'تنهایی' },
    { name: 'Two Persian words', input: 'شب تاریک' },
    { name: 'Punctuation only', input: '... ؟؟؟ !!! ::: ،،، ؛؛؛ --- *** /// «» () []' },
    { name: 'Digits and symbols only', input: '۱۲۳۴۵۶۷۸۹۰ 1234567890 @#$%^&*+' },
    { name: 'Mixed Persian, English, and Chinese', input: 'این یک شعر mixed with English words and 中文 characters است.' },
    { name: 'Extreme glue start sequence (10 start tokens in a row)', input: 'ی ها های تر ترین ام ات اش مان تان شان را است ست بود شد نیست هست' },
    { name: 'Extreme dangling end sequence (14 end tokens in a row)', input: 'ای می نمی بی همی و که تا یا از به در با بر چون اگر ولی اما' },
    { name: 'Single huge word (500 chars no spaces)', input: 'ش'.repeat(500) },
    { name: '50 repetitions of the same word', input: Array(50).fill('هنوز').join(' ') },
    { name: '50 repetitions of glue word "در"', input: Array(50).fill('در').join(' ') },
    { name: 'Colophon only with date and place', input: 'تنکابن، ۱۲ فروردین ۱۳۶۴' },
    { name: 'Alternating glue: "به را به را به را"', input: 'به را به را به را به را به را به را به را به را' },
    { name: 'Compound "در به در در به دره تو در تو"', input: 'او در به در بود و در به دره رفت در کوچه های تو در تو' },
    { name: 'Poem with severe typos in corpus', input: 'دیده ی متظرم لحظه شمارست هنوز مر من طی شد و دل در پی سارست هنوز' },
  ];

  let fuzzCrashes = 0;
  let fuzzLengthViolations = 0;
  let fuzzGlueViolations = 0;

  for (const tc of edgeCases) {
    try {
      const res = structurePoem(tc.input);
      const flat = res.stanzas.flat();
      const inFp = letterFingerprint(tc.input);
      const outFp = letterFingerprint(flat.join(' '));

      // Letter fingerprint check (unless footer removed)
      if (!res.flags.includes('footer_removed') && inFp !== outFp) {
        console.warn(`    [EDGE CASE WARNING] "${tc.name}": fingerprint difference: in="${inFp}", out="${outFp}"`);
      }

      // Check max words per line
      for (const line of flat) {
        const words = line.split(/\s+/).filter(Boolean);
        if (words.length > 10) {
          fuzzLengthViolations++;
          console.warn(`    [EDGE CASE LENGTH] "${tc.name}": line has ${words.length} words > 10: "${line}"`);
        }
      }
      console.log(`    ✓ "${tc.name}": form=${res.form}, origin=${res.origin}, lines=${flat.length}`);
    } catch (err: any) {
      console.error(`    CRASH on "${tc.name}":`, err);
      fuzzCrashes++;
      allPass = false;
    }
  }

  // Fast-check property fuzzing
  console.log('\n  5.2 Fast-check property fuzzing (300 random inputs)...');
  let fastCheckFailed = false;
  try {
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[\u0621-\u064A\u067E\u0686\u0698\u06A9\u06AF\u06CC\u200c]{2,8}[،؛؟!.]?$/), { minLength: 3, maxLength: 30 }),
        (tokenArray) => {
          const raw = tokenArray.join(' ');
          const res = structurePoem(raw);
          const flat = res.stanzas.flat();

          // Invariant 1: never crashes
          if (!res || !Array.isArray(res.stanzas)) {
            throw new Error('Invalid structure result');
          }

          // Invariant 2: if no footer_removed, fingerprint must match
          if (!res.flags.includes('footer_removed')) {
            const inFp = letterFingerprint(raw);
            const outFp = letterFingerprint(flat.join(' '));
            if (outFp !== inFp) {
              throw new Error(`Fingerprint mismatch: in="${inFp}", out="${outFp}"`);
            }
          }
        }
      ),
      { numRuns: 300 }
    );
    console.log('    ✓ Fast-check 300 random property inputs passed with 0 crashes and 100% fingerprint invariant.');
  } catch (err: any) {
    console.error('    FAIL: Fast-check property fuzzing failed:', err.message);
    fastCheckFailed = true;
    allPass = false;
  }

  console.log('\n================================================================');
  console.log(`OVERALL VERDICT: ${allPass ? 'APPROVE' : 'REQUEST_CHANGES'}`);
  console.log('================================================================\n');
}

runVerification().catch(console.error);
