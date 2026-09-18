-- Gaming subscriptions on Tebex: alongside Fungies, a Gaming plan may now be
-- billed as a Tebex recurring payment. `provider` records which processor
-- owns the subscription; `tebexRecurringReference` is Tebex's tbx-r- id, the
-- counterpart of fungiesSubscriptionId. Safe to rerun; existing rows stay
-- 'fungies'.

BEGIN;

ALTER TABLE gaming_subscriptions
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'fungies',
  ADD COLUMN IF NOT EXISTS "tebexRecurringReference" text;

-- One Tebex recurring payment maps to at most one row; NULLs (every Fungies
-- row) are exempt from the uniqueness check.
CREATE UNIQUE INDEX IF NOT EXISTS gaming_subscriptions_tebex_recurring_uniq
  ON gaming_subscriptions ("tebexRecurringReference")
  WHERE "tebexRecurringReference" IS NOT NULL;

COMMIT;
