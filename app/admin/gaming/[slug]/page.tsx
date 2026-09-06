import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { ExternalLink, ImageOff, Info } from "lucide-react"
import { auth } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-emails"
import { getGamingProductBySlug, getGamingProductSlugs } from "@/lib/gaming/queries"
import { CATEGORY_LABEL, PLATFORM_LABEL } from "@/lib/gaming/types"
import { isTebexConfigured } from "@/lib/gaming/tebex"
import { GamingPreview } from "@/components/gaming/gaming-preview"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getGamingProductBySlug(slug)
  return {
    title: product ? `${product.title} | DistroSource Admin` : "Gaming product | DistroSource Admin",
    description: "Gaming product record.",
  }
}

export function generateStaticParams() {
  return getGamingProductSlugs().map((slug) => ({ slug }))
}

/** One label/value row. `mono` for identifiers that get copied into Tebex. */
function Field({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <div className={mono ? "mt-1 break-all font-mono text-sm text-foreground" : "mt-1 text-sm text-foreground"}>{value}</div>
    </div>
  )
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-6 text-muted-foreground">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default async function AdminGamingProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect(`/sign-in?next=/admin/gaming/${slug}`)
  if (!isAdminEmail(session.user.email)) redirect("/")

  const product = getGamingProductBySlug(slug)
  if (!product) notFound()

  const tebexLive = isTebexConfigured(product)

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Gaming product</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">{product.title}</h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">{product.id}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={product.published ? "default" : "outline"}>{product.published ? "Published" : "Unpublished"}</Badge>
            {product.featured && <Badge variant="secondary">Featured</Badge>}
            {product.bestseller && <Badge variant="secondary">Bestseller</Badge>}
            {product.popular && <Badge variant="secondary">Popular</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href="/admin/gaming" />} nativeButton={false}>
            Back to Gaming
          </Button>
          <Button variant="outline" size="sm" render={<Link href={`/gaming/product/${product.slug}`} />} nativeButton={false}>
            <ExternalLink className="size-3.5" aria-hidden="true" />
            Storefront
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catalog fields</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Field label="Slug" value={`/gaming/product/${product.slug}`} mono />
              <Field label="Platform" value={PLATFORM_LABEL[product.platform]} />
              <Field label="Category" value={`${CATEGORY_LABEL[product.category]} — ${product.subcategory}`} />
              <Field
                label="Price"
                value={
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">${product.price.toFixed(2)}</span>
                    {product.originalPrice !== null && (
                      <span className="text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                    )}
                  </span>
                }
              />
              <Field label="Version" value={`v${product.version}`} mono />
              <Field label="Released" value={product.releasedAt} mono />
              <Field label="Last updated" value={product.lastUpdated} mono />
              <Field label="Tags" value={product.tags.join(", ")} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tebex checkout</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Field label="Package ID" value={product.tebexPackageId} mono />
              <Field label="Package URL" value={product.tebexPackageUrl} mono />
              <Field
                label="Status"
                value={
                  tebexLive ? (
                    "Live — Buy Now sends the customer to Tebex."
                  ) : (
                    <span className="text-muted-foreground">
                      Placeholder — Buy Now shows a &ldquo;checkout not yet available&rdquo; notice instead of sending anyone to a dead link. Point
                      the package URL at the real Tebex store to go live.
                    </span>
                  )
                }
              />
              <Field
                label="Payment separation"
                value="Gaming products never enter the Polar cart or the regular DistroSource checkout. Buy Now is a direct redirect, so the two systems cannot be mixed in one transaction."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Copy</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Field label="Short description" value={product.shortDescription} />
              <Field label="Description" value={<span className="leading-6 text-muted-foreground">{product.description}</span>} />
            </CardContent>
          </Card>

          <ListCard title="Features" items={product.features} />
          <ListCard title="What is included" items={product.included} />
          <ListCard title="Requirements" items={product.requirements} />
          <ListCard title="Compatibility" items={product.compatibility} />
          <ListCard title="Installation" items={product.installation} />

          {product.changelog.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Changelog</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {product.changelog.map((entry) => (
                  <div key={entry.version}>
                    <p className="font-mono text-xs font-semibold text-foreground">
                      v{entry.version} &middot; {entry.date}
                    </p>
                    <ul className="mt-1 flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
                      {entry.notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {product.faq.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">FAQ</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {product.faq.map((entry) => (
                  <div key={entry.question}>
                    <p className="text-sm font-semibold text-foreground">{entry.question}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{entry.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Imagery</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {/* Every gallery view, so an admin can see exactly what the
                  product page shows without leaving the dashboard. */}
              {product.art.map((view) => (
                <div key={view.caption} className="overflow-hidden rounded-md border border-border bg-secondary">
                  <GamingPreview art={view} />
                </div>
              ))}
              <p className="font-mono text-[11px] text-muted-foreground">
                {product.art.length} schematic {product.art.length === 1 ? "view" : "views"} &middot; scene{" "}
                {product.art.map((v) => v.scene).join(", ")}
              </p>
              {product.images.length === 0 ? (
                <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                  <ImageOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  No photographic capture uploaded. The storefront renders the schematics above and never presents one as a screenshot of the
                  delivered files. Upload real captures once the product files exist.
                </p>
              ) : (
                <ul className="flex flex-col gap-1 break-all font-mono text-xs text-muted-foreground">
                  {product.images.map((image) => (
                    <li key={image}>{image}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="flex-row items-start gap-3 space-y-0">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Info className="size-4.5" aria-hidden="true" />
              </span>
              <div>
                <CardTitle className="text-base font-semibold">Editing this record</CardTitle>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Every field above is defined in{" "}
                  <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">lib/gaming/products.ts</code>. Editing here needs a{" "}
                  <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">gaming_products</code> table; the migration and the server
                  actions it unlocks are specified in <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">docs/GAMING-ADMIN.md</code>.
                </p>
              </div>
            </CardHeader>
          </Card>
        </aside>
      </div>
    </main>
  )
}
