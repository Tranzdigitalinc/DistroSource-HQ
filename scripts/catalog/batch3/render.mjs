// Renders the cover and two gallery images (1600×1000 PNG) for every batch-3
// product from its real deliverables: font specimens are set in the actual
// fonts, audio covers draw the actual waveforms, file names and durations.
//
//   node scripts/catalog/batch3/render.mjs              # every product
//   node scripts/catalog/batch3/render.mjs meridian,lofi
//
// Output: .catalog-build/batch3/<slug>/images/{cover,gallery-2,gallery-3}.png
import fs from "node:fs"
import path from "node:path"
import { chromium } from "playwright"
import { PRODUCTS } from "./catalog.mjs"

const ROOT = path.resolve(import.meta.dirname, "../../..")
const BUILD = path.join(ROOT, ".catalog-build", "batch3")
const b64 = (file) => fs.readFileSync(file).toString("base64")
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

const UI_FONTS = `
@font-face { font-family: "Archivo"; src: url(data:font/woff2;base64,${b64(path.join(ROOT, "scripts/gaming/banners/fonts/archivo-latin.woff2"))}) format("woff2"); font-weight: 100 900; }
@font-face { font-family: "JB Mono"; src: url(data:font/woff2;base64,${b64(path.join(ROOT, "scripts/gaming/banners/fonts/jetbrains-mono-latin.woff2"))}) format("woff2"); font-weight: 100 800; }
`
const BASE = `* { box-sizing: border-box; margin: 0; padding: 0 } html, body { width: 1600px; height: 1000px; overflow: hidden } body { font-family: "Archivo", sans-serif; position: relative }
.brand { position: absolute; left: 64px; top: 52px; display: flex; gap: 10px; align-items: center; font: 600 18px/1 "Archivo"; letter-spacing: 0.01em }
.brand i { width: 13px; height: 13px; border-radius: 3px; background: #ff7a1a }
.brand span { opacity: 0.6; font-weight: 500 }
.eyebrow { font: 700 16px/1 "JB Mono"; letter-spacing: 0.2em; text-transform: uppercase }`

const page = (css, body) => `<!doctype html><html><head><meta charset="utf-8"><style>${UI_FONTS}${BASE}${css}</style></head><body>${body}</body></html>`

/* ------------------------------------------------------------------ */
/* Fonts                                                                */
/* ------------------------------------------------------------------ */

const THEMES = {
  paper: { bg: "#f3efe6", ink: "#16140f", soft: "#8a8375", accent: "#d4502a", panel: "#fffdf8", line: "#ded6c6" },
  code: { bg: "#0d1117", ink: "#e6edf3", soft: "#7d8590", accent: "#58d68d", panel: "#161b22", line: "#262c36" },
  pixel: { bg: "#08060f", ink: "#f3f0ff", soft: "#8b83a8", accent: "#ff4fd8", panel: "#130f22", line: "#2a2342" },
}
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;!?'\"-–—()[]{}|/\\+=<>^~`%#$*&@_‘’“”"

function fontFaces(p) {
  const dir = path.join(BUILD, p.slug, "fonts")
  return p.font.styles.map((s, i) => `@font-face { font-family: "P"; src: url(data:font/woff2;base64,${b64(path.join(dir, `${p.font.files}-${s}.woff2`))}) format("woff2"); font-weight: ${[300, 400, 500, 700][["Light", "Regular", "Medium", "Bold"].indexOf(s)]}; }`).join("\n")
}
const weightOf = (s) => ({ Light: 300, Regular: 400, Medium: 500, Bold: 700 })[s]

function fontPages(p) {
  const t = THEMES[p.font.theme]
  const faces = fontFaces(p)
  const css = `${faces} body { background: ${t.bg}; color: ${t.ink} } .brand { color: ${t.ink} } .eyebrow { color: ${t.accent} } .soft { color: ${t.soft} }`
  const styles = p.font.styles
  const heavy = weightOf(styles[styles.length - 1])
  const isPixel = p.font.theme === "pixel", isCode = p.font.theme === "code"

  const cover = page(`${css}
    .hero { position: absolute; left: 64px; right: 64px; top: 150px; }
    .name { font-family: "P"; font-weight: ${heavy}; font-size: ${isPixel ? 168 : 190}px; line-height: 0.95; letter-spacing: ${isPixel ? "0" : "-0.02em"} }
    .line { font-family: "P"; font-size: ${isPixel ? 49 : 58}px; margin-top: 34px; line-height: 1.15 }
    .weights { position: absolute; left: 64px; bottom: 70px; display: flex; gap: 42px; align-items: baseline }
    .weights div { font-family: "P"; font-size: 46px }
    .weights small { display: block; font: 600 13px/1 "JB Mono"; letter-spacing: 0.12em; color: ${t.soft}; margin-top: 10px; text-transform: uppercase }
    .meta { position: absolute; right: 64px; bottom: 74px; text-align: right; font: 600 15px/1.6 "JB Mono"; color: ${t.soft} }
    .rule { position: absolute; left: 64px; right: 64px; bottom: 200px; height: 2px; background: ${t.line} }`,
    `<div class="brand"><i></i>DistroSource <span>Originals</span></div>
     <div class="hero"><div class="eyebrow">Typeface · ${esc(p.subcategory)}</div>
       <div class="name" style="margin-top:28px">${esc(p.font.family)}</div>
       <div class="line">${isCode ? "const answer = await fetch(url) // 0O 1lI" : isPixel ? "PRESS START · SCORE 004280" : "Quiet geometry for loud ideas."}</div></div>
     <div class="rule"></div>
     <div class="weights">${styles.map((s) => `<div style="font-weight:${weightOf(s)}">Aa<small>${s}</small></div>`).join("")}</div>
     <div class="meta">${styles.length} ${styles.length === 1 ? "style" : "styles"} · OTF + WOFF2<br/>${isCode || isPixel ? "Full ASCII" : "Basic Latin"} · ${CHARSET.length} characters</div>`)

  const grid = page(`${css}
    .wrap { position: absolute; left: 64px; right: 64px; top: 120px; bottom: 60px; }
    .cells { display: grid; grid-template-columns: repeat(16, 1fr); border-top: 1px solid ${t.line}; border-left: 1px solid ${t.line}; margin-top: 22px }
    .cells div { height: 116px; border-right: 1px solid ${t.line}; border-bottom: 1px solid ${t.line}; display: grid; place-items: center; font-family: "P"; font-weight: ${weightOf(styles[Math.min(1, styles.length - 1)])}; font-size: ${isPixel ? 56 : 62}px; position: relative }
    .cells div small { position: absolute; left: 6px; top: 5px; font: 500 10px/1 "JB Mono"; color: ${t.soft} }`,
    `<div class="brand"><i></i>DistroSource <span>Originals</span></div>
     <div class="wrap"><div class="eyebrow">${esc(p.font.family)} · Character set</div>
     <div class="cells">${[...CHARSET].slice(0, 96).map((c) => `<div><small>${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}</small>${esc(c)}</div>`).join("")}</div></div>`)

  let inuse
  if (isCode) {
    const code = [
      ["k", "import"], ["", " { readFile } "], ["k", "from"], ["s", ' "node:fs/promises"'], ["", "\n\n"],
      ["c", "// Parse a CSV of orders and total them by region\n"], ["k", "export async function"], ["f", " totals"], ["", "(path) {\n  "],
      ["k", "const"], ["", " rows = (await readFile(path, "], ["s", '"utf8"'], ["", ")).split("], ["s", '"\\n"'], ["", ").slice(1)\n  "],
      ["k", "const"], ["", " sum = "], ["k", "new"], ["", " Map()\n  "], ["k", "for"], ["", " ("], ["k", "const"], ["", " row "], ["k", "of"], ["", " rows) {\n    "],
      ["k", "const"], ["", " [id, region, amount] = row.split("], ["s", '","'], ["", ")\n    sum.set(region, (sum.get(region) ?? "], ["n", "0"], ["", ") + Number(amount))\n  }\n  "],
      ["k", "return"], ["", " [...sum].sort((a, b) => b[1] - a[1])\n}\n\n"], ["c", "// 0 vs O · 1 vs l vs I · {} [] ()"],
    ]
    const col = { k: "#ff7b72", s: "#a5d6ff", c: "#7d8590", f: "#d2a8ff", n: "#79c0ff", "": t.ink }
    inuse = page(`${css}
      .ed { position: absolute; left: 90px; right: 90px; top: 110px; bottom: 80px; background: ${t.panel}; border: 1px solid ${t.line}; border-radius: 14px; overflow: hidden }
      .bar { height: 46px; border-bottom: 1px solid ${t.line}; display: flex; align-items: center; gap: 8px; padding: 0 18px; font: 500 14px "JB Mono"; color: ${t.soft} }
      .bar i { width: 11px; height: 11px; border-radius: 50%; background: #30363d }
      .bar b { margin-left: 16px; color: ${t.ink}; font-weight: 500; background: ${t.bg}; padding: 6px 12px; border-radius: 6px 6px 0 0 }
      pre { font-family: "P"; font-size: 27px; line-height: 1.55; padding: 26px 30px; white-space: pre; display: grid; grid-template-columns: 50px 1fr; }
      .ln { color: ${t.soft}; text-align: right; padding-right: 20px; user-select: none }`,
      `<div class="brand"><i></i>DistroSource <span>Originals</span></div>
       <div class="ed"><div class="bar"><i></i><i></i><i></i><b>totals.js</b></div>
       <pre><span class="ln">${Array.from({ length: 13 }, (_, i) => i + 1).join("\n")}</span><span>${code.map(([k, v]) => `<span style="color:${col[k]}">${esc(v)}</span>`).join("")}</span></pre></div>`)
  } else if (isPixel) {
    inuse = page(`${css}
      .scr { position: absolute; inset: 80px 120px; background: radial-gradient(ellipse at 50% 40%, #241a44, #08060f 70%); border: 4px solid ${t.line}; border-radius: 18px; overflow: hidden; font-family: "P" }
      .hud { position: absolute; left: 40px; right: 40px; top: 30px; display: flex; justify-content: space-between; font-size: 42px }
      .title { position: absolute; left: 0; right: 0; top: 250px; text-align: center; font-size: 126px; color: ${t.accent}; text-shadow: 0 0 30px rgba(255,79,216,0.6) }
      .sub { position: absolute; left: 0; right: 0; top: 440px; text-align: center; font-size: 42px; color: #7ef9ff }
      .menu { position: absolute; left: 0; right: 0; top: 560px; text-align: center; font-size: 42px; line-height: 1.7 }
      .foot { position: absolute; left: 40px; right: 40px; bottom: 26px; display: flex; justify-content: space-between; font-size: 28px; color: ${t.soft} }`,
      `<div class="brand"><i></i>DistroSource <span>Originals</span></div>
       <div class="scr"><div class="hud"><span>1UP 004280</span><span style="color:#ffd84a">HI 012900</span><span>LIVES x3</span></div>
       <div class="title">NEON RUNNER</div><div class="sub">WORLD 3-2 · THE GRID</div>
       <div class="menu">&gt; CONTINUE<br/>&nbsp;&nbsp;NEW GAME<br/>&nbsp;&nbsp;OPTIONS</div>
       <div class="foot"><span>© 2026 SAMPLE STUDIO</span><span>PRESS START</span></div></div>`)
  } else {
    inuse = page(`${css}
      .poster { position: absolute; left: 64px; top: 110px; width: 700px; bottom: 60px; background: #1e2a36; color: #f3efe6; padding: 48px; font-family: "P" }
      .poster .big { font-weight: 700; font-size: 96px; line-height: 0.95; letter-spacing: -0.02em }
      .poster .big span { color: ${t.accent} }
      .poster p { font-weight: 400; font-size: 26px; line-height: 1.4; margin-top: 30px; max-width: 520px; color: #d7d2c7 }
      .poster .when { position: absolute; left: 48px; bottom: 44px; font-weight: 500; font-size: 30px }
      .app { position: absolute; right: 64px; top: 110px; width: 700px; bottom: 60px; background: ${t.panel}; border: 1px solid ${t.line}; border-radius: 22px; padding: 40px; font-family: "P" }
      .app h3 { font-weight: 700; font-size: 52px; letter-spacing: -0.01em }
      .app .row { display: flex; justify-content: space-between; padding: 22px 0; border-bottom: 1px solid ${t.line}; font-size: 26px }
      .app .row b { font-weight: 500 } .app .btn { margin-top: 36px; background: ${t.ink}; color: ${t.bg}; font-weight: 500; font-size: 26px; padding: 20px 28px; border-radius: 12px; display: inline-block }`,
      `<div class="brand"><i></i>DistroSource <span>Originals</span></div>
       <div class="poster"><div class="eyebrow" style="font-family:'P';letter-spacing:0.2em;color:${t.accent};font-size:20px;font-weight:500">Exhibition · Spring 2026</div>
         <div class="big" style="margin-top:36px">FORM<br/>FOLLOWS<br/><span>LIGHT</span></div>
         <p>Architecture, product and graphic design from twelve studios, set entirely in Meridian Sans.</p>
         <div class="when">Opens 14 March · Hall B</div></div>
       <div class="app"><h3>Your account</h3><div class="row" style="margin-top:20px"><span class="soft">Plan</span><b>Studio · annual</b></div>
         <div class="row"><span class="soft">Next invoice</span><b>12 Apr 2026</b></div><div class="row"><span class="soft">Seats</span><b>8 of 10</b></div>
         <div class="row"><span class="soft">Storage</span><b>184 GB used</b></div><div class="btn">Manage subscription</div></div>`)
  }
  return { cover, "gallery-2": grid, "gallery-3": inuse }
}

/* ------------------------------------------------------------------ */
/* Audio                                                                */
/* ------------------------------------------------------------------ */

function waveSvg(peaks, w, h, color, { mirror = true, bar = 3, gap = 2 } = {}) {
  const n = Math.floor(w / (bar + gap))
  const pts = Array.from({ length: n }, (_, i) => peaks[Math.floor((i / n) * peaks.length)] ?? 0)
  const mid = h / 2
  const rects = pts.map((v, i) => {
    const bh = Math.max(2, v * (mirror ? h : h * 0.95))
    const y = mirror ? mid - bh / 2 : h - bh
    return `<rect x="${i * (bar + gap)}" y="${y.toFixed(1)}" width="${bar}" height="${bh.toFixed(1)}" rx="1.2"/>`
  })
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="${color}">${rects.join("")}</svg>`
}

const fmt = (s) => (s >= 60 ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}` : `${s.toFixed(s < 10 ? 2 : 1)} s`)

function audioPages(p) {
  const data = JSON.parse(fs.readFileSync(path.join(BUILD, p.slug, "peaks.json"), "utf8"))
  const files = data.files
  const [bg, accent] = p.theme
  const total = files.reduce((s, f) => s + f.seconds, 0)
  const groupOf = (name) => p.groups.find(([pre]) => name.startsWith(pre))?.[1] ?? "Other"
  const counts = new Map()
  for (const f of files) counts.set(groupOf(f.name), (counts.get(groupOf(f.name)) ?? 0) + 1)
  const hero = files.slice().sort((a, b) => b.seconds - a.seconds).slice(0, 1)[0]
  const stripPeaks = files.flatMap((f) => f.peaks.slice(0, 40))
  const css = `body { background: radial-gradient(1100px 700px at 80% 20%, ${accent}33, transparent 60%), ${bg}; color: #f4f5f7 } .brand { color: #fff } .eyebrow { color: ${accent} } .soft { color: #9aa3b2 }`
  const [shortName, longName] = p.name.split(" — ")

  const cover = page(`${css}
    .t { position: absolute; left: 64px; top: 150px; } .t h1 { font-weight: 800; font-size: 150px; line-height: 0.9; letter-spacing: -0.03em; text-transform: uppercase; margin-top: 26px }
    .t h2 { font-weight: 500; font-size: 34px; margin-top: 20px; color: #d9dde5 }
    .wave { position: absolute; left: 64px; right: 64px; top: 560px; height: 220px; opacity: 0.95 }
    .facts { position: absolute; left: 64px; right: 64px; bottom: 64px; display: flex; gap: 14px; flex-wrap: wrap }
    .facts span { font: 700 17px/1 "JB Mono"; letter-spacing: 0.08em; padding: 13px 16px; border-radius: 8px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12) }
    .facts span.a { background: ${accent}; color: #0b0d12; border-color: transparent }`,
    `<div class="brand"><i></i>DistroSource <span>Originals</span></div>
     <div class="t"><div class="eyebrow">Audio · ${esc(p.subcategory)}</div><h1>${esc(shortName)}</h1><h2>${esc(longName)}</h2></div>
     <div class="wave">${waveSvg(stripPeaks, 1472, 220, accent, { bar: 4, gap: 3 })}</div>
     <div class="facts"><span class="a">${files.length} WAV FILES</span><span>${fmt(total).toUpperCase()} TOTAL</span><span>44.1 KHZ · 16-BIT · STEREO</span>${[...counts.keys()].slice(0, 4).map((g) => `<span>${esc(g.toUpperCase())}</span>`).join("")}</div>`)

  const list = files.slice(0, 13)
  const browser = page(`${css}
    .win { position: absolute; left: 70px; right: 70px; top: 110px; bottom: 60px; background: rgba(12,14,20,0.82); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden }
    .hd { display: grid; grid-template-columns: 60px 1fr 180px 150px 420px; padding: 18px 24px; font: 700 13px "JB Mono"; letter-spacing: 0.12em; color: #8b93a3; border-bottom: 1px solid rgba(255,255,255,0.08) }
    .r { display: grid; grid-template-columns: 60px 1fr 180px 150px 420px; align-items: center; padding: 0 24px; height: 58px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 18px }
    .r:nth-child(3) { background: ${accent}22 } .r .n { font: 500 15px "JB Mono"; color: #8b93a3 } .r .g { color: #aab2c0; font-size: 15px } .r .d { font: 500 16px "JB Mono" }
    .play { width: 30px; height: 30px; border-radius: 50%; background: ${accent}; display: grid; place-items: center }
    .play::after { content: ""; border-left: 10px solid #0b0d12; border-top: 6px solid transparent; border-bottom: 6px solid transparent; margin-left: 3px }`,
    `<div class="brand"><i></i>DistroSource <span>Originals</span></div>
     <div class="win"><div class="hd"><span>#</span><span>FILE</span><span>CATEGORY</span><span>LENGTH</span><span>WAVEFORM</span></div>
     ${list.map((f, i) => `<div class="r">${i === 1 ? '<span class="play"></span>' : `<span class="n">${String(i + 1).padStart(2, "0")}</span>`}<span>${esc(f.name)}.wav</span><span class="g">${esc(groupOf(f.name))}</span><span class="d">${fmt(f.seconds)}</span>${waveSvg(f.peaks, 400, 38, i === 1 ? accent : "#5c6576", { bar: 2, gap: 2 })}</div>`).join("")}
     </div>`)

  const cats = [...counts.entries()]
  const breakdown = page(`${css}
    .wrap { position: absolute; left: 64px; right: 64px; top: 120px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 24px }
    .c { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 20px }
    .c b { font-weight: 800; font-size: 54px; color: ${accent} } .c span { display: block; font-size: 20px; margin-top: 4px }
    .big { margin-top: 26px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 24px 28px }
    .big .row { display: flex; justify-content: space-between; align-items: baseline; font-size: 20px } .big .row b { font: 600 18px "JB Mono" }`,
    `<div class="brand"><i></i>DistroSource <span>Originals</span></div>
     <div class="wrap"><div class="eyebrow">What's inside</div>
     <div class="grid">${cats.slice(0, 8).map(([g, c]) => `<div class="c"><b>${c}</b><span>${esc(g)}</span></div>`).join("")}</div>
     <div class="big"><div class="row"><span>${esc(hero.name)}.wav</span><b>${fmt(hero.seconds)}</b></div><div style="margin-top:14px">${waveSvg(hero.peaks, 1420, 150, accent, { bar: 5, gap: 3 })}</div></div></div>`)
  return { cover, "gallery-2": browser, "gallery-3": breakdown }
}

/* ------------------------------------------------------------------ */
/* 3D models and prints                                                 */
/* ------------------------------------------------------------------ */

// Path-traced renders from scripts/gaming/banners/render.mjs (scenes b3-kit
// and b3-print), written to .gaming-render/b3/<slug>-{hero,set}.png.
const RENDERS = path.join(ROOT, ".gaming-render", "b3")
const img64 = (file) => `data:image/png;base64,${b64(file)}`

function modelPages(p) {
  const stats = JSON.parse(fs.readFileSync(path.join(BUILD, p.slug, "stats.json"), "utf8"))
  const isPrint = p.model === "print"
  const hero = img64(path.join(RENDERS, `${p.slug}-hero.png`))
  const set = img64(path.join(RENDERS, `${p.slug}-set.png`))
  const [shortName, longName] = p.name.split(" — ")
  const tris = stats.reduce((s, x) => s + x.triangles, 0)
  const dark = p.view === "scifi"
  const unit = isPrint ? "mm" : "m"
  const dims = (s) => (isPrint ? s.size.map((v) => Math.round(v)).join(" × ") : s.size.map((v) => v.toFixed(2)).join(" × "))
  const ink = dark ? "#f4f6f8" : "#14161a"
  const css = `body { background: ${dark ? "#07090d" : "#f3f1ec"}; color: ${ink} } .brand { color: ${dark ? "#fff" : "#14161a"}; z-index: 3 } .eyebrow { color: #ff7a1a }`

  const cover = page(`${css}
    .bg { position: absolute; inset: 0; background: url(${hero}) center / cover }
    .scrim { position: absolute; inset: 0; background: linear-gradient(90deg, ${dark ? "rgba(7,9,13,0.88)" : "rgba(243,241,236,0.94)"} 0%, ${dark ? "rgba(7,9,13,0.55)" : "rgba(243,241,236,0.7)"} 30%, rgba(0,0,0,0) 56%) }
    .t { position: absolute; left: 64px; top: 50%; transform: translateY(-50%); max-width: 640px; z-index: 2 }
    .t h1 { font-weight: 800; font-size: 96px; line-height: 0.92; letter-spacing: -0.03em; text-transform: uppercase; margin-top: 22px }
    .t h2 { font-weight: 500; font-size: 28px; margin-top: 18px; opacity: 0.85 }
    .chips { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 28px }
    .chips span { font: 700 15px/1 "JB Mono"; letter-spacing: 0.08em; padding: 11px 14px; border-radius: 8px; background: ${dark ? "rgba(255,255,255,0.1)" : "rgba(20,22,26,0.07)"}; border: 1px solid ${dark ? "rgba(255,255,255,0.16)" : "rgba(20,22,26,0.12)"} }
    .chips span.a { background: #ff7a1a; color: #14161a; border-color: transparent }`,
    `<div class="bg"></div><div class="scrim"></div><div class="brand"><i></i>DistroSource <span>Originals</span></div>
     <div class="t"><div class="eyebrow">${isPrint ? "3D print · STL" : "3D assets · GLB + OBJ"}</div><h1>${esc(shortName)}</h1><h2>${esc(longName)}</h2>
     <div class="chips"><span class="a">${stats.length} ${isPrint ? "PARTS" : "PIECES"}</span><span>${isPrint ? "WATERTIGHT STL" : `${tris.toLocaleString("en-US")} TRIANGLES`}</span><span>${isPrint ? "REAL SIZE · MM" : "REAL-WORLD SCALE"}</span></div></div>`)

  const gallery = page(`${css}
    .bg { position: absolute; inset: 0; background: url(${set}) center / cover }
    .tag { position: absolute; left: 64px; bottom: 56px; font: 700 15px/1 "JB Mono"; letter-spacing: 0.12em; padding: 12px 16px; border-radius: 8px; background: ${dark ? "rgba(7,9,13,0.75)" : "rgba(255,255,255,0.85)"} }`,
    `<div class="bg"></div><div class="brand"><i></i>DistroSource <span>Originals</span></div>
     <div class="tag">EVERY ${isPrint ? "PART" : "PIECE"} IN THE ${isPrint ? "SET" : "KIT"} · ${stats.length} TOTAL</div>`)

  const rows = stats.slice(0, 16)
  const settings = isPrint
    ? [["Layer height", "0.2 mm"], ["Walls", "3 perimeters"], ["Infill", "15% gyroid"], ["Material", "PLA or PETG"], ["Supports", "None required"]]
    : [["Formats", "GLB (glTF 2.0) + OBJ"], ["Scale", "Metres, Y up"], ["Pivots", "At the base"], ["Materials", "Named PBR colours"], ["Engines", "Unity · Unreal · Godot · Blender"]]
  const spec = page(`${css}
    .wrap { position: absolute; left: 64px; right: 64px; top: 116px; bottom: 56px; display: grid; grid-template-columns: 1fr 420px; gap: 28px }
    .card { background: ${dark ? "#10141b" : "#fff"}; border: 1px solid ${dark ? "#232a34" : "#e2ddd3"}; border-radius: 16px; padding: 24px 28px }
    table { width: 100%; border-collapse: collapse; font-size: 17px } th { text-align: left; font: 700 12px "JB Mono"; letter-spacing: 0.12em; color: #8a8f98; padding-bottom: 10px }
    td { padding: 9px 0; border-top: 1px solid ${dark ? "#232a34" : "#ece7de"} } td.m { font: 500 15px "JB Mono"; text-align: right }
    .kv { display: flex; justify-content: space-between; padding: 14px 0; border-top: 1px solid ${dark ? "#232a34" : "#ece7de"}; font-size: 18px } .kv b { font-weight: 600 }
    .thumb { height: 260px; border-radius: 12px; background: url(${hero}) center / cover; margin-bottom: 18px }`,
    `<div class="brand"><i></i>DistroSource <span>Originals</span></div>
     <div class="wrap"><div class="card"><div class="eyebrow" style="margin-bottom:16px">${isPrint ? "Parts and sizes" : "Pieces and sizes"}</div>
       <table><tr><th>${isPrint ? "PART" : "PIECE"}</th><th style="text-align:right">SIZE (${unit})</th><th style="text-align:right">TRIANGLES</th></tr>
       ${rows.map((s) => `<tr><td>${esc(s.name.replace(/_/g, " "))}</td><td class="m">${dims(s)}</td><td class="m">${s.triangles.toLocaleString("en-US")}</td></tr>`).join("")}</table></div>
       <div class="card"><div class="thumb"></div><div class="eyebrow" style="margin-bottom:6px">${isPrint ? "Print settings" : "Technical"}</div>
       ${settings.map(([k, v]) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`).join("")}</div></div>`)
  return { cover, "gallery-2": gallery, "gallery-3": spec }
}

/* ------------------------------------------------------------------ */
/* Documents, sheets, decks and Notion packages                        */
/* ------------------------------------------------------------------ */

// Previews come from the real outputs: PowerPoint slide exports, Excel
// range snapshots (computed values), and the HTML each Word document was
// converted from. Notion views are rendered from the CSV and Markdown files.
const DOC_CSS = `body { background: #efeae2; color: #17191c } .brand { color: #17191c; z-index: 3 } .eyebrow { color: #c8521f }
  .paper { position: relative; background: #fff; border-radius: 6px; box-shadow: 0 30px 60px -20px rgba(20,20,30,0.35), 0 0 0 1px rgba(0,0,0,0.06); overflow: hidden }
  .paper img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; object-position: top }
  .cap { position: absolute; left: 64px; bottom: 44px; font: 700 15px/1 "JB Mono"; letter-spacing: 0.1em; color: #54504a }`

function docPages(p) {
  const prevDir = path.join(BUILD, p.slug, "previews")
  const img = (f) => img64(path.join(prevDir, f))
  const [shortName, longName] = p.name.split(" — ")
  const title = `<div class="brand"><i></i>DistroSource <span>Originals</span></div>`
  const heading = (eyebrow) => `<div style="position:absolute;left:64px;top:50%;transform:translateY(-50%);max-width:560px;z-index:2"><div class="eyebrow">${esc(eyebrow)}</div>
    <h1 style="font-weight:800;font-size:78px;line-height:0.95;letter-spacing:-0.03em;margin-top:20px">${esc(shortName)}</h1><h2 style="font-weight:500;font-size:24px;margin-top:16px;color:#4b4741">${esc(longName)}</h2></div>`
  const eyebrow = { doc: "Business template", notion: "Notion template", design: "Design resource", preset: "Photo presets" }[p.kind] + ` · ${p.subcategory}`

  const fan = (m) => {
    const wide = m.wide
    const w = wide ? 620 : 380, h = wide ? 349 : 537
    const pos = wide ? [[700, 150, -6], [820, 330, 3], [760, 520, -2]] : [[720, 120, -7], [930, 170, 2], [1130, 110, 8]]
    return `${m.images.map((f, i) => `<div class="paper" style="position:absolute;left:${pos[i][0]}px;top:${pos[i][1]}px;width:${w}px;height:${h}px;transform:rotate(${pos[i][2]}deg)"><img src="${img(f)}"/></div>`).join("")}`
  }
  const frame = (m) => m.portrait
    ? `<div class="paper" style="position:absolute;left:50%;top:80px;transform:translateX(-50%);width:600px;height:848px"><img src="${img(m.image)}" style="object-fit:contain;object-position:top;background:#fff"/></div><div class="cap">${esc(m.caption.toUpperCase())}</div>`
    : `<div class="paper" style="position:absolute;left:70px;right:70px;top:110px;bottom:100px;background:#fff"><img src="${img(m.image)}" style="object-fit:contain;object-position:center;padding:18px;box-sizing:border-box;background:#fff"/></div><div class="cap">${esc(m.caption.toUpperCase())}</div>`
  // Portrait pages sit in one row so each shows whole; wide images (slides,
  // sheets) are fitted inside their cell rather than cropped.
  const grid = (m) => {
    const n = m.images.length
    const cols = m.portrait ? n : n > 4 ? 3 : n === 4 ? 2 : n, rows = Math.ceil(n / cols)
    // With m.aspect, cells take the images' shape and the row centres vertically.
    const rowsCss = m.aspect ? "grid-template-rows:auto;align-content:center" : `grid-template-rows:repeat(${rows},1fr)`
    const cell = m.aspect ? `background:#fff;aspect-ratio:${m.aspect}` : "background:#fff"
    return `<div style="position:absolute;left:70px;right:70px;top:110px;bottom:100px;display:grid;grid-template-columns:repeat(${cols},1fr);${rowsCss};gap:22px">${m.images.map((f) => `<div class="paper" style="${cell}"><img src="${img(f)}" style="object-fit:contain;object-position:${m.portrait ? "top" : "center"};background:#fff"/></div>`).join("")}</div><div class="cap">${esc(m.caption.toUpperCase())}</div>`
  }
  // One large preview in a rounded frame (design and preset sheets that are already composed).
  const full = (m) => `<div style="position:absolute;left:70px;right:70px;top:110px;bottom:100px;border-radius:14px;overflow:hidden;box-shadow:0 30px 60px -20px rgba(20,20,30,0.35);background:${m.bg ?? "#141518"} url(${img(m.image)}) center / ${m.fit ?? "cover"} no-repeat"></div><div class="cap">${esc(m.caption.toUpperCase())}</div>`
  const build = { fan, frame, grid, full }

  if (p.kind === "notion") {
    const root = path.join(BUILD, p.slug, "files", p.pack, `${p.pack} (Notion import)`)
    const rows = fs.readFileSync(path.join(root, "Databases", `${p.db2}.csv`), "utf8").replace(/^﻿/, "").trim().split(/\r?\n/).map((l) => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).filter((c) => c !== "").map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"')))
    const md = fs.readFileSync(path.join(root, "Pages", `${p.page}.md`), "utf8")
    const mdHtml = md.split("\n").map((l) => l.startsWith("# ") ? `<h1 style="font:700 40px Georgia,serif;margin:0 0 18px">${esc(l.slice(2))}</h1>` : l.startsWith("## ") ? `<h2 style="font:700 24px Georgia,serif;margin:22px 0 8px">${esc(l.slice(3))}</h2>` : l.startsWith("- [ ] ") ? `<div style="font-size:20px;margin:6px 0"><span style="display:inline-block;width:18px;height:18px;border:2px solid #9b958a;border-radius:4px;margin-right:12px;vertical-align:-3px"></span>${esc(l.slice(6))}</div>` : l.startsWith("- ") || /^\d+\. /.test(l) ? `<div style="font-size:20px;margin:6px 0 6px 12px">• ${esc(l.replace(/^(- |\d+\. )/, "").replace(/\*\*/g, ""))}</div>` : l.trim() ? `<p style="font-size:19px;color:#4b4741;margin:8px 0">${esc(l.replace(/\*\*/g, "").replace(/\*/g, ""))}</p>` : "").join("")
    return {
      cover: page(DOC_CSS, `${title}${heading(eyebrow)}<div class="paper" style="position:absolute;left:700px;top:130px;width:840px;height:525px;transform:rotate(-2deg)"><img src="${img("structure.png")}"/></div>`),
      "gallery-2": page(DOC_CSS, `${title}<div class="paper" style="position:absolute;left:70px;right:70px;top:110px;bottom:100px;padding:34px 38px"><div style="font:700 28px Georgia,serif;margin-bottom:18px">${esc(p.db2)}</div><table style="border-collapse:collapse;width:100%;font-size:17px">${rows.slice(0, 9).map((r, i) => `<tr>${r.slice(0, 7).map((c) => `<${i ? "td" : "th"} style="text-align:left;border-bottom:1px solid #ece7de;padding:12px 10px;${i ? "" : "color:#8a8478;font-weight:600;font-size:14px;letter-spacing:0.04em;text-transform:uppercase"}">${esc(c)}</${i ? "td" : "th"}>`).join("")}</tr>`).join("")}</table></div><div class="cap">${esc(`${p.db2}.csv · imports as a Notion database`.toUpperCase())}</div>`),
      "gallery-3": page(DOC_CSS, `${title}<div class="paper" style="position:absolute;left:50%;top:90px;transform:translateX(-50%);width:880px;bottom:90px;padding:48px 56px">${mdHtml}</div><div class="cap">${esc(`${p.page}.md · playbook page`.toUpperCase())}</div>`),
    }
  }
  const [m1, m2, m3] = p.media
  return {
    cover: page(DOC_CSS, `${title}${heading(eyebrow)}${build[m1.type](m1)}`),
    "gallery-2": page(DOC_CSS, `${title}${build[m2.type](m2)}`),
    "gallery-3": page(DOC_CSS, `${title}${build[m3.type](m3)}`),
  }
}

/* ------------------------------------------------------------------ */

const filters = process.argv[2]?.split(",").filter(Boolean)
const browser = await chromium.launch()
const tab = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
try {
  for (const p of PRODUCTS) {
    if (filters && !filters.some((f) => p.slug.includes(f))) continue
    const pages = p.kind === "font" ? fontPages(p) : p.kind === "audio" ? audioPages(p) : p.kind === "model" ? modelPages(p) : ["doc", "notion", "design", "preset"].includes(p.kind) ? docPages(p) : null
    if (!pages) continue
    const dir = path.join(BUILD, p.slug, "images")
    fs.mkdirSync(dir, { recursive: true })
    for (const [name, html] of Object.entries(pages)) {
      await tab.setContent(html)
      await tab.evaluate(() => document.fonts.ready)
      await tab.waitForTimeout(80)
      await tab.screenshot({ path: path.join(dir, `${name}.png`) })
    }
    console.log(`${p.sku} ${p.slug}: ${Object.keys(pages).length} images`)
  }
} finally {
  await browser.close()
}
