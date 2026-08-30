import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Zap, Globe2 } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 30%, oklch(0.72 0.14 220 / 0.45), transparent 45%), radial-gradient(circle at 85% 80%, oklch(0.6 0.15 240 / 0.35), transparent 45%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
        <div className="flex flex-col gap-6">
          <span className="w-fit rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium text-primary-foreground/90 ring-1 ring-inset ring-primary-foreground/20">
            Trusted by 2M+ shoppers worldwide
          </span>
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-primary-foreground text-balance sm:text-5xl lg:text-6xl">
            Gift cards & digital codes, delivered instantly
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-primary-foreground/75 text-pretty">
            Top up games, stream more, and shop your favorite brands — all from one marketplace with instant
            delivery to your inbox and account.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              className="h-12 bg-primary-foreground px-6 font-semibold text-primary hover:bg-primary-foreground/90"
              render={<Link href="/products" />}
            >
              Browse all products
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="h-12 border-primary-foreground/25 bg-transparent px-6 font-semibold text-primary-foreground hover:bg-primary-foreground/10"
              render={<Link href="/deals" />}
            >
              View today&apos;s deals
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-primary-foreground/70">
            <span className="flex items-center gap-1.5">
              <Zap className="size-4 text-accent" /> Instant delivery
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-accent" /> Secure checkout
            </span>
            <span className="flex items-center gap-1.5">
              <Globe2 className="size-4 text-accent" /> 190+ countries
            </span>
          </div>
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
