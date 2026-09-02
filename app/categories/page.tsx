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
          <p className="mt-1 text-sm text-muted-foreground">Explore every corner of the DistroSource catalog</p>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group flex min-h-44 flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {(() => { const Icon = getCategoryIcon(category.slug); return <Icon aria-hidden="true" className="size-5" /> })()}
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
