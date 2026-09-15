// Photography presets for catalogue batch 3: Lightroom / Camera Raw XMP
// presets plus matching 33-point .cube LUTs for video and photo editors.
// Both are generated from one set of parameters per look. The LUT applies
// DistroSource's own colour transform; the XMP maps the same intent onto
// Camera Raw's sliders, so the two are close but not pixel-identical.
//
// Previews apply the LUT to DistroSource path-traced renders (there are no
// photographs in this project) and are labelled that way in the listing.
//
//   node scripts/catalog/batch3/presets/build_presets.mjs
import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import sharp from "sharp"

const ROOT = path.resolve(import.meta.dirname, "../../../..")
const OUT = path.join(ROOT, ".catalog-build", "batch3")
const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
  return file
}

/* ------------------------------------------------------------------ */
/* Looks. Values are in "slider" units, mostly −1…1.                    */
/* ------------------------------------------------------------------ */

const PACKS = {
  "film-stock-lightroom-presets": {
    folder: "Film Stock Presets", group: "DistroSource Film Stock",
    looks: {
      "Warm Film 100": { exposure: 0.05, contrast: 0.12, fade: 0.05, temp: 0.35, sat: -0.08, vib: 0.1, split: [[35, 0.12], [45, 0.18]], grain: 12 },
      "Warm Film 400": { exposure: 0.1, contrast: 0.2, fade: 0.08, temp: 0.4, sat: -0.05, vib: 0.08, split: [[28, 0.15], [42, 0.2]], grain: 22 },
      "Cool Film 200": { exposure: 0.05, contrast: 0.15, fade: 0.06, temp: -0.3, sat: -0.1, split: [[210, 0.14], [190, 0.1]], grain: 14 },
      "Faded Film": { contrast: -0.1, fade: 0.16, sat: -0.2, temp: 0.1, split: [[200, 0.08], [40, 0.1]], grain: 16 },
      "Expired Film": { exposure: 0.12, contrast: 0.05, fade: 0.14, temp: 0.3, tint: 0.25, sat: -0.12, split: [[300, 0.12], [55, 0.22]], grain: 30 },
      "Chrome Slide": { contrast: 0.32, sat: 0.12, vib: 0.18, shadows: -0.15, split: [[220, 0.1], [50, 0.08]], grain: 8 },
      "Soft Portrait Film": { exposure: 0.08, contrast: -0.05, fade: 0.06, temp: 0.18, sat: -0.1, hsl: { orange: [0, -0.1, 0.12] }, split: [[30, 0.08], [30, 0.1]], grain: 10 },
      "Cinema Teal": { contrast: 0.22, fade: 0.04, sat: -0.05, hsl: { blue: [-0.08, 0.1, 0], orange: [0.02, 0.12, 0.05] }, split: [[190, 0.28], [35, 0.2]], grain: 12 },
      "Golden Hour Film": { exposure: 0.08, contrast: 0.14, temp: 0.55, sat: 0.02, vib: 0.1, split: [[25, 0.1], [45, 0.25]], grain: 14 },
      "Overcast Film": { exposure: 0.1, contrast: 0.08, fade: 0.1, temp: -0.08, sat: -0.18, highlights: -0.2, grain: 12 },
      "Cross Process": { contrast: 0.25, tint: -0.2, sat: 0.1, split: [[160, 0.25], [60, 0.3]], grain: 18 },
      "Mono Film 400": { mono: [0.4, 0.4, 0.2], contrast: 0.25, fade: 0.06, grain: 28 },
    },
  },
  "moody-cinematic-lightroom-presets": {
    folder: "Moody Cinematic Presets", group: "DistroSource Moody Cinematic",
    looks: {
      "Night City": { exposure: -0.1, contrast: 0.3, shadows: -0.2, sat: -0.1, temp: -0.25, split: [[215, 0.25], [30, 0.18]], vignette: -0.2 },
      "Teal and Orange": { contrast: 0.25, sat: 0.02, hsl: { blue: [-0.1, 0.15, -0.05], orange: [0.02, 0.15, 0.05] }, split: [[185, 0.32], [32, 0.28]] },
      "Deep Shadows": { exposure: -0.15, contrast: 0.35, shadows: -0.35, blacks: -0.2, sat: -0.15, vignette: -0.25 },
      "Rain Street": { exposure: -0.05, contrast: 0.2, temp: -0.35, sat: -0.25, split: [[205, 0.2], [210, 0.08]], fade: 0.05 },
      "Neon Dusk": { contrast: 0.28, tint: 0.2, vib: 0.2, split: [[260, 0.25], [330, 0.2]], vignette: -0.15 },
      "Muted Forest": { contrast: 0.18, sat: -0.22, hsl: { green: [0.08, -0.25, -0.12], yellow: [0.05, -0.2, -0.05] }, split: [[150, 0.12], [45, 0.1]], fade: 0.05 },
      "Colour Noir": { exposure: -0.1, contrast: 0.4, sat: -0.45, shadows: -0.25, vignette: -0.3 },
      "Desaturated Drama": { contrast: 0.32, sat: -0.35, highlights: -0.25, shadows: 0.1, split: [[210, 0.1], [40, 0.08]] },
      "Blue Hour": { exposure: -0.05, contrast: 0.18, temp: -0.45, sat: -0.05, split: [[225, 0.22], [200, 0.12]] },
      "Ember": { contrast: 0.26, temp: 0.4, sat: -0.05, shadows: -0.15, split: [[15, 0.2], [35, 0.25]], vignette: -0.2 },
    },
  },
  "bright-and-airy-lightroom-presets": {
    folder: "Bright & Airy Presets", group: "DistroSource Bright & Airy",
    looks: {
      "Clean White": { exposure: 0.35, contrast: -0.1, highlights: -0.3, shadows: 0.35, sat: -0.1, temp: -0.05 },
      "Soft Pastel": { exposure: 0.3, contrast: -0.18, fade: 0.1, sat: -0.2, split: [[330, 0.08], [190, 0.08]] },
      "Morning Light": { exposure: 0.28, contrast: -0.05, temp: 0.2, shadows: 0.3, sat: -0.05, split: [[40, 0.06], [45, 0.12]] },
      "Beach Day": { exposure: 0.3, contrast: 0.05, vib: 0.2, hsl: { blue: [-0.05, 0.1, 0.12], aqua: [0, 0.15, 0.1] }, temp: 0.05 },
      "Blush": { exposure: 0.25, contrast: -0.1, tint: 0.15, sat: -0.1, split: [[340, 0.1], [20, 0.1]] },
      "Minimal Home": { exposure: 0.32, contrast: -0.12, sat: -0.25, highlights: -0.25, shadows: 0.3, temp: 0.05 },
      "Fresh Green": { exposure: 0.25, contrast: 0.02, hsl: { green: [-0.05, 0.1, 0.15], yellow: [-0.08, 0, 0.1] }, vib: 0.15 },
      "Creamy": { exposure: 0.22, contrast: -0.08, temp: 0.28, fade: 0.08, sat: -0.12, split: [[40, 0.1], [45, 0.12]] },
      "Linen": { exposure: 0.24, contrast: -0.12, fade: 0.12, sat: -0.3, temp: 0.12 },
      "Cloud": { exposure: 0.38, contrast: -0.22, highlights: -0.35, shadows: 0.4, sat: -0.15, fade: 0.06, temp: -0.1 },
    },
  },
  "black-and-white-lightroom-presets": {
    folder: "Black & White Presets", group: "DistroSource Black & White",
    looks: {
      "Classic Mono": { mono: [0.35, 0.45, 0.2], contrast: 0.15 },
      "High Contrast": { mono: [0.3, 0.55, 0.15], contrast: 0.45, blacks: -0.2, whites: 0.15 },
      "Soft Matte": { mono: [0.35, 0.45, 0.2], contrast: -0.1, fade: 0.14 },
      "Silver": { mono: [0.4, 0.4, 0.2], contrast: 0.2, highlights: -0.2, shadows: 0.15, split: [[210, 0.06], [210, 0.04]] },
      "Punchy Grain": { mono: [0.3, 0.5, 0.2], contrast: 0.35, grain: 40 },
      "Low Key": { mono: [0.3, 0.5, 0.2], exposure: -0.35, contrast: 0.35, shadows: -0.25, vignette: -0.35 },
      "High Key": { mono: [0.35, 0.45, 0.2], exposure: 0.4, contrast: -0.1, highlights: -0.3, shadows: 0.35 },
      "Selenium Tone": { mono: [0.35, 0.45, 0.2], contrast: 0.2, split: [[280, 0.12], [30, 0.06]] },
    },
  },
}

/* ------------------------------------------------------------------ */
/* Colour transform (sRGB in, sRGB out)                                  */
/* ------------------------------------------------------------------ */

const clamp = (v) => Math.min(1, Math.max(0, v))
const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const toSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(0, c), 1 / 2.4) - 0.055)
function rgb2hsl(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min
  if (!d) return [0, 0, l]
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}
function hsl2rgb(h, s, l) {
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q
  const f = (t) => {
    t = ((t % 1) + 1) % 1
    return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p
  }
  return [f(h / 360 + 1 / 3), f(h / 360), f(h / 360 - 1 / 3)]
}
const BANDS = { red: 0, orange: 30, yellow: 60, green: 120, aqua: 180, blue: 225, purple: 270, magenta: 315 }
const tint = (hue, amt) => hsl2rgb(hue, 1, 0.5).map((c) => (c - 0.5) * amt)

function transform(p) {
  return (r, g, b) => {
    // White balance as channel gains, then exposure in linear light.
    r *= 1 + (p.temp || 0) * 0.11; b *= 1 - (p.temp || 0) * 0.11; g *= 1 + (p.tint ? -p.tint * 0.08 : 0)
    const ev = Math.pow(2, p.exposure || 0)
    let [R, G, B] = [r, g, b].map((c) => toSrgb(toLin(clamp(c)) * ev))
    const lum = 0.2126 * R + 0.7152 * G + 0.0722 * B
    // Tone: highlights/shadows/whites/blacks as luminance-weighted offsets, then an S-curve.
    const hi = Math.max(0, lum - 0.5) * 2, sh = Math.max(0, 0.5 - lum) * 2
    const off = (p.highlights || 0) * 0.18 * hi * hi + (p.shadows || 0) * 0.18 * sh * sh + (p.whites || 0) * 0.08 * hi ** 3 + (p.blacks || 0) * 0.08 * sh ** 3
    ;[R, G, B] = [R, G, B].map((c) => c + off)
    const e = 1 + (p.contrast || 0) * 1.8
    ;[R, G, B] = [R, G, B].map((c) => { const x = clamp(c); return x < 0.5 ? 0.5 * Math.pow(2 * x, e) : 1 - 0.5 * Math.pow(2 * (1 - x), e) })
    // Colour: saturation, vibrance, per-band HSL, or a mono mix.
    if (p.mono) {
      const m = p.mono[0] * R + p.mono[1] * G + p.mono[2] * B
      ;[R, G, B] = [m, m, m]
    } else {
      let [h, s, l] = rgb2hsl(clamp(R), clamp(G), clamp(B))
      s *= 1 + (p.sat || 0)
      s += (p.vib || 0) * (1 - s) * s
      for (const [band, [dh, ds, dl]] of Object.entries(p.hsl || {})) {
        const c = BANDS[band], dist = Math.min(Math.abs(h - c), 360 - Math.abs(h - c)), w = Math.max(0, 1 - dist / 45) * Math.min(1, s * 3)
        h += dh * 40 * w; s *= 1 + ds * w; l += dl * 0.15 * w
      }
      ;[R, G, B] = hsl2rgb((h + 360) % 360, clamp(s), clamp(l))
    }
    // Split toning: shadow and highlight colour, weighted by luminance.
    if (p.split) {
      const L = 0.2126 * R + 0.7152 * G + 0.0722 * B
      const ts = tint(p.split[0][0], p.split[0][1] * 0.8), th = tint(p.split[1][0], p.split[1][1] * 0.8)
      const ws = (1 - L) ** 2, wh = L ** 2
      R += ts[0] * ws + th[0] * wh; G += ts[1] * ws + th[1] * wh; B += ts[2] * ws + th[2] * wh
    }
    // Fade: lift the black point.
    const f = p.fade || 0
    return [R, G, B].map((c) => clamp(f + clamp(c) * (1 - f)))
  }
}

function cube(name, fn, N = 33) {
  const rows = [`TITLE "${name}"`, `# DistroSource Original — ${name}`, `LUT_3D_SIZE ${N}`, "DOMAIN_MIN 0.0 0.0 0.0", "DOMAIN_MAX 1.0 1.0 1.0"]
  for (let b = 0; b < N; b++) for (let g = 0; g < N; g++) for (let r = 0; r < N; r++) rows.push(fn(r / (N - 1), g / (N - 1), b / (N - 1)).map((v) => v.toFixed(6)).join(" "))
  return rows.join("\n") + "\n"
}

function xmp(name, group, p) {
  const n = (v, s = 100) => (v >= 0 ? "+" : "") + Math.round(v * s)
  const attrs = {
    Exposure2012: ((p.exposure || 0) >= 0 ? "+" : "") + (p.exposure || 0).toFixed(2),
    Contrast2012: n(p.contrast || 0), Highlights2012: n(p.highlights || 0), Shadows2012: n(p.shadows || 0), Whites2012: n(p.whites || 0), Blacks2012: n(p.blacks || 0),
    Vibrance: n(p.vib || 0), Saturation: n(p.sat || 0),
    IncrementalTemperature: n(p.temp || 0, 30), IncrementalTint: n(p.tint || 0, 30),
    ParametricShadows: "0", ParametricDarks: "0", ParametricLights: "0", ParametricHighlights: "0",
    GrainAmount: String(p.grain || 0), GrainSize: "25", GrainFrequency: "50",
    PostCropVignetteAmount: n(p.vignette || 0), PostCropVignetteMidpoint: "50", PostCropVignetteFeather: "50",
    ConvertToGrayscale: p.mono ? "True" : "False",
  }
  for (const [band] of Object.entries(BANDS)) {
    const [dh, ds, dl] = p.hsl?.[band] || [0, 0, 0]
    const B = band[0].toUpperCase() + band.slice(1)
    attrs[`HueAdjustment${B}`] = n(dh); attrs[`SaturationAdjustment${B}`] = n(ds); attrs[`LuminanceAdjustment${B}`] = n(dl)
  }
  if (p.mono) {
    const [r, g, b] = p.mono
    Object.assign(attrs, { GrayMixerRed: n(r - 0.33, 120), GrayMixerOrange: n(r * 0.6 + g * 0.4 - 0.33, 120), GrayMixerYellow: n(g - 0.3, 120), GrayMixerGreen: n(g - 0.35, 120), GrayMixerAqua: "0", GrayMixerBlue: n(b - 0.33, 120), GrayMixerPurple: "0", GrayMixerMagenta: "0" })
  }
  if (p.split) Object.assign(attrs, { SplitToningShadowHue: String(Math.round(p.split[0][0])), SplitToningShadowSaturation: String(Math.round(p.split[0][1] * 100)), SplitToningHighlightHue: String(Math.round(p.split[1][0])), SplitToningHighlightSaturation: String(Math.round(p.split[1][1] * 100)), SplitToningBalance: "0" })
  const fade = Math.round((p.fade || 0) * 255)
  const uuid = crypto.createHash("md5").update(group + name).digest("hex").toUpperCase()
  return `<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 7.0-c000 1.000000, 0000/00/00-00:00:00        ">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
   crs:PresetType="Normal"
   crs:Cluster=""
   crs:UUID="${uuid}"
   crs:SupportsAmount="False"
   crs:SupportsColor="True"
   crs:SupportsMonochrome="True"
   crs:SupportsHighDynamicRange="True"
   crs:SupportsNormalDynamicRange="True"
   crs:SupportsSceneReferred="True"
   crs:SupportsOutputReferred="True"
   crs:CameraModelRestriction=""
   crs:Copyright="DistroSource"
   crs:ContactInfo=""
   crs:Version="15.0"
   crs:ProcessVersion="11.0"
${Object.entries(attrs).map(([k, v]) => `   crs:${k}="${v}"`).join("\n")}
   crs:HasSettings="True">
   <crs:Name>
    <rdf:Alt>
     <rdf:li xml:lang="x-default">${name}</rdf:li>
    </rdf:Alt>
   </crs:Name>
   <crs:ShortName>
    <rdf:Alt>
     <rdf:li xml:lang="x-default"/>
    </rdf:Alt>
   </crs:ShortName>
   <crs:SortName>
    <rdf:Alt>
     <rdf:li xml:lang="x-default"/>
    </rdf:Alt>
   </crs:SortName>
   <crs:Group>
    <rdf:Alt>
     <rdf:li xml:lang="x-default">${group}</rdf:li>
    </rdf:Alt>
   </crs:Group>
   <crs:Description>
    <rdf:Alt>
     <rdf:li xml:lang="x-default"/>
    </rdf:Alt>
   </crs:Description>
   <crs:ToneCurvePV2012>
    <rdf:Seq>
     <rdf:li>0, ${fade}</rdf:li>
     <rdf:li>255, ${255 - Math.round(fade * 0.3)}</rdf:li>
    </rdf:Seq>
   </crs:ToneCurvePV2012>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
`
}

/* ------------------------------------------------------------------ */
/* Previews on DistroSource renders                                     */
/* ------------------------------------------------------------------ */

const SAMPLES = ["low-poly-nature-kit-3d-hero", "stylised-furniture-set-3d-hero", "modular-sci-fi-corridor-kit-3d-hero"].map((n) => path.join(ROOT, ".gaming-render", "b3", `${n}.png`))
  .concat(["apartment", "mlo-diner", "street-stream", "mc-cottage"].map((n) => path.join(ROOT, ".gaming-render", `${n}.png`)))
  .filter((f) => fs.existsSync(f))

async function applyTo(file, fn, w, h) {
  const { data, info } = await sharp(file).resize(w, h, { fit: "cover" }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const out = Buffer.alloc(data.length)
  for (let i = 0; i < data.length; i += 3) {
    const [r, g, b] = fn(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255)
    out[i] = Math.round(r * 255); out[i + 1] = Math.round(g * 255); out[i + 2] = Math.round(b * 255)
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 3 } }).png().toBuffer()
}

for (const [slug, pack] of Object.entries(PACKS)) {
  const base = path.join(OUT, slug, "files", pack.folder)
  fs.rmSync(base, { recursive: true, force: true })
  const prev = path.join(OUT, slug, "previews")
  fs.mkdirSync(prev, { recursive: true })
  const names = Object.keys(pack.looks)
  for (const [i, name] of names.entries()) {
    const p = pack.looks[name]
    const stem = `${String(i + 1).padStart(2, "0")} ${name}`
    write(path.join(base, "Lightroom and Camera Raw (XMP)", `${stem}.xmp`), xmp(name, pack.group, p))
    write(path.join(base, "LUTs (CUBE)", `${stem}.cube`), cube(name, transform(p)))
  }
  // Grid of every look on one sample, a before/after split and a second grid.
  const grid = async (sample, out) => {
    const cols = 4, cw = 380, ch = 238, rows = Math.ceil(names.length / cols)
    const comp = []
    for (const [i, name] of names.entries()) comp.push({ input: await applyTo(sample, transform(pack.looks[name]), cw, ch), left: 20 + (i % cols) * (cw + 20), top: 20 + Math.floor(i / cols) * (ch + 44) })
    const labels = names.map((n, i) => `<text x="${20 + (i % cols) * (cw + 20)}" y="${20 + Math.floor(i / cols) * (ch + 44) + ch + 28}" font-family="Segoe UI, Arial" font-size="18" font-weight="600" fill="#e9e6e0">${String(i + 1).padStart(2, "0")}  ${n}</text>`).join("")
    const H = 20 + rows * (ch + 44)
    comp.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1620" height="${H}">${labels}</svg>`), left: 0, top: 0 })
    await sharp({ create: { width: 1620, height: H, channels: 3, background: "#141518" } }).composite(comp).png().toFile(out)
  }
  await grid(SAMPLES[0], path.join(prev, "grid-a.png"))
  await grid(SAMPLES[3] ?? SAMPLES[1], path.join(prev, "grid-b.png"))
  // Hero look and scene per pack: [look, index into SAMPLES].
  const [hero, heroScene] = { "film-stock-lightroom-presets": ["Warm Film 400", 1], "moody-cinematic-lightroom-presets": ["Night City", 4], "bright-and-airy-lightroom-presets": ["Clean White", 1], "black-and-white-lightroom-presets": ["High Contrast", 1] }[slug]
  const scene = SAMPLES[heroScene] ?? SAMPLES[1]
  const before = await sharp(scene).resize(1600, 1000, { fit: "cover" }).removeAlpha().png().toBuffer()
  const after = await applyTo(scene, transform(pack.looks[hero]), 1600, 1000)
  await sharp(before).composite([{ input: await sharp(after).extract({ left: 800, top: 0, width: 800, height: 1000 }).toBuffer(), left: 800, top: 0 }, { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000"><rect x="798" y="0" width="4" height="1000" fill="#fff"/><rect x="24" y="24" width="120" height="40" rx="8" fill="rgba(0,0,0,0.55)"/><text x="84" y="51" font-family="Segoe UI" font-size="20" font-weight="700" fill="#fff" text-anchor="middle">Before</text><rect x="1456" y="24" width="120" height="40" rx="8" fill="rgba(0,0,0,0.55)"/><text x="1516" y="51" font-family="Segoe UI" font-size="20" font-weight="700" fill="#fff" text-anchor="middle">After</text><text x="1576" y="972" font-family="Segoe UI" font-size="18" fill="#fff" text-anchor="end">${hero}</text></svg>`), left: 0, top: 0 }]).png().toFile(path.join(prev, "before-after.png"))
  console.log(`${slug}: ${names.length} presets (XMP + CUBE)`)
}
