# UI/UX enhancement log

Branch: `claude-security-hardening` (not pushed, not merged). Rounds 1–3 covered
checkout, cart, header/mega menu/search, product card, purchase panel, gallery
and lightbox, anchored product sections, footer, auth, library and 404.
This file records Round 4 and the truthfulness fixes it surfaced.

## Round 4 — account, support, catalog navigation, content pages

### Rewritten

| Area | File(s) | What changed |
| --- | --- | --- |
| Orders list | `app/account/orders/page.tsx` | Row layout (order number + status badge, date, item names, total, View), count in header, honest empty state. |
| Order detail | `app/account/orders/[orderNumber]/page.tsx` | Status badge, payment provider, payment status, refunded amount (`polarRefundedAmount`), "Total paid" from `polarPaidAmount`, pending/refund notices, "Open in library" only when paid. |
| Status badge | `components/order/order-status-badge.tsx` (new) | One source of truth for order status colours; only `completed` reads as success, only `failed` as error. |
| Wishlist | `app/account/wishlist/page.tsx` | Header with saved count, empty state with CTA. |
| Help Center | `app/help/page.tsx` | IA per brief (Buying & orders / Downloads / Licensing / Account / Refunds / Payments / Product questions / Team licensing), prominent `HeaderSearch size="lg"`, "Still need help? → Contact support". Stale "Extended" tier removed. |
| Contact | `app/contact/page.tsx`, `components/contact/contact-form.tsx`, `lib/actions/contact.ts` | Form first; optional order number folded into the message (server signature unchanged); topics Order / Download / Licensing / Billing / Refund / Account / Product question / Technical issue / Other; self-serve shortcuts instead of invented mailboxes. |
| About | `app/about/page.tsx` | Exact counts (no `+`), unsupported claims removed, principles the site can back. |
| Legal | `components/legal/legal-page-layout.tsx` | Sticky document nav + in-page "On this page" TOC with section ids; readable measure. |
| Categories index | `app/categories/page.tsx` | Grouped by department with real product counts; empty subcategories not linked. |
| Category page | `app/categories/[slug]/page.tsx`, `components/catalog/subcategory-nav.tsx` | Pill nav matches `CategoryPillBar`; empty siblings hidden; department name as eyebrow; "No products in X yet" when no filters are active vs. "Nothing matches those filters" when they are. |
| Catalog shell | `components/catalog/catalog-page.tsx`, `components/catalog/product-grid.tsx` | Passes `reviewCount` (rating filter stays hidden with 0 reviews), `clearHref`, and `emptyState`. |
| Quick preview | `components/product/quick-preview-dialog.tsx` | Real gallery with thumbnails (hero + concept previews, de-duplicated), token radius, no placeholder badges. `sm:max-w-3xl` out-prefixes `DialogContent`'s `sm:max-w-sm`. |
| Mobile nav | `components/header/mobile-nav.tsx` | Shop / Account / Support groups, `rounded-md`/`secondary` tokens, Polar disclosure in footer. |
| Trust badges | `components/home/trust-badges.tsx` | Copy limited to verifiable behaviour; token radius/grid. |
| Selects | `contact-form`, `catalog-toolbar`, `support-ticket-form` | Base UI `Select` now receives `items`, so the trigger shows "Featured"/"Order" instead of the raw value. |

### Truthfulness fixes found during the round

- `help`: "Personal, Commercial, Extended, and Agency" → Personal, Commercial and Agency.
- `about`: "{count}+ items", "real sample file before it ever goes live", "verified source" — removed.
- `contact`: `hello@`/`business@distrosource.com` (unverified mailboxes) — removed.
- `help`, `contact`, `contact-form`, `team-licensing-form`, `trust-badges`: "within one business day" → "Typical response within 1 business day".
- `trust-badges`: "real sample file to download" — removed (every catalog file is still a stub).
- `getCatalogStats.categoryCount`: counted every subcategory row (30). Now counts categories that hold a visible product (21). About page and hero use it.
- Navigation: `Bundles` department (all 10 bundles are drafts) and `?free=true` / `?bundle=true` shortcuts (0 results each) were linked from the footer, mega menu, desktop nav, search quick links, mobile nav and cart. `site-header.tsx` now filters empty departments/subcategories once for both navs; the shortcuts point at `/deals` (30 products) instead.
- `support-ticket-form`: order-number placeholder was the referral-code format (`RC-…`); orders are `DS-` + 10 chars.
- Filter sidebar "Type" group offered Free / Bundles / On sale unconditionally; Free and Bundles return 0 rows. `getCatalogStats` now returns `freeCount` / `bundleCount` / `dealCount` (same predicates as `getProducts`), and `CatalogFilters` hides any Type option with zero matches unless it is active.
- `CategoryPillBar` listed every subcategory, including empty ones, as a `?category=` filter; empty pills are now hidden unless active.
- Home page "extended" hit during the scan was ordinary product copy ("as it is extended"), not a tier name — left as is.

### Verification

- `tsc --noEmit --incremental false`: clean.
- `next build`: passes (`ignoreBuildErrors: false`).
- Local `next start --port 3500` smoke pass: /help, /contact, /about, /legal/*, /categories, /categories/[slug], /deals, /products, /account/orders, /account/wishlist → 200; stale-claim scan over rendered HTML → 0 hits.
- Screenshots reviewed: help, contact (select label), about, legal terms (TOC, sticky nav), categories index, empty category state, quick preview, mobile drawer.

### Still open (unchanged from earlier reports)

- Every published product still ships a stub download — not launch-ready.
- `rate_limits` table not created in production (limiter fails open with a warning).
- `finalReviewStatus` column not created (needs table owner); derived in code.
- Bundles have no fulfilment expansion; all bundles and free products are drafts.
- Soft 404 on `/products/[slug]` for unknown slugs (`noindex` injected).
- Server session on port 3500 must be started with `BETTER_AUTH_SECRET` in the process environment.
