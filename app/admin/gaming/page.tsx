import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { ExternalLink, Gamepad2, Info } from "lucide-react"
import { auth } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-emails"
import { getGamingProducts } from "@/lib/gaming/queries"
import { CATEGORY_LABEL, PLATFORM_LABEL } from "@/lib/gaming/types"
import { isTebexConfigured } from "@/lib/gaming/tebex"
import { GamingPreview } from "@/components/gaming/gaming-preview"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export const metadata = {
  title: "Gaming | DistroSource Admin",
  description: "Manage the DistroSource Gaming catalog.",
}

const PLATFORM_FILTERS = [
  { value: "", label: "All platforms" },
  { value: "fivem", label: "FiveM" },
  { value: "minecraft", label: "Minecraft" },
  { value: "other", label: "Game servers" },
] as const

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "published", label: "Published" },
  { value: "unpublished", label: "Unpublished" },
  { value: "featured", label: "Featured" },
  { value: "bestseller", label: "Bestseller" },
] as const

export default async function AdminGamingPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; platform?: string; status?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in?next=/admin/gaming")
  if (!isAdminEmail(session.user.email)) redirect("/")

  const { search, platform, status } = await searchParams
  const platformFilter = PLATFORM_FILTERS.find((f) => f.value === platform)?.value || ""
  const statusFilter = STATUS_FILTERS.find((f) => f.value === status)?.value || ""
  const term = (search ?? "").trim().toLowerCase()

  const all = getGamingProducts()
  const rows = all.filter((product) => {
    if (platformFilter && product.platform !== platformFilter) return false
    if (statusFilter === "published" && !product.published) return false
    if (statusFilter === "unpublished" && product.published) return false
    if (statusFilter === "featured" && !product.featured) return false
    if (statusFilter === "bestseller" && !product.bestseller) return false
    if (term && !`${product.title} ${product.slug} ${product.tebexPackageId}`.toLowerCase().includes(term)) return false
    return true
  })

  const published = all.filter((p) => p.published).length
  const tebexLive = all.filter(isTebexConfigured).length

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
            {all.length} Gaming products &middot; {published} published &middot; sold directly by DistroSource, paid through Tebex.
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

      {/* This section reads the catalog, it does not write it. Editing needs a
          gaming_products table — the path is written up in docs/GAMING-ADMIN.md. */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex-row items-start gap-3 space-y-0">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Info className="size-4.5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle className="text-base font-semibold">This catalog is code-backed, not database-backed</CardTitle>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Gaming products live in <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">lib/gaming/products.ts</code>.
              This screen is read-only: create, edit and publish controls need a{" "}
              <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">gaming_products</code> table, and the production database
              has no migration baseline yet. The full migration path is written up in{" "}
              <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">docs/GAMING-ADMIN.md</code>.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 border-t border-primary/20 pt-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground">Checkout provider</p>
            <p className="font-semibold text-foreground">Tebex (Gaming only)</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tebex packages</p>
            <p className="font-semibold text-foreground">
              {tebexLive === 0 ? "Placeholder IDs" : `${tebexLive} of ${all.length} live`}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Regular catalog</p>
            <p className="font-semibold text-foreground">Unchanged (Polar)</p>
          </div>
        </CardContent>
      </Card>

      <form action="/admin/gaming" method="get" className="flex flex-wrap items-center gap-3">
        <Input name="search" defaultValue={search ?? ""} placeholder="Search by title, slug or Tebex package ID" className="max-w-sm" />
        <input type="hidden" name="status" value={statusFilter} />
        <div className="flex flex-wrap items-center gap-1 border border-border p-1">
          {PLATFORM_FILTERS.map((f) => (
            <Button
              key={f.value || "all-platforms"}
              type="submit"
              name="platform"
              value={f.value}
              size="sm"
              variant={platformFilter === f.value ? "default" : "ghost"}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-1 border border-border p-1">
        {STATUS_FILTERS.map((f) => {
          const params = new URLSearchParams()
          if (search) params.set("search", search)
          if (platformFilter) params.set("platform", platformFilter)
          if (f.value) params.set("status", f.value)
          const query = params.toString()
          return (
            <Button
              key={f.value || "all-status"}
              size="sm"
              variant={statusFilter === f.value ? "default" : "ghost"}
              render={<Link href={query ? `/admin/gaming?${query}` : "/admin/gaming"} />}
              nativeButton={false}
            >
              {f.label}
            </Button>
          )
        })}
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No Gaming products match these filters.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((product) => (
            <Card key={product.id}>
              <CardContent className="flex flex-wrap items-start gap-4 p-4">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                  <GamingPreview art={product.art[0]} caption={false} />
                </div>

                <div className="min-w-64 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/gaming/${product.slug}`} className="font-semibold text-foreground hover:underline">
                      {product.title}
                    </Link>
                    {product.featured && <Badge variant="secondary">Featured</Badge>}
                    {product.bestseller && <Badge variant="secondary">Bestseller</Badge>}
                    <Badge variant={product.published ? "default" : "outline"}>
                      {product.published ? "Published" : "Unpublished"}
                    </Badge>
                  </div>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">/gaming/product/{product.slug}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {PLATFORM_LABEL[product.platform]} &middot; {CATEGORY_LABEL[product.category]} &middot; v{product.version} &middot; updated{" "}
                    {product.lastUpdated}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">Tebex package {product.tebexPackageId}</p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <p className="text-base font-semibold text-foreground">${product.price.toFixed(2)}</p>
                  {product.originalPrice !== null && (
                    <p className="text-xs text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</p>
                  )}
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
          ))}
        </div>
      )}
    </main>
  )
}
