import { unstable_cache } from "next/cache"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Hero } from "@/components/home/hero"
import { DepartmentShowcase } from "@/components/home/department-showcase"
import { EditorsPicks } from "@/components/home/editors-picks"
import { ProductCarousel } from "@/components/home/product-carousel"
import { GamingTeaser } from "@/components/home/gaming-teaser"
import { DepartmentTabs } from "@/components/home/department-tabs"
import { Confidence } from "@/components/home/confidence"
import { RecentlyViewed } from "@/components/home/recently-viewed"
import { Suspense } from "react"
import { getCategoryTree, getFeaturedProducts, getProducts, getStorefrontStats } from "@/lib/queries/catalog"
import { getFeaturedGamingProducts } from "@/lib/gaming/queries"

const cache = <T,>(fn: () => Promise<T>, key: string) => unstable_cache(fn, ["homepage", key], { revalidate: 300 })

type Item = Awaited<ReturnType<typeof getProducts>>[number]
const cover = (item: Item) => item.product.coverImageUrl ?? item.images[0]?.url ?? item.product.thumbnailUrl ?? null

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
      cache(getStorefrontStats, "stats")(),
    ])

  const liveDepartments = departments.filter((d) => d.productCount > 0)
  // Three real covers per department for the showcase tiles.
  const tiles = await Promise.all(
    liveDepartments.map(async (d) => {
      const items = await cache(() => getProducts({ categorySlug: d.slug, sort: "featured", limit: 3 }), `tile-${d.slug}`)()
      return { slug: d.slug, name: d.name, productCount: d.productCount, images: items.map(cover).filter((u): u is string => Boolean(u)) }
    }),
  )

  // The hero wall wants breadth: featured first, then the newest, deduped.
  const wall = [...featured, ...newArrivals]
    .filter((item, i, arr) => arr.findIndex((x) => x.product.id === item.product.id) === i)
    .slice(0, 14)
    .map((item) => ({ slug: item.product.slug, name: item.product.name, imageUrl: cover(item), categoryName: item.category.name }))

  const gaming = getFeaturedGamingProducts(4)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero stats={stats} products={wall} />
        <DepartmentShowcase departments={tiles} />
        <EditorsPicks items={featured} />
        <ProductCarousel eyebrow="Just added" title="New releases" subtitle="Fresh templates, fonts and assets, newest first." href="/products?sort=newest" items={newArrivals} />
        <GamingTeaser products={gaming} />
        <DepartmentTabs
          tabs={[
            { slug: "business-office", name: "Business & Office", description: "Spreadsheets, documents, planners and Notion systems for everyday operations.", items: businessProducts },
            { slug: "web-development", name: "Web & Development", description: "Site templates, admin dashboards, landing pages and React / Next.js starters.", items: webDevProducts },
            { slug: "design-resources", name: "Design Resources", description: "Graphics, icons, mockups and brand assets with a point of view.", items: designProducts },
          ]}
        />
        <Suspense fallback={null}>
          <RecentlyViewed />
        </Suspense>
        {bundleProducts.length > 0 && (
          <ProductCarousel eyebrow="Bundles" title="Curated collections" subtitle="Sets that cost less than buying each file on its own." href="/categories/product-bundles" items={bundleProducts} />
        )}
        <Confidence stats={stats} />
      </main>
      <SiteFooter />
    </div>
  )
}
