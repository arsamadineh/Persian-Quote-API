## 2026-10-16T03:17:37Z

# Task Assignment: Phase 1 packages/persian Architecture & Property Testing Exploration

## Context
You are subagent `teamwork_preview_explorer_1_3` (Type: `teamwork_preview_explorer`).
Working directory: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_3/`
Project root: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API`
Original request: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md`
Project scope: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_1/PROJECT.md`

## Mission
Investigate and design `packages/persian` (WS2):
1. Read `ORIGINAL_REQUEST.md` (WS2, R13, Section 5, reference code in Section 7).
2. Design complete API surface for `packages/persian`:
   - `normalizeDisplay(s)`: Unicode NFC, preserve diacritics/ezafe, clean typography.
   - `normalizeSearch(s)`: Fold Arabic yeh/kaf/alef, strip diacritics, unify ZWNJ.
   - `cleanLine(s)`: Strip invisible marks (`\u200e\u200f`), collapse whitespace, fix punctuation spacing (no space before `، ؛ ؟ ! . : ) »`), single space after punctuation when followed by non-space/digit/punctuation.
   - `tokenize(s)`: Persian-aware word segmentation respecting ZWNJ.
   - `lightStem(word)`: Affix stripping (`می-`, `نمی-`, `-ها`, `-هایم`, `-تر`, `-ترین`, etc.).
   - `toAsciiDigits(s)` / `toPersianDigits(s)`: Persian (`۰-۹`), Arabic (`٠-٩`), ASCII (`0-9`).
   - `jalaliToGregorian(y, m, d)` / `gregorianToJalali(y, m, d)`: Accurate bidirectional calendar math without external dependencies.
   - `bidiIsolate(s)`: Bidirectional text isolation.
   - `finglishQuery(s)`: Phonetic transliteration from romanized Persian (e.g. `hafez` -> `حافظ`).
   - `fuzzyMatch(a, b)`: Levenshtein distance optimized for Persian strings.
3. Formulate testing strategy for >= 90% branch coverage:
   - Unit test suites covering all edge cases.
   - Property-based tests using `fast-check`: idempotency (`f(f(x)) === f(x)`), reversibility, crash-resistance on arbitrary Unicode strings.
4. Formulate the exact implementation plan for the worker.

## Deliverable
Write your recommendations to `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_3/handoff.md` and report back via `send_message`.
