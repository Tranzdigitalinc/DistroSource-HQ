import Link from "next/link"
import { ArrowRight, Package, Sparkles } from "lucide-react"

export function PromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
      <div className="relative overflow-hidden border border-navy bg-navy px-6 py-10 sm:px-12 sm:py-14">
        {/* Fine grid texture — matches the hero's catalog graph-paper base */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <span className="flex w-fit items-center gap-1.5 border border-navy-foreground/25 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-navy-foreground">
              <Sparkles className="size-3.5 text-primary" />
              Value bundles
            </span>
            <h2 className="mt-4 font-display text-2xl font-black tracking-tight text-navy-foreground text-balance sm:text-3xl">
              Buy the bundle, keep the savings
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-foreground/70 sm:text-base">
              Curated multi-product bundles group related templates, fonts, and assets together at one combined price.
            </p>
          </div>
          <Link
            href="/products?bundle=true"
            className="group inline-flex shrink-0 items-center gap-2 rounded-[4px] bg-primary px-6 py-3 font-mono text-sm font-semibold uppercase tracking-[0.04em] text-primary-foreground transition-transform hover:bg-primary/90 active:scale-[0.98]"
          >
            <Package className="size-4" />
            Browse bundles
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
