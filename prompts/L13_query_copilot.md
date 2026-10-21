# L13 — Natural-language corpus queries + research prompt library (`packages/query`, tab `ask`, `prompts/research`) · class S · mode: normal
Read `_COMMON.md`. Ask in Persian, get deterministic results — the model never writes poetry or interpretations.

## `parseQuery` (rule-based, no LLM required)
Parse Persian queries into `QueryFilters` (`contracts/research.ts`): poet aliases (reuse the alias map), form names (غزل، رباعی، مثنوی، قصیده، نیمایی، شعر سپید)، meter names (from L4's table), `ردیف «X»`، `قافیه`، eras («قرن هفتم»، «پیش از ۱۳۰۰»), tags, free text. Return `explain` in Persian echoing what was understood («غزل‌های حافظ با ردیف «را»») and `confidence`; ambiguous → ask a single clarifying choice in the UI, never guess silently. Examples to unit-test (≥ 25): «غزل‌های سعدی در بحر هزج»، «شعرهای نیما درباره شب»، «رباعی‌هایی که ردیف دارند».
## Optional LLM translator (off by default)
BYO-key, key kept in memory only, provider-agnostic fetch. The model's only output is a JSON `QueryFilters` validated by schema; anything else is discarded. It never receives or returns poem text. Warn plainly about key handling.
## MCP additions (`packages/mcp`, additive)
New tool `query_corpus(filters)` returning ids + metadata; tool descriptions written for LLM clarity.
## `prompts/research/` (Persian, 10 files ≤ 250 words each)
Ready prompts scholars paste into their own assistant with the MCP server connected: compare a word's usage across three poets; collect all ghazals sharing a radif; trace an image («آینه») across eras; build a reading list for a seminar; check a quotation's attribution; draft (not publish) a methods paragraph from measured stats. Each prompt tells the assistant to cite work ids and never to invent verses.
**Done (T1):** ≥ 25 parse tests green; `query_corpus` appears in the MCP tool list test; prompts present.
