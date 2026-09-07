import Link from "next/link"
import Image from "next/image"
import { GamingPreview } from "@/components/gaming/gaming-preview"
import { hasRealImages, resolveGamingImage } from "@/lib/gaming/images"
import { TebexBuyButton } from "@/components/gaming/tebex-buy-button"
import { getGamingBadges } from "@/lib/gaming/queries"
import { CATEGORY_LABEL, PLATFORM_LABEL, type GamingProduct } from "@/lib/gaming/types"
import { formatUsd } from "@/lib/format"
import { ArrowRight } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

export function GamingProductCard({ product, className }: { product: GamingProduct; className?: string }) {
  const href = `/gaming/product/${product.slug}`
  const badges = getGamingBadges(product)
  const discounted = product.originalPrice && product.originalPrice > product.price

  return (
    <article className={cn("group min-w-0", className)}>
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.04]">
        <Link href={href} className="relative block aspect-[4/3] overflow-hidden">
          {hasRealImages(product.images) ? <Image src={resolveGamingImage(product.images[0])} alt={product.title} fill sizes="(max-width:640px) 50vw, (max-width:1100px) 33vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.035]" /> : <GamingPreview art={product.art[0]} caption={false} className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.035]" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-70" />
          {badges.length > 0 && <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">{badges.slice(0, 2).map((badge) => <span key={badge} className="bg-primary px-2 py-1 font-mono text-[8px] font-black uppercase tracking-[0.1em] text-primary-foreground">{badge}</span>)}</div>}
          <div className="absolute inset-x-0 bottom-0 p-4"><p className="font-mono text-[8px] font-black uppercase tracking-[0.1em] text-white/55">{PLATFORM_LABEL[product.platform]} · {CATEGORY_LABEL[product.category]}</p></div>
        </Link>
      </div>

      <div className="pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><h3 className="font-display text-[15px] font-black leading-[1.05] tracking-[-0.035em] text-foreground"><Link href={href} className="hover:text-primary">{product.title}</Link></h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{product.shortDescription}</p></div>
          <Link href={href} aria-label={`Open ${product.title}`} className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:bg-foreground hover:text-background"><ArrowRight size={13} /></Link>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3"><div className="flex items-baseline gap-2"><span className="font-display text-lg font-black">{formatUsd(product.price)}</span>{discounted && <span className="text-xs text-muted-foreground line-through">{formatUsd(product.originalPrice!)}</span>}</div><TebexBuyButton product={product} size="sm" label="Buy" className="h-9 rounded-none px-4" /></div>
      </div>
    </article>
  )
}
