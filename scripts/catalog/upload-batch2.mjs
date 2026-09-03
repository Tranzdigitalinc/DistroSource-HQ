// Uploads the generated hero images and freshly-built starter-asset ZIPs for
// the 200 batch-2 catalog products to Vercel Blob, writing a manifest that
// seed-batch2.mjs reads. Safe to re-run: it always re-uploads.
import fs from "node:fs"
import path from "node:path"
import { put } from "@vercel/blob"
import { PRODUCTS } from "./products-batch2.mjs"
import { buildProductZip } from "./build-assets.mjs"

const IMAGES_DIR = path.resolve("public/seed/catalog-batch2")
const MANIFEST_PATH = path.resolve(".v0/catalog-batch2-seed-manifest.json")

async function main() {
  const manifest = {}
  let i = 0
  for (const product of PRODUCTS) {
    i++
    const imagePath = path.join(IMAGES_DIR, `${product.slug}.png`)
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Missing generated image for ${product.slug} at ${imagePath}`)
    }
    const imageBuffer = fs.readFileSync(imagePath)
    const imageBlob = await put(`catalog/images/${product.slug}.png`, imageBuffer, {
      access: "private",
      contentType: "image/png",
      allowOverwrite: true,
    })
    const imageUrl = `/api/blob-image?pathname=${encodeURIComponent(imageBlob.pathname)}`

    const zipBuffer = buildProductZip(product)
    const fileName = `${product.slug}.zip`
    const fileBlob = await put(`catalog/files/${fileName}`, zipBuffer, {
      access: "private",
      addRandomSuffix: true,
    })

    manifest[product.slug] = {
      imageUrl,
      file: {
        fileName,
        blobPathname: fileBlob.pathname,
        fileSizeBytes: zipBuffer.length,
      },
    }
    console.log(`[${i}/${PRODUCTS.length}] uploaded ${product.slug}`)
  }

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true })
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
  console.log(`Manifest written to ${MANIFEST_PATH} (${Object.keys(manifest).length} products)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
