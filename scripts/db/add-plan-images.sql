-- Plan cover images: one optional image per membership plan, shown on the
-- /subscriptions cards. Covers live in the repo at public/images/plans and
-- are referenced by path, so no external storage is involved.
--
-- Run as the database owner in the Neon SQL editor; the app's role cannot run
-- DDL. Safe to rerun. Existing rows are untouched: NULL hides the image.

BEGIN;

ALTER TABLE membership_plans
  ADD COLUMN IF NOT EXISTS "imageUrl" text;

COMMIT;
