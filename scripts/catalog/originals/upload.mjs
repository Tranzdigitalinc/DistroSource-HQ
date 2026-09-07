// Packages each generated template into a ZIP and uploads the ZIP and the
// rendered cover to Vercel Blob, writing a manifest that seed.mjs reads.
// Requires BLOB_READ_WRITE_TOKEN. Safe to re-run: covers overwrite in place,
// ZIPs get a fresh random suffix.
import fs from "node:fs"
import path from "node:path"
import { put } from "@vercel/blob"
import { createZip } from "../zip-writer.mjs"
import { PRODUCTS } from "./catalog.mjs"
import { BUILD_DIR, generateProduct } from "./generate.mjs"

import { MANIFEST_PATH } from "./manifest.mjs"
export { MANIFEST_PATH }

export function zipFor(p) {
  const gen = generateProduct(p)
  const entries = Object.entries(gen.files).map(([name, content]) => ({ name: `${p.slug}/${name}`, content }))
  return { gen, zip: createZip(entries) }
}

const isMain = process.argv[1] && process.argv[1].endsWith("upload.mjs")
const only = isMain ? process.argv.slice(2) : []
const list = !isMain ? [] : only.length ? PRODUCTS.filter((p) => only.includes(p.slug) || only.includes(String(p.index))) : PRODUCTS
const manifest = fs.existsSync(MANIFEST_PATH) ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) : {}
fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true })

for (const p of list) {
  const coverPath = path.join(BUILD_DIR, p.slug, "cover.png")
  if (!fs.existsSync(coverPath)) throw new Error(`Missing cover for ${p.slug} — run render.mjs first`)
  const cover = fs.readFileSync(coverPath)
  const imageBlob = await put(`catalog/images/${p.slug}.png`, cover, { access: "private", contentType: "image/png", allowOverwrite: true })
  const imageUrl = `/api/blob-image?pathname=${encodeURIComponent(imageBlob.pathname)}`

  const { zip } = zipFor(p)
  const fileName = `${p.slug}.zip`
  const fileBlob = await put(`catalog/files/${fileName}`, zip, { access: "private", addRandomSuffix: true, contentType: "application/zip" })

  manifest[p.slug] = { imageUrl, file: { fileName, blobPathname: fileBlob.pathname, fileSizeBytes: zip.length }, uploadedAt: new Date().toISOString() }
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
  console.log(`${p.sku} ${p.slug}: cover ${Math.round(cover.length / 1024)} KB, zip ${Math.round(zip.length / 1024)} KB`)
}
if (isMain) console.log(`Manifest: ${MANIFEST_PATH} (${Object.keys(manifest).length} entries)`)
