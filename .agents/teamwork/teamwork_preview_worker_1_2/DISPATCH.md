# Dispatch: worker_1_2 (Milestone 1 Iteration 2 Remediation Worker)

## Context
You are worker_1_2. Your working directory is `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_worker_1_2/`.

## Mandatory Reading Before Starting Work
1. `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md`
2. `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/AGENTS.md`
3. `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_1/PROJECT.md`
4. Challenger 1_2 Handoff: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_challenger_1_2/handoff.md` (Defect reports)
5. Explorer 1_iter2_1 Handoff: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_iter2_1/handoff.md` (and `finglish_fix.patch`, `test_additions.patch`)
6. Explorer 1_iter2_2 Handoff: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_iter2_2/handoff.md` (Calendar date parsing fix and tests)
7. Explorer 1_iter2_3 Handoff: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_iter2_3/handoff.md` (Stemmer fix, cleaner letterFingerprint export, and tests)

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Detailed Remediation Tasks

### Task 1: Prototype Lookup Safety in `packages/persian/src/finglish.ts`
- Apply the defense-in-depth fix from `explorer_1_iter2_1`:
  - Define `POET_DICTIONARY`, `COMMON_WORDS`, and `SINGLE_MAP` using `Object.assign(Object.create(null), { ... })`.
  - Add typed helper `hasOwn<T extends object>(obj: T, prop: string): boolean { return Object.prototype.hasOwnProperty.call(obj, prop); }`.
  - Guard lookups in `transliterateWord` and `finglishQuery` using `hasOwn`.
- Update `packages/persian/test/finglish.test.ts` with tests for prototype properties (`__proto__`, `constructor`, `toString`, `valueOf`, etc.).
- Update `packages/persian/test/property.test.ts` to add Property 8b explicitly fuzzing prototype and magic property names.
- Verify: `bun test --rerun-each=50 packages/persian/test/property.test.ts` passes 50/50 without any failure.

### Task 2: Colophon & Little-Endian Date Parsing in `packages/persian/src/calendar.ts`
- Apply the fix from `explorer_1_iter2_2`:
  - Import `toAsciiDigits` from `./digits`.
  - In `parseJalaliDate(s: string)`:
    - Pre-normalize `s` using `toAsciiDigits(s)`.
    - Match using unified regex supporting both `YYYY/MM/DD` and Little-Endian `DD/MM/YYYY`:
      `/(?:^|\D)(?:(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})|(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4}))(?:\D|$)/`.
    - Validate year range `-61 <= year < 3178`, month range `1 <= month <= 12`, day range `1 <= day <= 31`.
- Update `packages/persian/test/calendar.test.ts` with comprehensive test cases (including Acceptance Fixture A1 `"تنکابن، 12/2/1364"`, Persian digits `"۱۳۶۴/۰۲/۱۲"`, `"۱۲/۲/۱۳۶۴"`, boundary years, and invalid inputs).

### Task 3: Stemmer Conservatism & Canonical `letterFingerprint`
- Apply the fix from `explorer_1_iter2_3`:
  - In `packages/persian/src/stemmer.ts`:
    - Add `PROTECTED_ROOTS` Set (e.g., `سلام`, `ایران`, `باران`, `آسمان`, `جهان`, `زمان`, `داستان`, `بوستان`, `گلستان`, `پیمان`, `امکان`, `قرآن`, `طوفان`, etc.).
    - Require ZWNJ for singular clitics (`‌ام`, `‌اش`), and require minimum stem length (>= 3) for suffixes without ZWNJ (`مان`, `تان`, `شان`, `ات`).
    - Preserve genuine plurals and possessives (`کتاب‌ها`, `درختان`, `دوستان`, `دست‌هایمان`, `می‌روم`).
  - In `packages/persian/src/cleaner.ts`:
    - Export canonical `letterFingerprint(s: string): string`:
      `s.replace(/[\s\u200c\u200e\u200f\u0640*\/]+/g, "")`.
  - In `packages/persian/src/index.ts`:
    - Re-export `letterFingerprint`.
- Update `packages/persian/test/stemmer.test.ts` and `packages/persian/test/cleaner.test.ts`.

### Task 4: Verification & Regulatory Governance
- Run verification commands:
  - `bun test --rerun-each=10 packages/persian/test/property.test.ts`: 10/10 pass.
  - `bun test --coverage packages/persian/test`: 100% function coverage, >= 99% line coverage.
  - `bun test`: All tests in repository pass with 0 failures.
  - `bun x tsc --noEmit`: Exits 0, 0 type errors.
  - `bun run build`: Next.js compiles all 16 static/dynamic routes with exit code 0.
- Update `docs/reports/phase-1.md` documenting the remediation.
- Update `docs/agent/PROGRESS.md`.
- Update `lib/changelog.ts` strictly following AGENTS.md:
  - Version: `"۳.۹.۱"` (Persian digits).
  - Date: Persian date (`"۲۵ مهر ۱۴۰۵"`).
  - `isoDate`: `"2026-10-16"`.
  - Type: `"fixed"`.
  - Fluent Persian active voice, zero emojis, zero AI clichés, zero vendor names.

Write your handoff report to `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_worker_1_2/handoff.md` and report back via send_message.

## 2026-10-16T04:18:17Z
Dispatched to execute remediation for Milestone 1 Iteration 2:
1. Fix prototype lookup crash in packages/persian/src/finglish.ts
2. Fix Little-Endian and Persian digits date parsing in packages/persian/src/calendar.ts
3. Fix stemmer conservatism in packages/persian/src/stemmer.ts, export canonical letterFingerprint
4. Verify with tests, coverage, tsc, and build
5. Update docs/reports/phase-1.md, docs/agent/PROGRESS.md, and lib/changelog.ts per AGENTS.md

