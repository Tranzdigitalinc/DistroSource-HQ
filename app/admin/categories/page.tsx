import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { Plus } from "lucide-react"
import { auth } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-emails"
import { getAdminCategories } from "@/lib/actions/admin-categories"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DeleteCategoryButton } from "@/components/admin/delete-category-button"

export const metadata = {
  title: "Categories | DistroSource Admin",
  description: "Organize the DistroSource catalog into browsable categories.",
}

export default async function AdminCategoriesPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in?next=/admin/categories")
  if (!isAdminEmail(session.user.email)) redirect("/")

  const categories = await getAdminCategories()

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Catalog</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">Categories</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{categories.length} categories in the catalog.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href="/admin" />} nativeButton={false}>
            Back to control center
          </Button>
          <Button size="sm" render={<Link href="/admin/categories/new" />} nativeButton={false}>
            <Plus className="size-3.5" aria-hidden="true" />
            New category
          </Button>
        </div>
      </header>

      <Card>
        <CardContent className="flex flex-col gap-2 p-4">
          {categories.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No categories yet.</p>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-4 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/60"
              >
                <Link href={`/admin/categories/${category.id}`} className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{category.name}</p>
                  <p className="truncate text-xs text-muted-foreground">/{category.slug}</p>
                </Link>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {category.productCount} product{category.productCount === 1 ? "" : "s"}
                </p>
                <DeleteCategoryButton categoryId={category.id} categoryName={category.name} productCount={category.productCount} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  )
}
