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

    const blob = await put(`products/${Date.now()}-${file.name}`, file, { access: "public" })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.url,
      fileName: file.name,
      fileSizeBytes: file.size,
      fileType: file.type || null,
    })
  } catch (error) {
    console.error("[v0] Admin upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
