import Link from "next/link"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { getBrands } from "@/lib/queries/catalog"

export default async function BrandsPage() {
  const brands = await getBrands()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
          <h1 className="font-display text-3xl font-bold tracking-tight">All brands</h1>
          <p className="mt-1 text-sm text-muted-foreground">{brands.length} brands available on RedeemCove</p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-6 text-center transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <span className="font-display text-sm font-bold">{brand.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
