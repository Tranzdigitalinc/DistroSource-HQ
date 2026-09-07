import Link from "next/link"
import { ArrowRight } from "@/lib/storefront-icons"
import type { getCategoryTree } from "@/lib/queries/catalog"

export function V5Departments({ departments }: { departments: Awaited<ReturnType<typeof getCategoryTree>> }) {
  const visible = departments.filter((d) => d.productCount > 0).slice(0, 7)
  if (!visible.length) return null

  return (
    <section className="border-b border-border bg-background py-18 sm:py-22 lg:py-26">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">Browse by department</p>
            <h2 className="mt-4 max-w-xl font-display text-[clamp(2.8rem,5.8vw,6rem)] font-black leading-[0.88] tracking-[-0.07em] text-foreground">A better way to find what you need.</h2>
          </div>
          <div className="lg:justify-self-end">
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">No endless category maze. Start with the kind of work you’re doing, then drill into the formats and tools that fit it.</p>
            <Link href="/categories" className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold">Explore every department <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></Link>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((department, index) => (
            <Link
              key={department.slug}
              href={`/categories/${department.slug}`}
              className={`group relative min-h-[270px] border-b border-r border-border p-5 transition-colors sm:p-6 ${index === 0 ? "bg-[#111827] text-white lg:col-span-2" : "bg-background hover:bg-secondary/40"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className={`font-mono text-[9px] font-black uppercase tracking-[0.12em] ${index === 0 ? "text-white/45" : "text-muted-foreground"}`}>0{index + 1}</span>
                <span className={`font-mono text-[9px] ${index === 0 ? "text-white/45" : "text-muted-foreground"}`}>{department.productCount} products</span>
              </div>
              <div className="absolute inset-x-5 bottom-5 sm:inset-x-6 sm:bottom-6">
                <h3 className={`font-display font-black leading-[0.95] tracking-[-0.05em] ${index === 0 ? "max-w-xl text-4xl sm:text-5xl" : "text-2xl"}`}>{department.name}</h3>
                <div className={`mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs ${index === 0 ? "text-white/55" : "text-muted-foreground"}`}>
                  {department.subcategories.filter((s) => s.productCount > 0).slice(0, index === 0 ? 5 : 3).map((subcategory) => <span key={subcategory.slug}>{subcategory.name}</span>)}
                </div>
                <span className={`mt-5 inline-flex size-10 items-center justify-center rounded-full border transition-transform group-hover:translate-x-1 ${index === 0 ? "border-white/20 bg-white text-black" : "border-border bg-foreground text-background"}`}><ArrowRight size={14} /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
