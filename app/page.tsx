import { unstable_cache } from "next/cache"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Hero } from "@/components/home/hero"
import { CategoryGrid } from "@/components/home/category-grid"
import { QuickCategoryNav } from "@/components/home/quick-category-nav"
import { ProductRail } from "@/components/home/product-rail"
import { HowItWorks } from "@/components/home/how-it-works"
import { FAQSection } from "@/components/home/faq-section"
import { TrustBadges } from "@/components/home/trust-badges"
import {
  getCategories,
  getFeaturedProducts,
  getDealProducts,
  getProducts,
  getMarketplaceStats,
  getTopReviews,
} from "@/lib/queries/catalog"
import { Testimonials } from "@/components/home/testimonials"
import { ShopByGoal } from "@/components/home/shop-by-goal"
import { ShopByPrice } from "@/components/home/shop-by-price"

const cache = <T,>(fn: () => Promise<T>, key: string) => unstable_cache(fn, ["homepage", key], { revalidate: 300 })

export default async function HomePage() {
  const [categories, featured, deals, newArrivals, topRated, stats, topReviews] = await Promise.all([
    cache(getCategories, "categories")(),
    cache(() => getFeaturedProducts(12), "featured")(),
    cache(() => getDealProducts(12), "deals")(),
    cache(() => getProducts({ sort: "newest", limit: 12 }), "new-arrivals")(),
    cache(() => getProducts({ sort: "rating", limit: 12 }), "top-rated")(),
    cache(getMarketplaceStats, "stats")(),
    cache(() => getTopReviews(9), "reviews")(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero stats={stats} />
        <QuickCategoryNav categories={categories} />
        <ShopByGoal />
        <CategoryGrid categories={categories} />
        <ProductRail title="Featured products" href="/products" items={featured} />
        <ProductRail
          title="New arrivals"
          subtitle="Fresh templates, fonts, and assets just added to the catalog"
          href="/products?sort=newest"
          items={newArrivals}
        />
        <ProductRail
          title="Today's deals"
          subtitle="Limited-time discounts across our top categories"
          href="/deals"
          items={deals}
          variant="deals"
        />
        <ShopByPrice />
        <ProductRail
          title="Top rated by customers"
          subtitle="Highest-reviewed products across the marketplace"
          href="/products?sort=rating"
          items={topRated}
        />
        <HowItWorks />
        <Testimonials reviews={topReviews} stats={stats} />
        <FAQSection />
        <TrustBadges />
      </main>
      <SiteFooter />
    </div>
  )
}
