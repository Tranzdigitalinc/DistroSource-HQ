import { unstable_cache } from "next/cache"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Hero } from "@/components/home/hero"
import { CategoryGrid } from "@/components/home/category-grid"
import { ProductRail } from "@/components/home/product-rail"
import { DepartmentShowcase } from "@/components/home/department-showcase"
import { FAQSection } from "@/components/home/faq-section"
import { TrustBadges } from "@/components/home/trust-badges"
import { ShopByGoal } from "@/components/home/shop-by-goal"
import { getCategoryTree, getFeaturedProducts, getProducts, getStorefrontStats } from "@/lib/queries/catalog"

const cache = <T,>(fn: () => Promise<T>, key: string) => unstable_cache(fn, ["homepage", key], { revalidate: 300 })

/** Departments merchandised in the tabbed showcase, in display order. */
const SHOWCASE_SLUGS = ["business-office", "web-development", "design-resources"] as const

export default async function HomePage() {
  const [departments, featured, newArrivals, businessProducts, webDevProducts, designProducts, stats] = await Promise.all([
    cache(getCategoryTree, "departments")(),
    cache(() => getFeaturedProducts(12), "featured")(),
    cache(() => getProducts({ sort: "newest", limit: 12 }), "new-arrivals")(),
    cache(() => getProducts({ categorySlug: "business-office", sort: "featured", limit: 8 }), "business-office")(),
    cache(() => getProducts({ categorySlug: "web-development", sort: "featured", limit: 8 }), "web-development")(),
    cache(() => getProducts({ categorySlug: "design-resources", sort: "featured", limit: 8 }), "design-resources")(),
    cache(getStorefrontStats, "stats")(),
  ])

  // The product-bundles rail was dropped: every bundle is a draft, so the
  // query returned nothing and the section rendered as empty space.
  const itemsBySlug: Record<string, typeof businessProducts> = {
    "business-office": businessProducts,
    "web-development": webDevProducts,
    "design-resources": designProducts,
  }
  const showcase = SHOWCASE_SLUGS.map((slug) => ({
    slug,
    name: departments.find((d) => d.slug === slug)?.name ?? slug.replace(/-/g, " "),
    items: itemsBySlug[slug] ?? [],
  }))

  return (
    <div className="flex min-h-screen flex-col">
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

        {/* Departments with nothing published are not advertised on the home page. */}
        <CategoryGrid categories={departments.filter((d) => d.productCount > 0)} />

        <ProductRail
          eyebrow="Hand-picked"
          title="Featured products"
          subtitle="A cross-section of the catalog, chosen for quality of the finished file."
          href="/products"
          items={featured}
          tone="muted"
        />

        {/* One tabbed section replaces three consecutive department rails. */}
        <DepartmentShowcase departments={showcase} />

        <ShopByGoal />

        <ProductRail
          eyebrow="Just added"
          title="New releases"
          subtitle="The most recent additions across every department."
          href="/products?sort=newest"
          items={newArrivals}
        />

        <TrustBadges />
        <FAQSection />
      </main>
      <SiteFooter />
    </div>
  )
}
