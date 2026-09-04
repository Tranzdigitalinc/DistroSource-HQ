/**
 * Read-only export of the DistroSource catalog to an .xlsx workbook.
 *
 * Run from the repo root:
 *   node --env-file=.env.local <this file> <output.xlsx>
 *
 * No dependencies: the workbook is written as a minimal OOXML zip (stored
 * entries, CRC32) so nothing needs installing. The DB session is forced
 * read-only.
 */
import { Pool } from "pg"
import { writeFileSync } from "node:fs"

const out = process.argv[2] || "distrosource-products.xlsx"
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL missing")
const pool = new Pool({ connectionString })

// ---------- data ----------
const client = await pool.connect()
let rows
try {
  await client.query("SET SESSION default_transaction_read_only = on")
  const q = await client.query(`
    select p.id, p.slug, p.name, p.tagline, p.description, p.status, p."assetStatus", p."isFree", p."isBundle",
           p."basePrice", p."compareAtPrice", p."fileFormats", p."softwareCompatibility", p."currentVersion",
           c.name as category, d.name as department,
           (select json_agg(json_build_object('t', l."licenseType", 'p', l.price) order by l."sortOrder")
              from product_licenses l where l."productId" = p.id) as licenses
      from products p
      left join categories c on c.id = p."categoryId"
      left join categories d on d.id = c."parentId"
     order by (p.status = 'published') desc, d.name nulls last, c.name nulls last, p.name
  `)
  rows = q.rows
} finally {
  client.release()
  await pool.end()
}

function stripMd(s) {
  return (s || "")
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*|__|`/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim()
}
function brief(p) {
  if (p.tagline?.trim()) return p.tagline.trim()
  const text = stripMd(p.description)
  const firstPara = text.split(/(?<=[.!?])\s/).slice(0, 2).join(" ")
  return firstPara.length > 220 ? firstPara.slice(0, 217).trimEnd() + "…" : firstPara
}
const money = (v) => (v == null ? null : Number(v))
const tier = (p, t) => money((p.licenses || []).find((l) => l.t === t)?.p)

const header = [
  "Product", "Status", "Department", "Category", "Brief description", "What you get (formats)", "Works with",
  "Personal (USD)", "Commercial (USD)", "Agency (USD)", "Starting price (USD)", "Compare-at (USD)", "Free", "Bundle", "Version", "Product URL",
]
const data = rows.map((p) => {
  const prices = (p.licenses || []).map((l) => Number(l.p)).filter((n) => Number.isFinite(n))
  const starting = p.isFree ? 0 : prices.length ? Math.min(...prices) : money(p.basePrice)
  return [
    p.name,
    p.status === "published" && p.assetStatus === "ready" ? "Published" : "Draft",
    p.department || "",
    p.category || "",
    brief(p),
    (p.fileFormats || []).join(", "),
    (p.softwareCompatibility || []).join(", "),
    tier(p, "personal"),
    tier(p, "commercial"),
    tier(p, "agency"),
    starting,
    money(p.compareAtPrice),
    p.isFree ? "Yes" : "No",
    p.isBundle ? "Yes" : "No",
    p.currentVersion || "",
    `https://distrosource.com/products/${p.slug}`,
  ]
})

// ---------- minimal xlsx ----------
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const col = (i) => { let s = ""; i += 1; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26) } return s }
function cell(v, r, c, isHeader) {
  const ref = `${col(c)}${r}`
  if (v == null || v === "") return `<c r="${ref}"${isHeader ? ' s="1"' : ""}/>`
  if (typeof v === "number") return `<c r="${ref}" s="${isHeader ? 1 : 2}"><v>${v}</v></c>`
  return `<c r="${ref}" t="inlineStr"${isHeader ? ' s="1"' : ""}><is><t xml:space="preserve">${esc(v)}</t></is></c>`
}
const sheetRows = [header, ...data].map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => cell(v, ri + 1, ci, ri === 0)).join("")}</row>`).join("")
const widths = [42, 10, 20, 26, 70, 26, 26, 14, 16, 12, 18, 16, 6, 7, 8, 50]
const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("")}</cols><sheetData>${sheetRows}</sheetData><autoFilter ref="A1:${col(header.length - 1)}${data.length + 1}"/></worksheet>`

const summary = [
  ["DistroSource product & price list", ""],
  ["Generated", new Date().toISOString().slice(0, 10)],
  ["Total products", rows.length],
  ["Published", data.filter((r) => r[1] === "Published").length],
  ["Draft (not yet on sale)", data.filter((r) => r[1] === "Draft").length],
  ["Currency", "USD, one-time payment per licence"],
  ["Licence tiers", "Personal — own non-commercial use · Commercial — one commercial/client project · Agency — multiple client projects within one company"],
  ["Payments", "Processed by Polar (Merchant of Record); tax calculated at checkout"],
]
const sumRows = summary.map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => cell(v, ri + 1, ci, ci === 0)).join("")}</row>`).join("")
const summarySheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="1" width="28" customWidth="1"/><col min="2" max="2" width="110" customWidth="1"/></cols><sheetData>${sumRows}</sheetData></worksheet>`

const files = {
  "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
  "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
  "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Products" sheetId="1" r:id="rId1"/><sheet name="Summary" sheetId="2" r:id="rId2"/></sheets></workbook>`,
  "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
  "xl/styles.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;$&quot;#,##0.00"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyNumberFormat="1"/></cellXfs></styleSheet>`,
  "xl/worksheets/sheet1.xml": sheet,
  "xl/worksheets/sheet2.xml": summarySheet,
}

// --- zip (stored) ---
const crcTable = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c })
const crc32 = (buf) => { let c = -1; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0 }
const u16 = (n) => Buffer.from([n & 0xff, (n >> 8) & 0xff])
const u32 = (n) => Buffer.from([n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >>> 24) & 0xff])
const parts = [], central = []
let offset = 0
for (const [name, content] of Object.entries(files)) {
  const nameBuf = Buffer.from(name), body = Buffer.from(content, "utf8"), crc = crc32(body)
  const local = Buffer.concat([u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(crc), u32(body.length), u32(body.length), u16(nameBuf.length), u16(0), nameBuf, body])
  central.push(Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(crc), u32(body.length), u32(body.length), u16(nameBuf.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nameBuf]))
  parts.push(local)
  offset += local.length
}
const cd = Buffer.concat(central)
const eocd = Buffer.concat([u32(0x06054b50), u16(0), u16(0), u16(central.length), u16(central.length), u32(cd.length), u32(offset), u16(0)])
writeFileSync(out, Buffer.concat([...parts, cd, eocd]))
console.log(`wrote ${out}: ${rows.length} products (${data.filter((r) => r[1] === "Published").length} published)`)
