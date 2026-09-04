import { Building2, Users, ShieldCheck, FileCheck2 } from "@/lib/storefront-icons"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { TeamLicensingForm } from "@/components/team-licensing/team-licensing-form"

export const metadata = {
  title: "Team licensing — DistroSource",
  description: "Agency and team licensing for studios purchasing digital products at volume across the DistroSource catalog.",
}

const perks = [
  {
    icon: Users,
    title: "Multi-seat access",
    description: "License a single product across your whole team without buying it seat by seat.",
  },
  {
    icon: ShieldCheck,
    title: "Studio-grade terms",
    description: "Use assets across multiple client projects under our Agency license tier, up to the limits stated on each product.",
  },
  {
    icon: FileCheck2,
    title: "Centralized billing",
    description: "One invoice, one point of contact, and consolidated licensing documentation for your team.",
  },
]

export default function TeamLicensingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border bg-hero">
          <div className="relative mx-auto max-w-3xl px-6 py-16 text-center sm:px-8">
            <span className="mx-auto flex w-fit items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              <Building2 className="size-3.5" />
              For agencies & studios
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-hero-foreground text-balance sm:text-5xl">
              Team licensing for growing studios
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
              Purchasing across a whole team or client roster? Tell us what you need and we&apos;ll put together a
              licensing plan that fits.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="flex flex-col gap-6">
            {perks.map((perk) => (
              <div key={perk.title} className="flex gap-4 rounded-xl border border-border bg-card p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <perk.icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{perk.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{perk.description}</p>
                </div>
              </div>
            ))}
          </div>

          <TeamLicensingForm />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
