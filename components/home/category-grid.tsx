import Link from "next/link"
import Image from "next/image"
import { getCategoryImage } from "@/lib/category-icons"
import type { getCategories } from "@/lib/queries/catalog"

export function CategoryGrid({ categories }: { categories: Awaited<ReturnType<typeof getCategories>> }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Shop by category</h2>
          <p className="mt-1 text-sm text-muted-foreground">Find the right code for gaming, streaming, and more</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >
            <div className="relative size-14 overflow-hidden rounded-full ring-1 ring-border">
              <Image
                src={getCategoryImage(category.slug)}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <span className="text-xs font-medium leading-snug text-balance">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
