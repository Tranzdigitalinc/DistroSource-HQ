import { notFound } from "next/navigation"
import { CatalogPage } from "@/components/catalog/catalog-page"
import { getCategoryBySlug, getProducts } from "@/lib/queries/catalog"
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

  const products = await getProducts({
    categorySlug: slug,
    search: sp.q,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    sort: (sp.sort as any) ?? "featured",
  })

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
        banner={
          <div className="relative flex w-full flex-col gap-4 overflow-hidden border-b border-primary/20 bg-[radial-gradient(circle_at_85%_-20%,hsl(var(--primary)/0.35),transparent_60%),radial-gradient(circle_at_10%_120%,hsl(var(--accent)/0.2),transparent_55%)] px-6 py-6 sm:px-10 sm:py-8">
            <div className="flex items-center gap-5">
              <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
                {(() => {
                  const Icon = getCategoryIcon(category.slug)
                  return <Icon aria-hidden="true" />
                })()}
              </div>
              <div className="flex flex-col gap-1">
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
