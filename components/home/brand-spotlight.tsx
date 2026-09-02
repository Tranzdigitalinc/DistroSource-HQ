import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Zap } from "lucide-react"
import { ProductCard } from "@/components/product/product-card"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"
import { Reveal } from "@/components/motion/reveal"
import type { getProducts, getBrandBySlug } from "@/lib/queries/catalog"

export function BrandSpotlight({
  brand,
  items,
}: {
  brand: Awaited<ReturnType<typeof getBrandBySlug>>
  items: Awaited<ReturnType<typeof getProducts>>
}) {
  if (!brand || items.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
      <Reveal className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#0f1420] via-[#131a2b] to-[#0a1420]">
        <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-12">
          <div className="flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-5">
              <span className="flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/80 ring-1 ring-inset ring-white/15">
                <Zap className="size-3.5 text-emerald-400" />
                Brand spotlight
              </span>
              <div className="flex items-center gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white p-2.5 shadow-lg">
                  <Image
                    src={brand.logoUrl || "/placeholder.svg"}
                    alt={brand.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-contain"
                  />
                </div>
                <h2 className="font-display text-3xl font-medium tracking-tight text-white text-balance sm:text-4xl">
                  {brand.name}
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-white/60 text-pretty">
                {brand.description ||
                  `Top up your ${brand.name} wallet instantly, at prices that beat retail. Every code is verified and delivered to your account in seconds.`}
              </p>
            </div>
            <Link
              href={`/brands/${brand.slug}`}
              className="flex w-fit items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0a1420] transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Shop all {brand.name}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-4" stagger={0.05}>
            {items.slice(0, 4).map((item) => (
              <RevealItem key={item.product.id}>
                <ProductCard item={item} className="shadow-xl shadow-black/30" />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Reveal>
    </section>
  )
}
