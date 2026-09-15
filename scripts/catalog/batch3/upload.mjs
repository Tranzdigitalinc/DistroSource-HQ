// Uploads each batch-3 product's three images and its ZIP (from
// package.mjs) to private Vercel Blob, recording pathnames in a manifest
// that seed.mjs reads. Requires BLOB_READ_WRITE_TOKEN. Safe to re-run:
// images overwrite in place, ZIPs get a fresh random suffix.
//
//   node --env-file=.env.local scripts/catalog/batch3/upload.mjs [slug-filter,...]
import fs from "node:fs"
import path from "node:path"
import { put } from "@vercel/blob"
import { PRODUCTS } from "./catalog.mjs"
import { BUILD, ZIPS } from "./package.mjs"

export const MANIFEST_PATH = path.resolve(".v0/catalog-batch3-manifest.json")
const IMAGES = ["cover", "gallery-2", "gallery-3"]

const isMain = process.argv[1]?.endsWith("upload.mjs")
if (isMain) {
  const filters = process.argv[2]?.split(",").filter(Boolean)
  const list = PRODUCTS.filter((p) => !filters || filters.some((f) => p.slug.includes(f)))
  const manifest = fs.existsSync(MANIFEST_PATH) ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) : {}
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true })
  for (const p of list) {
    const zipPath = path.join(ZIPS, `${p.slug}.zip`)
    if (!fs.existsSync(zipPath)) throw new Error(`Missing ZIP for ${p.slug} — run package.mjs first`)
    const images = []
    for (const name of IMAGES) {
      const file = path.join(BUILD, p.slug, "images", `${name}.png`)
      if (!fs.existsSync(file)) throw new Error(`Missing ${name}.png for ${p.slug} — run render.mjs first`)
      const blob = await put(`catalog/images/batch3/${p.slug}-${name}.png`, fs.readFileSync(file), { access: "private", contentType: "image/png", allowOverwrite: true })
      images.push(`/api/blob-image?pathname=${encodeURIComponent(blob.pathname)}`)
    }
    const zip = fs.readFileSync(zipPath)
    const fileName = `${p.slug}.zip`
    const fileBlob = await put(`catalog/files/${fileName}`, zip, { access: "private", addRandomSuffix: true, contentType: "application/zip", multipart: zip.length > 20 * 1048576 })
    manifest[p.slug] = { images, file: { fileName, blobPathname: fileBlob.pathname, fileSizeBytes: zip.length }, uploadedAt: new Date().toISOString() }
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
    console.log(`${p.sku} ${p.slug}: 3 images, zip ${(zip.length / 1048576).toFixed(1)} MB`)
  }
  console.log(`Manifest: ${MANIFEST_PATH} (${Object.keys(manifest).length} entries)`)
}
