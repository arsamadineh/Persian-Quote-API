# Dispatch for teamwork_preview_challenger (challenger_struct_1)

## Mission
Adversarially challenge and empirically verify Structure Engine v2 against the 4 Golden Behavioral Fixtures (`data/golden/shots.jsonl`) and Corpus Invariants.

## Reference Inputs
- Authoritative Request: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md` (specifically lines 428-446)
- Golden Shots: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/data/golden/shots.jsonl`
- Implementation in `packages/poem/src/`

## Adversarial Verification Tasks
1. **Shot #1 (Mehdi Soheili)**:
   - Verify >= 90% of lines ending a hemistich end with «هنوز».
   - Verify all lines format to <= 10 words.
2. **Shot #4 (Shahriar)**:
   - Verify beyts have 2 hemistichs of near-equal length.
   - Verify all lines format to <= 10 words.
3. **Shots #2 & #3 (Maryam Heydarzadeh & Ahmadreza Ahmadi)**:
   - Verify ZERO lines start with glue tokens (`ی ها های تر ترین ام ات اش مان تان شان را است بود شد نیست هست`).
   - Verify ZERO lines end dangling (`ای می نمی بی همی و که تا یا از به در با بر چون اگر ولی اما`) without trailing punctuation.
   - Verify all lines format to <= 10 words.
4. **Corpus Invariants**:
   - Verify 100% letter-fingerprint preservation across all four shots.
   - Run adversarial fuzz/stress inputs (empty strings, single words, extreme punctuation, repeated tokens).
5. Issue an unambiguous verdict: **APPROVE** or **REQUEST_CHANGES**.

Write your complete adversarial report to:
`/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/challenger_struct_1/handoff.md`
When complete, send a message with your verdict and report path.

## 2026-10-17T13:38:44Z
You are challenger_struct_1.
Your working directory is /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/challenger_struct_1/
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/challenger_struct_1/DISPATCH.md
Read /home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md (specifically lines 428-446)
Empirically challenge and verify the 4 Golden Behavioral Fixtures in data/golden/shots.jsonl:
- Shot 1 (Soheili): >= 90% lines ending hemistich end with «هنوز», <= 10 words/line
- Shot 4 (Shahriar): beyts have 2 hemistichs of near-equal length, <= 10 words/line
- Shots 2 & 3: 0 glue start violations, 0 dangling end violations, <= 10 words/line
- Corpus invariants: 100% letter-fingerprint preservation rate
- Fuzz and edge case inputs

Issue an empirical challenge verdict: APPROVE or REQUEST_CHANGES.
Write your report to:
/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/challenger_struct_1/handoff.md
When finished, send a message with your verdict and report path.
