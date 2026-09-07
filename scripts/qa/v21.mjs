// QA for v2.1: first-load curtain, express checkout, product page upsell, home rails.
import { chromium } from "playwright"
import fs from "node:fs"

const out = ".gaming-render/qa/v21c"
fs.mkdirSync(out, { recursive: true })
const base = "http://localhost:3200"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const errors = []
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)))
page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message))

// curtain: warm the server first so the fallback is the only thing we race
await page.goto(base + "/products", { waitUntil: "networkidle", timeout: 180000 })
const fresh = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
fresh.goto(base + "/", { waitUntil: "commit", timeout: 180000 }).catch(() => {})
await fresh.waitForTimeout(350)
await fresh.screenshot({ path: `${out}/curtain.png` })
await fresh.close()

// product page: complete-the-set + recently viewed after visiting two products
const slugs = await page.$$eval('a[href^="/products/"]', (as) => [...new Set(as.map((a) => a.getAttribute("href")))].filter((h) => /^\/products\/[a-z0-9-]+$/.test(h)).slice(0, 3))
for (const s of slugs) await page.goto(base + s, { waitUntil: "networkidle", timeout: 180000 })
await page.screenshot({ path: `${out}/pdp.png`, fullPage: true })
console.log("complete the set:", await page.getByText("Complete the set").count(), "recently viewed:", await page.locator('[aria-label="Pick up where you left off"]').count())

// home: scrolled hero + recently viewed
await page.goto(base + "/", { waitUntil: "networkidle", timeout: 180000 })
await page.mouse.wheel(0, 500)
await page.waitForTimeout(600)
await page.screenshot({ path: `${out}/home-scrolled.png` })
console.log("home recently viewed:", await page.locator('[aria-label="Pick up where you left off"]').count())

// checkout: add to cart then open checkout
await page.goto(base + "/products", { waitUntil: "networkidle", timeout: 180000 })
await page.locator('button[aria-label^="Add "][aria-label$=" to cart"]').first().click()
await page.getByText("Checkout securely").waitFor({ timeout: 30000 })
await page.goto(base + "/checkout", { waitUntil: "networkidle", timeout: 180000 })
await page.waitForTimeout(800)
await page.screenshot({ path: `${out}/checkout.png`, fullPage: true })
await page.getByRole("button", { name: /TamPay/ }).click()
await page.waitForTimeout(500)
await page.screenshot({ path: `${out}/checkout-tampay.png`, fullPage: true })
// validation: empty name should focus + error, never navigate
await page.getByRole("button", { name: /^Card /i }).click()
await page.fill("#checkout-name", "")
await page.locator('aside button[type="submit"]').click()
await page.waitForTimeout(400)
console.log("validation error shown:", await page.getByRole("alert").count(), "url:", page.url())

const m = await ctx.newPage()
await m.setViewportSize({ width: 390, height: 844 })
await m.goto(base + "/checkout", { waitUntil: "networkidle", timeout: 180000 })
await m.screenshot({ path: `${out}/checkout-mobile.png`, fullPage: true })

console.log("errors:", errors.length ? errors : "none")
await browser.close()
