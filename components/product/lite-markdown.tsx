import type { ReactNode } from "react"

// Renders the small markdown-like format produced by lib/html-to-text.ts
// (## headings, - bullets, **bold**, bare URLs) into properly arranged React
// elements. Deliberately not dangerouslySetInnerHTML — every character of
// the source text ends up as a plain string inside JSX, so third-party
// marketplace copy can never inject markup.
const INLINE_RE = /\*\*(.+?)\*\*/g

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let i = 0
  INLINE_RE.lastIndex = 0
  while ((match = INLINE_RE.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    if (match[1] !== undefined) {
      parts.push(
        <strong key={`${keyPrefix}-b-${i++}`} className="font-semibold text-foreground">
          {match[1]}
        </strong>,
      )
    }
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

export function LiteMarkdown({ text, className }: { text: string; className?: string }) {
  if (!text?.trim()) return null

  const blocks: ReactNode[] = []
  let listBuffer: string[] = []
  let key = 0

  function flushList() {
    if (listBuffer.length === 0) return
    const items = listBuffer
    blocks.push(
      <ul key={`ul-${key++}`} className="grid gap-3 rounded-sm border border-border bg-muted/20 px-4 py-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>{renderInline(item, `li-${key}-${i}`)}</span>
          </li>
        ))}
      </ul>,
    )
    listBuffer = []
  }

  const normalizedText = text
    .replace(/\s+(?=##\s)/g, "\n")
    .replace(/\s+(?=-\s)/g, "\n")
    .replace(/\s+(?=V\s?\d+\.\d+)/g, "\n")

  for (const rawLine of normalizedText.split("\n")) {
    const line = rawLine.trim()
    if (!line) {
      flushList()
      continue
    }
    if (line.startsWith("## ")) {
      flushList()
      const heading = line.slice(3).trim()
      if (heading) {
        blocks.push(
          <h3 key={`h-${key++}`}             className="border-b border-primary/40 pb-2 font-display text-lg font-bold text-foreground first:pt-0">
            {renderInline(heading, `h-${key}`)}
          </h3>,
        )
      }
    } else if (line.startsWith("- ")) {
      listBuffer.push(line.slice(2))
    } else {
      flushList()
      blocks.push(
        <p key={`p-${key++}`} className="max-w-2xl text-sm leading-7 text-muted-foreground">
          {renderInline(line, `p-${key}`)}
        </p>,
      )
    }
  }
  flushList()

  return <div className={className}>{blocks}</div>
}
