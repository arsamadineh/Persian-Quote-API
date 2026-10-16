# BRIEFING — 2026-10-16T04:47:30Z

## Mission
Investigate linguistic over-stemming in packages/persian/src/stemmer.ts, export letterFingerprint in cleaner.ts, formulate protective rules/exceptions for root words, and design test cases.

## 🔒 My Identity
- Archetype: explorer
- Roles: linguistic investigation, over-stemming fix design, letterFingerprint export, test design
- Working directory: /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_iter2_3
- Original parent: 36a26c83-596a-4fe8-89a5-2517d3502ad1
- Milestone: iter2_3 linguistic over-stemming investigation & fix formulation

## 🔒 Key Constraints
- Read-only investigation — do NOT implement directly in source
- Investigate packages/persian/src/stemmer.ts ("سلام" -> "سل", "ایران" -> "ایر", "باران" -> "بار")
- Export canonical letterFingerprint in packages/persian/src/cleaner.ts
- Protect core Persian root words while preserving genuine plural/possessive stemming
- Design test cases

## Current Parent
- Conversation ID: 36a26c83-596a-4fe8-89a5-2517d3502ad1
- Updated: 2026-10-16T04:47:30Z

## Investigation State
- **Explored paths**:
  - `packages/persian/src/stemmer.ts`: analyzed `NOMINAL_SUFFIXES` regexes, minimum stem length, and `[خسشف]$` restoration
  - `packages/persian/src/cleaner.ts`: analyzed `cleanLine` vs `letterFingerprint` invariants, Unicode Tatweel, bidi, and control marks
  - `packages/persian/test/stemmer.test.ts` & `cleaner.test.ts`: verified existing test suites and gaps
  - `data/legacy/`: tested `letterFingerprint` across all 5,398 poems and quotes
- **Key findings**:
  - `ام` and `اش` without ZWNJ in `NOMINAL_SUFFIXES` caused `سلام -> سل`, `پیام -> پی`, `پاداش -> پاد`. In Persian, possessive enclitics without ZWNJ are `-م` and `-ش`, never `-ام` or `-اش`. Requiring ZWNJ fixes all `...ام` and `...اش` roots.
  - Suffix `ان` stripped core nouns (`ایران`, `باران`, `آسمان`, `جهان`, `زمان`, `دیوان`). Suffix `تان` stripped `-ستان` roots into `داست`, `بوست`, `گلست`, `زمست`.
  - Introduced `PROTECTED_ROOTS` Set covering proper nouns, core nouns, `-ستان` words, adjectives, and roots ending in affix-like sequences.
  - Export canonical `letterFingerprint` in `cleaner.ts` stripping `[\s\u200c\u200e\u200f\u200b\ufeff\u202a-\u202e\u0640*\/]+`.
  - Verified 140/140 unit tests, fast-check idempotency over 1,000 runs, and legacy corpus invariance over 5,398 items.
- **Unexplored areas**: None within the scope of this investigation.

## Key Decisions Made
- Formulated exact drop-in replacements: `proposed_stemmer.ts` and `proposed_cleaner.ts`.
- Generated unified patch files: `stemmer.patch` and `cleaner.patch`.
- Created comprehensive verification suites: `test_proposed_suite.test.ts` (14 unit tests) and `test_stemmer_fix.ts` (140 assertions).

## Artifact Index
- DISPATCH.md — incoming instructions
- BRIEFING.md — persistent working memory
- progress.md — liveness heartbeat
- proposed_stemmer.ts — proposed replacement for packages/persian/src/stemmer.ts
- proposed_cleaner.ts — proposed replacement for packages/persian/src/cleaner.ts
- stemmer.patch — unified diff patch for stemmer.ts
- cleaner.patch — unified diff patch for cleaner.ts
- test_stemmer_fix.ts — comprehensive 140-word and fast-check test script
- test_proposed_suite.test.ts — proposed unit test additions
- handoff.md — final analysis and recommendations report
