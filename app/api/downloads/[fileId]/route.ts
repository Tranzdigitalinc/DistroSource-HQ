import { type NextRequest, NextResponse } from "next/server"
import { authorizeDownload } from "@/lib/downloads"
import { getOptionalUserId } from "@/lib/session"

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

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null

  const result = await authorizeDownload(userId, parsedId, ipAddress ?? undefined)
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 403 })
  }

  // The Blob store backing this project is a public store, so files are kept at an unguessable
  // (randomly-suffixed) URL and are never linked to directly from the app. This route is the only
  // sanctioned path to a file: it re-verifies entitlement above, then proxies the bytes through so
  // no blob URL is ever exposed to the client.
  const blobResponse = await fetch(result.file.blobPathname)
  if (!blobResponse.ok || !blobResponse.body) {
    return NextResponse.json({ error: "File is unavailable" }, { status: 404 })
  }

  return new NextResponse(blobResponse.body, {
    headers: {
      "Content-Type": blobResponse.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${result.file.fileName}"`,
      "Cache-Control": "private, no-cache",
    },
  })
}
