import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Hero } from "@/components/home/hero"
import { CategoryGrid } from "@/components/home/category-grid"
import { ProductRail } from "@/components/home/product-rail"
import { BrandStrip } from "@/components/home/brand-strip"
import { TrustBadges } from "@/components/home/trust-badges"
import { getCategories, getBrands, getFeaturedProducts, getDealProducts } from "@/lib/queries/catalog"

export default async function HomePage() {
  const [categories, brands, featured, deals] = await Promise.all([
    getCategories(),
    getBrands({ featured: true }),
    getFeaturedProducts(12),
    getDealProducts(12),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <CategoryGrid categories={categories} />
        <ProductRail title="Featured products" href="/products" items={featured} />
        <BrandStrip brands={brands} />
        <ProductRail
          title="Today's deals"
          subtitle="Limited-time discounts across our top brands"
          href="/deals"
          items={deals}
        />
        <TrustBadges />
      </main>
      <SiteFooter />
    </div>
  )
}
