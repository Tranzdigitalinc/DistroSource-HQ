import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ArrowUpRight, ImageOff, ICON_SIZE } from "@/lib/storefront-icons"
import { getCategoryIcon } from "@/lib/category-icons"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"
import type { getCategoryTree } from "@/lib/queries/catalog"

/**
 * Department cards for the homepage.
 *
 * These were typographic poster tiles: a navy card with an oversized outlined
 * initial, a decorative index number, and a first tile that spanned two
 * columns. The letterform competed with the department name, the dark tiles
 * sat oddly in a light page, the uneven first tile made the grid ragged, and
 * none of it said anything about what the department contains.
 *
 * Now each card shows three real products from that department, then the
 * name, the stock count and the subcategories inside it — the same
 * information a customer would get from walking up to a shelf. Uniform
 * cards, so the grid reads as one set.
 *
 * Server component: no client JS beyond the shared reveal animation.
 */
export function CategoryGrid({
  categories,
  previews,
}: {
  categories: Awaited<ReturnType<typeof getCategoryTree>>
  /** department id → up to three product image URLs. */
  previews?: Record<number, string[]>
}) {
  if (categories.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Browse the catalog</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Shop by department</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Every department in the catalog, with a look at what is inside.</p>
        </div>
        <Link
          href="/categories"
          className="hidden items-center gap-1 font-mono text-xs font-semibold uppercase tracking-[0.04em] text-primary hover:underline sm:flex"
        >
          All departments
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.05}>
        {categories.map((department) => {
          const Icon = getCategoryIcon(department.slug)
          const images = previews?.[department.id] ?? []
          // Only subcategories that actually hold stock are named.
          const shelves = department.subcategories.filter((s) => s.productCount > 0)

          return (
            <RevealItem key={department.slug} className="h-full">
              <Link
                href={`/categories/${department.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-[var(--shadow-e2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                {/* Three real products from this department. gap-px on the
                    border colour draws hairlines without extra elements. */}
                <div className="grid grid-cols-3 gap-px bg-border">
                  {Array.from({ length: 3 }, (_, i) => {
                    const src = images[i]
                    return (
                      <div key={i} className="relative aspect-[4/3] overflow-hidden bg-secondary">
                        {src ? (
                          <Image
                            src={src}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 17vw, 12vw"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-muted-foreground/30">
                            <ImageOff size={ICON_SIZE.base} aria-hidden="true" />
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <h3 className="min-w-0 flex-1 truncate font-display text-[15px] font-bold tracking-tight text-foreground">
                      {department.name}
                    </h3>
                    <ArrowRight
                      size={ICON_SIZE.sm}
                      className="shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </div>

                  {shelves.length > 0 && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {shelves.slice(0, 4).map((s) => s.name).join(" · ")}
                      {shelves.length > 4 ? ` +${shelves.length - 4} more` : ""}
                    </p>
                  )}

                  <p className="mt-auto pt-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    {department.productCount.toLocaleString()} {department.productCount === 1 ? "product" : "products"}
                  </p>
                </div>
              </Link>
            </RevealItem>
          )
        })}
      </RevealGroup>
    </section>
  )
}
