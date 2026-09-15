import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { CreditCard, ExternalLink, Gamepad2, Info } from "lucide-react"
import { auth } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-emails"
import { GAMING_CATALOG } from "@/lib/gaming/catalog/products"
import { GAMING_PLATFORMS, SUBSCRIPTION_MODELS, categoryLabel, platformLabel } from "@/lib/gaming/catalog/taxonomy"
import { priceLabel } from "@/lib/gaming/catalog/pricing"
import type { GamingAvailability, GamingPlatform } from "@/lib/gaming/catalog/types"
import { getGamingFungiesMappings } from "@/lib/gaming/fungies-sync"
import { GamingImage } from "@/components/gaming/gaming-image"
import { GamingFungiesSync } from "@/components/admin/gaming-fungies-sync"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export const metadata = {
  title: "Gaming | DistroSource Admin",
  description: "The DistroSource Gaming catalogue and its Fungies billing.",
}

// The Fungies sync runs as a server action on this page, in small batches.
export const maxDuration = 60

const AVAILABILITY_LABEL: Record<GamingAvailability, string> = {
  "on-sale": "On sale",
  launching: "Launching",
  unlisted: "Unlisted",
}

export default async function AdminGamingPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; platform?: string; availability?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in?next=/admin/gaming")
  if (!isAdminEmail(session.user.email)) redirect("/")

  const { search, platform, availability } = await searchParams
  const platformFilter = GAMING_PLATFORMS.some((p) => p.id === platform) ? (platform as GamingPlatform) : ""
  const availabilityFilter = availability && availability in AVAILABILITY_LABEL ? (availability as GamingAvailability) : ""
  const term = (search ?? "").trim().toLowerCase()

  const all = GAMING_CATALOG
  const rows = all.filter((p) => {
    if (platformFilter && p.platform !== platformFilter) return false
    if (availabilityFilter && p.availability !== availabilityFilter) return false
    if (term && !`${p.title} ${p.slug} ${p.id}`.toLowerCase().includes(term)) return false
    return true
  })
  const count = (a: GamingAvailability) => all.filter((p) => p.availability === a).length

  // Null when the billing tables haven't been created yet.
  const mappings = await getGamingFungiesMappings()
  const billable = all.filter((p) => p.pricing.kind === "subscription")
  const mappedCount = mappings ? billable.filter((p) => mappings.get(p.slug)?.fungiesPlanId).length : 0

  const filterHref = (next: { platform?: string; availability?: string }) => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    const pf = next.platform ?? platformFilter
    const af = next.availability ?? availabilityFilter
    if (pf) params.set("platform", pf)
    if (af) params.set("availability", af)
    const q = params.toString()
    return q ? `/admin/gaming?${q}` : "/admin/gaming"
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Catalog</p>
          <h1 className="mt-2 flex items-center gap-2 font-display text-3xl font-semibold tracking-tight text-foreground">
            <Gamepad2 className="size-7 text-primary" aria-hidden="true" />
            Gaming
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {all.length} products &middot; {count("on-sale")} on sale &middot; {count("launching")} launching &middot; {count("unlisted")} unlisted
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href="/admin" />} nativeButton={false}>
            Back to control center
          </Button>
          <Button variant="outline" size="sm" render={<Link href="/gaming" />} nativeButton={false}>
            View storefront
          </Button>
        </div>
      </header>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex-row items-start gap-3 space-y-0">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Info className="size-4.5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle className="text-base font-semibold">Code-backed catalogue</CardTitle>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Records live in <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">lib/gaming/catalog/products.ts</code>. An
              <em> on sale</em> plan takes real payments through Fungies once it is set up there (below); a <em>launching</em> product is
              fully presented but never offers checkout. The previous catalogue is archived in{" "}
              <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">scripts/gaming/legacy/</code>. See{" "}
              <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">docs/PAYMENTS-FUNGIES.md</code>.
            </p>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start gap-3 space-y-0">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
            <CreditCard className="size-4.5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle className="text-base font-semibold">Fungies billing</CardTitle>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Each Gaming plan is its own Fungies Subscription product with one plan. Syncing creates whatever is missing in your
              Fungies account and links it here; subscribers are billed per signup at the catalogue price. Plans that aren&apos;t set
              up can&apos;t be checked out.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {mappings === null ? (
            <p className="rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
              The billing tables don&apos;t exist yet. Run{" "}
              <code className="font-mono text-xs">scripts/db/add-gaming-subscriptions.sql</code> in the Neon console, then reload this page.
            </p>
          ) : (
            <GamingFungiesSync mapped={mappedCount} total={billable.length} />
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <form action="/admin/gaming" method="get" className="flex flex-wrap items-center gap-3">
          <Input name="search" defaultValue={search ?? ""} placeholder="Search by title, slug or id" className="max-w-sm" />
          {platformFilter && <input type="hidden" name="platform" value={platformFilter} />}
          {availabilityFilter && <input type="hidden" name="availability" value={availabilityFilter} />}
          <Button type="submit" size="sm" variant="outline">
            Search
          </Button>
        </form>
        <div className="flex flex-wrap items-center gap-1 border border-border p-1">
          <Button size="sm" variant={!platformFilter ? "default" : "ghost"} render={<Link href={filterHref({ platform: "" })} />} nativeButton={false}>
            All platforms
          </Button>
          {GAMING_PLATFORMS.map((p) => (
            <Button key={p.id} size="sm" variant={platformFilter === p.id ? "default" : "ghost"} render={<Link href={filterHref({ platform: p.id })} />} nativeButton={false}>
              {p.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1 border border-border p-1">
          <Button size="sm" variant={!availabilityFilter ? "default" : "ghost"} render={<Link href={filterHref({ availability: "" })} />} nativeButton={false}>
            Any status
          </Button>
          {(Object.keys(AVAILABILITY_LABEL) as GamingAvailability[]).map((a) => (
            <Button key={a} size="sm" variant={availabilityFilter === a ? "default" : "ghost"} render={<Link href={filterHref({ availability: a })} />} nativeButton={false}>
              {AVAILABILITY_LABEL[a]}
            </Button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">No Gaming products match these filters.</CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((product) => {
            const inFungies = Boolean(mappings?.get(product.slug)?.fungiesPlanId)
            return (
              <Card key={product.id}>
                <CardContent className="flex flex-wrap items-start gap-4 p-4">
                  <div className="w-32 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                    <GamingImage image={product.cardImage} sizes="128px" className="aspect-[16/10] h-auto w-full object-cover" />
                  </div>
                  <div className="min-w-64 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/gaming/${product.slug}`} className="font-semibold text-foreground hover:underline">
                        {product.title}
                      </Link>
                      <Badge variant={product.availability === "on-sale" ? "default" : "outline"}>{AVAILABILITY_LABEL[product.availability]}</Badge>
                      {product.pricing.kind === "subscription" && (
                        <Badge variant={inFungies ? "secondary" : "outline"}>{inFungies ? "In Fungies" : "Not in Fungies"}</Badge>
                      )}
                      {product.models.map((m) => (
                        <Badge key={m} variant="secondary">
                          {SUBSCRIPTION_MODELS[m].label}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">/gaming/product/{product.slug}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {platformLabel(product.platform)} &middot; {categoryLabel(product.platform, product.category)} &middot; curation {product.curation} &middot; updated {product.updatedAt}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <p className="text-base font-semibold text-foreground">{priceLabel(product.pricing)}</p>
                    <Button variant="outline" size="sm" render={<Link href={`/admin/gaming/${product.slug}`} />} nativeButton={false}>
                      Details
                    </Button>
                    <Button variant="ghost" size="sm" render={<Link href={`/gaming/product/${product.slug}`} />} nativeButton={false}>
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                      Storefront
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}
