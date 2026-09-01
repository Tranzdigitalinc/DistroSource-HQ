import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Hero } from "@/components/home/hero"
import { CategoryGrid } from "@/components/home/category-grid"
import { QuickCategoryNav } from "@/components/home/quick-category-nav"
import { CountdownBanner } from "@/components/home/countdown-banner"
import { ProductRail } from "@/components/home/product-rail"
import { BrandStrip } from "@/components/home/brand-strip"
import { TrustBadges } from "@/components/home/trust-badges"
import {
  getCategories,
  getBrands,
  getFeaturedProducts,
  getDealProducts,
  getProducts,
  getMarketplaceStats,
  getTopReviews,
} from "@/lib/queries/catalog"
import { Testimonials } from "@/components/home/testimonials"

export default async function HomePage() {
  const [categories, brands, featured, deals, newArrivals, topRated, stats, topReviews] = await Promise.all([
    getCategories(),
    getBrands(),
    getFeaturedProducts(12),
    getDealProducts(12),
    getProducts({ sort: "newest", limit: 12 }),
    getProducts({ sort: "rating", limit: 12 }),
    getMarketplaceStats(),
    getTopReviews(9),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <CountdownBanner />
      <SiteHeader />
      <main className="flex-1">
        <Hero stats={stats} />
        <QuickCategoryNav categories={categories} />
        <CategoryGrid categories={categories} />
        <ProductRail title="Featured products" href="/products" items={featured} />
        <ProductRail
          title="New arrivals"
          subtitle="Fresh codes and cards just added to the catalog"
          href="/products?sort=newest"
          items={newArrivals}
        />
        <BrandStrip brands={brands} />
        <ProductRail
          title="Today's deals"
          subtitle="Limited-time discounts across our top brands"
          href="/deals"
          items={deals}
          variant="deals"
        />
        <ProductRail
          title="Top rated by customers"
          subtitle="Highest-reviewed products across the marketplace"
          href="/products?sort=rating"
          items={topRated}
        />
        <Testimonials reviews={topReviews} stats={stats} />
        <TrustBadges />
      </main>
      <SiteFooter />
    </div>
  )
}
