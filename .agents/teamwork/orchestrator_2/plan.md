# Operational Plan — Structure Engine v2

## Goal
Implement Structure Engine v2 in `packages/poem` conforming to `contracts/structure.ts` (`structurePoem`), fixing line break leakage, detached prefixes/suffixes, and misaligned radif/rhymes across classical and modern Persian verse.

## Phase 0: Survey & Specification Reconnaissance
1. Spawn 3 exploratory agents (Spec Miner + Explorers) to analyze:
   - `contracts/structure.ts` and API surface.
   - Current state of `packages/poem`, `packages/persian`, `packages/schema`.
   - Test suites, behavioral fixtures (`data/golden/shots.jsonl`), benchmark (`data/golden/sample300.jsonl`), legacy goldens.
   - Constraints R1-R22, AGENTS.md rules, and performance budgets.
2. Synthesize findings and produce `PROJECT.md` with detailed Feature Inventory and Interface Contracts.

## Phase 1: Implementation Iteration Loop (Milestone M-STRUCT)
1. Dispatch Worker with clear write ownership:
   - Implement `packages/poem` with stages S0 through S8.
   - Pure-TypeScript logistic regression with weights in `weights.json` for S4.
   - S1 Hard Glue constraints across all stages.
   - Classical rhyme grid (S3), modern boundary model (S4), heuristic fallback (S5), typo flags (S7), typeset layer (S8).
   - Unit tests, property tests, and fixture tests.
   - Update `lib/changelog.ts` conforming strictly to `AGENTS.md` (Farsi, semver, no emojis, active voice).
2. Dispatch Reviewers (2 independent reviewers) to inspect code, tests, and AGENTS.md compliance.
3. Dispatch Challengers (2 independent challengers) to empirically verify fixtures (`shots.jsonl`), corpus invariants, calibration error, and performance.
4. Dispatch Forensic Auditor (`teamwork_preview_auditor`) for integrity verification.
5. Gate Evaluation: all reviewers approve, challengers pass, auditor clean.

## Phase 2: Acceptance Criteria & Victory Claim
1. Verify all behavioral fixtures (Shots #1 to #4).
2. Verify all corpus invariants (0 standalone glue prefix/suffix, 100% letter-fingerprint preservation).
3. Verify model & performance metrics (F1 >= 0.97 classical Hafez, F1 >= 0.80 free verse, ECE <= 0.08, latency <= 5ms/poem).
4. Send final Victory Claim report to Sentinel with full verification evidence.
