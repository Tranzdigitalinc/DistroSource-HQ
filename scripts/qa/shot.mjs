// Full-page screenshots of the dev server for visual QA.
// node shot.mjs <out-dir> <width> <theme:light|dark> url1 url2 ...
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

const [outDir, widthArg, theme, ...urls] = process.argv.slice(2)
const width = Number(widthArg)
mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, colorScheme: theme === "dark" ? "dark" : "light" })
await ctx.addInitScript((t) => { try { localStorage.setItem("theme", t) } catch {} }, theme)
for (const url of urls) {
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: "networkidle", timeout: 120000 })
  await page.waitForTimeout(800)
  // trigger reveal animations by scrolling through the page
  const h = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < h; y += 700) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(120) }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(600)
  const name = url.replace(/^https?:\/\/[^/]+/, "").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "home"
  await page.screenshot({ path: `${outDir}/${name}-${width}-${theme}.png`, fullPage: true })
  console.log("shot", name, width, theme)
  await page.close()
}
await browser.close()
