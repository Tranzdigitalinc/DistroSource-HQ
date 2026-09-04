# Database migrations

## Current state

The production database was built by hand-written one-off scripts
(`scripts/db/add-polar-fields.mjs`, `scripts/catalog/seed*.mjs`). There is no
migration history table and no versioned SQL. `lib/db/schema.ts` is the
intended source of truth, but **nothing verifies that production actually
matches it**.

`drizzle-kit` and `drizzle.config.ts` are now in place. No migration has been
generated or applied.

## Can the existing schema be baselined safely?

**Yes in principle, but it is not yet verified — and it must not be attempted
without a drift check first.**

Baselining is non-destructive by definition: it records "the database already
looks like this" without executing DDL. The risk is not the baseline itself,
it is baselining against a schema snapshot that does **not** match reality. If
production has a column, index, or default that `schema.ts` does not describe,
the first real migration generated afterwards will contain a diff nobody
intended — potentially a `DROP COLUMN` against live order data.

This cannot be confirmed from the repository alone. It requires read access to
the production database, which this audit did not have.

## Required procedure

### Step 0 — Automated drift report (read-only)

```bash
corepack pnpm audit:schema
```

`scripts/audit/schema-drift.mjs` sets `default_transaction_read_only = on` and
reads `information_schema` / `pg_catalog` only. It writes `docs/SCHEMA-DRIFT.md`
comparing production against `lib/db/schema.ts` — missing/extra tables, missing/
extra columns, nullability mismatches — and checks for the recommended
constraints and indexes listed below. It ends with an explicit
**safe / do-not-baseline** verdict.

### Step 1 — Confirm with drizzle-kit (read-only, on a restored copy)

Against a **restored copy** of production, never production itself:

```bash
DATABASE_URL="postgres://…restored-copy…" corepack pnpm exec drizzle-kit generate --name drift-probe
```

Then read the generated SQL in `drizzle/`.

- **Empty migration** → `schema.ts` matches the database. Safe to baseline.
- **Non-empty** → the file *is* the drift report. Reconcile before going
  further: for each statement decide whether `schema.ts` is wrong (fix the
  schema) or the database is genuinely behind (that statement becomes part of
  a real, reviewed migration).

Delete the probe migration afterwards either way.

### Step 2 — Baseline

Once the probe comes back empty:

```bash
corepack pnpm exec drizzle-kit generate --name 0000_baseline
```

This writes the full current schema as migration `0000`. Then mark it as
already applied in production **without executing it** — Drizzle's
`__drizzle_migrations` table is what tracks this. Applying `0000` normally
would attempt to `CREATE TABLE` over live tables and fail.

### Step 3 — Normal workflow from then on

```bash
# after editing lib/db/schema.ts
corepack pnpm exec drizzle-kit generate --name describe_the_change
# review the SQL by hand, commit it with the schema change
corepack pnpm exec drizzle-kit migrate
```

## Rules

- **Never `drizzle-kit push` against production.** It diffs and applies with no
  reviewable SQL and no recorded history.
- Every generated migration is read by a human before it is committed.
- Take a backup/snapshot before the first applied migration.
- `scripts/db/*.mjs` are frozen. Do not add new ad-hoc schema scripts; they are
  what created this situation. They are kept only as a record of how the
  current schema came to be.

## New table required before rate limiting works

`rate_limits` was added to `lib/db/schema.ts` and **does not exist in
production**. Until it is created, `lib/rate-limit.ts` fails open and logs
once — rate limiting is inert, not broken. It is part of the first real
migration after baselining:

```sql
CREATE TABLE rate_limits (
  key          text PRIMARY KEY,
  count        integer NOT NULL DEFAULT 0,
  "windowStart" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX rate_limits_window_start_idx ON rate_limits ("windowStart");
```

The index supports periodic pruning of expired rows. Consider a scheduled
`DELETE FROM rate_limits WHERE "windowStart" < now() - interval '1 day'`.

## Constraints worth adding once migrations work

Identified during the audit, all currently absent (see the audit report):

- `entitlements` — unique on `(orderId, orderItemId)`. The Polar webhook
  currently prevents duplicate entitlements with a `SELECT`-then-`INSERT`,
  which is a race, not a guarantee. A unique index makes duplicate fulfilment
  impossible at the database level.
- `orders.polarCheckoutId` / `orders.polarOrderId` — unique where not null.
- `orders.paypalOrderId` — unique where not null (PayPal capture idempotency
  currently relies on the same non-atomic check).
- `cartItems` — unique on `(userId, productId, licenseId)`.
- Indexes on `entitlements.userId`, `orders.userId`, `orderItems.orderId`,
  `downloadEvents.userId` — all are frequent lookup paths with no index today.

None of these are applied. Each needs a duplicate-row check before the
constraint can be created.
