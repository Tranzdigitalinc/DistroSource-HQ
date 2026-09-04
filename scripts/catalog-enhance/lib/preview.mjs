/**
 * Product preview generator.
 *
 * Produces 4 category-appropriate SVG previews per product: a dashboard view,
 * a data/content view, a report view, and a structural overview — whichever
 * set suits the archetype.
 *
 * These are CONCEPT PREVIEWS. They illustrate the layout and structure the
 * product is designed around; they are not screenshots of a finished
 * downloadable file, and nothing in the copy or alt text claims otherwise.
 * Assets are stored under `catalog/previews/<slug>/` so they can be replaced
 * wholesale once final product files exist.
 *
 * Everything is drawn programmatically — no generative imagery, no stock art,
 * no invented brand marks. Sample data is fictional and seeded per product so
 * two products never render the same numbers.
 */

const PALETTE = {
  ink: "#2A2521",
  ink2: "#6B6259",
  line: "#E2DCD3",
  line2: "#F0EBE4",
  paper: "#FFFDFA",
  surface: "#F7F3EC",
  accent: "#E0721F",
  accentSoft: "#FBEADC",
  green: "#4F7A52",
  blue: "#3F6382",
  navy: "#2A2521",
}

function rng(seed) {
  let s = (seed * 2654435761) % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const W = 1200
const H = 900

function shell(inner, bg = PALETTE.surface) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Archivo, Inter, 'Helvetica Neue', Arial, sans-serif">
<rect width="${W}" height="${H}" fill="${bg}"/>${inner}</svg>`
}

const txt = (x, y, s, { size = 14, fill = PALETTE.ink, weight = 400, anchor = "start", opacity = 1 } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}" opacity="${opacity}">${esc(s)}</text>`

const rect = (x, y, w, h, { fill = PALETTE.paper, stroke = PALETTE.line, r = 8, sw = 1 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`

/** Browser/app chrome so previews read as a real interface, not a poster. */
function chrome(title) {
  return `${rect(40, 40, W - 80, H - 80, { r: 12, fill: PALETTE.paper })}
${`<path d="M40 76 h${W - 80}" stroke="${PALETTE.line}" stroke-width="1"/>`}
<circle cx="66" cy="58" r="5" fill="#E2DCD3"/><circle cx="84" cy="58" r="5" fill="#E2DCD3"/><circle cx="102" cy="58" r="5" fill="#E2DCD3"/>
${txt(126, 63, title, { size: 12, fill: PALETTE.ink2 })}`
}

function sidebar(items, active = 0) {
  let out = rect(40, 77, 210, H - 117, { r: 0, fill: PALETTE.surface, stroke: "none" })
  out += `<path d="M250 77 V${H - 40}" stroke="${PALETTE.line}" stroke-width="1"/>`
  items.forEach((label, i) => {
    const y = 110 + i * 38
    if (i === active) out += rect(56, y - 18, 178, 30, { r: 6, fill: PALETTE.accentSoft, stroke: "none" })
    out += `<rect x="70" y="${y - 9}" width="12" height="12" rx="3" fill="${i === active ? PALETTE.accent : PALETTE.line}"/>`
    out += txt(94, y + 1, label, { size: 12.5, fill: i === active ? PALETTE.ink : PALETTE.ink2, weight: i === active ? 600 : 400 })
  })
  return out
}

function statCard(x, y, w, label, value, delta, up = true) {
  return `${rect(x, y, w, 88)}
${txt(x + 18, y + 28, label, { size: 11, fill: PALETTE.ink2 })}
${txt(x + 18, y + 60, value, { size: 26, weight: 700 })}
${txt(x + 18, y + 78, `${up ? "▲" : "▼"} ${delta}`, { size: 11, fill: up ? PALETTE.green : "#B4553F" })}`
}

function barChart(x, y, w, h, values, title) {
  let out = rect(x, y, w, h) + txt(x + 18, y + 28, title, { size: 12, weight: 600 })
  const max = Math.max(...values)
  const bw = (w - 60) / values.length
  values.forEach((v, i) => {
    const bh = ((v / max) * (h - 80)) | 0
    out += `<rect x="${x + 30 + i * bw}" y="${y + h - 26 - bh}" width="${bw - 10}" height="${bh}" rx="3" fill="${i === values.length - 1 ? PALETTE.accent : "#D9CFC2"}"/>`
  })
  return out
}

function lineChart(x, y, w, h, values, title) {
  let out = rect(x, y, w, h) + txt(x + 18, y + 28, title, { size: 12, weight: 600 })
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = Math.max(1, max - min)
  const pts = values.map((v, i) => {
    const px = x + 30 + (i * (w - 60)) / (values.length - 1)
    const py = y + h - 30 - ((v - min) / span) * (h - 90)
    return `${px.toFixed(1)},${py.toFixed(1)}`
  })
  out += `<polyline points="${pts.join(" ")}" fill="none" stroke="${PALETTE.accent}" stroke-width="2.5" stroke-linejoin="round"/>`
  return out
}

function table(x, y, w, headers, rows) {
  let out = rect(x, y, w, 44 + rows.length * 34)
  const cw = (w - 40) / headers.length
  headers.forEach((hd, i) => out += txt(x + 20 + i * cw, y + 28, hd, { size: 10.5, fill: PALETTE.ink2, weight: 600 }))
  out += `<path d="M${x + 1} ${y + 40} h${w - 2}" stroke="${PALETTE.line2}"/>`
  rows.forEach((r, ri) => {
    const ry = y + 44 + ri * 34
    if (ri % 2 === 1) out += rect(x + 1, ry, w - 2, 34, { r: 0, fill: PALETTE.surface, stroke: "none" })
    r.forEach((cell, ci) =>
      out += txt(x + 20 + ci * cw, ry + 22, cell, { size: 11.5, weight: ci === 0 ? 600 : 400, fill: ci === 0 ? PALETTE.ink : PALETTE.ink2 }))
  })
  return out
}

// ---------------------------------------------------------------------------
// Sample data — fictional, seeded per product.
// ---------------------------------------------------------------------------
const COMPANIES = ["Northgate Supply", "Harbourline Studio", "Kestrel Foods", "Ridgeway Media", "Alder & Co", "Brightfold", "Maple Row", "Ironvale", "Cobblestone", "Fernway"]
const PEOPLE = ["A. Okafor", "J. Lindqvist", "M. Haddad", "R. Delacroix", "S. Whitfield", "T. Nakamura", "L. Moreau", "D. Castellanos"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function money(n) {
  return "$" + n.toLocaleString("en-US")
}

// ---------------------------------------------------------------------------
// View builders per archetype
// ---------------------------------------------------------------------------

function dashboardView(p, r, label) {
  const vals = Array.from({ length: 8 }, () => 40 + Math.floor(r() * 160))
  const rev = 40000 + Math.floor(r() * 90000)
  return shell(`${chrome(`${p.brand} — ${label}`)}
${sidebar(["Overview", "Records", "Reports", "Categories", "Settings"], 0)}
${txt(286, 122, label, { size: 22, weight: 700 })}
${txt(286, 146, `${p.subjectTitle} · period to date`, { size: 12, fill: PALETTE.ink2 })}
${statCard(286, 172, 200, "Total", money(rev), `${(4 + r() * 9).toFixed(1)}% vs last period`)}
${statCard(502, 172, 200, "Recorded items", String(120 + Math.floor(r() * 400)), `${(2 + r() * 6).toFixed(1)}% vs last period`)}
${statCard(718, 172, 200, "Average value", money(80 + Math.floor(r() * 400)), `${(1 + r() * 4).toFixed(1)}% vs last period`, r() > 0.4)}
${statCard(934, 172, 206, "Open", String(3 + Math.floor(r() * 22)), `${(1 + r() * 5).toFixed(1)}% vs last period`, false)}
${barChart(286, 284, 530, 240, vals, "By month")}
${lineChart(832, 284, 308, 240, Array.from({ length: 7 }, () => 20 + Math.floor(r() * 120)), "Trend")}
${table(286, 548, 854, ["Item", "Category", "Date", "Status", "Value"],
  Array.from({ length: 6 }, () => [
    COMPANIES[Math.floor(r() * COMPANIES.length)],
    ["Operations", "Marketing", "Payroll", "Supplies", "Travel"][Math.floor(r() * 5)],
    `${MONTHS[Math.floor(r() * 12)]} ${1 + Math.floor(r() * 27)}`,
    ["Complete", "Pending", "Review"][Math.floor(r() * 3)],
    money(200 + Math.floor(r() * 9000)),
  ]))}`)
}

function dataEntryView(p, r) {
  const rows = Array.from({ length: 11 }, (_, i) => [
    String(i + 1),
    `${MONTHS[Math.floor(r() * 12)]} ${1 + Math.floor(r() * 27)}`,
    COMPANIES[Math.floor(r() * COMPANIES.length)],
    ["Operations", "Marketing", "Payroll", "Supplies"][Math.floor(r() * 4)],
    money(50 + Math.floor(r() * 4000)),
    ["Paid", "Due", "Draft"][Math.floor(r() * 3)],
  ])
  return shell(`${chrome(`${p.brand} — Data entry`)}
${txt(72, 122, "Data entry", { size: 22, weight: 700 })}
${txt(72, 146, "Enter records here; every summary view reads from this sheet.", { size: 12, fill: PALETTE.ink2 })}
${rect(72, 168, W - 144, 44, { r: 8, fill: PALETTE.surface })}
${["#", "Date", "Counterparty", "Category", "Amount", "Status"].map((h, i) => txt(96 + i * 175, 196, h, { size: 11, weight: 700, fill: PALETTE.ink2 })).join("")}
${rows.map((row, ri) => {
    const y = 212 + ri * 42
    return `${rect(72, y, W - 144, 42, { r: 0, fill: ri % 2 ? PALETTE.paper : "#FCFAF6" })}
${row.map((c, ci) => txt(96 + ci * 175, y + 26, c, { size: 12, weight: ci === 0 ? 700 : 400, fill: ci === 0 ? PALETTE.ink2 : PALETTE.ink })).join("")}`
  }).join("")}
${rect(72, 212 + rows.length * 42, W - 144, 46, { r: 0, fill: PALETTE.accentSoft })}
${txt(96, 240 + rows.length * 42, "Total", { size: 12, weight: 700 })}
${txt(96 + 4 * 175, 240 + rows.length * 42, money(18000 + Math.floor(r() * 60000)), { size: 12, weight: 700 })}`)
}

function reportView(p, r) {
  return shell(`${chrome(`${p.brand} — Report`)}
${txt(72, 126, "Summary report", { size: 24, weight: 700 })}
${txt(72, 152, `${p.subjectTitle} — prepared ${MONTHS[Math.floor(r() * 12)]} ${2024 + Math.floor(r() * 2)}`, { size: 12, fill: PALETTE.ink2 })}
${barChart(72, 180, 540, 260, Array.from({ length: 6 }, () => 30 + Math.floor(r() * 150)), "Distribution by category")}
${lineChart(632, 180, 496, 260, Array.from({ length: 9 }, () => 30 + Math.floor(r() * 140)), "Twelve-period trend")}
${table(72, 468, 1056, ["Category", "Prior", "Current", "Change", "Share"],
  ["Operations", "Marketing", "Payroll", "Supplies", "Travel", "Other"].map((c) => {
    const prior = 2000 + Math.floor(r() * 20000)
    const cur = Math.floor(prior * (0.8 + r() * 0.5))
    return [c, money(prior), money(cur), `${cur > prior ? "+" : ""}${(((cur - prior) / prior) * 100).toFixed(1)}%`, `${(5 + r() * 30).toFixed(1)}%`]
  }))}`)
}

function settingsView(p, r) {
  const fields = [
    ["Period label", "FY " + (2024 + Math.floor(r() * 2))],
    ["Currency", "USD ($)"],
    ["Date format", "DD MMM YYYY"],
    ["Opening balance", money(1000 + Math.floor(r() * 40000))],
    ["Default category", "Operations"],
    ["Rounding", "2 decimal places"],
  ]
  return shell(`${chrome(`${p.brand} — Settings`)}
${sidebar(["Overview", "Records", "Reports", "Categories", "Settings"], 4)}
${txt(286, 122, "Settings", { size: 22, weight: 700 })}
${txt(286, 146, "Values here drive labels and calculations across every sheet.", { size: 12, fill: PALETTE.ink2 })}
${fields.map(([k, v], i) => {
    const y = 178 + i * 74
    return `${txt(286, y + 16, k, { size: 11.5, fill: PALETTE.ink2, weight: 600 })}
${rect(286, y + 26, 500, 40, { r: 6 })}
${txt(302, y + 52, v, { size: 13 })}`
  }).join("")}
${rect(830, 178, 310, 300, { fill: PALETTE.surface })}
${txt(852, 210, "Categories", { size: 12, weight: 700 })}
${["Operations", "Marketing", "Payroll", "Supplies", "Travel", "Other"].map((c, i) =>
    `${rect(852, 226 + i * 38, 266, 30, { r: 6, fill: PALETTE.paper })}${txt(868, 246 + i * 38, c, { size: 11.5 })}`).join("")}`)
}

function websiteView(p, r, variant) {
  if (variant === "mobile") {
    return shell(`${rect(430, 60, 340, 780, { r: 28, fill: PALETTE.paper })}
${rect(430, 60, 340, 74, { r: 28, fill: PALETTE.navy, stroke: "none" })}
${txt(462, 104, p.brand, { size: 15, weight: 700, fill: "#FFFDFA" })}
${rect(454, 152, 292, 168, { r: 8, fill: PALETTE.surface })}
${txt(470, 200, p.subjectTitle.slice(0, 22), { size: 17, weight: 700 })}
${txt(470, 224, "Clear structure on small screens.", { size: 11, fill: PALETTE.ink2 })}
${rect(470, 244, 120, 34, { r: 6, fill: PALETTE.accent, stroke: "none" })}
${txt(530, 266, "Get started", { size: 11, fill: "#fff", weight: 600, anchor: "middle" })}
${[0, 1, 2].map((i) => `${rect(454, 340 + i * 120, 292, 104, { r: 8 })}
${rect(470, 356 + i * 120, 60, 60, { r: 6, fill: PALETTE.accentSoft, stroke: "none" })}
${txt(546, 384 + i * 120, ["Services", "About", "Contact"][i], { size: 13, weight: 600 })}
${txt(546, 404 + i * 120, "Supporting detail line", { size: 10.5, fill: PALETTE.ink2 })}`).join("")}
${txt(600, 872, "Mobile layout", { size: 12, fill: PALETTE.ink2, anchor: "middle" })}`)
  }
  const interior = variant === "interior"
  return shell(`${chrome(`${p.brand.toLowerCase()}.example`)}
${rect(40, 77, W - 80, 66, { r: 0, fill: PALETTE.paper, stroke: "none" })}
${txt(76, 118, p.brand, { size: 17, weight: 800 })}
${["Home", "Services", "Work", "About", "Contact"].map((l, i) => txt(360 + i * 108, 118, l, { size: 12.5, fill: i === (interior ? 1 : 0) ? PALETTE.ink : PALETTE.ink2, weight: i === (interior ? 1 : 0) ? 600 : 400 })).join("")}
${rect(1010, 100, 130, 36, { r: 6, fill: PALETTE.accent, stroke: "none" })}
${txt(1075, 123, "Enquire", { size: 12, fill: "#fff", weight: 600, anchor: "middle" })}
<path d="M40 143 h${W - 80}" stroke="${PALETTE.line}"/>
${interior
      ? `${txt(76, 200, "Services", { size: 30, weight: 800 })}
${txt(76, 232, `What we do for ${p.subjectTitle.toLowerCase()}.`, { size: 13.5, fill: PALETTE.ink2 })}
${[0, 1, 2, 3, 4, 5].map((i) => `${rect(76, 264 + Math.floor(i / 3) * 190, 340, 170)}
${rect(100, 288 + Math.floor(i / 3) * 190, 44, 44, { r: 8, fill: PALETTE.accentSoft, stroke: "none" })}
${txt(100, 360 + Math.floor(i / 3) * 190, ["Consultation", "Delivery", "Support", "Strategy", "Maintenance", "Training"][i], { size: 15, weight: 700 })}
${txt(100, 384 + Math.floor(i / 3) * 190, "Short explanatory sentence about", { size: 11.5, fill: PALETTE.ink2 })}
${txt(100, 402 + Math.floor(i / 3) * 190, "this service and who it suits.", { size: 11.5, fill: PALETTE.ink2 })}`).map((s, i) => s.replace(/x="76"/g, `x="${76 + (i % 3) * 364}"`).replace(/x="100"/g, `x="${100 + (i % 3) * 364}"`)).join("")}`
      : `${rect(76, 176, W - 152, 300, { r: 10, fill: PALETTE.surface })}
${txt(120, 268, p.subjectTitle, { size: 40, weight: 800 })}
${txt(120, 306, "A clear headline, a supporting sentence, and one obvious next step.", { size: 15, fill: PALETTE.ink2 })}
${rect(120, 332, 168, 46, { r: 8, fill: PALETTE.accent, stroke: "none" })}
${txt(204, 361, "Get started", { size: 13.5, fill: "#fff", weight: 600, anchor: "middle" })}
${rect(304, 332, 150, 46, { r: 8, fill: PALETTE.paper })}
${txt(379, 361, "Learn more", { size: 13.5, weight: 600, anchor: "middle" })}
${[0, 1, 2].map((i) => `${rect(76 + i * 356, 504, 332, 150)}
${rect(100 + i * 356, 528, 40, 40, { r: 8, fill: PALETTE.accentSoft, stroke: "none" })}
${txt(100 + i * 356, 596, ["Built to adapt", "Readable code", "Fast to deploy"][i], { size: 15, weight: 700 })}
${txt(100 + i * 356, 620, "One line describing the benefit.", { size: 11.5, fill: PALETTE.ink2 })}`).join("")}
${rect(76, 678, W - 152, 142, { r: 10, fill: PALETTE.navy, stroke: "none" })}
${txt(600, 738, "Ready to start?", { size: 22, weight: 700, fill: "#FFFDFA", anchor: "middle" })}
${txt(600, 766, "A single closing call to action.", { size: 13, fill: "#D9CFC2", anchor: "middle" })}`}`)
}

function componentsView(p, r) {
  return shell(`${chrome(`${p.brand} — Components`)}
${txt(72, 124, "Component overview", { size: 22, weight: 700 })}
${txt(72, 148, "Reusable pieces the screens are assembled from.", { size: 12, fill: PALETTE.ink2 })}
${["Buttons", "Inputs", "Cards", "Navigation", "Tables", "Badges", "Modals", "Charts"].map((label, i) => {
    const x = 72 + (i % 4) * 272
    const y = 176 + Math.floor(i / 4) * 300
    return `${rect(x, y, 250, 270)}
${txt(x + 20, y + 32, label, { size: 13, weight: 700 })}
${[0, 1, 2].map((j) => `${rect(x + 20, y + 52 + j * 62, 210, 46, { r: 6, fill: j === 0 ? PALETTE.accentSoft : PALETTE.surface, stroke: PALETTE.line2 })}
${txt(x + 36, y + 80 + j * 62, ["Default", "Hover", "Disabled"][j], { size: 11, fill: PALETTE.ink2 })}`).join("")}
${txt(x + 20, y + 250, `${3 + Math.floor(r() * 6)} variants`, { size: 10.5, fill: PALETTE.ink2 })}`
  }).join("")}`)
}

function slidesView(p, r, variant) {
  if (variant === "grid") {
    return shell(`${txt(60, 66, "Slide overview", { size: 20, weight: 700 })}
${Array.from({ length: 12 }, (_, i) => {
      const x = 60 + (i % 4) * 278
      const y = 96 + Math.floor(i / 4) * 262
      return `${rect(x, y, 258, 242, { r: 8 })}
${rect(x, y, 258, 34, { r: 8, fill: PALETTE.surface, stroke: "none" })}
${txt(x + 14, y + 22, `${i + 1}. ${["Title", "Agenda", "Problem", "Solution", "Market", "Product", "Traction", "Model", "Team", "Roadmap", "Financials", "Close"][i]}`, { size: 10.5, weight: 600, fill: PALETTE.ink2 })}
${i % 3 === 0
          ? `${txt(x + 14, y + 100, "Headline", { size: 17, weight: 700 })}${txt(x + 14, y + 122, "Supporting line", { size: 10, fill: PALETTE.ink2 })}`
          : i % 3 === 1
            ? `${[0, 1, 2].map((k) => `${rect(x + 14, y + 56 + k * 44, 230, 34, { r: 4, fill: PALETTE.surface, stroke: "none" })}`).join("")}`
            : `${[0, 1, 2, 3].map((k) => `<rect x="${x + 22 + k * 56}" y="${y + 190 - (20 + Math.floor(r() * 100))}" width="40" height="${20 + Math.floor(r() * 100)}" rx="3" fill="${k === 3 ? PALETTE.accent : "#D9CFC2"}"/>`).join("")}`}`
    }).join("")}`)
  }
  if (variant === "chart") {
    return shell(`${rect(60, 60, W - 120, H - 120, { r: 10 })}
${txt(110, 150, "Performance by quarter", { size: 30, weight: 700 })}
${txt(110, 184, `${p.subjectTitle} — illustrative figures`, { size: 14, fill: PALETTE.ink2 })}
${barChart(110, 216, 560, 380, Array.from({ length: 6 }, () => 40 + Math.floor(r() * 150)), "Revenue")}
${lineChart(700, 216, 440, 380, Array.from({ length: 8 }, () => 30 + Math.floor(r() * 140)), "Growth")}
${[0, 1, 2].map((i) => `${txt(110 + i * 350, 660, ["Q1–Q2", "Q3", "Q4"][i], { size: 12, fill: PALETTE.ink2, weight: 600 })}
${txt(110 + i * 350, 694, money(20000 + Math.floor(r() * 200000)), { size: 26, weight: 700 })}`).join("")}`)
  }
  return shell(`${rect(60, 60, W - 120, H - 120, { r: 10, fill: PALETTE.navy, stroke: "none" })}
${txt(120, 380, p.brand, { size: 15, fill: PALETTE.accent, weight: 700 })}
${txt(120, 452, p.subjectTitle, { size: 46, weight: 800, fill: "#FFFDFA" })}
${txt(120, 494, "A cover layout with room for a real title and subtitle.", { size: 16, fill: "#C9BFB2" })}
<path d="M120 540 h180" stroke="${PALETTE.accent}" stroke-width="3"/>
${txt(120, 780, `${PEOPLE[Math.floor(r() * PEOPLE.length)]} · ${MONTHS[Math.floor(r() * 12)]} ${2024 + Math.floor(r() * 2)}`, { size: 12.5, fill: "#9B9186" })}`)
}

function documentView(p, r, variant) {
  const page = (x, y, w, h, content) => `${rect(x, y, w, h, { r: 3 })}${content}`
  if (variant === "cover") {
    return shell(`${page(300, 60, 600, 780, `
${rect(300, 60, 600, 12, { r: 0, fill: PALETTE.accent, stroke: "none" })}
${txt(360, 220, p.brand.toUpperCase(), { size: 12, fill: PALETTE.ink2, weight: 700 })}
${txt(360, 300, p.subjectTitle, { size: 32, weight: 800 })}
<path d="M360 336 h140" stroke="${PALETTE.accent}" stroke-width="3"/>
${txt(360, 392, "Prepared for", { size: 11, fill: PALETTE.ink2 })}
${txt(360, 414, COMPANIES[Math.floor(r() * COMPANIES.length)], { size: 15, weight: 600 })}
${txt(360, 464, "Prepared by", { size: 11, fill: PALETTE.ink2 })}
${txt(360, 486, PEOPLE[Math.floor(r() * PEOPLE.length)], { size: 15, weight: 600 })}
${txt(360, 770, `${MONTHS[Math.floor(r() * 12)]} ${2024 + Math.floor(r() * 2)}`, { size: 11.5, fill: PALETTE.ink2 })}`)}`)
  }
  if (variant === "table") {
    return shell(`${page(300, 60, 600, 780, `
${txt(340, 120, "Schedule of charges", { size: 18, weight: 700 })}
${table(340, 150, 520, ["Item", "Qty", "Rate", "Amount"],
      Array.from({ length: 9 }, () => {
        const q = 1 + Math.floor(r() * 12)
        const rate = 60 + Math.floor(r() * 400)
        return [["Consultation", "Delivery", "Support", "Licence", "Training"][Math.floor(r() * 5)], String(q), money(rate), money(q * rate)]
      }))}
${rect(600, 620, 260, 96, { fill: PALETTE.surface })}
${txt(620, 650, "Subtotal", { size: 11.5, fill: PALETTE.ink2 })}${txt(840, 650, money(4000 + Math.floor(r() * 9000)), { size: 11.5, anchor: "end" })}
${txt(620, 676, "Tax", { size: 11.5, fill: PALETTE.ink2 })}${txt(840, 676, money(400 + Math.floor(r() * 900)), { size: 11.5, anchor: "end" })}
${txt(620, 704, "Total", { size: 13, weight: 700 })}${txt(840, 704, money(5000 + Math.floor(r() * 11000)), { size: 13, weight: 700, anchor: "end" })}`)}`)
  }
  if (variant === "spread") {
    return shell(`${page(90, 90, 500, 720, `${txt(130, 150, "1. Scope", { size: 15, weight: 700 })}
${Array.from({ length: 16 }, (_, i) => `<rect x="130" y="${172 + i * 26}" width="${300 + (i % 4) * 40}" height="7" rx="3.5" fill="${PALETTE.line2}"/>`).join("")}
${txt(130, 640, "2. Deliverables", { size: 15, weight: 700 })}
${Array.from({ length: 4 }, (_, i) => `<rect x="130" y="${662 + i * 26}" width="${280 + (i % 3) * 50}" height="7" rx="3.5" fill="${PALETTE.line2}"/>`).join("")}`)}
${page(610, 90, 500, 720, `${txt(650, 150, "3. Terms", { size: 15, weight: 700 })}
${Array.from({ length: 10 }, (_, i) => `<rect x="650" y="${172 + i * 26}" width="${300 + (i % 4) * 40}" height="7" rx="3.5" fill="${PALETTE.line2}"/>`).join("")}
${rect(650, 452, 420, 120, { fill: PALETTE.surface })}
${txt(670, 486, "Note", { size: 11.5, weight: 700 })}
${Array.from({ length: 3 }, (_, i) => `<rect x="670" y="${502 + i * 20}" width="${340 - i * 40}" height="6" rx="3" fill="${PALETTE.line}"/>`).join("")}
${txt(650, 640, "Signed", { size: 12, weight: 700 })}
<path d="M650 700 h180 M890 700 h180" stroke="${PALETTE.ink2}"/>
${txt(650, 722, "Client", { size: 10.5, fill: PALETTE.ink2 })}${txt(890, 722, "Supplier", { size: 10.5, fill: PALETTE.ink2 })}`)}`)
  }
  return shell(`${page(300, 60, 600, 780, `
${txt(340, 120, p.subjectTitle, { size: 20, weight: 700 })}
<path d="M340 138 h520" stroke="${PALETTE.line}"/>
${Array.from({ length: 26 }, (_, i) => `<rect x="340" y="${168 + i * 24}" width="${i % 7 === 6 ? 240 : 480 + (i % 3) * 20}" height="7" rx="3.5" fill="${i % 7 === 0 ? PALETTE.line : PALETTE.line2}"/>`).join("")}
${txt(340, 800, "Page 2 of 8", { size: 10.5, fill: PALETTE.ink2 })}`)}`)
}

function iconGridView(p, r, variant) {
  const glyph = (cx, cy, k, size = 22) => {
    const s = size
    const shapes = [
      `<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" rx="4" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8"/>`,
      `<circle cx="${cx}" cy="${cy}" r="${s / 2}" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8"/>`,
      `<path d="M${cx - s / 2} ${cy + s / 3} L${cx} ${cy - s / 2} L${cx + s / 2} ${cy + s / 3} Z" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8" stroke-linejoin="round"/>`,
      `<path d="M${cx - s / 2} ${cy} h${s} M${cx} ${cy - s / 2} v${s}" stroke="${PALETTE.ink}" stroke-width="1.8" stroke-linecap="round"/>`,
      `<rect x="${cx - s / 2}" y="${cy - s / 3}" width="${s}" height="${(s * 2) / 3}" rx="3" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8"/><path d="M${cx - s / 4} ${cy - s / 3} v${(s * 2) / 3}" stroke="${PALETTE.ink}" stroke-width="1.8"/>`,
      `<circle cx="${cx}" cy="${cy - s / 5}" r="${s / 4}" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8"/><path d="M${cx - s / 2.4} ${cy + s / 2} a${s / 2.4} ${s / 3} 0 0 1 ${s / 1.2} 0" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8"/>`,
      `<path d="M${cx - s / 2} ${cy + s / 2} L${cx - s / 6} ${cy - s / 6} L${cx + s / 6} ${cy + s / 6} L${cx + s / 2} ${cy - s / 2}" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
      `<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" rx="${s / 2}" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8"/><path d="M${cx - s / 5} ${cy} h${(s * 2) / 5}" stroke="${PALETTE.ink}" stroke-width="1.8"/>`,
      // Extended set — 48 slots cycling 8 shapes read as filler, so the
      // library carries enough distinct forms to fill a set overview.
      `<path d="M${cx - s / 2} ${cy - s / 3} h${s} v${(s * 2) / 3} h${-s} Z M${cx - s / 2} ${cy - s / 3} l${s / 2} ${s / 3} l${s / 2} ${-s / 3}" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8" stroke-linejoin="round"/>`,
      `<circle cx="${cx}" cy="${cy}" r="${s / 2.6}" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8"/><path d="M${cx + s / 4} ${cy + s / 4} L${cx + s / 2} ${cy + s / 2}" stroke="${PALETTE.ink}" stroke-width="1.8" stroke-linecap="round"/>`,
      `<path d="M${cx - s / 2} ${cy + s / 2} v${-s / 2} M${cx - s / 6} ${cy + s / 2} v${-s} M${cx + s / 6} ${cy + s / 2} v${-s / 1.6} M${cx + s / 2} ${cy + s / 2} v${-s / 2.6}" stroke="${PALETTE.ink}" stroke-width="1.8" stroke-linecap="round"/>`,
      `<path d="M${cx} ${cy - s / 2} l${s / 2} ${s / 2} l${-s / 2} ${s / 2} l${-s / 2} ${-s / 2} Z" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8" stroke-linejoin="round"/>`,
      `<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" rx="4" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8"/><path d="M${cx - s / 5} ${cy} l${s / 6} ${s / 6} l${s / 3} ${-s / 2.6}" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
      `<path d="M${cx - s / 2} ${cy} a${s / 2} ${s / 2} 0 1 1 ${s} 0 a${s / 2} ${s / 2} 0 1 1 ${-s} 0 M${cx} ${cy - s / 3} v${s / 2.4} h${s / 4}" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8" stroke-linecap="round"/>`,
      `<path d="M${cx - s / 2} ${cy - s / 4} h${s} M${cx - s / 2} ${cy + s / 6} h${s / 1.6}" stroke="${PALETTE.ink}" stroke-width="1.8" stroke-linecap="round"/><circle cx="${cx + s / 3}" cy="${cy + s / 6}" r="${s / 8}" fill="${PALETTE.ink}"/>`,
      `<path d="M${cx} ${cy + s / 2} l${-s / 2} ${-s / 2.4} v${-s / 3} h${s} v${s / 3} Z" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8" stroke-linejoin="round"/>`,
      `<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s / 2.4}" height="${s / 2.4}" rx="2" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8"/><rect x="${cx + s / 12}" y="${cy + s / 12}" width="${s / 2.4}" height="${s / 2.4}" rx="2" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8"/>`,
      `<path d="M${cx - s / 2} ${cy + s / 3} q${s / 4} ${-s} ${s / 2} 0 q${s / 4} ${s} ${s / 2} 0" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8" stroke-linecap="round"/>`,
      `<circle cx="${cx - s / 4}" cy="${cy - s / 5}" r="${s / 6}" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8"/><circle cx="${cx + s / 4}" cy="${cy - s / 5}" r="${s / 6}" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8"/><path d="M${cx - s / 2} ${cy + s / 2} q${s / 2} ${-s / 2.6} ${s} 0" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8"/>`,
      `<path d="M${cx - s / 2} ${cy - s / 2} h${s} v${s} h${-s} Z M${cx - s / 2} ${cy - s / 6} h${s} M${cx - s / 6} ${cy - s / 2} v${s}" fill="none" stroke="${PALETTE.ink}" stroke-width="1.8"/>`,
    ]
    return shapes[k % shapes.length]
  }
  if (variant === "closeup") {
    return shell(`${chrome(`${p.brand} — Detail`)}
${txt(72, 126, "Grid and construction", { size: 22, weight: 700 })}
${txt(72, 150, "Every glyph is drawn on one grid at a shared stroke weight.", { size: 12, fill: PALETTE.ink2 })}
${[0, 1, 2].map((i) => {
      const x = 90 + i * 360
      return `${rect(x, 190, 320, 320, { fill: PALETTE.paper })}
${Array.from({ length: 9 }, (_, g) => `<path d="M${x + 40 + g * 30} 220 v260 M${x + 20} ${250 + g * 30} h280" stroke="${PALETTE.line2}" stroke-width="1"/>`).join("")}
${glyph(x + 160, 350, i + 2, 150)}
${txt(x + 160, 550, ["24px grid", "1.8 stroke", "4px corner"][i], { size: 12, fill: PALETTE.ink2, anchor: "middle" })}`
    }).join("")}
${rect(90, 590, W - 180, 220, { fill: PALETTE.surface })}
${Array.from({ length: 24 }, (_, i) => glyph(140 + (i % 12) * 84, 660 + Math.floor(i / 12) * 90, i)).join("")}`)
  }
  if (variant === "sizes") {
    return shell(`${chrome(`${p.brand} — Sizes`)}
${txt(72, 126, "Optical sizing", { size: 22, weight: 700 })}
${txt(72, 150, "Rendered at the sizes interfaces actually use.", { size: 12, fill: PALETTE.ink2 })}
${[16, 20, 24, 32, 48, 64].map((s, i) => {
      const x = 110 + i * 180
      return `${rect(x - 60, 200, 150, 200, { fill: PALETTE.paper })}${glyph(x + 15, 285, i + 1, s)}${txt(x + 15, 370, `${s}px`, { size: 11.5, fill: PALETTE.ink2, anchor: "middle" })}`
    }).join("")}
${rect(72, 430, W - 144, 180, { fill: PALETTE.navy, stroke: "none" })}
${txt(102, 470, "On dark surfaces", { size: 12, fill: "#C9BFB2", weight: 600 })}
${Array.from({ length: 12 }, (_, i) => `<g opacity="0.92">${glyph(140 + i * 84, 540, i).replace(/stroke="#2A2521"/g, 'stroke="#FFFDFA"')}</g>`).join("")}
${rect(72, 634, W - 144, 176, { fill: PALETTE.surface })}
${txt(102, 674, "In context", { size: 12, weight: 600 })}
${[0, 1, 2, 3].map((i) => `${rect(102 + i * 268, 692, 244, 96, { fill: PALETTE.paper })}${glyph(134 + i * 268, 740, i + 3, 24)}${txt(162 + i * 268, 736, ["Reports", "Inventory", "Customers", "Settings"][i], { size: 12.5, weight: 600 })}${txt(162 + i * 268, 756, "Menu label", { size: 10.5, fill: PALETTE.ink2 })}`).join("")}`)
  }
  // The usage variant draws a sidebar, so its heading starts clear of it.
  const headX = variant === "usage" ? 286 : 72
  return shell(`${chrome(`${p.brand} — ${variant === "usage" ? "In use" : "Set overview"}`)}
${txt(headX, 126, variant === "usage" ? "Applied in an interface" : `${p.subjectTitle} icon set`, { size: 22, weight: 700 })}
${txt(headX, 150, variant === "usage" ? "How the set reads inside real navigation and controls." : "Consistent weight and grid across every glyph.", { size: 12, fill: PALETTE.ink2 })}
${variant === "usage"
      ? `${sidebar(["Overview", "Records", "Reports", "Customers", "Settings"], 2)}
${Array.from({ length: 5 }, (_, i) => glyph(78, 111 + i * 38, i, 14)).join("")}
${rect(286, 190, 854, 120, { fill: PALETTE.surface })}
${[0, 1, 2, 3].map((i) => `${rect(310 + i * 210, 210, 190, 80, { fill: PALETTE.paper })}${glyph(340 + i * 210, 250, i + 4, 26)}${txt(370 + i * 210, 246, ["Add", "Filter", "Export", "Archive"][i], { size: 12.5, weight: 600 })}${txt(370 + i * 210, 266, "Toolbar action", { size: 10, fill: PALETTE.ink2 })}`).join("")}
${table(286, 330, 854, ["", "Record", "Owner", "Status"],
        Array.from({ length: 8 }, () => ["", COMPANIES[Math.floor(r() * COMPANIES.length)], PEOPLE[Math.floor(r() * PEOPLE.length)], ["Active", "Paused"][Math.floor(r() * 2)]]))}
${Array.from({ length: 8 }, (_, i) => glyph(310, 396 + i * 34, i, 16)).join("")}`
      : Array.from({ length: 48 }, (_, i) => {
        const x = 110 + (i % 8) * 136
        const y = 210 + Math.floor(i / 8) * 108
        return `${rect(x - 42, y - 42, 116, 96, { fill: PALETTE.paper })}${glyph(x + 16, y - 4, i, 26)}${txt(x + 16, y + 38, `icon-${String(i + 1).padStart(2, "0")}`, { size: 8.5, fill: PALETTE.ink2, anchor: "middle" })}`
      }).join("")}`)
}

function typeSpecimenView(p, r, variant) {
  const sample = "Handgloves"
  if (variant === "waterfall") {
    return shell(`${rect(60, 60, W - 120, H - 120, { r: 10 })}
${txt(110, 130, "Size waterfall", { size: 13, fill: PALETTE.ink2, weight: 600 })}
${[72, 56, 44, 34, 26, 20, 16, 13].map((s, i) => {
      const y = 200 + i * (s * 0.9 + 22)
      return `${txt(110, y, `${sample} ${s}px`, { size: s, weight: i < 3 ? 700 : 400 })}`
    }).join("")}`)
  }
  if (variant === "charset") {
    const rows = ["ABCDEFGHIJKLM", "NOPQRSTUVWXYZ", "abcdefghijklm", "nopqrstuvwxyz", "0123456789", ".,;:!?&@#$%()"]
    return shell(`${rect(60, 60, W - 120, H - 120, { r: 10 })}
${txt(110, 130, "Character set", { size: 13, fill: PALETTE.ink2, weight: 600 })}
${rows.map((row, i) => txt(110, 220 + i * 96, row, { size: 44, weight: i < 2 ? 600 : 400 })).join("")}`)
  }
  if (variant === "paragraph") {
    const lines = [
      "The quick brown fox jumps over the lazy dog while the",
      "typesetter checks the spacing between every pair of",
      "letters, because a face that looks correct in a specimen",
      "can still fall apart once it is set as running text at a",
      "size anyone would actually read it in.",
    ]
    return shell(`${rect(60, 60, W - 120, H - 120, { r: 10 })}
${txt(110, 130, "In paragraph setting", { size: 13, fill: PALETTE.ink2, weight: 600 })}
${lines.map((l, i) => txt(110, 220 + i * 52, l, { size: 26 })).join("")}
${lines.map((l, i) => txt(110, 520 + i * 30, l, { size: 15, fill: PALETTE.ink2 })).join("")}`)
  }
  return shell(`${rect(60, 60, W - 120, H - 120, { r: 10, fill: PALETTE.navy, stroke: "none" })}
${txt(110, 200, p.brand.toUpperCase(), { size: 13, fill: PALETTE.accent, weight: 700 })}
${txt(110, 420, sample, { size: 150, weight: 800, fill: "#FFFDFA" })}
${txt(110, 490, p.subjectTitle, { size: 20, fill: "#C9BFB2" })}
${txt(110, 780, "Aa Bb Cc  ·  0123456789  ·  .,;:!?", { size: 22, fill: "#9B9186" })}`)
}

// ---------------------------------------------------------------------------

const VIEW_SETS = {
  spreadsheet: [["Dashboard", dashboardView], ["Data entry", dataEntryView], ["Report", reportView], ["Settings", settingsView]],
  "admin-dashboard": [["Dashboard", dashboardView], ["Records table", dataEntryView], ["Reports", reportView], ["Components", componentsView]],
  "react-template": [["Home page", (p, r) => websiteView(p, r, "home")], ["Interior page", (p, r) => websiteView(p, r, "interior")], ["Components", componentsView], ["Mobile", (p, r) => websiteView(p, r, "mobile")]],
  "website-template": [["Home page", (p, r) => websiteView(p, r, "home")], ["Interior page", (p, r) => websiteView(p, r, "interior")], ["Mobile", (p, r) => websiteView(p, r, "mobile")], ["Components", componentsView]],
  "ui-kit": [["Screen overview", componentsView], ["Dashboard screen", dashboardView], ["Mobile screens", (p, r) => websiteView(p, r, "mobile")], ["Design system", (p, r) => iconGridView(p, r, "sizes")]],
  presentation: [["Cover", (p, r) => slidesView(p, r, "cover")], ["Content slides", (p, r) => slidesView(p, r, "grid")], ["Data slide", (p, r) => slidesView(p, r, "chart")], ["Slide overview", (p, r) => slidesView(p, r, "grid")]],
  document: [["Cover", (p, r) => documentView(p, r, "cover")], ["Interior page", (p, r) => documentView(p, r, "interior")], ["Tables", (p, r) => documentView(p, r, "table")], ["Spread", (p, r) => documentView(p, r, "spread")]],
  "icon-pack": [["Set overview", (p, r) => iconGridView(p, r, "overview")], ["Construction", (p, r) => iconGridView(p, r, "closeup")], ["Sizes", (p, r) => iconGridView(p, r, "sizes")], ["In use", (p, r) => iconGridView(p, r, "usage")]],
  font: [["Specimen", (p, r) => typeSpecimenView(p, r, "cover")], ["Size waterfall", (p, r) => typeSpecimenView(p, r, "waterfall")], ["Character set", (p, r) => typeSpecimenView(p, r, "charset")], ["Paragraph setting", (p, r) => typeSpecimenView(p, r, "paragraph")]],
  graphic: [["Overview", componentsView], ["Detail", (p, r) => iconGridView(p, r, "closeup")], ["Sizes", (p, r) => iconGridView(p, r, "sizes")], ["In use", (p, r) => iconGridView(p, r, "usage")]],
}

const VIEW_ALIASES = {
  "ecommerce-template": "website-template",
  "landing-page": "website-template",
  notion: "spreadsheet",
  planner: "spreadsheet",
  resume: "document",
  branding: "graphic",
  mockup: "graphic",
  social: "graphic",
  "three-d": "graphic",
  audio: "graphic",
  preset: "graphic",
  bundle: "graphic",
}

export function viewsFor(archetypeId) {
  return VIEW_SETS[archetypeId] ?? VIEW_SETS[VIEW_ALIASES[archetypeId] ?? "graphic"]
}

/**
 * Renders the preview set for a product.
 * Returns [{ label, svg, alt }] — alt text describes the view as a preview of
 * the product's layout, never as a screenshot of a delivered file.
 */
export function renderPreviews(product) {
  const views = viewsFor(product.archetypeId)
  return views.map(([label, fn], i) => {
    const r = rng(product.id * 97 + i * 13)
    return {
      label,
      // The label is the third argument: views that title themselves (the
      // dashboard, for one) render "undefined" without it.
      svg: fn(product, r, label),
      alt: `${product.name} — ${label.toLowerCase()} preview showing the product's layout and structure`,
    }
  })
}
