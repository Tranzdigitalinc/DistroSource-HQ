import Link from "next/link"
import { ArrowRight } from "@/lib/storefront-icons"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { getCategoryTree } from "@/lib/queries/catalog"

export const metadata = {
  title: "Departments — DistroSource",
  description: "Browse every DistroSource department and active digital-product category.",
}

export default async function CategoriesPage() {
  const tree = (await getCategoryTree())
    .map((department) => ({ ...department, subcategories: department.subcategories.filter((subcategory) => subcategory.productCount > 0) }))
    .filter((department) => department.subcategories.length > 0)
  const total = tree.reduce((count, department) => count + department.subcategories.length, 0)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-[#111827] text-white">
          <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">The directory</p>
            <div className="mt-4 grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <h1 className="font-display text-[clamp(3.7rem,8vw,8rem)] font-black leading-[0.84] tracking-[-0.08em]">Find your aisle.</h1>
              <div className="lg:justify-self-end"><p className="max-w-xl text-sm leading-7 text-white/48">Browse DistroSource by what you are trying to make—not by an endless list of file types.</p><p className="mt-5 font-mono text-[9px] uppercase tracking-[0.1em] text-white/35">{tree.length} departments · {total} active categories</p></div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="space-y-20 lg:space-y-28">
            {tree.map((department, departmentIndex) => (
              <section key={department.slug} aria-labelledby={`dept-${department.slug}`} className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[380px_minmax(0,1fr)]">
                <div className="lg:sticky lg:top-24 lg:self-start">
                  <p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">0{departmentIndex + 1} · {department.productCount} products</p>
                  <h2 id={`dept-${department.slug}`} className="mt-4 font-display text-4xl font-black leading-[0.92] tracking-[-0.055em] sm:text-5xl">{department.name}</h2>
                  {department.description && <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">{department.description}</p>}
                  <Link href={`/categories/${department.slug}`} className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold">Explore department <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></Link>
                </div>

                <div className="grid border-l border-t border-border sm:grid-cols-2 xl:grid-cols-3">
                  {department.subcategories.map((category, index) => (
                    <Link key={category.slug} href={`/categories/${category.slug}`} className={`group relative min-h-[230px] border-b border-r border-border p-5 transition-colors ${index === 0 ? "bg-primary/[0.07]" : "hover:bg-secondary/40"}`}>
                      <div className="flex items-start justify-between"><span className="font-mono text-[9px] font-black text-muted-foreground">{String(index + 1).padStart(2, "0")}</span><span className="font-mono text-[9px] text-muted-foreground">{category.productCount}</span></div>
                      <div className="absolute inset-x-5 bottom-5"><h3 className="font-display text-2xl font-black leading-[0.98] tracking-[-0.045em]">{category.name}</h3>{category.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{category.description}</p>}<span className="mt-5 inline-flex size-9 items-center justify-center rounded-full bg-foreground text-background transition-transform group-hover:translate-x-1"><ArrowRight size={13} /></span></div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
