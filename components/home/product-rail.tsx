"use client"

import { ProductCard } from "@/components/product/product-card"
import { PageHeader, SectionLink } from "@/components/page-header"
import { ScrollRail, RailControls } from "@/components/motion/scroll-rail"
import { Reveal } from "@/components/motion/reveal"
import type { getProducts } from "@/lib/queries/catalog"

/**
 * A horizontal product rail with a section header. Snap-scrolls on touch,
 * arrows for pointer users, arrow keys when the rail is focused.
 */
export function ProductRail({
  eyebrow,
  title,
  subtitle,
  href,
  items,
  limit = 12,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  href: string
  items: Awaited<ReturnType<typeof getProducts>>
  limit?: number
}) {
  if (items.length === 0) return null

  return (
    <section className="container-x py-12 sm:py-16">
      <ScrollRail
        ariaLabel={title}
        controls={(api) => (
          <Reveal className="mb-8">
            <PageHeader
              size="section"
              eyebrow={eyebrow}
              title={title}
              description={subtitle}
              action={
                <>
                  <RailControls {...api} className="hidden sm:flex" />
                  <SectionLink href={href}>View all</SectionLink>
                </>
              }
            />
          </Reveal>
        )}
      >
        {items.slice(0, limit).map((item) => (
          <div key={item.product.id} className="w-[16.5rem] sm:w-[17.5rem]">
            <ProductCard item={item} sizes="18rem" />
          </div>
        ))}
      </ScrollRail>
    </section>
  )
}
