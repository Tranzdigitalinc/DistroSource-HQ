# Gaming recurring catalog report

## Result

The deterministic catalog pipeline currently produces 100 differentiated
recurring Gaming plans. All plans remain preview-only and require real future
deliverables or published eligibility assignments before checkout can be
enabled.

The 10-plan benchmark covered FiveM Vault, FiveM MLO, FiveM UI, FiveM Server
Owner, Minecraft Vault, Minecraft Maps, Minecraft Plugins, Server Branding,
Gaming Credits and Pick & Keep. Covers and supporting entitlement previews
were inspected as a contact sheet before the full audit was accepted.

## Required counts

| Metric | Count |
| --- | ---: |
| Subscription products with completed descriptions | 100 |
| Subscription products with full What You Get sections | 100 |
| Products with completed cover images | 100 |
| Products with 4+ gallery images | 100 |
| Images generated | 500 |
| Images rendered deterministically | 500 |
| Images regenerated after quality failure | 500 |
| Products still missing final visuals | 0 |
| Products whose descriptions depend on future deliverables | 100 |

The regeneration corrected invalid translucent fills and duplicate image
content detected by the first automated audit. The accepted set contains 500
unique 1600×1000 WebP files.

## Fungies provisioning status

The importer is implemented and dry-run validated. It maps each DistroSource
plan to one Fungies `Subscription` product, one plan, and two recurring offers
(monthly and annual). All remote products are locked to `DRAFT`; stable
external IDs and a local checkpoint prevent duplicate creation on a retry.

No live Fungies or Blob writes have been made because this execution
environment does not contain `FUNGIES_PUBLIC_KEY`, `FUNGIES_SECRET_KEY`,
`FUNGIES_PROJECT_ID`, or `BLOB_READ_WRITE_TOKEN`, and its Fungies dashboard
browser session is signed out.

## Verification

- Catalog audit: passed, zero errors.
- Fungies importer dry run: passed, zero external requests.
- TypeScript: passed.
- ESLint: passed with five pre-existing warnings and zero errors.
- Next.js production build: passed, including 100 recurring-plan routes.
- Local browser verification: blocked by the environment because the managed
  browser cannot reach localhost and its Chrome download timed out. Production
  compilation and static route generation completed successfully.
