# Gaming admin — current state and the path to editing

## What exists today

`/admin/gaming` and `/admin/gaming/[slug]` are **read-only**. They show every
field the Gaming storefront renders — platform, category, price, original
price, version, release and update dates, Tebex package ID and URL, featured /
bestseller / popular / published flags, copy, features, requirements,
compatibility, installation, changelog, FAQ and imagery.

There are no create, edit, upload or publish controls, because there is nothing
to write to.

## Why the catalog is code-backed

The 20 Gaming products live in `lib/gaming/products.ts`, not in Postgres.

That was a deliberate choice, not an omission:

- `docs/DATABASE-MIGRATIONS.md` records that the production database was built
  by hand-written one-off scripts, has **no migration history table and no
  versioned SQL**, and that `lib/db/schema.ts` is unverified against reality.
  The standing verdict there is *do not baseline until a drift report says it
  is safe*.
- `drizzle-kit generate` in that state does not emit "just the new table" — it
  emits the entire schema as migration `0000`, because it has no prior
  snapshot to diff against. Applying that against a live database that already
  has those tables is exactly the failure mode the migrations doc warns about.
- A database-backed Gaming catalog would therefore render **empty** in Preview
  and Production until someone hand-ran DDL against both. Code-backed data
  renders identically everywhere, with no deploy-order coupling.

Shipping working, honest read-only screens beat shipping edit forms that
silently discard input.

## What unlocks editing

Two things, in order.

### 1. Baseline the existing schema

Follow `docs/DATABASE-MIGRATIONS.md` end to end: `corepack pnpm audit:schema`
for the drift report, a `drizzle-kit generate --name drift-probe` against a
**restored copy** of production, reconcile until the probe comes back empty,
then `0000_baseline` and mark it applied. Until that is done, no new table can
be added through the normal migration path.

Two known reconciliations are outstanding and must be resolved as part of this:
the `rate_limits` table and `products.polarProductId`.

### 2. Add the `gaming_products` table

Once a baseline exists this is one ordinary generated migration. The table
mirrors `GamingProduct` in `lib/gaming/types.ts` one-for-one:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `serial` primary key | |
| `slug` | `text` unique not null | drives `/gaming/product/[slug]` |
| `title` | `text` not null | |
| `short_description` | `text` not null | card copy and meta description |
| `description` | `text` not null | |
| `price` | `numeric(10,2)` not null | USD, server-side source of truth |
| `original_price` | `numeric(10,2)` null | struck-through reference price |
| `platform` | `text` not null | `fivem` \| `minecraft` \| `other` |
| `category` | `text` not null | the eight `GamingCategory` values |
| `subcategory` | `text` not null | |
| `images` | `jsonb` not null default `'[]'` | uploaded capture URLs |
| `art` | `jsonb` not null default `'[]'` | schematic gallery views, rendered when `images` is empty |
| `version` | `text` not null | |
| `last_updated` | `date` not null | drives the "Updated" badge |
| `released_at` | `date` not null | drives the "New" badge |
| `compatibility` | `jsonb` not null default `'[]'` | |
| `requirements` | `jsonb` not null default `'[]'` | |
| `features` | `jsonb` not null default `'[]'` | |
| `included` | `jsonb` not null default `'[]'` | |
| `installation` | `jsonb` not null default `'[]'` | |
| `changelog` | `jsonb` not null default `'[]'` | `{ version, date, notes[] }[]` |
| `faq` | `jsonb` not null default `'[]'` | `{ question, answer }[]` |
| `tags` | `jsonb` not null default `'[]'` | |
| `tebex_package_id` | `text` not null | |
| `tebex_package_url` | `text` not null | |
| `featured` | `boolean` not null default `false` | |
| `bestseller` | `boolean` not null default `false` | |
| `popular` | `boolean` not null default `false` | |
| `published` | `boolean` not null default `false` | |
| `created_at` / `updated_at` | `timestamptz` not null default `now()` | |

Indexes: unique on `slug`; composite on `(published, platform)` for the
platform pages; `(published, featured)` for the homepage rail.

Deliberately **absent**: any seller, creator, vendor, author, commission or
payout column. Every Gaming product is sold directly by DistroSource, and the
schema should make the alternative unrepresentable rather than merely unused.

### 3. Seed and switch over

`lib/gaming/products.ts` becomes a one-shot seed script
(`scripts/catalog/seed-gaming.mjs`), and the five accessors in
`lib/gaming/queries.ts` — `getGamingProducts`, `getGamingProductBySlug`,
`getGamingProductSlugs`, `getFeaturedGamingProducts`, `searchGamingProducts` —
become `async` database reads. Every call site already awaits its data
(they are server components), so the storefront needs no restructuring.

Then the admin gains `lib/actions/admin-gaming.ts` behind the existing
`requireAdmin()` guard from `lib/actions/operations.ts`:

- `createGamingProduct`, `updateGamingProduct`, `deleteGamingProduct`
- `setGamingProductPublished`, `setGamingProductFeatured`,
  `setGamingProductBestseller`
- image upload through the same route the regular catalog uses
  (`components/admin/product-images-panel.tsx` is the pattern to copy)

with `revalidatePath` on `/gaming`, `/gaming/products`, `/gaming/fivem`,
`/gaming/minecraft`, `/gaming/product/[slug]` and `/`.

## Tebex

The Tebex package ID and URL are ordinary text fields on the product; nothing
about them requires the database. What they need is a real Tebex store:

- Create each package in the Tebex dashboard.
- Replace the placeholder IDs (`600100`+) and the `example.tebex.io` package
  URLs in `lib/gaming/products.ts` with the real ones.

`isTebexConfigured(product)` in `lib/gaming/tebex.ts` returns `false` while a
product's package URL still points at `example.tebex.io`, so Buy Now shows a
"checkout not yet available" notice rather than sending a paying customer to a
dead link. That guard is per-product, so packages can go live one at a time,
and it is what makes it safe to ship the section before Tebex is set up.

## Payment separation

Gaming checkout is a **redirect**, not a cart. There is no Gaming cart, and
Gaming products are never added to the existing Polar cart — a Gaming product
has no `productId` the cart understands and no code path that would put one
there. The two payment systems cannot be mixed in a single transaction because
they never share a transaction.

If a Gaming cart is wanted later (multi-item Tebex baskets), it must be a
separate store and a separate drawer; do not extend `lib/cart` to hold both.
