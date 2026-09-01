import { unstable_cache } from "next/cache"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Hero } from "@/components/home/hero"
import { CategoryGrid } from "@/components/home/category-grid"
import { QuickCategoryNav } from "@/components/home/quick-category-nav"
import { CountdownBanner } from "@/components/home/countdown-banner"
import { ProductRail } from "@/components/home/product-rail"
import { BrandSpotlight } from "@/components/home/brand-spotlight"
import { BrandStrip } from "@/components/home/brand-strip"
import { HowItWorks } from "@/components/home/how-it-works"
import { FAQSection } from "@/components/home/faq-section"
import { TrustBadges } from "@/components/home/trust-badges"
import {
  getCategories,
  getBrands,
  getBrandBySlug,
  getFeaturedProducts,
  getDealProducts,
  getProducts,
  getMarketplaceStats,
  getTopReviews,
} from "@/lib/queries/catalog"
import { Testimonials } from "@/components/home/testimonials"

const SPOTLIGHT_BRAND_SLUG = "steam-72"

const cache = <T,>(fn: () => Promise<T>, key: string) => unstable_cache(fn, ["homepage", key], { revalidate: 300 })

export default async function HomePage() {
  const [categories, brands, featured, deals, newArrivals, topRated, stats, topReviews, spotlightBrand, spotlightProducts] =
    await Promise.all([
      cache(getCategories, "categories")(),
      cache(getBrands, "brands")(),
      cache(() => getFeaturedProducts(12), "featured")(),
      cache(() => getDealProducts(12), "deals")(),
      cache(() => getProducts({ sort: "newest", limit: 12 }), "new-arrivals")(),
      cache(() => getProducts({ sort: "rating", limit: 12 }), "top-rated")(),
      cache(getMarketplaceStats, "stats")(),
      cache(() => getTopReviews(9), "reviews")(),
      cache(() => getBrandBySlug(SPOTLIGHT_BRAND_SLUG), "spotlight-brand")(),
      cache(() => getProducts({ brandSlug: SPOTLIGHT_BRAND_SLUG, sort: "rating", limit: 4 }), "spotlight-products")(),
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
        <BrandSpotlight brand={spotlightBrand} items={spotlightProducts} />
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
        <HowItWorks />
        <Testimonials reviews={topReviews} stats={stats} />
        <FAQSection />
        <TrustBadges />
      </main>
      <SiteFooter />
    </div>
  )
}
