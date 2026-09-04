import "server-only"

import { headers } from "next/headers"

/**
 * Best-effort client IP for the current request. Only usable from Server
 * Actions / Server Components (reads the incoming request headers via
 * next/headers), matching the extraction used by the visitor tracking route.
 */
export async function getClientIpAddress(): Promise<string | null> {
  const headerList = await headers()
  const ip =
    headerList.get("x-real-ip") ??
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null
  return ip && ip.length <= 64 ? ip : null
}
