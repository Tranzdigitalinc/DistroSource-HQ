import type { ReactNode } from "react"

/**
 * Pure section parsing, kept out of the `"use client"` component so a Server
 * Component (the product page) can call it. Client modules can only be
 * rendered from the server, not invoked — calling parseSections() from the
 * page crashed the route.
 */

export interface ProductSection {
  id: string
  title: string
  /** Either markdown text (rendered with LiteMarkdown) or a ready element. */
  body: string | ReactNode
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

/** Splits `## Heading` light-markdown into sections. Side-effect free. */
export function parseSections(markdown: string): ProductSection[] {
  const out: ProductSection[] = []
  let current: { title: string; lines: string[] } | null = null

  for (const raw of markdown.split("\n")) {
    const line = raw.trimEnd()
    if (line.startsWith("## ")) {
      if (current) out.push({ id: slugify(current.title), title: current.title, body: current.lines.join("\n").trim() })
      current = { title: line.slice(3).trim(), lines: [] }
    } else if (current) {
      current.lines.push(line)
    }
  }
  if (current) out.push({ id: slugify(current.title), title: current.title, body: current.lines.join("\n").trim() })
  return out.filter((s) => (typeof s.body === "string" ? s.body.length > 0 : true))
}
