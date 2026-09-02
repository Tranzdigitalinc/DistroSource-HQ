import Link from "next/link"
import { ArrowUpRight, BriefcaseBusiness, Compass, LayoutTemplate, WandSparkles } from "@/lib/storefront-icons"
import { FlipWords } from "@/components/velora/flip-words"
import { BlurFade } from "@/components/velora/blur-fade"
import { GridPattern } from "@/components/velora/grid-pattern"

const goals = [
  { title: "Launch something new", description: "Polished templates and brand building blocks for a confident first release.", href: "/products?q=launch", icon: LayoutTemplate },
  { title: "Run the business", description: "Systems, documents, and spreadsheets that make the everyday work lighter.", href: "/products?q=business", icon: BriefcaseBusiness },
  { title: "Make it feel designed", description: "Fonts, graphics, mockups, and presentation assets with a point of view.", href: "/products?q=design", icon: WandSparkles },
  { title: "Find a useful starting point", description: "Browse the complete catalog when you know the outcome, not the format.", href: "/products", icon: Compass },
]

export function ShopByGoal() {
  return (
    <section className="relative border-y border-border bg-surface-soft">
      <GridPattern
        width={48}
        height={48}
        className="fill-transparent stroke-border/50 [mask-image:radial-gradient(60%_60%_at_0%_0%,black,transparent)]"
      />
      <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-8">
        <div className="mb-8 max-w-xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Start with the outcome</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">Shop by goal, not file type</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A faster route to <FlipWords words={["launch", "sell", "design", "organize"]} className="font-semibold text-foreground" /> the thing you are trying to make.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {goals.map(({ title, description, href, icon: Icon }, i) => (
            <BlurFade key={title} delay={i * 0.08} className="h-full">
              <Link
                href={href}
                className="group relative flex h-full min-h-48 flex-col justify-between bg-card p-5 transition-colors hover:bg-background"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-11 items-center justify-center rounded-[4px] bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-muted-foreground/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <h3 className="flex items-center gap-1.5 font-display font-bold tracking-tight">
                    {title}
                    <ArrowUpRight className="size-3.5 text-muted-foreground/60 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </Link>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}
