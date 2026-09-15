// Packages every batch-3 product into one ZIP: the generated deliverables,
// plus README.txt and LICENSE.txt (and specimen.html for fonts).
//
//   node scripts/catalog/batch3/package.mjs            # every product
//   node scripts/catalog/batch3/package.mjs presets,font
//
// Output: .catalog-build/batch3/zips/<slug>.zip
import fs from "node:fs"
import path from "node:path"
import zlib from "node:zlib"
import { AUDIO_COMMON, FONT_COMMON, PRODUCTS } from "./catalog.mjs"

const ROOT = path.resolve(import.meta.dirname, "../../..")
export const BUILD = path.join(ROOT, ".catalog-build", "batch3")
export const ZIPS = path.join(BUILD, "zips")

export const commonFor = (p) => p.common ?? (p.kind === "font" ? FONT_COMMON : p.kind === "audio" ? AUDIO_COMMON : {})

function walk(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const abs = path.join(dir, e.name)
    return e.isDirectory() ? walk(abs, base) : [{ rel: path.relative(base, abs).split(path.sep).join("/"), abs }]
  }).sort((a, b) => a.rel.localeCompare(b.rel, "en", { numeric: true }))
}

/* ------------------------------------------------------------------ */
/* ZIP with deflate and UTF-8 names                                     */
/* ------------------------------------------------------------------ */

const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c })
const crc32 = (buf) => { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }

export function zip(entries) {
  const now = new Date()
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)
  const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()
  const locals = [], centrals = []
  let offset = 0
  for (const e of entries) {
    const raw = Buffer.isBuffer(e.content) ? e.content : Buffer.from(e.content, "utf8")
    const packed = zlib.deflateRawSync(raw, { level: 9 })
    const deflate = packed.length < raw.length
    const data = deflate ? packed : raw
    const name = Buffer.from(e.name, "utf8")
    const crc = crc32(raw)
    const head = (sig, central) => {
      const b = Buffer.alloc(central ? 46 : 30)
      let o = 0
      b.writeUInt32LE(sig, o); o += 4
      if (central) { b.writeUInt16LE(20, o); o += 2 }
      b.writeUInt16LE(20, o); b.writeUInt16LE(0x0800, o + 2); b.writeUInt16LE(deflate ? 8 : 0, o + 4)
      b.writeUInt16LE(time, o + 6); b.writeUInt16LE(date, o + 8); b.writeUInt32LE(crc, o + 10)
      b.writeUInt32LE(data.length, o + 14); b.writeUInt32LE(raw.length, o + 18); b.writeUInt16LE(name.length, o + 22)
      if (central) b.writeUInt32LE(offset, 42)
      return b
    }
    const local = Buffer.concat([head(0x04034b50, false), name, data])
    centrals.push(Buffer.concat([head(0x02014b50, true), name]))
    locals.push(local)
    offset += local.length
  }
  const central = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(central.length, 12); end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, central, end])
}

/* ------------------------------------------------------------------ */
/* README, LICENSE and font specimen                                    */
/* ------------------------------------------------------------------ */

const LICENCE_EXTRA = {
  font: ["You may embed the fonts in PDFs and in apps or websites allowed by your tier; self-host the WOFF2 files for the web.", "You may not sell, share or redistribute the font files, or modified versions of them, as fonts."],
  audio: ["You may use the sounds inside finished works — videos, games, apps, podcasts and music releases.", "You may not distribute the sounds as standalone files or include them in a sample library, sound pack or AI training set."],
  model: ["You may use the models inside finished games, renders, animations and visualisations, including engine builds that contain the model data.", "You may not share or sell the model files themselves, alone or in an asset pack."],
  print: ["You may sell physical prints within the limits of your tier.", "You may not share, sell or upload the STL files, or modified versions of them, anywhere."],
  doc: ["You may edit the files and use the results in your own or your client's business, as your tier allows.", "You may not resell the templates, or modified versions of them, as templates."],
  notion: ["You may duplicate and adapt the workspace for your own or your client's use, as your tier allows.", "You may not resell or publish the template, or a modified version of it, as a template."],
  design: ["You may use the assets inside finished designs — websites, products, marketing, video and print.", "You may not resell the assets as assets, templates or print-on-demand designs where the asset is the main thing being sold."],
  preset: ["You may use the looks on photos and videos you edit, as your tier allows.", "You may not share, sell or give away the presets or LUTs, or modified versions of them."],
}

function licenseText(p) {
  const extra = LICENCE_EXTRA[p.kind === "model" ? (p.model === "print" ? "print" : "model") : p.kind] ?? []
  return [
    `DistroSource Originals licence — ${p.name}`,
    `Copyright (c) 2026 DistroSource. All rights not granted below are reserved.`,
    "",
    "The tier you bought is shown on your order and receipt.",
    "",
    ...p.licences.map(([tier, text]) => `${tier.toUpperCase()}\n  ${text}\n`),
    "ALL TIERS",
    ...extra.map((t) => `  - ${t}`),
    "  - You may not resell, share, sublicense or redistribute the files themselves, including in modified form or as part of a bundle.",
    "  - The licence is for the buyer named on the order and cannot be transferred.",
    "",
    'The files are provided "as is", without warranty of any kind.',
    "",
  ].join("\n")
}

function extraSections(p, files) {
  if (p.kind === "model") {
    const stats = JSON.parse(fs.readFileSync(path.join(BUILD, p.slug, "stats.json"), "utf8"))
    const unit = p.model === "print" ? "mm" : "m"
    return [`${p.model === "print" ? "PARTS" : "PIECES"} (size in ${unit}, triangles)`, ...stats.map((s) => `  ${s.name.replace(/_/g, " ").padEnd(28)} ${s.size.map((v) => (p.model === "print" ? Math.round(v) : v.toFixed(2))).join(" x ").padEnd(22)} ${s.triangles.toLocaleString("en-US")}`),
      ...(p.model === "print" ? ["", "PRINT SETTINGS", "  Layer height 0.2 mm · 3 walls · 15% gyroid infill · PLA or PETG · no supports"] : ["", "UNITS", "  Metres, Y up, pivot at the base of each piece"])]
  }
  if (p.kind === "audio") {
    const data = JSON.parse(fs.readFileSync(path.join(BUILD, p.slug, "peaks.json"), "utf8"))
    const total = data.files.reduce((s, f) => s + f.seconds, 0)
    return ["FILES", `  ${data.files.length} WAV files · 44.1 kHz · 16-bit · stereo · ${Math.round(total)} seconds in total`, ...p.groups.map(([pre, label]) => [label, data.files.filter((f) => f.name.startsWith(pre)).length]).filter(([, n]) => n).map(([label, n]) => `  ${String(n).padStart(3)}  ${label}`)]
  }
  if (p.kind === "preset") {
    const looks = files.filter((f) => f.rel.endsWith(".xmp")).map((f) => path.basename(f.rel, ".xmp"))
    return ["LOOKS", ...looks.map((l) => `  ${l}`)]
  }
  return []
}

function readmeText(p, files) {
  const c = commonFor(p)
  const get = p.get ?? (p.kind === "audio" ? ["WAV files in category folders", "README and licence"] : [])
  const list = (title, items, numbered) => (items?.length ? [title, ...items.map((t, i) => `  ${numbered ? `${i + 1}.` : "-"} ${t}`), ""] : [])
  const extra = extraSections(p, files)
  return [
    p.name, `DistroSource Originals · ${p.sku} · version 1.0.0`, "", p.tagline, "",
    ...list("WHAT'S INSIDE", get), ...(extra.length ? [...extra, ""] : []),
    ...list("HOW TO USE", c.howTo, true), ...list("COMPATIBILITY", c.compat), ...list("REQUIREMENTS", c.requirements),
    ...(p.note ? ["GOOD TO KNOW", `  ${p.note}`, ""] : []),
    "LICENCE", "  See LICENSE.txt. Your tier is shown on your order and receipt.", "",
    "SUPPORT", "  Open a support ticket from the order in your DistroSource account and include your order number.", "",
  ].join("\n")
}

function specimen(p) {
  const w = { Light: 300, Regular: 400, Medium: 500, Bold: 700 }
  const faces = p.font.styles.map((s) => `@font-face {\n  font-family: "${p.font.family}";\n  src: url("WOFF2/${p.font.files}-${s}.woff2") format("woff2");\n  font-weight: ${w[s]};\n  font-style: normal;\n  font-display: swap;\n}`).join("\n")
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${p.font.family} — specimen</title>
<style>
${faces}
body { margin: 0; padding: 48px; font-family: system-ui, sans-serif; background: #f6f4ef; color: #16140f }
h1 { font: 700 64px/1 "${p.font.family}"; margin: 0 0 8px }
.style { background: #fff; border-radius: 12px; padding: 28px 32px; margin: 18px 0 }
.style small { font: 600 12px/1 ui-monospace, monospace; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8375 }
.style div { font-family: "${p.font.family}"; font-size: 44px; margin-top: 12px }
.style p { font-family: "${p.font.family}"; font-size: 18px; line-height: 1.5; max-width: 760px }
pre { background: #16140f; color: #f3efe6; padding: 22px; border-radius: 12px; overflow: auto; font-size: 13px }
</style></head><body>
<h1>${p.font.family}</h1><p>${p.tagline}</p>
${p.font.styles.map((s) => `<section class="style"><small>${s} · ${w[s]}</small><div style="font-weight:${w[s]}">The quick brown fox jumps over the lazy dog</div><p style="font-weight:${w[s]}">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 !?&amp;@#%()[]{}</p></section>`).join("\n")}
<h2>Use on the web</h2>
<p>Upload the WOFF2 folder next to your stylesheet, then add:</p>
<pre>${faces.replace(/</g, "&lt;")}

body { font-family: "${p.font.family}", ${p.font.theme === "code" ? "ui-monospace, monospace" : "sans-serif"}; }</pre>
</body></html>
`
}

/** All entries of a product's ZIP, and the deliverable file list used for listings. */
export function contents(p) {
  if (p.kind === "font") {
    const root = p.font.family
    const files = walk(path.join(BUILD, p.slug, "fonts")).map((f) => ({ ...f, rel: `${f.rel.endsWith(".woff2") ? "WOFF2" : "OTF"}/${f.rel}` }))
    const entries = [...files.map((f) => ({ name: `${root}/${f.rel}`, content: fs.readFileSync(f.abs) })), { name: `${root}/specimen.html`, content: specimen(p) }]
    entries.push({ name: `${root}/README.txt`, content: readmeText(p, files) }, { name: `${root}/LICENSE.txt`, content: licenseText(p) })
    return { root, files, entries }
  }
  const dir = path.join(BUILD, p.slug, "files")
  const [root] = fs.readdirSync(dir)
  const files = walk(path.join(dir, root))
  const entries = files.map((f) => ({ name: `${root}/${f.rel}`, content: fs.readFileSync(f.abs) }))
  if (!files.some((f) => /^readme\.(txt|md|pdf)$/i.test(f.rel))) entries.push({ name: `${root}/README.txt`, content: readmeText(p, files) })
  entries.push({ name: `${root}/LICENSE.txt`, content: licenseText(p) })
  return { root, files, entries }
}

const isMain = process.argv[1]?.endsWith("package.mjs")
if (isMain) {
  const filters = process.argv[2]?.split(",").filter(Boolean)
  fs.mkdirSync(ZIPS, { recursive: true })
  for (const p of PRODUCTS) {
    if (filters && !filters.some((f) => p.slug.includes(f) || p.kind === f)) continue
    const { entries } = contents(p)
    const buf = zip(entries)
    fs.writeFileSync(path.join(ZIPS, `${p.slug}.zip`), buf)
    console.log(`${p.sku} ${p.slug}: ${entries.length} files, ${(buf.length / 1048576).toFixed(1)} MB`)
  }
}
