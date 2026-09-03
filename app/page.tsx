import { unstable_cache } from "next/cache"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Hero } from "@/components/home/hero"
import { CategoryGrid } from "@/components/home/category-grid"
import { ProductRail } from "@/components/home/product-rail"
import { FAQSection } from "@/components/home/faq-section"
import { TrustBadges } from "@/components/home/trust-badges"
import {
  getCategoryTree,
  getFeaturedProducts,
  getProducts,
  getMarketplaceStats,
} from "@/lib/queries/catalog"
import { ShopByGoal } from "@/components/home/shop-by-goal"

const cache = <T,>(fn: () => Promise<T>, key: string) => unstable_cache(fn, ["homepage", key], { revalidate: 300 })

export default async function HomePage() {
  const [departments, featured, newArrivals, businessProducts, webDevProducts, designProducts, bundleProducts, stats] =
    await Promise.all([
      cache(getCategoryTree, "departments")(),
      cache(() => getFeaturedProducts(12), "featured")(),
      cache(() => getProducts({ sort: "newest", limit: 12 }), "new-arrivals")(),
      cache(() => getProducts({ categorySlug: "business-office", sort: "featured", limit: 8 }), "business-office")(),
      cache(() => getProducts({ categorySlug: "web-development", sort: "featured", limit: 8 }), "web-development")(),
      cache(() => getProducts({ categorySlug: "design-resources", sort: "featured", limit: 8 }), "design-resources")(),
      cache(() => getProducts({ categorySlug: "product-bundles", sort: "featured", limit: 8 }), "product-bundles")(),
      cache(getMarketplaceStats, "stats")(),
    ])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero stats={stats} />
        <CategoryGrid categories={departments} />
        <ProductRail title="Featured products" href="/products" items={featured} />
        <ProductRail
          title="New releases"
          subtitle="Fresh templates, fonts, and assets just added to the catalog"
          href="/products?sort=newest"
          items={newArrivals}
        />
        <ShopByGoal />
        <ProductRail
          title="Business essentials"
          subtitle="Documents, spreadsheets, and systems that make the everyday work lighter"
          href="/categories/business-office"
          items={businessProducts}
        />
        <ProductRail
          title="Web & development"
          subtitle="Site templates, UI kits, and code starters for your next build"
          href="/categories/web-development"
          items={webDevProducts}
        />
        <ProductRail
          title="Design resources"
          subtitle="Graphics, mockups, and brand assets with a point of view"
          href="/categories/design-resources"
          items={designProducts}
        />
        <ProductRail
          title="Digital bundles"
          subtitle="Curated collections that cost less than buying each file on its own"
          href="/categories/product-bundles"
          items={bundleProducts}
        />
        <TrustBadges />
        <FAQSection />
      </main>
      <SiteFooter />
    </div>
  )
}
