import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

/**
 * Lint configuration for the "Lint" required check.
 *
 * Next.js 16 removed `next lint`; this is the equivalent flat config using
 * the official eslint-config-next presets (core-web-vitals + TypeScript).
 */
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // One-off data scripts and audit tooling are not part of the shipped app.
    "scripts/**",
    "drizzle/**",
  ]),
])
