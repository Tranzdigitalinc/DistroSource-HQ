// Design Resources deliverables for catalogue batch 3, part 2: the social
// media template pack (editable SVG) and the device mockup kit (SVG
// templates, transparent PNG frames and a one-file Mockup Studio). Screen
// content in the mockup previews is real: screenshots of this batch's own
// web templates from .catalog-build/<slug>/index.html.
//
//   node scripts/catalog/batch3/design/build_design2.mjs
import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { chromium } from "playwright"

const ROOT = path.resolve(import.meta.dirname, "../../../..")
const OUT = path.join(ROOT, ".catalog-build", "batch3")
const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
  return file
}
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const GF = `<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800&family=Inter:wght@400;500;600&family=Playfair+Display:wght@600;700&family=DM+Serif+Display&family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@500&display=block" rel="stylesheet">`

/* ------------------------------------------------------------------ */
/* Social media template pack                                           */
/* ------------------------------------------------------------------ */

const STYLES = {
  Bold_Minimal: { bg: "#f4f1ea", ink: "#141414", soft: "#6d6a64", accent: "#ff5a1f", head: "Outfit", headW: 800, body: "Inter" },
  Editorial: { bg: "#efe8dc", ink: "#2a2420", soft: "#7a6f64", accent: "#8c3b2e", head: "Playfair Display", headW: 700, body: "Inter" },
  Gradient_Pop: { bg: "url(#g)", ink: "#ffffff", soft: "#f3e9ff", accent: "#ffe066", head: "Outfit", headW: 800, body: "Inter", grad: ["#6a5cff", "#ff6fb1"] },
  Earthy: { bg: "#e7dfcf", ink: "#3b3a2e", soft: "#757163", accent: "#6f8f5f", head: "DM Serif Display", headW: 400, body: "Inter" },
  Dark_Tech: { bg: "#0d1117", ink: "#e6edf3", soft: "#8b949e", accent: "#3fb950", head: "Space Grotesk", headW: 700, body: "JetBrains Mono" },
}
const lines = (x, y, text, size, font, weight, fill, lh = 1.12, anchor = "start") =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${text.split("\n").map((l, i) => `<tspan x="${x}" dy="${i ? size * lh : 0}">${esc(l)}</tspan>`).join("")}</text>`
const svg = (w, h, s, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${s.grad ? `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${s.grad[0]}"/><stop offset="1" stop-color="${s.grad[1]}"/></linearGradient></defs>` : ""}<rect width="${w}" height="${h}" fill="${s.bg}"/>${body}</svg>`
const brand = (s, x, y) => `<circle cx="${x + 14}" cy="${y - 10}" r="14" fill="${s.accent}"/>${lines(x + 40, y, "Your Brand", 28, s.body, 600, s.ink)}`

const TEMPLATES = {
  Post_Quote: [1080, 1080, (s) => `${lines(90, 300, "“", 260, s.head, s.headW, s.accent)}${lines(90, 470, "Make the thing\nyou wish existed,\nthen tell people.", 78, s.head, s.headW, s.ink)}${lines(90, 860, "— A. Morgan, founder", 32, s.body, 500, s.soft)}${brand(s, 90, 990)}`],
  Post_Announcement: [1080, 1080, (s) => `<rect x="90" y="140" width="170" height="64" rx="32" fill="${s.accent}"/>${lines(175, 184, "NEW", 30, s.body, 700, s.bg.startsWith("url") ? "#3b1d6e" : s.bg, 1, "middle")}${lines(90, 380, "Autumn\ncollection\nlands today.", 110, s.head, s.headW, s.ink, 1.02)}${lines(90, 800, "Twelve new pieces, made in small batches.", 34, s.body, 500, s.soft)}${brand(s, 90, 990)}`],
  Post_Product: [1080, 1080, (s) => `<circle cx="800" cy="430" r="230" fill="${s.accent}" opacity="0.9"/><rect x="710" y="290" width="180" height="280" rx="34" fill="${s.ink}" opacity="0.92"/>${lines(90, 300, "The\nEveryday\nBottle", 96, s.head, s.headW, s.ink, 1.02)}${lines(90, 700, "Keeps drinks cold for 24 hours.", 32, s.body, 500, s.soft)}<rect x="90" y="770" width="260" height="84" rx="42" fill="${s.ink}"/>${lines(220, 824, "Shop now · $32", 30, s.body, 600, s.bg.startsWith("url") ? "#6a5cff" : s.bg, 1, "middle")}${brand(s, 90, 990)}`],
  Post_Stat: [1080, 1080, (s) => `${lines(90, 520, "87%", 330, s.head, s.headW, s.accent, 1)}${lines(90, 680, "of customers reorder\nwithin three months.", 64, s.head, s.headW, s.ink)}${lines(90, 900, "Source: customer survey, 2026 (sample figure)", 26, s.body, 500, s.soft)}${brand(s, 90, 990)}`],
  Carousel_1_Cover: [1080, 1350, (s) => `${lines(90, 230, "SWIPE →", 32, s.body, 700, s.accent)}${lines(90, 520, "5 ways to\nplan a calmer\nweek", 118, s.head, s.headW, s.ink, 1.0)}${lines(90, 1080, "A short guide from Your Brand", 34, s.body, 500, s.soft)}${brand(s, 90, 1260)}`],
  Carousel_2_Tip: [1080, 1350, (s) => `${lines(90, 330, "01", 200, s.head, s.headW, s.accent, 1)}${lines(90, 560, "Pick three\npriorities", 96, s.head, s.headW, s.ink, 1.02)}${lines(90, 830, "Write them down on Sunday evening.\nEverything else is a bonus.", 38, s.body, 500, s.soft, 1.4)}${brand(s, 90, 1260)}`],
  Carousel_3_CTA: [1080, 1350, (s) => `${lines(540, 560, "Save this\nfor Sunday.", 118, s.head, s.headW, s.ink, 1.0, "middle")}<rect x="340" y="820" width="400" height="96" rx="48" fill="${s.accent}"/>${lines(540, 882, "Follow for more", 34, s.body, 700, s.bg.startsWith("url") ? "#3b1d6e" : s.bg, 1, "middle")}${brand(s, 90, 1260)}`],
  Story_Event: [1080, 1920, (s) => `${lines(90, 300, "SAVE THE DATE", 40, s.body, 700, s.accent)}${lines(90, 640, "Summer\nMarket\nNight", 170, s.head, s.headW, s.ink, 0.98)}${lines(90, 1260, "Friday 14 August · 6–10pm", 50, s.body, 600, s.ink)}${lines(90, 1340, "The Old Yard, Your City", 44, s.body, 500, s.soft)}${brand(s, 90, 1800)}`],
  Story_Poll: [1080, 1920, (s) => `${lines(540, 640, "Which should\nwe make next?", 110, s.head, s.headW, s.ink, 1.02, "middle")}<rect x="140" y="980" width="800" height="150" rx="75" fill="${s.accent}"/>${lines(540, 1072, "Sea salt candle", 50, s.body, 700, s.bg.startsWith("url") ? "#3b1d6e" : s.bg, 1, "middle")}<rect x="140" y="1170" width="800" height="150" rx="75" fill="none" stroke="${s.ink}" stroke-width="5"/>${lines(540, 1262, "Cedar room spray", 50, s.body, 700, s.ink, 1, "middle")}${brand(s, 90, 1800)}`],
  Story_Promo: [1080, 1920, (s) => `${lines(540, 760, "20%", 380, s.head, s.headW, s.accent, 1, "middle")}${lines(540, 920, "OFF EVERYTHING", 70, s.body, 700, s.ink, 1, "middle")}${lines(540, 1120, "Use code CALM20 this weekend", 44, s.body, 500, s.soft, 1, "middle")}<rect x="340" y="1500" width="400" height="110" rx="55" fill="${s.ink}"/>${lines(540, 1570, "Shop now ↑", 44, s.body, 700, s.bg.startsWith("url") ? "#6a5cff" : s.bg, 1, "middle")}`],
  LinkedIn_Post: [1200, 627, (s) => `${lines(70, 170, "What we learned\nshipping 40 releases", 64, s.head, s.headW, s.ink, 1.05)}${["Small releases beat big launches", "Write the changelog first", "Customers notice speed, not features"].map((t, i) => `<circle cx="86" cy="${360 + i * 62}" r="9" fill="${s.accent}"/>${lines(112, 372 + i * 62, t, 32, s.body, 500, s.ink)}`).join("")}${brand(s, 70, 590)}`],
  YouTube_Thumbnail: [1280, 720, (s) => `<rect x="740" y="0" width="540" height="720" fill="${s.accent}" opacity="0.92"/><circle cx="1010" cy="360" r="190" fill="${s.ink}" opacity="0.9"/>${lines(70, 250, "I TRIED\nIT FOR\n30 DAYS", 132, s.head, s.headW, s.ink, 0.95)}<rect x="70" y="600" width="210" height="64" rx="10" fill="${s.ink}"/>${lines(175, 643, "EP. 12", 30, s.body, 700, s.bg.startsWith("url") ? "#6a5cff" : s.bg, 1, "middle")}`],
}

async function socialPack(tab) {
  const slug = "social-media-template-pack-design"
  const base = path.join(OUT, slug, "files", "Social Media Template Pack")
  fs.rmSync(base, { recursive: true, force: true })
  const prev = path.join(OUT, slug, "previews")
  fs.mkdirSync(prev, { recursive: true })
  const rendered = {}
  for (const [style, s] of Object.entries(STYLES)) {
    for (const [name, [w, h, body]] of Object.entries(TEMPLATES)) {
      const markup = svg(w, h, s, body(s))
      write(path.join(base, "SVG", style, `${name}.svg`), markup)
      const png = path.join(base, "PNG", style, `${name}.png`)
      fs.mkdirSync(path.dirname(png), { recursive: true })
      await tab.setViewportSize({ width: w, height: h })
      await tab.setContent(`<html><head>${GF}<style>body{margin:0}svg{display:block}</style></head><body>${markup}</body></html>`, { waitUntil: "networkidle" })
      await tab.evaluate(() => document.fonts.ready)
      await tab.screenshot({ path: png })
      rendered[`${style}/${name}`] = png
    }
  }
  write(path.join(base, "Fonts_to_install.txt"), "These templates use free Google Fonts (SIL Open Font Licence). Install them before editing the SVG files:\n\n- Outfit\n- Inter\n- Playfair Display\n- DM Serif Display\n- Space Grotesk\n- JetBrains Mono\n\nhttps://fonts.google.com\n")
  return rendered
}

/* ------------------------------------------------------------------ */
/* Device mockup kit                                                    */
/* ------------------------------------------------------------------ */

// Each mockup is drawn on a 1600 × 1000 canvas. `screens` lists the screen
// rectangles (x, y, w, h, r) that receive images; the device body is drawn
// as a path with the screens cut out, so PNG frames have transparent screens.
const rr = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 -${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1 -${r} -${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r} -${r}z`
const COL = { Graphite: { body: "#1d1f23", edge: "#3a3d44", base: "#2b2e34" }, Silver: { body: "#d9dbde", edge: "#b5b8bd", base: "#c8cace" } }

function laptop(c, ox = 0, oy = 0, s = 1) {
  const L = { x: ox + 170 * s, y: oy + 60 * s, w: 1260 * s, h: 800 * s }
  const scr = { x: L.x + 30 * s, y: L.y + 30 * s, w: 1200 * s, h: 750 * s, r: 6 * s }
  const body = `<path d="${rr(L.x, L.y, L.w, L.h, 34 * s)} ${rr(scr.x, scr.y, scr.w, scr.h, scr.r)}" fill="${c.body}" fill-rule="evenodd"/><path d="M${ox + 80 * s} ${L.y + L.h}h${1440 * s}l-${30 * s} ${34 * s}q-${6 * s} ${8 * s}-${20 * s} ${8 * s}h-${1340 * s}q-${14 * s} 0-${20 * s}-${8 * s}z" fill="${c.base}"/><rect x="${ox + 700 * s}" y="${L.y + L.h}" width="${200 * s}" height="${9 * s}" rx="${4 * s}" fill="${c.edge}"/>`
  return { body, screens: [scr], shadow: { x: ox + 120 * s, y: L.y + L.h + 20 * s, w: 1360 * s } }
}
function phone(c, cx, top, h) {
  const w = h * 0.462, x = cx - w / 2
  const scr = { x: x + h * 0.018, y: top + h * 0.018, w: w - h * 0.036, h: h - h * 0.036, r: h * 0.062 }
  const body = `<path d="${rr(x, top, w, h, h * 0.078)} ${rr(scr.x, scr.y, scr.w, scr.h, scr.r)}" fill="${c.body}" fill-rule="evenodd"/><rect x="${cx - w * 0.16}" y="${top + h * 0.035}" width="${w * 0.32}" height="${h * 0.034}" rx="${h * 0.017}" fill="#0b0c0e"/>`
  return { body, screens: [scr], shadow: { x: x - 20, y: top + h + 10, w: w + 40 } }
}
function tablet(c, landscape) {
  const [w, h] = landscape ? [1080, 780] : [690, 920]
  const x = (1600 - w) / 2, y = (1000 - h) / 2 - 10
  const inset = 30, scr = { x: x + inset, y: y + inset, w: w - 2 * inset, h: h - 2 * inset, r: 14 }
  return { body: `<path d="${rr(x, y, w, h, 46)} ${rr(scr.x, scr.y, scr.w, scr.h, scr.r)}" fill="${c.body}" fill-rule="evenodd"/>`, screens: [scr], shadow: { x: x - 20, y: y + h + 8, w: w + 40 } }
}
function monitor(c) {
  const M = { x: 250, y: 40, w: 1100, h: 690 }
  const scr = { x: M.x + 22, y: M.y + 22, w: 1056, h: 620, r: 4 }
  const body = `<path d="${rr(M.x, M.y, M.w, M.h, 22)} ${rr(scr.x, scr.y, scr.w, scr.h, scr.r)}" fill="${c.body}" fill-rule="evenodd"/><path d="M740 ${M.y + M.h}h120l24 170h-168z" fill="${c.base}"/><rect x="600" y="${M.y + M.h + 168}" width="400" height="22" rx="11" fill="${c.base}"/>`
  return { body, screens: [scr], shadow: { x: 560, y: M.y + M.h + 190, w: 480 } }
}
function browser(dark) {
  const W = { x: 120, y: 80, w: 1360, h: 840 }
  const bar = dark ? "#1f2328" : "#eceef1", fg = dark ? "#3a3f46" : "#d3d6db"
  const scr = { x: W.x, y: W.y + 56, w: W.w, h: W.h - 56, r: 0 }
  const body = `<path d="${rr(W.x, W.y, W.w, W.h, 18)} ${rr(scr.x, scr.y, scr.w, scr.h, 0.01)}" fill="${bar}" fill-rule="evenodd"/>${["#ff5f57", "#febc2e", "#28c840"].map((col, i) => `<circle cx="${W.x + 30 + i * 24}" cy="${W.y + 28}" r="7" fill="${col}"/>`).join("")}<rect x="${W.x + 440}" y="${W.y + 14}" width="480" height="28" rx="14" fill="${fg}"/>`
  return { body, screens: [scr], shadow: { x: W.x + 20, y: W.y + W.h + 6, w: W.w - 40 } }
}

const MOCKUPS = {
  Browser_Light: { make: () => browser(false), bg: "#e9ecf1", fill: ["desktop"] },
  Browser_Dark: { make: () => browser(true), bg: "#15171b", fill: ["desktop"] },
  Laptop_Graphite: { make: () => laptop(COL.Graphite), bg: "#e8e4dc", fill: ["desktop"] },
  Laptop_Silver: { make: () => laptop(COL.Silver), bg: "#1f2430", fill: ["desktop"] },
  Monitor_Graphite: { make: () => monitor(COL.Graphite), bg: "#dfe6e2", fill: ["desktop"] },
  Tablet_Landscape_Graphite: { make: () => tablet(COL.Graphite, true), bg: "#f1ece4", fill: ["desktop"] },
  Tablet_Portrait_Silver: { make: () => tablet(COL.Silver, false), bg: "#243040", fill: ["mobile"] },
  Phone_Graphite: { make: () => phone(COL.Graphite, 800, 40, 920), bg: "#ffd9c7", fill: ["mobile"] },
  Phone_Silver: { make: () => phone(COL.Silver, 800, 40, 920), bg: "#1d2b3a", fill: ["mobile"] },
  Scene_Laptop_And_Phone: { make: () => { const a = laptop(COL.Graphite, -80, 30, 0.9), b = phone(COL.Graphite, 1330, 330, 620); return { body: a.body + b.body, screens: [...a.screens, ...b.screens], shadow: a.shadow } }, bg: "#efe9df", fill: ["desktop", "mobile"] },
  Scene_Three_Phones: { make: () => { const p = [phone(COL.Graphite, 470, 150, 760), phone(COL.Silver, 800, 60, 880), phone(COL.Graphite, 1130, 150, 760)]; return { body: p.map((q) => q.body).join(""), screens: p.flatMap((q) => q.screens), shadow: { x: 280, y: 950, w: 1040 } } }, bg: "#dfe8f5", fill: ["mobile", "mobile", "mobile"] },
  Scene_Browser_On_Gradient: { make: () => browser(false), bg: "gradient", fill: ["desktop"] },
}

function mockupSvg(name, hrefs) {
  const m = MOCKUPS[name], d = m.make()
  const bg = m.bg === "gradient" ? `<defs><linearGradient id="bgG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7b6cff"/><stop offset="1" stop-color="#ff8fb0"/></linearGradient></defs><rect width="1600" height="1000" fill="url(#bgG)"/>` : `<rect width="1600" height="1000" fill="${m.bg}"/>`
  const clips = d.screens.map((s, i) => `<clipPath id="s${i}"><path d="${rr(s.x, s.y, s.w, s.h, Math.max(0.01, s.r))}"/></clipPath>`).join("")
  const shots = d.screens.map((s, i) => hrefs ? `<image href="${hrefs[i] ?? hrefs[0]}" x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" preserveAspectRatio="xMidYMin slice" clip-path="url(#s${i})"/>` : "").join("")
  const shadow = d.shadow ? `<ellipse cx="${d.shadow.x + d.shadow.w / 2}" cy="${d.shadow.y}" rx="${d.shadow.w / 2}" ry="18" fill="#000" opacity="0.18" filter="url(#sh)"/>` : ""
  return (withBg) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1600" height="1000" viewBox="0 0 1600 1000"><defs><filter id="sh" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="14"/></filter>${clips}</defs>${withBg ? bg : ""}${withBg ? shadow : ""}${shots}${d.body}</svg>`
}

async function mockupKit(tab) {
  const slug = "device-mockup-kit-design"
  const base = path.join(OUT, slug, "files", "Device Mockup Kit")
  fs.rmSync(base, { recursive: true, force: true })
  const prev = path.join(OUT, slug, "previews")
  fs.mkdirSync(prev, { recursive: true })
  // Real screen content: this batch's own templates.
  const shotsDir = path.join(OUT, slug, "src", "screens")
  fs.mkdirSync(shotsDir, { recursive: true })
  const desk = ["kilnworks-coffee-roastery-store-ecommerce-template", "rostrum-event-ticketing-dashboard-template", "ashgrove-garden-design-studio-website-template", "gridwell-energy-monitoring-dashboard-template", "bramblecote-glamping-and-campsite-website-template"]
  const mob = ["harvestly-meal-kit-subscription-landing-page-template", "tandemly-code-review-tool-landing-page-template", "cadence-hall-music-school-and-rehearsal-studios-website-template", "parcelpilot-shipping-and-returns-app-landing-page-template"]
  const shot = async (s, w, h, name) => {
    await tab.setViewportSize({ width: w, height: h })
    await tab.goto(pathToFileURL(path.join(ROOT, ".catalog-build", s, "index.html")).href, { waitUntil: "networkidle" })
    await tab.evaluate(() => document.fonts.ready)
    await tab.waitForTimeout(300)
    const f = path.join(shotsDir, `${name}.png`)
    await tab.screenshot({ path: f })
    return "data:image/png;base64," + fs.readFileSync(f).toString("base64")
  }
  const D = [], Mo = []
  for (const [i, s] of desk.entries()) D.push(await shot(s, 1440, 900, `desktop-${i}`))
  for (const [i, s] of mob.entries()) Mo.push(await shot(s, 390, 844, `mobile-${i}`))
  const studio = [], areas = {}
  // Transparent frames are exported at 2× (3200 × 2000).
  const hiCtx = await tab.context().browser().newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 })
  const hi = await hiCtx.newPage()
  let k = 0
  await tab.setViewportSize({ width: 1600, height: 1000 })
  for (const [name, m] of Object.entries(MOCKUPS)) {
    const tmpl = mockupSvg(name, m.fill.map((_, i) => `your-screen-${i + 1}.png`))
    write(path.join(base, "SVG", `${name}.svg`), tmpl(true))
    // Transparent frame: device only, screens left empty.
    await hi.setContent(`<html><body style="margin:0;background:transparent">${mockupSvg(name, null)(false)}</body></html>`)
    const frame = path.join(base, "PNG_Frames", `${name}.png`)
    fs.mkdirSync(path.dirname(frame), { recursive: true })
    await hi.screenshot({ path: frame, omitBackground: true })
    areas[name] = m.make().screens.map((s) => ({ x: Math.round(s.x * 2), y: Math.round(s.y * 2), width: Math.round(s.w * 2), height: Math.round(s.h * 2), cornerRadius: Math.round(s.r * 2) }))
    const hrefs = m.fill.map((kind, i) => (kind === "desktop" ? D : Mo)[(k + i) % (kind === "desktop" ? D.length : Mo.length)])
    k++
    await tab.setContent(`<html><body style="margin:0">${mockupSvg(name, hrefs)(true)}</body></html>`)
    await tab.waitForTimeout(150)
    const ex = path.join(prev, `${name}.png`)
    await tab.screenshot({ path: ex })
    studio.push({ name, screens: m.fill.length, svg: mockupSvg(name, m.fill.map((_, i) => `__SCREEN_${i}__`))(true) })
  }
  await hiCtx.close()
  write(path.join(base, "Screen_Areas.json"), JSON.stringify({ note: "Pixel positions of each screen in the 3200 × 2000 PNG frames. Place your screenshot at x, y scaled to width × height, then put the frame on top.", frameSize: { width: 3200, height: 2000 }, mockups: areas }, null, 2))
  write(path.join(base, "Mockup_Studio.html"), `<!doctype html><html><head><meta charset="utf-8"><title>Mockup Studio — DistroSource</title>
<style>body{margin:0;font-family:system-ui,sans-serif;background:#f3f1ec;color:#1b1d21;display:grid;grid-template-columns:300px 1fr;height:100vh}
aside{padding:22px;border-right:1px solid #e2ddd3;overflow:auto;background:#fff}h1{font-size:18px;margin:0 0 14px}label{display:block;font-size:13px;font-weight:600;margin:16px 0 6px}
select,input{width:100%;box-sizing:border-box}button{margin-top:18px;width:100%;padding:12px;border:0;border-radius:10px;background:#1b1d21;color:#fff;font-weight:600;cursor:pointer}
main{display:grid;place-items:center;padding:24px}#stage svg{width:min(100%,1200px);height:auto;box-shadow:0 20px 50px -20px rgba(0,0,0,0.3)}p{font-size:12px;color:#6a6f78}</style></head>
<body><aside><h1>Mockup Studio</h1><p>Works offline in any modern browser. Nothing is uploaded.</p><label>Mockup</label><select id="m"></select><div id="inputs"></div><label>Export size</label><select id="scale"><option value="1">1600 × 1000</option><option value="2" selected>3200 × 2000</option></select><button id="dl">Download PNG</button></aside>
<main><div id="stage"></div></main>
<script>
const MOCKUPS = ${JSON.stringify(studio)};
const img = {}; const sel = document.getElementById("m"), inputs = document.getElementById("inputs"), stage = document.getElementById("stage");
MOCKUPS.forEach((m, i) => sel.add(new Option(m.name.replace(/_/g, " "), i)));
const blank = "data:image/svg+xml;base64," + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900"><rect width="1440" height="900" fill="#dfe3ea"/><text x="720" y="460" font-family="sans-serif" font-size="48" fill="#8a93a3" text-anchor="middle">Drop your screenshot</text></svg>');
function draw() { const m = MOCKUPS[sel.value]; let s = m.svg; for (let i = 0; i < m.screens; i++) s = s.split("__SCREEN_" + i + "__").join(img[i] || blank); stage.innerHTML = s; }
function buildInputs() { const m = MOCKUPS[sel.value]; inputs.innerHTML = ""; for (let i = 0; i < m.screens; i++) { const l = document.createElement("label"); l.textContent = "Screen " + (i + 1); const f = document.createElement("input"); f.type = "file"; f.accept = "image/*"; f.onchange = () => { const r = new FileReader(); r.onload = () => { img[i] = r.result; draw(); }; r.readAsDataURL(f.files[0]); }; inputs.append(l, f); } draw(); }
sel.onchange = buildInputs; buildInputs();
document.getElementById("dl").onclick = () => { const k = +document.getElementById("scale").value; const svg = stage.querySelector("svg").outerHTML; const im = new Image(); im.onload = () => { const c = document.createElement("canvas"); c.width = 1600 * k; c.height = 1000 * k; c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); const a = document.createElement("a"); a.download = MOCKUPS[sel.value].name + ".png"; a.href = c.toDataURL("image/png"); a.click(); }; im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); };
</script></body></html>`)
  return Object.keys(MOCKUPS).length
}

const browserApp = await chromium.launch()
const tab = await browserApp.newPage()
const social = await socialPack(tab)
const mockups = await mockupKit(tab)
await browserApp.close()
console.log(`social templates: ${Object.keys(social).length} · mockups: ${mockups}`)
