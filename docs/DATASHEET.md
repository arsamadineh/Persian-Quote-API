# Persian Quote API — Data Sheet

## 1. Overview

**Name:** Persian Quote API (`pq.arsamadineh.ir`)  
**Version:** ۳.۱۳.۰  
**Release date:** ۲۵ مهر ۱۴۰۵ (2026-10-17)  
**License:** Code: MIT; Content: Public Domain / Educational Fair Use (per poet)  
**URL:** https://pq.arsamadineh.ir  
**Repository:** https://github.com/arsamadineh/Persian-Quote-API  

## 2. Purpose

A freely accessible, open-source platform for the retrieval, analysis, and citation
of Persian literary texts. Target users are researchers in Persian literature,
digital humanities, computational linguistics, and developers integrating Persian
verse into applications.

## 3. Corpus composition

| Source | Records | Description | Rights |
|---|---|---|---|
| Divan-e Hafez | 497 ghazals | Complete Divan of Khwaje Shams al-Din Muhammad Hafez Shirazi (Qazvini-Ghani edition) | Public Domain |
| Shereno | 4,400 poems | Modern Persian poetry (Nima Yushij, Sohrab Sepehri, Ahmad Shamlou, and others) | Mixed (see rights audit) |
| Classical quotes | 7 couplets | Curated classical verses (Ferdowsi, Rumi, Saadi, Hafez) | Public Domain |
| Aphorisms | 494 quotes | Non-poetic sayings and apothegms | Mixed |
| **Total** | **5,398 works** | | |

## 4. Data model

Canonical records use stable hierarchical identifiers of the form
`poet-slug.collection-slug.number` (e.g. `hafez.ghazaliat.1`). Each record
contains stanzas (matrix of hemistichs), plain text, colophon (place, Jalali and
Gregorian date), meter, radif/qafiyeh, attribution, rights, tags, excerpt, and
provenance metadata.

## 5. Access

- REST API: `/v1/works`, `/v1/works/{id}`, `/v1/daily`, `/v1/fal`, `/v1/search`, `/v1/poets`, `/v1/rhymes`, etc.
- Legacy compatibility: `/api/quotes` family preserved unchanged.
- Web Component: `<persian-quote>` for third-party embedding.
- MCP server: `/mcp` (Streamable HTTP and stdio).
- TypeScript SDK: `@persian-quote/sdk-ts` with origin failover and offline mode.

## 6. Rights and provenance

A full rights audit is published at `docs/audit/rights-audit.csv`. Each poet is
labelled `public_domain` or `copyright_verified` with a display policy of
`full` or `excerpt`. Legacy data is preserved byte-identical under `data/legacy/`
with SHA-256 checksums. Quarantined records are isolated under `data/quarantine/`
with machine-readable reason codes.

## 7. Contact

arsam@arsamadineh.ir
