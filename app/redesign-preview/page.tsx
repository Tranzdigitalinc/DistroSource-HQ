import { unstable_cache } from "next/cache"
import { RedesignHeader } from "@/components/redesign/redesign-header"
import { RedesignFooter } from "@/components/redesign/redesign-footer"
import { RedesignHero } from "@/components/redesign/redesign-hero"
import { RedesignCategoryShowcase } from "@/components/redesign/category-showcase"
import { RedesignProductShowcase } from "@/components/redesign/product-showcase"
import { RedesignGamingBridge } from "@/components/redesign/redesign-gaming-bridge"
import { RedesignProof } from "@/components/redesign/redesign-proof"
import { getCategoryTree, getFeaturedProducts, getProducts, getStorefrontStats } from "@/lib/queries/catalog"

export const metadata = {
  title: "DistroSource redesign preview",
  robots: { index: false, follow: false },
}

const cache = <T,>(fn: () => Promise<T>, key: string) => unstable_cache(fn, ["redesign-preview", key], { revalidate: 300 })

export default async function RedesignPreviewPage() {
  const [departments, featured, newest, business, development, design, stats] = await Promise.all([
    cache(getCategoryTree, "departments")(),
    cache(() => getFeaturedProducts(12), "featured")(),
    cache(() => getProducts({ sort: "newest", limit: 10 }), "newest")(),
    cache(() => getProducts({ categorySlug: "business-office", sort: "featured", limit: 10 }), "business")(),
    cache(() => getProducts({ categorySlug: "web-development", sort: "featured", limit: 10 }), "development")(),
    cache(() => getProducts({ categorySlug: "design-resources", sort: "featured", limit: 10 }), "design")(),
    cache(getStorefrontStats, "stats")(),
  ])

  const heroProducts = featured.slice(0, 4).map((item) => ({
    slug: item.product.slug,
    name: item.product.name,
    imageUrl: item.product.coverImageUrl ?? item.images[0]?.url ?? item.product.thumbnailUrl ?? null,
  }))

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <RedesignHeader departments={departments} />
      <main className="flex-1 overflow-hidden">
        <RedesignHero stats={stats} products={heroProducts} />
        <RedesignCategoryShowcase categories={departments} />
        <RedesignProductShowcase
          eyebrow="DistroSource picks"
          title="Worth opening first."
          description="A curated front shelf built from real catalog inventory — useful products with strong visual and practical value."
          href="/redesign-preview/products"
          items={featured}
          tone="muted"
        />
        <RedesignProductShowcase
          eyebrow="Just landed"
          title="New digital releases."
          description="Fresh templates, systems, assets and resources added to the store."
          href="/redesign-preview/products?sort=newest"
          items={newest}
        />
        <RedesignProductShowcase
          eyebrow="Work smarter"
          title="Business systems that earn their tab."
          description="Documents, spreadsheets, operating systems and practical resources for everyday work."
          href="/redesign-preview/products?category=business-office"
          items={business}
          tone="navy"
        />
        <RedesignProductShowcase
          eyebrow="Build faster"
          title="Web & development resources."
          description="UI kits, templates, starters and digital building blocks for shipping the next idea."
          href="/redesign-preview/products?category=web-development"
          items={development}
        />
        <RedesignGamingBridge />
        <RedesignProductShowcase
          eyebrow="Make it look finished"
          title="Design resources with a point of view."
          description="Graphics, mockups, brand assets and presentation-ready material for polished output."
          href="/redesign-preview/products?category=design-resources"
          items={design}
          tone="muted"
        />
        <RedesignProof />
      </main>
      <RedesignFooter />
    </div>
  )
}
