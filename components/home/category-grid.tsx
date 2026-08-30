import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { getCategoryImage } from "@/lib/category-icons"
import type { getCategories } from "@/lib/queries/catalog"

export function CategoryGrid({ categories }: { categories: Awaited<ReturnType<typeof getCategories>> }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">Shop by category</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Find the right code for gaming, streaming, and more</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg"
          >
            <Image
              src={getCategoryImage(category.slug)}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent transition-colors group-hover:from-black/85" />
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
              <span className="font-display text-base font-medium text-white text-balance sm:text-lg">
                {category.name}
              </span>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-white opacity-0 ring-1 ring-white/30 transition-opacity group-hover:opacity-100">
                <ArrowUpRight className="size-3.5" />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
