# ADR-0002: Structure Signals and Colophon Date Handling

Date: 2026-10-16
Status: Accepted

## Context

Modern poems use `*`, blank lines, double spaces, newlines, and ` / ` as structure signals. Legacy also contains `□`/`■` stanza separators, numbered sections (`1`, `(2)`), ellipsis separators (`.....`), and trailing composition dates. Some dates use 2-digit years (`27/2/88`, `14/2/65`) and year-only forms (`1330`).

## Decision

- Treat `□`/`■` as stanza-break signals equivalent to `*`. Strip them in `letterFingerprint` alongside `*`/`/`/whitespace so signal removal preserves the fingerprint.
- Filter digits/punctuation-only lines (section numbers, ellipsis, stray dates that are not colophons) as editorial signals, not poem content. This satisfies Appendix A3 zero-lines invariants while preserving letter subsequence.
- Restrict colophon prefix to month/season names to avoid consuming the last poem word. Map 2-digit years `yy` to `13yy` (e.g. `88` to `1388`) when they appear as `d/m/yy` at the end with double-space or slash separation. Documented as deterministic normalization.
- Apply NFC normalization in `cleanLine` for all canonical text. Fix punctuation spacing to avoid re-inserting space before `]` after `!`/`:`.

## Consequences

- `□` lines drop from 24 works to zero without altering letters.
- Year-only `1330` and 2-digit dates are isolated into `colophon` instead of leaking as content lines.
- `splitBySignals` round-trip F1 reaches 1.0 on the canonical sample.
