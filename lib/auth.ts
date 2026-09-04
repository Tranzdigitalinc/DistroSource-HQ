import { betterAuth } from "better-auth"
import { pool } from "@/lib/db"
import { IS_PRODUCTION, getAuthBaseUrl, getAuthSecret } from "@/lib/env"
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email"
import { consumeRateLimit } from "@/lib/rate-limit"

export const auth = betterAuth({
  database: pool,
  // Explicit rather than implicit: Better Auth silently falls back to a
  // package-default secret when this is unset, which would make session
  // cookies forgeable. getAuthSecret() throws in production if it is missing.
  ...(getAuthSecret() ? { secret: getAuthSecret()! } : {}),
  // Resolved centrally so auth cookies, verification links and reset links
  // always share the storefront's real origin. In production this refuses to
  // resolve to localhost.
  baseURL: getAuthBaseUrl(),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    // Verification is nudged, not enforced: an unverified user can still
    // sign in and complete checkout. requireEmailVerification: true also
    // silently disables autoSignIn right after signup, which broke the
    // account-creation step of checkout for brand-new guests. A persistent
    // banner (components/verify-email-banner.tsx) prompts verification
    // instead of blocking access.
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url)
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url)
    },
  },
  trustedOrigins: [
    // Localhost is only a trusted origin outside production. Leaving it in a
    // production allow-list widens CSRF/redirect surface for no benefit.
    ...(IS_PRODUCTION ? [] : ["http://localhost:3000"]),
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.V0_DEV_APP_URL ? [process.env.V0_DEV_APP_URL] : []),
    ...(process.env.V0_BUILD_URL ? [process.env.V0_BUILD_URL] : []),
    ...(process.env.V0_SANDBOX_URL ? [process.env.V0_SANDBOX_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  // Better Auth's own rate limiter, using its documented `customStorage`
  // extension point rather than a parallel implementation. Its default
  // "memory" backend is per-instance and therefore useless on Vercel, so
  // counters are delegated to the shared Postgres limiter.
  //
  // `enabled` is forced on: the default only enables it when NODE_ENV is
  // production, which would leave preview deployments unprotected.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    customStorage: {
      consume: async (key, rule) => {
        const result = await consumeRateLimit(`better-auth:${key}`, {
          windowSeconds: rule.window ?? 60,
          max: rule.max,
        })
        return { allowed: result.allowed, retryAfter: result.retryAfter }
      },
    },
    // Credential and email-sending endpoints get far tighter limits than
    // ordinary session reads. These are the brute-force and mail-abuse
    // surfaces.
    customRules: {
      "/sign-in/email": { window: 900, max: 10 },
      "/sign-up/email": { window: 3600, max: 5 },
      "/forget-password": { window: 3600, max: 5 },
      "/reset-password": { window: 3600, max: 10 },
      "/send-verification-email": { window: 3600, max: 5 },
    },
  },
  ...((process.env.NODE_ENV === "development" || process.env.V0_RUNTIME_URL)
    ? {
        advanced: {
          // Required by the cross-site v0 preview iframe. Without these
          // attributes, login succeeds but the next request appears signed out.
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
})
