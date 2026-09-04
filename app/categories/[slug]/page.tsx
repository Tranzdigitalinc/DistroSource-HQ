import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "@/lib/storefront-icons"
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

// Query params that narrow the result set. Their presence decides whether an
// empty grid means "your filters excluded everything" or "nothing is
// published here yet" — two different messages.
const FILTER_KEYS = ["q", "free", "bundle", "deal", "maxPrice", "format", "minRating"] as const

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

  const filtered = FILTER_KEYS.some((k) => !!sp[k])

  const [products, { department, subcategories }] = await Promise.all([
    getProducts({
      categorySlug: slug,
      search: sp.q,
      free: sp.free === "true",
      bundle: sp.bundle === "true",
      deal: sp.deal === "true",
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      format: sp.format,
      minRating: sp.minRating ? Number(sp.minRating) : undefined,
      sort: (sp.sort as any) ?? "featured",
    }),
    getCategoryNavContext(category),
  ])

  const Icon = getCategoryIcon(category.slug)
  const isDepartment = category.parentId === null

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
        clearHref={filtered ? `/categories/${slug}` : undefined}
        emptyState={
          filtered
            ? undefined
            : {
                title: `No products in ${category.name} yet`,
                description: "Nothing is published in this category right now. Browse the rest of the department or the full catalog.",
              }
        }
        categoryPillBar={
          department ? <SubcategoryNav department={department} subcategories={subcategories} activeSlug={slug} /> : null
        }
        banner={
          <div className="border-b border-border bg-secondary/40">
            <nav aria-label="Breadcrumb" className="mx-auto flex w-full max-w-7xl items-center gap-1.5 px-4 pt-4 text-xs text-muted-foreground sm:px-6">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <ChevronRight size={12} aria-hidden="true" />
              <Link href="/categories" className="hover:text-foreground">Departments</Link>
              {department && !isDepartment && (
                <>
                  <ChevronRight size={12} aria-hidden="true" />
                  <Link href={`/categories/${department.slug}`} className="hover:text-foreground">{department.name}</Link>
                </>
              )}
              <ChevronRight size={12} aria-hidden="true" />
              <span className="font-medium text-foreground">{category.name}</span>
            </nav>
            <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-5 sm:px-6 sm:py-6">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground sm:size-14">
                <Icon aria-hidden="true" className="size-6" />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {isDepartment ? "Department" : department ? department.name : "Category"}
                </p>
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{category.name}</h1>
                {category.description ? (
                  <p className="mt-1 max-w-xl text-sm text-muted-foreground text-pretty">{category.description}</p>
                ) : null}
              </div>
            </div>
          </div>
        }
      />
    </>
  )
}
