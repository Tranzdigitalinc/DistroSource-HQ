import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-emails"
import { getCategories } from "@/lib/queries/catalog"
import { ProductForm } from "@/components/admin/product-form"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "New product | DistroSource Admin",
}

export default async function NewProductPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in?next=/admin/products/new")
  if (!isAdminEmail(session.user.email)) redirect("/")

  const categories = await getCategories()

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Catalog</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">New product</h1>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/admin/products" />} nativeButton={false}>
          Back to products
        </Button>
      </header>

      <ProductForm categories={categories} />
    </main>
  )
}
