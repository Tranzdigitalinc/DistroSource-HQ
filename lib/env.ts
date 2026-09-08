import "server-only"

/**
 * Centralized, server-only environment access.
 *
 * Two rules drive everything in this file:
 *
 * 1. Production fails closed. A missing critical variable must surface as a
 *    loud error, never as a silent fallback that sends a paying customer to
 *    `http://localhost:3000` or leaves an authenticated endpoint wide open.
 * 2. Development stays flexible. Localhost fallbacks are fine locally and in
 *    the v0 preview sandbox; they are never fine in production.
 *
 * This module is `server-only`, so a stray import from a client component is
 * a build error rather than a leaked secret.
 */

/**
 * True while `next build` is compiling.
 *
 * Build steps import server modules (auth, email, checkout) to collect page
 * data, but runtime secrets are frequently absent from the build environment.
 * Throwing here would turn a missing variable into a broken deploy pipeline
 * rather than a clear runtime error, so validation is deferred to the first
 * real request — which is where it can actually protect a customer.
 */
const IS_BUILD_PHASE = process.env.NEXT_PHASE === "phase-production-build"

/**
 * True only for a real production deployment.
 *
 * Deliberately keyed on `VERCEL_ENV`, not `NODE_ENV`. Vercel preview builds,
 * the v0 sandbox and a local `next build` all run with `NODE_ENV=production`
 * but legitimately use ephemeral or absent URLs; treating them as production
 * would break those workflows without protecting a single customer. Vercel
 * always sets `VERCEL_ENV`, and this project deploys only through Vercel.
 */
export const IS_PRODUCTION = process.env.VERCEL_ENV === "production"

const LOCAL_URL = "http://localhost:3000"

class MissingConfigError extends Error {
  constructor(name: string, hint?: string) {
    super(`Missing required environment variable ${name}.${hint ? ` ${hint}` : ""}`)
    this.name = "MissingConfigError"
  }
}

/** Reads a variable that must exist in every environment. */
export function requireEnv(name: string, hint?: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new MissingConfigError(name, hint)
  return value
}

/**
 * Reads a variable that is only mandatory in production. Returns null in
 * development so local work does not need a fully populated `.env`.
 */
export function requireEnvInProduction(name: string, hint?: string): string | null {
  const value = process.env[name]?.trim()
  if (value) return value
  if (IS_PRODUCTION && !IS_BUILD_PHASE) throw new MissingConfigError(name, hint)
  return null
}

function normalizeUrl(value: string): string {
  return value.replace(/\/+$/, "")
}

function isLocalhost(value: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?/i.test(value)
}

/**
 * Public origin of the storefront — the base for Polar success/return URLs,
 * emailed links, and the checkout iframe's `embed_origin`.
 *
 * In production this must be a real, non-localhost URL. If `NEXT_PUBLIC_APP_URL`
 * is unset we fall back to the Vercel-provided production domain (still a real
 * URL) and only then give up. A localhost value configured in production is
 * rejected outright: silently redirecting a customer who has just paid to
 * their own machine is worse than failing the checkout before money moves.
 */
export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (configured) {
    if (IS_PRODUCTION && !IS_BUILD_PHASE && isLocalhost(configured)) {
      throw new Error(
        "NEXT_PUBLIC_APP_URL points at localhost in production. Set it to the public DistroSource origin (e.g. https://distrosource.com).",
      )
    }
    return normalizeUrl(configured)
  }

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercelProduction) return normalizeUrl(`https://${vercelProduction}`)

  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) return normalizeUrl(`https://${vercelUrl}`)

  if (IS_PRODUCTION && !IS_BUILD_PHASE) {
    throw new MissingConfigError(
      "NEXT_PUBLIC_APP_URL",
      "It is required in production for payment redirects and emailed links.",
    )
  }

  return process.env.V0_RUNTIME_URL?.trim() ? normalizeUrl(process.env.V0_RUNTIME_URL.trim()) : LOCAL_URL
}

/**
 * Base URL Better Auth signs cookies and builds verification/reset links
 * against. Falls back to the storefront origin so the two can never drift
 * apart, and never resolves to localhost in production.
 */
export function getAuthBaseUrl(): string {
  const configured = process.env.BETTER_AUTH_URL?.trim()

  if (configured) {
    if (IS_PRODUCTION && !IS_BUILD_PHASE && isLocalhost(configured)) {
      throw new Error(
        "BETTER_AUTH_URL points at localhost in production. Set it to the public DistroSource origin.",
      )
    }
    return normalizeUrl(configured)
  }

  return getAppUrl()
}

/**
 * Secret used to authenticate Vercel Cron invocations.
 *
 * Returns null in development (cron routes stay callable locally) but throws
 * in production, so a cron endpoint can never degrade into a public,
 * unauthenticated endpoint just because the variable was forgotten.
 */
export function getCronSecret(): string | null {
  return requireEnvInProduction(
    "CRON_SECRET",
    "Cron endpoints refuse to run in production without it.",
  )
}

export function getDatabaseUrl(): string {
  return requireEnv("DATABASE_URL")
}

/**
 * Secret Better Auth signs session tokens with.
 *
 * Better Auth does NOT fail when this is missing — it falls back to a default
 * secret that ships in the package, which means anyone can forge a session
 * cookie. Production must therefore refuse to start without it.
 */
export function getAuthSecret(): string | null {
  return requireEnvInProduction(
    "BETTER_AUTH_SECRET",
    "Without it session tokens are signed with a publicly known default.",
  )
}

export function getResendApiKey(): string {
  return requireEnv("RESEND_API_KEY")
}

export function getResendFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || "DistroSource <support@distrosource.com>"
}

const POLYGON_ADDRESS = /^0x[a-fA-F0-9]{40}$/

/**
 * Merchant USDC (Polygon) wallet that Card2Crypto pays out to. The payment
 * option only appears when this is set; a malformed address is rejected so a
 * typo can never route customer money to the wrong wallet.
 */
export function getCard2CryptoPayoutAddress(): string {
  const address = requireEnv("CARD2CRYPTO_PAYOUT_ADDRESS", "Set it to your USDC (Polygon) wallet to enable Card2Crypto checkout.")
  if (!POLYGON_ADDRESS.test(address)) {
    throw new Error("CARD2CRYPTO_PAYOUT_ADDRESS is not a valid Polygon address (expected 0x followed by 40 hex characters).")
  }
  return address
}

/** True when Card2Crypto can be offered at checkout. */
export function isCard2CryptoConfigured(): boolean {
  return POLYGON_ADDRESS.test(process.env.CARD2CRYPTO_PAYOUT_ADDRESS?.trim() ?? "")
}

/**
 * Fungies API key pair. The public key authenticates every call; the secret
 * key is additionally required for writes (creating an offer). Both are
 * server-only — a public key here is still an account credential, not a
 * browser-safe token.
 */
export function getFungiesKeys(): { publicKey: string; secretKey: string } {
  return {
    publicKey: requireEnv("FUNGIES_PUBLIC_KEY", "Create a key pair at https://app.fungies.io/devs/api-keys."),
    secretKey: requireEnv("FUNGIES_SECRET_KEY", "Create a key pair at https://app.fungies.io/devs/api-keys."),
  }
}

/** The reusable Fungies product every per-order offer is created against. */
export function getFungiesProductId(): string {
  return requireEnv("FUNGIES_PRODUCT_ID", "Create one DigitalDownload product in Fungies and put its id here.")
}

/** Storefront origin Fungies hosts the checkout on, e.g. https://distrosource.fungies.io */
export function getFungiesStoreUrl(): string {
  const raw = requireEnv("FUNGIES_STORE_URL", "It is the store address shown in the Fungies dashboard.")
  const url = normalizeUrl(raw)
  if (!/^https:\/\//.test(url)) throw new Error("FUNGIES_STORE_URL must be an https origin.")
  return url
}

/** Secret that signs webhook deliveries. Set it to the value used when creating the webhook. */
export function getFungiesWebhookSecret(): string {
  return requireEnv("FUNGIES_WEBHOOK_SECRET", "Use the same string you set on the Fungies webhook.")
}

/**
 * True when Fungies can be offered at checkout. Deliberately requires the
 * webhook secret too: without it nothing could ever be fulfilled, so showing
 * the option would take money we could not deliver against.
 */
export function isFungiesConfigured(): boolean {
  return Boolean(
    process.env.FUNGIES_PUBLIC_KEY?.trim() &&
      process.env.FUNGIES_SECRET_KEY?.trim() &&
      process.env.FUNGIES_PRODUCT_ID?.trim() &&
      process.env.FUNGIES_STORE_URL?.trim() &&
      process.env.FUNGIES_WEBHOOK_SECRET?.trim(),
  )
}

/** Polar API mode. Defaults to sandbox so a misconfiguration cannot take real money. */
export function getPolarServer(): "production" | "sandbox" {
  return process.env.POLAR_SERVER?.trim() === "production" ? "production" : "sandbox"
}


/**
 * Variables that must be present for a production deployment to be able to
 * take and fulfil an order. Returns the list of problems rather than throwing,
 * so callers can decide whether to warn or fail.
 */
export function collectConfigProblems(): string[] {
  const problems: string[] = []

  const required: [string, string][] = [
    ["DATABASE_URL", "orders, catalog and entitlements are unreadable without it"],
    ["POLAR_ACCESS_TOKEN", "checkout sessions cannot be created"],
    ["POLAR_WEBHOOK_SECRET", "paid orders can never be fulfilled"],
    ["POLAR_PRODUCT_ID", "checkout sessions cannot be created"],
    ["RESEND_API_KEY", "verification, reset and order emails cannot be sent"],
    [
      "BETTER_AUTH_SECRET",
      "Better Auth falls back to a publicly known default secret, which makes session tokens forgeable",
    ],
    ["CRON_SECRET", "scheduled jobs will refuse to run"],
  ]

  for (const [name, consequence] of required) {
    if (!process.env[name]?.trim()) problems.push(`${name} is not set — ${consequence}.`)
  }

  try {
    getAppUrl()
  } catch (error) {
    problems.push(error instanceof Error ? error.message : String(error))
  }

  try {
    getAuthBaseUrl()
  } catch (error) {
    problems.push(error instanceof Error ? error.message : String(error))
  }

  if (IS_PRODUCTION && getPolarServer() !== "production") {
    problems.push("POLAR_SERVER is not 'production' — live checkout would run against Polar sandbox.")
  }

  return problems
}
