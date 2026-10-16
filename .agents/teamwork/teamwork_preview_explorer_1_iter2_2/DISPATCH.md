# Dispatch: explorer_1_iter2_2 (Calendar & Colophon Date Parsing Explorer)

## Context
You are explorer_1_iter2_2. Your working directory is `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_iter2_2/`.

## Mandatory Reading
1. `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/ORIGINAL_REQUEST.md` (Appendix A Fixture A1 colophon date: `"تنکابن، 12/2/1364"`)
2. `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/orchestrator_1/PROJECT.md`
3. Challenger 1_2 Handoff: `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_challenger_1_2/handoff.md` (Read Section 1.4, 2.2, 4.2)

## Defect Investigation
In `packages/persian/src/calendar.ts`, `parseJalaliDate` only parses Big-Endian `YYYY/MM/DD` format:
`const m = s.match(/(?:^|\D)(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:\D|$)/);`
This fails on:
- Little-Endian `DD/MM/YYYY` format (`"12/2/1364"` as in Acceptance Fixture A1) -> returns `null`.
- Strings with Persian digits (`"۱۳۶۴/۰۲/۱۲"` or `"۱۲/۲/۱۳۶۴"`) -> returns `null` because `\d` doesn't match Persian numerals without pre-normalization.

## Your Task
1. Investigate `packages/persian/src/calendar.ts` and `packages/persian/test/calendar.test.ts`.
2. Formulate the exact fix:
   - Call `toAsciiDigits(s)` first to convert Persian/Arabic numerals to ASCII.
   - Support both `YYYY/MM/DD` and `DD/MM/YYYY` formats cleanly.
   - Validate year range (-61 to 3178), month range (1 to 12), and day range (1 to 31).
3. Formulate test cases in `packages/persian/test/calendar.test.ts` for `"12/2/1364"`, `"۱۳۶۴/۰۲/۱۲"`, `"۱۲/۲/۱۳۶۴"`, and invalid dates.
4. Write your detailed recommendations to `/home/arsam/Documents/work/Website/Webdev/Persian-Quote-API/.agents/teamwork/teamwork_preview_explorer_1_iter2_2/handoff.md` and report back via send_message.
