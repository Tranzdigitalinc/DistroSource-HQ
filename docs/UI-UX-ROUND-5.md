# UI/UX Round 5 — storefront rebuild (cart → checkout → discovery → account)

Branch `claude-security-hardening`, not pushed, not merged. All payment,
fulfilment, entitlement, visibility, rate-limit and auth controls are
untouched; this round changed presentation, navigation and the customer
journey only. Two server-side additions were made, both read-only or
narrower than what existed:

- `changeCartItemLicense(cartItemId, licenseId)` — swaps a cart line to
  another tier of the *same* product; the licence is looked up server-side
  and must belong to the line's product. Prices are still recomputed from
  the database at checkout.
- `getCartCount()` now runs one aggregate instead of the full cart join.
- Order lookups join product slug/thumbnail (read-only) for the success page.
- Catalog filters for Software / Source / Licence with facet counts.

## Licence tiers — decision recorded

The brief lists Personal / Commercial / Extended Commercial and says not to
introduce Agency. The production database was migrated to Personal /
Commercial / Agency at the owner's instruction in the catalog-cleanup round
(`agency` = 343 rows; `extended_commercial` no longer exists). This round
renders what the database holds and did **not** rewrite licence data. If
Extended Commercial is wanted back, that is a data migration to schedule
separately (`scripts/catalog-enhance/08-licence-migration.mjs` is the
template).

## Reusable systems created

| System | File | Used by |
| --- | --- | --- |
| Licence copy source | `lib/licenses.ts` (`licenseLabel`, `licenseSummary`, `sortLicenses`) | cart, checkout, PDP, quick preview, library, orders, filters |
| Licence selector | `components/product/license-selector.tsx` | purchase panel, quick preview, cart "Change licence" popover |
| Order status badge | `components/order/order-status-badge.tsx` | orders list, order detail, success page |
| Order status poller | `components/order/order-status-poller.tsx` | success page pending state |
| Library grid | `components/account/library-grid.tsx` | My Library |
| Product card | `components/product/product-card.tsx` (one card everywhere) | catalog, rails, related, wishlist |
| Catalog filters | `components/catalog/catalog-filters.tsx` (data-driven groups) | /products, category pages, /deals |

## Pages changed

`/cart`, `/sign-in`, `/sign-up`, `/checkout`, `/checkout/success`,
`/products`, `/products/[slug]`, `/categories`, `/categories/[slug]`,
`/account/library`, `/account/orders`, `/account/orders/[n]`,
`/account/wishlist`, `/` (section order + collections), footer on every page.

## Components changed

Cart: `cart-line-item`, `cart-items-list`, `cart-summary`.
Auth: `auth-shell`, `auth-form`.
Checkout: `checkout-form`, `checkout-line-item`, `order-summary`,
`polar-inline-checkout`; `order-items-list`.
Header: `site-header-client`, `desktop-nav`, `mega-menu`, `header-search`,
`cart-trigger`, `account-menu`, `trust-strip`, `mobile-nav`.
Catalog: `catalog-filters`, `catalog-toolbar`, `product-card`,
`quick-preview-dialog`, `purchase-panel`, `subcategory-nav`, `category-pill-bar`.
Account: `account-nav`, `library-grid`. Home: `shop-by-goal` (Collections),
`trust-badges`. Footer: `site-footer`.

## Cart

- 65/35 layout; items in one bordered list with separators, not cards.
- Each line: thumbnail, name, tagline, category • software • format •
  source, licence chip with inline **Change licence** popover, Save for
  later, Remove, line price. No quantity controls (shown as "× n" only when
  a legacy line has more than one).
- Summary: Subtotal, Discount, "Tax — calculated at secure checkout", Total
  as the strongest element, promo code behind a link, CTA **Proceed to
  secure checkout**, delivery line, Polar disclosure, Continue shopping.
- Mobile: sticky bottom bar with total + CTA; no horizontal overflow.
- Empty state: "Your cart is empty." → Browse products / Explore departments.

## Auth

- Focused shell: brand bar, one card, slim legal footer. No mega nav, no
  marketing panel, no statistics.
- Per-field validation on blur/submit with inline errors and `aria-invalid`;
  show/hide password; "Keep me signed in" (`rememberMe`); loading spinner
  inside a fixed-height button; specific server errors (already registered,
  unverified email, bad credentials).
- Sign-up: strength meter, requirements text, Terms/Privacy checkbox,
  verification state with resend + spam hint.
- Guest cart is now merged on sign-in (previously only at checkout).

## Checkout

- Minimal header (logo, Cart → Checkout → Complete, "Secure checkout",
  Back to cart), minimal footer.
- Steps: **1 Customer** (name/email, guest password inline with show/hide,
  "Have an account? Sign in" preserving `next=/checkout`), **2 Your
  products** (thumbnail, category • software • format, licence, price),
  **Digital delivery** note, sticky summary with **Continue to secure
  payment** and Polar disclosure. Mobile bottom bar shows total + CTA.
- Polar transition: "Preparing secure checkout…" with a spinner, iframe
  fades in on load, scrolls into view, listens for Polar `resize` messages
  so there is never a nested scrollbar, 15 s fallback to open the hosted
  page. Success message only navigates; fulfilment remains the verified
  `order.paid` webhook.
- Success: facts strip (order, email, total, status badge), product rows
  with thumbnail + licence + Download / View in My Library, receipt status,
  Go to My Library / Continue shopping. Pending state polls every 4 s (max
  30) and never exposes downloads; refunded and not-completed states link to
  order/support. Confetti removed.

## Header / navigation

- Trust strip reduced to three verifiable statements.
- Departments (icon + chevron), Products, Deals, Licensing; labelled
  Wishlist / Account / Cart on ≥xl, icon-only below with `aria-label`s;
  cart badge animates on count change. "Bundles" is deliberately absent
  until a bundle is published (every bundle is a draft).
- Mega menu: one column per department with counts, top 6 subcategories,
  "All {department}", shortcuts row; click/keyboard to open, Escape closes.
- Search: new placeholder, product rows show category • formats • price,
  "Suggestions" section when empty, keyboard/Esc/debounce/loading/no-results
  unchanged.

## Product discovery

- `/products`: "Digital products" header with description and real count;
  filters for Price, Type (only when non-empty), Format, Software, Licence,
  Source (each with counts), Rating only with real reviews; removable chips;
  sort Recommended / Newest / Price ↑ / Price ↓. No "Best selling".
- Category pages: breadcrumb, department eyebrow, sibling chips (empty
  siblings hidden), "No products in X yet" vs "Nothing matches those filters".
- Product card: compact, category, name, software • format • source, real
  badges only (New, Sale −n%, Original), price "From" when tiers differ,
  Quick preview + Add; hover reveals a Quick preview affordance and gentle
  image scale.
- Quick preview: thumbnail gallery, essentials, licence selector, Add to
  cart, View details.

## Product page

- Category eyebrow, name, value proposition, "By {source}" with Original
  mark; 60/40 layout with sticky purchase panel: price, licence selector,
  formats / compatibility / version / last updated, Add to cart, Buy now,
  Wishlist, truthful notes (documentation only when present).
- Sections: description sections + File details + Changelog (only with
  versions) + Reviews (only with reviews or when the viewer may review) +
  Related.

## Account

- Sidebar: Overview, My Library, Orders, Wishlist, Profile, Security,
  Support; secondary pages under "More".
- My Library: search, category chips, rows with preview, licence, version,
  purchase date, Download (count), View product / Licence / Documentation /
  Support. Downloads still go through `/api/downloads/[fileId]`.
- Orders and wishlist as in Round 4.

## Verification

- `tsc --noEmit --incremental false`: clean after every phase.
- `next build` (`ignoreBuildErrors: false`): passes. One attempt failed at
  static generation with exit −1 while the local `next start` held `.next`;
  rebuilding with the server stopped succeeded.
- Local `next start --port 3500` smoke pass: `/`, `/products` (+
  `?software=`, `?license=`, `?source=`), `/categories`, `/categories/*`,
  `/cart`, `/checkout`, `/sign-in`, `/sign-up`, `/account/library`,
  `/account/orders`, `/help`, `/licenses`, `/deals` → 200.
- Rendered-HTML scans over `/`, `/products`, `/sign-in`, `/cart`, `/help`:
  0 hits for "Extended", invented mailboxes, "within one business day",
  "real sample file", "verified source", "Best Seller", "Trending",
  `free=true`, `bundle=true`.
- `/products` filter groups rendered: Price, Type, Format, Software,
  Licence (Source hidden — only one source type exists); sort defaults to
  "Recommended"; `?software=Figma` → 9 products.
- Browser walkthrough (desktop ~800px and 375px): home → product → licence
  selector → cart → Change licence popover (Personal → Commercial; summary
  and toast updated) → checkout (inline validation on empty submit) →
  sign-in. `document.documentElement.scrollWidth === 375` on home, cart,
  checkout and product page at the mobile preset.
- Bug found and fixed during the walkthrough: after a licence change the
  cart summary updated but the line item did not, because `CartItemsList`
  seeded local state from props once; it now re-syncs on every server
  render.
- Layout fix from the 375px pass: checkout section headers stack their
  aside link below the title on small screens.

Not exercised locally: the Polar iframe (needs live Polar keys) and a real
paid order (webhook). The Polar component's message handling, origin
allow-list and success-URL navigation are unchanged from the audited code.
