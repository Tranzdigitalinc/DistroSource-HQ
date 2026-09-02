import Link from "next/link"
import { ArrowRight, Package, Sparkles } from "lucide-react"

export function PromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
      <div
        className="relative overflow-hidden rounded-3xl border border-navy/20 px-6 py-10 sm:px-12 sm:py-14"
        style={{
          backgroundImage: "linear-gradient(135deg, var(--navy), var(--brand-blue) 130%)",
        }}
      >
        {/* Decorative grid + glow (aria-hidden) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--brand-cyan), transparent 70%)" }}
        />

        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <span className="flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Sparkles className="size-3.5 text-brand-cyan" />
              Value bundles
            </span>
            <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-white text-balance sm:text-3xl">
              Buy the bundle, keep the savings
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-base">
              Curated multi-product bundles group related templates, fonts, and assets together at one combined price.
            </p>
          </div>
          <Link
            href="/products?bundle=true"
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-navy shadow-lg transition-all hover:bg-white/90 active:scale-[0.98]"
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
