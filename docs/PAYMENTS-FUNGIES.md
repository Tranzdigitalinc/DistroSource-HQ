# Fungies payments

[Fungies](https://fungies.io) is a merchant of record for digital products: it
takes the payment, charges the right tax and pays out. API reference:
https://docs.fungies.io

Off by default. The option only appears at checkout when every variable below
is set, because without the webhook secret nothing could be fulfilled.

## Configuration

| Variable | Where it comes from |
| --- | --- |
| `FUNGIES_PUBLIC_KEY` | Dashboard → Developers → API keys (`pub_…`) |
| `FUNGIES_SECRET_KEY` | Same key pair (`sec_…`). Server-only. |
| `FUNGIES_PRODUCT_ID` | The reusable product every order's offer hangs off (see below) |
| `FUNGIES_STORE_URL` | Your store address, e.g. `https://distrosource.fungies.io` |
| `FUNGIES_WEBHOOK_SECRET` | The string you choose when creating the webhook |

### One-time setup

**1. Create the reusable product.** Every DistroSource order becomes its own
priced *offer*, but Fungies requires offers to belong to a product. Create one
and keep its id:

```bash
curl -X POST "https://api.fungies.io/v0/products/create" \
  -H "x-fngs-public-key: pub_…" -H "x-fngs-secret-key: sec_…" \
  -H "Content-Type: application/json" \
  -d '{ "name": "DistroSource order", "type": "DigitalDownload" }'
```

`data.product.id` is `FUNGIES_PRODUCT_ID`.

**2. Register the webhook.** It must be publicly reachable, so use the
deployed URL, not localhost:

```bash
curl -X POST "https://api.fungies.io/v0/webhooks/create" \
  -H "x-fngs-public-key: pub_…" -H "x-fngs-secret-key: sec_…" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://distrosource.com/api/webhooks/fungies",
    "status": "active",
    "secret": "<the same value as FUNGIES_WEBHOOK_SECRET, 16+ chars>",
    "events": ["payment_success"]
  }'
```

**3. Authorize this domain.** The checkout opens as an **overlay on our own
page**, which means Fungies serves it in an iframe and sets `frame-ancestors`
from its Authorized Domains list. Add the production domain (and any preview
domain you test on) under Developers → Authorized Domains in the dashboard.

This is the one step that fails silently: on an unlisted domain the browser
refuses the frame and the buyer sees an empty overlay with **no JavaScript
error**. If the overlay opens blank, check this first.

**4. Currency.** A Fungies workspace holds exactly one currency, seeded by the
first product or offer created in it. DistroSource prices in USD, so that
workspace must be USD or every offer is rejected with
`400 OFFER_CURRENCY_MISMATCH`.

No database change is required — see "Correlation" below.

## Flow

1. `createFungiesCheckout` (lib/actions/checkout.ts) prices the cart
   server-side, writes a `pending_payment` order with
   `paymentMethod = "fungies"`, then creates a Fungies **offer** for exactly
   that total with `limit: 1` and `externalId = <our order number>`.
2. It then wraps that offer in a **checkout element** and returns its URL.
   The client opens it with the Fungies SDK as a full-screen overlay on the
   checkout page — no second tab — with email and name prefilled. Only an
   element URL can be rendered this way; a bare `/checkout/{offerId}` link is
   hosted-only.
3. Fungies POSTs `payment_success` to `/api/webhooks/fungies`. The route
   verifies `x-fngs-signature` against the **raw** body, finds the order via
   the offer's `internalId`, and calls the shared `fulfillPendingOrder`.
4. The page polls our own order row every 3 seconds and redirects to the
   success page as soon as it flips to completed. The SDK's
   `fungies:checkout:complete` event only switches the copy to "confirming" —
   it never grants access on its own, because only the webhook proves payment.

## Correlation

The offer's `externalId` is set to the DistroSource order number at creation
and comes back as `internalId` inside the webhook's `data.items[].offer`. That
is the whole link — no new column or table is needed on our side, and because
each offer has `limit: 1`, a checkout URL cannot be paid twice.

## Overlay specifics

- The SDK (`@fungies/fungies-js`) is imported lazily inside an effect: it
  touches `window` at module scope and must not reach the server render.
- `next.config.mjs` allows `https://*.fungies.io` in `frame-src` and
  `connect-src`, plus `FUNGIES_STORE_URL`'s origin if you move the store to a
  custom domain.
- If the buyer dismisses the overlay, nothing is charged and the page offers
  "Resume payment", which reopens the same element.
- Redirect payment methods (iDEAL, Bancontact and similar) navigate away from
  the page and come back; Fungies' own confirm-payment prompt handles that,
  and our poll picks the order up either way.

## Safety properties

- The amount is fixed server-side at offer creation; the hosted checkout
  cannot charge a different total.
- The webhook signature is verified with a timing-safe comparison before the
  payload is trusted.
- Fulfilment is idempotent: `fulfillPendingOrder` only acts on a
  `pending_payment` order, so at-least-once delivery cannot double-grant.
- If the offer call fails, the pending order and its items are deleted and the
  cart is untouched.
- An amount mismatch beyond one cent is logged for review but does not block a
  payment the provider has already settled.

## Notes

- Fungies has no separate test mode for payments — a checkout you complete is
  a real charge. Use `POST /v0/webhooks/sendTestEvent` to exercise the webhook
  without paying.
- Minimum order is $0.50 (`FUNGIES_MIN_USD`), above the API's own $0.01 floor,
  because card processing below that is more likely to be declined than paid.
- Refunds are issued from the Fungies dashboard. `payment_refunded` is
  acknowledged by the route but does not revoke access automatically; handle
  refunds in the admin as with the other providers.
