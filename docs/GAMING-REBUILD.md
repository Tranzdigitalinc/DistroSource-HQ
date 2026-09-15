# DistroSource Gaming — clean rebuild

Working branch: `gaming/clean-rebuild` (from `main` at `72b7ff3`, the live production commit).

## Status

Phase 1 (this document): checkpoint, reference research, audit, classification, architecture.
Phase 2: cleanup and the new Gaming storefront system.
Phase 3: exactly six benchmark products, 18 final images, deployed to a Vercel preview. Approved by the owner on 2026-09-15.
Phase 4: products 7–26 — twenty more subscriptions at the same standard, each with a different monthly price drawn at random between $10 and $150 (see below). All 26 products remain `launching`.

## Recovery checkpoint

| What | Where |
| --- | --- |
| Branch | `checkpoint/gaming-clean-rebuild-20260915` → `72b7ff3` |
| Annotated tag | `gaming-clean-rebuild-baseline-20260915` → `72b7ff3` |
| Earlier checkpoints (other agents) | `checkpoint/gaming-before-rebuild-20260914`, `checkpoint/gaming-base-before-clean-rebuild-20260913` |

Restore the whole Gaming domain with `git checkout gaming-clean-rebuild-baseline-20260915 -- app/gaming components/gaming lib/gaming scripts/gaming`.

## Transactional and customer data — verified, preserved

Read-only database inventory, 2026-09-15:

| Check | Result |
| --- | --- |
| Orders / order items on Gaming products | 0 |
| Entitlements on Gaming products | 0 |
| Gaming products in the main `products` table | 0 |
| Membership `subscriptions` rows | 19, all Starter/Pro/Elite store memberships, not Gaming |
| `gaming_products` / `gaming_product_images` / `gaming_categories` | 20 / 20 / 8 rows, a separate v0 catalogue **not read by any page** |

Gaming purchases have never been possible: every code-catalogue product points at a placeholder Tebex URL (`example.tebex.io`) that the Buy button refuses. There is nothing to migrate.

Nothing in this rebuild mutates the database, Fungies, Blob storage, auth, orders, entitlements or payment code. The `gaming_*` tables and the 818 legacy renders in Blob (`gaming/…`, 55 MB) are left in place, unreferenced by the new storefront; removing them is an owner decision, not part of this rebuild.

## Reference research (live browser, 2026-09-15)

Studied for patterns only. No assets, copy, logos, CSS or layouts were taken.

| Reference | What it teaches | Do not copy |
| --- | --- | --- |
| fivem.gg | Name carries type + framework: `Product [ESX, QB, QBOX]`. Direct tiles for MLO, QBCore, ESX, EUP, Cars, Full Server. | "Up to 90% off", permanent strike-through prices |
| fivem.store | Servers vs Mods vs Scripts grouping; category label on every card; imagery shows the resource | Review counts, "3000+ customers", star ratings |
| fivem-store.com | — | Cloudflare human check; **not inspected** (not bypassed) |
| turbo.buzz.dev | Clean image-first cards, `+2` image-count badge, 1–3 tags, category line, price, VIEW DETAILS; price/tag/category filters and sort in a side panel; detail page = slider with thumbs, price, tags, bundle upsell, related, FAQ | "80+ reviews", placeholder testimonials, "Hot seller" |
| prism.buzz.dev | Big colour-coded entry tiles (Store / Vote / Blog) give a community-native feel | IP/vote/patron mechanics |
| builtbybit.com | — | Cloudflare human check; **not inspected**. Its taxonomy (Plugins, Server Setups, Builds, Configs, Graphics, Textures, Models, Skripts) is taken from the owner's brief |
| quasar-store.com | Five memberships, each with a purpose: jobs, core systems, high-end RP, every MLO, full store. Product page: gallery with trailer, framework chips (ESX QB QBOX VRP STANDALONE), one-time vs membership price side by side, SKU + category, overview, 4-step install, feature sections | "Most advanced ever", escrow claims |
| wasabiscripts.com/subscriptions | Series subscriptions with 1 month / 3 months / 1 year selector and an explicit **Included packages (n)** list per plan | "50% OFF" against an inflated anchor |
| codemstore.com | Every flagship product (HUD, phone, MDT, racing, wallet) has its own visual world | — |
| marketplace.cfx.re | Seven functional FiveM categories: Maps, Scripts, Character, Clothing, Vehicles, Misc, Animations; creator bundles | Creator names (DistroSource is first-party) |
| mcmodels.net | Image-first Minecraft asset grid; honest "No Rating" when there are none | Vendor model |
| polymart.org | Redirects to voxel.shop behind Cloudflare; **not inspected** | — |
| minecraft.net marketplace | Worlds, Add-Ons, Skin Packs, Texture Packs, Mash-Ups, Adventure Maps, Mini Games, Survival Spawns — each shown by its content | Any Mojang/Microsoft asset or implied affiliation |

## Audit and classification

| Surface | Class | Action |
| --- | --- | --- |
| `lib/gaming/products.ts` (3,514 lines, 48 products) | REMOVE from app | Placeholder Tebex, hand-set `bestseller`/`popular` flags, scene-art model. Exported to `scripts/gaming/legacy/legacy-catalog-2026-09.json` for normalisation after approval; unlisted meanwhile |
| `lib/gaming/types.ts` (GamingArt scene model) | REFACTOR | Replaced by the typed catalogue model below |
| `lib/gaming/queries.ts` | REFACTOR | Same public accessor names for search, sitemap, home teaser and admin; no popularity sort, no bestseller badges |
| `lib/gaming/images.ts` | REMOVE | Its only consumer was the old product card; media is now typed `GamingImage` with pre-built renditions |
| `lib/gaming/tebex.ts`, `components/gaming/tebex-buy-button.tsx` | REMOVE | Non-functional placeholder redirect; no Tebex store exists. Not a payment integration |
| `components/gaming/gaming-preview.tsx` (1,489 lines) | REMOVE | Illustration fallback behind the rejected imagery; admin import replaced |
| `gaming-hero`, `gaming-rail`, `gaming-trust-strip`, `gaming-category-strip`, `gaming-filters`, `gaming-product-card`, `gaming-gallery` | REMOVE → rebuilt | Replaced by the new card, browse, gallery and purchase components |
| `app/gaming/*` routes | REFACTOR | URLs kept: `/gaming`, `/gaming/products`, `/gaming/fivem`, `/gaming/minecraft`, `/gaming/product/[slug]`; new `/gaming/subscriptions` |
| `app/admin/gaming/*` | REFACTOR | Read-only, new model, readiness states |
| `components/home/gaming-teaser.tsx` | REFACTOR | Same props contract |
| `scripts/gaming/render/*` (14 files), `smoke-render`, `smoke-three`, `diversity-check`, `verify-images` | REMOVE | Old three.js/SwiftShader pipeline that produced the rejected renders |
| `scripts/gaming/probe-*.mjs` | REMOVE | One-off diagnostics |
| `docs/GAMING-ADMIN.md` | REFACTOR | Describes a table that was never used; replaced by this document |
| Nav, footer, mega menu, search, sitemap links to `/gaming` | KEEP | Contracts unchanged |
| `lib/fungies.ts`, membership, webhook, checkout, auth, account/library | KEEP — untouched | Verified webhooks stay authoritative for paid access |
| Branch `codex/gaming-clean-rebuild-benchmark` (500 slide images) | Never merged | Rejected; remains as history only, nothing to delete on `main` |

## Architecture

**Catalogue in code, typed.** `lib/gaming/catalog/*` holds records; the database is not touched, so a preview can never leak into production. Each record separates display content from commerce:

- identity: `id`, `slug`, `platform` (fivem · minecraft · community · creator), `category`, 1–3 display `tags`, `frameworks` (ESX · QBCore · Qbox · Standalone) only where true
- copy: `summary` (value line), `description`, `whatYouGet` (5–8), `features`, `compatibility`, `requirements`, `license`, `installation`, and for recurring products `cadence` and `afterCancel`
- pricing: one-time `price`, or `monthly` + optional `annual`; the annual saving is computed, never typed in
- recurring `models`: vault · monthly-drop · membership · pick-and-keep · credits · update-plan · server-owner · creator
- `media`: typed union, `image` today and `video` when a real one exists; every item records `provenance` (`rendered-preview` or `capture`)
- `availability`: `on-sale` · `launching` · `unlisted`. Checkout is only offered for `on-sale`. Benchmarks are `launching` until real deliverables and a Fungies mapping exist

**Taxonomy.** Areas: FiveM, Minecraft, Server & Community, Creator & Branding, plus a Subscriptions view across all of them. Category lists are defined per area but a category is only shown when at least one listed product uses it — no empty SEO categories.

**Browse.** One server-rendered browse view drives `/gaming/products`, `/gaming/fivem`, `/gaming/minecraft` and `/gaming/subscriptions`. Filters are URL parameters (area, category, framework, one-time/subscription, subscription type, price) so they work without client JS; facets and counts come from the data. Sort: featured (explicit curation order), newest, price. No popularity sort. Mobile: search field, filter sheet, two-column cards.

**Card.** Cover (16:10), platform, title, 1–3 tags, value line, price (`$19/mo` for recurring) with a recurring marker, image-count badge when the gallery has more than one image.

**Detail page.** Gallery left (thumbs, keyboard, video-ready). Right: platform · category, title, summary, framework chips, monthly/annual selector with computed saving, CTA state, concise access facts. Below: Overview, What You Get, Gallery, Features, Compatibility, Requirements, Content cadence, License, Installation, After cancellation, Related. Sticky price/CTA bar on mobile.

**Search.** Title, summary, category, tags, frameworks, platform.

**Honesty rules.** No ratings, reviews, sales, download, member or server counts, bestseller or popularity labels, testimonials, invented discounts or creator identities. Rendered previews are labelled as previews. A recurring product states what types of resources it covers and its cadence; it does not name packages that do not exist yet.

## Imagery pipeline (`scripts/gaming/banners/`)

1. **Scene**: rendered in headless Chromium on the local RTX 5070 Ti (`--use-angle=d3d11`), not the software renderer the old pipeline used.
   - Environments and vehicles: three.js + `three-gpu-pathtracer` (physically based, global illumination), procedural PBR materials.
   - Interfaces (HUD, MDT, dispatch, admin, server panels) and branding mockups: real HTML/CSS layouts with readable text, captured by Playwright. No generated fake UI.
   - Minecraft: voxel geometry with original 16×16 pixel textures drawn by DistroSource; block-world logic, not photoreal.
2. **Inspect** every scene before typography.
3. **Typography** is set deterministically in `cover.html` (real HTML/CSS with the bundled Archivo and JetBrains Mono, OFL — see `fonts/OFL.txt`), captured by Playwright. No model spells a title.
4. **Export** with sharp: 1600×1000 WebP cover and two 1600×1000 gallery views, each with 1200 and 800 renditions (the site runs with `images.unoptimized`, so responsive sizes are pre-built). Product visual ≈ 75–85% of the cover.

Commands (renders land in the git-ignored `.gaming-render/`; `compose.mjs` writes `public/gaming/catalog/<slug>/`):

```bash
node scripts/gaming/banners/render.mjs --scene mlo-diner --out .gaming-render/mlo-diner.png --spp 1200
node scripts/gaming/banners/render.mjs --scene street-night --view stream --mode raster --out .gaming-render/preview.png
node scripts/gaming/banners/render.mjs --page scripts/gaming/banners/ui/mdt.html --out .gaming-render/ui-mdt.png
node scripts/gaming/banners/compose.mjs
```

Pipeline notes learned on the benchmark:

- **One material per mesh.** `three-gpu-pathtracer` 0.0.24 mis-assigns materials and textures across the *whole scene* when any mesh uses a material array / geometry groups (it showed up as the police livery landing on buildings). Every helper in `lib.mjs`, `vehicle.mjs` and `voxel.mjs` builds single-material meshes; keep it that way.
- Use the synchronous `pt.setScene()`; the async path needs a BVH worker the stage does not ship.
- `--mode raster` renders the same scene with the WebGL rasteriser in seconds — use it for framing, then path-trace.
- Vehicle orientation: `rotation.y = -π/2` points the nose at +z (towards a default camera).
- **Quality tiers.** Interiors, interfaces, branding and voxel builds hold up as product imagery. Procedurally modelled vehicles are the weakest tier — they read as clean CG, not as game-ready car models. Before the Fleet Garage goes on sale its imagery should come from the real vehicle deliverables (or licensed CC0 models, with the owner's sign-off to download them).

## Benchmark products (exactly six)

| # | Product | Area | Model | Monthly | Annual | Saving |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | MLO Vault | FiveM | vault access + monthly drop | $19 | $179 | 21% |
| 2 | Interface Series | FiveM | vault access + update plan | $16 | $149 | 22% |
| 3 | Fleet Garage | FiveM | monthly drop + pick & keep | $12 | $115 | 20% |
| 4 | Server Owner Plan | FiveM | server-owner membership | $39 | $375 | 20% |
| 5 | Spawn & Lobby Builds | Minecraft | pick & keep | $14 | $135 | 20% |
| 6 | Community Brand Kit | Creator & Branding | creator plan | $24 | $229 | 20% |

Savings are computed from the prices at render time and rounded down.

## Products 7–26

Twenty monthly prices were drawn at random (unique integers from $10 to $150, excluding the benchmark prices), then assigned by scope so the largest plans carry the highest prices. Annual price ≈ 9.6 months, rounded down to $5 (about 20% off). Records live in `lib/gaming/catalog/records/{fivem,minecraft,community-creator}.ts`; the benchmark six moved unchanged to `records/benchmark.ts`.

| # | Product | Area | Model | Monthly | Annual |
| --- | --- | --- | --- | --- | --- |
| 7 | City Starter Server | FiveM | server owner + update plan | $149 | $1,430 |
| 8 | Heist Series | FiveM | vault + monthly drop | $137 | $1,315 |
| 9 | Phone OS | FiveM | update plan | $59 | $565 |
| 10 | Prison Network Setup | Minecraft | server owner + update plan | $144 | $1,380 |
| 11 | Housing Collection | FiveM | pick & keep + monthly drop | $128 | $1,225 |
| 12 | Discord Server Toolkit | Community | vault + update plan | $58 | $555 |
| 13 | Emergency Services Suite | FiveM | vault + update plan | $142 | $1,360 |
| 14 | Minigame Arenas | Minecraft | vault + monthly drop | $140 | $1,340 |
| 15 | Business Systems | FiveM | vault + monthly drop | $118 | $1,130 |
| 16 | Esports Team Kit | Creator | creator plan | $91 | $870 |
| 17 | Job Center | FiveM | monthly drop + vault | $65 | $620 |
| 18 | Plugin Suite | Minecraft | vault + update plan | $95 | $910 |
| 19 | Economy & Banking Suite | FiveM | update plan | $88 | $840 |
| 20 | Staff & Moderation Ops | Community | membership | $79 | $755 |
| 21 | Inventory Suite | FiveM | update plan | $32 | $305 |
| 22 | Skyblock Islands | Minecraft | pick & keep | $18 | $170 |
| 23 | Thumbnail Studio | Creator | creator plan | $21 | $200 |
| 24 | Resource Pack Studio | Minecraft | monthly drop | $38 | $360 |
| 25 | Sound Library | FiveM | pick & keep | $15 | $140 |
| 26 | Loading Screen Club | FiveM | creator plan | $10 | $95 |

A `$100+` price band was added to the filters for the higher plans.

## Products 27–33

Part of a mixed 50-product batch across the store (43 main-store Originals plus these 7 Gaming plans). Monthly prices were drawn at random between $10 and $200; annual uses the same 9.6-month rule. Records live in `lib/gaming/catalog/records/{community-creator-2,fivem-2,minecraft-2}.ts`. Like 1–26 they are `on-sale` and need Admin → Gaming → Sync to Fungies after deploy before checkout accepts them.

| # | Product | Area | Model | Monthly | Annual |
| --- | --- | --- | --- | --- | --- |
| 27 | Onboarding Playbook | Community | membership + monthly drop | $121 | $1,160 |
| 28 | Emote & Animation Library | FiveM | vault + monthly drop | $187 | $1,795 |
| 29 | Realtor System | FiveM | update plan | $176 | $1,685 |
| 30 | Retail Interiors | FiveM | vault + monthly drop | $156 | $1,495 |
| 31 | World Interaction Pack | FiveM | vault + update plan | $62 | $595 |
| 32 | Rank & Crate Artwork | Minecraft | creator plan + monthly drop | $194 | $1,860 |
| 33 | Parkour Courses | Minecraft | vault + monthly drop | $193 | $1,850 |

Imagery (21 images): one built page per interface product with three views selected by `?v=` (`ui/onb.html`, `emo.html`, `rlt.html`, `wip.html`, `rca.html`), a path-traced convenience store (`scenes/mlo-retail.mjs`, views `cover` and `counter`) with its spec sheet (`ui/rti.html`), and a voxel parkour tower (`scenes/mc-parkour.mjs`, views `cover`, `run` and `top`) with its setup page (`ui/pk.html`, markers projected from the same pad formula and top camera). The World Interaction Pack's in-game view is drawn over the mirrored diner render so its target menu points at a real seat.

Imagery for 7–26 (60 images) follows the same rules: built interfaces for anything with a UI (about 50 pages in `ui/`, sharing `_kit.css`), path-traced interiors for the vault and apartment, and voxel scenes for the Minecraft builds. Additions to the pipeline:

- `ui/rig.html` puts a live interface page on a monitor, tablet or floating card in the right two-thirds of a cover, so interface products get a cover with room for the title.
- `voxel-blocks.mjs` registers extra original block textures (ores, team colours, the "Hearthside" resource-pack set) and an `island()` helper; `World.solidEdges` hides a landscape's cut-away sides.
- `compose.mjs` accepts a comma-separated list of slug fragments; `cover.html` accepts `width` to wrap long titles.

## Gates

1. Six products complete: record, 120–220-word description, 5–8 What You Get bullets, pricing, card, detail page, cover + two gallery images.
2. Every image inspected by eye; titles legible; no artefacts.
3. tsc, lint, production build; search/filter/sort, monthly/annual arithmetic, gallery, mobile overflow checked.
4. No changes to payment, auth, customer or financial code or data.
5. Vercel preview URL + six product links handed to the owner.
6. **STOP** until `APPROVED`.
