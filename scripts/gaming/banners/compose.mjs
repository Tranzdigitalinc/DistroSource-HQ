// Compose the final benchmark images for the storefront.
//
//   node scripts/gaming/banners/compose.mjs            # every product
//   node scripts/gaming/banners/compose.mjs mlo-vault   # slugs containing "mlo-vault"
//
// For each product: render the cover (scene or built interface underneath,
// deterministic typography on top), take the two gallery sources, and write
// 1600 / 1200 / 800 px WebP files to public/gaming/benchmark/<slug>/.
// Sources are PNGs already rendered into .gaming-render/ or HTML pages that
// are captured here first.
import { chromium } from "playwright"
import sharp from "sharp"
import fs from "node:fs"
import path from "node:path"
import { PRODUCTS } from "./compose.config.mjs"

const ROOT = path.resolve(import.meta.dirname, "../../..")
const HOST = "http://render.local"
const OUT = path.join(ROOT, "public/gaming/benchmark")
const TMP = path.join(ROOT, ".gaming-render/compose")
const WIDTHS = [1600, 1200, 800]
const MIME = { ".html": "text/html; charset=utf-8", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".svg": "image/svg+xml" }

const filter = process.argv[2]
fs.mkdirSync(TMP, { recursive: true })

const browser = await chromium.launch({ headless: true, args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })
await page.route(`${HOST}/**`, async (route) => {
  const url = new URL(route.request().url())
  const file = path.join(ROOT, decodeURIComponent(url.pathname))
  if (!file.startsWith(ROOT)) return route.abort()
  try {
    await route.fulfill({ status: 200, body: fs.readFileSync(file), headers: { "content-type": MIME[path.extname(file)] ?? "application/octet-stream", "cache-control": "no-store" } })
  } catch {
    await route.fulfill({ status: 404, body: "not found" })
  }
})
page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`))

async function capture(pageFile, query, out) {
  const rel = pageFile.split(path.sep).join("/")
  await page.goto(`${HOST}/${rel}${query ? `?${new URLSearchParams(query)}` : ""}`)
  await page.waitForFunction(() => document.fonts.status === "loaded" && (window.__ready ?? true), null, { timeout: 60_000 })
  await page.waitForTimeout(120)
  await page.screenshot({ path: out, type: "png" })
  return out
}

/** Resolve a source to a PNG on disk: { png } or { page, query }. */
async function source(src, name) {
  if (src.png) return path.join(ROOT, src.png)
  return capture(src.page, src.query, path.join(TMP, `${name}.png`))
}

async function writeRenditions(png, dir, base) {
  const input = sharp(png).resize(1600, 1000, { fit: "cover" })
  const buf = await input.png().toBuffer()
  for (const w of WIDTHS) {
    const file = w === 1600 ? `${base}.webp` : `${base}-${w}.webp`
    await sharp(buf).resize(w, Math.round((w * 10) / 16)).webp({ quality: w === 800 ? 82 : 84, effort: 6 }).toFile(path.join(dir, file))
  }
}

try {
  for (const product of PRODUCTS) {
    if (filter && !product.slug.includes(filter)) continue
    const dir = path.join(OUT, product.slug)
    fs.mkdirSync(dir, { recursive: true })
    const bgPng = await source(product.cover.source, `${product.slug}-cover-bg`)
    const bgRel = "/" + path.relative(ROOT, bgPng).split(path.sep).join("/")
    const coverPng = await capture("scripts/gaming/banners/cover.html", { bg: bgRel, ...product.cover.text }, path.join(TMP, `${product.slug}-cover.png`))
    await writeRenditions(coverPng, dir, "cover")
    for (const [name, src] of Object.entries(product.gallery)) {
      const png = await source(src, `${product.slug}-${name}`)
      await writeRenditions(png, dir, name)
    }
    const files = fs.readdirSync(dir)
    const bytes = files.reduce((s, f) => s + fs.statSync(path.join(dir, f)).size, 0)
    console.log(`${product.slug}: ${files.length} files, ${(bytes / 1024).toFixed(0)} KB`)
  }
} finally {
  await browser.close()
}
