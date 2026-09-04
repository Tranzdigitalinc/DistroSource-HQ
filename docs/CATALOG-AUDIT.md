# DistroSource — Catalog Compliance Audit

Generated: 2026-09-04T03:43:06.772Z

Read-only audit of the production database. No data was modified.

## Totals

| Metric | Count |
|---|---|
| Total products | 350 |
| Published | 347 |
| Draft | 3 |
| Other status | 0 |
| Free products | 4 |

## assetStatus breakdown

| Value | Count |
|---|---|
| ready | 350 |

## rightsStatus breakdown

| Value | Count |
|---|---|
| original | 350 |

## sourceType breakdown

| Value | Count |
|---|---|
| distrosource_original | 350 |

## Classification

| Verdict | Count |
|---|---|
| PASS | 345 |
| NEEDS REVIEW | 3 |
| BLOCKER | 2 |

No product was unpublished or modified by this audit.

### BLOCKER — 2 product(s)

| id | slug | status | asset | rights | issues |
|---|---|---|---|---|---|
| 46 | `agency-bundle` | published | ready | original | BLOCKER: bundle has no own file and fulfilment does not expand bundle contents into entitlements — buyer receives nothing |
| 47 | `creator-bundle` | published | ready | original | BLOCKER: bundle has no own file and fulfilment does not expand bundle contents into entitlements — buyer receives nothing |

### NEEDS REVIEW — 3 product(s)

| id | slug | status | asset | rights | issues |
|---|---|---|---|---|---|
| 50 | `leo-bs-fashion-fashion-multi-purpose-prestashop-theme` | draft | ready | original | NEEDS REVIEW: preview image is hosted on a third-party marketplace CDN — incompatible with sourceType=distrosource_original unless rights are documented |
| 51 | `x-the-ultimate-wordpress-theme` | draft | ready | original | NEEDS REVIEW: preview image is hosted on a third-party marketplace CDN — incompatible with sourceType=distrosource_original unless rights are documented |
| 54 | `app-landing-page` | draft | ready | original | NEEDS REVIEW: preview image is hosted on a third-party marketplace CDN — incompatible with sourceType=distrosource_original unless rights are documented |

## Duplicate / near-duplicate titles

Exact duplicate names: 0

Near-duplicates (similarity > 0.75): 0

## Real activity

| Table | Rows |
|---|---|
| reviews | 0 |
| orders | 5 |
| orders_completed | 1 |
| orders_pending | 4 |
| orders_refunded | 0 |
| users | 6 |
| entitlements | 1 |
| support_tickets | 0 |
| download_events | 0 |
| categories | 37 |
| categories_departments | 7 |

## Possible demo / test data in production

Flagged for human review — heuristic only, these may be legitimate:

| Kind | id | Detail |
|---|---|---|
| user | 0v0jeI5TDBczauF2cZIWrawCGC3vH6gC | polar-e2e-test@example.com |
| order | 5 | polar-e2e-test@example.com |

## Public claims vs database

These are the numbers the storefront renders (hero, About). They come from
`getCatalogStats()`, which applies the same filter used here.

| Public claim | Real value |
|---|---|
| Products shown publicly | 347 |
| Categories shown publicly | 30 |
| Reviews | 0 |
| Average rating | 0.00 |

Reviews are zero, and the hero/About stat cards are already gated on
`reviewCount > 0`, so no rating is displayed. Correct behaviour.

## Caveat — asset reachability not proven

This audit confirms a `product_files` row exists and carries a blob
pathname. It does NOT confirm the object is present and readable in the
Blob store — that requires a per-file HEAD against Vercel Blob with the
store token. Products marked PASS here may still fail to deliver.
Run the blob reachability check separately before claiming fulfilment works.
