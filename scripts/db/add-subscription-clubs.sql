-- Subscription clubs: extends the existing membership engine so one account
-- can hold several scoped plans ("pick & keep" claims limited to a department)
-- instead of a single store-wide tier.
--
-- Run as the database owner in the Neon SQL editor; the app's role cannot run
-- DDL. Safe to rerun. Nothing here touches existing rows: the new columns
-- default to the behaviour the three current tiers already have.

BEGIN;

ALTER TABLE membership_plans
  -- membership = the original store-wide tiers; club/bundle/all-access = new.
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'membership',
  -- Category slugs a claim may come from. [] = the whole store (tiers today).
  ADD COLUMN IF NOT EXISTS "scopeCategorySlugs" jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- Where this plan bills in Fungies. Filled by the admin sync; a plan without
  -- a Fungies plan id cannot be checked out.
  ADD COLUMN IF NOT EXISTS "fungiesProductId" text,
  ADD COLUMN IF NOT EXISTS "fungiesPlanId" text,
  -- Gaming claims per cycle. 0 until Gaming plans have real deliverables.
  ADD COLUMN IF NOT EXISTS "gamingClaims" integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS membership_plans_kind_idx ON membership_plans (kind);

-- Several active subscriptions per account are now allowed, but never two of
-- the same plan. Guest rows (userId null) are not constrained by this.
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_active_plan_uniq
  ON subscriptions ("userId", "planId")
  WHERE status = 'active' AND "userId" IS NOT NULL;

COMMIT;
