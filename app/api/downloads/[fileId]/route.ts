import { get } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { authorizeDownload } from "@/lib/downloads"
import { getOptionalUserId } from "@/lib/session"
import { RATE_LIMITS, RateLimitError, enforceRateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params
  const parsedId = Number.parseInt(fileId, 10)
  if (!Number.isFinite(parsedId)) {
    return NextResponse.json({ error: "Invalid file id" }, { status: 400 })
  }

  const userId = await getOptionalUserId()
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 })
  }

  // Per-user, not per-IP: this guards against one account bulk-scraping the
  // library it has access to, which an IP key would not catch behind CGNAT.
  try {
    await enforceRateLimit("download", RATE_LIMITS.download, userId)
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: 429, headers: { "Retry-After": String(error.retryAfter) } },
      )
    }
    throw error
  }

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null

  const result = await authorizeDownload(userId, parsedId, ipAddress ?? undefined)
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 403 })
  }

  // The Blob store backing this project is private, so files are never linked to directly from the
  // app. This route is the only sanctioned path to a file: it re-verifies entitlement above, then
  // streams the bytes through via get() so no blob URL or read token is ever exposed to the client.
  const blobResult = await get(result.file.blobPathname, { access: "private" })
  if (!blobResult) {
    return NextResponse.json({ error: "File is unavailable" }, { status: 404 })
  }

  return new NextResponse(blobResult.stream, {
    headers: {
      "Content-Type": blobResult.blob.contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${result.file.fileName}"`,
      "Cache-Control": "private, no-cache",
    },
  })
}
