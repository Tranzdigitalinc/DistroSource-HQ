// Design Resources deliverables for catalogue batch 3, part 1: the colour
// palette collection, the abstract backgrounds pack and the brand identity
// system. Everything is generated here — palettes from colour-harmony
// rules, backgrounds from seeded SVG, the brand kit as SVG, HTML and PDF.
//
//   node scripts/catalog/batch3/design/build_design.mjs
import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"
import { chromium } from "playwright"
import { createZip } from "../../zip-writer.mjs"

const ROOT = path.resolve(import.meta.dirname, "../../../..")
const OUT = path.join(ROOT, ".catalog-build", "batch3")
const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
  return file
}
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
function rng(seed) {
  let a = seed >>> 0 || 1
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ------------------------------------------------------------------ */
/* Colour                                                               */
/* ------------------------------------------------------------------ */

// OKLCH → sRGB, so palettes step evenly in perceived lightness.
function oklchToRgb(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b, m_ = L - 0.1055613458 * a - 0.0638541728 * b, s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3
  const lin = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
  return lin.map((v) => {
    const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055
    return Math.round(Math.min(1, Math.max(0, c)) * 255)
  })
}
const hex = ([r, g, b]) => "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")
const lum = ([r, g, b]) => {
  const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
function rgbToHsb([r, g, b]) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  let h = 0
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [((h * 60 + 360) % 360) / 360, max ? d / max : 0, max]
}

const ADJ = ["Harbour", "Desert", "Alpine", "Citrus", "Velvet", "Coastal", "Ember", "Moss", "Linen", "Midnight", "Orchard", "Glacier", "Saffron", "Terracotta", "Lagoon", "Heather", "Copper", "Meadow", "Slate", "Coral", "Juniper", "Dune", "Plum", "Sage", "Indigo", "Honey", "Fjord", "Clay", "Blossom", "Cedar"]
const NOUN = ["Dusk", "Morning", "Studio", "Market", "Garden", "Signal", "Harvest", "Tide", "Atelier", "Canvas"]
const SCHEMES = ["analogous", "complementary", "triadic", "split", "monochrome", "earth"]

function palette(i) {
  const r = rng(1000 + i)
  const scheme = SCHEMES[i % SCHEMES.length]
  const h0 = r() * 360
  const hues = { analogous: [0, 22, 44, -20, 10], complementary: [0, 12, 180, 192, 0], triadic: [0, 120, 240, 10, 130], split: [0, 150, 210, 15, 0], monochrome: [0, 4, -4, 8, 0], earth: [0, 18, 36, -12, 24] }[scheme]
  const chroma = scheme === "earth" ? [0.06, 0.08, 0.1, 0.05, 0.03] : scheme === "monochrome" ? [0.04, 0.09, 0.14, 0.11, 0.03] : [0.13, 0.15, 0.12, 0.09, 0.04]
  const light = [0.28, 0.48, 0.66, 0.82, 0.95].sort(() => 0)
  const colors = hues.map((dh, k) => {
    const L = light[k] + (r() - 0.5) * 0.05
    return oklchToRgb(L, chroma[k] * (0.85 + r() * 0.3), (h0 + dh + 360) % 360)
  })
  // Noun cycles every palette; the second pass over ADJ shifts it by five so all 60 names are distinct.
  const name = `${ADJ[i % ADJ.length]} ${NOUN[(i + Math.floor(i / ADJ.length) * 5) % NOUN.length]}`
  const roles = ["Deep", "Primary", "Accent", "Soft", "Light"]
  return { name, scheme, colors: colors.map((c, k) => ({ role: roles[k], rgb: c, hex: hex(c) })) }
}

// Adobe Swatch Exchange (ASE) — one group per palette.
function ase(palettes) {
  const chunks = []
  const u16 = (n) => { const b = Buffer.alloc(2); b.writeUInt16BE(n); return b }
  const u32 = (n) => { const b = Buffer.alloc(4); b.writeUInt32BE(n); return b }
  const f32 = (n) => { const b = Buffer.alloc(4); b.writeFloatBE(n); return b }
  const name = (s) => { const t = s + "\0", b = Buffer.alloc(t.length * 2); for (let i = 0; i < t.length; i++) b.writeUInt16BE(t.charCodeAt(i), i * 2); return Buffer.concat([u16(t.length), b]) }
  let blocks = 0
  for (const p of palettes) {
    const g = name(p.name)
    chunks.push(u16(0xc001), u32(g.length), g); blocks++
    for (const c of p.colors) {
      const body = Buffer.concat([name(`${p.name} ${c.role}`), Buffer.from("RGB "), ...c.rgb.map((v) => f32(v / 255)), u16(2)])
      chunks.push(u16(0x0001), u32(body.length), body); blocks++
    }
    chunks.push(u16(0xc002), u32(0)); blocks++
  }
  return Buffer.concat([Buffer.from("ASEF"), u16(1), u16(0), u32(blocks), ...chunks])
}

// Procreate .swatches: a zip holding Swatches.json (HSB 0–1).
const procreate = (p) => createZip([{ name: "Swatches.json", content: JSON.stringify([{ name: p.name, swatches: p.colors.map((c) => { const [h, s, b] = rgbToHsb(c.rgb); return { hue: h, saturation: s, brightness: b, alpha: 1, colorSpace: 0 } }) }]) }])

function swatchCardSvg(p, w = 1200, h = 750) {
  const bw = w / 5
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#ffffff"/>
${p.colors.map((c, k) => `<rect x="${k * bw}" y="0" width="${bw}" height="${h * 0.74}" fill="${c.hex}"/><text x="${k * bw + 22}" y="${h * 0.74 + 48}" font-family="Segoe UI, Arial" font-size="24" font-weight="700" fill="#1b1d21">${c.hex.toUpperCase()}</text><text x="${k * bw + 22}" y="${h * 0.74 + 82}" font-family="Segoe UI, Arial" font-size="19" fill="#6a6f78">${c.role} · ${c.rgb.join(", ")}</text>`).join("")}
<text x="22" y="54" font-family="Georgia, serif" font-size="40" font-weight="700" fill="${lum(p.colors[0].rgb) > 0.4 ? "#1b1d21" : "#ffffff"}">${esc(p.name)}</text></svg>`
}

async function palettes() {
  const slug = "colour-palette-collection-design"
  const base = path.join(OUT, slug, "files", "Colour Palette Collection")
  fs.rmSync(base, { recursive: true, force: true })
  const list = Array.from({ length: 60 }, (_, i) => palette(i))
  write(path.join(base, "All_Palettes.ase"), ase(list))
  write(path.join(base, "All_Palettes.json"), JSON.stringify(list.map((p) => ({ name: p.name, scheme: p.scheme, colors: Object.fromEntries(p.colors.map((c) => [c.role.toLowerCase(), c.hex])) })), null, 2))
  write(path.join(base, "All_Palettes.css"), list.map((p) => `/* ${p.name} — ${p.scheme} */\n.palette-${p.name.toLowerCase().replace(/\W+/g, "-")} {\n${p.colors.map((c) => `  --${c.role.toLowerCase()}: ${c.hex};`).join("\n")}\n}`).join("\n\n") + "\n")
  for (const [i, p] of list.entries()) {
    const stem = `${String(i + 1).padStart(2, "0")}_${p.name.replace(/\W+/g, "_")}`
    write(path.join(base, "Procreate", `${stem}.swatches`), procreate(p))
    write(path.join(base, "ASE", `${stem}.ase`), ase([p]))
    await sharp(Buffer.from(swatchCardSvg(p))).png().toFile(path.join(base, "Swatch_Cards", `${stem}.png`).replace(/(.*)/, (f) => (fs.mkdirSync(path.dirname(f), { recursive: true }), f)))
  }
  // Previews: a wall of 24 palettes, a detail of 6, and the file formats.
  const prev = path.join(OUT, slug, "previews")
  fs.mkdirSync(prev, { recursive: true })
  const wall = (items, cols, cw, ch) => `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000"><rect width="1600" height="1000" fill="#f2efe9"/>${items.map((p, i) => { const x = 60 + (i % cols) * (cw + 20), y = 60 + Math.floor(i / cols) * (ch + 20); return `<g transform="translate(${x},${y})"><rect width="${cw}" height="${ch}" rx="12" fill="#fff"/>${p.colors.map((c, k) => `<rect x="${(k * cw) / 5}" y="0" width="${cw / 5 + 0.5}" height="${ch - 40}" fill="${c.hex}"/>`).join("")}<text x="14" y="${ch - 14}" font-family="Segoe UI, Arial" font-size="17" font-weight="600" fill="#2a2c30">${esc(p.name)}</text></g>` }).join("")}</svg>`
  await sharp(Buffer.from(wall(list.slice(0, 24), 6, 225, 190))).png().toFile(path.join(prev, "wall.png"))
  await sharp(Buffer.from(wall(list.slice(24, 30), 3, 473, 420))).png().toFile(path.join(prev, "detail.png"))
  await sharp(Buffer.from(swatchCardSvg(list[7], 1600, 1000))).png().toFile(path.join(prev, "card.png"))
  return list.length
}

/* ------------------------------------------------------------------ */
/* Abstract backgrounds                                                 */
/* ------------------------------------------------------------------ */

const W = 3840, H = 2160
function bgSvg(style, i) {
  const r = rng(5000 + i * 7)
  const p = palette(i * 3 + 7).colors.map((c) => c.hex)
  const grain = `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${i}"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.09 0"/></filter><rect width="${W}" height="${H}" filter="url(#n)"/>`
  if (style === "Gradient_Mesh") {
    const blobs = Array.from({ length: 6 }, (_, k) => `<circle cx="${r() * W}" cy="${r() * H}" r="${700 + r() * 900}" fill="${p[k % 5]}" opacity="${0.75 + r() * 0.25}"/>`).join("")
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="260"/></filter></defs><rect width="${W}" height="${H}" fill="${p[3]}"/><g filter="url(#b)">${blobs}</g>${grain}</svg>`
  }
  if (style === "Topographic") {
    const cx = r() * W, cy = r() * H
    const lines = Array.from({ length: 46 }, (_, k) => {
      const rad = 80 + k * 70, pts = []
      for (let a = 0; a <= 64; a++) {
        const t = (a / 64) * Math.PI * 2
        const wob = 1 + 0.18 * Math.sin(t * 3 + k * 0.35 + i) + 0.09 * Math.sin(t * 7 - k * 0.2)
        pts.push(`${(cx + Math.cos(t) * rad * wob * 1.4).toFixed(1)},${(cy + Math.sin(t) * rad * wob).toFixed(1)}`)
      }
      return `<polygon points="${pts.join(" ")}" fill="none" stroke="${k % 5 === 0 ? p[2] : p[1]}" stroke-width="${k % 5 === 0 ? 6 : 3}" opacity="0.85"/>`
    }).join("")
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${p[0]}"/>${lines}</svg>`
  }
  if (style === "Geometric_Tiles") {
    const s = 240, cells = []
    for (let y = 0; y < H; y += s) for (let x = 0; x < W; x += s) {
      const c = p[Math.floor(r() * 5)], k = Math.floor(r() * 4)
      const shape = [`<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${c}"/>`, `<path d="M${x} ${y}h${s}v${s}z" fill="${c}"/>`, `<path d="M${x} ${y + s}a${s} ${s} 0 0 1 ${s} -${s}v${s}z" fill="${c}"/>`, `<circle cx="${x + s / 2}" cy="${y + s / 2}" r="${s * 0.38}" fill="${c}"/>`][k]
      cells.push(shape)
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${p[4]}"/>${cells.join("")}</svg>`
  }
  if (style === "Waves") {
    const bands = Array.from({ length: 9 }, (_, k) => {
      const y0 = (H / 9) * k + 120, amp = 90 + r() * 160, f = 1 + r() * 2, ph = r() * 6
      let d = `M0 ${H}L0 ${y0}`
      for (let x = 0; x <= W; x += 40) d += `L${x} ${(y0 + Math.sin((x / W) * Math.PI * 2 * f + ph) * amp).toFixed(1)}`
      return `<path d="${d}L${W} ${H}Z" fill="${p[k % 5]}"/>`
    }).join("")
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${p[4]}"/>${bands}${grain}</svg>`
  }
  // Dot_Field
  const dots = []
  const cx = r() * W, cy = r() * H
  for (let y = 40; y < H; y += 60) for (let x = 40; x < W; x += 60) {
    const d = Math.hypot(x - cx, y - cy) / 2600
    const rad = Math.max(1.5, 22 * (1 - d) + 4 * Math.sin(x * 0.004 + y * 0.003 + i))
    dots.push(`<circle cx="${x}" cy="${y}" r="${rad.toFixed(1)}" fill="${d < 0.35 ? p[2] : d < 0.7 ? p[1] : p[3]}"/>`)
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${p[0]}"/>${dots.join("")}</svg>`
}

async function backgrounds() {
  const slug = "abstract-backgrounds-pack-graphics"
  const base = path.join(OUT, slug, "files", "Abstract Backgrounds Pack")
  fs.rmSync(base, { recursive: true, force: true })
  const styles = ["Gradient_Mesh", "Topographic", "Geometric_Tiles", "Waves", "Dot_Field"]
  const thumbs = []
  let n = 0
  for (const style of styles) for (let k = 0; k < 16; k++) {
    n++
    const svg = bgSvg(style, n)
    const stem = `${style}_${String(k + 1).padStart(2, "0")}`
    write(path.join(base, "SVG", style, `${stem}.svg`), svg)
    const jpg = path.join(base, "JPG_4K", style, `${stem}.jpg`)
    fs.mkdirSync(path.dirname(jpg), { recursive: true })
    await sharp(Buffer.from(svg), { limitInputPixels: false }).jpeg({ quality: 88, mozjpeg: true }).toFile(jpg)
    thumbs.push({ style, file: jpg })
  }
  const prev = path.join(OUT, slug, "previews")
  fs.mkdirSync(prev, { recursive: true })
  const grid = async (files, cols, out) => {
    const cw = Math.floor((1600 - 40 - (cols - 1) * 16) / cols), ch = Math.round((cw * 9) / 16)
    const rows = Math.ceil(files.length / cols)
    const comp = await Promise.all(files.map(async (f, i) => ({ input: await sharp(f).resize(cw, ch).png().toBuffer(), left: 20 + (i % cols) * (cw + 16), top: 20 + Math.floor(i / cols) * (ch + 16) })))
    await sharp({ create: { width: 1600, height: Math.max(1000, 40 + rows * (ch + 16) - 16), channels: 3, background: "#1a1b1f" } }).composite(comp).png().toFile(out)
  }
  await grid(styles.flatMap((s) => thumbs.filter((t) => t.style === s).slice(0, 4).map((t) => t.file)), 5, path.join(prev, "overview.png"))
  await grid(thumbs.filter((t) => t.style === "Gradient_Mesh").slice(0, 9).map((t) => t.file), 3, path.join(prev, "mesh.png"))
  await sharp(thumbs[20].file).resize(1600, 900).png().toFile(path.join(prev, "hero.png"))
  return n
}

/* ------------------------------------------------------------------ */
/* Brand identity system (fictional example brand: Tidewell)            */
/* ------------------------------------------------------------------ */

const BRAND = { name: "Tidewell", tagline: "Everyday calm, made simple.", colors: { Deep: "#12343b", Tide: "#2c7a7b", Sand: "#e9d8b8", Coral: "#e8745a", Foam: "#f6f4ef" }, font: "Outfit", body: "Inter" }
const GF = `<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600&display=block" rel="stylesheet">`
const mark = (size, fg, bg) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="${bg}"/><path d="M14 58c10-9 20-9 30 0s20 9 30 0 12-7 12-7v10c-6 6-12 9-18 9-7 0-12-3-18-8-9-8-18-8-26 0l-10 8z" fill="${fg}"/><path d="M20 42c8-7 16-7 24 0s16 7 24 0 10-5 10-5v8c-5 5-10 7-15 7-6 0-10-2-15-6-7-6-14-6-20 0l-8 6z" fill="${fg}" opacity="0.55"/></svg>`
const lockup = (fg, markBg, markFg) => `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="200" viewBox="0 0 880 200"><style>text{font-family:Outfit, sans-serif;font-weight:600}</style><g transform="translate(0,0)">${mark(200, markFg, markBg).replace(/<svg[^>]*>|<\/svg>/g, "").replace(/<circle/, '<circle transform="scale(2)"').replace(/<path/g, '<path transform="scale(2)"')}</g><text x="240" y="132" font-size="118" fill="${fg}" letter-spacing="-2">${BRAND.name}</text></svg>`

async function brandKit() {
  const slug = "brand-identity-system-guidelines-template"
  const base = path.join(OUT, slug, "files", "Brand Identity System")
  fs.rmSync(base, { recursive: true, force: true })
  const C = BRAND.colors
  const logos = {
    "Logo_Primary.svg": lockup(C.Deep, C.Tide, C.Foam),
    "Logo_Reversed.svg": lockup(C.Foam, C.Foam, C.Deep),
    "Logo_Mono_Black.svg": lockup("#000000", "#000000", "#ffffff"),
    "Logo_Mono_White.svg": lockup("#ffffff", "#ffffff", "#000000"),
    "Logomark.svg": mark(512, C.Foam, C.Tide),
    "Logomark_Coral.svg": mark(512, C.Foam, C.Coral),
    "Favicon.svg": mark(64, C.Foam, C.Tide),
  }
  for (const [f, svg] of Object.entries(logos)) write(path.join(base, "Logos", "SVG", f), svg)
  write(path.join(base, "Colour", "tokens.json"), JSON.stringify({ color: Object.fromEntries(Object.entries(C).map(([k, v]) => [k.toLowerCase(), { value: v }])), font: { display: { value: BRAND.font }, body: { value: BRAND.body } } }, null, 2))
  write(path.join(base, "Colour", "tokens.css"), `:root {\n${Object.entries(C).map(([k, v]) => `  --tw-${k.toLowerCase()}: ${v};`).join("\n")}\n  --tw-font-display: "${BRAND.font}", sans-serif;\n  --tw-font-body: "${BRAND.body}", sans-serif;\n}\n`)
  write(path.join(base, "Colour", "Tidewell.ase"), ase([{ name: "Tidewell", colors: Object.entries(C).map(([k, v]) => ({ role: k, rgb: [1, 3, 5].map((o) => parseInt(v.slice(o, o + 2), 16)) })) }]))
  write(path.join(base, "Email_Signature.html"), `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;color:${C.Deep}"><tr><td style="padding-right:14px;border-right:3px solid ${C.Coral}"><strong style="font-size:15px">Your Name</strong><br><span style="font-size:13px;color:${C.Tide}">Job title · ${BRAND.name}</span></td><td style="padding-left:14px;font-size:12px;line-height:1.6">you@tidewell.example<br>+1 (555) 010-2020<br>tidewell.example</td></tr></table>\n`)

  const browser = await chromium.launch()
  const tab = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
  const render = async (html, out, opts = {}) => {
    await tab.setContent(html, { waitUntil: "networkidle" })
    await tab.evaluate(() => document.fonts.ready)
    if (out.endsWith(".pdf")) await tab.pdf({ path: out, printBackground: true, preferCSSPageSize: true, ...opts })
    else await tab.screenshot({ path: out, omitBackground: !!opts.transparent })
  }
  for (const [f, svg] of Object.entries(logos)) {
    const png = path.join(base, "Logos", "PNG", f.replace(".svg", ".png"))
    fs.mkdirSync(path.dirname(png), { recursive: true })
    const [w, h] = f.startsWith("Logo_") ? [1760, 400] : [1024, 1024]
    await tab.setViewportSize({ width: w, height: h })
    await render(`<html><head>${GF}<style>html,body{margin:0;background:transparent}svg{width:${w}px;height:${h}px;display:block}</style></head><body>${svg}</body></html>`, png, { transparent: true })
  }
  await tab.setViewportSize({ width: 1600, height: 1000 })

  // Guidelines: 14 landscape pages.
  const pg = (inner, bg = C.Foam, fg = C.Deep) => `<section style="width:1600px;height:1000px;background:${bg};color:${fg};position:relative;page-break-after:always;overflow:hidden;padding:90px 110px;box-sizing:border-box">${inner}<div style="position:absolute;left:110px;bottom:46px;font:500 15px Inter;opacity:0.6">${BRAND.name} brand guidelines · v1.0</div></section>`
  const h = (k, t) => `<div style="font:600 16px Inter;letter-spacing:4px;text-transform:uppercase;color:${C.Coral}">${k}</div><h2 style="font:700 76px Outfit;margin:18px 0 30px;letter-spacing:-1px">${t}</h2>`
  const p = (t) => `<p style="font:400 24px/1.55 Inter;max-width:820px;margin:0 0 18px">${t}</p>`
  const sw = Object.entries(C).map(([k, v]) => `<div style="flex:1"><div style="height:340px;background:${v};border-radius:18px;${v === C.Foam ? `border:2px solid ${C.Sand}` : ""}"></div><div style="font:600 26px Outfit;margin-top:18px">${k}</div><div style="font:500 19px Inter;opacity:0.75">${v.toUpperCase()}<br>RGB ${[1, 3, 5].map((o) => parseInt(v.slice(o, o + 2), 16)).join(" ")}</div></div>`).join("")
  const pages = [
    pg(`<div style="position:absolute;inset:0;display:grid;place-items:center"><div style="text-align:center">${lockup(C.Foam, C.Foam, C.Deep).replace('width="880" height="200"', 'width="1100" height="250"')}<div style="font:500 30px Inter;margin-top:30px;opacity:0.85">Brand guidelines</div></div></div>`, C.Deep, C.Foam),
    pg(`${h("Contents", "What's inside")}<div style="columns:2;font:500 28px/2 Inter;max-width:1100px">${["Our story", "Logo", "Clear space and size", "Logo misuse", "Colour", "Typography", "Graphic elements", "Photography style", "Layout grid", "Social media", "Stationery", "Email signature"].map((t, i) => `<div><span style="color:${C.Coral};font-weight:600">${String(i + 1).padStart(2, "0")}</span>  ${t}</div>`).join("")}</div>`),
    pg(`${h("01 · Our story", "Everyday calm, made simple.")}${p("Tidewell makes small, well-made products that help people slow down: bath salts, candles, sleep masks and teas, designed around the rhythm of the sea.")}${p("Our identity borrows from the shoreline — a deep sea-green, soft sand, warm coral and white foam — and a mark made of two gentle waves. Everything we make should feel unhurried, honest and clear.")}`),
    pg(`${h("02 · Logo", "The lockup and the mark")}<div style="display:flex;gap:50px;align-items:center;margin-top:30px"><div style="background:#fff;border-radius:20px;padding:70px 60px">${lockup(C.Deep, C.Tide, C.Foam).replace('width="880" height="200"', 'width="760" height="173"')}</div><div style="background:${C.Tide};border-radius:20px;padding:50px">${mark(260, C.Foam, C.Tide)}</div></div>${p("Use the full lockup wherever there is room. The mark alone works for icons, stamps and social avatars.")}`),
    pg(`${h("03 · Clear space and size", "Give it room to breathe")}<div style="display:flex;gap:60px;align-items:center"><div style="border:3px dashed ${C.Coral};padding:70px;border-radius:12px">${lockup(C.Deep, C.Tide, C.Foam).replace('width="880" height="200"', 'width="620" height="141"')}</div><div>${p("Keep clear space equal to the height of the mark's lower wave on every side.")}${p("Minimum size: 120 px wide on screen, 30 mm in print. Below that, use the mark alone.")}</div></div>`),
    pg(`${h("04 · Logo misuse", "Please don't")}<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:26px">${[["Stretch it", "transform:scaleX(1.5)"], ["Recolour it", "filter:hue-rotate(160deg)"], ["Rotate it", "transform:rotate(-14deg)"], ["Add effects", "filter:drop-shadow(10px 10px 0 #e8745a)"]].map(([t, css]) => `<div><div style="background:#fff;border-radius:16px;height:260px;display:grid;place-items:center;overflow:hidden"><div style="${css}">${mark(150, C.Foam, C.Tide)}</div></div><div style="font:600 24px Outfit;margin-top:14px;color:${C.Coral}">✕ ${t}</div></div>`).join("")}</div>`),
    pg(`${h("05 · Colour", "Shoreline palette")}<div style="display:flex;gap:24px">${sw}</div>`),
    pg(`${h("06 · Typography", "Outfit and Inter")}<div style="display:flex;gap:80px"><div><div style="font:700 150px Outfit;line-height:1">Aa</div><div style="font:600 28px Outfit;margin-top:14px">Outfit — headlines</div><div style="font:400 20px Inter;opacity:0.7">Free under the SIL Open Font Licence</div></div><div style="max-width:720px"><div style="font:700 56px Outfit;line-height:1.1">Everyday calm, made simple.</div><p style="font:400 24px/1.55 Inter;margin-top:20px">Inter sets body copy, product details and interfaces. Keep lines under 80 characters and use sentence case everywhere.</p><div style="font:400 20px Inter;opacity:0.7">Inter — free under the SIL Open Font Licence</div></div></div>`),
    pg(`${h("07 · Graphic elements", "Waves and circles")}<div style="display:flex;gap:30px">${[C.Tide, C.Coral, C.Sand, C.Deep].map((c, i) => `<div style="flex:1;height:420px;border-radius:24px;background:${c};position:relative;overflow:hidden"><svg viewBox="0 0 400 420" style="position:absolute;inset:0;width:100%;height:100%"><path d="M0 ${260 + i * 20}c60-40 120-40 180 0s120 40 220 0v200H0z" fill="${C.Foam}" opacity="0.35"/><circle cx="${300 - i * 40}" cy="110" r="${60 + i * 10}" fill="${C.Foam}" opacity="0.25"/></svg></div>`).join("")}</div>`),
    pg(`${h("08 · Photography", "Soft light, real texture")}<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">${["Natural light, early or late in the day", "Textures: linen, stone, water, wood", "Hands and rituals, never posed smiles"].map((t, i) => `<div><div style="height:360px;border-radius:20px;background:linear-gradient(${140 + i * 30}deg, ${[C.Sand, C.Tide, C.Coral][i]}, ${C.Foam})"></div><div style="font:500 22px Inter;margin-top:14px">${t}</div></div>`).join("")}</div>`),
    pg(`${h("09 · Layout grid", "Twelve columns, generous margins")}<div style="position:relative;height:520px;background:#fff;border-radius:18px;overflow:hidden">${Array.from({ length: 12 }, (_, i) => `<div style="position:absolute;top:0;bottom:0;left:${40 + i * 108}px;width:84px;background:${C.Coral};opacity:0.12"></div>`).join("")}<div style="position:absolute;left:40px;top:60px;font:700 64px Outfit;color:${C.Deep}">Headline spans eight columns</div><div style="position:absolute;left:40px;top:170px;width:600px;font:400 22px/1.5 Inter">Body copy spans six columns with a 24 px gutter. Leave the outer margins empty.</div></div>`),
    pg(`${h("10 · Social media", "Posts that feel like us")}<div style="display:flex;gap:30px">${[["Slow Sunday", C.Tide], ["New: sea salt candle", C.Coral], ["Five-minute reset", C.Deep]].map(([t, c]) => `<div style="width:420px;height:420px;border-radius:20px;background:${c};color:${C.Foam};padding:40px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between"><div>${mark(64, c, C.Foam)}</div><div style="font:700 46px/1.05 Outfit">${t}</div></div>`).join("")}</div>`),
    pg(`${h("11 · Stationery", "Card and letterhead")}<div style="display:flex;gap:50px;align-items:flex-start"><div style="width:595px;height:385px;border-radius:12px;background:${C.Deep};color:${C.Foam};padding:44px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between">${lockup(C.Foam, C.Foam, C.Deep).replace('width="880" height="200"', 'width="330" height="75"')}<div style="font:500 20px/1.6 Inter">Your Name · Founder<br>you@tidewell.example</div></div><div style="width:420px;height:594px;background:#fff;border-radius:6px;padding:40px;box-sizing:border-box">${lockup(C.Deep, C.Tide, C.Foam).replace('width="880" height="200"', 'width="220" height="50"')}<div style="margin-top:60px;height:10px;width:70%;background:${C.Sand};border-radius:5px"></div><div style="margin-top:14px;height:10px;width:90%;background:${C.Sand};border-radius:5px"></div><div style="margin-top:14px;height:10px;width:80%;background:${C.Sand};border-radius:5px"></div></div></div>`),
    pg(`${h("12 · Email signature", "Clear and consistent")}<div style="background:#fff;border-radius:18px;padding:50px;display:inline-block;transform:scale(1.6);transform-origin:top left">${fs.readFileSync(path.join(base, "Email_Signature.html"), "utf8")}</div>`),
  ]
  const guide = `<html><head>${GF}<style>@page{size:1600px 1000px;margin:0}body{margin:0}</style></head><body>${pages.join("")}</body></html>`
  write(path.join(OUT, slug, "src", "guidelines.html"), guide)
  // Editable source for buyers: rebrand by find-and-replace, then print to PDF.
  const header = `<!--
  ${BRAND.name} brand guidelines — editable source
  ------------------------------------------------
  Rebrand this document in a code editor (VS Code, Sublime, Notepad++):
  1. Find and replace the brand name "${BRAND.name}" with yours.
  2. Find and replace the five colours:
${Object.entries(C).map(([k, v]) => `       ${k.padEnd(6)} ${v}`).join("\n")}
  3. Edit the headings and paragraphs on each <section> (one section = one page).
  4. Replace the logo <svg> blocks with your own SVG logo code if you have one.
  5. Open the file in Chrome or Edge → Print → Save as PDF, with
     "Background graphics" switched on and margins set to None.
  Fonts load from Google Fonts (Outfit and Inter, SIL Open Font Licence),
  so print while online.
-->
`
  write(path.join(base, "Editable_Source", `${BRAND.name}_Brand_Guidelines.html`), "<!doctype html>\n" + header + guide.replace("<html>", `<html lang="en">`).replace("<head>", `<head><meta charset="utf-8"><title>${BRAND.name} brand guidelines</title>`))
  await tab.setContent(guide, { waitUntil: "networkidle" })
  await tab.evaluate(() => document.fonts.ready)
  await tab.pdf({ path: path.join(base, "Tidewell_Brand_Guidelines.pdf"), printBackground: true, preferCSSPageSize: true })
  const prev = path.join(OUT, slug, "previews")
  fs.mkdirSync(prev, { recursive: true })
  for (const [i, name] of [[0, "cover"], [3, "logo"], [6, "colour"], [7, "type"], [10, "social"], [11, "stationery"]]) {
    await tab.setContent(`<html><head>${GF}<style>body{margin:0}</style></head><body>${pages[i]}</body></html>`, { waitUntil: "networkidle" })
    await tab.evaluate(() => document.fonts.ready)
    await tab.screenshot({ path: path.join(prev, `${name}.png`) })
  }
  // Print-ready business card (85 × 55 mm with 3 mm bleed) and A4 letterhead.
  const cardFront = `<div style="width:91mm;height:61mm;background:${C.Deep};display:grid;place-items:center;page-break-after:always">${lockup(C.Foam, C.Foam, C.Deep).replace('width="880" height="200"', 'width="220" height="50"')}</div>`
  const cardBack = `<div style="width:91mm;height:61mm;background:${C.Foam};color:${C.Deep};padding:9mm;box-sizing:border-box;font:500 8.5pt/1.55 Inter"><b style="font:600 11pt Outfit">Your Name</b><br>Founder<br><br>you@tidewell.example<br>+1 (555) 010-2020<br>tidewell.example</div>`
  await tab.setContent(`<html><head>${GF}<style>@page{size:91mm 61mm;margin:0}body{margin:0}</style></head><body>${cardFront}${cardBack}</body></html>`, { waitUntil: "networkidle" })
  await tab.evaluate(() => document.fonts.ready)
  await tab.pdf({ path: path.join(base, "Stationery", "Business_Card_85x55mm_3mm_bleed.pdf").replace(/(.*)/, (f) => (fs.mkdirSync(path.dirname(f), { recursive: true }), f)), printBackground: true, preferCSSPageSize: true })
  await tab.setContent(`<html><head>${GF}<style>@page{size:210mm 297mm;margin:0}body{margin:0}</style></head><body><div style="width:210mm;height:297mm;padding:18mm 20mm;box-sizing:border-box;position:relative;font:400 10pt Inter;color:${C.Deep}">${lockup(C.Deep, C.Tide, C.Foam).replace('width="880" height="200"', 'width="190" height="43"')}<div style="position:absolute;left:20mm;right:20mm;bottom:14mm;border-top:1.5pt solid ${C.Coral};padding-top:3mm;font-size:8pt;display:flex;justify-content:space-between"><span>Tidewell Ltd · 8 Harbour Row, Your Town</span><span>tidewell.example</span></div></div></body></html>`, { waitUntil: "networkidle" })
  await tab.evaluate(() => document.fonts.ready)
  await tab.pdf({ path: path.join(base, "Stationery", "Letterhead_A4.pdf"), printBackground: true, preferCSSPageSize: true })
  await browser.close()
  return pages.length
}

// Optional part filter: node build_design.mjs palettes,brand
const parts = process.argv[2]?.split(",") ?? ["palettes", "backgrounds", "brand"]
if (parts.includes("palettes")) console.log(`palettes: ${await palettes()}`)
if (parts.includes("backgrounds")) console.log(`backgrounds: ${await backgrounds()}`)
if (parts.includes("brand")) console.log(`brand guideline pages: ${await brandKit()}`)
