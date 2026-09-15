// Business & Office deliverables for catalogue batch 3. Writes Word sources
// (HTML that Word converts), Excel and PowerPoint specs, Notion import
// packages and the printable planner, then a job manifest that
// office/office_build.ps1 runs through Microsoft Office itself.
//
//   node scripts/catalog/batch3/business/build_business.mjs
//   powershell -ExecutionPolicy Bypass -File scripts/catalog/batch3/office/office_build.ps1 -Manifest .catalog-build/batch3/office-jobs.json
//
// Every company, person and figure in the samples is fictional.
import fs from "node:fs"
import path from "node:path"
import { chromium } from "playwright"

const ROOT = path.resolve(import.meta.dirname, "../../../..")
const OUT = path.join(ROOT, ".catalog-build", "batch3")
const jobs = []
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
  return file
}
const dirs = (slug, pack) => ({ src: path.join(OUT, slug, "src"), files: path.join(OUT, slug, "files", pack), prev: path.join(OUT, slug, "previews") })
const serial = (y, m, d) => (Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000
const L = (i) => String.fromCharCode(65 + i)
const htmlShots = [] // { html, out, width, height }

/* ------------------------------------------------------------------ */
/* Word documents                                                       */
/* ------------------------------------------------------------------ */

function docHtml(title, body, { navy = "#0f2742", accent = "#e07a3f", font = "Calibri, Arial, sans-serif", head = "Georgia, serif", size = "A4" } = {}) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
@page { size: ${size === "A4" ? "210mm 297mm" : "8.5in 11in"}; margin: 19mm }
body { font-family: ${font}; font-size: 10.5pt; color: #1f2933; line-height: 1.38 }
h1 { font-family: ${head}; font-size: 26pt; color: ${navy}; margin: 0 0 4pt; font-weight: bold }
h2 { font-family: ${head}; font-size: 15pt; color: ${navy}; margin: 16pt 0 6pt; padding-bottom: 3pt; border-bottom: 1.5pt solid ${accent}; font-weight: bold }
h3 { font-size: 11.5pt; color: ${navy}; margin: 10pt 0 3pt; font-weight: bold }
p { margin: 0 0 7pt }
.guide { color: #6b7785; font-style: italic }
.kicker { font-size: 9pt; letter-spacing: 2pt; text-transform: uppercase; color: ${accent}; font-weight: bold; margin-bottom: 4pt }
table { border-collapse: collapse; width: 100%; margin: 3pt 0 10pt }
th { background: ${navy}; color: #ffffff; text-align: left; padding: 4pt 6pt; font-size: 9.5pt; font-weight: bold }
td { border: 0.75pt solid #cfd6de; padding: 4pt 6pt; font-size: 9.5pt; vertical-align: top }
td.num, th.num { text-align: right }
.pb { page-break-before: always }
ul { margin: 0 0 8pt 16pt; padding: 0 } li { margin: 0 0 3pt }
</style></head><body>${body}</body></html>`
}

function docJob(src, files, prev, name, html, opts = {}) {
  const inFile = write(path.join(src, `${name}.html`), html)
  jobs.push({ type: "docx", in: inFile, out: path.join(files, `${name}.docx`), pdf: path.join(files, `${name}.pdf`), page: opts.letter ? { width: 612, height: 792, margin: 54 } : { width: 595.3, height: 841.9, margin: 54 } })
  if (opts.preview) htmlShots.push({ html, out: path.join(prev, `${name}.png`), width: 794, height: 1123 })
}

const table = (head, rows, numCols = []) =>
  `<table><tr>${head.map((h, i) => `<th${numCols.includes(i) ? ' class="num"' : ""}>${esc(h)}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((c, i) => `<td${numCols.includes(i) ? ' class="num"' : ""}>${esc(c)}</td>`).join("")}</tr>`).join("")}</table>`
const guide = (t) => `<p class="guide">${esc(t)}</p>`
const list = (items) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`

/* ------------------------------------------------------------------ */
/* Excel specs                                                          */
/* ------------------------------------------------------------------ */

const NAVY = "#0f2742"
const XSTYLES = {
  title: { bold: true, size: 18, color: NAVY },
  bigtitle: { bold: true, size: 28, color: NAVY },
  note: { italic: true, color: "#6b7785" },
  h: { bold: true, fill: NAVY, color: "#ffffff" },
  hc: { bold: true, fill: NAVY, color: "#ffffff", align: "center" },
  hr: { bold: true, fill: NAVY, color: "#ffffff", align: "right" },
  month: { bold: true, fill: NAVY, color: "#ffffff", align: "center", num: "mmm yy" },
  label: { bold: true },
  section: { bold: true, color: NAVY, fill: "#e8edf3" },
  in: { color: "#1d4ed8", fill: "#fff4df" },
  inMoney: { color: "#1d4ed8", fill: "#fff4df", num: "$#,##0" },
  inMoney2: { color: "#1d4ed8", fill: "#fff4df", num: "$#,##0.00" },
  inPct: { color: "#1d4ed8", fill: "#fff4df", num: "0.0%" },
  inDate: { color: "#1d4ed8", fill: "#fff4df", num: "d mmm yyyy", align: "left" },
  inInt: { color: "#1d4ed8", fill: "#fff4df", num: "#,##0" },
  money: { num: "$#,##0" },
  money2: { num: "$#,##0.00" },
  pct: { num: "0.0%" },
  int: { num: "#,##0" },
  date: { num: "d mmm yyyy", align: "left" },
  total: { bold: true, num: "$#,##0", fill: "#e8edf3" },
  total2: { bold: true, num: "$#,##0.00", fill: "#e8edf3" },
  totalInt: { bold: true, num: "#,##0", fill: "#e8edf3" },
  kpi: { bold: true, size: 13, num: "$#,##0", color: NAVY },
  kpiPct: { bold: true, size: 13, num: "0.0%", color: NAVY },
  kpiInt: { bold: true, size: 13, num: "#,##0", color: NAVY },
  kpiDate: { bold: true, size: 13, num: "mmm yyyy", color: NAVY, align: "left" },
  kpiText: { bold: true, size: 13, color: NAVY },
  due: { bold: true, size: 14, num: "$#,##0.00", fill: NAVY, color: "#ffffff" },
  wrap: { wrap: true },
}
const put = (sh, a, v, s) => sh.cells.push(typeof v === "string" && v.startsWith("=") ? { a, f: v, ...(s ? { s } : {}) } : { a, v, ...(s ? { s } : {}) })

function xlsxJob(src, files, prev, name, sheets, shots = []) {
  const spec = write(path.join(src, `${name}.json`), JSON.stringify({ font: "Calibri", styles: XSTYLES, sheets }))
  jobs.push({ type: "xlsx", spec, out: path.join(files, `${name}.xlsx`), pdf: path.join(files, `${name}.pdf`), shots: shots.map((s) => ({ ...s, out: path.join(prev, `${name}-${s.sheet.replace(/\W+/g, "")}.png`) })) })
}

/* ------------------------------------------------------------------ */
/* 1. Startup Operations Kit                                            */
/* ------------------------------------------------------------------ */

function startupKit() {
  const { src, files, prev } = dirs("startup-operations-kit-business-templates", "Startup Operations Kit")
  const co = "Northbeam Analytics"
  docJob(src, files, prev, "Business_Plan", docHtml("Business plan", `
<div class="kicker">Business plan · 2026</div><h1>${co}</h1>
${guide(`Replace ${co} and every sample figure with your own. Italic grey guidance lines explain what each section should cover — delete them before you share the plan.`)}
<p>${co} helps mid-sized retailers forecast stock with the data they already collect. This plan sets out the problem, the product, the market and the next eighteen months.</p>
<h2>1. Executive summary</h2>${guide("In half a page: the problem, your solution, who pays, how big it can get, what you have achieved and what you are asking for.")}
<p>Retailers with 20–200 stores lose an estimated 4–8% of margin to stock-outs and overstock. ${co} connects to point-of-sale and inventory systems and produces a weekly order plan per store. We have 14 paying customers, $38,000 in monthly recurring revenue and are raising $2.0 million to reach break-even in 18 months.</p>
<h2>2. Problem and opportunity</h2>${guide("Describe the pain in your customer's words. Quantify it where you can.")}
${list(["Buyers plan orders in spreadsheets that ignore local seasonality and promotions.", "Enterprise forecasting tools take 9–12 months to implement and start at six figures.", "Mid-sized chains have the data but no analyst to turn it into decisions."])}
<h2>3. Solution and product</h2>${guide("What the product does today, what is next, and why it is hard to copy.")}
<p>A cloud service that ingests daily sales, applies store-level demand models and produces a recommended order for every product and store, with the reasons behind each recommendation. Setup takes two weeks.</p>
<h2>4. Market</h2>${guide("Size the market from the bottom up: number of customers × what they would pay.")}
${table(["Segment", "Definition", "Size (annual)"], [["Total addressable market", "Retail chains with 20+ stores in target countries", "$2.4bn"], ["Serviceable market", "Chains with 20–200 stores on modern POS", "$640m"], ["Obtainable in 3 years", "3% of serviceable market", "$19m"]], [2])}
<h2>5. Competition</h2>
${table(["Alternative", "Strength", "Weakness", "Our edge"], [["Spreadsheets", "Free, familiar", "Manual, error-prone", "Automated weekly plans"], ["Enterprise suites", "Deep features", "Slow, expensive", "Live in two weeks"], ["POS add-ons", "Already installed", "Basic averages only", "Store-level models"]])}
<h2>6. Business model and pricing</h2>
${table(["Plan", "Stores", "Price per month", "Typical customer"], [["Starter", "Up to 30", "$1,200", "Regional chain"], ["Growth", "31–100", "$2,900", "National specialist"], ["Scale", "101–200", "$5,400", "Multi-brand group"]], [2])}
<h2 class="pb">7. Go-to-market</h2>${guide("Channels, sales motion, cost to acquire a customer and how long it takes to win one.")}
${list(["Founder-led sales to the first 40 customers through retail associations.", "Partnerships with two POS providers for referrals.", "Content: a monthly benchmark report on stock performance by category."])}
<h2>8. Operations and milestones</h2>
${table(["Quarter", "Milestone", "Owner"], [["Q1 2026", "Self-serve onboarding for Starter plan", "Product"], ["Q2 2026", "POS partnership live", "Founders"], ["Q3 2026", "40 customers, $110k MRR", "Sales"], ["Q4 2026", "Break-even month", "Finance"]])}
<h2>9. Team</h2>
${table(["Name", "Role", "Background"], [["Sam Rivera", "CEO", "Ten years in retail buying"], ["Jordan Lee", "CTO", "Built forecasting systems at scale"], ["Priya Nair", "Head of Customer Success", "Retail operations consultant"]])}
<h2>10. Financial summary</h2>${guide("Copy the headline figures from Financial_Model.xlsx → Summary.")}
${table(["", "Year 1", "Year 2", "Year 3"], [["Revenue", "$620,000", "$1,900,000", "$4,300,000"], ["Gross margin", "78%", "81%", "83%"], ["EBITDA", "-$780,000", "$120,000", "$1,100,000"], ["Customers (year end)", "40", "105", "210"]], [1, 2, 3])}
<h2>11. Funding and use of funds</h2>
${table(["Use", "Amount", "Share"], [["Product and engineering", "$900,000", "45%"], ["Sales and marketing", "$700,000", "35%"], ["Operations and runway buffer", "$400,000", "20%"]], [1, 2])}
<h2>12. Risks and mitigations</h2>
${table(["Risk", "Likelihood", "Mitigation"], [["Long sales cycles", "Medium", "Pilot pricing and a 60-day proof of value"], ["Data access delays", "Medium", "Pre-built connectors for top POS systems"], ["Larger competitor moves down-market", "Low", "Focus on speed to value and service"]])}
`), { preview: true })

  docJob(src, files, prev, "Investor_Update", docHtml("Investor update", `
<div class="kicker">Monthly investor update</div><h1>${co} — October 2026</h1>
${guide("Send on the same day each month. Lead with numbers, be honest about misses and always include a specific ask.")}
<h2>Highlights</h2>${list(["Signed 3 new customers, including our first 150-store chain.", "Launched self-serve onboarding: setup time down from 14 to 6 days.", "Hired a senior data engineer."])}
<h2>Key metrics</h2>${table(["Metric", "This month", "Last month", "Change"], [["Monthly recurring revenue", "$41,200", "$38,000", "+8.4%"], ["Customers", "17", "14", "+3"], ["Net revenue retention", "112%", "109%", "+3 pts"], ["Monthly burn", "$96,000", "$92,000", "+4.3%"], ["Runway", "17 months", "18 months", "-1"]], [1, 2, 3])}
<h2>What went well</h2>${guide("Two or three wins with a sentence each on why they matter.")}<p>Our partnership pilot with a POS provider produced 9 qualified leads in four weeks.</p>
<h2>What did not</h2><p>Two onboarding projects slipped because customers could not export historical data. We are building an importer for their format.</p>
<h2>Asks</h2>${list(["Introductions to heads of merchandising at 50–200-store chains.", "Referrals for a senior account executive based in the Midlands or North."])}
`), { preview: false })

  docJob(src, files, prev, "Board_Meeting_Agenda", docHtml("Board meeting agenda", `
<div class="kicker">Board meeting</div><h1>${co}</h1><p><b>Date:</b> Thursday 12 November 2026 · <b>Time:</b> 10:00–12:00 · <b>Location:</b> Video call</p>
${guide("Circulate with the pre-read at least three working days before the meeting.")}
${table(["Time", "Item", "Owner", "Purpose"], [["10:00", "Welcome, conflicts of interest, approve last minutes", "Chair", "Decision"], ["10:10", "CEO report and key metrics", "CEO", "Information"], ["10:35", "Financial review and runway", "CFO", "Discussion"], ["11:00", "Hiring plan for Q1", "CEO", "Decision"], ["11:30", "Fundraising timeline", "CEO", "Discussion"], ["11:50", "Any other business", "Chair", "—"]])}
<h2>Decisions required</h2>${list(["Approve the Q1 hiring plan and budget.", "Approve the updated share option pool size."])}
<h2>Pre-read</h2>${list(["CEO report (4 pages)", "Management accounts to 31 October", "Financial_Model.xlsx — updated forecast"])}
`), { preview: false })

  // Financial model
  const A = { name: "Assumptions", widths: [40, 12, 18], tab: "#e07a3f", cells: [] }
  put(A, "A1", "Financial model — assumptions", "title")
  put(A, "A2", "Blue cells on a cream background are inputs. Forecast and Summary recalculate from them.", "note")
  const inputs = [["Model start month", serial(2026, 10, 1), "inDate"], ["Starting cash", 250000, "inMoney"], ["Price per customer per month", 49, "inMoney"], ["New customers in month 1", 40, "inInt"], ["Growth in new customers per month", 0.12, "inPct"], ["Monthly customer churn", 0.03, "inPct"], ["Cost of revenue (% of revenue)", 0.18, "inPct"]]
  inputs.forEach(([l, v, s], i) => { put(A, `A${4 + i}`, l, "label"); put(A, `C${4 + i}`, v, s) })
  put(A, "A12", "Team", "h"); put(A, "B12", "Headcount", "hc"); put(A, "C12", "Salary per person / month", "hc")
  ;[["Founders", 2, 6000], ["Engineering", 2, 7500], ["Sales and success", 1, 5500]].forEach(([r, n, s], i) => { put(A, `A${13 + i}`, r); put(A, `B${13 + i}`, n, "inInt"); put(A, `C${13 + i}`, s, "inMoney") })
  ;[["Marketing per month", 6000], ["Rent and office", 2500], ["Software and tools", 900]].forEach(([l, v], i) => { put(A, `A${17 + i}`, l, "label"); put(A, `C${17 + i}`, v, "inMoney") })

  const F = { name: "Forecast", widths: [30, ...Array(12).fill(11.5), 13], freeze: "B4", landscape: true, cells: [] }
  put(F, "A1", "12-month forecast", "title")
  put(F, "A2", "Calculated from Assumptions. Do not type over these cells.", "note")
  put(F, "A3", "", "h")
  for (let m = 0; m < 12; m++) put(F, `${L(1 + m)}3`, m === 0 ? "=Assumptions!$C$4" : `=EDATE(${L(m)}3,1)`, "month")
  put(F, "N3", "Total", "hc")
  const rows = [
    [4, "Customers at start", (c, p) => (c === "B" ? "=0" : `=${p}7`), "int", null],
    [5, "New customers", (c, p) => (c === "B" ? "=Assumptions!$C$7" : `=ROUND(${p}5*(1+Assumptions!$C$8),0)`), "int", "sum"],
    [6, "Churned customers", (c) => `=ROUND(${c}4*Assumptions!$C$9,0)`, "int", "sum"],
    [7, "Customers at end", (c) => `=${c}4+${c}5-${c}6`, "totalInt", null],
    [9, "Revenue", (c) => `=${c}7*Assumptions!$C$6`, "money", "sum"],
    [10, "Cost of revenue", (c) => `=${c}9*Assumptions!$C$10`, "money", "sum"],
    [11, "Gross profit", (c) => `=${c}9-${c}10`, "total", "sum"],
    [13, "Salaries", () => "=SUMPRODUCT(Assumptions!$B$13:$B$15,Assumptions!$C$13:$C$15)", "money", "sum"],
    [14, "Marketing", () => "=Assumptions!$C$17", "money", "sum"],
    [15, "Rent and office", () => "=Assumptions!$C$18", "money", "sum"],
    [16, "Software and tools", () => "=Assumptions!$C$19", "money", "sum"],
    [17, "Total operating costs", (c) => `=SUM(${c}13:${c}16)`, "total", "sum"],
    [19, "EBITDA", (c) => `=${c}11-${c}17`, "total", "sum"],
    [20, "Cash at end of month", (c, p) => (c === "B" ? "=Assumptions!$C$5+B19" : `=${p}20+${c}19`), "total", null],
  ]
  for (const [r, label, f, s, tot] of rows) {
    put(F, `A${r}`, label, s.startsWith("total") ? "label" : undefined)
    for (let m = 0; m < 12; m++) put(F, `${L(1 + m)}${r}`, f(L(1 + m), L(m)), s)
    if (tot) put(F, `N${r}`, `=SUM(B${r}:M${r})`, s.includes("Int") || s === "int" ? "totalInt" : "total")
  }
  put(F, "A8", "", undefined); put(F, "A12", "Operating costs", "section"); put(F, "A18", "", undefined)

  const S = { name: "Summary", widths: [36, 20], cells: [] }
  put(S, "A1", "Summary", "title")
  put(S, "A2", "Headline figures for the plan, board pack and investor updates.", "note")
  ;[
    ["Revenue, first 12 months", "=SUM(Forecast!B9:M9)", "kpi"],
    ["Gross margin", "=IF(B4=0,0,SUM(Forecast!B11:M11)/B4)", "kpiPct"],
    ["EBITDA, first 12 months", "=SUM(Forecast!B19:M19)", "kpi"],
    ["Cash at month 12", "=Forecast!M20", "kpi"],
    ["Customers at month 12", "=Forecast!M7", "kpiInt"],
    ["Lowest cash balance", "=MIN(Forecast!B20:M20)", "kpi"],
    ["First profitable month", '=IFERROR(INDEX(Forecast!B3:M3,MATCH(TRUE,INDEX(Forecast!B19:M19>0,0),0)),"Not within 12 months")', "kpiDate"],
    ["Monthly burn in month 1", "=-MIN(0,Forecast!B19)", "kpi"],
  ].forEach(([l, f, s], i) => { put(S, `A${4 + i}`, l, "label"); put(S, `B${4 + i}`, f, s) })
  xlsxJob(src, files, prev, "Financial_Model", [A, F, S], [{ sheet: "Forecast", range: "A1:N20", scale: 1.5 }, { sheet: "Assumptions", range: "A1:C19", scale: 2 }])

  const C = { name: "Cap Table", widths: [34, 16, 14], cells: [] }
  put(C, "A1", "Cap table and round model", "title"); put(C, "A2", "Edit the blue inputs; ownership and the round recalculate.", "note")
  put(C, "A4", "Shareholder", "h"); put(C, "B4", "Shares", "hr"); put(C, "C4", "Ownership", "hr")
  ;[["Founder — Sam Rivera", 4000000], ["Founder — Jordan Lee", 3000000], ["Employee option pool", 1000000], ["Angel investors", 800000], ["Advisors", 200000]].forEach(([n, s], i) => { put(C, `A${5 + i}`, n); put(C, `B${5 + i}`, s, "inInt"); put(C, `C${5 + i}`, `=IF($B$10=0,0,B${5 + i}/$B$10)`, "pct") })
  put(C, "A10", "Total", "label"); put(C, "B10", "=SUM(B5:B9)", "totalInt"); put(C, "C10", "=SUM(C5:C9)", "pct")
  put(C, "A12", "Next round", "section"); put(C, "B12", "", "section"); put(C, "C12", "", "section")
  ;[["Pre-money valuation", 8000000, "inMoney"], ["Investment", 2000000, "inMoney"], ["Price per share", "=B13/B10", "money2"], ["New shares issued", "=ROUND(B14/B15,0)", "int"], ["Post-money valuation", "=B13+B14", "money"], ["New investors' ownership", "=B16/(B10+B16)", "pct"]].forEach(([l, v, s], i) => { put(C, `A${13 + i}`, l, "label"); put(C, `B${13 + i}`, v, s) })
  put(C, "A20", "After the round", "h"); put(C, "B20", "Shares", "hr"); put(C, "C20", "Ownership", "hr")
  for (let i = 0; i < 5; i++) { put(C, `A${21 + i}`, `=A${5 + i}`); put(C, `B${21 + i}`, `=B${5 + i}`, "int"); put(C, `C${21 + i}`, `=B${21 + i}/$B$27`, "pct") }
  put(C, "A26", "New investors"); put(C, "B26", "=B16", "int"); put(C, "C26", "=B26/$B$27", "pct")
  put(C, "A27", "Total", "label"); put(C, "B27", "=SUM(B21:B26)", "totalInt"); put(C, "C27", "=SUM(C21:C26)", "pct")
  xlsxJob(src, files, prev, "Cap_Table", [C], [{ sheet: "Cap Table", range: "A1:C27", scale: 2 }])

  const O = { name: "OKRs", widths: [30, 44, 14, 10, 10, 10, 12, 14], freeze: "A5", cells: [] }
  put(O, "A1", "OKR tracker — Q1 2027", "title"); put(O, "A2", "Update Current each week. Progress and status calculate automatically.", "note")
  ;["Objective", "Key result", "Owner", "Start", "Target", "Current", "Progress", "Status"].forEach((h, i) => put(O, `${L(i)}4`, h, i >= 3 ? "hc" : "h"))
  const okrs = [
    ["Make onboarding effortless", [["Median setup time (days)", "Priya", 14, 5, 6], ["Customers live within 10 days", "Priya", 40, 90, 72], ["Support tickets per new customer", "Priya", 12, 4, 7]]],
    ["Grow recurring revenue", [["New customers signed", "Sam", 0, 12, 7], ["Net revenue retention (%)", "Sam", 105, 115, 112], ["Pipeline value ($k)", "Sam", 180, 600, 410]]],
    ["Ship forecasting v2", [["Forecast error reduced (%)", "Jordan", 0, 25, 19], ["Stores on v2 models", "Jordan", 0, 400, 150], ["Model runtime per store (s)", "Jordan", 40, 10, 22]]],
  ]
  let r = 5
  for (const [obj, krs] of okrs) for (const [k, own, st, tg, cur] of krs) {
    put(O, `A${r}`, obj, "label"); put(O, `B${r}`, k); put(O, `C${r}`, own); put(O, `D${r}`, st, "in"); put(O, `E${r}`, tg, "in"); put(O, `F${r}`, cur, "in")
    put(O, `G${r}`, `=IF(E${r}=D${r},0,MAX(0,MIN(1,(F${r}-D${r})/(E${r}-D${r}))))`, "pct")
    put(O, `H${r}`, `=IF(G${r}>=0.7,"On track",IF(G${r}>=0.4,"At risk","Off track"))`)
    r++
  }
  xlsxJob(src, files, prev, "OKR_Tracker", [O], [{ sheet: "OKRs", range: "A1:H13", scale: 1.6 }])
}

/* ------------------------------------------------------------------ */
/* 2. Invoice & Quote Pack                                              */
/* ------------------------------------------------------------------ */

function invoicePack() {
  const { src, files, prev } = dirs("invoice-and-quote-pack-business-templates", "Invoice & Quote Pack")
  const make = (name, title, numLabel, num, meta, totalLabel, footer, sampleItems) => {
    const sh = { name: title.charAt(0) + title.slice(1).toLowerCase().replace(/ \w/, (m) => m.toUpperCase()), widths: [46, 9, 15, 17], cells: [] }
    put(sh, "A1", title, "bigtitle")
    ;["Your Company Ltd", "12 Market Street, Your City, AB1 2CD", "hello@yourcompany.example · +1 (555) 010-1000", "Tax ID: 000 000 000"].forEach((t, i) => put(sh, `A${3 + i}`, t, i === 0 ? "label" : undefined))
    put(sh, "C3", numLabel, "label"); put(sh, "D3", num, "in")
    put(sh, "C4", "Date", "label"); put(sh, "D4", serial(2026, 10, 14), "inDate")
    put(sh, "C5", meta[0], "label"); put(sh, "D5", meta[1], meta[2])
    put(sh, "A8", title === "RECEIPT" ? "Received from" : "Bill to", "label")
    ;["Client Name", "Client Company", "45 Client Road, Client City", "accounts@client.example"].forEach((t, i) => put(sh, `A${9 + i}`, t, "in"))
    ;["Description", "Qty", "Unit price", "Amount"].forEach((h, i) => put(sh, `${L(i)}14`, h, i ? "hr" : "h"))
    for (let i = 0; i < 10; i++) {
      const row = 15 + i, it = sampleItems[i]
      put(sh, `A${row}`, it ? it[0] : "", "in"); put(sh, `B${row}`, it ? it[1] : "", "inInt"); put(sh, `C${row}`, it ? it[2] : "", "inMoney2")
      put(sh, `D${row}`, `=IF(B${row}="","",B${row}*C${row})`, "money2")
    }
    put(sh, "C26", "Subtotal", "label"); put(sh, "D26", "=SUM(D15:D24)", "money2")
    put(sh, "C27", "Tax rate", "label"); put(sh, "D27", 0.2, "inPct")
    put(sh, "C28", "Tax", "label"); put(sh, "D28", "=D26*D27", "money2")
    put(sh, "C29", totalLabel, "label"); put(sh, "D29", "=D26+D28", "due")
    footer.forEach((t, i) => put(sh, `A${31 + i}`, t, i === 0 ? "label" : "note"))
    sh.heights = [{ row: 1, pt: 38 }, { row: 29, pt: 24 }]
    xlsxJob(src, files, prev, name, [sh], [{ sheet: sh.name, range: "A1:D34", scale: 1.6 }])
  }
  const items = [["Brand strategy workshop", 1, 1200], ["Logo and identity design", 1, 2400], ["Website design, per page", 6, 350]]
  make("Invoice", "INVOICE", "Invoice no.", "INV-0001", ["Due date", "=D4+30", "date"], "Total due", ["Payment details", "Bank: Your Bank · Account 00000000 · Sort code / routing 00-00-00", "Payment terms: 30 days. Please use the invoice number as your payment reference."], items)
  make("Quote", "QUOTE", "Quote no.", "Q-0001", ["Valid until", "=D4+30", "date"], "Total", ["Acceptance", "To accept this quote, sign below and return it before the date above.", "Signed: ______________________     Name: ______________________     Date: ____________"], items)
  make("Receipt", "RECEIPT", "Receipt no.", "R-0001", ["Payment method", "Card", "in"], "Amount paid", ["Thank you", "This receipt confirms payment in full for the items above.", "Keep it for your records."], items)
  make("Credit_Note", "CREDIT NOTE", "Credit note no.", "CN-0001", ["Original invoice", "INV-0001", "in"], "Total credit", ["Credit terms", "This credit will be applied to your next invoice or refunded within 10 working days.", "Questions: accounts@yourcompany.example"], [["Refund: website design, per page", 2, 350]])
  docJob(src, files, prev, "Invoice_Word", docHtml("Invoice", `
<table style="border:none"><tr><td style="border:none;width:60%"><h1>INVOICE</h1><p><b>Your Company Ltd</b><br>12 Market Street, Your City, AB1 2CD<br>hello@yourcompany.example</p></td>
<td style="border:none"><p><b>Invoice no.</b> INV-0001<br><b>Date</b> 14 October 2026<br><b>Due date</b> 13 November 2026</p></td></tr></table>
<p><b>Bill to</b><br>Client Name · Client Company<br>45 Client Road, Client City</p>
${table(["Description", "Qty", "Unit price", "Amount"], [["Brand strategy workshop", "1", "$1,200.00", "$1,200.00"], ["Logo and identity design", "1", "$2,400.00", "$2,400.00"], ["Website design, per page", "6", "$350.00", "$2,100.00"], ["", "", "Subtotal", "$5,700.00"], ["", "", "Tax (20%)", "$1,140.00"], ["", "", "Total due", "$6,840.00"]], [1, 2, 3])}
<p class="guide">In this Word version, update totals by hand — Invoice.xlsx calculates them for you.</p>
<p><b>Payment details</b><br>Bank: Your Bank · Account 00000000 · Sort code / routing 00-00-00<br>Payment terms: 30 days. Please use the invoice number as your payment reference.</p>`), { preview: true })
}

/* ------------------------------------------------------------------ */
/* 3–4. Notion import packages                                          */
/* ------------------------------------------------------------------ */

const csv = (rows) => rows.map((r) => r.map((c) => (/[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : String(c))).join(",")).join("\r\n") + "\r\n"

function notionPack(slug, pack, home, dbs, pages, guideTitle, guideBody) {
  const { src, files, prev } = dirs(slug, pack)
  const root = path.join(files, `${pack} (Notion import)`)
  write(path.join(root, `${pack}.md`), home)
  for (const [name, rows] of Object.entries(dbs)) write(path.join(root, "Databases", `${name}.csv`), "﻿" + csv(rows))
  for (const [name, md] of Object.entries(pages)) write(path.join(root, "Pages", `${name}.md`), md)
  docJob(src, files, prev, "Setup_Guide", docHtml(guideTitle, guideBody), { preview: false })
  // Preview: the workspace structure, rendered as a plain document (not Notion's interface).
  const first = Object.entries(dbs)[0]
  htmlShots.push({
    width: 1600, height: 1000, out: path.join(prev, "structure.png"),
    html: `<html><body style="margin:0;font-family:'Segoe UI',sans-serif;background:#fbfaf7;color:#1f2328"><div style="padding:48px 64px">
<div style="font:700 13px sans-serif;letter-spacing:2px;color:#b3541e;text-transform:uppercase">Notion import package · ${Object.keys(dbs).length} databases · ${Object.keys(pages).length} pages</div>
<h1 style="font:700 44px Georgia,serif;margin:10px 0 24px">${esc(pack)}</h1>
<div style="display:grid;grid-template-columns:320px 1fr;gap:28px">
<div style="background:#fff;border:1px solid #e6e2d9;border-radius:12px;padding:20px 22px;font-size:16px;line-height:1.9">
<div style="font-weight:700;margin-bottom:6px">Databases</div>${Object.keys(dbs).map((d) => `▦ ${esc(d)}`).join("<br>")}
<div style="font-weight:700;margin:14px 0 6px">Pages</div>${Object.keys(pages).map((p) => `▤ ${esc(p)}`).join("<br>")}</div>
<div style="background:#fff;border:1px solid #e6e2d9;border-radius:12px;padding:20px 22px;overflow:hidden"><div style="font-weight:700;font-size:18px;margin-bottom:12px">${esc(first[0])} · sample rows</div>
<table style="border-collapse:collapse;width:100%;font-size:14px">${first[1].slice(0, 10).map((r, i) => `<tr>${r.slice(0, 6).map((c) => `<${i ? "td" : "th"} style="text-align:left;border-bottom:1px solid #eee;padding:8px 10px;${i ? "" : "color:#6b6b6b;font-weight:600"}">${esc(c)}</${i ? "td" : "th"}>`).join("")}</tr>`).join("")}</table></div></div></div></body></html>`,
  })
}

function agencyOS() {
  const dbs = {
    Clients: [["Name", "Status", "Industry", "Primary contact", "Email", "Monthly retainer", "Start date", "Account lead"], ["Alder & Finch", "Active", "Hospitality", "Morgan Blake", "morgan@alderfinch.example", "4500", "2026-02-01", "Riley"], ["Brightline Studio", "Active", "Architecture", "Casey Doran", "casey@brightline.example", "3200", "2026-04-15", "Jamie"], ["Cobalt Fitness", "Onboarding", "Health & fitness", "Taylor Quinn", "taylor@cobalt.example", "2800", "2026-10-01", "Riley"], ["Dunmore Legal", "Paused", "Legal", "Avery Shah", "avery@dunmore.example", "0", "2025-11-10", "Jamie"], ["Evergreen Market", "Active", "Retail", "Jordan Pike", "jordan@evergreen.example", "5200", "2025-09-20", "Sam"]],
    Projects: [["Project", "Client", "Status", "Priority", "Start", "Due", "Budget", "Owner"], ["Website redesign", "Alder & Finch", "In progress", "High", "2026-09-01", "2026-11-28", "18000", "Riley"], ["Brand refresh", "Brightline Studio", "Review", "Medium", "2026-08-15", "2026-10-30", "9500", "Jamie"], ["Launch campaign", "Cobalt Fitness", "Planning", "High", "2026-10-06", "2026-12-12", "12000", "Riley"], ["Monthly SEO", "Evergreen Market", "In progress", "Low", "2026-01-05", "2026-12-31", "14400", "Sam"]],
    Tasks: [["Task", "Project", "Assignee", "Status", "Due", "Estimate (h)"], ["Homepage wireframes", "Website redesign", "Riley", "Done", "2026-09-19", "8"], ["Design system tokens", "Website redesign", "Alex", "In progress", "2026-10-17", "6"], ["Logo explorations round 2", "Brand refresh", "Jamie", "Review", "2026-10-16", "10"], ["Campaign brief", "Launch campaign", "Riley", "To do", "2026-10-20", "4"], ["October keyword report", "Monthly SEO", "Sam", "To do", "2026-10-31", "5"]],
    Invoices: [["Invoice", "Client", "Amount", "Issued", "Due", "Status"], ["INV-1041", "Alder & Finch", "4500", "2026-10-01", "2026-10-31", "Sent"], ["INV-1042", "Brightline Studio", "3200", "2026-10-01", "2026-10-31", "Paid"], ["INV-1043", "Evergreen Market", "5200", "2026-10-01", "2026-10-31", "Overdue"]],
    Meetings: [["Meeting", "Client", "Date", "Type", "Notes owner"], ["Kickoff", "Cobalt Fitness", "2026-10-06", "Kickoff", "Riley"], ["Design review", "Brightline Studio", "2026-10-14", "Review", "Jamie"], ["Monthly check-in", "Evergreen Market", "2026-10-28", "Check-in", "Sam"]],
    Team: [["Name", "Role", "Capacity (h/week)", "Skills"], ["Riley", "Account director", "32", "Strategy, client management"], ["Jamie", "Design lead", "36", "Brand, UI"], ["Alex", "Designer", "37.5", "UI, motion"], ["Sam", "Growth lead", "32", "SEO, analytics"]],
    Leads: [["Lead", "Company", "Stage", "Estimated value", "Source", "Next step"], ["Harbourside Hotels", "Harbourside Hotels", "Proposal", "24000", "Referral", "Send proposal"], ["Keel Coffee", "Keel Coffee", "Discovery", "8000", "Website", "Book discovery call"], ["North Quay Dental", "North Quay Dental", "Qualified", "11000", "Event", "Share case studies"]],
  }
  const pages = {
    "Client onboarding": "# Client onboarding\n\nUse this checklist for every new client. Duplicate it into the client's page.\n\n## Before kickoff\n- [ ] Contract and first invoice sent\n- [ ] Shared folder and project channel created\n- [ ] Access requested: analytics, CMS, brand assets\n\n## Kickoff meeting\n- [ ] Goals, success measures and deadlines agreed\n- [ ] Decision-makers and approvers named\n- [ ] Communication rhythm set (weekly status, monthly review)\n\n## First two weeks\n- [ ] Project plan shared\n- [ ] First weekly status report sent\n",
    "Project kickoff checklist": "# Project kickoff checklist\n\n- [ ] Scope and deliverables confirmed in writing\n- [ ] Budget and hours tracked in Projects\n- [ ] Tasks created with owners and due dates\n- [ ] Risks listed with mitigations\n- [ ] Review dates booked with the client\n",
    "Weekly status report": "# Weekly status report\n\n**Client:**  \n**Week ending:**  \n\n## Done this week\n- \n\n## Next week\n- \n\n## Risks and decisions needed\n- \n\n## Budget\nHours used: __ of __\n",
    "Retrospective": "# Project retrospective\n\n## What went well\n- \n\n## What did not\n- \n\n## What we will change\n- \n",
    "Rate card": "# Rate card\n\n| Service | Unit | Rate |\n| --- | --- | --- |\n| Strategy workshop | Day | $1,800 |\n| Design | Hour | $120 |\n| Development | Hour | $130 |\n| Retainer | Month | from $2,500 |\n",
    "SOP - Monthly invoicing": "# SOP — Monthly invoicing\n\n1. On the 1st, filter **Invoices** by status *Draft*.\n2. Check hours against **Projects** budgets.\n3. Send invoices and set status to *Sent*.\n4. On the due date, move unpaid invoices to *Overdue* and email a reminder.\n",
  }
  const home = `# Agency OS\n\nThe operating system for a small creative or digital agency: clients, projects, tasks, invoices, meetings, team and leads in one workspace.\n\n## Databases\n${Object.keys(dbs).map((d) => `- **${d}** — see Databases/${d}.csv`).join("\n")}\n\n## Playbooks\n${Object.keys(pages).map((p) => `- ${p}`).join("\n")}\n\nAll sample clients and people are fictional — delete the sample rows once you have added your own.\n`
  notionPack("agency-operating-system-notion-template", "Agency OS", home, dbs, pages, "Agency OS — setup guide", `
<div class="kicker">Setup guide</div><h1>Agency OS for Notion</h1>
<p>This package imports into Notion as pages and databases. Setup takes about ten minutes.</p>
<h2>1. Import</h2>${list(["Unzip the download.", "In Notion, open Settings → Import and choose Text & Markdown to import Agency OS.md and the Pages folder.", "Choose CSV and import each file in the Databases folder — each becomes a database.", "Drag the databases onto the Agency OS page."])}
<h2>2. Link the databases</h2>${guide("CSV import creates text columns for links between databases. Converting them takes a minute each.")}
${table(["Database", "Column", "Change property type to", "Link to"], [["Projects", "Client", "Relation", "Clients"], ["Tasks", "Project", "Relation", "Projects"], ["Invoices", "Client", "Relation", "Clients"], ["Meetings", "Client", "Relation", "Clients"]])}
<h2>3. Recommended views</h2>${table(["Database", "View", "Setup"], [["Projects", "Board", "Group by Status"], ["Tasks", "My tasks", "Filter Assignee = me, sort by Due"], ["Invoices", "Overdue", "Filter Status = Overdue"], ["Leads", "Pipeline", "Board grouped by Stage"]])}
<h2>4. Make it yours</h2>${list(["Delete the fictional sample rows.", "Rename statuses and stages to match how you work.", "Duplicate the Client onboarding checklist into each new client page."])}`)
}

function creatorPlanner() {
  const dbs = {
    "Content Calendar": [["Title", "Platform", "Format", "Status", "Publish date", "Series", "Sponsor"], ["Studio tour 2026", "YouTube", "Long video", "Scripting", "2026-10-21", "Behind the scenes", ""], ["5 lighting mistakes", "YouTube", "Long video", "Filming", "2026-10-28", "Tutorials", "Lumina Lights"], ["Lighting tip #1", "Shorts", "Short", "Idea", "2026-10-23", "Tutorials", ""], ["Q&A live", "Twitch", "Live stream", "Scheduled", "2026-10-30", "Community", ""], ["Monthly newsletter", "Email", "Newsletter", "Draft", "2026-11-01", "", ""]],
    Ideas: [["Idea", "Platform", "Effort", "Potential", "Notes"], ["Budget vs pro setup", "YouTube", "Medium", "High", "Split-screen comparison"], ["Day in the life", "Shorts", "Low", "Medium", "Vertical, 45 seconds"], ["Viewer setup reviews", "Twitch", "Low", "High", "Recurring segment"]],
    Sponsors: [["Brand", "Contact", "Stage", "Deal value", "Deliverables", "Due"], ["Lumina Lights", "partners@lumina.example", "Contracted", "1800", "Integration in 1 video", "2026-10-28"], ["Deskform", "hello@deskform.example", "Negotiating", "1200", "Dedicated short", "2026-11-15"]],
    "Channel Stats": [["Month", "Platform", "Followers", "Views", "Watch hours", "Revenue"], ["2026-08", "YouTube", "41200", "388000", "21400", "2140"], ["2026-09", "YouTube", "43900", "412000", "23800", "2380"]],
    Series: [["Series", "Cadence", "Platform", "Status"], ["Tutorials", "Weekly", "YouTube", "Active"], ["Behind the scenes", "Monthly", "YouTube", "Active"], ["Community", "Fortnightly", "Twitch", "Active"]],
  }
  const pages = {
    "Video script template": "# Video script template\n\n**Working title:**  \n**Hook (first 10 seconds):**  \n\n## Outline\n1. \n2. \n3. \n\n## Call to action\n\n## B-roll list\n- \n",
    "Sponsor brief": "# Sponsor brief\n\n**Brand:**  \n**Key message:**  \n**Must say / must not say:**  \n**Deliverables and dates:**  \n**Tracking link or code:**  \n",
    "Posting checklist": "# Posting checklist\n\n- [ ] Title under 60 characters\n- [ ] Thumbnail checked at small size\n- [ ] Description, chapters and links\n- [ ] End screen and cards\n- [ ] Scheduled and shared to other platforms\n",
    "Thumbnail checklist": "# Thumbnail checklist\n\n- [ ] Readable at 160 px wide\n- [ ] One focal point\n- [ ] Three words or fewer\n- [ ] Consistent with the series style\n",
  }
  const home = `# Creator Content Planner\n\nPlan, film and publish across platforms, and keep sponsors and stats in the same place.\n\n## Databases\n${Object.keys(dbs).map((d) => `- **${d}**`).join("\n")}\n\n## Templates\n${Object.keys(pages).map((p) => `- ${p}`).join("\n")}\n\nSample channels, brands and figures are fictional.\n`
  notionPack("creator-content-planner-notion-template", "Creator Content Planner", home, dbs, pages, "Creator Content Planner — setup guide", `
<div class="kicker">Setup guide</div><h1>Creator Content Planner for Notion</h1>
<h2>1. Import</h2>${list(["Unzip the download.", "In Notion: Settings → Import → Text & Markdown for the home page and Pages folder.", "Settings → Import → CSV for each file in Databases.", "Move the databases onto the home page."])}
<h2>2. Recommended views</h2>${table(["Database", "View", "Setup"], [["Content Calendar", "Calendar", "By Publish date"], ["Content Calendar", "Board", "Group by Status"], ["Sponsors", "Pipeline", "Board grouped by Stage"], ["Channel Stats", "Chart", "Views by Month"]])}
<h2>3. Link series and sponsors</h2>${list(["Change Content Calendar → Series to a Relation to the Series database.", "Change Content Calendar → Sponsor to a Relation to Sponsors."])}`)
}

/* ------------------------------------------------------------------ */
/* 5. Pitch deck (PowerPoint)                                           */
/* ------------------------------------------------------------------ */

function pitchDeck() {
  const { src, files, prev } = dirs("pitch-deck-template-presentation", "Pitch Deck Template")
  const C = { navy: "#0f1b2d", ink: "#1b2533", mute: "#6a7585", paper: "#f6f3ee", accent: "#e07a3f", teal: "#2f8f8a", line: "#dcd6cc", white: "#ffffff" }
  const t = (x, y, w, h, text, size, color, o = {}) => ({ type: "text", x, y, w, h, text, size, color, ...o })
  const r = (type, x, y, w, h, fill, o = {}) => ({ type, x, y, w, h, fill, ...o })
  const head = (k, title) => [t(60, 44, 600, 20, k.toUpperCase(), 12, C.accent, { bold: true }), t(60, 66, 840, 60, title, 32, C.ink, { bold: true, font: "Georgia" })]
  const foot = (n) => [t(60, 505, 400, 16, "Northbeam Analytics · Seed round 2026", 10, C.mute), t(860, 505, 40, 16, String(n), 10, C.mute, { align: "right" })]
  const card = (x, y, w, h, title, body, fill = C.white) => [r("round", x, y, w, h, fill, { radius: 0.06, stroke: C.line }), t(x + 18, y + 18, w - 36, 24, title, 15, C.ink, { bold: true }), t(x + 18, y + 48, w - 36, h - 60, body, 12, C.mute, { spacing: 1.1 })]
  const slides = []
  slides.push({ bg: C.navy, shapes: [r("rect", 0, 0, 12, 540, C.accent), t(70, 150, 700, 24, "SEED ROUND · 2026", 14, C.accent, { bold: true }), t(70, 180, 780, 120, "Northbeam Analytics", 60, C.white, { bold: true, font: "Georgia" }), t(70, 300, 700, 60, "Stock forecasting for mid-sized retailers — live in two weeks, not twelve months.", 20, "#c9d2de"), t(70, 470, 600, 20, "Sam Rivera, CEO · sam@northbeam.example", 12, "#8a97a8")] })
  slides.push({ bg: C.paper, shapes: [...head("Problem", "Retailers lose 4–8% of margin to bad stock decisions"), ...card(60, 170, 270, 280, "Spreadsheets", "Buyers plan orders by hand, ignoring local seasonality and promotions."), ...card(345, 170, 270, 280, "Enterprise suites", "Nine to twelve months to implement and six-figure contracts."), ...card(630, 170, 270, 280, "No analyst", "Mid-sized chains have the data but nobody to turn it into orders."), ...foot(2)] })
  slides.push({ bg: C.paper, shapes: [...head("Solution", "A weekly order plan for every store, with the reasons"), r("round", 60, 160, 400, 300, C.navy, { radius: 0.05 }), t(90, 190, 340, 30, "Connect", 22, C.white, { bold: true }), t(90, 226, 340, 60, "Plug in POS and inventory in a day with pre-built connectors.", 14, "#c9d2de"), t(90, 300, 340, 30, "Forecast", 22, C.white, { bold: true }), t(90, 336, 340, 60, "Store-level demand models trained on your own history.", 14, "#c9d2de"), t(90, 400, 340, 30, "Order", 22, C.accent, { bold: true }), ...card(490, 160, 410, 140, "Explainable", "Every recommendation shows the drivers: trend, season, promotion, local events."), ...card(490, 320, 410, 140, "Fast to value", "Customers see a plan in week two and measure results in week six."), ...foot(3)] })
  slides.push({ bg: C.paper, shapes: [...head("Product", "What buyers see every Monday"), r("round", 60, 160, 840, 300, C.white, { radius: 0.03, stroke: C.line }), r("rect", 60, 160, 840, 40, C.navy), t(80, 170, 400, 20, "Order plan · Week 42 · 64 stores", 13, C.white, { bold: true }), ...[["Store", "SKU", "On hand", "Forecast", "Order"], ["Leeds 04", "Winter coat M", "12", "31", "20"], ["York 02", "Winter coat M", "30", "18", "0"], ["Hull 01", "Scarf, wool", "4", "22", "18"], ["Derby 03", "Boots 41", "9", "14", "6"]].flatMap((row, i) => row.map((c, j) => t(80 + j * 160, 214 + i * 44, 150, 22, c, i ? 14 : 12, i ? C.ink : C.mute, { bold: i === 0 || j === 4 }))), ...foot(4)] })
  slides.push({ bg: C.paper, shapes: [...head("Market", "A $640m serviceable market, under-served"), r("oval", 90, 160, 300, 300, "#e9e4da"), r("oval", 150, 250, 180, 180, "#f1c5a8"), r("oval", 205, 350, 70, 70, C.accent), t(430, 180, 470, 26, "$2.4bn  Total addressable market", 20, C.ink, { bold: true }), t(430, 210, 470, 40, "Retail chains with 20+ stores in target countries", 13, C.mute), t(430, 280, 470, 26, "$640m  Serviceable market", 20, C.ink, { bold: true }), t(430, 310, 470, 40, "Chains with 20–200 stores on modern POS systems", 13, C.mute), t(430, 380, 470, 26, "$19m  Obtainable in three years", 20, C.accent, { bold: true }), t(430, 410, 470, 40, "3% of the serviceable market", 13, C.mute), ...foot(5)] })
  slides.push({ bg: C.paper, shapes: [...head("Business model", "Subscription by store count"), ...[["Starter", "Up to 30 stores", "$1,200"], ["Growth", "31–100 stores", "$2,900"], ["Scale", "101–200 stores", "$5,400"]].flatMap(([n, s, p], i) => [r("round", 60 + i * 285, 170, 270, 260, i === 1 ? C.navy : C.white, { radius: 0.05, stroke: C.line }), t(84 + i * 285, 195, 230, 26, n, 20, i === 1 ? C.white : C.ink, { bold: true }), t(84 + i * 285, 226, 230, 20, s, 13, i === 1 ? "#c9d2de" : C.mute), t(84 + i * 285, 290, 230, 50, p, 38, i === 1 ? C.accent : C.ink, { bold: true }), t(84 + i * 285, 345, 230, 20, "per month", 13, i === 1 ? "#c9d2de" : C.mute)]), ...foot(6)] })
  const mrr = [8, 11, 14, 17, 21, 24, 27, 30, 33, 36, 38, 41]
  // Stats sit top-left, clear of the bars; bars are scaled to stay below them.
  slides.push({ bg: C.paper, shapes: [...head("Traction", "$41k MRR, growing 8% a month"), t(60, 140, 300, 30, "17 customers", 22, C.ink, { bold: true }), t(60, 172, 300, 20, "112% net revenue retention", 14, C.mute), ...mrr.flatMap((v, i) => [r("rect", 380 + i * 42, 460 - v * 6.2, 30, v * 6.2, i === mrr.length - 1 ? C.accent : C.teal), t(372 + i * 42, 466, 46, 16, ["N", "D", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O"][i], 10, C.mute, { align: "center" })]), t(60, 420, 300, 20, "Monthly recurring revenue, $k", 12, C.mute), ...foot(7)] })
  slides.push({ bg: C.paper, shapes: [...head("Competition", "Faster and more affordable than enterprise tools"), { type: "line", x: 480, y: 160, x2: 480, y2: 470, line: C.line, weight: 1.5 }, { type: "line", x: 140, y: 315, x2: 820, y2: 315, line: C.line, weight: 1.5 }, t(140, 150, 200, 16, "More powerful", 11, C.mute), t(140, 476, 200, 16, "Basic", 11, C.mute), t(700, 322, 120, 16, "Fast to deploy", 11, C.mute, { align: "right" }), t(140, 322, 120, 16, "Slow to deploy", 11, C.mute), r("oval", 180, 190, 22, 22, C.mute), t(210, 192, 160, 20, "Enterprise suites", 13, C.ink), r("oval", 250, 400, 22, 22, C.mute), t(280, 402, 160, 20, "Spreadsheets", 13, C.ink), r("oval", 640, 380, 22, 22, C.mute), t(670, 382, 160, 20, "POS add-ons", 13, C.ink), r("oval", 660, 190, 30, 30, C.accent), t(698, 194, 180, 24, "Northbeam", 16, C.ink, { bold: true }), ...foot(8)] })
  slides.push({ bg: C.paper, shapes: [...head("Go-to-market", "Founder-led sales, then partners"), ...card(60, 170, 270, 280, "Associations", "Retail association events and a monthly benchmark report bring warm leads."), ...card(345, 170, 270, 280, "POS partners", "Two POS providers refer customers who ask for forecasting."), ...card(630, 170, 270, 280, "Self-serve", "Starter plan customers onboard themselves in under a week."), ...foot(9)] })
  const team = [["Sam Rivera", "CEO", "Ten years in retail buying"], ["Jordan Lee", "CTO", "Built forecasting at scale"], ["Priya Nair", "Customer success", "Retail operations consultant"], ["Open role", "Head of sales", "Hiring with this round"]]
  slides.push({ bg: C.paper, shapes: [...head("Team", "Retail operators and forecasting engineers"), ...team.flatMap(([n, ro, b], i) => [r("round", 60 + i * 212, 170, 198, 280, C.white, { radius: 0.05, stroke: C.line }), r("oval", 104 + i * 212, 196, 110, 110, [C.teal, C.accent, "#7b6fd0", C.line][i]), t(76 + i * 212, 324, 166, 24, n, 16, C.ink, { bold: true, align: "center" }), t(76 + i * 212, 352, 166, 20, ro, 13, C.accent, { align: "center" }), t(76 + i * 212, 378, 166, 50, b, 12, C.mute, { align: "center" })]), ...foot(10)] })
  const fin = [[620, "Year 1"], [1900, "Year 2"], [4300, "Year 3"]]
  slides.push({ bg: C.paper, shapes: [...head("Financials", "Break-even in month 18"), ...fin.flatMap(([v, y], i) => [r("rect", 120 + i * 160, 460 - v / 16, 100, v / 16, i === 2 ? C.accent : C.navy), t(100 + i * 160, 466, 140, 16, y, 12, C.mute, { align: "center" }), t(100 + i * 160, 440 - v / 16, 140, 20, `$${(v / 1000).toFixed(1)}m`, 14, C.ink, { bold: true, align: "center" })]), ...card(620, 170, 280, 280, "Assumptions", "Price rises with store count; 3% monthly churn; gross margin above 78% from year one. Full model in the data room."), ...foot(11)] })
  const road = [["Q1", "Self-serve onboarding"], ["Q2", "POS partnership live"], ["Q3", "40 customers"], ["Q4", "Break-even month"]]
  slides.push({ bg: C.paper, shapes: [...head("Roadmap", "The next four quarters"), { type: "line", x: 80, y: 300, x2: 880, y2: 300, line: C.navy, weight: 3 }, ...road.flatMap(([q, m], i) => [r("oval", 104 + i * 220, 288, 24, 24, i === 3 ? C.accent : C.navy), t(70 + i * 220, 240, 150, 30, q, 22, C.ink, { bold: true, align: "center" }), t(60 + i * 220, 330, 170, 60, m, 14, C.mute, { align: "center" })]), ...foot(12)] })
  slides.push({ bg: C.navy, shapes: [t(60, 44, 600, 20, "THE ASK", 12, C.accent, { bold: true }), t(60, 66, 840, 60, "$2.0m seed to reach break-even", 32, C.white, { bold: true, font: "Georgia" }), ...[["Product and engineering", 45, C.accent], ["Sales and marketing", 35, C.teal], ["Operations and buffer", 20, "#7b6fd0"]].flatMap(([l, p, c], i) => [r("rect", 60, 190 + i * 90, p * 8, 50, c), t(80 + p * 8, 198 + i * 90, 300, 20, `${p}%`, 20, C.white, { bold: true }), t(80 + p * 8, 222 + i * 90, 300, 20, l, 13, "#c9d2de")])] })
  slides.push({ bg: C.navy, shapes: [t(60, 200, 840, 70, "Thank you", 54, C.white, { bold: true, font: "Georgia", align: "center" }), t(60, 290, 840, 30, "sam@northbeam.example · northbeam.example", 18, "#c9d2de", { align: "center" }), t(60, 470, 840, 20, "All names, companies and figures in this template are fictional.", 11, "#8a97a8", { align: "center" })] })
  const spec = write(path.join(src, "Pitch_Deck.json"), JSON.stringify({ font: "Calibri", width: 960, height: 540, slides }))
  jobs.push({ type: "pptx", spec, out: path.join(files, "Pitch_Deck.pptx"), pdf: path.join(files, "Pitch_Deck.pdf"), png: path.join(prev, "slides") })
}

/* ------------------------------------------------------------------ */
/* 6. Undated planner (printable PDF, built with Chromium)             */
/* ------------------------------------------------------------------ */

const PLANNER_CSS = (w, h) => `@page { size: ${w} ${h}; margin: 0 }
* { box-sizing: border-box; margin: 0; padding: 0 }
body { font-family: "Segoe UI", Arial, sans-serif; color: #2b2a28 }
.pg { width: ${w}; height: ${h}; padding: 12mm 12mm 10mm; page-break-after: always; display: flex; flex-direction: column; gap: 5mm; position: relative }
.k { font: 700 8pt Arial; letter-spacing: 2pt; text-transform: uppercase; color: #b4603a }
.t { font: 700 22pt Georgia, serif; color: #2b2a28 } .blank { border-bottom: 0.6pt solid #b9b2a7; display: inline-block; min-width: 55mm; height: 16pt }
.box { border: 0.6pt solid #cfc8bc; border-radius: 3mm; padding: 3mm; position: relative }
.box h4 { font: 700 8pt Arial; letter-spacing: 1.5pt; text-transform: uppercase; color: #7d766b; margin-bottom: 2mm }
.lines { background: repeating-linear-gradient(to bottom, transparent 0, transparent 6.6mm, #ddd6cb 6.6mm, #ddd6cb 6.9mm); flex: 1 }
.grid { display: grid; gap: 2mm; flex: 1 } .cell { border: 0.6pt solid #cfc8bc; border-radius: 2mm; padding: 1.5mm; font: 7pt Arial; color: #8d867b }
.dot { background-image: radial-gradient(#cbc3b6 0.5pt, transparent 0.6pt); background-size: 5mm 5mm; flex: 1 }
.foot { position: absolute; bottom: 5mm; left: 12mm; right: 12mm; font: 7pt Arial; color: #a8a196; display: flex; justify-content: space-between }`

const PAGES = {
  cover: () => `<div class="pg" style="justify-content:center;align-items:flex-start;padding:24mm;background:#f3eee6"><div class="k">Undated planner</div><div style="font:700 44pt Georgia,serif;line-height:1.05;margin-top:4mm">Plan the week.<br>Keep the year.</div><div style="margin-top:10mm;font:11pt Arial;color:#6d665c">Name <span class="blank"></span></div><div style="margin-top:4mm;font:11pt Arial;color:#6d665c">Year <span class="blank"></span></div></div>`,
  goals: () => `<div class="pg"><div class="k">Year</div><div class="t">Goals for the year</div><div class="grid" style="grid-template-columns:1fr 1fr">${["Work", "Health", "Money", "Relationships", "Learning", "Fun"].map((g) => `<div class="box" style="display:flex;flex-direction:column"><h4>${g}</h4><div class="lines"></div></div>`).join("")}</div></div>`,
  month: (n) => `<div class="pg"><div class="k">Month ${n ?? ""}</div><div class="t">Month <span class="blank" style="min-width:60mm"></span></div><div class="grid" style="grid-template-columns:repeat(7,1fr);grid-template-rows:auto repeat(6,1fr)">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => `<div style="font:700 7pt Arial;letter-spacing:1pt;color:#7d766b;text-transform:uppercase;padding:0 1mm">${d}</div>`).join("")}${Array.from({ length: 42 }, () => '<div class="cell"></div>').join("")}</div><div class="box" style="height:32mm;display:flex;flex-direction:column"><h4>Focus this month</h4><div class="lines"></div></div></div>`,
  week: () => `<div class="pg"><div class="k">Week</div><div class="t">Week of <span class="blank" style="min-width:60mm"></span></div><div class="grid" style="grid-template-columns:1fr 1fr;grid-template-rows:repeat(4,1fr)">${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => `<div class="box" style="display:flex;flex-direction:column"><h4>${d}</h4><div class="lines"></div></div>`).join("")}<div class="box" style="display:flex;flex-direction:column;background:#f6f1e9"><h4>Top three priorities</h4><div class="lines"></div></div></div></div>`,
  day: () => `<div class="pg"><div class="k">Day</div><div class="t">Date <span class="blank" style="min-width:60mm"></span></div><div style="display:grid;grid-template-columns:1.1fr 1fr;gap:5mm;flex:1"><div class="box" style="display:flex;flex-direction:column"><h4>Schedule</h4>${Array.from({ length: 14 }, (_, i) => `<div style="display:flex;gap:2mm;border-bottom:0.6pt solid #ddd6cb;height:12.5mm;align-items:flex-start;font:7pt Arial;color:#8d867b;padding-top:1mm">${String(7 + i).padStart(2, "0")}:00</div>`).join("")}</div><div style="display:flex;flex-direction:column;gap:5mm"><div class="box" style="height:52mm;display:flex;flex-direction:column"><h4>Top priorities</h4><div class="lines"></div></div><div class="box" style="flex:1;display:flex;flex-direction:column"><h4>To do</h4><div class="lines"></div></div><div class="box" style="height:40mm;display:flex;flex-direction:column"><h4>Notes</h4><div class="dot"></div></div></div></div></div>`,
  habits: () => `<div class="pg"><div class="k">Month</div><div class="t">Habit tracker</div><div class="box" style="flex:1;display:flex;flex-direction:column"><div style="display:grid;grid-template-columns:34mm repeat(31,1fr);gap:0.8mm;font:6pt Arial;color:#8d867b"><div></div>${Array.from({ length: 31 }, (_, i) => `<div style="text-align:center">${i + 1}</div>`).join("")}${Array.from({ length: 12 }, () => `<div style="border-bottom:0.6pt solid #b9b2a7;height:8mm"></div>${Array.from({ length: 31 }, () => '<div style="border:0.6pt solid #d8d1c5;border-radius:1mm;height:6.2mm;margin-top:1mm"></div>').join("")}`).join("")}</div></div></div>`,
  notes: () => `<div class="pg"><div class="k">Notes</div><div class="t">Notes</div><div class="box dot"></div></div>`,
}

async function planner() {
  const slug = "undated-daily-weekly-planner-printable"
  const { files, prev } = dirs(slug, "Undated Planner")
  const sizes = { A4: ["210mm", "297mm"], Letter: ["8.5in", "11in"] }
  const browser = await chromium.launch()
  const tab = await browser.newPage()
  const full = [PAGES.cover(), PAGES.goals()]
  for (let m = 1; m <= 12; m++) {
    full.push(PAGES.month(m), PAGES.habits())
    for (let w = 0; w < (m % 3 === 0 ? 5 : 4); w++) full.push(PAGES.week())
  }
  full.push(...Array.from({ length: 6 }, () => PAGES.notes()))
  for (const [size, [w, h]] of Object.entries(sizes)) {
    const doc = (pages) => `<html><head><style>${PLANNER_CSS(w, h)}</style></head><body>${pages.join("")}</body></html>`
    await tab.setContent(doc(full))
    await tab.pdf({ path: path.join(files, `Full_Planner_${size}.pdf`), preferCSSPageSize: true, printBackground: true })
    for (const [name, fn] of [["Daily", PAGES.day], ["Weekly", PAGES.week], ["Monthly", PAGES.month], ["Habit_Tracker", PAGES.habits], ["Notes", PAGES.notes], ["Yearly_Goals", PAGES.goals]]) {
      await tab.setContent(doc([fn()]))
      await tab.pdf({ path: path.join(files, "Single_Pages", `${name}_${size}.pdf`).replace(/(.*)/, (p) => (fs.mkdirSync(path.dirname(p), { recursive: true }), p)), preferCSSPageSize: true, printBackground: true })
    }
  }
  // Page previews at A4, 96 dpi.
  await tab.setViewportSize({ width: 794, height: 1123 })
  for (const [name, fn] of [["cover", PAGES.cover], ["week", PAGES.week], ["day", PAGES.day], ["month", PAGES.month], ["habits", PAGES.habits]]) {
    await tab.setContent(`<html><head><style>${PLANNER_CSS("794px", "1123px")}</style></head><body>${fn()}</body></html>`)
    fs.mkdirSync(prev, { recursive: true })
    await tab.screenshot({ path: path.join(prev, `${name}.png`) })
  }
  await browser.close()
  return full.length
}

/* ------------------------------------------------------------------ */
/* 7. Resume & cover letter set                                         */
/* ------------------------------------------------------------------ */

function resumes() {
  const { src, files, prev } = dirs("resume-and-cover-letter-set", "Resume & Cover Letter Set")
  const P = { name: "Alex Morgan", role: "Product Designer", email: "alex.morgan@email.example", phone: "+1 (555) 010-4477", city: "Your City", web: "alexmorgan.example" }
  const jobsList = [
    ["Senior Product Designer", "Harbour Health", "2023 – present", ["Led design for a patient app used by 180,000 people a month.", "Cut appointment booking time by 40% through a redesigned flow.", "Built and maintain the company design system."]],
    ["Product Designer", "Fieldnote", "2020 – 2023", ["Designed onboarding that raised activation from 31% to 46%.", "Ran weekly usability sessions with customers.", "Partnered with engineering on an accessible component library."]],
    ["UX Designer", "Northbank Agency", "2018 – 2020", ["Delivered websites and apps for retail and hospitality clients.", "Introduced research sprints to the agency's process."]],
  ]
  const skills = ["User research", "Interaction design", "Design systems", "Prototyping", "Accessibility (WCAG)", "Figma", "Workshops"]
  const edu = [["BA Graphic Design", "University of Your City", "2014 – 2017"]]
  const designs = {
    Classic: { navy: "#1e2a3a", accent: "#8a6d3b", head: "Georgia, serif", body: "Georgia, serif" },
    Modern: { navy: "#16324f", accent: "#2f8f8a", head: "Calibri, Arial, sans-serif", body: "Calibri, Arial, sans-serif" },
    Minimal: { navy: "#222222", accent: "#555555", head: "Calibri Light, Calibri, sans-serif", body: "Calibri, Arial, sans-serif" },
  }
  for (const [d, th] of Object.entries(designs)) {
    const exp = jobsList.map(([t, c, y, b]) => `<h3>${esc(t)} · ${esc(c)} <span style="font-weight:normal;color:#6b7785">— ${esc(y)}</span></h3>${list(b)}`).join("")
    let body
    if (d === "Modern") {
      body = `<table style="border:none;width:100%"><tr><td style="border:none;background:${th.navy};color:#ffffff;width:32%;padding:14pt;vertical-align:top">
<p style="font-size:22pt;font-weight:bold;color:#ffffff;margin-bottom:2pt">${P.name}</p><p style="color:#bfe3e0">${P.role}</p>
<p style="color:#ffffff;font-weight:bold;margin-top:12pt">Contact</p><p style="color:#dbe7f0">${P.email}<br>${P.phone}<br>${P.city}<br>${P.web}</p>
<p style="color:#ffffff;font-weight:bold;margin-top:12pt">Skills</p><p style="color:#dbe7f0">${skills.join("<br>")}</p>
<p style="color:#ffffff;font-weight:bold;margin-top:12pt">Education</p><p style="color:#dbe7f0">${edu.map((e) => e.join("<br>")).join("")}</p></td>
<td style="border:none;padding:6pt 0 6pt 16pt;vertical-align:top"><h2>Profile</h2><p>Product designer with eight years of experience turning research into simple, accessible products. Comfortable leading design across a product and working closely with engineering.</p><h2>Experience</h2>${exp}</td></tr></table>`
    } else {
      body = `<h1 style="${d === "Minimal" ? "font-weight:normal;letter-spacing:1pt" : ""}">${P.name}</h1><p style="color:${th.accent};font-size:13pt;margin-bottom:2pt">${P.role}</p><p style="color:#6b7785">${P.email} · ${P.phone} · ${P.city} · ${P.web}</p>
<h2>Profile</h2><p>Product designer with eight years of experience turning research into simple, accessible products. Comfortable leading design across a product and working closely with engineering.</p>
<h2>Experience</h2>${exp}<h2>Skills</h2><p>${skills.join(" · ")}</p><h2>Education</h2>${edu.map(([q, s, y]) => `<p><b>${q}</b>, ${s} — ${y}</p>`).join("")}`
    }
    const style = { navy: th.navy, accent: th.accent, head: th.head, font: th.body }
    docJob(src, files, prev, `Resume_${d}`, docHtml(`${P.name} — resume`, body, style), { preview: true })
    docJob(src, files, prev, `Cover_Letter_${d}`, docHtml(`${P.name} — cover letter`, `<h1 style="font-size:20pt">${P.name}</h1><p style="color:#6b7785">${P.email} · ${P.phone} · ${P.city}</p>
<p style="margin-top:18pt">14 October 2026</p><p>Hiring Manager<br>Company Name<br>Company address</p>
<p style="margin-top:12pt">Dear Hiring Manager,</p>
<p>I am applying for the Product Designer role at Company Name. For the past eight years I have designed products that people rely on every day, most recently leading design for a patient app used by 180,000 people a month.</p>
<p>What I would bring to your team is a habit of starting with research and ending with measurable change. At Harbour Health, rethinking the booking flow with patients and clinicians cut booking time by 40%. At Fieldnote, a redesigned onboarding raised activation from 31% to 46%.</p>
<p>I would welcome the chance to talk about how I could help Company Name. Thank you for your time and consideration.</p>
<p style="margin-top:12pt">Yours sincerely,</p><p><b>${P.name}</b></p>`, style), { preview: false })
  }
}

/* ------------------------------------------------------------------ */

startupKit()
invoicePack()
agencyOS()
creatorPlanner()
pitchDeck()
resumes()
const pages = await planner()
fs.writeFileSync(path.join(OUT, "office-jobs.json"), JSON.stringify(jobs, null, 2))

const browser = await chromium.launch()
const tab = await browser.newPage()
for (const s of htmlShots) {
  await tab.setViewportSize({ width: s.width, height: s.height })
  await tab.setContent(s.html)
  fs.mkdirSync(path.dirname(s.out), { recursive: true })
  await tab.screenshot({ path: s.out })
}
await browser.close()
console.log(`${jobs.length} Office jobs written to office-jobs.json · planner ${pages} pages · ${htmlShots.length} HTML previews`)
