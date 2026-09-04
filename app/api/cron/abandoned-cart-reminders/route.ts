import { NextResponse } from "next/server"
import { sendAbandonedCartReminders } from "@/lib/jobs/abandoned-cart"
import { getCronSecret } from "@/lib/env"

export async function GET(request: Request) {
  // Fail closed. Previously a missing CRON_SECRET made this endpoint public,
  // so anyone could trigger a mass send of abandoned-cart emails. getCronSecret()
  // throws in production when the secret is absent, and returns null only in
  // development where the route is not internet-reachable.
  let cronSecret: string | null
  try {
    cronSecret = getCronSecret()
  } catch (error) {
    console.error("[cron] Refusing to run: CRON_SECRET is not configured.", error)
    return NextResponse.json({ error: "Cron is not configured" }, { status: 503 })
  }

  if (cronSecret) {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    const result = await sendAbandonedCartReminders()
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("[cron] Abandoned cart reminder job failed:", error)
    return NextResponse.json({ success: false, error: "Reminder job failed" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
