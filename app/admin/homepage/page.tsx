import Link from "next/link"
import { redirect } from "next/navigation"
import { headers as nextHeaders } from "next/headers"
import { auth } from "@/lib/auth"
import { getHomepageMerchandising } from "@/lib/actions/admin-homepage"
import { isAdminEmail } from "@/lib/admin-emails"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HomepageFlagToggle } from "@/components/admin/homepage-flag-toggle"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Homepage merchandising | DistroSource Admin",
  description: "Choose which published products appear in the homepage's Featured and New Release rails.",
}

export default async function AdminHomepagePage() {
  const session = await auth.api.getSession({ headers: await nextHeaders() })
  if (!session?.user || !isAdminEmail(session.user.email)) redirect("/sign-in")

  const { featured, newReleases, rest } = await getHomepageMerchandising()

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header>
        <Button variant="outline" size="sm" render={<Link href="/admin" />} nativeButton={false}>
          <ArrowLeft className="h-4 w-4" />
          Admin
        </Button>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground">
          Homepage merchandising
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Only published products can appear on the homepage. Toggling a flag updates the live site immediately.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Featured</CardTitle>
            <CardDescription>{featured.length} product{featured.length === 1 ? "" : "s"} currently featured</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New releases</CardTitle>
            <CardDescription>{newReleases.length} product{newReleases.length === 1 ? "" : "s"} marked as new</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Published products</CardTitle>
          <CardDescription>Check a box to add a product to that homepage rail, uncheck to remove it.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {[...featured, ...newReleases, ...rest].length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No published products yet.</p>
          ) : (
            [...featured, ...newReleases, ...rest].map(({ product, categoryName }) => (
              <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link href={`/admin/products/${product.id}`} className="truncate text-sm font-medium text-foreground hover:text-primary">
                    {product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{categoryName}</p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <HomepageFlagToggle productId={product.id} flag="isFeatured" defaultChecked={product.isFeatured} label="Featured" />
                  <HomepageFlagToggle productId={product.id} flag="isNewRelease" defaultChecked={product.isNewRelease} label="New release" />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  )
}
