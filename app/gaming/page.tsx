import Link from "next/link"
import { SiteFooter } from "@/components/footer/site-footer"
import { SiteHeader } from "@/components/header/site-header"
import { getPublishedGamingCatalog } from "@/lib/queries/gaming"

export const metadata = {
  title: "Gaming — DistroSource",
  description: "Game-ready digital products, assets, scripts, and tools from DistroSource.",
}

export default async function GamingPage() {
  const { products, categories } = await getPublishedGamingCatalog()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-hero">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-accent">DistroSource Gaming</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight text-hero-foreground text-balance sm:text-6xl">
              Build better game worlds.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
              Curated scripts, assets, tools, and production-ready resources for creators shipping multiplayer experiences.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Browse the collection</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">Gaming tools and assets</h2>
            </div>
            <p className="text-sm text-muted-foreground">{products.length} published products</p>
          </div>

          {categories.length > 0 && (
            <nav aria-label="Gaming categories" className="mt-8 flex flex-wrap gap-2">
              {categories.map((category) => (
                <span key={category.id} className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
                  {category.name}
                </span>
              ))}
            </nav>
          )}

          {products.length === 0 ? (
            <div className="mt-10 rounded-xl border border-dashed border-border p-12 text-center">
              <h3 className="font-display text-lg font-semibold">The collection is loading</h3>
              <p className="mt-2 text-sm text-muted-foreground">New gaming products will appear here as they are published.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Link key={product.id} href={`/gaming/${product.slug}`} className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-border-strong hover:bg-secondary/30">
                  <div className="aspect-[16/10] overflow-hidden rounded-lg bg-secondary">
                    {product.thumbnailUrl ? (
                      <img src={product.thumbnailUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-wider text-muted-foreground">{product.platform}</div>
                    )}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{product.platform}</p>
                      <h3 className="mt-1 font-display font-semibold group-hover:underline">{product.name}</h3>
                    </div>
                    <span className="font-mono text-sm font-semibold">${product.price}</span>
                  </div>
                  {product.tagline && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{product.tagline}</p>}
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
