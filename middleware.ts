import { NextResponse, type NextRequest } from "next/server"

const REFERRAL_COOKIE = "rc_ref"
const AFFILIATE_COOKIE = "rc_aff"
const ATTRIBUTION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days, first-touch attribution

export function middleware(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const ref = searchParams.get("ref")
  const aff = searchParams.get("aff")

  if (!ref && !aff) return NextResponse.next()

  const response = NextResponse.next()

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
