import { type NextRequest, NextResponse } from "next/server"
import { restoreAbandonedCart } from "@/lib/actions/recovery"

// Restoring an abandoned cart creates a guest cookie (when the visitor isn't
// signed in) and writes to the database. Next.js only allows cookie mutation
// from a Server Action invoked by a client mutation or from a Route Handler
// — never from a Server Component's render. This route is the sanctioned
// place to do that write, then it redirects into the checkout page which can
// safely read (but not create) the resulting cookie during its own render.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  const url = request.nextUrl.clone()
  url.search = ""

  if (!token) {
    url.pathname = "/cart"
    return NextResponse.redirect(url)
  }

  const result = await restoreAbandonedCart(token)
  url.pathname = result.success ? "/checkout" : "/cart"
  return NextResponse.redirect(url)
}
