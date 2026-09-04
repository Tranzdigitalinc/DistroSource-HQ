import { type NextRequest, NextResponse } from "next/server"
import { restoreAbandonedCart } from "@/lib/actions/recovery"

/**
 * Restoring an abandoned cart calls getOwnerId(), which creates a guest
 * cookie when the visitor is signed out. Cookie writes are only allowed from
 * Server Actions and Route Handlers — never from a page's own render — so
 * this restore must happen here, not inline in app/checkout/page.tsx.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  const url = request.nextUrl.clone()
  url.search = ""

  if (!token) {
    url.pathname = "/cart"
    return NextResponse.redirect(url)
  }

  const restored = await restoreAbandonedCart(token)
  url.pathname = restored.success ? "/checkout" : "/cart"
  return NextResponse.redirect(url)
}
