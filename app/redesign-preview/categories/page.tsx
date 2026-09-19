import Link from "next/link"
import { RedesignHeader } from "@/components/redesign/redesign-header"
import { RedesignFooter } from "@/components/redesign/redesign-footer"
import { ArrowUpRight } from "@/lib/storefront-icons"
import { getCategoryIcon } from "@/lib/category-icons"
import { getCategoryTree } from "@/lib/queries/catalog"

export const metadata = {
  title: "Departments — DistroSource redesign preview",
  robots: { index: false, follow: false },
}

export default async function RedesignCategoriesPage() {
  const departments = (await getCategoryTree())
    .map((department) => ({
      ...department,
      subcategories: department.subcategories.filter((subcategory) => subcategory.productCount > 0),
    }))
    .filter((department) => department.productCount > 0 && department.subcategories.length > 0)

  const totalCategories = departments.reduce((total, department) => total + department.subcategories.length, 0)
  const totalProducts = departments.reduce((total, department) => total + department.productCount, 0)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <RedesignHeader departments={departments} />
      <main className="flex-1">
        <section className="border-b border-border bg-secondary/25">
          <div className="mx-auto max-w-[1500px] px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Department directory</p>
            <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="max-w-4xl">
                <h1 className="font-display text-5xl font-black leading-[0.94] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl">
                  Every digital shelf,
                  <span className="block text-muted-foreground">properly organized.</span>
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                  Browse DistroSource by department, then narrow into the exact category you need. Empty shelves stay hidden.
                </p>
              </div>
              <dl className="grid grid-cols-3 gap-px border border-border bg-border text-center">
                <div className="bg-background px-5 py-4">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.09em] text-muted-foreground">Departments</dt>
                  <dd className="mt-1 font-display text-2xl font-black">{departments.length}</dd>
                </div>
                <div className="bg-background px-5 py-4">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.09em] text-muted-foreground">Categories</dt>
                  <dd className="mt-1 font-display text-2xl font-black">{totalCategories}</dd>
                </div>
                <div className="bg-background px-5 py-4">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.09em] text-muted-foreground">Products</dt>
                  <dd className="mt-1 font-display text-2xl font-black">{totalProducts.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1500px] px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="grid gap-10">
            {departments.map((department, departmentIndex) => {
              const DepartmentIcon = getCategoryIcon(department.slug)
              return (
                <section key={department.slug} className="grid gap-5 border-t border-border pt-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10 lg:pt-8">
                  <div className="lg:sticky lg:top-32 lg:self-start">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex size-11 items-center justify-center border border-border bg-card text-primary">
                        <DepartmentIcon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[10px] font-bold text-muted-foreground/60">
                        {String(departmentIndex + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h2 className="mt-5 font-display text-2xl font-black tracking-[-0.03em] text-foreground">{department.name}</h2>
                    {department.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{department.description}</p>}
                    <Link
                      href={`/redesign-preview/products?category=${encodeURIComponent(department.slug)}`}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary"
                    >
                      View {department.productCount.toLocaleString()} products
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>

                  <div className="grid gap-px border border-border bg-border sm:grid-cols-2 xl:grid-cols-3">
                    {department.subcategories.map((category) => {
                      const Icon = getCategoryIcon(category.slug)
                      return (
                        <Link
                          key={category.slug}
                          href={`/redesign-preview/products?category=${encodeURIComponent(category.slug)}`}
                          className="group flex min-h-44 flex-col bg-background p-5 transition-colors hover:bg-secondary/40"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <span className="flex size-9 items-center justify-center border border-border bg-card text-muted-foreground transition-colors group-hover:text-primary">
                              <Icon className="size-4" aria-hidden="true" />
                            </span>
                            <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
                          </div>
                          <div className="mt-auto pt-8">
                            <h3 className="font-display text-lg font-bold tracking-tight text-foreground">{category.name}</h3>
                            <div className="mt-1 flex items-end justify-between gap-4">
                              {category.description ? (
                                <p className="line-clamp-2 max-w-[24rem] text-xs leading-5 text-muted-foreground">{category.description}</p>
                              ) : (
                                <span />
                              )}
                              <span className="shrink-0 font-mono text-[10px] font-semibold text-muted-foreground">
                                {category.productCount}
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      </main>
      <RedesignFooter />
    </div>
  )
}
