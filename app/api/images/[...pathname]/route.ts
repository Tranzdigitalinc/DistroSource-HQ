import { get } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

// Serves product preview/cover images from private Blob storage.
// These are public-facing marketing assets (no entitlement check) — unlike
// /api/downloads/[fileId], which gates purchasable product files.
export async function GET(request: NextRequest, { params }: { params: Promise<{ pathname: string[] }> }) {
  const { pathname: segments } = await params
  const pathname = segments.join("/")

  try {
    const result = await get(pathname, {
      access: "private",
      ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    })

    if (!result) {
      return new NextResponse("Not found", { status: 404 })
    }

    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: { ETag: result.blob.etag, "Cache-Control": "public, max-age=31536000, immutable" },
      })
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "image/png",
        ETag: result.blob.etag,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("[v0] Error serving product image:", error)
    return new NextResponse("Not found", { status: 404 })
  }
}
