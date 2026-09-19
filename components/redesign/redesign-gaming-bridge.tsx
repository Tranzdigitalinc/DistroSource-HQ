import Link from "next/link"
import { ArrowUpRight, GameController } from "@/lib/storefront-icons"

export function RedesignGamingBridge() {
  return (
    <section className="border-y border-navy-foreground/10 bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-stretch lg:px-10 lg:py-24">
        <div className="flex flex-col justify-between">
          <div>
            <span className="flex size-12 items-center justify-center border border-navy-foreground/15 bg-navy-foreground/5 text-primary">
              <GameController size={22} aria-hidden="true" />
            </span>
            <p className="mt-8 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Dedicated gaming department</p>
            <h2 className="mt-3 max-w-3xl font-display text-5xl font-black leading-[0.92] tracking-[-0.05em] sm:text-6xl">
              Assets for servers,
              <span className="block text-navy-foreground/45">communities & worlds.</span>
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-navy-foreground/60 sm:text-base">
              FiveM and Minecraft resources live in their own purpose-built storefront. The redesign preview links into that existing department instead of duplicating Claude&apos;s active gaming work.
            </p>
          </div>
          <Link href="/gaming" className="group mt-8 inline-flex min-h-11 w-fit items-center gap-2 bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
            Enter Gaming
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-px border border-navy-foreground/12 bg-navy-foreground/12 sm:grid-cols-2">
          <Link href="/gaming/fivem" className="group flex min-h-72 flex-col justify-between bg-navy p-6 transition-colors hover:bg-navy-foreground/[0.04] sm:min-h-96">
            <div className="flex items-start justify-between gap-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-navy-foreground/40">Platform 01</span>
              <ArrowUpRight className="size-4 text-navy-foreground/45 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <div>
              <div aria-hidden="true" className="mb-6 h-28 border border-navy-foreground/10 bg-[radial-gradient(circle_at_75%_30%,color-mix(in_oklch,var(--primary)_40%,transparent),transparent_25%),linear-gradient(135deg,color-mix(in_oklch,var(--color-navy-foreground)_6%,transparent),transparent)]" />
              <h3 className="font-display text-3xl font-black tracking-[-0.04em]">FiveM</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-navy-foreground/55">Maps, vehicles, interfaces, scripts, server systems and community resources.</p>
            </div>
          </Link>

          <Link href="/gaming/minecraft" className="group flex min-h-72 flex-col justify-between bg-navy p-6 transition-colors hover:bg-navy-foreground/[0.04] sm:min-h-96">
            <div className="flex items-start justify-between gap-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-navy-foreground/40">Platform 02</span>
              <ArrowUpRight className="size-4 text-navy-foreground/45 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <div>
              <div aria-hidden="true" className="mb-6 h-28 border border-navy-foreground/10 [background-image:linear-gradient(45deg,color-mix(in_oklch,var(--primary)_14%,transparent)_25%,transparent_25%),linear-gradient(-45deg,color-mix(in_oklch,var(--primary)_14%,transparent)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,color-mix(in_oklch,var(--primary)_14%,transparent)_75%),linear-gradient(-45deg,transparent_75%,color-mix(in_oklch,var(--primary)_14%,transparent)_75%)] [background-position:0_0,0_14px,14px_-14px,-14px_0] [background-size:28px_28px]" />
              <h3 className="font-display text-3xl font-black tracking-[-0.04em]">Minecraft</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-navy-foreground/55">Maps, plugins, configs, worlds, server systems and player-facing resources.</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
