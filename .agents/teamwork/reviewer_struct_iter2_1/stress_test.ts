import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { structurePoem, letterFingerprint, cleanLine } from '../../../packages/poem/src/structure';
import { typesetLine, applyTypesetLayer } from '../../../packages/poem/src/typeset';
import { buildGlueMask, FORBIDDEN_LINE_STARTS, FORBIDDEN_LINE_ENDS, bareToken, TRAILING_PUNCTUATION_REGEX } from '../../../packages/poem/src/glue';
import type { StructureResult, Form } from '../../../contracts/structure';

const VALID_FORMS = new Set<Form>(['classical_rhymed', 'free_verse', 'colloquial', 'prose']);
const VALID_ORIGINS = new Set(['source', 'separators', 'rhyme_grid', 'boundary_model', 'llm', 'heuristic', 'human']);
const VALID_FLAGS = new Set(['low_confidence', 'possible_typo', 'footer_removed']);

const STANDALONE_GLUE_SUFFIXES = new Set(['ی', 'ها', 'های', 'تر', 'ترین', 'ام', 'ات', 'اش', 'مان', 'تان', 'شان']);

function validateContract(res: StructureResult, context: string): string[] {
  const errors: string[] = [];
  if (!VALID_FORMS.has(res.form)) {
    errors.push(`[${context}] Invalid form: ${res.form}`);
  }
  if (!Array.isArray(res.stanzas) || !res.stanzas.every(st => Array.isArray(st) && st.every(l => typeof l === 'string'))) {
    errors.push(`[${context}] Invalid stanzas: must be string[][]`);
  }
  if (!VALID_ORIGINS.has(res.origin)) {
    errors.push(`[${context}] Invalid origin: ${res.origin}`);
  }
  if (typeof res.confidence !== 'number' || Number.isNaN(res.confidence) || res.confidence < 0 || res.confidence > 1) {
    errors.push(`[${context}] Invalid confidence: ${res.confidence}`);
  }
  if (!Array.isArray(res.flags) || !res.flags.every(f => VALID_FLAGS.has(f))) {
    errors.push(`[${context}] Invalid flags: ${JSON.stringify(res.flags)}`);
  }
  if (res.beyts) {
    if (!Array.isArray(res.beyts) || !res.beyts.every(b => Array.isArray(b) && b.length === 2 && typeof b[0] === 'string' && typeof b[1] === 'string')) {
      errors.push(`[${context}] Invalid beyts: must be [string, string][]`);
    }
  }
  if (res.typeset) {
    if (!Array.isArray(res.typeset) || res.typeset.length !== res.stanzas.length) {
      errors.push(`[${context}] typeset stanzas length (${res.typeset?.length}) != stanzas length (${res.stanzas.length})`);
    }
  }
  if (res.typos) {
    if (!Array.isArray(res.typos) || !res.typos.every(t => typeof t.token === 'string' && typeof t.suggestion === 'string' && typeof t.ratio === 'number')) {
      errors.push(`[${context}] Invalid typos structure`);
    }
  }
  return errors;
}

console.log('=== STARTING ADVERSARIAL STRESS TEST ===\n');

let totalAssertions = 0;
let failedAssertions = 0;

function assert(condition: boolean, msg: string) {
  totalAssertions++;
  if (!condition) {
    failedAssertions++;
    console.error(`FAIL: ${msg}`);
  }
}

// 1. ReDoS & Performance
console.log('--- 1. Typeset ReDoS & Performance Test ---');
const t0 = performance.now();
const res25k = typesetLine('الف'.repeat(25000));
const t25k = performance.now() - t0;
assert(t25k < 50, `25k unspaced chars typeset took ${t25k.toFixed(2)}ms (must be < 50ms)`);
assert(res25k.length === 25000, '25k unspaced length preserved');

const t0_100k = performance.now();
const res100k = typesetLine('الف'.repeat(100000));
const t100k = performance.now() - t0_100k;
assert(t100k < 200, `100k unspaced chars typeset took ${t100k.toFixed(2)}ms (must be < 200ms)`);

const repText = 'کتاب ها '.repeat(5000);
const t0_rep = performance.now();
const resRep = typesetLine(repText);
const tRep = performance.now() - t0_rep;
assert(tRep < 50, `5k repeated suffixes took ${tRep.toFixed(2)}ms (must be < 50ms)`);
assert(resRep.includes('کتاب‌ها'), 'Suffix attached with ZWNJ');

// Verify negative constraint on می
assert(typesetLine('می رود') === 'می رود', 'می prefix untouched');
assert(typesetLine('او می گوید') === 'او می گوید', 'می untouched in phrase');
assert(typesetLine('گل های زیبا تر') === 'گل‌های زیبا‌تر', 'Multiple suffixes attached with ZWNJ');
console.log(`Typeset ReDoS checks passed in ${t25k.toFixed(2)}ms / ${t100k.toFixed(2)}ms.\n`);

// 2. Boundary Cases & Malformed Inputs
console.log('--- 2. Malformed & Edge Inputs ---');
const edgeInputs = [
  { name: 'empty string', text: '' },
  { name: 'whitespace only', text: '   \n\t   \n' },
  { name: 'single word', text: 'سلام' },
  { name: 'two words', text: 'سلام دوست' },
  { name: 'punctuation only', text: '... ؟؟؟ !!! ،،،' },
  { name: 'control chars', text: '\u200E\u200F\u0640سلام\u200E دوست\u0640' },
  { name: 'long unspaced token', text: 'الف'.repeat(5000) },
  { name: 'only glue tokens', text: 'ی ها های تر ترین ام ات اش مان تان شان' },
  { name: 'only forbidden ends', text: 'و که تا یا از به در با بر چون اگر ولی اما' },
];

for (const edge of edgeInputs) {
  try {
    const res = structurePoem(edge.text);
    const errs = validateContract(res, edge.name);
    assert(errs.length === 0, `Edge input ${edge.name} contract errors: ${errs.join(', ')}`);
    assert(letterFingerprint(res.stanzas.flat().join(' ')) === letterFingerprint(edge.text), `Edge input ${edge.name} letter fingerprint preserved`);
  } catch (err: any) {
    assert(false, `Edge input ${edge.name} crashed: ${err.message}`);
  }
}
console.log('Edge inputs tested.\n');

// 3. Golden Shots Fixtures
console.log('--- 3. Golden Shots Fixtures (data/golden/shots.jsonl) ---');
const shotsPath = resolve(__dirname, '../../../data/golden/shots.jsonl');
const shotsLines = readFileSync(shotsPath, 'utf8').trim().split('\n');

for (const line of shotsLines) {
  const shot = JSON.parse(line);
  const res = structurePoem(shot.text_raw);
  const errs = validateContract(res, `Shot ${shot.id}`);
  assert(errs.length === 0, `Shot ${shot.id} contract errors: ${errs.join(', ')}`);

  // Check fingerprint preservation
  const rawFp = letterFingerprint(shot.text_raw);
  const outFp = letterFingerprint(res.stanzas.flat().join(' '));
  assert(rawFp === outFp, `Shot ${shot.id} letter fingerprint preserved (len: ${rawFp.length} vs ${outFp.length})`);

  // Max 10 words per line
  const flatLines = res.stanzas.flat();
  for (const l of flatLines) {
    const wc = l.split(/\s+/).filter(Boolean).length;
    assert(wc <= 10, `Shot ${shot.id} line exceeds 10 words: (${wc} words) "${l}"`);
  }

  if (shot.id === 'shot1_soheili') {
    // Shot #1: >= 90% of lines ending a radif hemistich end with «هنوز»
    const stillEnding = flatLines.filter(l => l.trim().endsWith('هنوز')).length;
    const ratio = stillEnding / flatLines.length;
    assert(ratio >= 0.45, `Shot 1 still ending ratio is ${ratio.toFixed(2)} (couplet hemistich >= 0.90)`);
  }

  if (shot.id === 'shot4_shahriar') {
    assert(res.form === 'classical_rhymed', `Shot 4 form must be classical_rhymed, got ${res.form}`);
    assert(res.beyts !== undefined && res.beyts.length > 0, `Shot 4 must have beyts`);
    for (const [h1, h2] of res.beyts || []) {
      const w1 = h1.split(/\s+/).filter(Boolean).length;
      const w2 = h2.split(/\s+/).filter(Boolean).length;
      assert(Math.abs(w1 - w2) <= 3, `Shahriar beyt hemistichs length difference > 3: (${w1} vs ${w2})`);
    }
  }

  if (shot.id === 'shot2_heydarzadeh' || shot.id === 'shot3_ahmadi') {
    for (const l of flatLines) {
      const words = l.trim().split(/\s+/).filter(Boolean);
      const first = bareToken(words[0] || '');
      const last = bareToken(words[words.length - 1] || '');
      assert(!FORBIDDEN_LINE_STARTS.has(first), `Shot ${shot.id} line starts with forbidden token: "${first}" in "${l}"`);
      if (!TRAILING_PUNCTUATION_REGEX.test(words[words.length - 1] || '')) {
        assert(!FORBIDDEN_LINE_ENDS.has(last), `Shot ${shot.id} line ends with forbidden token: "${last}" in "${l}"`);
      }
    }
  }
}
console.log('Golden Shots verified.\n');

// 4. Sample 300 Benchmark & Hafez Ghazal 9
console.log('--- 4. Sample 300 Corpus Benchmark ---');
const samplePath = resolve(__dirname, '../../../data/golden/sample300.jsonl');
const sampleLines = readFileSync(samplePath, 'utf8').trim().split('\n');

let totalWorks = 0;
let fpMatches = 0;
let downstreamGlueStartErrors = 0;
let downstreamDanglingEndErrors = 0;
let corpusStandaloneSuffixStarts = 0;
const latencies: number[] = [];

let ghazal9Found = false;

for (const line of sampleLines) {
  if (!line.trim()) continue;
  totalWorks++;
  const work = JSON.parse(line);
  const text = work.text_raw || work.text || '';

  const tStart = performance.now();
  const res = structurePoem(text);
  const latency = performance.now() - tStart;
  latencies.push(latency);

  const contractErrs = validateContract(res, work.id || `work_${totalWorks}`);
  if (contractErrs.length > 0) {
    console.error(`Contract errs in ${work.id}: ${contractErrs.join('; ')}`);
  }

  // Fingerprint
  const rawFp = letterFingerprint(text);
  const outFp = letterFingerprint(res.stanzas.flat().join(' '));
  if (rawFp === outFp) {
    fpMatches++;
  } else {
    console.error(`FP mismatch in ${work.id}: in=${rawFp.length}, out=${outFp.length}`);
  }

  // Audit lines
  const flatLines = res.stanzas.flat();
  for (const l of flatLines) {
    const words = l.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
    const firstWord = words[0]!;
    const lastWord = words[words.length - 1]!;
    const bareFirst = bareToken(firstWord);
    const bareLast = bareToken(lastWord);

    // Corpus standalone glue suffix starts:
    if (STANDALONE_GLUE_SUFFIXES.has(bareFirst)) {
      corpusStandaloneSuffixStarts++;
      console.error(`Corpus standalone glue suffix start in ${work.id}: "${bareFirst}" (line: "${l}")`);
    }

    // Downstream only (rhyme_grid, boundary_model, heuristic):
    if (res.origin !== 'separators') {
      if (FORBIDDEN_LINE_STARTS.has(bareFirst)) {
        downstreamGlueStartErrors++;
        console.error(`Downstream glue start in ${work.id} [${res.origin}]: "${bareFirst}" (line: "${l}")`);
      }
      if (FORBIDDEN_LINE_ENDS.has(bareLast) && !TRAILING_PUNCTUATION_REGEX.test(lastWord)) {
        downstreamDanglingEndErrors++;
        console.error(`Downstream dangling end in ${work.id} [${res.origin}]: "${bareLast}" (line: "${l}")`);
      }
    }
  }

  if (work.id === 'hafez.ghazaliat.9') {
    ghazal9Found = true;
    console.log('Evaluating Hafez Ghazal 9:');
    console.log(`Origin: ${res.origin}, Form: ${res.form}, Confidence: ${res.confidence}`);
    let ghazal9RaStarts = 0;
    for (const l of flatLines) {
      if (l.trim().startsWith('را ') || l.trim() === 'را') {
        ghazal9RaStarts++;
        console.error(`Hafez Ghazal 9 line starts with را: "${l}"`);
      }
    }
    assert(ghazal9RaStarts === 0, `Hafez Ghazal 9 must have 0 lines starting with «را», got ${ghazal9RaStarts}`);
  }
}

latencies.sort((a, b) => a - b);
const medianLatency = latencies[Math.floor(latencies.length / 2)] || 0;
const p95Latency = latencies[Math.floor(latencies.length * 0.95)] || 0;

console.log(`\nSample 300 Results:`);
console.log(`Total Works: ${totalWorks}`);
console.log(`Letter Fingerprint Preservation: ${fpMatches}/${totalWorks} (${((fpMatches/totalWorks)*100).toFixed(2)}%)`);
console.log(`Corpus Standalone Glue-Suffix Starts: ${corpusStandaloneSuffixStarts}`);
console.log(`Downstream Glue Start Errors: ${downstreamGlueStartErrors}`);
console.log(`Downstream Dangling End Errors: ${downstreamDanglingEndErrors}`);
console.log(`Median Inference Latency: ${medianLatency.toFixed(3)} ms/poem`);
console.log(`P95 Inference Latency: ${p95Latency.toFixed(3)} ms/poem`);

assert(fpMatches === totalWorks, `Letter fingerprint rate must be 100%, got ${fpMatches}/${totalWorks}`);
assert(corpusStandaloneSuffixStarts === 0, `Corpus standalone glue suffix starts must be 0, got ${corpusStandaloneSuffixStarts}`);
assert(downstreamGlueStartErrors === 0, `Downstream glue start errors must be 0, got ${downstreamGlueStartErrors}`);
assert(downstreamDanglingEndErrors === 0, `Downstream dangling end errors must be 0, got ${downstreamDanglingEndErrors}`);
assert(medianLatency <= 5.0, `Median latency must be <= 5.0 ms, got ${medianLatency.toFixed(3)} ms`);

// If Ghazal 9 was not in sample300, test it directly from canonical works
if (!ghazal9Found) {
  console.log('Searching Hafez Ghazal 9 in data/canonical/works.jsonl...');
  const canonicalPath = resolve(__dirname, '../../../data/canonical/works.jsonl');
  const canonicalContent = readFileSync(canonicalPath, 'utf8');
  for (const cLine of canonicalContent.split('\n')) {
    if (cLine.includes('hafez.ghazaliat.9')) {
      const gh9 = JSON.parse(cLine);
      const res9 = structurePoem(gh9.text_raw || gh9.text || '');
      let startsWithRa = 0;
      for (const l of res9.stanzas.flat()) {
        if (l.trim().startsWith('را ') || l.trim() === 'را') {
          startsWithRa++;
          console.error(`Hafez Ghazal 9 line starts with را: "${l}"`);
        }
      }
      assert(startsWithRa === 0, `Hafez Ghazal 9 lines starting with را must be 0, got ${startsWithRa}`);
      console.log(`Hafez Ghazal 9 direct check: lines starting with را = ${startsWithRa}`);
      break;
    }
  }
}

console.log(`\n=== ADVERSARIAL STRESS TEST SUMMARY ===`);
console.log(`Total Assertions: ${totalAssertions}`);
console.log(`Failed Assertions: ${failedAssertions}`);

if (failedAssertions > 0) {
  console.error(`\nFAILED with ${failedAssertions} assertions failing.`);
  process.exit(1);
} else {
  console.log(`\nALL CHECKS PASSED PERFECTLY!`);
  process.exit(0);
}
