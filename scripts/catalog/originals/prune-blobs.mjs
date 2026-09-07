// Deletes ZIPs under catalog/files/<slug>-*.zip that the manifest no longer
// references (each upload run mints a new random suffix). Covers overwrite
// in place, so only ZIPs can go stale. Requires BLOB_READ_WRITE_TOKEN.
import fs from "node:fs"
import { list, del } from "@vercel/blob"
import { PRODUCTS } from "./catalog.mjs"
import { MANIFEST_PATH } from "./manifest.mjs"

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
let removed = 0
for (const p of PRODUCTS) {
  const keep = manifest[p.slug]?.file?.blobPathname
  const { blobs } = await list({ prefix: `catalog/files/${p.slug}-`, limit: 100 })
  for (const b of blobs) {
    if (b.pathname === keep) continue
    await del(b.url)
    removed++
  }
}
console.log(`Removed ${removed} stale ZIP blob(s).`)
