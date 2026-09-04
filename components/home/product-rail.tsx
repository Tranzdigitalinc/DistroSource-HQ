import { ProductCard } from "@/components/product/product-card"
import { HomeSection } from "@/components/home/home-section"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"
import type { getProducts } from "@/lib/queries/catalog"

export function ProductRail({
  eyebrow,
  title,
  subtitle,
  href,
  items,
  tone = "default",
  limit = 10,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  href: string
  items: Awaited<ReturnType<typeof getProducts>>
  tone?: "default" | "muted"
  limit?: number
}) {
  if (items.length === 0) return null

  return (
    <HomeSection eyebrow={eyebrow} title={title} description={subtitle} action={{ label: "View all", href }} tone={tone}>
      {/* Five across at most: six columns squeezed the card's title, format and
          price into an unreadable strip on a 1280px screen. */}
      <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" stagger={0.04}>
        {items.slice(0, limit).map((item) => (
          <RevealItem key={item.product.id} className="h-full">
            <ProductCard item={item} />
          </RevealItem>
        ))}
      </RevealGroup>
    </HomeSection>
  )
}
