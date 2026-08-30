import Link from "next/link"
import Image from "next/image"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { getCategories } from "@/lib/queries/catalog"
import { getCategoryImage } from "@/lib/category-icons"

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
          <h1 className="font-display text-3xl font-bold tracking-tight">All categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Explore every corner of the RedeemCove catalog</p>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group relative flex h-40 flex-col justify-end overflow-hidden rounded-xl border border-border p-5"
              >
                <Image
                  src={getCategoryImage(category.slug)}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <h2 className="relative font-display text-lg font-bold text-white">{category.name}</h2>
                <p className="relative line-clamp-1 text-xs text-white/75">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
