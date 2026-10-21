# L12 — Semantic atlas + offline semantic search (`packages/semantic`, `pipeline/semantic`, tab `atlas`) · class XL · mode: normal first; `/boost` if the proxy gate or latency gate fails
Read `_COMMON.md`. «جست‌وجو با حس و مفهوم، آفلاین» — the demo that makes people lean forward. It must degrade gracefully: if no model fits the size budget, ship atlas + precomputed "similar poems" and keep lexical search.

## 1. Pick the model by measurement (≤ 60 lines of evidence, no essay)
Candidates (verify availability, license, ONNX/transformers.js support today): small multilingual retrieval embedders (e.g. multilingual-e5-small/base, bge-m3 quantized, EmbeddingGemma, Qwen3-Embedding-0.6B). Criteria: int8 size ≤ 120 MB for browser use; Persian quality on a **proxy set** you build: (a) a hemistich retrieves its own beyt-mate; (b) a tag/theme query retrieves tagged works (weak labels, flagged weak). Metric: nDCG@10 and Recall@50. Pick the best that fits; record the table in STATUS.md (one line per model).

## 2. Pipeline
Embed per **beyt/stanza** (and per work as mean), int8-quantize, store as one binary + id table. Precompute top-20 neighbours per item. 2D coordinates via UMAP (python `umap-learn` offline or `umap-js`), cluster with HDBSCAN/k-means, label clusters by c-TF-IDF top words (filter stop-formulas). Deterministic seeds.

## 3. Client
- **Atlas:** Canvas2D (WebGL optional) scatter with a quadtree for hover/click on ≤ 50k points, zoom/pan, color by poet/form/era/cluster, cluster labels, click → open work, «مشابه این» button using precomputed neighbours.
- **Semantic search (optional download):** query embedded in-browser (transformers.js / ONNX Runtime Web; WebGPU if available else WASM; model cached in OPFS, downloaded only on user consent with size shown). Fuse with lexical via Reciprocal Rank Fusion. **If the model is absent or fails → lexical only, and say so.**
- Provider interface `EmbedProvider` (`contracts/research.ts`) so a server-side embedder can be plugged in later.

## Gates (measure and print)
Proxy nDCG@10 and Recall@50 for lexical vs semantic vs hybrid; query→results latency after warm model (target ≤ 400 ms on a mid laptop; report the real number); model download size; atlas frame time at 50k points (target ≥ 30 fps; report); offline check (airplane mode after download). Misses twice → NEEDS-BOOST.
H7 label: «نتایج معنایی تقریبی‌اند؛ برای ارجاع علمی از متن اصلی استفاده کنید.»
