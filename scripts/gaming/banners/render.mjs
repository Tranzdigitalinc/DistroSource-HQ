// Render a DistroSource Gaming product scene to PNG on the local GPU.
//
//   node scripts/gaming/banners/render.mjs --scene mlo-diner --out .gaming-render/mlo-diner.png --spp 1200
//   node scripts/gaming/banners/render.mjs --page scripts/gaming/banners/ui/mdt.html --out .gaming-render/mdt.png
//
// 3D scenes run in scripts/gaming/banners/stage.html (three.js +
// three-gpu-pathtracer). `--page` screenshots a built HTML interface instead.
// Chromium is pointed at the real GPU through ANGLE/D3D11; the software
// renderer is refused so a slow machine can never silently produce a worse
// image.
import { chromium } from "playwright"
import fs from "node:fs"
import path from "node:path"

const ROOT = path.resolve(import.meta.dirname, "../../..")
const HOST = "http://render.local"

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? process.argv[i + 1] : fallback
}

const scene = arg("scene")
const pageFile = arg("page")
const out = path.resolve(ROOT, arg("out", `.gaming-render/${scene || path.basename(pageFile || "page", ".html")}.png`))
const width = Number(arg("w", 1600))
const height = Number(arg("h", 1000))
const spp = Number(arg("spp", 800))
const view = arg("view", "")
const mode = arg("mode", "")
const query = arg("query", "")
if (!scene && !pageFile) throw new Error("Pass --scene <name> or --page <file.html>")

const MIME = {
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
}

const browser = await chromium.launch({
  headless: true,
  args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--disable-gpu-watchdog", "--disable-renderer-backgrounding"],
})
try {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
  await page.route(`${HOST}/**`, async (route) => {
    const url = new URL(route.request().url())
    const file = path.join(ROOT, decodeURIComponent(url.pathname))
    if (!file.startsWith(ROOT)) return route.abort()
    try {
      const body = fs.readFileSync(file)
      await route.fulfill({ status: 200, body, headers: { "content-type": MIME[path.extname(file)] ?? "application/octet-stream", "cache-control": "no-store" } })
    } catch {
      await route.fulfill({ status: 404, body: `not found: ${url.pathname}` })
    }
  })
  page.on("console", (m) => console.log(`[page] ${m.text()}`))
  page.on("pageerror", (e) => console.log(`[pageerror] ${e.message}`))

  const started = Date.now()
  fs.mkdirSync(path.dirname(out), { recursive: true })
  if (scene) {
    const params = new URLSearchParams({ scene, w: String(width), h: String(height), spp: String(spp), view, mode })
    await page.goto(`${HOST}/scripts/gaming/banners/stage.html?${params}`)
    await page.waitForFunction(() => window.__done || window.__error, null, { timeout: 30 * 60 * 1000, polling: 1000 })
    const error = await page.evaluate(() => window.__error)
    if (error) throw new Error(error)
    const renderer = await page.evaluate(() => {
      const gl = document.getElementById("c").getContext("webgl2")
      const dbg = gl?.getExtension("WEBGL_debug_renderer_info")
      return dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : ""
    })
    if (/swiftshader/i.test(renderer)) throw new Error(`Refusing to render on the software rasterizer (${renderer})`)
    const dataUrl = await page.evaluate(() => document.getElementById("c").toDataURL("image/png"))
    fs.writeFileSync(out, Buffer.from(dataUrl.split(",")[1], "base64"))
  } else {
    const rel = path.relative(ROOT, path.resolve(ROOT, pageFile)).split(path.sep).join("/")
    await page.goto(`${HOST}/${rel}${query ? `?${query}` : ""}`)
    await page.waitForFunction(() => document.fonts.status === "loaded" && (window.__ready ?? true), null, { timeout: 60_000 })
    await page.waitForTimeout(150)
    await page.screenshot({ path: out, type: "png" })
  }
  console.log(`wrote ${path.relative(ROOT, out)} in ${((Date.now() - started) / 1000).toFixed(1)}s`)
} finally {
  await browser.close()
}
