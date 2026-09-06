import Link from "next/link"
import { ArrowUpRight } from "@/lib/storefront-icons"
import { getCategoryIcon } from "@/lib/category-icons"
import type { getCategoryTree } from "@/lib/queries/catalog"

export function RedesignCategoryShowcase({ categories }: { categories: Awaited<ReturnType<typeof getCategoryTree>> }) {
  const visible = categories.filter((category) => category.productCount > 0).slice(0, 8)
  if (visible.length === 0) return null

  return (
    <section id="departments" className="mx-auto max-w-[1500px] scroll-mt-36 px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
      <div className="mb-10 flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Shop by department</p>
          <h2 className="mt-3 font-display text-4xl font-black tracking-[-0.04em] text-foreground sm:text-5xl">Start with what you need.</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">Broad enough to explore, structured enough to find the right asset quickly.</p>
        </div>
        <Link href="/redesign-preview/products" className="inline-flex min-h-11 items-center gap-2 self-start border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary sm:self-auto">
          View full catalog
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((category, index) => {
          const Icon = getCategoryIcon(category.slug)
          return (
            <Link key={category.slug} href={`/redesign-preview/products?category=${encodeURIComponent(category.slug)}`} className="group relative min-h-52 overflow-hidden bg-background p-6 transition-colors duration-200 hover:bg-secondary/45">
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-11 items-center justify-center border border-border bg-card text-primary transition-transform duration-200 group-hover:-translate-y-1"><Icon className="size-5" aria-hidden="true" /></span>
                <span className="font-mono text-[10px] font-semibold text-muted-foreground/65">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="absolute inset-x-6 bottom-6">
                <div className="mb-3 h-px w-10 bg-primary transition-all duration-300 group-hover:w-20" />
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-tight text-foreground">{category.name}</h3>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{category.productCount} {category.productCount === 1 ? "product" : "products"}</p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
