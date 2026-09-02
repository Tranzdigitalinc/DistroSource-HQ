import { get } from "@vercel/blob"
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

  const blob = await get(result.file.blobPathname, { access: "private" })
  if (!blob) {
    return NextResponse.json({ error: "File is unavailable" }, { status: 404 })
  }

  return new NextResponse(blob.stream, {
    headers: {
      "Content-Type": blob.blob.contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${result.file.fileName}"`,
      "Cache-Control": "private, no-cache",
    },
  })
}
