import { get } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

// Serves preview images (product thumbnails, cover art, gallery shots) out of
// the private Blob store. These are not sensitive — every visitor should be
// able to see them — so this route intentionally does not check auth. It
// exists only because a private store's blob.url is not directly fetchable;
// every image reference in the app points here instead, with the raw blob
// pathname as a query param.
export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname")
  if (!pathname) {
    return NextResponse.json({ error: "Missing pathname" }, { status: 400 })
  }

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
        headers: {
          ETag: result.blob.etag,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      })
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "image/jpeg",
        ETag: result.blob.etag,
        // Pathnames are unique per upload (timestamp + random suffix), so the
        // content behind a given pathname never changes — safe to cache hard.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("[v0] Failed to serve blob image:", error)
    return new NextResponse("Not found", { status: 404 })
  }
}
