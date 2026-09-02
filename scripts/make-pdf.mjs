// Minimal dependency-free single/multi-page PDF generator for real, openable sample documents.
import fs from "node:fs"
import path from "node:path"

function escapeText(s) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

function wrapLines(text, maxCharsPerLine) {
  const words = text.split(/\s+/)
  const lines = []
  let current = ""
  for (const w of words) {
    if ((current + " " + w).trim().length > maxCharsPerLine) {
      if (current) lines.push(current.trim())
      current = w
    } else {
      current = (current + " " + w).trim()
    }
  }
  if (current) lines.push(current)
  return lines
}

/**
 * pages: array of { title: string, body: string[] } — body is an array of paragraph strings
 */
export function buildPdf(pages) {
  const objects = []
  let objCount = 0
  function addObject(str) {
    objCount += 1
    objects.push({ id: objCount, body: str })
    return objCount
  }

  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
  const boldFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

  const pageIds = []
  const contentIds = []

  for (const page of pages) {
    let y = 760
    let content = "BT\n/FB 20 Tf\n50 " + y + " Td\n(" + escapeText(page.title) + ") Tj\nET\n"
    y -= 40
    content += "BT\n/F1 11 Tf\n"
    for (const para of page.body) {
      const lines = wrapLines(para, 90)
      for (const line of lines) {
        content += "1 0 0 1 50 " + y + " Tm\n(" + escapeText(line) + ") Tj\n"
        y -= 16
      }
      y -= 8
    }
    content += "ET\n"

    const streamId = addObject(`<< /Length ${content.length} >>\nstream\n${content}endstream`)
    contentIds.push(streamId)
  }

  for (let i = 0; i < pages.length; i++) {
    const pageId = addObject(
      `<< /Type /Page /Parent PAGES_REF /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R /FB ${boldFontId} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`,
    )
    pageIds.push(pageId)
  }

  const pagesId = addObject(
    `<< /Type /Pages /Kids [${pageIds.map((id) => id + " 0 R").join(" ")}] /Count ${pageIds.length} >>`,
  )
  // fix parent refs
  for (const p of objects) {
    if (p.body.includes("PAGES_REF")) p.body = p.body.replace("PAGES_REF", `${pagesId} 0 R`)
  }
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`)

  let pdf = "%PDF-1.4\n"
  const offsets = [0]
  for (const obj of objects) {
    offsets.push(pdf.length)
    pdf += `${obj.id} 0 obj\n${obj.body}\nendobj\n`
  }
  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i <= objects.length; i++) {
    pdf += String(offsets[i]).padStart(10, "0") + " 00000 n \n"
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return Buffer.from(pdf, "latin1")
}

export function writePdf(filePath, pages) {
  const buf = buildPdf(pages)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, buf)
  return filePath
}
