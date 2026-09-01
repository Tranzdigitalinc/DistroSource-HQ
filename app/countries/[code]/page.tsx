import Link from "next/link"
import { notFound } from "next/navigation"
import { CatalogPage } from "@/components/catalog/catalog-page"
import { FlagIcon } from "@/components/flag-icon"
import { getCategories, getCountryByCode, getProducts } from "@/lib/queries/catalog"

export default async function CountryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { code } = await params
  const sp = await searchParams
  const country = await getCountryByCode(code.toUpperCase())
  if (!country) notFound()

  const [products, categories] = await Promise.all([
    getProducts({
      countryCode: country.code,
      categorySlug: sp.category,
      brandSlug: sp.brand,
      search: sp.q,
      sort: (sp.sort as any) ?? "popular",
    }),
    getCategories(),
  ])

  return (
    <CatalogPage
      title={
        <span className="flex items-center gap-2.5">
          <FlagIcon code={country.code} className="h-6 w-8" />
          Products for {country.name}
        </span>
      }
      subtitle={`Priced in ${country.currencyCode}, ready for instant delivery`}
      products={products}
      banner={
        categories.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 border-b border-primary/20 bg-muted/30 px-6 py-4 sm:px-10">
            <span className="text-xs font-medium text-muted-foreground">
              Browse categories for {country.name}:
            </span>
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}/${country.code.toLowerCase()}`}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium transition-colors hover:border-primary/40"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        ) : undefined
      }
    />
  )
}
