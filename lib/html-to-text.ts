// Converts raw HTML item descriptions (e.g. from Envato listings) into clean,
// readable plain text for storage and display. The product page renders
// `description` inside a plain <p> with no HTML parsing, so any unescaped
// markup would otherwise show up as literal tags/code to shoppers.

const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  rsquo: "\u2019",
  lsquo: "\u2018",
  rdquo: "\u201d",
  ldquo: "\u201c",
  mdash: "\u2014",
  ndash: "\u2013",
  hellip: "\u2026",
  copy: "\u00a9",
  reg: "\u00ae",
  trade: "\u2122",
}

function decodeEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code: string) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&([a-zA-Z]+);/g, (match, name: string) => ENTITY_MAP[name] ?? match)
}

export function htmlToPlainText(html: string | null | undefined): string {
  if (!html) return ""
  if (!/<[a-z][\s\S]*>/i.test(html)) return html.trim()

  let text = html
    // Drop script/style blocks entirely.
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    // Marketplace listings often open with a table of badge links (theme guide,
    // support, contact) — presentation chrome, not descriptive content.
    .replace(/<table[^>]*>[\s\S]*?<\/table>/gi, " ")
    // Turn block-level boundaries into paragraph breaks before stripping tags.
    .replace(/<\/(p|div|h[1-6])>/gi, "\n\n")
    .replace(/<\/(li|tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\u2022 ")
    // Strip all remaining tags.
    .replace(/<[^>]+>/g, "")

  text = decodeEntities(text)

  return text
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
