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

// Cross-sell / affiliate anchors advertise other products or other
// tech-stack variants of the same template (e.g. "React version", "Vue
// version") wrapped in envato.market redirect links — not content
// describing this item, so they're dropped along with their inner images.
const AFFILIATE_LINK_RE = /<a\b[^>]*href="[^"]*(?:envato\.market|click\.linksynergy)[^"]*"[^>]*>[\s\S]*?<\/a>/gi
// Standalone promo/badge images ("Exclusive" ribbons, etc.) that aren't part
// of the actual written description.
const PROMO_IMG_RE = /<img\b[^>]*(?:exclusive|badge|banner)[^>]*>/gi

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

// Converts raw HTML item descriptions into a small, safe markdown-like
// format (## headings, - bullets, **bold**) instead of flattening
// everything into one plain-text blob. `components/product/lite-markdown.tsx`
// renders this back into properly arranged headings/paragraphs/lists —
// no dangerouslySetInnerHTML anywhere, so there's no HTML-injection risk
// even though the source is third-party marketplace content.
export function htmlToLiteMarkdown(html: string | null | undefined): string {
  if (!html) return ""
  if (!/<[a-z][\s\S]*>/i.test(html)) return html.trim()

  let text = html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<table[^>]*>[\s\S]*?<\/table>/gi, " ")
    .replace(AFFILIATE_LINK_RE, " ")
    .replace(PROMO_IMG_RE, " ")
    // Remaining inline images are pulled separately as gallery media by the
    // Envato import (see lib/envato.ts) — drop them from the text body.
    .replace(/<img\b[^>]*>/gi, " ")
    .replace(/<h[1-6][^>]*>/gi, "\n\n## ")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/(p|div)>/gi, "\n\n")
    // No leading newline here — the preceding </li> (or the opening <ul>)
    // already terminates the previous line, so adding one too would insert
    // a blank line between every bullet and split one list into many.
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/(li|tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<(strong|b)[^>]*>/gi, "**")
    .replace(/<\/(strong|b)>/gi, "**")
    .replace(/<[^>]+>/g, "")

  text = decodeEntities(text)

  return text
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    // Marketplace listings frequently wrap an <img> in its own <h2>/<h3> —
    // once the image is stripped that leaves a bare "##" heading with no
    // text, which would otherwise render as an empty, meaningless line.
    .filter((line) => !/^#{1,6}\s*\*{0,2}\s*$/.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

// Reduces lite-markdown back to a single line of plain text — for contexts
// that can't render structure (SEO/meta descriptions, JSON-LD, taglines).
export function stripLiteMarkdown(text: string | null | undefined): string {
  if (!text) return ""
  return text
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^-\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}
