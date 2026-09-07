# Card2Crypto payments

Card2Crypto (https://card2crypto.org) is a hosted gateway: the customer pays by
card, Apple Pay, Google Pay or SEPA/ACH bank transfer on the provider's page and
DistroSource is settled instantly in USDC on Polygon. API reference:
https://documenter.getpostman.com/view/40408788/2sAYHxo4T5

## Configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `CARD2CRYPTO_PAYOUT_ADDRESS` | to enable the option | Your USDC (Polygon) wallet, `0x…` (40 hex chars). Payouts land here. |
| `NEXT_PUBLIC_APP_URL` | already required | Base of the callback URL Card2Crypto calls when a payment lands. |

When `CARD2CRYPTO_PAYOUT_ADDRESS` is unset the option is hidden from checkout
and the server action refuses to start a Card2Crypto order.

## Database

Run once against each database (idempotent):

```bash
node scripts/db/add-card2crypto-fields.mjs
```

It creates the `card2crypto_payments` table that `lib/db/schema.ts` declares. The
`orders` table is not modified.

The application's `DATABASE_URL` role is **not** allowed to create tables
(`permission denied for schema public`), so run this once in the Neon SQL
editor as the owner role instead:

```sql
CREATE TABLE IF NOT EXISTS card2crypto_payments (
  id serial PRIMARY KEY,
  "orderId" integer NOT NULL UNIQUE REFERENCES orders(id),
  "addressIn" text NOT NULL,
  "polygonAddress" text NOT NULL,
  "ipnToken" text NOT NULL,
  "callbackToken" text NOT NULL,
  "paidAt" timestamp,
  "paidAmount" numeric(10, 2),
  txid text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON card2crypto_payments TO <app role>;
GRANT USAGE, SELECT ON SEQUENCE card2crypto_payments_id_seq TO <app role>;
```

Until the table exists, the Card2Crypto option must stay disabled (leave
`CARD2CRYPTO_PAYOUT_ADDRESS` unset); every other checkout path is unaffected.

## Flow

1. `createCard2CryptoCheckout` (lib/actions/checkout.ts) prices the cart
   server-side, writes a `pending_payment` order with `paymentMethod =
   "card2crypto"`, then asks `wallet.php` for a temporary receiving wallet. The
   callback URL it registers is
   `/api/payments/card2crypto/callback?order=<number>&token=<random>`.
2. The buyer is sent to the hosted "smart" page (`pay.php`) in a new tab. The
   amount is fixed from our pricing; Card2Crypto forbids embedding, so it is
   never an iframe.
3. When the buyer pays, Card2Crypto's bot GETs the callback. The route checks
   the token and the `address_in`, then `settleCard2CryptoOrder` re-verifies
   with `payment-status.php` (using the stored `ipn_token`) before calling the
   shared `fulfillPendingOrder`.
4. Meanwhile the checkout tab polls our own database every 4 s and offers an
   explicit "I've paid, check now" button, which is the only place the
   provider's status endpoint is called on demand (Card2Crypto asks that it is
   not polled).

Payments that arrive more than 3 % short of the order total are recorded in
`card2crypto_payments.paidAmount` but the order is left pending for manual review.

Note: the Postman docs list the status endpoint under `card2crypto.org`, which
serves an HTML 404. The working JSON endpoint is
`https://api.card2crypto.org/control/payment-status.php`, which is what
`lib/card2crypto.ts` uses.
