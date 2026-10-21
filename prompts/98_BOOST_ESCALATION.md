# 98 — BOOST ESCALATION (use with `/boost`, one failing metric at a time)
Read `prompts/_COMMON.md` and the `NEEDS-BOOST` entry in `STATUS.md`. You are fixing ONE metric in ONE lane's owned paths.
1. Restate the metric, current value, target (from the lane file) in 3 lines.
2. Build a **fast, automatic check** for just that metric (≤ 10 s) if one does not exist; commit it.
3. Loop (max 5 iterations): form a hypothesis from the error cases (print 10 worst cases, ≤ 25 lines), change one thing, re-measure. Keep a one-line log per iteration in STATUS.md (`it3: F1 0.71→0.78 (added epiphora feature)`).
4. Keep a leakage guard: evaluation must remain leave-poet-out/held-out; never tune on the test fold.
5. Stop when the target is met or after 5 iterations. If not met, ship the best version behind its confidence flag, label the UI honestly (H7), and state the best measured value. Do not touch other lanes. Do not rewrite working stages.
Report ≤ 8 lines: metric before/after, iterations used, what changed, what still fails.
