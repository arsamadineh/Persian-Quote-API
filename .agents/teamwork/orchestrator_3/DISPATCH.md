# DISPATCH: orchestrator_3 (Successor Generation 3)

## Mission
You are the generation 3 Project Orchestrator for Structure Engine v2 (`contracts/structure.ts`, `packages/poem`).
Your parent is Sentinel (Conversation ID: `8253285b-f602-4911-9919-c40e2e86707b`).

All fixes from Iteration 2 have been implemented by `worker_struct_iter2` and verified:
- S0 looksStructured length distribution & line break leakage repair
- S1 hard glue invariants strictly enforced across all downstream stages (0 glue errors on sample300)
- S2 prose check reordered before radif/qafiyeh, radifs ending in forbidden line ends disqualified
- S3 classical rhyme grid drop-in with radif «را» enabled, midpoint snap mask invariant, anchor clitic absorption
- S4 modern boundary model DP joint log-likelihood with break transition prior beta = 2.2
- S8 typeset single-pass lookbehind regex (0.503ms, ReDoS eliminated, negative constraint on «می» preserved)
- lib/changelog.ts updated to version "۳.۱۷.۱" adhering to AGENTS.md

## Immediate Mandate: Gate 2 Verification
1. Start your heartbeat cron (`schedule(CronExpression="*/10 * * * *")`).
2. Concurrently dispatch Gate 2 verification agents (5 agents):
   - `reviewer_struct_iter2_1` (`teamwork_preview_reviewer`): Architecture, Types, Contracts (`contracts/structure.ts`, `packages/poem/src/`).
   - `reviewer_struct_iter2_2` (`teamwork_preview_reviewer`): Linguistic correctness, S1 invariants, AGENTS.md compliance, `lib/changelog.ts`.
   - `challenger_struct_iter2_1` (`teamwork_preview_challenger`): Golden behavioral fixtures (Shots 1-4 in `data/golden/shots.jsonl`), corpus invariants (100% letter preservation, 0 standalone glue-suffix line starts).
   - `challenger_struct_iter2_2` (`teamwork_preview_challenger`): Benchmark & Performance (latency <= 5ms across sample300, Platt calibration ECE <= 0.08, boundary F1 scores).
   - `auditor_struct_iter2_1` (`teamwork_preview_auditor`): Forensic integrity audit (zero hardcoded strings/cheating, genuine S0-S8 algorithms, AGENTS.md rules).
3. Evaluate Gate 2 verdicts in `GATE_STATUS.md`. Pass criteria: ALL reviewers APPROVE, challengers APPROVE, auditor CLEAN.
4. On Gate PASS: Synthesize all verification metrics and report the final Victory Claim to Sentinel (`8253285b-f602-4911-9919-c40e2e86707b`).

Read your predecessor's soft handoff:
`/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_2/handoff.md`
And worker handoff:
`/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/worker_struct_iter2/handoff.md`
