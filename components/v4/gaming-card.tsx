import Image from "next/image"
import Link from "next/link"
import { GamingPreview } from "@/components/gaming/gaming-preview"
import { TebexBuyButton } from "@/components/gaming/tebex-buy-button"
import { getGamingBadges } from "@/lib/gaming/queries"
import { hasRealImages, resolveGamingImage } from "@/lib/gaming/images"
import { CATEGORY_LABEL, PLATFORM_LABEL, type GamingProduct } from "@/lib/gaming/types"
import { formatUsd } from "@/lib/format"
import { ArrowRight } from "@/lib/storefront-icons"

export function V4GamingCard({ product, feature = false }: { product: GamingProduct; feature?: boolean }) {
  const href = `/gaming/product/${product.slug}`
  const badges = getGamingBadges(product)

  return (
    <article className="group min-w-0">
      <div className={`relative overflow-hidden bg-white/[0.05] ${feature ? "rounded-[32px]" : "rounded-[26px]"}`}>
        <Link href={href} className={`relative block ${feature ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
          {hasRealImages(product.images) ? (
            <Image src={resolveGamingImage(product.images[0])} alt={product.title} fill sizes={feature ? "(max-width: 1024px) 90vw, 55vw" : "(max-width: 640px) 50vw, 28vw"} className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
          ) : (
            <GamingPreview art={product.art[0]} caption={false} className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.04]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
          {badges.length > 0 && (
            <div className="absolute left-3 top-3 flex gap-1.5">
              {badges.slice(0, 2).map((badge) => <span key={badge} className="rounded-full bg-white/92 px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-[0.08em] text-black backdrop-blur">{badge}</span>)}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
            <p className="font-mono text-[8px] font-black uppercase tracking-[0.12em] text-white/55">{PLATFORM_LABEL[product.platform]} · {CATEGORY_LABEL[product.category]}</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <h3 className={`${feature ? "text-2xl sm:text-4xl" : "text-lg"} max-w-[80%] font-display font-black leading-[0.95] tracking-[-0.04em]`}>{product.title}</h3>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:translate-x-1"><ArrowRight size={13} /></span>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          {!feature && <p className="line-clamp-1 text-xs text-white/45">{product.shortDescription}</p>}
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-lg font-black text-white">{formatUsd(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && <span className="text-xs text-white/35 line-through">{formatUsd(product.originalPrice)}</span>}
          </div>
        </div>
        <TebexBuyButton product={product} size="sm" label="Buy" className="h-9 shrink-0 rounded-full px-4" />
      </div>
    </article>
  )
}
