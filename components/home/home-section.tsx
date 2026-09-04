import Link from "next/link"
import { ArrowRight, ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

/**
 * The homepage's single spacing and heading system.
 *
 * Sections previously ranged from py-10 to py-24 with four different heading
 * treatments, so the page read as a stack of unrelated blocks. Everything now
 * uses one rhythm — 48px of vertical space on mobile, 64px from md — and one
 * header shape (eyebrow / title / description / optional action).
 *
 * `tone="muted"` puts the section on the secondary ground with rules above
 * and below; alternating it is what separates sections, rather than each
 * section inventing its own padding.
 */
export function HomeSection({
  eyebrow,
  title,
  description,
  action,
  tone = "default",
  className,
  headerClassName,
  children,
}: {
  eyebrow?: string
  title?: React.ReactNode
  description?: string
  action?: { label: string; href: string }
  tone?: "default" | "muted"
  className?: string
  headerClassName?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn("py-12 md:py-16", tone === "muted" && "border-y border-border bg-secondary/30", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {(title || eyebrow) && (
          <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8", headerClassName)}>
            <div className="max-w-2xl">
              {eyebrow && (
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{eyebrow}</p>
              )}
              {title && <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>}
              {description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>}
            </div>
            {action && (
              <Link
                href={action.href}
                className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {action.label}
                <ArrowRight size={ICON_SIZE.sm} aria-hidden="true" />
              </Link>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}
