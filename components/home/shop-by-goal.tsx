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
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="mb-7 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Start with the outcome</p>
          <h2 className="mt-2 font-display text-2xl font-medium tracking-tight sm:text-3xl">Shop by goal, not file type</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">A faster route to the thing you are trying to make.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {goals.map(({ title, description, href, icon: Icon }) => (
            <Link key={title} href={href} className="group flex min-h-44 flex-col justify-between rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-background">
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon /></span>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <div>
                <h3 className="font-semibold tracking-tight">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
