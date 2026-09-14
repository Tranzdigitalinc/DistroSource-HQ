# Gaming rebuild checkpoint — 2026-09-14

## Status

Audit in progress. No storefront implementation, product records, or images have been changed by this rebuild. No database mutations, payment-provider mutations, customer changes, or cleanup deletions have been performed. No benchmark is approved.

Recovery branch: `checkpoint/gaming-before-rebuild-20260914`
Recovery commit: `72b7ff373617bb43a8ef80a7f583497e16c41452`
Working branch: `rebuild/gaming-six-benchmarks`

The owner's approved scope is Gaming only. Build precisely six complete benchmark products with three final images each, deploy a review preview, then STOP. Only the owner's explicit APPROVED authorizes products 7–100. The eventual recurring catalog target is 100 meaningful offers (approximately 50 FiveM, 25 Minecraft, 15 community, 10 branding); do not generate that catalog now.

## Observed architecture

- Public Gaming routes: /gaming, /gaming/products, /gaming/fivem, /gaming/minecraft, /gaming/product/[slug].
- Gaming storefront accessors import the hardcoded GAMING_PRODUCTS array from lib/gaming/products.ts.
- lib/gaming/products.ts explicitly generates placeholder Tebex package IDs/URLs. Their existence is not evidence of a live product or deliverable.
- lib/gaming/queries.ts presents editorial bestseller/popular flags without sales evidence. The new storefront must not expose these as commerce claims.
- lib/gaming/types.ts contains a large GamingArt scene model. components/gaming/gaming-preview.tsx is an approximately 1,400-line illustration renderer.
- Existing card and gallery components fall back to that renderer.
- lib/gaming/images.ts resolves local, remote-proxied, and Blob paths. Existing imagery being present is not evidence of an actual resource screenshot.
- lib/db/schema.ts defines gaming_products, gaming_product_images, and gaming_categories, although docs/GAMING-ADMIN.md still describes a proposed table. Resolve this documentation/schema discrepancy before database work.
- The Gaming admin pages use the static accessors and are read-only.
- Fungies recurring functionality is a separate membership system: membership_plans, subscriptions, membership_credit_ledger. The ledger references general products/orders/entitlements. It does not establish Gaming-specific vault eligibility.
- Existing membership checkout and authoritative webhook handling must be retained. Do not map a new Gaming vault to a generic membership plan just to make a button work.
- app/account/library and existing download/entitlement handling are protected scope. Inspect integrations without changing customer rights.
- Gaming accessors are also consumed by the home teaser, global search, sitemap, and admin. Preserve their contracts or make minimal compatibility updates.
- Actual production Gaming purchases, rows, files, and entitlements have NOT been inspected. Never infer their absence from the static storefront.

## KEEP / REFACTOR / REMOVE

| Classification | Files / surface | Action |
| --- | --- | --- |
| KEEP | lib/fungies.ts; lib/actions/subscriptions.ts; app/api/webhooks/fungies; existing auth, checkout, customer/account and entitlement infrastructure | Preserve working payment behavior. No deletion or rewrite for this visual rebuild. |
| KEEP | lib/db/schema.ts financial/customer/subscription tables and all production data | No destructive schema or data changes. Read-only verification before any migration design. |
| KEEP | Existing Gaming product identifiers, slugs, real deliverables and purchase mappings | Inventory and preserve. Quarantine unsupported sales claims rather than destroying records. |
| REFACTOR | app/gaming public routes | Shared browse architecture with stable legacy URLs; distinct scoped platform/subscription views. |
| REFACTOR | lib/gaming/types.ts, products.ts, queries.ts | Explicit recurring terms, resource eligibility, deliverability and media provenance. Remove unsupported social proof from public presentation. |
| REFACTOR | Gaming product card, gallery, filters and category navigation | Image-first; useful factual facets; one cover and two supporting views for benchmarks. Video-ready media union without invented videos. |
| REFACTOR | lib/gaming/images.ts | Retain useful source resolution, but distinguish generated previews from verified captures. Responsive sizing. |
| REFACTOR | docs/GAMING-ADMIN.md and Gaming admin views | Reflect the actual static/DB boundary and readiness states accurately. |
| REMOVE after replacing all consumers | components/gaming/gaming-preview.tsx and obsolete scene metadata | Rejected illustration fallback must not become the new cover system. Admin also imports it; update those uses first. |
| REMOVE after replacing routes | gaming-hero.tsx, gaming-rail.tsx, gaming-trust-strip.tsx if no longer imported | Replace with the new layout and supportable fulfillment information. |
| REMOVE after dependency audit | scripts/gaming/render/*; smoke-render.mjs; smoke-three.mjs; diversity-check.mjs; verify-images.mjs | Old experimental image pipeline and its dedicated QA. Replace only the useful validation with a small benchmark validator. |
| REVIEW before removal | scripts/gaming/probe-*.mjs | Inspect purpose, dependencies, and sensitive output behavior. Keep useful read-only diagnostics if needed. |
| KEEP | scripts/qa/fungies.mjs and unrelated QA, even if output paths contain .gaming-render | Payment QA is not disposable Gaming art tooling. |

Repository-wide imports were searched for GamingPreview and old renderer references. Final cleanup still requires an exact file manifest and confirmation that non-Gaming consumers are safe. Do not delete remote Blob images until ownership and all references are audited.

## Reference observations

These observations came from live Cloud Browser DOM inspection, not copied assets. No third-party images, logos, components, CSS, or descriptions were downloaded for reuse.

| Reference | Observed | Design implication |
| --- | --- | --- |
| https://fivem.gg/ | Resource type and framework appear in names; scripts, MLOs, cars, EUP and full servers have direct entry points. | Make compatibility/type understandable without opening every product. Do not borrow discount or QA claims. |
| https://www.fivem.store/ | Scripts/MLO/server grouping; cards attach category and price; environment and UI resources are represented by relevant imagery. | Resource-specific visuals and direct product discovery. |
| https://fivem-store.com/shop/ | Compact listings, sorting, result count, framework/version naming, price and sale presentation. | Dense readable grid, truthful prices and useful filtering. |
| https://turbo.buzz.dev/ | Price/category/tag filters; search; gallery buttons on cards; View Details; pagination; featured collections. Screenshot of first viewport inspected. | Clean commerce controls and image hierarchy; omit unverified popularity/support counts. |
| https://prism.buzz.dev/ | Strong gaming/community navigation and category entry points; unrelated IP/vote/patron functions. | Borrow atmosphere and hierarchy only. |
| https://builtbybit.com/ | Persistent Cloudflare security verification; live resource UI unavailable to this browser. | Do not claim full inspection. Requested taxonomy patterns remain requirements, not verified observations. |
| https://www.quasar-store.com/c/memberships | Five differentiated memberships with purpose-led summaries; jobs/core/high-end/full catalog/map access. | Coherent libraries rather than renamed identical plans. Homepage still needs separate inspection. |
| https://wasabiscripts.com/subscriptions | Series subscriptions, monthly/quarterly/annual selector, visibly named included packages, access while subscribed. | Exact eligible-resource lists and unambiguous recurring terms. |
| https://codemstore.com/ | HUD, phone, MDT, racing and wallet each have a distinct product visual and feature focus. | Each benchmark must communicate its own resource type. |
| https://marketplace.cfx.re/ | Maps/scripts/characters/clothing/vehicles/misc/animations navigation and image-led assets. | Textual compatibility and functional category separation. |
| https://mcmodels.net/ | Navigation request started but the environment disconnected before a verified result was returned. | Still requires inspection. |
| https://polymart.org/products | Not verified before environment failure. | Still requires inspection. |
| https://www.minecraft.net/en-us/marketplace | Not yet inspected. | Still requires inspection. |

Still required: remaining references, representative product-detail/gallery interactions, mobile behavior and deeper filter checks. A homepage snapshot alone is not a completed deep study.

## Clean architecture direction

- One Gaming browse implementation shared by platform/category/subscription routes.
- Primary discovery areas: FiveM, Minecraft, Server & Community, Creator & Branding, Subscriptions.
- Visible facets derived from actual catalog data. Do not create empty categories for SEO or expose unverified framework/game-version values.
- Product record separates display content from commerce mapping. Fields include stable id/slug, platform/category/tags, supported compatibility, deliverability status, typed media with provenance, pricing, recurring model, eligible resource IDs, cadence, license and cancellation behavior.
- Media union supports image and future actual video. Six benchmark galleries each contain exactly three final images.
- Recurring models supported by the data contract: vault, monthly drop, membership, pick-and-keep, credits, update plan, server-owner and creator plan. Only expose models backed by actual terms/fulfillment.
- Preview-ready is not sale-ready. Generated environments cannot be represented as proof that downloadable MLO/vehicle/Minecraft files exist. Retain an explicit readiness gate until real eligible resources and payment mappings are verified.
- Verified webhooks remain the authority for paid access. No browser success event grants rights.
- Navy, orange and neutral surfaces; compact browsing; product-led color variation. No neon/RGB theme or pricing-table cover art.
- 1600×1000 WebP covers; product visuals occupy roughly 75–85%. Render scenes first, inspect, then add important text deterministically. UI/script imagery must come from built readable interfaces.
- Search indexes title, short description, category, tags, framework and platform.
- Monthly/annual controls show actual totals and calculated savings, normally 15–25%; no invented sale labels.
- Product detail: gallery left; summary, compatibility, price/interval and readiness-aware action right; structured overview, What You Get, eligible resources, requirements, cadence, license, usage and cancellation below.
- Mobile filter sheet, responsive gallery, no horizontal overflow, sticky purchase/readiness action where useful.

## Exactly six benchmark briefs

1. FiveM MLO subscription: coherent interiors library; environment scenes and multiple camera views.
2. FiveM UI/script subscription: built HUD/MDT/dispatch interfaces with readable text, not generated fake UI.
3. FiveM vehicle subscription: sensible fleet scope, realistic geometry, exterior/detail views.
4. FiveM server-owner subscription: concrete server configuration/operations resources; built resource-interface previews.
5. Minecraft build subscription: coherent spawn/lobby/build library with believable block logic.
6. Gaming branding subscription: editable community branding resources shown as actual design mockups.

Each needs a completed record, 120–220 meaningful description words, 5–8 concrete What You Get bullets, clear eligible resources, differentiated pricing, card, detail page, one final cover and two distinct product-focused gallery images. No products 7–100, no scaling scripts, no internal approval.

## Verification and delivery gates

1. Restore working checkout from the GitHub working branch. Do not recreate the recovery branch.
2. Finish reference inspection and inventory, including nested AGENTS.md files and verified deliverability.
3. Complete scoped cleanup only after dependency checks.
4. Implement and render six benchmark products; inspect every final image.
5. Verify search/filter/sort, monthly/annual arithmetic, gallery behavior and mobile overflow.
6. Verify no unintended payment/auth/customer changes and no invented social proof.
7. Deploy a non-production preview, verify it, provide its actual URL and all six product links.
8. STOP for explicit owner APPROVED.

## Environment blockers observed

- Scratch maintenance removed the first clone; it was re-cloned successfully from the recovery branch.
- Package installation encountered registry tunnel/network failures. Do not alter security settings or lockfile policies to bypass them.
- The execution environment then disconnected: exec_command returned environment_offline / Environment is not connected.
- The connected Vercel team lists only tranzdigital-ticketing-system. GitHub's existing main status identifies distrosource-gw, but get_project for that name returns 404 through the current connection.
- Existing GitHub deployment success on main is historical, not a preview of this rebuild.
- GitHub connector remains usable and is preserving this checkpoint. No new preview URL exists yet.
