import Link from "next/link"
import Image from "next/image"
import { GamingPreview } from "@/components/gaming/gaming-preview"
import { hasRealImages, resolveGamingImage } from "@/lib/gaming/images"
import { TebexBuyButton } from "@/components/gaming/tebex-buy-button"
import { getGamingBadges } from "@/lib/gaming/queries"
import { CATEGORY_LABEL, PLATFORM_LABEL, type GamingProduct } from "@/lib/gaming/types"
import { formatUsd } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * A Gaming product card. Carries platform, category, price and — where the
 * data supports it — a badge, and nothing else: no seller, creator, vendor,
 * author, rating or avatar. Every product here is sold by DistroSource.
 */
export function GamingProductCard({ product, className }: { product: GamingProduct; className?: string }) {
  const href = `/gaming/product/${product.slug}`
  const badges = getGamingBadges(product)

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card",
        "transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-[var(--shadow-e2)]",
        className,
      )}
    >
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden" tabIndex={-1} aria-hidden="true">
        {/* A real capture wins over the illustration whenever one exists.
            No caption on the illustrated fallback: the badges take the
            top-left corner it would caption. */}
        {hasRealImages(product.images) ? (
          <Image
            src={resolveGamingImage(product.cardImage ?? product.images[0])}
            alt=""
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <GamingPreview
            art={product.art[0]}
            caption={false}
            className="transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}
        {badges.length > 0 && (
          <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge}
                className={cn(
                  "rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em]",
                  badge === "Bestseller" || badge === "Popular"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/95 text-foreground",
                )}
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          {/* The platform chip never wraps; the category gives way instead,
              so a two-word platform like "Game Servers" stays on one line. */}
          <span className="shrink-0 whitespace-nowrap rounded bg-secondary px-1.5 py-0.5 text-foreground">
            {PLATFORM_LABEL[product.platform]}
          </span>
          <span className="min-w-0 truncate">{CATEGORY_LABEL[product.category]}</span>
        </p>

        <h3 className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-foreground">
          <Link href={href} className="transition-colors after:absolute after:inset-0 hover:text-primary focus-visible:outline-none">
            {product.title}
          </Link>
        </h3>

        <p className="mt-auto line-clamp-2 pt-1 text-xs leading-relaxed text-muted-foreground">{product.shortDescription}</p>
      </div>

      {/* Two-up on a phone leaves ~160px of card: price, View and Buy cannot
          share a row there, so the footer stacks and Buy takes the full width.
          From sm up the original single row returns. */}
      <div className="flex flex-col gap-2 border-t border-border px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* flex-wrap: a long pair like "$199.99 $379.99" otherwise runs into
            the View button. When tight, the struck-through price drops a line. */}
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
          <span className="font-display text-base font-bold tabular-nums text-foreground">{formatUsd(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">{formatUsd(product.originalPrice)}</span>
          )}
        </div>

        <div className="relative z-10 flex shrink-0 items-center gap-1">
          {/* The whole card already links to the product, so View is a
              convenience that can stand down when there is no room for it. */}
          <Link
            href={href}
            className="hidden h-8 items-center rounded-md border border-border px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
          >
            View
          </Link>
          <TebexBuyButton product={product} size="sm" className="h-8 w-full sm:w-auto" label="Buy" />
        </div>
      </div>
    </article>
  )
}
