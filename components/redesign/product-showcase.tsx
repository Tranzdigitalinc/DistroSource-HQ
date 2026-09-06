import Link from "next/link"
import { ProductCard } from "@/components/product/product-card"
import { ArrowRight } from "@/lib/storefront-icons"
import type { getProducts } from "@/lib/queries/catalog"

export function RedesignProductShowcase({
  eyebrow,
  title,
  description,
  href,
  items,
  tone = "default",
}: {
  eyebrow: string
  title: string
  description?: string
  href: string
  items: Awaited<ReturnType<typeof getProducts>>
  tone?: "default" | "muted" | "navy"
}) {
  if (items.length === 0) return null

  const sectionClass =
    tone === "navy"
      ? "bg-navy text-navy-foreground"
      : tone === "muted"
        ? "bg-secondary/35 text-foreground"
        : "bg-background text-foreground"

  const mutedText = tone === "navy" ? "text-navy-foreground/65" : "text-muted-foreground"
  const borderClass = tone === "navy" ? "border-navy-foreground/15" : "border-border"

  return (
    <section className={sectionClass}>
      <div className="mx-auto max-w-[1500px] px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className={`mb-10 flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between ${borderClass}`}>
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
            <h2 className="mt-3 font-display text-4xl font-black tracking-[-0.04em] sm:text-5xl">{title}</h2>
            {description && <p className={`mt-3 text-sm leading-6 sm:text-base ${mutedText}`}>{description}</p>}
          </div>
          <Link
            href={href}
            className={`inline-flex min-h-11 items-center gap-2 self-start border px-4 py-2.5 text-sm font-semibold transition-colors hover:border-primary/50 hover:text-primary sm:self-auto ${borderClass}`}
          >
            View collection
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.slice(0, 10).map((item) => (
            <ProductCard key={item.product.id} item={item} className={tone === "navy" ? "bg-background text-foreground" : undefined} />
          ))}
        </div>
      </div>
    </section>
  )
}
