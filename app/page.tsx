import { unstable_cache } from "next/cache"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Hero } from "@/components/home/hero"
import { DepartmentStrip } from "@/components/home/department-strip"
import { EditorsPicks } from "@/components/home/editors-picks"
import { ProductRail } from "@/components/home/product-rail"
import { GamingTeaser } from "@/components/home/gaming-teaser"
import { DepartmentTabs } from "@/components/home/department-tabs"
import { WhyStrip } from "@/components/home/why-strip"
import { getCategoryTree, getFeaturedProducts, getProducts, getStorefrontStats } from "@/lib/queries/catalog"

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
      cache(getStorefrontStats, "stats")(),
    ])

  const liveDepartments = departments.filter((d) => d.productCount > 0)

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
            categoryName: item.category.name,
          }))}
        />
        <DepartmentStrip categories={liveDepartments} />
        <EditorsPicks items={featured} />
        <ProductRail eyebrow="Just added" title="New releases" subtitle="Fresh templates, fonts and assets, newest first." href="/products?sort=newest" items={newArrivals} />
        <GamingTeaser />
        <DepartmentTabs
          tabs={[
            { slug: "business-office", name: "Business & Office", description: "Spreadsheets, documents, planners and Notion systems for everyday operations.", items: businessProducts },
            { slug: "web-development", name: "Web & Development", description: "Site templates, admin dashboards, landing pages and React / Next.js starters.", items: webDevProducts },
            { slug: "design-resources", name: "Design Resources", description: "Graphics, icons, mockups and brand assets with a point of view.", items: designProducts },
          ]}
        />
        <ProductRail eyebrow="Bundles" title="Curated collections" subtitle="Sets that cost less than buying each file on its own." href="/categories/product-bundles" items={bundleProducts} />
        <WhyStrip />
      </main>
      <SiteFooter />
    </div>
  )
}
