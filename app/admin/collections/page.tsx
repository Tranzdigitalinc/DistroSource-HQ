import Link from "next/link"
import { redirect } from "next/navigation"
import { headers as nextHeaders } from "next/headers"
import { auth } from "@/lib/auth"
import { getAdminCollections } from "@/lib/actions/admin-collections"
import { isAdminEmail } from "@/lib/admin-emails"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreateCollectionDialog } from "@/components/admin/create-collection-dialog"
import { ArrowLeft, Package } from "lucide-react"

export const metadata = {
  title: "Collections | DistroSource Admin",
  description: "Manage bundled products sold as a single collection.",
}

export default async function AdminCollectionsPage() {
  const session = await auth.api.getSession({ headers: await nextHeaders() })
  if (!session?.user || !isAdminEmail(session.user.email)) redirect("/sign-in")

  const collections = await getAdminCollections()

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-2 gap-1.5 text-muted-foreground"
            render={<Link href="/admin" />}
            nativeButton={false}
          >
            <ArrowLeft className="h-4 w-4" />
            Admin
          </Button>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Collections</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bundles package several products together and are sold as a single item.
          </p>
        </div>
        <CreateCollectionDialog />
      </header>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Package className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No bundles yet. Create one to package products together.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {collections.map((bundle) => (
            <Link
              key={bundle.id}
              href={`/admin/products/${bundle.id}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{bundle.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {bundle.categoryName} · {bundle.itemCount} {bundle.itemCount === 1 ? "item" : "items"} · $
                    {Number.parseFloat(bundle.basePrice).toFixed(2)}
                  </p>
                </div>
              </div>
              <Badge variant={bundle.status === "published" ? "default" : "secondary"} className="capitalize">
                {bundle.status}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
