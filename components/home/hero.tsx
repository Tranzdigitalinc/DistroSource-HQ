import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Star } from "lucide-react"

interface HeroStats {
  productCount: number
  brandCount: number
  countryCount: number
  reviewCount: number
  avgRating: number
}

function formatCount(value: number) {
  if (value >= 1000) return `${Math.floor(value / 100) / 10}k`
  return `${value}`
}

export function Hero({ stats }: { stats: HeroStats }) {
  return (
    <section className="relative overflow-hidden bg-hero">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 30%, oklch(0.72 0.14 220 / 0.45), transparent 45%), radial-gradient(circle at 85% 80%, oklch(0.6 0.15 240 / 0.35), transparent 45%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 sm:px-8 lg:grid-cols-2 lg:py-20">
        <div className="flex flex-col gap-6">
          <span className="flex w-fit items-center gap-1.5 rounded-full bg-hero-foreground/10 px-3 py-1 text-xs font-medium text-hero-foreground/90 ring-1 ring-inset ring-hero-foreground/20">
            <ShieldCheck className="size-3.5 text-hero-accent" />
            Verified codes, sourced from authorized distributors
          </span>
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-hero-foreground text-balance sm:text-5xl lg:text-6xl">
            Gift cards & digital codes, delivered instantly
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-hero-foreground/75 text-pretty">
            Top up games, stream more, and shop your favorite brands — all from one marketplace with instant
            delivery to your inbox and account.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              className="h-12 bg-hero-foreground px-6 font-semibold text-hero hover:bg-hero-foreground/90"
              render={<Link href="/products" />}
            >
              Browse all products
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="h-12 border-hero-foreground/25 bg-transparent px-6 font-semibold text-hero-foreground hover:bg-hero-foreground/10"
              render={<Link href="/deals" />}
            >
              View today&apos;s deals
            </Button>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-hero-foreground/15 pt-5 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-hero-foreground/60">Products</dt>
              <dd className="font-display text-xl font-bold text-hero-foreground">
                {formatCount(stats.productCount)}+
              </dd>
            </div>
            <div>
              <dt className="text-xs text-hero-foreground/60">Brands</dt>
              <dd className="font-display text-xl font-bold text-hero-foreground">{stats.brandCount}+</dd>
            </div>
            <div>
              <dt className="text-xs text-hero-foreground/60">Countries</dt>
              <dd className="font-display text-xl font-bold text-hero-foreground">{stats.countryCount}</dd>
            </div>
            <div>
              <dt className="text-xs text-hero-foreground/60">Customer rating</dt>
              <dd className="flex items-center gap-1 font-display text-xl font-bold text-hero-foreground">
                {stats.avgRating.toFixed(1)}
                <Star className="size-4 fill-hero-accent text-hero-accent" />
                <span className="text-xs font-normal text-hero-foreground/60">
                  ({formatCount(stats.reviewCount)})
                </span>
              </dd>
            </div>
          </dl>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl lg:max-w-lg">
          <Image
            src="/hero-cards.png"
            alt="A collection of glossy digital gift cards"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 90vw, 40vw"
          />
        </div>
      </div>
    </section>
  )
}
