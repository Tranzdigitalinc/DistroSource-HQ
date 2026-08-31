import Link from "next/link"
import { getCategoryIcon } from "@/lib/category-icons"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { getCategories } from "@/lib/queries/catalog"
export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
          <h1 className="font-display text-3xl font-bold tracking-tight">All categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Explore every corner of the RedeemCove catalog</p>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group flex min-h-44 flex-col justify-between rounded-2xl border border-primary/20 bg-card p-6 transition-colors hover:border-primary/60"
              >
                <div className="flex size-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                  {(() => { const Icon = getCategoryIcon(category.iconName); return <Icon aria-hidden="true" /> })()}
                </div>
                <span className="flex flex-col gap-1">
                  <h2 className="font-display text-lg font-bold text-foreground">{category.name}</h2>
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{category.description}</p>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
