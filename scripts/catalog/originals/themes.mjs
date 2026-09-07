// Shared visual vocabulary for the DistroSource Originals template line:
// palettes, type pairs, a seeded PRNG so every product's art is
// deterministic, and small SVG generators for rights-clean illustration.

export const PALETTES = {
  // name: [bg, surface, text, muted, accent, accent2, mode]
  paper: ["#faf8f4", "#ffffff", "#1c1917", "#6b6560", "#c2410c", "#0f766e", "light"],
  ink: ["#0f1220", "#171b2e", "#f5f6fb", "#9aa0b8", "#7c8cff", "#22d3ee", "dark"],
  sage: ["#f4f6f2", "#ffffff", "#182119", "#5f6b61", "#2f6f4e", "#c98a2e", "light"],
  coral: ["#fff7f3", "#ffffff", "#2b1a14", "#7a625a", "#e0563b", "#1e3a5f", "light"],
  slate: ["#f5f7fa", "#ffffff", "#0f172a", "#64748b", "#2563eb", "#f59e0b", "light"],
  midnight: ["#0b0f19", "#111827", "#f9fafb", "#9ca3af", "#34d399", "#a78bfa", "dark"],
  sand: ["#f7f1e6", "#fffdf8", "#2a2419", "#7b6f5b", "#8a5a2b", "#2f5d62", "light"],
  plum: ["#faf5ff", "#ffffff", "#2e1065", "#6d5a8a", "#7e22ce", "#f472b6", "light"],
  ocean: ["#eef6fb", "#ffffff", "#0c2a3a", "#4f6b7a", "#0e7490", "#f97316", "light"],
  charcoal: ["#151515", "#1f1f1f", "#f2f2f2", "#a3a3a3", "#f5b301", "#38bdf8", "dark"],
  rose: ["#fdf4f6", "#ffffff", "#3b1220", "#7f5262", "#be123c", "#0f766e", "light"],
  forest: ["#0e1a14", "#152219", "#eef5f0", "#95a99c", "#6ee7a8", "#fbbf24", "dark"],
  lime: ["#f6faf0", "#ffffff", "#1a2410", "#5f6d4e", "#4d7c0f", "#c2410c", "light"],
  cobalt: ["#0a1633", "#0f1f47", "#eef2ff", "#9db0d9", "#60a5fa", "#fb7185", "dark"],
  clay: ["#f8f3ee", "#ffffff", "#2c1f1a", "#7a6a60", "#b45309", "#0369a1", "light"],
  mint: ["#f0fbf8", "#ffffff", "#0f2a24", "#4f6f67", "#0d9488", "#e11d48", "light"],
}

export const FONTS = {
  // display, body, google families
  grotesk: ["'Space Grotesk'", "'Inter'", "Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600"],
  serif: ["'Fraunces'", "'Inter'", "Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600"],
  editorial: ["'Playfair Display'", "'Source Sans 3'", "Playfair+Display:wght@500;600;700&family=Source+Sans+3:wght@400;500;600"],
  manrope: ["'Manrope'", "'Manrope'", "Manrope:wght@400;500;600;700;800"],
  sora: ["'Sora'", "'DM Sans'", "Sora:wght@500;600;700&family=DM+Sans:wght@400;500;600"],
  lora: ["'Lora'", "'DM Sans'", "Lora:wght@500;600;700&family=DM+Sans:wght@400;500;600"],
  outfit: ["'Outfit'", "'Inter'", "Outfit:wght@500;600;700&family=Inter:wght@400;500;600"],
  plex: ["'IBM Plex Sans'", "'IBM Plex Sans'", "IBM+Plex+Sans:wght@400;500;600;700"],
  archivo: ["'Archivo'", "'Archivo'", "Archivo:wght@400;500;600;700;800"],
  jakarta: ["'Plus Jakarta Sans'", "'Plus Jakarta Sans'", "Plus+Jakarta+Sans:wght@400;500;600;700;800"],
}

/** Small deterministic PRNG (mulberry32) seeded from a string. */
export function rng(seed) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let a = h >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])

export function hexToRgb(hex) {
  const n = Number.parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
export function rgba(hex, a) {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

/* ------------------------------------------------------------------ */
/* SVG art (all generated, no third-party imagery)                     */
/* ------------------------------------------------------------------ */

/** Abstract hero artwork: layered soft blobs + a fine grid, tinted to the palette. */
export function heroArt(seed, accent, accent2, { w = 640, h = 480 } = {}) {
  const r = rng(seed)
  const blobs = Array.from({ length: 4 }, (_, i) => {
    const cx = Math.round(w * (0.2 + r() * 0.6))
    const cy = Math.round(h * (0.2 + r() * 0.6))
    const rad = Math.round(Math.min(w, h) * (0.22 + r() * 0.2))
    const c = i % 2 ? accent2 : accent
    return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${c}" opacity="${(0.35 + r() * 0.3).toFixed(2)}" filter="url(#b)"/>`
  }).join("")
  const id = `g${Math.floor(r() * 1e6)}`
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Abstract artwork">
<defs><filter id="b" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="${Math.round(w / 14)}"/></filter>
<pattern id="${id}" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="${accent}" stroke-opacity="0.18"/></pattern></defs>
<rect width="${w}" height="${h}" fill="url(#${id})"/>${blobs}
<rect x="${Math.round(w * 0.12)}" y="${Math.round(h * 0.18)}" width="${Math.round(w * 0.5)}" height="${Math.round(h * 0.42)}" rx="18" fill="white" fill-opacity="0.9"/>
<rect x="${Math.round(w * 0.16)}" y="${Math.round(h * 0.24)}" width="${Math.round(w * 0.22)}" height="14" rx="7" fill="${accent}"/>
<rect x="${Math.round(w * 0.16)}" y="${Math.round(h * 0.31)}" width="${Math.round(w * 0.4)}" height="10" rx="5" fill="#111" fill-opacity="0.15"/>
<rect x="${Math.round(w * 0.16)}" y="${Math.round(h * 0.36)}" width="${Math.round(w * 0.34)}" height="10" rx="5" fill="#111" fill-opacity="0.12"/>
<rect x="${Math.round(w * 0.16)}" y="${Math.round(h * 0.45)}" width="${Math.round(w * 0.14)}" height="30" rx="15" fill="${accent2}"/>
</svg>`
}

/** Geometric "photo" tile: gradient + shapes; used where a template would show a photo. */
export function tileArt(seed, a, b, { w = 480, h = 360, label = "" } = {}) {
  const r = rng(seed)
  const shapes = Array.from({ length: 3 }, () => {
    const kind = r()
    const x = Math.round(r() * w), y = Math.round(r() * h), s = Math.round(60 + r() * 140)
    const fill = r() > 0.5 ? "#ffffff" : "#000000"
    const op = (0.08 + r() * 0.12).toFixed(2)
    if (kind < 0.33) return `<circle cx="${x}" cy="${y}" r="${s / 2}" fill="${fill}" opacity="${op}"/>`
    if (kind < 0.66) return `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s / 6}" fill="${fill}" opacity="${op}" transform="rotate(${Math.round(r() * 40 - 20)} ${x} ${y})"/>`
    return `<path d="M${x} ${y} l${s} 0 l${-s / 2} ${s} z" fill="${fill}" opacity="${op}"/>`
  }).join("")
  const id = `t${Math.floor(r() * 1e6)}`
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label || "Illustration")}">
<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#${id})"/>${shapes}
${label ? `<text x="${w / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Inter, system-ui, sans-serif" font-size="${Math.round(h / 9)}" font-weight="700" fill="white" fill-opacity="0.9">${esc(label)}</text>` : ""}
</svg>`
}

/** Initials avatar. */
export function avatar(name, color) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(name)}"><circle cx="32" cy="32" r="32" fill="${color}"/><text x="32" y="38" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="700" fill="white">${initials}</text></svg>`
}

/** Line chart from sample values. */
export function lineChart(values, accent, { w = 600, h = 200, fill = true } = {}) {
  const max = Math.max(...values) * 1.15
  const min = Math.min(...values) * 0.85
  const pts = values.map((v, i) => [Math.round((i / (values.length - 1)) * (w - 20)) + 10, Math.round(h - 20 - ((v - min) / (max - min)) * (h - 40))])
  const d = pts.map((p, i) => (i ? "L" : "M") + p.join(" ")).join(" ")
  const area = `${d} L${pts[pts.length - 1][0]} ${h - 10} L${pts[0][0]} ${h - 10} Z`
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Line chart" preserveAspectRatio="none" style="width:100%;height:100%">
<defs><linearGradient id="lc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${accent}" stop-opacity="0.35"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient></defs>
${[0.25, 0.5, 0.75].map((f) => `<line x1="10" x2="${w - 10}" y1="${Math.round(h * f)}" y2="${Math.round(h * f)}" stroke="currentColor" stroke-opacity="0.08"/>`).join("")}
${fill ? `<path d="${area}" fill="url(#lc)"/>` : ""}
<path d="${d}" fill="none" stroke="${accent}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
${pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${accent}"/>`).join("")}
</svg>`
}

/** Bar chart from sample values. */
export function barChart(values, accent, accent2, { w = 600, h = 200 } = {}) {
  const max = Math.max(...values) * 1.1
  const bw = (w - 20) / values.length
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bar chart" preserveAspectRatio="none" style="width:100%;height:100%">
${values.map((v, i) => {
    const bh = Math.round((v / max) * (h - 30))
    const x = Math.round(10 + i * bw + bw * 0.2)
    return `<rect x="${x}" y="${h - 10 - bh}" width="${Math.round(bw * 0.6)}" height="${bh}" rx="6" fill="${i % 3 === 2 ? accent2 : accent}" opacity="${i === values.length - 1 ? 1 : 0.75}"/>`
  }).join("")}
</svg>`
}

/** Donut chart. */
export function donut(parts, colors, { size = 160 } = {}) {
  const total = parts.reduce((a, b) => a + b, 0)
  const r = 60, c = 2 * Math.PI * r
  let offset = 0
  const segs = parts.map((p, i) => {
    const len = (p / total) * c
    const s = `<circle cx="80" cy="80" r="${r}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="22" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 80 80)"/>`
    offset += len
    return s
  }).join("")
  return `<svg viewBox="0 0 160 160" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Donut chart">${segs}</svg>`
}

/** Simple inline icon set (stroke icons) used by generated templates. */
export const ICONS = {
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  star: '<path d="M12 3l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.6 6.3 20.5l1.1-6.3L2.8 9.7l6.4-.9z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  chat: '<path d="M4 5h16v11H8l-4 4z"/>',
  pin: '<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  heart: '<path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="3"/><path d="M15.5 14.5a5.5 5.5 0 0 1 6 5.5"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  cart: '<path d="M3 4h2l2.4 11h11.2L21 7H7"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
  truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  box: '<path d="M12 3l9 4.5v9L12 21l-9-4.5v-9z"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  home: '<path d="M3 11l9-7 9 7v10H3z"/><path d="M10 21v-6h4v6"/>',
  file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  leaf: '<path d="M4 20c0-9 6-15 16-16-1 10-7 16-16 16z"/><path d="M4 20l8-8"/>',
  tool: '<path d="M14.7 6.3a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.7-9.7z"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>',
  cup: '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h2a2 2 0 0 1 0 4h-2"/>',
  camera: '<path d="M4 8h4l2-2h4l2 2h4v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  music: '<path d="M9 18V6l11-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  wrench: '<path d="M21 7a5 5 0 0 1-6.5 4.8L7 19.3a2 2 0 0 1-2.8-2.8l7.5-7.5A5 5 0 0 1 17 3l-2.5 2.5 1 3 3 1z"/>',
}
export function icon(name, size = 22) {
  return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.star}</svg>`
}
