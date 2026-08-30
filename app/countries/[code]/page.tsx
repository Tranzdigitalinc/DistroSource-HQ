import { notFound } from "next/navigation"
import { CatalogPage } from "@/components/catalog/catalog-page"
import { FlagIcon } from "@/components/flag-icon"
import { getCountryByCode, getProducts } from "@/lib/queries/catalog"

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

  const products = await getProducts({
    countryCode: country.code,
    categorySlug: sp.category,
    brandSlug: sp.brand,
    search: sp.q,
    sort: (sp.sort as any) ?? "popular",
  })

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
    />
  )
}
