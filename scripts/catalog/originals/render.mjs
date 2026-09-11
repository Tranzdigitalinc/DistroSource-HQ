// Renders each template's preview page on desktop and mobile with Playwright
// and composes the cover: a laptop frame with the desktop render, a phone
// frame overlapping with the mobile render, on a soft background tinted
// with the product's accent. 1600×1000 (16:10). Deterministic, no AI.
import fs from "node:fs"
import path from "node:path"
import { chromium } from "playwright"
import sharp from "sharp"
import { PRODUCTS } from "./catalog.mjs"
import { BUILD_DIR, themeFor } from "./generate.mjs"
import { generateProduct } from "./generate.mjs"

const W = 1600, H = 1000
const DESK = { w: 1440, h: 900 }
const MOB = { w: 390, h: 844 }

function rgba(hex, a) {
  const n = Number.parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

function backgroundSvg(t) {
  const paper = "#f4f1eb"
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<defs>
  <radialGradient id="a" cx="18%" cy="12%" r="70%"><stop offset="0" stop-color="${rgba(t.accent, 0.42)}"/><stop offset="1" stop-color="${rgba(t.accent, 0)}"/></radialGradient>
  <radialGradient id="b" cx="88%" cy="95%" r="60%"><stop offset="0" stop-color="${rgba(t.accent2, 0.35)}"/><stop offset="1" stop-color="${rgba(t.accent2, 0)}"/></radialGradient>
  <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#111" stroke-opacity="0.045"/></pattern>
</defs>
<rect width="${W}" height="${H}" fill="${paper}"/>
<rect width="${W}" height="${H}" fill="url(#a)"/>
<rect width="${W}" height="${H}" fill="url(#b)"/>
<rect width="${W}" height="${H}" fill="url(#g)"/>
</svg>`
}

// Laptop: screen 1180×737 at (110, 96); phone: screen 250×541 at (1250, 380)
const LAP = { x: 110, y: 96, w: 1180, h: 737, bezel: 16, r: 22 }
const PH = { x: 1258, y: 372, w: 250, h: 541, bezel: 11, r: 38 }

function framesSvg() {
  const l = LAP, p = PH
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<defs>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="160%"><feGaussianBlur stdDeviation="28"/></filter>
  <filter id="sh2" x="-30%" y="-20%" width="160%" height="150%"><feGaussianBlur stdDeviation="18"/></filter>
</defs>
<!-- laptop shadow -->
<rect x="${l.x - l.bezel + 10}" y="${l.y - l.bezel + 60}" width="${l.w + l.bezel * 2 - 20}" height="${l.h + l.bezel * 2}" rx="${l.r}" fill="#000" fill-opacity="0.32" filter="url(#sh)"/>
<!-- laptop lid -->
<rect x="${l.x - l.bezel}" y="${l.y - l.bezel}" width="${l.w + l.bezel * 2}" height="${l.h + l.bezel * 2}" rx="${l.r}" fill="#15171c"/>
<rect x="${l.x - l.bezel + 1}" y="${l.y - l.bezel + 1}" width="${l.w + l.bezel * 2 - 2}" height="${l.h + l.bezel * 2 - 2}" rx="${l.r - 1}" fill="none" stroke="#3a3d45" stroke-width="1"/>
<circle cx="${l.x + l.w / 2}" cy="${l.y - l.bezel / 2}" r="3" fill="#2a2d34"/>
<!-- laptop base -->
<rect x="${l.x - l.bezel - 70}" y="${l.y + l.h + l.bezel}" width="${l.w + l.bezel * 2 + 140}" height="20" rx="8" fill="#20232a"/>
<rect x="${l.x - l.bezel - 70}" y="${l.y + l.h + l.bezel}" width="${l.w + l.bezel * 2 + 140}" height="4" fill="#3a3d45"/>
<rect x="${l.x + l.w / 2 - 110}" y="${l.y + l.h + l.bezel}" width="220" height="7" rx="3" fill="#0f1114"/>
<!-- phone shadow -->
<rect x="${p.x - p.bezel + 8}" y="${p.y - p.bezel + 40}" width="${p.w + p.bezel * 2 - 16}" height="${p.h + p.bezel * 2}" rx="${p.r}" fill="#000" fill-opacity="0.38" filter="url(#sh2)"/>
<!-- phone body -->
<rect x="${p.x - p.bezel}" y="${p.y - p.bezel}" width="${p.w + p.bezel * 2}" height="${p.h + p.bezel * 2}" rx="${p.r}" fill="#111317"/>
<rect x="${p.x - p.bezel + 1}" y="${p.y - p.bezel + 1}" width="${p.w + p.bezel * 2 - 2}" height="${p.h + p.bezel * 2 - 2}" rx="${p.r - 1}" fill="none" stroke="#3a3d45"/>
</svg>`
}

function phoneOverlaySvg() {
  const p = PH
  // notch + home indicator, drawn over the screenshot
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<rect x="${p.x + p.w / 2 - 50}" y="${p.y + p.h - 12}" width="100" height="4" rx="2" fill="#111317" fill-opacity="0.7"/>
</svg>`
}

async function roundedScreenshot(png, w, h, r) {
  const mask = Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}"/></svg>`)
  return sharp(png).resize(w, h, { fit: "cover", position: "top" }).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer()
}

export async function composeCover(t, deskPng, mobPng) {
  const desk = await roundedScreenshot(deskPng, LAP.w, LAP.h, 8)
  const mob = await roundedScreenshot(mobPng, PH.w, PH.h, PH.r - PH.bezel)
  return sharp(Buffer.from(backgroundSvg(t)))
    .composite([
      { input: Buffer.from(framesSvg()), left: 0, top: 0 },
      { input: desk, left: LAP.x, top: LAP.y },
      { input: mob, left: PH.x, top: PH.y },
      { input: Buffer.from(phoneOverlaySvg()), left: 0, top: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer()
}

async function settle(page) {
  await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    await document.fonts.ready
    // eslint-disable-next-line no-undef
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"))
  })
  await page.waitForTimeout(250)
}

export async function renderProduct(browser, p, { previewPath }) {
  const url = "file:///" + path.resolve(previewPath).replace(/\\/g, "/")
  const deskCtx = await browser.newContext({ viewport: { width: DESK.w, height: DESK.h }, deviceScaleFactor: 1 })
  const dp = await deskCtx.newPage()
  await dp.goto(url, { waitUntil: "load", timeout: 90_000 })
  await settle(dp)
  const deskPng = await dp.screenshot({ type: "png" })
  await deskCtx.close()

  const mobCtx = await browser.newContext({ viewport: { width: MOB.w, height: MOB.h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const mp = await mobCtx.newPage()
  await mp.goto(url, { waitUntil: "load", timeout: 90_000 })
  await settle(mp)
  const mobPng = await mp.screenshot({ type: "png" })
  await mobCtx.close()

  return composeCover(themeFor(p), deskPng, mobPng)
}

if (process.argv[1] && process.argv[1].endsWith("render.mjs")) {
  const only = process.argv.slice(2)
  const list = only.length ? PRODUCTS.filter((p) => only.includes(p.slug) || only.includes(String(p.index))) : PRODUCTS
  const browser = await chromium.launch()
  try {
    for (const p of list) {
      const dir = path.join(BUILD_DIR, p.slug)
      const gen = generateProduct(p)
      const previewPath = path.join(dir, gen.preview)
      if (!fs.existsSync(previewPath)) throw new Error(`Missing ${previewPath} — run generate.mjs first`)
      const cover = await renderProduct(browser, p, { previewPath })
      fs.writeFileSync(path.join(dir, "cover.png"), cover)
      console.log(`${p.sku} ${p.slug}: cover ${Math.round(cover.length / 1024)} KB`)
    }
  } finally {
    await browser.close()
  }
}
