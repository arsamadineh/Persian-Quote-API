# L5 — Workbench shell (`apps/workbench`) · class M · mode: teamwork lane
Read `_COMMON.md`. A static, offline-first, no-login PWA that bundles the engine; the API is optional. It is what professors and students actually open.

## Build
1. **Stack:** Vite + Preact (or equivalent ≤ 10 KB runtime). Initial JS ≤ 250 KB gzip excluding data packs. Decide in 5 lines in STATUS.md; no long ADR.
2. **Tab registry:** implement `contracts/workbench.ts`. Tabs are **auto-discovered** with `import.meta.glob('./tabs/*/tab.ts', { eager: true })` sorted by `order`, so other lanes add a folder and never edit a shared file (this prevents merge conflicts). Provide `ctx` (`corpus`, `t`, `openWork`). Ship stub tabs only for: home, reader, search, kwic, freq, rhyme-finder.
3. **Public pack:** at build time produce a brotli'd, per-poet chunked pack of the public-domain classical corpus + prebuilt search index; lazy-load chunks; optional "download full offline pack" button; content-hashed filenames; version shown in the footer.
4. **Private corpus mode (the rights-safe superpower):** drag-drop or File System Access API (folder picker where supported, `<input multiple>` fallback) for `.txt` (headings = poet/title; blank-line or `*` = stanza), `.jsonl`, `.csv`. Pipeline in a Web Worker pool: parse → `structurePoem` → build index → persist to IndexedDB/OPFS. Banner: «متن‌های شما از این دستگاه خارج نمی‌شوند». Show per-file result (added / flagged low-confidence) and open flagged items in the review tab if present.
5. **Workspace file:** export/import everything (private corpus, annotations, class packs) as one `.pqw` file (zip via `CompressionStream`/tiny zip writer) — local-first "sync".
6. **PWA:** service worker (hand-written, ~80 lines): precache shell, runtime-cache pack chunks, versioned cleanup, offline fallback page. Install prompt.
7. **UX:** RTL-first, Vazirmatn subset, dark/light, `Ctrl K` command palette across tabs, keyboard-first, Persian digits toggle, Jalali dates via `Intl` (`fa-IR-u-ca-persian`), `Intl.Segmenter('fa')` as baseline tokenizer where available, view transitions where supported. WCAG 2.2 AA basics: focus rings, labels, contrast, `prefers-reduced-motion`.
8. **Tools in stub tabs:** search (existing engine), KWIC (`kwic`), word-frequency (`wordFreq`) — call the implementations from `packages/tools` once L6 lands (stub with the contract until then).

## Done (T1)
Measured once and printed: private corpus of 5,000 lines ingests + indexes in ≤ 3 s on a mid laptop; search ≤ 50 ms p95; a scripted check passes with the network disabled (cached pack + private corpus still work); initial JS size. Tab auto-discovery test: adding a dummy folder registers a tab.
