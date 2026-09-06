import { unstable_cache } from "next/cache"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Hero } from "@/components/home/hero"
import { CategoryGrid } from "@/components/home/category-grid"
import { ProductRail } from "@/components/home/product-rail"
import { FAQSection } from "@/components/home/faq-section"
import { TrustBadges } from "@/components/home/trust-badges"
import { GamingTeaser } from "@/components/home/gaming-teaser"
import {
  getCategoryTree,
  getFeaturedProducts,
  getProducts,
  getStorefrontStats,
} from "@/lib/queries/catalog"

const cache = <T,>(fn: () => Promise<T>, key: string) => unstable_cache(fn, ["homepage-v3", key], { revalidate: 300 })

export default async function HomePage() {
  const [departments, featured, newArrivals, businessProducts, webDevProducts, designProducts, stats] = await Promise.all([
    cache(getCategoryTree, "departments")(),
    cache(() => getFeaturedProducts(10), "featured")(),
    cache(() => getProducts({ sort: "newest", limit: 10 }), "new-arrivals")(),
    cache(() => getProducts({ categorySlug: "business-office", sort: "featured", limit: 3 }), "business-office")(),
    cache(() => getProducts({ categorySlug: "web-development", sort: "featured", limit: 3 }), "web-development")(),
    cache(() => getProducts({ categorySlug: "design-resources", sort: "featured", limit: 3 }), "design-resources")(),
    cache(getStorefrontStats, "stats")(),
  ])

  const workPicks = [...businessProducts.slice(0, 2), ...webDevProducts.slice(0, 2), ...designProducts.slice(0, 2)].slice(0, 5)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero
          stats={stats}
          products={featured.slice(0, 3).map((item) => ({
            slug: item.product.slug,
            name: item.product.name,
            imageUrl: item.product.coverImageUrl ?? item.images[0]?.url ?? item.product.thumbnailUrl ?? null,
          }))}
        />

        <CategoryGrid categories={departments.filter((department) => department.productCount > 0)} />

        <ProductRail
          title="Featured right now"
          subtitle="A smaller, sharper selection of products worth seeing first — chosen from the live catalog."
          href="/products?sort=featured"
          items={featured}
        />

        <div className="border-y border-border/70 bg-secondary/18">
          <ProductRail
            title="New to DistroSource"
            subtitle="Fresh releases across templates, systems, design assets, development resources and more."
            href="/products?sort=newest"
            items={newArrivals}
          />
        </div>

        <ProductRail
          title="Build better. Work faster."
          subtitle="A cross-department edit of business, web and design products for projects that need to move."
          href="/products"
          items={workPicks}
        />

        <GamingTeaser />
        <TrustBadges />
        <FAQSection />
      </main>
      <SiteFooter />
    </div>
  )
}
