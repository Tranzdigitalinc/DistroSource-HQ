import { type NextRequest, NextResponse } from "next/server"
import { getResetLink } from "@/lib/reset-link-store"

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")
  if (!email) return NextResponse.json({ url: null })
  const url = getResetLink(email)
  return NextResponse.json({ url })
}
