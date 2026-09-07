import Link from "next/link"
import { ArrowRight, ArrowUpRight, ICON_SIZE } from "@/lib/storefront-icons"
import { getCategoryIcon } from "@/lib/category-icons"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { PageHeader } from "@/components/page-header"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"
import { getCategoryTree } from "@/lib/queries/catalog"

export const metadata = {
  title: "Categories — DistroSource",
  description: "Browse every department and category in the DistroSource catalog.",
}

export default async function CategoriesPage() {
  // Departments and subcategories that currently hold a visible product.
  const tree = (await getCategoryTree())
    .map((d) => ({ ...d, subcategories: d.subcategories.filter((s) => s.productCount > 0) }))
    .filter((d) => d.subcategories.length > 0)
  const total = tree.reduce((n, d) => n + d.subcategories.length, 0)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-x py-10 sm:py-12">
          <PageHeader
            eyebrow="Browse"
            title="Every department"
            description={`${total} ${total === 1 ? "category" : "categories"} across ${tree.length} ${tree.length === 1 ? "department" : "departments"}, plus DistroSource Gaming.`}
          />

          <div className="mt-12 flex flex-col gap-14">
            {tree.map((department, index) => {
              const Icon = getCategoryIcon(department.slug)
              return (
                <section key={department.slug} aria-labelledby={`dept-${department.slug}`} className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
                  <Link
                    href={`/categories/${department.slug}`}
                    className="group relative flex min-h-48 flex-col justify-between overflow-hidden rounded-2xl bg-navy p-6 text-navy-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-4 -top-10 select-none font-display text-[11rem] font-black leading-none text-navy-foreground/[0.06] transition-transform duration-500 group-hover:-translate-y-2"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex size-10 items-center justify-center rounded-lg bg-navy-foreground/10 text-primary">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <span className="relative">
                      <h2 id={`dept-${department.slug}`} className="text-title text-2xl">{department.name}</h2>
                      <span className="mt-2 flex items-center gap-2 text-sm text-navy-foreground/65">
                        {department.productCount.toLocaleString()} products
                        <ArrowUpRight size={14} className="text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </span>
                  </Link>

                  <RevealGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" stagger={0.03}>
                    {department.subcategories.map((category) => {
                      const SubIcon = getCategoryIcon(category.slug)
                      return (
                        <RevealItem key={category.slug} className="h-full">
                          <Link
                            href={`/categories/${category.slug}`}
                            className="group flex h-full flex-col rounded-xl border border-border bg-card p-4 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hover:translate-y-0"
                          >
                            <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                              <SubIcon aria-hidden="true" className="size-4" />
                            </span>
                            <span className="mt-3 flex items-baseline justify-between gap-2">
                              <span className="font-display text-sm font-bold text-foreground">{category.name}</span>
                              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{category.productCount}</span>
                            </span>
                            {category.description && <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{category.description}</span>}
                            <span className="mt-auto flex items-center gap-1 pt-3 text-xs font-semibold text-foreground">
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
