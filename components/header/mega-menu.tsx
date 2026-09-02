"use client"

import Link from "next/link"
import { getCategoryIcon } from "@/lib/category-icons"

interface Category {
  id: number
  slug: string
  name: string
  description: string | null
}

const GROUPS: { title: string; slugs: string[] }[] = [
  {
    title: "Design & Templates",
    slugs: ["website-templates", "presentations", "ui-ux-kits", "mockups"],
  },
  {
    title: "Business & Productivity",
    slugs: ["business-starter-kits", "industry-business-packs", "spreadsheet-systems", "notion-productivity", "business-documents"],
  },
  {
    title: "Creative Assets",
    slugs: ["graphics-illustrations", "fonts-typography", "icons", "branding-kits", "svg-craft-files"],
  },
  {
    title: "Dev & Tech",
    slugs: ["developer-products", "3d-stl-models"],
  },
  {
    title: "Learning & Family",
    slugs: ["learning-education", "kids-family", "wedding-events", "personal-planners"],
  },
  {
    title: "Creators & Bundles",
    slugs: ["creator-resources", "photography-video", "audio-sound-effects", "social-media-packs", "marketing-resources", "resume-career", "freelancer-resources", "premium-bundles"],
  },
]

export function MegaMenu({ categories }: { categories: Category[] }) {
  const bySlug = new Map(categories.map((c) => [c.slug, c]))

  return (
    <div className="grid grid-cols-3 gap-x-8 gap-y-6 p-6">
      {GROUPS.map((group) => {
        const items = group.slugs.map((slug) => bySlug.get(slug)).filter((c): c is Category => Boolean(c))
        if (items.length === 0) return null
        return (
          <div key={group.title} className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.title}</h3>
            <ul className="flex flex-col gap-1">
              {items.map((category) => {
                const Icon = getCategoryIcon(category.slug)
                return (
                  <li key={category.id}>
                    <Link
                      href={`/categories/${category.slug}`}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      {category.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
      <div className="col-span-3 flex items-center justify-between rounded-lg border border-border/60 bg-secondary/40 px-4 py-3">
        <p className="text-xs text-muted-foreground">Explore the full catalog across every category</p>
        <Link href="/categories" className="text-xs font-semibold text-primary hover:underline">
          View all categories
        </Link>
      </div>
    </div>
  )
}
