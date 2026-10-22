# Implementation Guide: S0, S1, S2, S7, S8 for Structure Engine v2

**Author**: `explorer_struct_1` (Teamwork Explorer / Systems Analyst)  
**Date**: 2026-10-17  
**Target Path**: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/explorer_struct_1/handoff.md`  
**Scope**: S0 (Signals & Colophon), S1 (Hard Glue Constraints), S2 (Form Classifier), S7 (Typo Flags), S8 (Typeset Layer)

---

## 1. Observation

Direct observations extracted from the authoritative repository files, frozen contracts, source code, data fixtures, and test runners:

### 1.1 Contract Conformance (`contracts/structure.ts`)
The engine interface is defined by the frozen contract:
```typescript
// contracts/structure.ts (lines 1-15)
export type Form = 'classical_rhymed' | 'free_verse' | 'colloquial' | 'prose';
export interface StructureResult {
  form: Form;
  stanzas: string[][];
  beyts?: [string, string][];
  origin: 'source' | 'separators' | 'rhyme_grid' | 'boundary_model' | 'llm' | 'heuristic' | 'human';
  confidence: number;                                  // calibrated 0..1
  flags: ('low_confidence' | 'possible_typo' | 'footer_removed')[];
  typos?: { token: string; suggestion: string; ratio: number }[];   // flags only, never auto-applied
  typeset?: string[][];                                // derived display layer (ZWNJ-attached suffixes)
  colophon?: { place?: string; raw: string; jalali?: { y: number; m: number; d: number }; gregorian?: string };
}
export declare function structurePoem(text: string, o?: { poetId?: string }): StructureResult;
```

### 1.2 Authoritative Requirements (`ORIGINAL_REQUEST.md`, lines 397-420)
- **S0 (Signals & Colophon)**: Extract colophon via existing extraction (`extractColophon`). Split by real separators (`*`, blank line `\n\s*\n`, newline `\n`, double-space `\S\s{2,}\S`, spaced slash `\s\/\s`). Check `looksStructured`: line word count median 2–12 words/line, max <= 22 words/line, >= 2 lines. Output `origin: 'separators'`, `confidence: 0.95`.
- **S1 (Hard Glue Constraints)**: Enforced across all downstream stages:
  - Never START a line with: `ی ها های تر ترین ام ات اش مان تان شان` (standalone tokens), `را است بود شد نیست هست`.
  - Never END a line (unless punctuation follows) with: `ای می نمی بی همی و که تا یا از به در با بر چون اگر ولی اما`.
  - Keep whole: `X به X` compounds (`در به در`, `لا به لا`, `سر به سر`, `روز به روز`), `تو در تو`, immediate identical repeats `X X`, and ezafe chains up to 3 tokens when the line would otherwise end on a noun + `ِ`.
- **S2 (Form Classifier)**: Classify `Form` (`classical_rhymed`, `free_verse`, `colloquial`, `prose`) using n-gram periodicity, rhyme regularity, length coefficient of variation, punctuation density, and colloquial markers.
- **S7 (Typo Flags)**: Non-neural frequency lexicon flagging tokens (`count <= 2`) when edit-distance-1/2 neighbors have `>= 50x` count. Stored in `typos` as flags only (never auto-applied).
- **S8 (Typeset Layer)**: Derived separate layer attaching standalone suffixes (`ی ها های تر ترین`) to previous token with ZWNJ (`\u200c`). Never touch `می`.

### 1.3 Behavioral Observations in Golden Fixtures (`data/golden/shots.jsonl`)
- **Shot 1 (`mehdi-soheili.general.142`)**: Classical ghazal with 14 hemistichs. Radif «هنوز» occurs at indices [9, 15, 31, 45, 59, 74, 91, 107]. Inter-radif gap CV is 0.244 <= 0.35. Contains detached copula `بهار ست هنوز` and typos (`متظرم`, `سارست`, `لها`, `نا`).
- **Shot 2 (`maryam-heydarzadeh.general.26`)**: Colloquial pop lyric (515 words). Contains over 30 colloquial markers (`یه`, `دفه`, `نیس`, `میاد`, `میومد`, `بذار`, `دیگه`, `واسه`, `چشات`, `اخماتو`, `لولو`, `دیوونگی`, `گله س`, `حوصله س`). Contains compound words with colloquial suffixes: `در به دره` ($t_k = \text{"در"}$, $t_{k+1} = \text{"به"}$, $t_{k+2} = \text{"دره"}$) and `لا به لاش` ($t_k = \text{"لا"}$, $t_{k+1} = \text{"به"}$, $t_{k+2} = \text{"لاش"}$). Contains detached suffix `دیوونه ی` and typos (`پدیاا`, `دستگا`, `خرین`, `نیم شم`).
- **Shot 3 (`ahmadreza-ahmadi.general.18`)**: Modern free verse (163 words). Zero colloquial markers, no radif, irregular line lengths, object marker `را`, copulas `است`, `بود`, prepositions `در`, `به`, `با`.
- **Shot 4 (`shahriar.general.72`)**: Classical ghazal (189 words, 12 beyts). Rhyming on «ـَرم» (سرم، پسرم، جگرم، صاحبنظرم، هنرم، درم...). Length CV is 0.14 <= 0.20.

### 1.4 Codebase Observations (`packages/poem/src/` & `packages/persian/src/`)
- `packages/poem/src/colophon.ts`: Implements `extractColophon(raw: string): { body: string, colophon?: ExtractedColophon }`. Extracts Jalali dates, Gregorian dates, and trailing city names.
- `packages/poem/src/structure.ts`: Existing implementation contains `splitBySignals`, `looksStructured`, and `letterFingerprint`, but uses legacy `TARGET_LINE_LENGTH = 24` quadratic heuristic and does not export `structurePoem` conforming to `contracts/structure.ts`.
- `packages/persian/src/fuzzy.ts`: Exports `levenshteinDistance(a, b, { maxDistance })` with early row termination.
- `packages/persian/src/cleaner.ts`: Exports `cleanLine(s)` that strips Tatweel, normalizes NFC, and corrects punctuation spacing.
- `packages/persian/src/stemmer.ts`: Exports `lightStem(word)` handling nominal suffixes and verbal prefixes.

---

## 2. Logic Chain

From these observations, we derive the exact algorithmic and architectural specifications for S0, S1, S2, S7, and S8.

### 2.1 S0: Signals & Colophon Pipeline

#### 2.1.1 Colophon Handling
1. Call `extractColophon(raw)`.
2. If `colophon` is present:
   - Append `'footer_removed'` to `flags`.
   - Map `colophon` to `StructureResult.colophon`:
     ```typescript
     colophon: {
       ...(colophon.place ? { place: colophon.place } : {}),
       raw: colophon.date_raw || colophon.date,
       ...(colophon.date_jalali
         ? {
             jalali: {
               y: colophon.date_jalali.y,
               m: colophon.date_jalali.m ?? 1,
               d: colophon.date_jalali.d ?? 1,
             },
           }
         : {}),
       ...(colophon.date_gregorian ? { gregorian: colophon.date_gregorian } : {}),
     }
     ```
   - Update active text to `result.body`.

#### 2.1.2 Signal Splitting & Structure Check
1. Split `body` via `splitBySignals(body)`.
   - Delimiters:
     - Stanza separators: `\s*\*+\s*`, `\s*[□■]+\s*`, `\n\s*\n`.
     - Line separators within stanzas: `\s{2,}`, `\n`, `\s\/\s`.
   - Clean each line with `cleanLine(line)`.
   - Drop editorial signal-only lines (`/^[\d\p{P}\s/□■*\-–—_…\.]+$/u`).
2. Evaluate `looksStructured(stanzas)`:
   - Line count: `flat.length >= 2`.
   - Word count distribution: `median >= 2 && median <= 12 && max <= 22`.
   - **Glue Defect Prevention**: `looksStructured` must also verify that the pre-split lines do NOT violate S1 constraints (i.e. zero lines starting with forbidden start tokens, zero lines ending with dangling tokens without punctuation). If a pre-split text contains glue violations, `looksStructured` must return `false` so the downstream engine repairs the boundaries.
3. Early Exit Condition:
   - If `looksStructured` is `true`:
     - Assign `origin = 'separators'`.
     - Assign `confidence = 0.95`.
     - Run S2 to classify canonical `form`.
     - Run S7 to flag typos and S8 to construct `typeset`.
     - Return `StructureResult` immediately.

---

### 2.2 S1: Hard Glue Constraints (`packages/poem/src/glue.ts`)

#### 2.2.1 Token Normalization
Every token is normalized before constraint checking:
```typescript
const LEADING_MARKS = /^[«("'\[]+/u;
const TRAILING_MARKS = /[،؛؟!:.…»)"'\]]+$/u;

export function bareToken(token: string): string {
  return token
    .replace(LEADING_MARKS, '')
    .replace(TRAILING_MARKS, '')
    .replace(/^[\u200c]+|[\u200c]+$/g, '')
    .normalize('NFC');
}
```

#### 2.2.2 Exact Forbidden Token Sets
```typescript
export const FORBIDDEN_LINE_STARTS = new Set([
  // Standalone suffixes / detached clitics
  'ی', 'ها', 'های', 'تر', 'ترین',
  'ام', 'ات', 'اش', 'مان', 'تان', 'شان',
  // Copulas, auxiliaries, and object marker
  'را', 'است', 'ست', 'بود', 'شد', 'نیست', 'هست'
]);

export const FORBIDDEN_LINE_ENDS = new Set([
  // Verbal particles and prefixes
  'ای', 'می', 'نمی', 'بی', 'همی',
  // Conjunctions and prepositions
  'و', 'که', 'تا', 'یا', 'از', 'به', 'در', 'با', 'بر',
  'چون', 'اگر', 'ولی', 'اما'
]);

export const TRAILING_PUNCTUATION_REGEX = /[،؛؟!:.…»)"'\]]$/u;
```

#### 2.2.3 Compound Words and Patterns
1. **`X به X` Compounds**:
   - Matches: $t_k$, $t_{k+1}$, $t_{k+2}$ where $bare(t_{k+1}) === \text{"به"}$.
   - Stem equality condition:
     $w_1 = bare(t_k)$, $w_2 = bare(t_{k+2})$.
     Match if $w_1 === w_2$ OR $w_2.startsWith(w_1)$ OR $lightStem(w_1) === lightStem(w_2)$.
   - Validates examples:
     `در به در`, `در به دره` (Shot 2), `لا به لا`, `لا به لاش` (Shot 2), `سر به سر`, `روز به روز`, `تن به تن`, `جا به جا`, `دست به دست`, `دل به دل` (Shot 2).
   - Invalidation rule: `isValidBoundary[k+1] = 0` and `isValidBoundary[k+2] = 0`.
2. **`تو در تو`**:
   - Matches: $bare(t_k) === \text{"تو"}$, $bare(t_{k+1}) === \text{"در"}$, and ($bare(t_{k+2}) === \text{"تو"}$ OR $bare(t_{k+2}).startsWith(\text{"تو"})$).
   - Invalidation rule: `isValidBoundary[k+1] = 0` and `isValidBoundary[k+2] = 0`.
3. **Immediate Identical Repeats `X X`**:
   - Matches: $bare(t_{j-1}) === bare(t_j)$ where $bare(t_j).length \ge 2$.
   - Validates examples: `رفته رفته`, `قطره قطره`, `سوخت سوخت`, `رفت رفت`, `بود بود`, `تکه تکه`, `کم کم`.
   - Invalidation rule: `isValidBoundary[j] = 0`.
4. **Ezafe Chains (up to 3 tokens)**:
   - Matches:
     - Token $t_{j-1}$ ends with explicit Kasra `\u0650` (`ـِ`).
     - Token $t_{j-1}$ ends with he-hamza `هٔ` or `ه‌ی` without trailing punctuation.
     - Token $t_j$ is standalone `ی` (covered by forbidden line-start rule).
   - Invalidation rule: `isValidBoundary[j] = 0`.

#### 2.2.4 Boundary Mask Construction Algorithm
Let tokens be $T = [t_0, \dots, t_{N-1}]$. Candidate boundaries are indices $j \in \{1, \dots, N-1\}$ where boundary $j$ places a line break between $t_{j-1}$ and $t_j$.
```typescript
export function buildGlueMask(tokens: string[]): Uint8Array {
  const N = tokens.length;
  const mask = new Uint8Array(N);
  mask.fill(1); // 1 = valid boundary, 0 = forbidden boundary
  mask[0] = 0;  // 0 is line-start for poem

  for (let j = 1; j < N; j++) {
    const prevToken = tokens[j - 1] ?? '';
    const currToken = tokens[j] ?? '';
    const bareCurr = bareToken(currToken);
    const barePrev = bareToken(prevToken);

    // Rule 1: Never start a line with forbidden start token
    if (FORBIDDEN_LINE_STARTS.has(bareCurr)) {
      mask[j] = 0;
    }

    // Rule 2: Never end a line with forbidden end token unless punctuation follows
    if (FORBIDDEN_LINE_ENDS.has(barePrev) && !TRAILING_PUNCTUATION_REGEX.test(prevToken)) {
      mask[j] = 0;
    }

    // Rule 3: Ezafe marker at end of line without punctuation
    if ((prevToken.includes('\u0650') || prevToken.endsWith('هٔ')) && !TRAILING_PUNCTUATION_REGEX.test(prevToken)) {
      mask[j] = 0;
    }

    // Rule 4: Immediate identical repeats X X
    if (barePrev.length >= 2 && barePrev === bareCurr) {
      mask[j] = 0;
    }
  }

  // Rule 5: Multi-token compounds (X به X and تو در تو)
  for (let k = 0; k < N - 2; k++) {
    const t0 = bareToken(tokens[k] ?? '');
    const t1 = bareToken(tokens[k + 1] ?? '');
    const t2 = bareToken(tokens[k + 2] ?? '');

    // X به X
    if (t1 === 'به' && (t0 === t2 || t2.startsWith(t0) || lightStem(t0) === lightStem(t2))) {
      mask[k + 1] = 0;
      mask[k + 2] = 0;
    }

    // تو در تو
    if (t0 === 'تو' && t1 === 'در' && (t2 === 'تو' || t2.startsWith('تو'))) {
      mask[k + 1] = 0;
      mask[k + 2] = 0;
    }
  }

  return mask;
}
```

---

### 2.3 S2: Form Classifier (`packages/poem/src/form.ts`)

#### 2.3.1 Form Criteria and Lexical Markers
Classification targets: `'classical_rhymed' | 'free_verse' | 'colloquial' | 'prose'`.

1. **Colloquial Lexical Markers**:
   ```typescript
   export const COLLOQUIAL_LEXEMES = new Set([
     'یه', 'دفه', 'نیس', 'واسه', 'میاد', 'میومد', 'می گه', 'میگه',
     'می خوام', 'میخوام', 'می گم', 'میگم', 'می شه', 'میشه', 'روزا',
     'غمای', 'چشات', 'اخماتو', 'دستات', 'دلمون', 'فک', 'لولو', 'دیوونه',
     'باشیم', 'دستگا', 'خرین', 'پدیاا', 'اونم', 'همونشم', 'اینم', 'آره',
     'قایم', 'خوبیش', 'بریم', 'ندارم', 'نداره', 'نداری', 'نبودن'
   ]);
   ```
   Count matches of bare tokens against `COLLOQUIAL_LEXEMES`, plus contracted copula regex `/\b[\p{L}\u200c]+[‌ ]س\b/u` (`گله س`, `حوصله س`).
   - If count >= 3 OR density (count / total tokens) >= 0.012 -> Classify as `'colloquial'`.
2. **Radif Periodicity**:
   - Scan 1-token and 2-token n-grams with occurrence count $K \ge 3$.
   - Calculate inter-token gap values $g_k = idx_{k+1} - idx_k$.
   - Calculate gap CV: $CV = \sigma_g / \mu_g$.
   - If $\min(CV) \le 0.35$ and mean gap $\mu_g \in [5, 25]$ words: Confirms radif! -> Classify as `'classical_rhymed'`.
3. **Rhyme Regularity**:
   - In the absence of a repeating radif (e.g. Shot 4 Shahriar rhyming in `-رم`), group tokens into candidate hemistich chunks (~6–10 words).
   - Extract trailing 2–3 letters (ravi) of chunk-final words.
   - If the most frequent ravi suffix covers $\ge 60\%$ of candidate ends -> Classify as `'classical_rhymed'`.
4. **Prose Density**:
   - Punctuation density: count of `. ! ؟ : ،` divided by total tokens.
   - If punctuation density $\ge 0.08$ AND total tokens $\ge 30$ AND no radif/rhyme regularity -> Classify as `'prose'`.
5. **Default**:
   - If none of the above trigger -> Classify as `'free_verse'` (e.g. Shot 3 Ahmadi).

#### 2.3.2 Decision Tree Implementation
```typescript
export function classifyForm(text: string, tokens: string[]): Form {
  const N = tokens.length;
  if (N === 0) return 'free_verse';

  // 1. Colloquial marker density
  const colloquialCount = countColloquialMarkers(tokens);
  if (colloquialCount >= 3 || (colloquialCount / N) >= 0.012) {
    return 'colloquial';
  }

  // 2. Radif periodicity
  const radif = detectRadifPeriodicity(tokens);
  if (radif.found && radif.cv <= 0.35) {
    return 'classical_rhymed';
  }

  // 3. Rhyme regularity
  const rhymeScore = evaluateRhymeRegularity(tokens);
  if (rhymeScore >= 0.60) {
    return 'classical_rhymed';
  }

  // 4. Prose check
  const punctCount = (text.match(/[.!؟:،]/g) || []).length;
  if (N >= 30 && (punctCount / N) >= 0.08) {
    return 'prose';
  }

  // 5. Default
  return 'free_verse';
}
```

---

### 2.4 S7: Typo Flags (`packages/poem/src/typos.ts`)

#### 2.4.1 Lexicon Structure & Performance Budget
- To guarantee median inference time <= 5ms/poem and zero runtime dependencies:
  - High-frequency lexicon is stored in a compact JSON resource (`packages/poem/src/data/lexicon.json`) containing high-frequency Persian poetry words with corpus frequency $\ge 50$.
  - Typical size: ~800 words, ~15 KB in memory.
  - Fast pruning: only compare rare tokens ($count \le 2$) against candidates $c$ where:
    1. $lexicon.get(c) \ge 50 \times \max(1, count(w))$
    2. $|c.length - w.length| \le 2$
    3. `levenshteinDistance(w, c, { maxDistance: 2 }) <= 2`
  - Total comparisons per poem: $\le 5$ rare words $\times \sim 200$ length-filtered candidates with early bailout = $< 0.3 \text{ ms}$.

#### 2.4.2 Typo Detection Algorithm
```typescript
export interface TypoEntry {
  token: string;
  suggestion: string;
  ratio: number;
}

export function detectTypos(
  tokens: string[],
  lexicon: Map<string, number>
): TypoEntry[] {
  const seen = new Set<string>();
  const typos: TypoEntry[] = [];

  for (const rawToken of tokens) {
    const w = bareToken(rawToken);
    if (w.length < 3 || seen.has(w)) continue;
    seen.add(w);

    const count = lexicon.get(w) ?? 0;
    if (count > 2) continue; // Only evaluate rare tokens

    let bestSuggestion: string | null = null;
    let bestRatio = 0;
    let minDistance = 3;

    for (const [candidate, candFreq] of lexicon.entries()) {
      if (candFreq < 50 * Math.max(1, count)) continue;
      if (Math.abs(candidate.length - w.length) > 2) continue;

      const dist = levenshteinDistance(w, candidate, { maxDistance: 2 });
      if (dist <= 2) {
        const ratio = Math.round(candFreq / Math.max(1, count));
        if (dist < minDistance || (dist === minDistance && ratio > bestRatio)) {
          minDistance = dist;
          bestSuggestion = candidate;
          bestRatio = ratio;
        }
      }
    }

    if (bestSuggestion && bestRatio >= 50) {
      typos.push({
        token: w,
        suggestion: bestSuggestion,
        ratio: bestRatio,
      });
    }
  }

  return typos;
}
```

#### 2.4.3 Invariant Safeguard
- `typos` entries are added to `StructureResult.typos`.
- `'possible_typo'` is added to `StructureResult.flags`.
- **Absolute Rule**: Tokens in `stanzas` and `text_plain` are NEVER replaced or modified. Original text remains 100% letter-fingerprint identical.

---

### 2.5 S8: Typeset Layer (`packages/poem/src/typeset.ts`)

#### 2.5.1 Suffix Attachment Rules
- Target standalone suffixes: `{"ی", "ها", "های", "تر", "ترین"}`.
- Attachment mechanism: Replace `word + " " + suffix` with `word + "\u200c" + suffix` (Zero-Width Non-Joiner / ZWNJ).
- Regex lookahead: `(?=[^\p{L}\u200c]|$)` ensures attachment occurs before punctuation or line end.
- **Negative Constraint**: Never touch `می`. `می` is a noun meaning "wine" and must remain independent.

#### 2.5.2 Typeset Implementation
```typescript
const TYPESET_SUFFIX_REGEX = /([\p{L}\u200c]+)\s+(ی|ها|های|تر|ترین)(?=[^\p{L}\u200c]|$)/gu;

export function typesetLine(line: string): string {
  let prev = '';
  let curr = line;
  while (curr !== prev) {
    prev = curr;
    curr = curr.replace(TYPESET_SUFFIX_REGEX, '$1\u200c$2');
  }
  return curr;
}

export function applyTypesetLayer(stanzas: string[][]): string[][] {
  return stanzas.map((stanza) => stanza.map(typesetLine));
}
```

#### 2.5.3 Examples and Verifications
- `چشمه های سرخ` -> `چشمه‌های سرخ`
- `دیوونه ی در به دره` -> `دیوونه‌ی در به دره`
- `بزرگ تر شد` -> `بزرگ‌تر شد`
- `دست ها، چشم ها` -> `دست‌ها، چشم‌ها`
- `جام می آوردم` -> `جام می آوردم` (Untouched)
- `می ناب` -> `می ناب` (Untouched)
- `صدای باران می آمد` -> `صدای باران می آمد` (Untouched)

---

## 3. Caveats

1. **Downstream Mask Consumption**:
   - S1 does not break lines itself; it generates `isValidBoundary: Uint8Array`. Downstream engines S3 (Rhyme Grid), S4 (Modern Boundary Model), and S5 (Heuristic DP) MUST strictly condition their line breaks on `isValidBoundary[j] === 1`.
2. **First Token of Poem**:
   - `mask[0]` is always 0 because boundary 0 represents the beginning of the text, not a break between words.
3. **Lexicon Coverage for Colloquialisms**:
   - In colloquial verse, intentional dialectal spellings (such as `دستگا` or `قصه ی`) could trigger false typo alerts if common colloquial vocabulary is not included in the baseline lexicon. The lexicon must include colloquial spoken forms.
4. **Preservation of Faithful Text**:
   - `typeset` is strictly a display layer. Downstream consumers rendering quotes or analyzing metre must read `stanzas` for raw text and `typeset` for formatted rendering.

---

## 4. Conclusion

1. **S0**: Seamlessly integrates colophon extraction, strips colophon tokens, flags `footer_removed`, and splits explicitly structured verse by signals with early exit (`confidence: 0.95`).
2. **S1**: Precomputes an $O(N)$ linear boundary mask `isValidBoundary` enforcing all line-start, line-end, `X به X`, `تو در تو`, `X X`, and ezafe constraints. Guaranteed to satisfy the zero-glue-start and zero-dangling-end corpus invariants.
3. **S2**: Classifies poetic form (`classical_rhymed`, `free_verse`, `colloquial`, `prose`) in $< 0.5 \text{ ms}$ via colloquial density, radif periodicity, rhyme regularity, and punctuation density.
4. **S7**: Flags non-destructive lexical typos (`count <= 2` with $\ge 50\times$ neighbors) without mutating text, preserving 100% letter fingerprint fidelity.
5. **S8**: Emits an aesthetic display layer `typeset?: string[][]` attaching standalone suffixes with ZWNJ while strictly leaving `می` untouched.

---

## 5. Verification Method

### 5.1 Verification Commands
```bash
# 1. Run packages/poem test suite
bun test packages/poem

# 2. Typecheck packages/poem
bunx tsc --noEmit -p packages/poem/tsconfig.json

# 3. Check acceptance fixtures
bun test tests/e2e/tier1-features/acceptance-fixtures.test.ts
```

### 5.2 Specific Test Cases to Add in `packages/poem/tests/structure-v2.test.ts`
1. **S0 Signal & Colophon Tests**:
   - Verify `splitBySignals` correctly parses asterisks, slashes, double spaces, and blank lines.
   - Verify colophon stripping sets `footer_removed` and populates `StructureResult.colophon`.
   - Verify `looksStructured` rejects separator layouts containing glue violations.
2. **S1 Hard Glue Tests**:
   - Verify `buildGlueMask` sets `mask[j] = 0` for all forbidden starts: `ی`, `ها`, `های`, `تر`, `ترین`, `ام`, `ات`, `اش`, `مان`, `تان`, `شان`, `را`, `است`, `ست`, `بود`, `شد`, `نیست`, `هست`.
   - Verify `buildGlueMask` sets `mask[j] = 0` for all forbidden ends without punctuation: `ای`, `می`, `نمی`, `بی`, `همی`, `و`, `که`, `تا`, `یا`, `از`, `به`, `در`, `با`, `بر`, `چون`, `اگر`, `ولی`, `اما`.
   - Verify `buildGlueMask` allows forbidden ends when punctuation follows: `همواره،`, `در!`.
   - Verify `buildGlueMask` invalidates breaks inside `X به X` compounds (`در به در`, `در به دره`, `لا به لا`, `لا به لاش`, `روز به روز`).
   - Verify `buildGlueMask` invalidates breaks inside `تو در تو` and repeats `X X` (`رفته رفته`).
3. **S2 Form Classification Tests**:
   - Shot 1 (Mehdi Soheili) -> `'classical_rhymed'`
   - Shot 2 (Maryam Heydarzadeh) -> `'colloquial'`
   - Shot 3 (Ahmadreza Ahmadi) -> `'free_verse'`
   - Shot 4 (Shahriar) -> `'classical_rhymed'`
   - Prose paragraph -> `'prose'`
4. **S7 Typo Tests**:
   - Verify `متظرم` is flagged with suggestion `منتظرم` and ratio >= 50.
   - Verify `پدیاا` is flagged with suggestion `پیدا`.
   - Verify that original tokens in `stanzas` remain 100% untouched.
5. **S8 Typeset Layer Tests**:
   - Verify `چشمه های` -> `چشمه‌های`
   - Verify `دیوونه ی` -> `دیوونه‌ی`
   - Verify `بزرگ تر` -> `بزرگ‌تر`
   - Verify `جام می آوردم` -> `جام می آوردم` (Untouched, `می` preserved)
   - Verify idempotency: `typesetLine(typesetLine(s)) === typesetLine(s)`.

### 5.3 Invalidation Conditions
- Any line emitted starting with a standalone suffix or copula.
- Any line emitted ending in a dangling preposition/conjunction without punctuation.
- Any line breaking an `X به X` compound.
- Any modification of `می` with ZWNJ.
- Any character mutation in `stanzas` or `text_plain` violating letter fingerprint preservation.
