import { redirect, notFound } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-emails"
import { getAdminCategoryById, getAdminDepartments } from "@/lib/actions/admin-categories"
import { CategoryForm } from "@/components/admin/category-form"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Edit category | DistroSource Admin",
}

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in?next=/admin/categories")
  if (!isAdminEmail(session.user.email)) redirect("/")

  const { id } = await params
  const parsedId = Number.parseInt(id, 10)
  if (!Number.isFinite(parsedId)) notFound()

  const [category, departments] = await Promise.all([getAdminCategoryById(parsedId), getAdminDepartments()])
  if (!category) notFound()

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Catalog</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">{category.name}</h1>
          <Link href={`/categories/${category.slug}`} target="_blank" className="mt-1 inline-block text-xs text-muted-foreground underline-offset-2 hover:underline">
            View live page &rarr;
          </Link>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/admin/categories" />} nativeButton={false}>
          Back to categories
        </Button>
      </header>

      <CategoryForm category={category} departments={departments} />
    </main>
  )
}
