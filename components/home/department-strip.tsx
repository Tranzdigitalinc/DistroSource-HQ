import Link from "next/link"
import { getCategoryIcon } from "@/lib/category-icons"
import { ArrowRight, GameController } from "@/lib/storefront-icons"
import type { getCategoryTree } from "@/lib/queries/catalog"

/**
 * Discovery row straight under the hero: every department as a chip with
 * its icon and real product count, plus Gaming. Scrolls on small screens.
 */
export function DepartmentStrip({ categories }: { categories: Awaited<ReturnType<typeof getCategoryTree>> }) {
  return (
    <section aria-label="Departments" className="border-b border-border bg-background">
      <div className="container-x">
        <div className="no-scrollbar -mx-5 flex items-stretch gap-2 overflow-x-auto px-5 py-4 sm:-mx-8 sm:px-8">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.slug)
            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-card py-2 pl-2 pr-4 text-sm font-medium text-foreground transition-colors hover:border-border-strong hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                {category.name}
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{category.productCount}</span>
              </Link>
            )
          })}
          <Link
            href="/gaming"
            className="group flex shrink-0 items-center gap-2.5 rounded-full bg-navy py-2 pl-2 pr-4 text-sm font-medium text-navy-foreground transition-colors hover:bg-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-navy-foreground/10 text-primary">
              <GameController size={14} aria-hidden="true" />
            </span>
            Gaming
            <ArrowRight size={12} className="text-navy-foreground/60 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
