import { NextResponse } from "next/server"
import { sendAbandonedCartReminders } from "@/lib/actions/recovery"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await sendAbandonedCartReminders()
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("[v0] Abandoned cart reminder job failed:", error)
    return NextResponse.json({ success: false, error: "Reminder job failed" }, { status: 500 })
  }
}
