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
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Index</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">All categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Explore every corner of the DistroSource catalog</p>
          <div className="mt-8 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, i) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group relative flex min-h-44 flex-col justify-between bg-card p-6 transition-colors hover:bg-secondary/60"
              >
                <span className="absolute right-4 top-4 font-mono text-xs font-semibold text-muted-foreground/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex size-12 items-center justify-center border border-border bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
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
