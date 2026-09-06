/**
 * Image diversity check: flags gallery frames that are near-duplicates of
 * another frame in the same product (the brief forbids "five variations of
 * the exact same scene"). Uses a 16x16 greyscale difference hash on the local
 * WebP renders; Hamming distance below the threshold is reported.
 *
 *   node scripts/gaming/diversity-check.mjs [--threshold 24]
 */
import { readdirSync, existsSync } from "node:fs"
import sharp from "sharp"
import { OUT_DIR } from "./render/lib.mjs"

const args = process.argv.slice(2)
const threshold = args.includes("--threshold") ? Number(args[args.indexOf("--threshold") + 1]) : 24

async function dhash(file) {
  const { data } = await sharp(file).greyscale().resize(17, 16, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true })
  const bits = []
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) bits.push(data[y * 17 + x] < data[y * 17 + x + 1] ? 1 : 0)
  return bits
}
const hamming = (a, b) => a.reduce((n, v, i) => n + (v !== b[i] ? 1 : 0), 0)

const slugs = readdirSync(OUT_DIR, { withFileTypes: true }).filter((d) => d.isDirectory() && !["manifest", "try"].includes(d.name)).map((d) => d.name)
let flagged = 0, products = 0, frames = 0
for (const slug of slugs) {
  const dir = `${OUT_DIR}/${slug}`
  const files = readdirSync(dir).filter((f) => f.endsWith(".webp") && !f.includes("-card")).sort()
  if (!files.length) continue
  products++
  const hashes = []
  for (const f of files) hashes.push({ f, h: await dhash(`${dir}/${f}`) })
  frames += files.length
  const dupes = []
  for (let i = 0; i < hashes.length; i++) for (let j = i + 1; j < hashes.length; j++) {
    const d = hamming(hashes[i].h, hashes[j].h)
    if (d < threshold) dupes.push(`${hashes[i].f.replace(".webp", "")}~${hashes[j].f.replace(".webp", "")} (${d})`)
  }
  if (dupes.length) flagged++
  console.log(`  ${dupes.length ? "!" : "✓"}  ${slug.padEnd(38)} ${files.length} frames${dupes.length ? "  near-duplicates: " + dupes.join(", ") : ""}`)
}
console.log(`\n${products} products · ${frames} frames · ${flagged} product(s) with frames closer than ${threshold}/256 bits`)
