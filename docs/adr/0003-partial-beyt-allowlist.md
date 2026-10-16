# ADR-0003: Partial Beyt Allowlist for Three Hafez Fragments

Date: 2026-10-16
Status: Accepted

## Context

Legacy `hafez.json` contains three single-couplet fragments with an empty second hemistich (`""`): legacy IDs 3, 139, 260 (second occurrences). They fail `z.string().min(1)` and violate the classical 2-hemistich invariant.

## Decision

- Filter empty hemistichs (whitespace/structure-only fix) and keep the remaining single-hemistich line as a one-line stanza.
- Keep all three fragments in canonical data (`hafez.ghazaliat.3`, `hafez.ghazaliat.139`, `hafez.ghazaliat.260`) to avoid data loss.
- Record each filtering event in `data/quarantine/manifest.json` with reason `empty_hemistich_filtered`.
- Exempt exactly these three canonical IDs from the 2-hemistich validator and structure F1 classical count. All other 4184 Hafez beyts must have exactly two hemistichs.

## Consequences

- Migration completes without dropping records.
- Validation and evaluation explicitly document the three exceptions instead of silently passing.
