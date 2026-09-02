import Link from "next/link"
import { ArrowRight, Gift, Coins, Wallet, Layers } from "@/lib/storefront-icons"
import { TextShimmer } from "@/components/velora/text-shimmer"
import { BlurFade } from "@/components/velora/blur-fade"

const tiers = [
  {
    label: "Free this week",
    detail: "Zero-cost files to try before you buy",
    href: "/products?free=true",
    icon: Gift,
  },
  {
    label: "Under $10",
    detail: "Small-budget wins across every category",
    href: "/products?maxPrice=10&sort=price-asc",
    icon: Coins,
  },
  {
    label: "Under $25",
    detail: "Premium assets that still leave room to spare",
    href: "/products?maxPrice=25&sort=price-asc",
    icon: Wallet,
  },
  {
    label: "Value bundles",
    detail: "Multi-file packs priced below the sum of parts",
    href: "/products?bundle=true",
    icon: Layers,
  },
]

export function ShopByPrice() {
  return (
    <section className="border-y border-border bg-surface-soft">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Shop by budget</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Find something at every price
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Filtered live from the catalog — every link lands on real, in-stock files.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map(({ label, detail, href, icon: Icon }, i) => (
            <BlurFade key={label} delay={i * 0.06}>
              <Link href={href} className="group flex items-center gap-4 bg-card p-4 transition-colors hover:bg-background">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-[4px] bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 font-display font-bold tracking-tight">
                    {i === 0 ? <TextShimmer>{label}</TextShimmer> : label}
                    <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] leading-relaxed text-muted-foreground">{detail}</span>
                </span>
              </Link>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}
