import Link from "next/link"
import Image from "next/image"
import type { getBrands } from "@/lib/queries/catalog"

export function BrandStrip({ brands }: { brands: Awaited<ReturnType<typeof getBrands>> }) {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <p className="mb-5 text-center text-sm font-medium text-muted-foreground">
          Featured brands available on RedeemCove
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:border-primary/40 hover:text-primary"
            >
              {brand.logoUrl && (
                <span className="flex size-5 items-center justify-center rounded-full bg-white">
                  <Image
                    src={brand.logoUrl || "/placeholder.svg"}
                    alt=""
                    width={16}
                    height={16}
                    className="size-4 object-contain"
                  />
                </span>
              )}
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
