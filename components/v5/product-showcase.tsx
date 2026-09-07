import Link from "next/link"
import { V5ProductCard, type V5ProductCardData } from "@/components/v5/product-card"
import { ArrowRight } from "@/lib/storefront-icons"

export function V5ProductShowcase({
  eyebrow,
  title,
  description,
  href,
  items,
  tone = "light",
}: {
  eyebrow: string
  title: string
  description?: string
  href: string
  items: V5ProductCardData[]
  tone?: "light" | "dark"
}) {
  if (!items.length) return null
  const dark = tone === "dark"
  const [lead, ...rest] = items

  return (
    <section className={dark ? "bg-[#111827] py-18 text-white sm:py-22 lg:py-26" : "bg-background py-18 sm:py-22 lg:py-26"}>
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-9 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
            <h2 className={`mt-3 max-w-4xl font-display text-[clamp(2.5rem,5.2vw,5.5rem)] font-black leading-[0.9] tracking-[-0.065em] ${dark ? "text-white" : "text-foreground"}`}>{title}</h2>
            {description && <p className={`mt-4 max-w-2xl text-sm leading-7 ${dark ? "text-white/50" : "text-muted-foreground"}`}>{description}</p>}
          </div>
          <Link href={href} className={`group inline-flex items-center gap-2 text-sm font-semibold ${dark ? "text-white" : "text-foreground"}`}>View collection <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:gap-8">
          <V5ProductCard item={lead} variant="feature" className={dark ? "[&_h3]:text-white [&_.text-foreground]:text-white [&_.text-muted-foreground]:text-white/50" : undefined} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-2 lg:gap-x-5 lg:gap-y-8">
            {rest.slice(0, 4).map((item, index) => (
              <V5ProductCard key={item.product.id} item={item} variant={index < 2 ? "standard" : "wide"} className={dark ? "[&_h3]:text-white [&_.text-foreground]:text-white [&_.text-muted-foreground]:text-white/50" : undefined} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
