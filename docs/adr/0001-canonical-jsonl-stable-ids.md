# ADR-0001: Canonical Storage as JSONL with Stable Hierarchical IDs

Date: 2026-10-16
Status: Accepted

## Context

Legacy data lives in four JSON files (`hafez.json`, `shereno.json`, `poetry-quotes.json`, `non-poetry-quotes.json`) with transient numeric IDs. Hafez IDs are duplicated (IDs 3, 10, 139, 260 appear twice). Modern poems mix content with colophon dates, section numbers, and separator glyphs (`*`, `□`).

## Decision

- Emit canonical records as line-delimited JSON (`data/canonical/works.jsonl`, `poets.jsonl`, `collections.jsonl`) plus per-source shards for debugging.
- Assign stable IDs as `poet-slug.collection-slug.number` via per-collection counters, independent of legacy numeric IDs.
- Preserve full legacy-to-canonical mapping in `data/id-map.jsonl` with `legacy_source`, `legacy_id`, `legacy_index`, and `canonical_id`. Duplicate legacy IDs produce two mapping rows distinguished by `legacy_index`.
- Keep byte-identical legacy snapshots under `data/legacy/` with SHA-256 verification. Quarantine events go to `data/quarantine/` with machine-readable reason codes.

## Consequences

- Canonical IDs are stable across rebuilds as long as input order is preserved.
- Duplicate legacy IDs no longer collide.
- Downstream API, search, and citation layers can rely on hierarchical IDs.
