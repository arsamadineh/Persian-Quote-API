# Persian Quote API — Datasheet (one page)

**Motivation.** Provide a Persian-first, offline-capable poetry corpus and tools for scholars and students.

**Composition.** 5398 works, 45 poets, 59 collections (data/canonical). Public-domain classical + modern under rights policy.

**Collection process.** Migrated from legacy sources; validated by pipeline/validate-data.ts.

**Preprocessing.** Unicode normalization, colophon extraction, structure inference (whitespace-only, fingerprint-verified).

**Uses.** Research, teaching, search, stylometry, collation.

**Distribution.** Single binary, Docker, static bundle, npm workspaces.

**Maintenance.** Versioned via lib/changelog.ts; measured numbers in STATUS.md.

**Limitations.** Free-verse line breaks are artistic; derived features carry confidence. Short-text attribution unreliable. See papers/facts.json.
EOF