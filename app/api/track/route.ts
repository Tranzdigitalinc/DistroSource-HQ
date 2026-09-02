import { type NextRequest, NextResponse, after } from "next/server"
import { db } from "@/lib/db"
import { visitorLogs } from "@/lib/db/schema"
import { parseDeviceType } from "@/lib/user-agent"
import { ensureReputationFresh } from "@/lib/abuseipdb"

function truncate(value: string | null | undefined, max: number) {
  if (!value) return null
  return value.slice(0, max)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const path = typeof body?.path === "string" ? body.path : null
    if (!path) return NextResponse.json({ ok: false }, { status: 400 })

    const visitorId = request.cookies.get("rc_vid")?.value ?? "unknown"
    const userAgent = request.headers.get("user-agent") ?? ""
    const ipAddress =
      request.headers.get("x-real-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      null

    await db.insert(visitorLogs).values({
      visitorId,
      path: truncate(path, 500) ?? path,
      referrer: truncate(typeof body?.referrer === "string" ? body.referrer : null, 500),
      ipAddress: truncate(ipAddress, 64),
      country: request.headers.get("x-vercel-ip-country"),
      deviceType: parseDeviceType(userAgent),
      userAgent: truncate(userAgent, 500),
    })

    const cleanIp = truncate(ipAddress, 64)
    if (cleanIp) {
      after(() => ensureReputationFresh(cleanIp).catch(() => {}))
    }

    return NextResponse.json({ ok: true })
  } catch {
    // Telemetry must never break the site — swallow and report ok:false.
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
