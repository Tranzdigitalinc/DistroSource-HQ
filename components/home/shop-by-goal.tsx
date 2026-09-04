import Link from "next/link"
import { ArrowRight, BriefcaseBusiness, LayoutTemplate, PaintBoard, SourceCode, ICON_SIZE } from "@/lib/storefront-icons"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"

/**
 * Curated entry points. Every href is a real department or category route
 * that returns products today — not a keyword search that may come back
 * empty. Update the list when the catalog's departments change.
 */
const collections = [
  {
    title: "Run the business",
    description: "Spreadsheets, documents, planners and Notion systems for everyday operations.",
    href: "/categories/business-office",
    icon: BriefcaseBusiness,
  },
  {
    title: "Ship a website",
    description: "Site templates, admin dashboards, landing pages and React / Next.js starters.",
    href: "/categories/web-development",
    icon: SourceCode,
  },
  {
    title: "Make it look designed",
    description: "Graphics, icons, mockups and brand assets with a point of view.",
    href: "/categories/design-resources",
    icon: PaintBoard,
  },
  {
    title: "Present with confidence",
    description: "Presentation decks and pitch templates for PowerPoint and Keynote.",
    href: "/categories/presentation-templates",
    icon: LayoutTemplate,
  },
]

export function ShopByGoal() {
  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
        <div className="mb-8 max-w-xl">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Collections</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">Start with what you need to do</h2>
        </div>
        <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.05}>
          {collections.map(({ title, description, href, icon: Icon }) => (
            <RevealItem key={title} className="h-full">
              <Link
                href={href}
                className="group flex h-full flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-border-strong hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-10 items-center justify-center rounded-md bg-secondary text-foreground">
                  <Icon size={ICON_SIZE.feature} aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold tracking-tight text-foreground">{title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
                <span className="mt-4 flex items-center gap-1 text-xs font-semibold text-foreground">
                  Browse
                  <ArrowRight size={ICON_SIZE.sm} className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
