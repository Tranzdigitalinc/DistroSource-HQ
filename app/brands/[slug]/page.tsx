import { notFound } from "next/navigation"
import { CatalogPage } from "@/components/catalog/catalog-page"
import { getBrandBySlug, getProducts } from "@/lib/queries/catalog"

export default async function BrandDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { slug } = await params
  const sp = await searchParams
  const brand = await getBrandBySlug(slug)
  if (!brand) notFound()

  const products = await getProducts({
    brandSlug: slug,
    categorySlug: sp.category,
    countryCode: sp.country,
    search: sp.q,
    sort: (sp.sort as any) ?? "popular",
  })

  return (
    <CatalogPage
      title={brand.name}
      subtitle={brand.description ?? `Shop gift cards and codes from ${brand.name}`}
      products={products}
    />
  )
}
