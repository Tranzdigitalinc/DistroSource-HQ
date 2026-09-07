import Link from "next/link"
import Image from "next/image"
import { getFeaturedGamingProducts } from "@/lib/gaming/queries"
import { hasRealImages, resolveGamingImage } from "@/lib/gaming/images"
import { PLATFORM_LABEL } from "@/lib/gaming/types"
import { formatUsd } from "@/lib/format"
import { RevealGroup, RevealItem, Reveal } from "@/components/motion/reveal"
import { ArrowRight, GameController, ICON_SIZE } from "@/lib/storefront-icons"

/**
 * Gaming as a navy band: the one department with its own storefront gets
 * the one dark section on the page. Four real products, one way in.
 */
export function GamingTeaser() {
  const products = getFeaturedGamingProducts(4)
  if (products.length === 0) return null

  return (
    <section className="relative overflow-hidden bg-navy text-navy-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(var(--color-navy-foreground) 1px, transparent 1px)", backgroundSize: "10px 10px" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/2 h-[30rem] w-[30rem] -translate-y-1/2 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--glow), transparent 70%)" }}
      />

      <div className="container-x relative grid gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14">
        <Reveal className="flex flex-col items-start gap-5">
          <span className="flex size-11 items-center justify-center rounded-xl bg-navy-foreground/10 text-primary">
            <GameController size={ICON_SIZE.feature} aria-hidden="true" />
          </span>
          <p className="eyebrow text-navy-foreground/60">DistroSource Gaming</p>
          <h2 className="text-display text-3xl sm:text-4xl">Built for the servers you run.</h2>
          <p className="max-w-sm text-pretty text-sm leading-relaxed text-navy-foreground/70 sm:text-base">
            FiveM maps and MLOs, Minecraft server packs, interfaces, vehicles and configurations — every product sold directly by DistroSource, with real screenshots of what you get.
          </p>
          <Link
            href="/gaming"
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            Explore Gaming
            <ArrowRight size={ICON_SIZE.base} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </Reveal>

        <RevealGroup className="grid grid-cols-2 gap-3 sm:gap-4" stagger={0.06}>
          {products.map((product) => {
            const real = hasRealImages(product.images)
            return (
              <RevealItem key={product.id} className="h-full">
                <Link
                  href={`/gaming/product/${product.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-navy-foreground/10 bg-navy-deep/60 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:hover:translate-y-0"
                >
                  <span className="relative block aspect-[16/10] overflow-hidden bg-navy-deep">
                    {real ? (
                      <Image
                        src={resolveGamingImage(product.cardImage ?? product.images[0])}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                      />
                    ) : null}
                  </span>
                  <span className="flex flex-1 flex-col gap-1 p-3.5">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-navy-foreground/55">{PLATFORM_LABEL[product.platform]}</span>
                    <span className="line-clamp-2 text-sm font-semibold leading-snug">{product.title}</span>
                    <span className="mt-auto pt-2 font-display text-base font-bold tabular-nums">{formatUsd(product.price)}</span>
                  </span>
                </Link>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </div>
    </section>
  )
}
