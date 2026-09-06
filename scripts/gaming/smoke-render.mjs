/**
 * Proves the render chain end to end before anything is built on it:
 *   Playwright (headless Chromium) → PNG → sharp → WebP on disk.
 *
 * Renders a small mock HUD with real, readable text at the brief's working
 * resolution and reports the output dimensions and size.
 *
 * Run from the repo root:  node scripts/gaming/smoke-render.mjs
 */
import { chromium } from "playwright"
import sharp from "sharp"
import { mkdirSync, writeFileSync, statSync } from "node:fs"

const OUT_DIR = ".gaming-render"
mkdirSync(OUT_DIR, { recursive: true })

const html = `<!doctype html><html><head><meta charset="utf-8">
<style>
  html,body{margin:0;width:1600px;height:1000px;background:#3a4a3a;font-family:Inter,Segoe UI,Arial,sans-serif;overflow:hidden}
  .road{position:absolute;inset:0;background:linear-gradient(#5b6b7a 0 42%,#2b2f33 42% 100%)}
  .hud{position:absolute;left:48px;bottom:48px;display:flex;gap:14px;align-items:flex-end}
  .stat{background:rgba(8,10,14,.72);color:#fff;border-radius:8px;padding:12px 16px;min-width:150px}
  .stat .l{font-size:13px;letter-spacing:.06em;opacity:.7;text-transform:uppercase}
  .stat .v{font-size:28px;font-weight:700;margin-top:4px}
  .bar{height:6px;background:rgba(255,255,255,.18);border-radius:3px;margin-top:8px;overflow:hidden}
  .bar i{display:block;height:100%;background:#3ec66d}
</style></head><body>
<div class="road"></div>
<div class="hud">
  <div class="stat"><div class="l">Health</div><div class="v">86</div><div class="bar"><i style="width:86%"></i></div></div>
  <div class="stat"><div class="l">Armor</div><div class="v">40</div><div class="bar"><i style="width:40%;background:#4a9be8"></i></div></div>
  <div class="stat"><div class="l">Fuel</div><div class="v">62%</div><div class="bar"><i style="width:62%;background:#e8b84a"></i></div></div>
  <div class="stat"><div class="l">Cash</div><div class="v">$4,250</div></div>
  <div class="stat"><div class="l">Job</div><div class="v" style="font-size:20px">Mechanic</div></div>
</div>
</body></html>`

const t0 = Date.now()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 })
await page.setContent(html, { waitUntil: "load" })
await page.evaluate(() => document.fonts.ready)
const png = await page.screenshot({ type: "png" })
await browser.close()

const webp = await sharp(png).webp({ quality: 82 }).toBuffer()
const meta = await sharp(webp).metadata()
const out = `${OUT_DIR}/smoke.webp`
writeFileSync(out, webp)

console.log(`render+encode: ${Date.now() - t0} ms`)
console.log(`png: ${(png.length / 1024).toFixed(0)} KB → webp: ${(statSync(out).size / 1024).toFixed(0)} KB`)
console.log(`dimensions: ${meta.width}x${meta.height} ${meta.format}`)
console.log(`wrote ${out}`)
