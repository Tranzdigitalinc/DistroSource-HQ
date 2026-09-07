import { unstable_cache } from "next/cache"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { V5Hero } from "@/components/v5/hero"
import { V5Departments } from "@/components/v5/departments"
import { V5ProductShowcase } from "@/components/v5/product-showcase"
import { V5GamingTakeover } from "@/components/v5/gaming-takeover"
import { getCategoryTree, getFeaturedProducts, getProducts } from "@/lib/queries/catalog"

const cache = <T,>(fn: () => Promise<T>, key: string) => unstable_cache(fn, ["homepage-v5", key], { revalidate: 300 })

export default async function HomePage() {
  const [departments, featured, newArrivals, business, design] = await Promise.all([
    cache(getCategoryTree, "departments")(),
    cache(() => getFeaturedProducts(8), "featured")(),
    cache(() => getProducts({ sort: "newest", limit: 8 }), "new")(),
    cache(() => getProducts({ categorySlug: "business-office", sort: "featured", limit: 6 }), "business")(),
    cache(() => getProducts({ categorySlug: "design-resources", sort: "featured", limit: 6 }), "design")(),
  ])

  const visibleDepartments = departments.filter((department) => department.productCount > 0)
  const productCount = visibleDepartments.reduce((sum, department) => sum + department.productCount, 0)
  const categoryCount = visibleDepartments.reduce((sum, department) => sum + department.subcategories.filter((subcategory) => subcategory.productCount > 0).length, 0)
  const heroProducts = featured.slice(0, 3).map((item) => ({
    slug: item.product.slug,
    name: item.product.name,
    category: item.category.name,
    imageUrl: item.product.coverImageUrl ?? item.images[0]?.url ?? item.product.thumbnailUrl ?? null,
  }))

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <V5Hero products={heroProducts} productCount={productCount} categoryCount={categoryCount} />
        <V5Departments departments={visibleDepartments} />
        <V5ProductShowcase
          eyebrow="DistroSource edit"
          title="Products worth opening twice."
          description="A tighter edit of the catalog: useful, well-presented digital products selected to help you move from idea to finished work faster."
          href="/products"
          items={featured.slice(0, 5)}
        />
        <V5ProductShowcase
          eyebrow="Just landed"
          title="Fresh into the catalog."
          description="New templates, systems, graphics and tools—organized without the noise."
          href="/products?sort=newest"
          items={newArrivals.slice(0, 5)}
          tone="dark"
        />
        {business.length > 0 && (
          <V5ProductShowcase
            eyebrow="Work, upgraded"
            title="Business tools that don’t look like office software."
            description="Professional documents, spreadsheet systems and practical resources designed to make everyday operations lighter."
            href="/categories/business-office"
            items={business.slice(0, 5)}
          />
        )}
        {design.length > 0 && (
          <V5ProductShowcase
            eyebrow="For visual work"
            title="Design resources with a point of view."
            description="Graphics, presentation assets and visual systems that help finished work feel considered—not assembled."
            href="/categories/design-resources"
            items={design.slice(0, 5)}
          />
        )}
        <V5GamingTakeover />
      </main>
      <SiteFooter />
    </div>
  )
}
