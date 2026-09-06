import Link from "next/link"
import { ArrowRight } from "@/lib/storefront-icons"
import { ProductCard } from "@/components/product/product-card"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"
import type { getProducts } from "@/lib/queries/catalog"

export function ProductRail({
  title,
  subtitle,
  href,
  items,
}: {
  title: string
  subtitle?: string
  href: string
  items: Awaited<ReturnType<typeof getProducts>>
  variant?: "default" | "deals"
}) {
  if (items.length === 0) return null
  const visible = items.slice(0, 5)

  return (
    <section className="mx-auto max-w-[94rem] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Curated selection</p>
          <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.04em] text-foreground sm:text-4xl lg:text-5xl">{title}</h2>
          {subtitle && <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">{subtitle}</p>}
        </div>
        <Link href={href} className="group inline-flex w-fit items-center gap-2 text-sm font-bold text-foreground hover:text-primary">
          View all
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <RevealGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-12" stagger={0.04}>
        {visible.map((item, index) => (
          <RevealItem
            key={item.product.id}
            className={index === 0 ? "lg:col-span-6 lg:row-span-2" : "lg:col-span-3"}
          >
            <ProductCard item={item} variant={index === 0 ? "featured" : "default"} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}
