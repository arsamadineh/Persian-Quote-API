# L11 — Stylometry lab (`packages/style`, tab `style`) · class S · mode: teamwork lane (small)
Read `_COMMON.md`. سبک‌شناسی made interactive and honest.
1. **Profiles** (`StyleProfile`, `contracts/research.ts`): per poet, top-300 most-frequent words (relative freq) + char 3-gram profile + rhyme/radif stats + line-length stats. Build at pipeline time for the public pack; build on demand in a worker for private corpora.
2. **Burrows' Delta** (z-scored MFW) and a char-n-gram cosine as a second opinion.
3. **Tools:** (a) poet similarity matrix + dendrogram (hierarchical clustering, average linkage) for chosen poets; (b) PCA scatter of poems colored by poet (Canvas2D); (c) `attribute(text)`: nearest poets by Delta with bootstrap confidence; **below 200 words return «متن برای نتیجه‌گیری کوتاه است»** instead of an answer.
4. **Validation (measure and print):** leave-one-poem-out attribution accuracy among the 10 largest classical poets, per text-length band (≤100, 100–300, >300 words); a plain statement of when the tool is unreliable (short texts, imitation, shared genre conventions).
5. UI: every result carries confidence and the limits line (H7); explain Delta in two plain Persian sentences.
**Done (T1):** accuracy table printed; attribute returns the abstain message on short input; dendrogram/PCA render in a DOM test.
