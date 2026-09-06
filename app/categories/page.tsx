import Link from "next/link"
import { ArrowRight } from "@/lib/storefront-icons"
import { getCategoryIcon } from "@/lib/category-icons"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { getCategoryTree } from "@/lib/queries/catalog"

export const metadata = {
  title: "Departments — DistroSource",
  description: "Browse every department and category in the DistroSource catalog.",
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
        <section className="relative overflow-hidden border-b border-border bg-foreground text-background">
          <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-52 size-[42rem] rounded-full bg-primary/25 blur-[110px]" />
          <div className="relative mx-auto max-w-[1540px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">The directory</p>
            <h1 className="mt-4 max-w-5xl font-display text-[clamp(3.4rem,8vw,8rem)] font-black leading-[0.84] tracking-[-0.08em]">Find your aisle.</h1>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-background/55">
              <span>{tree.length} departments</span><span className="size-1 rounded-full bg-primary" /><span>{total} active categories</span>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1540px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="space-y-20 lg:space-y-24">
            {tree.map((department, departmentIndex) => {
              const Icon = getCategoryIcon(department.slug)
              return (
                <section key={department.slug} aria-labelledby={`dept-${department.slug}`}>
                  <Reveal>
                    <div className="grid gap-7 lg:grid-cols-[310px_1fr] lg:gap-12 xl:grid-cols-[360px_1fr]">
                      <div className="lg:sticky lg:top-24 lg:self-start">
                        <div className="flex items-center gap-3 font-mono text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                          <span>0{departmentIndex + 1}</span><span className="h-px w-8 bg-border" />{department.productCount} products
                        </div>
                        <span className="mt-6 flex size-14 items-center justify-center rounded-[20px] bg-primary/10 text-primary"><Icon className="size-6" /></span>
                        <h2 id={`dept-${department.slug}`} className="mt-5 font-display text-4xl font-black leading-[0.95] tracking-[-0.055em] sm:text-5xl">{department.name}</h2>
                        {department.description && <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">{department.description}</p>}
                        <Link href={`/categories/${department.slug}`} className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold">Explore department <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></Link>
                      </div>

                      <RevealGroup className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" stagger={0.035}>
                        {department.subcategories.map((category, index) => {
                          const SubIcon = getCategoryIcon(category.slug)
                          return (
                            <RevealItem key={category.slug} className="h-full">
                              <Link href={`/categories/${category.slug}`} className={`group flex min-h-56 h-full flex-col justify-between overflow-hidden rounded-[26px] border p-5 transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_-34px_rgba(0,0,0,0.24)] ${index === 0 ? "border-primary/15 bg-primary/[0.08]" : "border-border bg-secondary/35 hover:bg-secondary/60"}`}>
                                <div className="flex items-start justify-between">
                                  <span className="flex size-11 items-center justify-center rounded-2xl bg-background text-primary shadow-sm"><SubIcon className="size-5" /></span>
                                  <span className="font-mono text-[9px] font-black text-muted-foreground">{category.productCount}</span>
                                </div>
                                <div>
                                  <h3 className="font-display text-2xl font-black leading-[1] tracking-[-0.04em]">{category.name}</h3>
                                  {category.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{category.description}</p>}
                                  <span className="mt-5 flex items-center justify-between text-xs font-semibold">Browse products <span className="flex size-9 items-center justify-center rounded-full bg-foreground text-background transition-transform group-hover:translate-x-1"><ArrowRight size={13} /></span></span>
                                </div>
                              </Link>
                            </RevealItem>
                          )
                        })}
                      </RevealGroup>
                    </div>
                  </Reveal>
                </section>
              )
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
