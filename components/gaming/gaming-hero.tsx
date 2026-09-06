import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Lock, ICON_SIZE } from "@/lib/storefront-icons"

/**
 * Shared hero for the Gaming department.
 *
 * Stays on the storefront's light ground: Gaming is a department of
 * DistroSource, not a separate dark-mode microsite. The energy comes from
 * the accent rule and the grid, not from neon or glow.
 */
export function GamingHero({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  trustLine,
}: {
  eyebrow: string
  title: string
  description: string
  primary?: { label: string; href: string }
  secondary?: { label: string; href: string }
  trustLine?: string
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-hero">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(120%_90%_at_50%_0%,black,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-8 md:py-20">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <span className="h-px w-6 bg-primary" aria-hidden="true" />
            {eyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-hero-foreground text-balance sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">{description}</p>

          {(primary || secondary) && (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {primary && (
                <Button size="lg" className="h-11 px-6 font-semibold" nativeButton={false} render={<Link href={primary.href} />}>
                  {primary.label}
                  <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
                </Button>
              )}
              {secondary && (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 bg-transparent px-6 font-semibold"
                  nativeButton={false}
                  render={<Link href={secondary.href} />}
                >
                  {secondary.label}
                </Button>
              )}
            </div>
          )}

          {trustLine && (
            <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock size={ICON_SIZE.sm} aria-hidden="true" />
              {trustLine}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
