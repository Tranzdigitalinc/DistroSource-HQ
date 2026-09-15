-- Gaming subscriptions — see lib/db/schema.ts (gamingSubscriptions) and
-- lib/gaming/billing.ts. Run once as the database owner in the Neon console
-- (SQL Editor). Safe to rerun: every statement is IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS gaming_subscriptions (
  id serial PRIMARY KEY,
  reference text NOT NULL UNIQUE,
  "userId" text NOT NULL,
  "productSlug" text NOT NULL,
  interval text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  "priceUsd" numeric(10, 2) NOT NULL,
  "billingName" text,
  "billingEmail" text NOT NULL,
  "fungiesOfferId" text,
  "fungiesSubscriptionId" text UNIQUE,
  "currentPeriodStart" timestamp,
  "currentPeriodEnd" timestamp,
  "cancelAtPeriodEnd" boolean NOT NULL DEFAULT false,
  "canceledAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gaming_subscriptions_user_idx ON gaming_subscriptions ("userId");

-- Fungies product + plan per Gaming plan, filled by Admin → Gaming → Sync to Fungies.
CREATE TABLE IF NOT EXISTS gaming_fungies_products (
  slug text PRIMARY KEY,
  "fungiesProductId" text NOT NULL,
  "fungiesPlanId" text,
  "syncedAt" timestamp NOT NULL DEFAULT now()
);

-- The site connects as claude_audit, not as the owner running this file.
GRANT SELECT, INSERT, UPDATE, DELETE ON gaming_subscriptions TO claude_audit;
GRANT USAGE, SELECT ON SEQUENCE gaming_subscriptions_id_seq TO claude_audit;
GRANT SELECT, INSERT, UPDATE, DELETE ON gaming_fungies_products TO claude_audit;
