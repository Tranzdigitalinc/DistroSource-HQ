// Interaction QA: add to cart from the catalog, capture the drawer, open the
// command search, open the mega menu, then the cart and checkout pages.
// node scripts/qa/flow.mjs <out-dir> [base]
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

const [outDir, base = "http://localhost:3200"] = process.argv.slice(2)
mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const errors = []
page.on("pageerror", (e) => errors.push(String(e)))
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()) })

await page.goto(`${base}/products`, { waitUntil: "networkidle", timeout: 120000 })
await page.getByRole("button", { name: /^Add .* to cart$/ }).first().click()
await page.waitForTimeout(1500)
await page.screenshot({ path: `${outDir}/flow-drawer.png` })
await page.keyboard.press("Escape")
await page.waitForTimeout(400)

await page.keyboard.press("Control+K")
await page.waitForTimeout(400)
await page.keyboard.type("dashboard")
await page.waitForTimeout(1200)
await page.screenshot({ path: `${outDir}/flow-search.png` })
await page.keyboard.press("Escape")

await page.getByRole("button", { name: "Departments" }).hover()
await page.waitForTimeout(700)
await page.screenshot({ path: `${outDir}/flow-mega.png` })

await page.goto(`${base}/cart`, { waitUntil: "networkidle" })
await page.screenshot({ path: `${outDir}/flow-cart.png`, fullPage: true })
await page.goto(`${base}/checkout`, { waitUntil: "networkidle" })
await page.waitForTimeout(800)
await page.screenshot({ path: `${outDir}/flow-checkout.png`, fullPage: true })

// mobile menu
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const mp = await m.newPage()
await mp.goto(`${base}/`, { waitUntil: "networkidle" })
await mp.getByRole("button", { name: "Open menu" }).click()
await mp.waitForTimeout(600)
await mp.screenshot({ path: `${outDir}/flow-mobile-menu.png` })

console.log("errors:", errors.length ? errors.slice(0, 8) : "none")
await browser.close()
