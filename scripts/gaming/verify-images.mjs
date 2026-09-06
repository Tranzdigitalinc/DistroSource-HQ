/**
 * Verifies every Gaming product image end to end:
 *   1. the Blob object exists (head) and is a WebP of plausible size
 *   2. optionally, the storefront serves the product page and the image
 *      route for it (pass --base http://localhost:3000)
 *
 *   node --env-file=.env.local scripts/gaming/verify-images.mjs [--base URL]
 *
 * Prints a per-product line and a summary; exits 1 if anything is broken.
 */
import { head } from "@vercel/blob"
import { loadProducts } from "./render/lib.mjs"

const args = process.argv.slice(2)
const base = args.includes("--base") ? args[args.indexOf("--base") + 1].replace(/\/$/, "") : null

const products = await loadProducts()
let totalImages = 0, broken = [], withImages = 0, fivePlus = 0
const byPlatform = { fivem: 0, minecraft: 0, other: 0 }

for (const p of products) {
  const imgs = p.images ?? []
  const all = [...imgs, ...(p.cardImage ? [p.cardImage] : [])]
  if (!imgs.length) { console.log(`  –  ${p.slug.padEnd(38)} no images`); continue }
  withImages++
  if (imgs.length >= 5) fivePlus++
  byPlatform[p.platform] = (byPlatform[p.platform] ?? 0) + 1
  totalImages += imgs.length
  const problems = []
  for (const pathname of all) {
    try {
      const h = await head(pathname)
      if (h.contentType !== "image/webp") problems.push(`${pathname}: ${h.contentType}`)
      if (h.size < 5_000) problems.push(`${pathname}: only ${h.size} bytes`)
    } catch (e) { problems.push(`${pathname}: ${e.message.split("\n")[0]}`) }
  }
  if (base) {
    try {
      const r = await fetch(`${base}/gaming/product/${p.slug}`)
      if (!r.ok) problems.push(`product page ${r.status}`)
      else {
        const html = await r.text()
        const first = `/api/blob-image?pathname=${encodeURIComponent(imgs[0])}`
        if (!html.includes(first.replace(/&/g, "&amp;")) && !html.includes(first)) problems.push("primary image not in page HTML")
      }
      const ri = await fetch(`${base}/api/blob-image?pathname=${encodeURIComponent(p.cardImage ?? imgs[0])}`)
      if (!ri.ok || !(ri.headers.get("content-type") || "").includes("image")) problems.push(`image route ${ri.status}`)
    } catch (e) { problems.push(`storefront: ${e.message}`) }
  }
  if (problems.length) broken.push({ slug: p.slug, problems })
  console.log(`  ${problems.length ? "✗" : "✓"}  ${p.slug.padEnd(38)} ${String(imgs.length).padStart(2)} images${p.cardImage ? " + card" : ""}${problems.length ? "  " + problems.join(" | ") : ""}`)
}

console.log(`\nproducts: ${products.length} · with images: ${withImages} · 5+ images: ${fivePlus} · gallery images: ${totalImages} · blobs checked: ${totalImages + withImages}`)
console.log(`by platform: fivem ${byPlatform.fivem} · minecraft ${byPlatform.minecraft} · other ${byPlatform.other}`)
if (broken.length) { console.log(`\nBROKEN (${broken.length}):`); for (const b of broken) console.log(`  ${b.slug}: ${b.problems.join(" | ")}`) }
process.exit(broken.length ? 1 : 0)
