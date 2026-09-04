import type { Config } from "drizzle-kit"

/**
 * Drizzle Kit configuration.
 *
 * IMPORTANT — this project's schema was created by hand-written one-off
 * scripts (scripts/db/*.mjs), so the production database has no migration
 * history. Before any migration is applied, the existing schema must be
 * BASELINED. See docs/DATABASE-MIGRATIONS.md for the exact procedure.
 *
 * Never run `drizzle-kit push` against production: it diffs and applies
 * directly with no reviewable SQL and no history. Use `generate` (writes SQL
 * you can read) followed by `migrate` (applies and records it).
 */
export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Surfaces destructive operations in the generated SQL rather than silently
  // emitting them.
  verbose: true,
  strict: true,
} satisfies Config
