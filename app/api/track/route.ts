import { type NextRequest, NextResponse } from "next/server"
import { headers as nextHeaders } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { visitorLogs } from "@/lib/db/schema"
import { parseBrowser, parseDeviceType, parseOs } from "@/lib/user-agent"

function truncate(value: string | null | undefined, max: number) {
  if (!value) return null
  return value.slice(0, max)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const path = typeof body?.path === "string" ? body.path : null
    if (!path) return NextResponse.json({ ok: false }, { status: 400 })

    const action = typeof body?.action === "string" && body.action.trim() ? body.action.trim() : "page_view"
    const visitorId = request.cookies.get("rc_vid")?.value ?? "unknown"
    const userAgent = request.headers.get("user-agent") ?? ""
    const ipAddress =
      request.headers.get("x-real-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      null

    const session = await auth.api.getSession({ headers: await nextHeaders() }).catch(() => null)

    await db.insert(visitorLogs).values({
      visitorId,
      userId: session?.user?.id ?? null,
      path: truncate(path, 500) ?? path,
      action: truncate(action, 120) ?? action,
      referrer: truncate(typeof body?.referrer === "string" ? body.referrer : null, 500),
      ipAddress: truncate(ipAddress, 64),
      country: request.headers.get("x-vercel-ip-country"),
      region: request.headers.get("x-vercel-ip-country-region"),
      city: request.headers.get("x-vercel-ip-city")
        ? decodeURIComponent(request.headers.get("x-vercel-ip-city") as string)
        : null,
      deviceType: parseDeviceType(userAgent),
      browser: parseBrowser(userAgent),
      os: parseOs(userAgent),
      userAgent: truncate(userAgent, 500),
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Telemetry must never break the site — swallow and report ok:false.
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
