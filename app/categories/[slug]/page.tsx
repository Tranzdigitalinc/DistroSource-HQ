import { notFound } from "next/navigation"
import { CatalogPage } from "@/components/catalog/catalog-page"
import { getCategoryBySlug, getProducts } from "@/lib/queries/catalog"
import { getCategoryIcon } from "@/lib/category-icons"

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
      subtitle={category.description ?? undefined}
      products={products}
      banner={
        <div className="relative flex h-40 w-full items-center gap-5 overflow-hidden border-b border-primary/20 bg-[radial-gradient(circle_at_85%_-20%,hsl(var(--primary)/0.35),transparent_60%),radial-gradient(circle_at_10%_120%,hsl(var(--accent)/0.2),transparent_55%)] px-6 sm:h-52 sm:px-10">
          <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
            {(() => { const Icon = getCategoryIcon(category.name); return <Icon aria-hidden="true" /> })()}
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{category.name}</h1>
            {category.description ? (
              <p className="max-w-xl text-sm text-muted-foreground">{category.description}</p>
            ) : null}
          </div>
        </div>
      }
    />
  )
}
