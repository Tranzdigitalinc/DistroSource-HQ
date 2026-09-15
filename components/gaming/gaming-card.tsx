import Link from "next/link"
import { GamingImage } from "@/components/gaming/gaming-image"
import { categoryLabel, platformLabel } from "@/lib/gaming/catalog/taxonomy"
import { formatGamingPrice, listPrice } from "@/lib/gaming/catalog/pricing"
import type { GamingProduct } from "@/lib/gaming/catalog/types"
import { ArrowRight, Layers, Refresh } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

interface GamingCardProps {
  product: GamingProduct
  /** Load the cover eagerly (first row above the fold). */
  priority?: boolean
  className?: string
}

/**
 * Image-first Gaming product card. Shows only facts the catalogue holds:
 * platform, category, title, value line, up to three tags and the price.
 */
export function GamingCard({ product, priority = false, className }: GamingCardProps) {
  const recurring = product.pricing.kind === "subscription"
  const images = product.media.filter((m) => m.kind === "image").length
  const price = listPrice(product.pricing)

  return (
    <Link
      href={`/gaming/product/${product.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-[border-color,box-shadow,transform] duration-300",
        "hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_18px_40px_-24px_oklch(0.2_0.03_258/0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-navy">
        <GamingImage
          image={product.cardImage}
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
          priority={priority}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transition-none"
        />
        {images > 1 && (
          <span
            className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-1 font-mono text-[10px] font-semibold text-white backdrop-blur-sm"
            aria-label={`${images} images`}
          >
            <Layers size={11} aria-hidden="true" />
            {images}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {platformLabel(product.platform)}
          <span className="px-1.5 text-border" aria-hidden="true">/</span>
          {categoryLabel(product.platform, product.category)}
        </p>
        <h3 className="font-display text-base font-bold leading-snug tracking-tight text-foreground text-balance">{product.title}</h3>
        <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{product.summary}</p>
        {product.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
            {product.tags.slice(0, 3).map((tag) => (
              <li key={tag} className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground/75">
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3">
          <div>
            <p className="font-display text-lg font-bold leading-none tabular-nums text-foreground">
              {formatGamingPrice(price)}
              {recurring && <span className="ml-0.5 text-xs font-semibold text-muted-foreground">/mo</span>}
            </p>
            {(recurring || product.availability === "launching") && (
              <p className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {recurring && <Refresh size={11} aria-hidden="true" />}
                {[recurring && "Subscription", product.availability === "launching" && "Launching soon"].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            View details
            <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  )
}
