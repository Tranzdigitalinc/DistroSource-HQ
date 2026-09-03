import { headers } from "next/headers"
import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-emails"

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    // The Blob store backing this project is private, so blob.url is not
    // publicly fetchable. We return two different handles for two different
    // consumers: `url` is a ready-to-render path through our own public image
    // route (for preview images), and `pathname` is the raw blob pathname
    // (for downloadable files, which are streamed through the entitlement-
    // checked /api/downloads route instead).
    const blob = await put(`products/${Date.now()}-${file.name}`, file, { access: "private" })

    return NextResponse.json({
      url: `/api/blob-image?pathname=${encodeURIComponent(blob.pathname)}`,
      pathname: blob.pathname,
      fileName: file.name,
      fileSizeBytes: file.size,
      fileType: file.type || null,
    })
  } catch (error) {
    console.error("[v0] Admin upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
