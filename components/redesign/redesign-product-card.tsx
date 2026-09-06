import Image from "next/image"
import Link from "next/link"
import { PriceDisplay } from "@/components/price-display"
import { ArrowUpRight, ImageOff, ShieldCheck, Star } from "@/lib/storefront-icons"
import { getSourceTypeLabel } from "@/lib/format"
import type { getProducts } from "@/lib/queries/catalog"

export type RedesignProductCardData = Awaited<ReturnType<typeof getProducts>>[number]

const NEW_WINDOW_DAYS = 30

function isRecentlyReleased(releaseDate: Date | string | null | undefined): boolean {
  if (!releaseDate) return false
  const released = new Date(releaseDate).getTime()
  if (Number.isNaN(released)) return false
  return Date.now() - released < NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000
}

export function RedesignProductCard({ item }: { item: RedesignProductCardData }) {
  const image = item.product.coverImageUrl ?? item.images[0]?.url ?? item.product.thumbnailUrl ?? null
  const href = `/redesign-preview/products/${item.product.slug}`
  const isFree = item.product.isFree || item.startingPrice === 0
  const compareAt = item.product.compareAtPrice ? Number.parseFloat(item.product.compareAtPrice) : null
  const isOnSale = compareAt !== null && compareAt > item.startingPrice && !isFree
  const savingsPercent = isOnSale && compareAt ? Math.round(((compareAt - item.startingPrice) / compareAt) * 100) : 0
  const isNew = !isFree && (item.product.isNewRelease || isRecentlyReleased(item.product.releaseDate))
  const isOriginal = item.product.sourceType === "distrosource_original" && item.product.rightsStatus === "original"
  const format = item.product.fileFormats?.[0]?.toUpperCase() ?? item.product.softwareCompatibility?.[0] ?? null

  return (
    <article className="group relative flex h-full min-w-0 flex-col border border-border bg-card transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-border-strong hover:shadow-[var(--shadow-e2)] motion-reduce:transform-none motion-reduce:transition-none">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-secondary/55">
        {image ? (
          <Image
            src={image}
            alt={item.product.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-muted-foreground/35">
            <ImageOff size={32} aria-hidden="true" />
          </span>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <div className="flex flex-wrap gap-1.5">
            {isFree && (
              <span className="bg-navy px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-navy-foreground">
                Free
              </span>
            )}
            {!isFree && isNew && (
              <span className="bg-background/92 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-foreground backdrop-blur">
                New
              </span>
            )}
            {isOnSale && savingsPercent > 0 && (
              <span className="bg-primary px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-primary-foreground">
                −{savingsPercent}%
              </span>
            )}
          </div>
          <span className="flex size-9 translate-y-1 items-center justify-center border border-white/20 bg-black/40 text-white opacity-0 backdrop-blur transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex min-w-0 items-center gap-2 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          <span className="truncate">{item.category.name}</span>
          {format && (
            <>
              <span aria-hidden="true">/</span>
              <span className="truncate">{format}</span>
            </>
          )}
        </div>

        <h3 className="mt-2 min-w-0 font-display text-[15px] font-bold leading-snug tracking-[-0.015em] text-foreground">
          <Link href={href} className="line-clamp-2 transition-colors hover:text-primary">
            {item.product.name}
          </Link>
        </h3>

        {item.product.tagline && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.product.tagline}</p>
        )}

        <div className="mt-auto pt-4">
          <div className="flex min-h-5 items-center gap-2 text-[10px] text-muted-foreground">
            {item.reviewCount > 0 ? (
              <span className="flex items-center gap-1">
                <Star size={12} className="fill-primary text-primary" aria-hidden="true" />
                <strong className="text-foreground">{item.avgRating.toFixed(1)}</strong>
                <span>({item.reviewCount})</span>
              </span>
            ) : isOriginal ? (
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-success" aria-hidden="true" />
                DistroSource original
              </span>
            ) : (
              <span>{getSourceTypeLabel(item.product.sourceType)}</span>
            )}
          </div>

          <div className="mt-3 flex items-end justify-between gap-3 border-t border-border pt-3">
            <div className="min-w-0">
              {item.licenses.length > 1 && !isFree && (
                <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">From</p>
              )}
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-display text-xl font-black tracking-tight text-foreground">
                  {isFree ? "Free" : <PriceDisplay usdAmount={item.startingPrice} />}
                </span>
                {isOnSale && compareAt && (
                  <span className="text-xs text-muted-foreground line-through">
                    <PriceDisplay usdAmount={compareAt} />
                  </span>
                )}
              </div>
            </div>
            <Link
              href={href}
              aria-label={`View ${item.product.name}`}
              className="flex size-10 shrink-0 items-center justify-center border border-border text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
