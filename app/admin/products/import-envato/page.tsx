import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-emails"
import { getCategories } from "@/lib/queries/catalog"
import { EnvatoImportPanel } from "@/components/admin/envato-import-panel"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Import from Envato | DistroSource Admin",
}

export default async function ImportEnvatoPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in?next=/admin/products/import-envato")
  if (!isAdminEmail(session.user.email)) redirect("/")

  const categories = await getCategories()

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Catalog</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
            Import from Envato
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Search ThemeForest, CodeCanyon, and GraphicRiver, then import an item as a new DistroSource product at
            your own price. Imported items are saved as drafts — attach a file and finish editing before publishing.
          </p>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/admin/products" />} nativeButton={false}>
          Back to products
        </Button>
      </header>

      <EnvatoImportPanel categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </main>
  )
}
