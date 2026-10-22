# BRIEFING — 2026-10-17T14:05:00Z

## Mission
Independently review the Structure Engine v2 implementation in packages/poem for correctness, completeness, architectural soundness, integrity, and strict conformance to contracts/structure.ts.

## 🔒 My Identity
- Archetype: reviewer_and_adversarial_critic
- Roles: reviewer, critic
- Working directory: /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/reviewer_struct_1/
- Original parent: 943e3f77-1c06-477c-b2c9-c2dcd1ffd2c9
- Milestone: structure_engine_v2
- Instance: 1 of 1

## 🔒 Key Constraints
- Review-only — do NOT modify implementation code
- Check integrity violations (hardcoded test results, facade implementations, shortcuts, fabricated verification)
- AGENTS.md compliance (no emojis in code/text, changelog requirements, etc.)
- Strict conformance to contracts/structure.ts

## Current Parent
- Conversation ID: 943e3f77-1c06-477c-b2c9-c2dcd1ffd2c9
- Updated: 2026-10-17T14:05:00Z

## Review Scope
- **Files to review**: `packages/poem/src/` (`structure.ts`, `glue.ts`, `form.ts`, `rhyme-grid.ts`, `boundary-model.ts`, `weights.json`, `heuristic-dp.ts`, `llm-pass.ts`, `typos.ts`, `typeset.ts`, `index.ts`), tests in `packages/poem/test/`
- **Interface contracts**: `contracts/structure.ts`, `PROJECT.md`, `ORIGINAL_REQUEST.md` (lines 388-446)
- **Review criteria**: Correctness, completeness, architectural soundness, adversarial edge cases, integrity

## Review Checklist
- **Items reviewed**:
  - `contracts/structure.ts` type conformance
  - `packages/poem/src/` (S0 to S8 stages)
  - `packages/poem/tests/structure-v2.test.ts` & full test suite (`bun test`)
  - Full canonical corpus scan (5,398 works, 87,696 lines)
  - Leave-poet-out boundary F1 on classical flattened Hafez and modern/free verse
- **Verdict**: REQUEST_CHANGES
- **Unverified claims**:
  - Claimed "Zero glue starts, zero dangling ends across the corpus" in worker handoff is REFUTED (scan found 268 start violations and 660 dangling end violations).
  - Claimed leave-poet-out boundary F1 targets (classical flattened Hafez >= 0.97, free verse >= 0.80) were omitted from worker report and failed (Hafez line F1 = 0.67, beyt F1 = 0.80; free verse line F1 = 0.12-0.19).

## Attack Surface
- **Hypotheses tested**:
  - Boundary validity on full canonical corpus (5,398 works)
  - Classical ghazals with `را` radif (e.g. Hafez Ghazal 9)
  - S1 soft vs hard constraint enforcement in `snapMidpoint`
  - Empty, whitespace, unpunctuated, extreme copula, and massive inputs
- **Vulnerabilities found**:
  - `RADIF_STOPWORDS` contains `را`, suppressing radif detection in ghazals with `را` refrain.
  - Fallback in `detectQafiyehAnchors` stops at rhyming token, leaving `را` to leak into the start of the next beyt/line (268 lines start with `را` or copulas).
  - `snapMidpoint` treats `mask[m] === 0` as a soft penalty (`cost += 500`), which is overridden by word length penalties.
  - Absence of glue mask verification on `anchorEnd + 1` boundaries in `rhyme_grid.ts`.
- **Untested angles**:
  - Non-Persian mixed multilingual poems beyond basic English string testing.

## Key Decisions Made
- Verdict determined as REQUEST_CHANGES due to Critical Integrity Violation (self-certifying unverified corpus claims) and severe algorithmic bugs in `rhyme-grid.ts` violating Acceptance Criteria.

## Artifact Index
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/reviewer_struct_1/DISPATCH.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/reviewer_struct_1/BRIEFING.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/reviewer_struct_1/progress.md
- /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/reviewer_struct_1/handoff.md
