// Fungies checkout option + webhook route checks. Starts no payment.
import { chromium } from "playwright"
import { createHmac } from "node:crypto"
import fs from "node:fs"

const out = ".gaming-render/qa/fungies"
fs.mkdirSync(out, { recursive: true })
const base = "http://localhost:3200"
const SECRET = "test-webhook-secret-1234567890"
const sign = (body) => `sha256_${createHmac("sha256", SECRET).update(body, "utf8").digest("hex")}`

const browser = await chromium.launch()
const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage()
const errors = []
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)))
page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message))

await page.goto(base + "/products", { waitUntil: "networkidle", timeout: 240000 })
await page.locator('button[aria-label^="Add "][aria-label$=" to cart"]').first().click()
await page.getByText("Checkout securely").waitFor({ timeout: 30000 })
await page.goto(base + "/checkout", { waitUntil: "networkidle", timeout: 240000 })

const opt = page.getByRole("button", { name: /^Fungies/ })
console.log("option present:", await opt.count())
await opt.click()
await page.waitForTimeout(400)
console.log("selectable    :", await opt.getAttribute("aria-pressed"))
await page.screenshot({ path: `${out}/checkout.png`, fullPage: true })

// Webhook route: signature is enforced, and a valid signature for an unknown
// order is acknowledged rather than retried forever.
const body = JSON.stringify({
  id: "evt_test_1",
  type: "payment_success",
  idempotencyKey: "evt_test_1",
  data: { items: [{ offer: { id: "off_1", internalId: "DS-NOT-A-REAL-ORDER" } }], payment: { value: 4900 } },
})
const url = base + "/api/webhooks/fungies"
const unsigned = await page.request.post(url, { headers: { "Content-Type": "application/json" }, data: body })
console.log("unsigned      ->", unsigned.status())
const badsig = await page.request.post(url, { headers: { "Content-Type": "application/json", "x-fngs-signature": sign(body + "x") }, data: body })
console.log("bad signature ->", badsig.status())
const good = await page.request.post(url, { headers: { "Content-Type": "application/json", "x-fngs-signature": sign(body) }, data: body })
console.log("valid sig     ->", good.status(), (await good.text()).slice(0, 90))
const other = await page.request.post(url, {
  headers: { "Content-Type": "application/json", "x-fngs-signature": sign(JSON.stringify({ type: "payment_refunded" })) },
  data: JSON.stringify({ type: "payment_refunded" }),
})
console.log("refund event  ->", other.status(), (await other.text()).slice(0, 70))

console.log("errors:", errors.length ? errors : "none")
await browser.close()
