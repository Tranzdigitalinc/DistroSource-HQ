import type { ReactNode } from "react"

// Renders the small markdown-like format produced by lib/html-to-text.ts
// (## headings, - bullets, **bold**, bare URLs) into properly arranged React
// elements. Deliberately not dangerouslySetInnerHTML — every character of
// the source text ends up as a plain string inside JSX, so third-party
// marketplace copy can never inject markup.
const INLINE_RE = /\*\*(.+?)\*\*|(https?:\/\/[^\s)]+)/g

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
    } else if (match[2] !== undefined) {
      parts.push(
        <a
          key={`${keyPrefix}-l-${i++}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {match[2]}
        </a>,
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
      <ul key={`ul-${key++}`} className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-baseline gap-2 text-sm leading-relaxed text-muted-foreground">
            <span className="select-none text-primary" aria-hidden="true">
              —
            </span>
            <span>{renderInline(item, `li-${key}-${i}`)}</span>
          </li>
        ))}
      </ul>,
    )
    listBuffer = []
  }

  for (const rawLine of text.split("\n")) {
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
          <h3 key={`h-${key++}`} className="font-display text-base font-bold text-foreground">
            {renderInline(heading, `h-${key}`)}
          </h3>,
        )
      }
    } else if (line.startsWith("- ")) {
      listBuffer.push(line.slice(2))
    } else {
      flushList()
      blocks.push(
        <p key={`p-${key++}`} className="text-sm leading-relaxed text-muted-foreground">
          {renderInline(line, `p-${key}`)}
        </p>,
      )
    }
  }
  flushList()

  return <div className={className}>{blocks}</div>
}
