import Link from "next/link"
import { ArrowRight, ICON_SIZE } from "@/lib/storefront-icons"
import { getCategoryIcon } from "@/lib/category-icons"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"
import { getCategoryTree } from "@/lib/queries/catalog"

export const metadata = {
  title: "Categories — DistroSource",
  description: "Browse every department and category in the DistroSource catalog.",
}

export default async function CategoriesPage() {
  // Departments and subcategories that currently hold a visible product.
  // Empty shelves are not linked — a category page that says "0 products"
  // is a dead end, not a promise.
  const tree = (await getCategoryTree())
    .map((d) => ({ ...d, subcategories: d.subcategories.filter((s) => s.productCount > 0) }))
    .filter((d) => d.subcategories.length > 0)
  const total = tree.reduce((n, d) => n + d.subcategories.length, 0)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Browse</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">All categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} {total === 1 ? "category" : "categories"} across {tree.length} {tree.length === 1 ? "department" : "departments"}
          </p>

          <div className="mt-8 flex flex-col gap-10">
            {tree.map((department) => {
              const Icon = getCategoryIcon(department.slug)
              return (
                <section key={department.slug} aria-labelledby={`dept-${department.slug}`}>
                  <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-md bg-secondary text-foreground">
                        <Icon aria-hidden="true" className="size-4" />
                      </span>
                      <div>
                        <h2 id={`dept-${department.slug}`} className="font-display text-lg font-bold text-foreground">{department.name}</h2>
                        <p className="text-xs text-muted-foreground">{department.productCount.toLocaleString()} products</p>
                      </div>
                    </div>
                    <Link href={`/categories/${department.slug}`} className="flex items-center gap-1 text-xs font-semibold text-foreground hover:underline">
                      View all
                      <ArrowRight size={12} aria-hidden="true" />
                    </Link>
                  </div>
                  <RevealGroup className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" stagger={0.03}>
                    {department.subcategories.map((category) => {
                      const SubIcon = getCategoryIcon(category.slug)
                      return (
                        <RevealItem key={category.slug} className="h-full">
                          <Link
                            href={`/categories/${category.slug}`}
                            className="group flex h-full flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:border-border-strong hover:bg-secondary/40"
                          >
                            <span className="flex size-9 items-center justify-center rounded-md bg-secondary text-muted-foreground group-hover:text-foreground">
                              <SubIcon aria-hidden="true" className="size-4" />
                            </span>
                            <span className="mt-3 flex items-baseline justify-between gap-2">
                              <span className="font-display text-sm font-bold text-foreground">{category.name}</span>
                              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{category.productCount}</span>
                            </span>
                            {category.description && (
                              <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{category.description}</span>
                            )}
                            <span className="mt-auto flex items-center gap-1 pt-3 text-xs font-medium text-foreground">
                              Browse
                              <ArrowRight size={ICON_SIZE.sm} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                            </span>
                          </Link>
                        </RevealItem>
                      )
                    })}
                  </RevealGroup>
                </section>
              )
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
