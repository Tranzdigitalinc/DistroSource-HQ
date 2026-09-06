/**
 * Gaming imagery pipeline — shared infrastructure.
 *
 * Every image is a deterministic render: a scene is an HTML string (plain
 * HTML/CSS for interfaces; a module script importing "three" for 3D), loaded
 * in headless Chromium at the brief's working resolution, screenshotted, and
 * encoded to WebP. Nothing here is generative.
 *
 * Uploads go to the private Blob store under gaming/{slug}/ with a random
 * suffix on every pathname. That is deliberate: /api/blob-image serves each
 * pathname as immutable for a year, so a fixed "cover.webp" would keep
 * serving a stale frame after any regeneration. The store also refuses to
 * overwrite an existing pathname by default, so nothing v0 uploaded under
 * gaming/images/ can be touched by accident.
 */
import { chromium } from "playwright"
import sharp from "sharp"
import { put, head } from "@vercel/blob"
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"

export const OUT_DIR = ".gaming-render"
export const W = 1600
export const H = 1000
export const CARD_W = 800
export const CARD_H = 500

const THREE_DIR = resolve("node_modules/three/build")

/* ------------------------------------------------------------- products */

/**
 * Load the live catalogue straight from lib/gaming/products.ts. Node 24
 * strips the type-only import, so the file runs as plain data — the same way
 * the repo's own audit scripts import lib/db/schema.ts.
 */
export async function loadProducts() {
  // A bare Windows path ("C:\…") is read by the ESM loader as a URL with
  // scheme "c:", so it must be handed over as a file:// URL.
  const mod = await import(pathToFileURL(resolve("lib/gaming/products.ts")).href)
  return mod.GAMING_PRODUCTS
}

/* -------------------------------------------------------------- browser */

export async function launchBrowser() {
  return chromium.launch({
    // Software GL so 3D scenes render without a GPU. Harmless for HTML scenes.
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  })
}

/**
 * Render one scene to a PNG buffer.
 *
 * The scene is served from a fake origin via page.route so relative module
 * imports (three.module.js → ./three.core.js) resolve, with no dev server in
 * the loop. Scenes signal readiness by setting `window.__done = true`; HTML
 * scenes that never set it are considered ready once fonts have loaded.
 */
export async function renderScene(browser, html, { width = W, height = H, timeout = 120_000, label = "scene" } = {}) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
  const errors = []
  // A page error means __done will never be set. Surface it immediately
  // rather than waiting out the full timeout for every scene in the product.
  let failNow
  const errored = new Promise((_, reject) => { failNow = reject })
  errored.catch(() => {})
  page.on("pageerror", (e) => { errors.push(`pageerror: ${e.message}`); failNow(new Error(`[${label}] page error: ${e.message}`)) })
  page.on("console", (m) => { if (m.type() === "error") errors.push(`console: ${m.text()}`) })

  await page.route("http://localhost/**", (route) => {
    const u = new URL(route.request().url())
    if (u.pathname === "/three.module.js" || u.pathname === "/three.core.js")
      return route.fulfill({ path: `${THREE_DIR}${u.pathname}`, contentType: "text/javascript" })
    if (u.pathname.startsWith("/jsm/") && !u.pathname.includes(".."))
      return route.fulfill({ path: `${THREE_DIR}/../examples${u.pathname}`, contentType: "text/javascript" })
    if (u.pathname === "/render.html") return route.fulfill({ body: html, contentType: "text/html; charset=utf-8" })
    return route.fulfill({ status: 404, body: "" })
  })

  try {
    await page.goto("http://localhost/render.html", { waitUntil: "load" })
    const usesDone = html.includes("__done")
    if (usesDone) {
      await Promise.race([page.waitForFunction(() => window.__done === true, null, { timeout }), errored])
    } else {
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(120)
    }
    const png = await page.screenshot({ type: "png" })
    if (errors.length) console.warn(`  [${label}] page reported: ${errors.join(" | ")}`)
    return png
  } finally {
    await page.close()
  }
}

/* --------------------------------------------------------------- encode */

/** Full-size gallery/cover WebP, plus a half-size variant for cards. */
export async function encode(png) {
  const full = await sharp(png).webp({ quality: 84, effort: 5 }).toBuffer()
  const card = await sharp(png).resize(CARD_W, CARD_H, { fit: "cover" }).webp({ quality: 82, effort: 5 }).toBuffer()
  return { full, card }
}

/** Cheap sanity check that a frame is not blank — a real render has variance. */
export async function frameSpread(png) {
  const { channels } = await sharp(png).stats()
  return Math.max(...channels.map((c) => c.max - c.min))
}

/* --------------------------------------------------------------- upload */

/**
 * Upload one asset and verify it landed by reading it back. Returns the
 * pathname the store actually assigned (with its random suffix) — that is
 * what goes into product.images, not the requested name.
 */
export async function uploadAsset(buffer, requestedPathname) {
  const result = await put(requestedPathname, buffer, {
    access: "private",
    contentType: "image/webp",
    addRandomSuffix: true,
    cacheControlMaxAge: 31536000,
  })
  const verified = await head(result.url)
  if (!verified || verified.size !== buffer.length) {
    throw new Error(`upload verification failed for ${requestedPathname}: size ${verified?.size} vs ${buffer.length}`)
  }
  return { pathname: result.pathname, url: result.url, size: verified.size, contentType: verified.contentType }
}

/* ------------------------------------------------------------- manifest */

export function manifestPath(slug) {
  mkdirSync(`${OUT_DIR}/manifest`, { recursive: true })
  return `${OUT_DIR}/manifest/${slug}.json`
}

export function readManifest(slug) {
  const p = manifestPath(slug)
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null
}

export function writeManifest(slug, data) {
  writeFileSync(manifestPath(slug), JSON.stringify(data, null, 2))
}

export function localPath(slug, name) {
  mkdirSync(`${OUT_DIR}/${slug}`, { recursive: true })
  return `${OUT_DIR}/${slug}/${name}`
}

/* ---------------------------------------------------------------- utils */

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** Base document every scene shares: fixed viewport, no margins, system fonts. */
export function doc({ body, style = "", head = "", bg = "#0f1115" }) {
  return `<!doctype html><html><head><meta charset="utf-8">
<script type="importmap">{"imports":{"three":"/three.module.js"}}</script>
<style>
  *{box-sizing:border-box}
  html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:${bg};
    font-family:"Segoe UI",Inter,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
  .mono{font-family:Consolas,"Cascadia Mono","JetBrains Mono",Menlo,monospace}
  ${style}
</style>${head}</head><body>${body}</body></html>`
}
