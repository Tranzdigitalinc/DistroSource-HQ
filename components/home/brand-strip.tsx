import Link from "next/link"
import Image from "next/image"
import { Reveal } from "@/components/motion/reveal"
import type { getBrands } from "@/lib/queries/catalog"

export function BrandStrip({ brands }: { brands: Awaited<ReturnType<typeof getBrands>> }) {
  const withLogos = brands.filter((b) => b.logoUrl)
  if (withLogos.length === 0) return null

  return (
    <section className="border-y border-border bg-secondary/30 py-10">
      <Reveal>
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Trusted by shoppers buying codes from {withLogos.length}+ brand partners
        </p>
      </Reveal>
      <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="animate-marquee flex w-max items-center gap-3">
          {[...withLogos, ...withLogos].map((brand, i) => (
            <Link
              key={`${brand.slug}-${i}`}
              href={`/brands/${brand.slug}`}
              className="flex shrink-0 items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground/80 transition-all duration-200 hover:border-accent/40 hover:text-foreground hover:shadow-md hover:shadow-accent/10"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/5">
                <Image
                  src={brand.logoUrl || "/placeholder.svg"}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 object-contain"
                />
              </span>
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
