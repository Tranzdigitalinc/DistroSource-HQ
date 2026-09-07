import type { ReactNode } from "react"
import Link from "next/link"
import { SplitText } from "@/components/motion/split-text"
import { cn } from "@/lib/utils"

/**
 * Editorial page/section header: mono eyebrow, heavy title, one line of
 * support copy, optional action on the right. Used by every storefront
 * listing so titles line up the same way everywhere. String titles typeset
 * themselves word by word as they scroll into view.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  size = "page",
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  size?: "page" | "section"
  className?: string
}) {
  const titleClass = size === "page" ? "text-display text-3xl sm:text-4xl lg:text-5xl" : "text-title text-2xl sm:text-3xl"
  const heading =
    typeof title === "string" ? (
      <SplitText as={size === "page" ? "h1" : "h2"} text={title} className={titleClass} inView={size !== "page"} stagger={0.04} />
    ) : size === "page" ? (
      <h1 className={titleClass}>{title}</h1>
    ) : (
      <h2 className={titleClass}>{title}</h2>
    )

  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-8 gap-y-4", className)}>
      <div className="min-w-0 max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        {heading}
        {description && <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  )
}

/** The "View all →" link used beside section headers. */
export function SectionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:border-border-strong hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
    </Link>
  )
}
