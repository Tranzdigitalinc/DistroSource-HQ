import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import Image from "next/image"
import { Plus } from "lucide-react"
import { auth } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-emails"
import { getAdminProducts } from "@/lib/actions/admin-products"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export const metadata = {
  title: "Products | DistroSource Admin",
  description: "Manage the DistroSource product catalog.",
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in?next=/admin/products")
  if (!isAdminEmail(session.user.email)) redirect("/")

  const { search } = await searchParams
  const rows = await getAdminProducts(search)

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Catalog</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">Products</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{rows.length} products in the catalog.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href="/admin" />} nativeButton={false}>
            Back to control center
          </Button>
          <Button size="sm" render={<Link href="/admin/products/new" />} nativeButton={false}>
            <Plus className="size-3.5" aria-hidden="true" />
            New product
          </Button>
        </div>
      </header>

      <form action="/admin/products" method="get" className="flex items-center gap-3">
        <Input name="search" defaultValue={search ?? ""} placeholder="Search by name or slug" className="max-w-sm" />
        <Button type="submit" size="sm" variant="outline">
          Search
        </Button>
      </form>

      <Card>
        <CardContent className="flex flex-col gap-2 p-4">
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No products match this search.</p>
          ) : (
            rows.map(({ product, category }) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                className="flex items-center gap-4 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/60"
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                  {product.thumbnailUrl ? (
                    <Image src={product.thumbnailUrl || "/placeholder.svg"} alt="" fill className="object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{category.name} · /{product.slug}</p>
                </div>
                <p className="shrink-0 text-sm font-medium text-foreground">${product.basePrice}</p>
                <Badge variant={product.status === "published" ? "secondary" : "outline"} className="shrink-0 capitalize">
                  {product.status}
                </Badge>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  )
}
