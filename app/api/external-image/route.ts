import { type NextRequest, NextResponse } from "next/server"

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"])

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url")
  if (!rawUrl) return new NextResponse("Missing image URL", { status: 400 })

  let target: URL
  try {
    target = new URL(rawUrl)
  } catch {
    return new NextResponse("Invalid image URL", { status: 400 })
  }
  if (!ALLOWED_PROTOCOLS.has(target.protocol)) return new NextResponse("Unsupported image URL", { status: 400 })

  try {
    const response = await fetch(target, {
      headers: { Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8" },
      redirect: "follow",
      cache: "force-cache",
    })
    if (!response.ok || !response.body) return new NextResponse("Image unavailable", { status: 404 })

    const contentType = response.headers.get("content-type") ?? "image/jpeg"
    if (!contentType.startsWith("image/")) return new NextResponse("URL is not an image", { status: 415 })

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("[v0] Failed to proxy external product image:", error)
    return new NextResponse("Image unavailable", { status: 404 })
  }
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
