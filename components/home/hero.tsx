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
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 20%, oklch(0.7 0.15 55 / 0.18), transparent 45%), radial-gradient(circle at 88% 85%, oklch(0.7 0.15 55 / 0.12), transparent 45%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
        <div className="flex flex-col gap-7">
          <span className="flex w-fit items-center gap-1.5 rounded-full bg-hero-foreground/10 px-3 py-1 text-xs font-medium text-hero-foreground/90 ring-1 ring-inset ring-hero-foreground/20">
            <ShieldCheck className="size-3.5 text-hero-accent" />
            Verified codes, sourced from authorized distributors
          </span>
          <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-hero-foreground text-balance sm:text-6xl lg:text-[4.25rem]">
            Gift cards & digital codes, <em className="italic text-hero-accent">delivered instantly</em>
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-hero-foreground/70 text-pretty">
            Top up games, stream more, and shop your favorite brands — all from one marketplace with instant
            delivery to your inbox and account.
          </p>
          <div className="flex flex-wrap items-center gap-4">
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

          <div className="mt-2 flex items-center gap-2 text-sm text-hero-foreground/65">
            <span className="flex items-center gap-1 font-display font-semibold text-hero-foreground">
              {stats.avgRating.toFixed(1)}
              <Star className="size-3.5 fill-hero-accent text-hero-accent" />
            </span>
            <span>from {formatCount(stats.reviewCount)} reviews across</span>
            <span className="font-semibold text-hero-foreground">{stats.brandCount}+ brands</span>
            <span aria-hidden="true">·</span>
            <span>{stats.countryCount} countries</span>
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl shadow-2xl shadow-black/40 lg:max-w-lg">
          <Image
            src="/hero-cards.png"
            alt="A collection of premium gift cards fanned across a warm walnut surface"
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
