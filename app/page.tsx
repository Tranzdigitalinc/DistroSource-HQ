import { unstable_cache } from "next/cache"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { V4Hero } from "@/components/v4/hero"
import { V4CategoryBento } from "@/components/v4/category-bento"
import { V4ProductCarousel } from "@/components/v4/product-carousel"
import { V4ValueBand } from "@/components/v4/value-band"
import { V4GamingFeature } from "@/components/v4/gaming-feature"
import { V4FAQ } from "@/components/v4/faq"
import { getCategoryTree, getFeaturedProducts, getProducts, getStorefrontStats } from "@/lib/queries/catalog"

const cache = <T,>(fn: () => Promise<T>, key: string) => unstable_cache(fn, ["homepage-v4", key], { revalidate: 300 })

export default async function HomePage() {
  const [departments, featured, newArrivals, business, design, development, stats] = await Promise.all([
    cache(getCategoryTree, "departments")(),
    cache(() => getFeaturedProducts(12), "featured")(),
    cache(() => getProducts({ sort: "newest", limit: 12 }), "new-arrivals")(),
    cache(() => getProducts({ categorySlug: "business-office", sort: "featured", limit: 6 }), "business")(),
    cache(() => getProducts({ categorySlug: "design-resources", sort: "featured", limit: 6 }), "design")(),
    cache(() => getProducts({ categorySlug: "web-development", sort: "featured", limit: 6 }), "development")(),
    cache(getStorefrontStats, "stats")(),
  ])

  const visibleDepartments = departments.filter((department) => department.productCount > 0)
  const buildCollection = [...design, ...development].filter(
    (item, index, collection) => collection.findIndex((candidate) => candidate.product.id === item.product.id) === index,
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <V4Hero
          stats={stats}
          departments={visibleDepartments}
          products={featured.slice(0, 5).map((item) => ({
            slug: item.product.slug,
            name: item.product.name,
            imageUrl: item.product.coverImageUrl ?? item.images[0]?.url ?? item.product.thumbnailUrl ?? null,
          }))}
        />

        <V4CategoryBento categories={visibleDepartments} />

        <V4ProductCarousel
          eyebrow="The DistroSource edit"
          title="Start with the standouts."
          description="A rotating edit of digital products worth putting in front of you first — chosen from across the catalog, not trapped inside one department."
          href="/products"
          items={featured}
          featuredFirst
        />

        <V4ValueBand />

        <V4ProductCarousel
          eyebrow="Just landed"
          title="New in the store."
          description="Fresh releases, updated tools and new digital resources entering the catalog now."
          href="/products?sort=newest"
          items={newArrivals}
        />

        <V4ProductCarousel
          eyebrow="Build & create"
          title="For the next thing on your screen."
          description="Web, UI and design resources grouped around the work itself instead of forcing you through separate aisles."
          href="/categories/web-development"
          items={buildCollection}
          featuredFirst
        />

        <V4GamingFeature />

        <V4ProductCarousel
          eyebrow="Work smarter"
          title="Business systems without the busywork."
          description="Documents, spreadsheets, templates and practical systems designed to make everyday work move faster."
          href="/categories/business-office"
          items={business}
        />

        <V4FAQ />
      </main>
      <SiteFooter />
    </div>
  )
}
