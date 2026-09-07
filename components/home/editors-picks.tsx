import Link from "next/link"
import Image from "next/image"
import { ProductCard, type ProductCardData } from "@/components/product/product-card"
import { PriceDisplay } from "@/components/price-display"
import { PageHeader, SectionLink } from "@/components/page-header"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"
import { ArrowRight } from "@/lib/storefront-icons"

/**
 * Featured products as a bento: the first pick as a large editorial tile,
 * the next four as standard cards. Nothing here is synthetic — the order is
 * the catalog's own featured order.
 */
export function EditorsPicks({ items }: { items: ProductCardData[] }) {
  if (items.length < 3) return null
  const [lead, ...rest] = items
  const leadImage = lead.product.coverImageUrl ?? lead.images[0]?.url ?? lead.product.thumbnailUrl ?? null
  const leadFree = lead.product.isFree || lead.startingPrice === 0

  return (
    <section className="container-x py-16 sm:py-20">
      <PageHeader
        size="section"
        eyebrow="Editor's picks"
        title="Chosen for how they hold up in real work"
        description="A short list from the catalog team: the products we would put in front of a client without a caveat."
        action={<SectionLink href="/products">All products</SectionLink>}
      />

      <RevealGroup className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:grid-rows-2" stagger={0.05}>
        <RevealItem className="col-span-2 row-span-2">
          <Link
            href={`/products/${lead.product.slug}`}
            className="group relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-2xl border border-border bg-navy text-navy-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {leadImage && (
              <Image
                src={leadImage}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            )}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/40 to-transparent" />
            <div className="relative flex flex-col gap-3 p-6 sm:p-8">
              <span className="eyebrow text-navy-foreground/70 [&::before]:bg-primary">{lead.category.name}</span>
              <h3 className="text-title max-w-md text-2xl sm:text-3xl">{lead.product.name}</h3>
              {lead.product.tagline && <p className="max-w-md text-sm leading-relaxed text-navy-foreground/75">{lead.product.tagline}</p>}
              <div className="mt-2 flex items-center justify-between gap-4">
                <span className="font-display text-xl font-bold tabular-nums">{leadFree ? "Free" : <PriceDisplay usdAmount={lead.startingPrice} />}</span>
                <span className="inline-flex h-10 items-center gap-2 rounded-full bg-navy-foreground px-4 text-sm font-semibold text-navy transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  View product
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </div>
            </div>
          </Link>
        </RevealItem>
        {rest.slice(0, 4).map((item) => (
          <RevealItem key={item.product.id} className="h-full">
            <ProductCard item={item} sizes="(max-width: 768px) 50vw, 25vw" />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}
