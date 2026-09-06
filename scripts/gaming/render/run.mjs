/**
 * Orchestrator: render a product's gallery, encode, upload, verify, and
 * write the resulting Blob pathnames into lib/gaming/products.ts.
 *
 *   node --env-file=.env.local scripts/gaming/render/run.mjs --slugs a,b
 *   node --env-file=.env.local scripts/gaming/render/run.mjs --all --upload --write
 *
 * Flags:
 *   --slugs a,b   products to process (default: every slug with a plan)
 *   --upload      upload full + card WebP to Blob (otherwise local only)
 *   --write       patch products.ts images[] / cardImage from the manifest
 *   --force       re-render even if a manifest already exists
 *   --from-manifest  no rendering: load the uploaded manifests for --slugs and
 *                 only do the --write step (one write pass after parallel jobs)
 *
 * Every frame is checked for variance before it is accepted: a blank or
 * black frame fails the product rather than being uploaded.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { loadProducts, launchBrowser, renderScene, encode, frameSpread, uploadAsset, readManifest, writeManifest, localPath } from "./lib.mjs"
import { PLANS } from "./plan.mjs"

const args = process.argv.slice(2)
const flag = (f) => args.includes(f)
const opt = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null }

const products = await loadProducts()
const bySlug = new Map(products.map((p) => [p.slug, p]))
const slugs = opt("--slugs") ? opt("--slugs").split(",") : Object.keys(PLANS)
const UPLOAD = flag("--upload"), WRITE = flag("--write"), FORCE = flag("--force"), FROM_MANIFEST = flag("--from-manifest")

const summary = []
const browser = FROM_MANIFEST ? null : await launchBrowser()
try {
  for (const slug of slugs) {
    if (FROM_MANIFEST) { const m = readManifest(slug); if (m?.uploaded) summary.push(m); else console.log(`✗ ${slug}: no uploaded manifest`); continue }
    const product = bySlug.get(slug)
    const plan = PLANS[slug]
    if (!product) { console.log(`✗ ${slug}: not in catalogue`); continue }
    if (!plan) { console.log(`✗ ${slug}: no plan`); continue }
    if (!FORCE && readManifest(slug)?.uploaded && UPLOAD) { console.log(`= ${slug}: already uploaded (use --force)`); summary.push(readManifest(slug)); continue }

    console.log(`\n▶ ${slug}  (${plan.length} images)`)
    const images = []
    let failed = false
    for (const entry of plan) {
      const t0 = Date.now()
      const png = await renderScene(browser, entry.make(), { label: `${slug}/${entry.key}` })
      const spread = await frameSpread(png)
      if (spread < 60) { console.log(`  ✗ ${entry.key}: blank frame (spread ${spread})`); failed = true; break }
      writeFileSync(localPath(slug, `${entry.key}.png`), png)
      const { full, card } = await encode(png)
      writeFileSync(localPath(slug, `${entry.key}.webp`), full)
      const rec = { key: entry.key, label: entry.label, alt: `${product.title} — ${entry.alt}`, spread, fullBytes: full.length, cardBytes: card.length }
      if (UPLOAD) {
        rec.full = await uploadAsset(full, `gaming/${slug}/${entry.key}.webp`)
        rec.card = await uploadAsset(card, `gaming/${slug}/${entry.key}-card.webp`)
      }
      images.push(rec)
      console.log(`  ✓ ${entry.key.padEnd(11)} ${String(Date.now() - t0).padStart(5)} ms  spread ${String(spread).padStart(3)}  ${(full.length / 1024).toFixed(0).padStart(4)} KB${UPLOAD ? `  → ${rec.full.pathname.split("/").pop()}` : ""}`)
    }
    if (failed) { summary.push({ slug, failed: true }); continue }
    const manifest = { slug, title: product.title, platform: product.platform, category: product.category, uploaded: UPLOAD, at: new Date().toISOString(), images }
    writeManifest(slug, manifest)
    summary.push(manifest)
  }
} finally {
  if (browser) await browser.close()
}

/* ---------------------------------------------- write back to products.ts */

if (WRITE) {
  const file = "lib/gaming/products.ts"
  let src = readFileSync(file, "utf8")
  let written = 0
  for (const m of summary) {
    if (m.failed || !m.uploaded) continue
    const cover = m.images.find((i) => i.key === "cover") ?? m.images[0]
    const fulls = m.images.map((i) => i.full.pathname)
    const block = `    images: ${JSON.stringify(fulls)},\n    cardImage: ${JSON.stringify(cover.card.pathname)},\n`
    // Locate this product's draft by slug, then replace or insert its image fields.
    const slugLine = `\n    slug: "${m.slug}",\n`
    const at = src.indexOf(slugLine)
    if (at < 0) { console.log(`  ! ${m.slug}: slug line not found, skipped`); continue }
    const after = at + slugLine.length
    const end = src.indexOf("\n  },", after)
    let body = src.slice(after, end)
    body = body.replace(/^    images: \[[\s\S]*?\],\n/m, "").replace(/^    cardImage: "[^"]*",\n/m, "")
    src = src.slice(0, after) + block + body + src.slice(end)
    written++
  }
  writeFileSync(file, src)
  console.log(`\nwrote images for ${written} product(s) into ${file}`)
}

/* --------------------------------------------------------------- report */

console.log("\n=== summary")
for (const m of summary) {
  if (m.failed) { console.log(`  ✗ ${m.slug}: FAILED`); continue }
  const total = m.images.reduce((a, i) => a + i.fullBytes, 0)
  console.log(`  ✓ ${m.slug.padEnd(30)} ${m.images.length} images  ${(total / 1024).toFixed(0).padStart(5)} KB${m.uploaded ? "  uploaded" : ""}`)
}
