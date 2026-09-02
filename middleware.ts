import { NextResponse, type NextRequest } from "next/server"

const REFERRAL_COOKIE = "rc_ref"
const AFFILIATE_COOKIE = "rc_aff"
const VISITOR_COOKIE = "rc_vid"
const ATTRIBUTION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days, first-touch attribution
const VISITOR_MAX_AGE = 60 * 60 * 24 * 365 // 1 year, stable anonymous visitor id

// Site-wide maintenance mode. Flip to `false` to bring the storefront back online.
const MAINTENANCE_MODE = true

// Paths that must stay reachable even during maintenance: the maintenance
// page itself, admin (so staff can keep working), auth (so admins can sign
// in), the API, and static/build assets.
const MAINTENANCE_ALLOWLIST = ["/maintenance", "/admin", "/sign-in", "/api"]

// Any request for a file (has an extension, e.g. /images/logo.png, /icon.png,
// /manifest.webmanifest) is a static asset, not a page — always let it through.
const STATIC_FILE_PATTERN = /\.[a-zA-Z0-9]+$/

function isAllowedDuringMaintenance(pathname: string) {
  if (STATIC_FILE_PATTERN.test(pathname)) return true
  return MAINTENANCE_ALLOWLIST.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  if (MAINTENANCE_MODE && !isAllowedDuringMaintenance(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = "/maintenance"
    const response = NextResponse.rewrite(url, { status: 503 })
    response.headers.set("Retry-After", "3600")
    return response
  }

  const ref = searchParams.get("ref")
  const aff = searchParams.get("aff")
  const hasVisitorId = Boolean(request.cookies.get(VISITOR_COOKIE))

  if (!ref && !aff && hasVisitorId) return NextResponse.next()

  const response = NextResponse.next()

  if (!hasVisitorId) {
    response.cookies.set(VISITOR_COOKIE, crypto.randomUUID(), {
      maxAge: VISITOR_MAX_AGE,
      path: "/",
      sameSite: "lax",
    })
  }

  // First-touch attribution: never overwrite a cookie that's already set.
  if (ref && !request.cookies.get(REFERRAL_COOKIE) && /^[A-Za-z0-9_-]{3,32}$/.test(ref)) {
    response.cookies.set(REFERRAL_COOKIE, ref.toUpperCase(), {
      maxAge: ATTRIBUTION_MAX_AGE,
      path: "/",
      sameSite: "lax",
    })
  }
  if (aff && !request.cookies.get(AFFILIATE_COOKIE) && /^[A-Za-z0-9_-]{3,32}$/.test(aff)) {
    response.cookies.set(AFFILIATE_COOKIE, aff.toUpperCase(), {
      maxAge: ATTRIBUTION_MAX_AGE,
      path: "/",
      sameSite: "lax",
    })
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
}
