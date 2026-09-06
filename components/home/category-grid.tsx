import Link from "next/link"
import { ArrowUpRight } from "@/lib/storefront-icons"
import { getCategoryIcon } from "@/lib/category-icons"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"
import type { getCategoryTree } from "@/lib/queries/catalog"

export function CategoryGrid({ categories }: { categories: Awaited<ReturnType<typeof getCategoryTree>> }) {
  const visible = categories.slice(0, 8)

  return (
    <section className="border-b border-border/70 bg-secondary/18">
      <div className="mx-auto max-w-[94rem] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-9 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] lg:items-end">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Departments</p>
            <h2 className="mt-2 max-w-3xl font-display text-3xl font-black tracking-[-0.045em] text-foreground sm:text-4xl lg:text-5xl">
              Find the right shelf, faster.
            </h2>
          </div>
          <div className="lg:text-right">
            <p className="text-sm leading-6 text-muted-foreground">
              Browse by what you need, then narrow with formats, software, licensing and price.
            </p>
            <Link href="/categories" className="group mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-foreground hover:text-primary">
              All departments
              <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <RevealGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" stagger={0.045}>
          {visible.map((category) => {
            const Icon = getCategoryIcon(category.slug)
            const subcategories = category.subcategories.filter((item) => item.productCount > 0).slice(0, 3)

            return (
              <RevealItem key={category.slug}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="group flex min-h-[17rem] h-full flex-col rounded-2xl border border-border/80 bg-background p-5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-[0_20px_60px_-36px_color-mix(in_oklch,var(--foreground)_25%,transparent)] motion-reduce:transform-none motion-reduce:transition-none sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      {category.productCount} products
                    </span>
                  </div>

                  <div className="mt-auto pt-10">
                    <h3 className="font-display text-xl font-black tracking-[-0.025em] text-foreground sm:text-2xl">{category.name}</h3>
                    {category.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{category.description}</p>}
                    {subcategories.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {subcategories.map((subcategory) => (
                          <span key={subcategory.slug} className="rounded-full border border-border bg-secondary/35 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                            {subcategory.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-foreground transition-colors group-hover:text-primary">
                      Browse department
                      <ArrowUpRight size={13} />
                    </span>
                  </div>
                </Link>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </div>
    </section>
  )
}
