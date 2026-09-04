/** @type {import('next').NextConfig} */

// Polar's hosted checkout is embedded in an iframe on /checkout. Both the
// production and sandbox origins are listed so the same policy works in either
// POLAR_SERVER mode without editing headers per environment.
const POLAR_ORIGINS = ['https://polar.sh', 'https://sandbox.polar.sh']

// Vercel Web Analytics. In production the script is same-origin
// (/_vercel/insights/script.js); in development and preview it is fetched from
// va.vercel-scripts.com, so both are allowed for script and beacon traffic.
const VERCEL_ANALYTICS_ORIGINS = ['https://va.vercel-scripts.com']

// Product and category imagery is served from Vercel Blob, plus flagcdn for
// the currency/region flags in the header.
const IMAGE_ORIGINS = ['https://*.public.blob.vercel-storage.com', 'https://flagcdn.com']

const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline'/'unsafe-eval' are still required by the Next.js runtime and
  // Tailwind's injected styles. Moving to a nonce-based policy needs middleware
  // changes and is tracked as follow-up work, not a blocker for enabling the
  // rest of this policy.
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${VERCEL_ANALYTICS_ORIGINS.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${IMAGE_ORIGINS.join(' ')}`,
  "font-src 'self' data:",
  `connect-src 'self' ${VERCEL_ANALYTICS_ORIGINS.join(' ')} ${POLAR_ORIGINS.join(' ')}`,
  // Without this the Polar checkout iframe is blocked and no customer can pay.
  `frame-src 'self' ${POLAR_ORIGINS.join(' ')}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ')

const nextConfig = {
  typescript: {
    // The project typechecks clean, so a real type error should fail the
    // production build rather than ship. Previously set to true, which meant a
    // regression in payment or entitlement code could reach production.
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Still Report-Only. The policy below is now correct for the app as
          // it actually runs (Polar iframe, Vercel Analytics, Blob images), but
          // it must be observed in report mode against real traffic before the
          // header is renamed to Content-Security-Policy. Flipping it blind
          // would risk breaking checkout for every customer.
          {
            key: 'Content-Security-Policy-Report-Only',
            value: contentSecurityPolicy,
          },
        ],
      },
    ]
  },
}

export default nextConfig
