import Link from "next/link"
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
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:border-primary/40 hover:text-primary"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
