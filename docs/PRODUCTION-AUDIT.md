# DistroSource — Production & Compliance Audit

> **Round 2 (2026-09-03, later):** bot-check screen removed, Polar refunds
> implemented, rate limiting implemented, four further catalog-visibility
> bypasses closed, read-only DB audit tooling written. **The database-backed
> sections remain unexecuted — `.env.local` was never provided.** See ROUND 2
> at the end.
>
> **Round 3 (2026-09-04):** read-only production audits executed. Real catalog
> and schema numbers are in ROUND 3 at the very end — including two live
> bundles that take money and deliver nothing.

**Branch:** `claude-security-hardening` (from `main` @ `c752693`)
**Date:** 2026-09-03
**Nothing pushed or merged.**

---

## SCOPE — READ THIS FIRST

The request covered 60 areas. This pass completed **P0 code security and the
P0 subset of public-content truthfulness**, and audited the rest. It is not a
complete execution of all 60 sections, and this document does not pretend
otherwise.

### Three hard limits on what could be verified

1. **No database access.** There is no `.env`, no `DATABASE_URL`, and no
   production credentials in this environment. Every catalog question —
   how many products exist, whether they have real assets, whether rights are
   verified, whether seed/demo rows are in production, whether reviews are real
   — is **unanswerable from the repository**. Sections 4, 5, 32, 33, 34, 38 and
   most of 52 could not be executed. The numbers a "PRODUCT AUDIT" section
   would contain are not available, and inventing them would be exactly the
   fabrication this task forbids.

2. **The live site could not be walked.** `https://distrosource.com` is up but
   was fronted by a browser-verification gate. Clicking through it is
   bot-detection bypass, which I don't do. The live customer journey (§2) was
   audited from source, not from the running site.
   *(Round 2: that gate has since been removed from the codebase. A live
   walkthrough is possible once the change is deployed — it has not been done.)*

3. **The production build cannot complete locally.** It compiles and
   typechecks, then fails at `/sitemap.xml` because `app/sitemap.ts` queries
   the database at build time and nothing is reachable. On Vercel, with
   `DATABASE_URL` set, this stage should pass — but that is inference, not a
   verified result.

---

## EXECUTIVE SUMMARY

| | |
|---|---|
| **Overall readiness** | **Not scored.** A score would imply catalog and database verification that did not happen. |
| **Production readiness** | **NOT READY** |
| **Merchant-of-Record review readiness** | **NOT READY** |
| **Security** | **IMPROVED — issues remain** |
| **Catalog legitimacy** | **UNVERIFIED** (blocker — no DB access) |
| **Payment integrity** | **PASS** for the Polar path, after this branch's fixes |
| **Legal consistency** | **ISSUES** |

**Why NOT READY:** the single largest blocker is that nobody has verified the
catalog against the database. A merchant-of-record reviewer's first question is
"does a customer receive a real file after paying?" — and that cannot currently
be answered. Everything else is secondary to it.

---

## WHAT WAS FIXED

### P0 — Payment bypass (§8)

The audit found **three** exported Server Actions that could act without
authorization or without payment. In Next.js, every export of a `"use server"`
module compiles to a callable action ID — it is a public HTTP endpoint whether
or not any UI calls it. Next's dead-code elimination strips unreferenced ones
from the client bundle, but that is an optimization, not a security boundary,
and it is the wrong thing to rely on for fulfilment primitives.

| Function | What it could do | Fix |
|---|---|---|
| `checkout()` | Create a **completed order with full entitlements and no payment whatsoever**. Called `persistOrder(..., "card")` directly. | **Deleted.** Verified no importers anywhere first. |
| `persistOrder()`, `computeOrderPricing()` | Exported order-writing primitives, callable with arbitrary pricing | **Moved** to `lib/checkout-core.ts`, a `server-only` module that is *not* a Server Action module. Logic byte-identical — verified by diff. |
| `resendOrderConfirmationEmailForAdmin()` | **No authorization at all.** Resend any order's contents to its billing address by guessing an order number. | **Added `requireAdmin()`.** |
| `sendAbandonedCartReminders()` | Exported bulk-email trigger | **Moved** to `lib/jobs/abandoned-cart.ts` (`server-only`). |

`lib/actions/checkout.ts` now exports exactly four actions:
`applyCouponPreview` (read-only), `createPolarCheckout` (creates a
`pending_payment` order only), and the two PayPal actions (hard-disabled).

**Polar `order.paid` remains the only path that marks a paid order completed.**

### P0 — Free-product entitlement hole (§8)

`claimFreeProduct()` granted the first license tier of any `isFree` product
without checking that tier's price. A product flagged free whose tiers are
still priced would hand out a **paid license for free**. Now selects the
cheapest tier and requires it to cost exactly zero, failing closed otherwise.

### P0 — Catalog exposure (§4, §35)

`getProductsByIds()` had **no visibility filter**. It backs `/compare`, which
takes product IDs straight from the query string — so any unpublished,
rights-pending, rejected or asset-missing product was publicly viewable by
direct ID. Now gated by the same `publiclyVisible()` filter as the rest of the
storefront. `getTopReviews()` gated likewise.

### P0 — Production URL safety (§16)

`NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"` appeared in the Polar
`successUrl`, `returnUrl` and `embedOrigin`. Unset in production, **every
paying customer would be redirected to their own machine after payment.** The
same pattern was in password-reset and cart-recovery email links.

New `lib/env.ts` centralizes this. In production it refuses to resolve to
localhost and throws instead. Critically, `createPolarCheckout` now resolves
the URL **before** writing the pending order and clearing the cart — a
misconfiguration fails while the customer still has their cart, not after.

`IS_PRODUCTION` is keyed on `VERCEL_ENV === "production"`, not `NODE_ENV`, so
v0 previews and local builds are unaffected. A build-phase guard prevents
config errors from breaking `next build`.

### P0 — Cron fail-open (§17)

`if (cronSecret && authHeader !== ...)` — a **missing** `CRON_SECRET` made the
endpoint fully public, so anyone could trigger a mass abandoned-cart email
send. Now fails closed: production without the secret returns 503.
`/api/cron/abandoned-cart-reminders` is the only cron endpoint.

### P1 — Misleading public content (§3, §7, §20, §23)

| Finding | Fix |
|---|---|
| Footer displayed **Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay** logos. PayPal is disabled server-side; no wallet method exists. | Removed PayPal/Apple Pay/Google Pay. Added merchant-of-record disclosure: "Payments are processed by Polar, our merchant of record." |
| `/help/orders` described **license keys, seat counts and activation instructions** — a model that does not exist anywhere in the schema. This is also a high-risk category signal (software/game keys) for payment reviewers. | Rewritten to describe downloadable files and license tiers. Explicitly states there are no keys or activation codes. |
| Homepage and About appended **"+"** to exact counts ("120+ products" when there are exactly 120). | Removed. Counts are exact and come from the database. |
| FAQ promised **"unlimited projects"**; team licensing promised **"unlimited client projects"**; FAQ referenced a non-existent "Extended" tier. | Qualified to "multiple client projects up to the limits stated on the product". Personal/Commercial/Agency only. |
| Dead 134-line JSX block in the checkout form advertising **Crypto and Card payment tabs**. Commented out, so invisible — but a misleading payment claim one uncomment away. | Removed, with the orphaned card-entry code. |

### P1 — Build safety (§41), CSP (§26), deployment (§42)

- `ignoreBuildErrors: false`. It immediately caught a real error, which is the
  point.
- CSP rewritten with `frame-src https://polar.sh https://sandbox.polar.sh` —
  **the current policy would have blocked checkout entirely if enforced.** Also
  added Vercel Analytics to `script-src`/`connect-src`, Blob + flagcdn to
  `img-src`, and `object-src 'none'`, `base-uri`, `form-action`.
  **Deliberately still Report-Only** — it must be observed against real traffic
  before enforcement, as instructed.
- `netlify.toml` and `@netlify/plugin-nextjs` removed. Vercel is the only
  deployment target; no Vercel configuration was touched.

### Prepared, not executed (§14, §39)

- `drizzle-kit` + `drizzle.config.ts` + `drizzle/`. **No migration generated,
  nothing run against any database.** `docs/DATABASE-MIGRATIONS.md` documents
  the baseline question below.
- `docs/ADMIN-AUTHORIZATION.md` — four-phase plan to move from the hardcoded
  email allow-list to `user.role`, ordered so the existing administrator cannot
  be locked out. **No admin access changed.**

---

## CAN THE SCHEMA BE BASELINED SAFELY?

**Not yet answerable — and it must not be attempted before a drift check.**

Baselining is non-destructive in itself. The risk is baselining against a
snapshot that does not match reality: if production has a column or index
`schema.ts` does not describe, the *first real migration afterwards* will
contain an unintended diff, potentially a `DROP COLUMN` against live order
data. Confirming this needs read access to production, which was unavailable.

Procedure in `docs/DATABASE-MIGRATIONS.md`: run `drizzle-kit generate` against
a **restored copy**; an empty migration means safe to baseline, a non-empty one
*is* the drift report.

---

## SECURITY AUDIT

**Verified sound (no change needed):**
- Polar webhook: signature verified via `validateEvent`; idempotency claimed on
  the `webhook-id` header **before** side effects; amount + currency validated
  against the stored order; status guard in the `WHERE` clause against races.
  This is well built.
- Downloads: entitlement re-checked server-side per request, revocation
  honoured, bytes streamed through a private Blob `get()` — no blob URL or read
  token ever reaches the client.
- Reviews: gated on a non-revoked entitlement.
- Admin: all 31 admin mutations across 7 modules call `requireAdmin()`. Page
  guards run server-side in Server Components. (My first pass mis-flagged
  `order-management.ts` as unguarded — it authorizes via an imported helper.)
- Cart/checkout pricing: recomputed from the database, client totals never
  trusted, compliance gate blocks non-sellable products.

**Open — Critical:** none known in code. The critical blocker is unverified
catalog data.

**Open — High:**
1. **Catalog legitimacy unverified** (§4, §5) — no DB access. Blocker.
2. **No rate limiting anywhere** (§28). Sign-in, sign-up, forgot-password,
   contact, coupon validation and checkout creation have no throttling. Better
   Auth ships a rate limiter that is not enabled. `applyCouponPreview` allows
   unlimited coupon enumeration.
3. **PayPal refund path is dead but reachable in admin.** `refundOrder()`
   refunds via `refundPaypalCapture` and requires `paypalCaptureId` — **no
   Polar order has one.** Admin refunds are therefore impossible for every real
   order; refunds only work when initiated from the Polar dashboard. This
   contradicts §11 and any refund promise in the policy pages.

**Open — Medium:**
4. Duplicate-fulfilment protection for entitlements is a `SELECT`-then-`INSERT`
   race, not a DB constraint. Add `UNIQUE (orderId, orderItemId)`.
5. `script-src` still needs `'unsafe-inline' 'unsafe-eval'`; nonce-based CSP is
   follow-up work.
6. `middleware.ts` is deprecated in Next 16 (`proxy` convention). Build warns.
7. `tsconfig.tsbuildinfo` is committed, which made `tsc --noEmit` a **no-op**
   returning exit 0 without checking anything. It should be gitignored.

**Open — Low:**
8. Production email logo is a public blob named `ChatGPT Image Aug 31 2026…`.
9. `robots.ts` does not disallow `/cart`, `/compare`, `/recover-cart`.

---

## LEGAL / COMPLIANCE

Not fully audited — the legal pages were scanned for contradictions against
implementation, not read line by line.

- **Refund policy vs. tooling (§21, §11): contradiction.** Admin refunds are
  non-functional for Polar orders (High #3). Any policy promising
  support-initiated refunds does not match the backend.
- **Partial refunds:** webhook records them and keeps buyer access — reasonable
  and documented, but the refund policy should say so explicitly.
- **Delivery policy (§22):** the footer's "no shipping, ever" was reworded; the
  policy page itself was not audited for "available forever" language.
- **Not audited:** Terms, Privacy vs. actual collection (§49) — note the app
  logs IPs in `visitor_logs`, `ip_reputation`, `download_events` and uses
  AbuseIPDB, all of which the Privacy Policy must disclose. Cookie/consent
  reality (§50) — Vercel Analytics loads unconditionally.

---

## SEO

- **Verification gate is an SEO risk (§29).** `BrowserVerificationGate` renders
  children during SSR (good for non-JS crawlers) but after hydration shows the
  gate. **Googlebot executes JavaScript and will likely see the gate, not the
  catalog.** This needs testing with Google's URL Inspection tool before
  anything else SEO-related matters.
- Sitemap correctly includes only publicly-visible products. Robots does not
  block the catalog.
- Structured data, canonicals, old-domain URLs (§31): not audited.

---

## FINAL BLOCKERS

1. **Catalog not verified against the database.** Cannot confirm any product
   has a real downloadable asset. *Blocks MoR review.*
2. **Product rights/provenance not verified.** Cannot confirm no third-party
   commercial products are listed. *Blocks MoR review.*
3. **Admin refunds non-functional for Polar orders.**
4. **No rate limiting.**
5. **Schema drift unknown**; migrations cannot be baselined until checked.
6. **Full production build unverified** — passes compile and typecheck, fails
   locally only on the DB-dependent sitemap.
7. **Verification gate's effect on crawlers untested.**
8. Sections not executed: 2 (live walkthrough), 6, 13 (partial), 24, 25, 27,
   29–31, 34, 36–38, 43–47, 50, 53.

---

## RECOMMENDED NEXT STEPS

1. Give me read-only `DATABASE_URL` access (or a restored dump) → unblocks the
   catalog, rights, reviews, seed-data and drift audits.
2. Decide the refund story: wire admin refunds to the Polar API, or state
   plainly that refunds are Polar-dashboard-initiated and align the policy.
3. Enable Better Auth rate limiting.
4. Test the verification gate against Googlebot.
5. Watch CSP reports, then flip to enforced.

---

# ROUND 2

## Completed

### Bot-check screen removed

`BrowserVerificationGate` deleted and unmounted from `app/layout.tsx`.

It was never a security control: a button that set a client-side cookie, with
no server-side enforcement anywhere. Anyone could skip it by setting one
cookie. What it *did* do was hide the entire storefront from any crawler that
executes JavaScript — including Googlebot — because the component rendered
children during SSR but replaced them with the gate after hydration. Removing
it costs nothing and restores indexability. Real bot defence remains in
`middleware.ts`, the AbuseIPDB IP-reputation checks, and the new rate limiter.

### Polar refunds

`refundOrder()` was PayPal-only and required `paypalCaptureId`, which **no
Polar order has** — admin refunds were impossible for every real order.

Now provider-aware, using the installed SDK's real surface
(`polar.refunds.create({ orderId, reason, amount, comment, metadata })`,
returning a `Refund` with `status: pending | succeeded | failed | canceled`).
Verified against `node_modules/@polar-sh/sdk`, not guessed.

- Admin-only (`requireAdmin()`); completed / partially-refunded orders only.
- Full and partial refunds. The amount is validated server-side against the
  order's remaining refundable balance and never trusted from the client.
- **Does not mark the order refunded.** Polar confirms asynchronously and the
  verified `order.refunded` webhook performs the state transition, entitlement
  revocation and customer email — one authoritative path, already idempotent on
  its delivery id. The admin action only records a `refund_requested` audit
  event carrying the Polar refund id, status, amount and currency.
- Full refunds revoke entitlements; partial refunds do not. This matches the
  webhook's existing policy and the published refund policy.
- Original payment fields are never overwritten.
- Refund identifiers are stored in `operation_events.payload` (jsonb) rather
  than new columns, to avoid a schema change against production. A dedicated
  `polarRefundId` column is worth adding in the first real migration.
- The legacy PayPal path is retained for historical orders.

### Rate limiting

`lib/rate-limit.ts` — Postgres-backed fixed-window limiter. In-memory counters
were rejected explicitly: each Vercel instance has its own heap, so a `Map`
limits nothing across a horizontally-scaled deployment. The increment is a
single atomic `INSERT … ON CONFLICT DO UPDATE`.

Better Auth's **own** limiter is used through its documented `customStorage`
hook rather than duplicated, with `enabled: true` (its default only enables it
when `NODE_ENV=production`, leaving previews unprotected) and tighter
`customRules` for `/sign-in/email`, `/sign-up/email`, `/forget-password`,
`/reset-password` and `/send-verification-email`.

Non-auth endpoints covered: contact, newsletter, checkout creation (keyed by
cart owner), coupon validation, free-product claiming, and downloads (keyed by
user id, returning a proper 429 with `Retry-After`).

**Fails open, loudly.** A limiter outage must not become a sign-in and checkout
outage; authorization never depends on this module.

**INERT UNTIL MIGRATED.** The `rate_limits` table is in `schema.ts` but not in
production. Every call currently fails open and logs once. Rate limiting is
written and correct but **not yet active**.

### Catalog visibility — four more bypasses closed

| Path | Was |
|---|---|
| `getProductBySlug` | **No visibility filter.** Draft / rights-rejected / preview-only products were fully readable at their public slug URL; the page only disabled the buy button. |
| `getProductsByIds` (`/compare`, wishlist) | No filter, and IDs come from the query string (closed in round 1) |
| `getRecentlyViewed` | No filter — unpublished products persisted in the rail |
| `addToCart` | Checked `assetStatus` and `rightsStatus` but **not `status`**, so a draft could enter a cart |

Verified gated: `/products`, search, categories, recommendations, compare,
related products, homepage sections, direct slug access, sitemap.

### Read-only audit tooling

- `scripts/audit/catalog-audit.mjs` → `corepack pnpm audit:catalog`
- `scripts/audit/schema-drift.mjs` → `corepack pnpm audit:schema`

Both set `default_transaction_read_only = on` so the *server* rejects any
write, and issue SELECT / introspection statements only. They classify products
PASS / NEEDS REVIEW / BLOCKER and **change nothing**.

## Build

`corepack pnpm tsc --noEmit` — **exit 0.**

`corepack pnpm build` — compiles, typechecks, then fails at `/sitemap.xml`
with `ECONNREFUSED`.

**Exactly two database queries run during build**, both from `app/sitemap.ts`,
both read-only SELECTs:

1. `getProducts({ limit: 5000 })` — published + asset-ready + rights-approved
   products, plus their images and licenses.
2. `getCategories()` — categories with published product counts.

Everything else is `force-dynamic` (set in `app/layout.tsx`). With a reachable
`DATABASE_URL` — including a read-only one — the build should complete. That is
inference; it has not been observed.

## STILL BLOCKED — no `.env.local` was provided

Not executed, and not guessed at:

- **Catalog audit** — every product / asset / rights / duplicate / demo-data
  question. Tooling ready; one command.
- **Schema drift** — and therefore the baseline decision. Tooling ready.
- **Admin RBAC** — cannot confirm which admin accounts exist or whether `role`
  is populated. Activating RBAC without that risks a lockout, so nothing was
  activated. The plan now specifies three roles (`admin` / `support` /
  `customer`), a break-glass env fallback, and the read-only queries to run
  first.
- **Production truthfulness** — public counts could not be compared against
  real data. The code paths are correct (all stats come from
  `getCatalogStats()`, ratings gated on `reviewCount > 0`), but the values are
  unverified.

## Scorecard

Scores are withheld where the evidence does not exist. A number invented to
fill a row is worse than an honest gap.

| Area | Verdict |
|---|---|
| Overall Production Readiness | **NOT SCORED** — requires catalog verification |
| MoR Review Readiness | **NOT READY** |
| Payment Security | **PASS** |
| Catalog Assets | **UNVERIFIED** — blocker |
| Product Rights | **UNVERIFIED** — blocker |
| Refund System | **PASS (code)** — unverified against live Polar |
| Authentication Security | **PASS (code)** — rate limiting inert until migrated |
| Database Consistency | **UNVERIFIED** — blocker |
| SEO / Crawlability | **IMPROVED** — gate removed; structured data still unaudited |
| Legal Consistency | **ISSUES** — refund policy now matches tooling; Terms / Privacy vs. actual data collection still unaudited |

## Remaining blockers

1. Catalog assets unverified — no proof any product delivers a real file.
2. Product rights unverified.
3. Schema drift unknown; cannot baseline.
4. Rate limiting inert until `rate_limits` exists in production.
5. Polar refund path untested against the live API (no credentials).
6. Admin RBAC not activated; admin accounts unconfirmed.
7. Full build unobserved (DB-dependent sitemap).
8. Privacy Policy vs. actual collection (IPs, AbuseIPDB, analytics) unaudited.
9. Cookie consent: Vercel Analytics loads unconditionally.
10. Structured data, canonicals and old-domain URLs unaudited.

---

# ROUND 3 — DATABASE-BACKED RESULTS

Read-only audits executed against production (Neon, `neondb`, role
`claude_audit`). No data, schema or migration was modified.

**Connection caveat:** the role is named `claude_audit` but is **not** a
read-only role. It holds `CREATEDB`, `CREATEROLE`, `BYPASSRLS` and
`REPLICATION`, has full INSERT/UPDATE/DELETE on every commerce table, and the
session default is `transaction_read_only = off` on the **primary** (not a
replica). Read-only behaviour came only from the audit scripts setting
`default_transaction_read_only = on` themselves. This should be fixed before
any further database work — see the recommended `claude_audit_ro` role.

## PRODUCT AUDIT — real numbers

| Metric | Value |
|---|---|
| Total products | 350 |
| Published | 347 |
| Draft | 3 |
| Free | 4 |
| assetStatus = ready | 350 (100%) |
| rightsStatus = original | 350 (100%) |
| sourceType = distrosource_original | 350 (100%) |
| Products with ≥1 file row | 345 |
| Published products with zero own files | 2 (both bundles) |
| product_files rows | 345 |
| File rows with missing blobPathname | 0 |
| File rows with NULL fileSizeBytes | 45 |
| Exact duplicate titles | 0 |
| Categories | 37 (7 departments, 30 subcategories) |
| Reviews | **0** |
| Orders | 5 (1 completed, 4 pending_payment, 0 refunded) |
| Entitlements | 1 |
| Users | 6 |
| Support tickets | 0 |
| Download events | **0** |

Classification: **PASS 345 · NEEDS REVIEW 3 · BLOCKER 2**.
Nothing was unpublished.

### BLOCKER — bundles deliver nothing (2 products, both live)

| id | slug | price | bundle_items | own files |
|---|---|---|---|---|
| 46 | `agency-bundle` | $89.00 | 3 | 0 |
| 47 | `creator-bundle` | $39.00 | 3 | 0 |

Both are **published and purchasable right now**. Verified in code: no
fulfilment path expands a bundle into entitlements for its included products.
`bundleItems` is referenced only by admin screens and catalog display —
`lib/checkout-core.ts`, `app/api/webhooks/polar/route.ts`,
`lib/actions/free-products.ts` and `lib/downloads.ts` contain no bundle logic
at all.

A buyer therefore receives an entitlement for product 46 or 47, which has
**zero files**, and no entitlement for the three products inside it.
`authorizeDownload()` resolves files by `productId`, finds none, and the buyer
gets nothing.

**This is money taken for an undeliverable product.** It is the single most
serious catalog finding and the exact thing a merchant-of-record reviewer
tests first. Either unpublish both immediately, or implement bundle expansion
at fulfilment (grant an entitlement per included product) before re-listing.

### NEEDS REVIEW — third-party marketplace imagery (3 products, all draft)

| id | slug |
|---|---|
| 50 | `leo-bs-fashion-fashion-multi-purpose-prestashop-theme` |
| 51 | `x-the-ultimate-wordpress-theme` |
| 54 | `app-landing-page` |

Preview images are hotlinked from `s3.envato.com`, yet all three are recorded
as `sourceType = distrosource_original`, `rightsStatus = original`, with empty
`rightsOwner` and empty `proofOfRights`. All three are **draft** with zero
files, so nothing is publicly exposed and nothing is purchasable.

Two problems regardless:
1. A product whose preview lives on Envato's CDN is, on its face, not a
   DistroSource original. The provenance fields contradict the evidence.
2. The repository contains a branch named `v0/bulk-envato-import`, which
   suggests catalog content has previously been sourced from Envato.

**This cannot be resolved from the database.** It needs a human answer to:
where did the catalog come from, and is there a licence permitting
distribution? Until answered, the blanket 100% `distrosource_original` claim
across all 350 products is unverified.

### The 100% "original" claim

Every one of the 350 products asserts `distrosource_original` / `original`,
with no `rightsOwner`, `proofOfRights`, `supplierReference` or
`verificationDate` populated anywhere. The store has 0 reviews, 6 users, 1
completed order and 0 downloads — it is brand new.

A catalog of 350 in-house original digital products, produced by a business
with no trading history, is a claim a compliance reviewer will probe. It may
well be true (AI-assisted production at volume is plausible), but **the
database contains no evidence for it**, and the rights-provenance fields built
for exactly this purpose are entirely empty.

This is not something to fix in code. It needs either real provenance records
entered against each product, or a more accurate `sourceType`.

### Assets: rows exist, objects unproven

345 file rows, all with a `blobPathname`, none empty. But **45 published
products have `fileSizeBytes = NULL`**, and no HEAD request was made against
the Blob store (that needs `BLOB_READ_WRITE_TOKEN`, which was not provided).

`download_events` is **0** — no file has ever been downloaded by anyone. So
end-to-end delivery has never been exercised in production, by a customer or
otherwise. Asset reachability remains **unproven**.

### Test data in production

| Kind | id | Detail |
|---|---|---|
| user | `0v0jeI5TDBczauF2cZIWrawCGC3vH6gC` | `polar-e2e-test@example.com` |
| order | 5 | `polar-e2e-test@example.com` |

One end-to-end test account and its order are live in production. Harmless in
volume, but they inflate the order and user counts and should be removed or
clearly marked before any compliance review.

### Public claims vs database — all truthful

| Public claim | Real value | Verdict |
|---|---|---|
| Products shown publicly | 347 | accurate |
| Categories shown publicly | 30 | accurate |
| Reviews | 0 | correctly hidden (`reviewCount > 0` gate) |
| Average rating | n/a | correctly not displayed |

No fabricated statistics are rendered anywhere. The round-1 fixes (removing
the inflated `+` suffixes) hold up against the real data.

## LICENSE MODEL — copy corrected

Production sells:

| licenseType | products | price range |
|---|---|---|
| `personal` | 347 | $0.00 – $112.00 |
| `commercial` | 43 | $20.00 – $222.50 |
| `extended_commercial` | 43 | $40.00 – $445.00 |
| `regular_license` | 3 (drafts) | $29.00 – $89.00 |

**There is no `agency` tier in the database.** The public site named one on
`/licenses`, in the homepage FAQ and on `/team-licensing`, so a customer read
"Agency" on the marketing pages and saw "Extended Commercial" at checkout and
on their order.

Round 2 made this worse: acting on the brief's *preferred* Personal /
Commercial / Agency model, the FAQ's "Extended" reference was replaced with
"Agency" — aligning the copy with a tier that does not exist. That was an
error, corrected here. Public copy now says **Extended Commercial** everywhere,
matching `formatLicenseType("extended_commercial")`.

If Agency is genuinely the intended model, the correct fix is to rename the
tier in the database and migrate existing `product_licenses` rows — a data
change, deliberately not made.

`regular_license` appears only on the three Envato drafts and should be
retired with them.

## SCHEMA DRIFT — near-clean, one dangerous item

Declared in `schema.ts`: 33 tables · present in production: 32.

| Item | Detail |
|---|---|
| Missing from production | `rate_limits` (expected — added by this branch, not yet migrated) |
| Extra in production | **`products.polarProductId`** |
| Column type mismatches | none |
| Nullability mismatches | none |
| Extra tables | none |

### `products.polarProductId` — do not generate a migration yet

- `text`, nullable, no default
- **0 of 350 rows are non-null**
- referenced **nowhere** in the codebase

Vestigial, from an earlier per-product Polar mapping before the single generic
product model. Harmless in place — but because it is absent from `schema.ts`,
**`drizzle-kit generate` would emit `ALTER TABLE products DROP COLUMN
"polarProductId"`**. That is precisely the unintended destructive DDL the
baseline procedure exists to prevent. It happens to be safe here (the column is
entirely empty), but it must be an explicit decision, not a side effect.

Choose one before baselining:
- **(a)** Add `polarProductId: text("polarProductId")` to `schema.ts` to
  preserve it, then baseline with zero diff. Lowest risk.
- **(b)** Accept the drop as a deliberate, reviewed cleanup in migration 0001.

### Missing constraints and indexes

| Table | Recommended | Present |
|---|---|---|
| `entitlements` | unique `(orderId, orderItemId)` | **NO** |
| `orders` | unique `(polarCheckoutId)` | yes |
| `orders` | unique `(polarOrderId)` | **NO** |
| `orders` | unique `(paypalOrderId)` | **NO** |
| `cart_items` | unique `(userId, productId, licenseId)` | **NO** |
| `entitlements` | index `(userId)` | **NO** |
| `orders` | index `(userId)` | **NO** |
| `order_items` | index `(orderId)` | **NO** |
| `download_events` | index `(userId)` | **NO** |

14 unique constraints and 51 indexes exist overall. The missing
`entitlements(orderId, orderItemId)` unique index matters most: duplicate
fulfilment is currently prevented only by a `SELECT`-then-`INSERT` in the Polar
webhook, which is a race rather than a guarantee. With 1 entitlement in the
table, adding it now is trivially safe.

### Baseline verdict

**Safe to baseline once `polarProductId` is decided.** Drift is two known,
explained items with no type or nullability mismatches — a far better position
than feared. Resolve (a) or (b), then follow
`docs/DATABASE-MIGRATIONS.md`.

## Updated scorecard

| Area | Verdict |
|---|---|
| Payment Security | **PASS** |
| Catalog Assets | **FAIL** — 2 live bundles deliver nothing; 45 files unverified; 0 downloads ever |
| Product Rights | **FAIL** — 100% "original" with zero supporting evidence; 3 Envato-sourced drafts |
| Refund System | **PASS (code)** — untested against live Polar |
| Authentication Security | **PASS (code)** — rate limiting inert until `rate_limits` migrated |
| Database Consistency | **PASS with actions** — minimal drift, missing constraints |
| SEO / Crawlability | **IMPROVED** — bot gate removed |
| Legal Consistency | **IMPROVED** — license copy now matches the tiers actually sold |
| Public Data Truthfulness | **PASS** — every displayed statistic matches the database |
| Overall Production Readiness | **NOT READY** |
| MoR Review Readiness | **NOT READY** |

## Blockers, in priority order

1. **`agency-bundle` and `creator-bundle` take money and deliver nothing.**
   Unpublish or implement bundle entitlement expansion.
2. **Product rights are unevidenced.** 350 products claim original authorship
   with every provenance field empty; 3 drafts carry Envato imagery.
3. **Asset delivery has never been exercised** — 0 download events, 45 files
   with unknown size, no blob reachability check.
4. Rate limiting inert until `rate_limits` is created.
5. `polarProductId` decision required before baselining.
6. Missing `entitlements` unique constraint (cheap to add now).
7. Test account `polar-e2e-test@example.com` and order 5 live in production.
8. `claude_audit` is a full-privilege role on the primary, not read-only.
9. Polar refund path untested against the live API.
10. Privacy Policy vs. actual collection, structured data, cookie consent —
    still unaudited.
