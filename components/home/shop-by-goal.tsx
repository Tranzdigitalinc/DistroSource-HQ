import Link from "next/link"
import { ArrowUpRight, BriefcaseBusiness, Compass, LayoutTemplate, WandSparkles } from "lucide-react"

const goals = [
  { title: "Launch something new", description: "Polished templates and brand building blocks for a confident first release.", href: "/products?q=launch", icon: LayoutTemplate },
  { title: "Run the business", description: "Systems, documents, and spreadsheets that make the everyday work lighter.", href: "/products?q=business", icon: BriefcaseBusiness },
  { title: "Make it feel designed", description: "Fonts, graphics, mockups, and presentation assets with a point of view.", href: "/products?q=design", icon: WandSparkles },
  { title: "Find a useful starting point", description: "Browse the complete catalog when you know the outcome, not the format.", href: "/products", icon: Compass },
]

export function ShopByGoal() {
  return (
    <section className="border-y border-border bg-surface-soft">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
        <div className="mb-8 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">Start with the outcome</p>
          <h2 className="mt-2 font-display text-2xl font-medium tracking-tight sm:text-3xl">Shop by goal, not file type</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">A faster route to the thing you are trying to make.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {goals.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="group relative flex min-h-48 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-brand-blue to-brand-cyan transition-transform duration-300 group-hover:scale-x-100"
              />
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground/60 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold tracking-tight">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
