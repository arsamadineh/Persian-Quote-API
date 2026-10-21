# Data paper (English)

## Problem
Persian poem structure is often stored as flat text, losing line breaks.

## Data and provenance
Canonical corpus: 5398 works, 45 poets, 59 collections, migrated and validated.

## Methods
Eight-stage structure engine with glue constraints, rhyme grid, boundary model. Letter fingerprint preserved at 1.0000.

## Evaluation
See papers/facts.json: structure F1 per form, ECE 0.0622, verse identification hit@1 1.00, 206 echoes.

## Limitations
Free-verse line breaks are artistic, not deterministic. Derived features carry confidence. Short texts unsuitable for attribution.

## Availability
Single binary, Docker, static bundle. Checksums published.

## Citation
See CITATION.cff.
EOF