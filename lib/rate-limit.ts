import "server-only"

import { pool } from "@/lib/db"
import { getClientIpAddress } from "@/lib/request-ip"

/**
 * Postgres-backed fixed-window rate limiter.
 *
 * Why not in-memory: every Vercel function instance has its own heap, and
 * instances scale horizontally. A `Map` counter therefore limits nothing —
 * an attacker spreading requests across instances is unlimited, and the
 * numbers are wrong even for honest traffic. The counter has to live in
 * shared state, and Postgres is already the one shared store this project
 * has (adding Redis/Upstash would be a new dependency and a new failure mode).
 *
 * The increment is a single atomic `INSERT … ON CONFLICT DO UPDATE`, so
 * concurrent requests cannot interleave a read-modify-write.
 *
 * FAILURE MODE — deliberately fail-open, loudly:
 * If the limiter itself errors (table missing, database unreachable), the
 * request is allowed and the error is logged. Rate limiting is a mitigation,
 * not an authorization boundary; every endpoint it protects has its own
 * authentication and validation. Failing closed here would convert a limiter
 * outage into a total sign-in and checkout outage, which is a strictly worse
 * incident. Authorization never depends on this module.
 *
 * ACTIVATION: requires the `rate_limits` table, which does NOT yet exist in
 * production. Until the baseline migration is applied (see
 * docs/DATABASE-MIGRATIONS.md) every call here fails open and logs. The code
 * is correct and inert, not silently broken.
 */

export interface RateLimitRule {
  /** Rolling window length in seconds. */
  windowSeconds: number
  /** Maximum requests permitted per key within the window. */
  max: number
}

export interface RateLimitResult {
  allowed: boolean
  /** Seconds until the caller may retry. Null when allowed. */
  retryAfter: number | null
  /** True when the limiter could not run and the request was let through. */
  degraded: boolean
}

let missingTableLogged = false

/**
 * Consumes one unit against `key`. Returns whether the caller may proceed.
 */
export async function consumeRateLimit(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
  try {
    const { rows } = await pool.query<{ count: number; retry_after: number }>(
      `INSERT INTO rate_limits (key, count, "windowStart")
       VALUES ($1, 1, now())
       ON CONFLICT (key) DO UPDATE SET
         count = CASE
           WHEN rate_limits."windowStart" < now() - make_interval(secs => $2::double precision)
           THEN 1 ELSE rate_limits.count + 1 END,
         "windowStart" = CASE
           WHEN rate_limits."windowStart" < now() - make_interval(secs => $2::double precision)
           THEN now() ELSE rate_limits."windowStart" END
       RETURNING
         count,
         ceil(extract(epoch from ("windowStart" + make_interval(secs => $2::double precision)) - now()))::int AS retry_after`,
      [key, rule.windowSeconds],
    )

    const row = rows[0]
    if (!row) return { allowed: true, retryAfter: null, degraded: true }

    if (row.count > rule.max) {
      return { allowed: false, retryAfter: Math.max(1, row.retry_after), degraded: false }
    }
    return { allowed: true, retryAfter: null, degraded: false }
  } catch (error) {
    // 42P01 = undefined_table. Expected until the migration lands; log once
    // rather than on every request.
    const code = (error as { code?: string })?.code
    if (code === "42P01") {
      if (!missingTableLogged) {
        missingTableLogged = true
        console.error(
          "[rate-limit] `rate_limits` table is missing — rate limiting is INACTIVE. Apply the baseline migration.",
        )
      }
    } else {
      console.error("[rate-limit] Limiter failed; allowing request.", error)
    }
    return { allowed: true, retryAfter: null, degraded: true }
  }
}

/** Thrown by `enforceRateLimit`. Message is safe to surface to the caller. */
export class RateLimitError extends Error {
  readonly retryAfter: number
  constructor(retryAfter: number) {
    super(
      retryAfter > 60
        ? `Too many attempts. Please try again in about ${Math.ceil(retryAfter / 60)} minutes.`
        : `Too many attempts. Please try again in ${retryAfter} seconds.`,
    )
    this.name = "RateLimitError"
    this.retryAfter = retryAfter
  }
}

/**
 * Enforces a limit for a named bucket, scoped to the caller's IP by default.
 * Throws `RateLimitError` when the limit is exceeded.
 *
 * Prefer a stable identifier (user id, normalized email) over IP where one is
 * available, since shared NAT/CGNAT means many legitimate users share an IP.
 */
export async function enforceRateLimit(
  bucket: string,
  rule: RateLimitRule,
  identifier?: string,
): Promise<void> {
  const id = identifier ?? (await getClientIpAddress()) ?? "unknown"
  const result = await consumeRateLimit(`${bucket}:${id}`, rule)
  if (!result.allowed) throw new RateLimitError(result.retryAfter ?? rule.windowSeconds)
}

/**
 * Shared limits. Tuned to be invisible to real users and meaningful against
 * scripted abuse; every one of these is an endpoint that costs money, sends
 * mail, or leaks information when hammered.
 */
export const RATE_LIMITS = {
  /** Sends an email to an arbitrary address. */
  contact: { windowSeconds: 3600, max: 5 },
  newsletter: { windowSeconds: 3600, max: 5 },
  /** Creates a Polar checkout session — a real API call to the provider. */
  checkoutCreate: { windowSeconds: 600, max: 10 },
  /** Otherwise allows unlimited coupon-code enumeration. */
  couponValidate: { windowSeconds: 300, max: 20 },
  freeClaim: { windowSeconds: 3600, max: 20 },
  /** Guards against bulk scraping of purchased files. */
  download: { windowSeconds: 3600, max: 120 },
  /** Better Auth endpoints (sign-in, sign-up, reset, verification). */
  auth: { windowSeconds: 900, max: 20 },
} as const satisfies Record<string, RateLimitRule>
