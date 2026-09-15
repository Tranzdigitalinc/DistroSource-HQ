// Exports the batch-3 3D products (STL prints and GLB/OBJ asset kits) by
// running export.html in headless Chromium and writing what it returns.
//
//   node scripts/catalog/batch3/models/build_models.mjs                # every product
//   node scripts/catalog/batch3/models/build_models.mjs planter,nature
//
// Output: .catalog-build/batch3/<slug>/files/<Folder>/… and <slug>/stats.json
import fs from "node:fs"
import path from "node:path"
import { chromium } from "playwright"

const ROOT = path.resolve(import.meta.dirname, "../../../..")
const HOST = "http://render.local"
const OUT = path.join(ROOT, ".catalog-build", "batch3")
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript" }
const SLUGS = [
  "modular-desk-organiser-3d-print-system", "dungeon-terrain-tiles-3d-print-set", "geometric-planter-collection-3d-print",
  "cable-management-hook-set-3d-print", "phone-and-tablet-stand-pack-3d-print",
  "modular-sci-fi-corridor-kit-3d", "low-poly-nature-kit-3d", "stylised-furniture-set-3d",
]

const filters = process.argv[2]?.split(",").filter(Boolean)
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  await page.route(`${HOST}/**`, async (route) => {
    const file = path.join(ROOT, decodeURIComponent(new URL(route.request().url()).pathname))
    if (!file.startsWith(ROOT)) return route.abort()
    try {
      await route.fulfill({ status: 200, body: fs.readFileSync(file), headers: { "content-type": MIME[path.extname(file)] ?? "application/octet-stream" } })
    } catch {
      await route.fulfill({ status: 404, body: "not found" })
    }
  })
  page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`))
  for (const slug of SLUGS) {
    if (filters && !filters.some((f) => slug.includes(f))) continue
    await page.goto(`${HOST}/scripts/catalog/batch3/models/export.html?product=${slug}`)
    await page.waitForFunction(() => window.__done || window.__error, null, { timeout: 300_000, polling: 250 })
    const error = await page.evaluate(() => window.__error)
    if (error) throw new Error(`${slug}: ${error}`)
    const files = await page.evaluate(() => window.__files)
    const stats = await page.evaluate(() => window.__stats)
    const dir = path.join(OUT, slug, "files")
    fs.rmSync(dir, { recursive: true, force: true })
    let bytes = 0
    for (const f of files) {
      const buf = Buffer.from(f.data, "base64")
      const full = path.join(dir, f.path)
      fs.mkdirSync(path.dirname(full), { recursive: true })
      fs.writeFileSync(full, buf)
      bytes += buf.length
    }
    fs.writeFileSync(path.join(OUT, slug, "stats.json"), JSON.stringify(stats, null, 2))
    const triangles = stats.reduce((s, x) => s + x.triangles, 0)
    console.log(`${slug}: ${files.length} files, ${(bytes / 1024 / 1024).toFixed(1)} MB, ${stats.length} parts, ${triangles} triangles`)
  }
} finally {
  await browser.close()
}
