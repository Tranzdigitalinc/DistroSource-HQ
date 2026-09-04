# Schema Drift — production vs lib/db/schema.ts

Generated: 2026-09-04T03:39:56.195Z

Read-only introspection. Nothing was altered.

## Tables

Declared in schema.ts: 33 · Present in database: 32

**In schema.ts but MISSING from production (1):**
- `rate_limits`

**In production but NOT in schema.ts (0):**
- none

## Columns

### `products`

- **Extra in production (not in schema.ts):** `polarProductId`

## Constraints and indexes

| Table | Recommended | Present? |
|---|---|---|
| entitlements | unique ("orderId", "orderItemId") | **NO** |
| orders | unique ("polarCheckoutId") | yes |
| orders | unique ("polarOrderId") | **NO** |
| orders | unique ("paypalOrderId") | **NO** |
| cart_items | unique ("userId","productId","licenseId") | **NO** |
| entitlements | index ("userId") | **NO** |
| orders | index ("userId") | **NO** |
| order_items | index ("orderId") | **NO** |
| download_events | index ("userId") | **NO** |

Total unique constraints in database: 14
Total indexes in database: 51

## Baseline verdict

**DO NOT baseline yet.** Drift is listed above. Reconcile each item —
decide whether `schema.ts` is wrong or production is behind — before
generating migration `0000`. Baselining over drift means the next
generated migration will contain unintended DDL, possibly against live
order data.
