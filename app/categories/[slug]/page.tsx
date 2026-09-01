import Link from "next/link"
import { notFound } from "next/navigation"
import { CatalogPage } from "@/components/catalog/catalog-page"
import { FlagIcon } from "@/components/flag-icon"
import { getCategoryBySlug, getCountries, getProducts } from "@/lib/queries/catalog"
import { getCategoryIcon } from "@/lib/category-icons"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  return {
    title: `${category.name} Gift Cards & Digital Codes | RedeemCove`,
    description: category.description ?? `Shop ${category.name} gift cards and digital codes with instant delivery.`,
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

  const [products, allCountries] = await Promise.all([
    getProducts({
      categorySlug: slug,
      brandSlug: sp.brand,
      countryCode: sp.country,
      search: sp.q,
      sort: (sp.sort as any) ?? "popular",
    }),
    getCountries(),
  ])
  const popularCountries = allCountries.filter((c) => c.isPopular).slice(0, 6)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "/" },
          { "@type": "ListItem", position: 2, name: "Categories", item: "/categories" },
          { "@type": "ListItem", position: 3, name: category.name },
        ],
      }) }} />
      <CatalogPage
        title={category.name}
        subtitle={category.description ?? undefined}
        products={products}
        banner={
          <div className="relative flex w-full flex-col gap-4 overflow-hidden border-b border-primary/20 bg-[radial-gradient(circle_at_85%_-20%,hsl(var(--primary)/0.35),transparent_60%),radial-gradient(circle_at_10%_120%,hsl(var(--accent)/0.2),transparent_55%)] px-6 py-6 sm:px-10 sm:py-8">
            <div className="flex items-center gap-5">
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
            {popularCountries.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Shop {category.name} by region:</span>
                {popularCountries.map((c) => (
                  <Link
                    key={c.code}
                    href={`/categories/${category.slug}/${c.code.toLowerCase()}`}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium transition-colors hover:border-primary/40"
                  >
                    <FlagIcon code={c.code} className="h-3 w-4" />
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        }
      />
    </>
  )
}
