# DistroSource Storefront Design Contract

> Reference-led, product-first digital commerce. Designed to be easy for humans, Claude, v0, Codex, and other agents to extend without restyling the product from scratch.

## Coordination rule

The reference-led redesign is developed in `components/redesign/**` and previewed from `/redesign-preview` until it is explicitly approved for the production homepage.

Do not move payment, entitlement, authentication, cart, checkout, database, webhook, or fulfilment logic into redesign components. The redesign consumes existing storefront data and actions; it does not own them.

When another agent is working in parallel:

- Prefer new files under `components/redesign/**` over broad edits to shared storefront files.
- Do not rewrite `ProductCard`, catalog queries, checkout, auth, or admin solely for visual consistency with the preview.
- Rebase the redesign branch onto the latest `main` before activation.
- Keep activation small: once approved, integrate the redesigned composition with the production homepage in a dedicated commit/PR.
- If another PR changes the same merchandising data, adopt the newer data contract instead of reverting it.

## Product idea

DistroSource is a **digital department store**, not a generic SaaS landing page and not a creator marketplace.

The interface should communicate:

1. breadth — many useful digital categories in one place;
2. curation — the catalog feels selected, not dumped into a grid;
3. trust — clear licensing, real product data, secure checkout, instant access;
4. momentum — browsing should feel quick, tactile, and modern without becoming distracting.

## Reference translation

These references are influences, not templates to copy.

### 21st.dev

Use the strongest ideas from modern React/shadcn interface libraries: composed hero layouts, clear card hierarchy, confident spacing, layered surfaces, and small interactive details. Components must remain native to the existing DistroSource stack rather than becoming a second component library.

### Refero

Design from a system before designing individual screens. Maintain consistent density, type hierarchy, spacing, card weight, and image treatment. Favor real ecommerce/catalog patterns over ornamental AI-generated layouts.

### Supahero

The hero must explain the product immediately. It should have one dominant message, one strong visual composition, obvious browse/search actions, and useful proof — not a collection of unrelated effects.

### Motion

Motion is functional feedback. Prefer opacity and transform animations, short entrances, restrained hover lift, and stagger only where it helps scanning. The existing global `MotionProvider` respects the user's reduced-motion preference.

### 60fps.design

Interactions should feel tactile and immediate. Prefer compositor-friendly animation, avoid layout-thrashing effects, and never add perpetual motion just to make the page look animated.

## Visual language

### Composition

- Editorial ecommerce rather than SaaS dashboard.
- Strong asymmetry in hero areas; orderly grids in shopping areas.
- Generous whitespace around important decisions.
- Section rhythm should feel intentional and repeatable.
- Real catalog imagery is the primary artwork whenever available.

### Color

Use the existing DistroSource design tokens. Brand orange (`primary`) is an accent and action color, not a page background. Navy is used for high-contrast editorial moments. Neutral surfaces carry most of the store.

Do not introduce a second brand palette inside redesign components.

### Typography

Use the existing Archivo display/body system and JetBrains Mono for compact labels, indexes, metadata, and utility text.

- Headlines: bold, compact, editorial.
- Body copy: short and useful.
- Mono labels: uppercase sparingly; do not turn the whole page into a technical interface.

### Surfaces

- Radius should remain restrained; avoid excessive pill-shaped cards.
- Borders do more work than heavy shadows.
- Shadows are used for lifted product imagery and interactive focus, not every container.
- Decorative grids/noise must stay subtle enough that product imagery wins.

## Motion rules

- Animate `opacity` and `transform` first.
- Typical entrance: 280–500ms.
- Typical hover/tap feedback: 120–220ms.
- No autoplay carousels.
- No scroll-jacking.
- No parallax required for comprehension.
- Never animate prices, ratings, or critical checkout information in a way that delays reading.

## Storefront truth rules

Only render claims supported by current data.

Allowed examples:

- real product/category counts;
- real review counts/ratings when reviews exist;
- instant delivery where the existing product flow actually supports it;
- secure checkout and clear licensing where already supported by the product.

Do not invent sales counts, customer counts, popularity rankings, fake reviews, fake urgency, or synthetic bestseller labels.

## Responsive rules

- 320–430px must be treated as a primary storefront viewport, not a scaled desktop layout.
- Actions need comfortable touch targets.
- Product cards may become denser but must preserve name, image, price, and primary action.
- Avoid horizontal page overflow.
- Hero artwork may simplify or disappear on small screens; the buying/search task must not.

## Accessibility

- Preserve semantic links/buttons and keyboard behavior from existing components.
- Maintain visible focus states.
- Decorative imagery should remain hidden from assistive technology where it duplicates product links.
- Respect `prefers-reduced-motion` through the existing Motion configuration.
- Text contrast must remain readable in both light and dark themes.

## Activation checklist

Before replacing the production homepage:

1. Rebase on current `main`.
2. Review open Claude/v0 PRs for overlapping homepage/data work.
3. Run typecheck, lint, and production build.
4. Verify `/redesign-preview` at mobile, tablet, and desktop widths.
5. Test product links, search, cart actions, quick preview, theme switching, and keyboard navigation.
6. Activate via a small integration commit rather than copying redesign code into legacy components.
