import { notFound } from "next/navigation"
import Image from "next/image"
import { CatalogPage } from "@/components/catalog/catalog-page"
import { getCategoryBySlug, getProducts } from "@/lib/queries/catalog"
import { getCategoryImage } from "@/lib/category-icons"

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { slug } = await params
  const sp = await searchParams
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const products = await getProducts({
    categorySlug: slug,
    brandSlug: sp.brand,
    countryCode: sp.country,
    search: sp.q,
    sort: (sp.sort as any) ?? "popular",
  })

  return (
    <CatalogPage
      title={category.name}
      subtitle={category.description}
      products={products}
      banner={
        <div className="relative h-40 w-full overflow-hidden sm:h-52">
          <Image src={getCategoryImage(category.slug)} alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      }
    />
  )
}
