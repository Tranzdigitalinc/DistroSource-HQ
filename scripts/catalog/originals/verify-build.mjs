// Opens every generated HTML page in Chromium and reports console errors,
// failed asset requests and dangling relative links. Also saves a desktop
// screenshot of each page under .catalog-build/<slug>/qa/ for review.
import fs from "node:fs"
import path from "node:path"
import { chromium } from "playwright"
import { PRODUCTS } from "./catalog.mjs"
import { BUILD_DIR } from "./generate.mjs"

const only = process.argv.slice(2)
const list = only.length ? PRODUCTS.filter((p) => only.includes(p.slug) || only.includes(String(p.index))) : PRODUCTS

function htmlFiles(dir) {
  const out = []
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name)
      if (e.isDirectory()) { if (!["qa", "node_modules"].includes(e.name)) walk(full) }
      else if (e.name.endsWith(".html")) out.push(full)
    }
  }
  walk(dir)
  return out
}

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
let problems = 0
try {
  for (const p of list) {
    const dir = path.join(BUILD_DIR, p.slug)
    if (!fs.existsSync(dir)) { console.log(`SKIP ${p.slug} (not generated)`); continue }
    fs.mkdirSync(path.join(dir, "qa"), { recursive: true })
    const pages = htmlFiles(dir)
    const issues = []
    for (const file of pages) {
      const page = await ctx.newPage()
      const errors = []
      page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)))
      page.on("pageerror", (e) => errors.push("pageerror " + e.message.slice(0, 160)))
      page.on("requestfailed", (r) => { if (r.url().startsWith("file:")) errors.push("missing " + path.basename(r.url())) })
      await page.goto("file:///" + file.replace(/\\/g, "/"), { waitUntil: "load", timeout: 60_000 })
      const links = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")))
      for (const href of links) {
        if (!href || href.startsWith("#") || /^(https?:|mailto:|tel:)/.test(href)) continue
        const target = path.resolve(path.dirname(file), href.split("#")[0])
        if (href.split("#")[0] && !fs.existsSync(target)) errors.push(`dangling link ${href} in ${path.basename(file)}`)
      }
      await page.screenshot({ path: path.join(dir, "qa", path.basename(file, ".html") + ".png") })
      await page.close()
      if (errors.length) issues.push(`${path.relative(dir, file)}: ${[...new Set(errors)].join(" | ")}`)
    }
    if (issues.length) { problems += issues.length; console.log(`✗ ${p.slug}\n   ${issues.join("\n   ")}`) }
    else console.log(`✓ ${p.slug} (${pages.length} pages)`)
  }
} finally {
  await browser.close()
}
console.log(problems ? `${problems} page(s) with issues` : "All pages clean")
process.exit(problems ? 1 : 0)
