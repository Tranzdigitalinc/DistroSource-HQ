import { notFound } from "next/navigation"
import { CatalogPage } from "@/components/catalog/catalog-page"
import { SubcategoryNav } from "@/components/catalog/subcategory-nav"
import { getCategoryBySlug, getCategoryNavContext, getProducts } from "@/lib/queries/catalog"
import { getCategoryIcon } from "@/lib/category-icons"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  return {
    title: category.seoTitle ?? `${category.name} | DistroSource`,
    description: category.seoDescription ?? category.description ?? `Shop ${category.name} on DistroSource.`,
  }
}

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

  const [products, { department, subcategories }] = await Promise.all([
    getProducts({
      categorySlug: slug,
      search: sp.q,
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      format: sp.format,
      minRating: sp.minRating ? Number(sp.minRating) : undefined,
      sort: (sp.sort as any) ?? "featured",
    }),
    getCategoryNavContext(category),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "Categories", item: "/categories" },
              { "@type": "ListItem", position: 3, name: category.name },
            ],
          }),
        }}
      />
      <CatalogPage
        title={category.name}
        subtitle={category.description ?? undefined}
        products={products}
        categoryPillBar={
          department ? <SubcategoryNav department={department} subcategories={subcategories} activeSlug={slug} /> : null
        }
        banner={
          <div className="relative flex w-full flex-col gap-4 border-b border-border bg-secondary/40 px-6 py-6 sm:px-10 sm:py-8">
            <div className="mx-auto flex w-full max-w-7xl items-center gap-5">
              <div className="flex size-16 shrink-0 items-center justify-center border border-border bg-card text-primary">
                {(() => {
                  const Icon = getCategoryIcon(category.slug)
                  return <Icon aria-hidden="true" className="size-7" />
                })()}
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">Category</p>
                <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{category.name}</h1>
                {category.description ? (
                  <p className="max-w-xl text-sm text-muted-foreground">{category.description}</p>
                ) : null}
              </div>
            </div>
          </div>
        }
      />
    </>
  )
}
