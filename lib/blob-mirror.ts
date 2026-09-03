import { put } from "@vercel/blob"

// Downloads an externally-hosted image (e.g. from Envato's S3 buckets) and
// re-uploads it to our own Blob store, so the catalog keeps serving images
// even if the source API key is revoked or the source item disappears.
// Falls back to the original URL if the fetch/upload fails.
export async function mirrorUrlToBlob(sourceUrl: string, folder: string): Promise<string> {
  try {
    const res = await fetch(sourceUrl, { cache: "no-store" })
    if (!res.ok) return sourceUrl

    const contentType = res.headers.get("content-type") || "image/jpeg"
    const arrayBuffer = await res.arrayBuffer()
    const ext = contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
        ? "webp"
        : contentType.includes("gif")
          ? "gif"
          : "jpg"
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const blob = await put(fileName, Buffer.from(arrayBuffer), {
      access: "public",
      contentType,
    })
    return blob.url
  } catch (error) {
    console.error("[v0] Failed to mirror image to blob storage:", error)
    return sourceUrl
  }
}
