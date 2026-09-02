"use client"

import { useRef } from "react"
import { Search, ShieldCheck, Zap, Download, CreditCard, Package, ShoppingBag } from "lucide-react"

import { Lamp } from "@/components/velora/lamp"
import { TextReveal } from "@/components/velora/text-reveal"
import { SparklesText } from "@/components/velora/sparkles-text"
import { BentoGrid, BentoCard } from "@/components/velora/bento-grid"
import { SpotlightCard } from "@/components/velora/spotlight-card"
import { TiltCard } from "@/components/velora/tilt-card"
import { OrbitingCircles } from "@/components/velora/orbiting-circles"
import { AvatarCircles } from "@/components/velora/avatar-circles"
import { AnimatedTooltip } from "@/components/velora/animated-tooltip"
import { AnimatedBeam } from "@/components/velora/animated-beam"
import { AnimatedList } from "@/components/velora/animated-list"
import { BrowserMockup } from "@/components/velora/browser-mockup"
import { IphoneMockup } from "@/components/velora/iphone-mockup"
import { Terminal } from "@/components/velora/terminal"
import { NumberTicker } from "@/components/velora/number-ticker"

const activity = [
  { name: "Mara K.", action: "just unlocked", item: "Brutalist UI Kit" },
  { name: "Devon R.", action: "just unlocked", item: "Inter Type System" },
  { name: "Priya S.", action: "just unlocked", item: "Pitch Deck Pro" },
  { name: "Alex T.", action: "just unlocked", item: "Notion OS 3.0" },
  { name: "Jules W.", action: "just unlocked", item: "3D Icon Pack" },
]

function StepNode({
  refProp,
  icon: Icon,
  label,
}: {
  refProp: React.RefObject<HTMLDivElement | null>
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={refProp}
        className="flex size-14 items-center justify-center rounded-full border border-border-strong bg-card text-primary shadow-sm"
      >
        <Icon className="size-6" />
      </div>
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

export function VeloraShowcase() {
  const beamContainer = useRef<HTMLDivElement>(null)
  const nodeBrowse = useRef<HTMLDivElement>(null)
  const nodePay = useRef<HTMLDivElement>(null)
  const nodeDownload = useRef<HTMLDivElement>(null)

  return (
    <section className="relative overflow-hidden border-t border-border">
      {/* Lamp header */}
      <Lamp>
        <TextReveal
          as="h2"
          text="Built for how you actually shop"
          className="font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl"
        />
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          <SparklesText>One catalog</SparklesText>, every format, zero friction between browsing and downloading.
        </p>
      </Lamp>

      {/* Bento feature grid */}
      <div className="mx-auto max-w-7xl px-6 pb-16 sm:px-8">
        <BentoGrid className="md:auto-rows-[20rem]">
          <SpotlightCard className="md:col-span-1">
            <BentoCard
              name="Discover fast"
              description="Filter by format, license, and price across every category in one search."
              icon={<Search />}
              background={
                <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
              }
              className="h-full border-0 bg-transparent"
            />
          </SpotlightCard>
          <TiltCard className="md:col-span-1">
            <BentoCard
              name="Secure by default"
              description="Encrypted checkout and account-gated downloads on every single order."
              icon={<ShieldCheck />}
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent" />
              }
              className="h-full"
            />
          </TiltCard>
          <SpotlightCard className="md:col-span-1">
            <BentoCard
              name="Instant unlocks"
              description="Files land in My Library the moment payment clears — no waiting on email."
              icon={<Zap />}
              background={
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-transparent" />
              }
              className="h-full border-0 bg-transparent"
            />
          </SpotlightCard>
        </BentoGrid>
      </div>

      {/* Trusted marketplace ring + live activity feed */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 border-t border-border px-6 py-16 sm:px-8 lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="relative flex h-64 w-64 items-center justify-center">
            <OrbitingCircles radius={100} duration={22}>
              <span className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-primary">
                <Package className="size-4" />
              </span>
              <span className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-primary">
                <ShoppingBag className="size-4" />
              </span>
              <span className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-primary">
                <CreditCard className="size-4" />
              </span>
              <span className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-primary">
                <Download className="size-4" />
              </span>
            </OrbitingCircles>
            <div className="flex flex-col items-center gap-1 text-center">
              <NumberTicker value={40000} suffix="+" className="font-display text-2xl font-black text-foreground" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                shoppers served
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <AnimatedTooltip
              items={[
                { name: "Mara K.", role: "Verified buyer" },
                { name: "Devon R.", role: "Verified buyer" },
                { name: "Priya S.", role: "Verified buyer" },
                { name: "Alex T.", role: "Verified buyer" },
              ]}
            />
            <AvatarCircles people={["Jules W.", "Sam O.", "Nina P."]} extra={39000} className="mt-1" />
            <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
              Trusted by shoppers worldwide
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Live on the marketplace</p>
            <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">Recent activity</h3>
          </div>
          <div className="relative h-64 overflow-hidden rounded-2xl border border-border bg-card p-4">
            <AnimatedList delay={2200}>
              {activity.map((entry) => (
                <div
                  key={entry.name}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3 py-2.5"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {entry.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </span>
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{entry.name}</span>{" "}
                    <span className="text-muted-foreground">{entry.action}</span>{" "}
                    <span className="font-medium">{entry.item}</span>
                  </p>
                </div>
              ))}
            </AnimatedList>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent"
            />
          </div>
        </div>
      </div>

      {/* Animated beam: browse -> pay -> download */}
      <div className="mx-auto max-w-7xl border-t border-border px-6 py-16 sm:px-8">
        <div className="mb-10 text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">The flow</p>
          <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Browse, pay, download — connected
          </h3>
        </div>
        <div ref={beamContainer} className="relative flex items-center justify-center gap-24 py-8 sm:gap-40">
          <StepNode refProp={nodeBrowse} icon={Search} label="Browse" />
          <StepNode refProp={nodePay} icon={CreditCard} label="Pay" />
          <StepNode refProp={nodeDownload} icon={Download} label="Download" />
          <AnimatedBeam
            containerRef={beamContainer}
            fromRef={nodeBrowse}
            toRef={nodePay}
            gradientStartColor="var(--brand-from)"
            gradientStopColor="var(--brand-to)"
          />
          <AnimatedBeam
            containerRef={beamContainer}
            fromRef={nodePay}
            toRef={nodeDownload}
            gradientStartColor="var(--brand-from)"
            gradientStopColor="var(--brand-to)"
            delay={0.6}
          />
        </div>
      </div>

      {/* Works everywhere: browser + phone + terminal */}
      <div className="mx-auto max-w-7xl border-t border-border px-6 py-16 sm:px-8">
        <div className="mb-10 text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Anywhere you work</p>
          <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Your library, on every screen
          </h3>
        </div>
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.3fr_0.7fr_1fr]">
          <BrowserMockup url="distrosource.com/library">
            <div className="flex flex-col gap-3 bg-background p-6">
              <div className="h-3 w-1/3 rounded bg-muted" />
              <div className="grid grid-cols-3 gap-3">
                <div className="aspect-square rounded-lg bg-secondary" />
                <div className="aspect-square rounded-lg bg-secondary" />
                <div className="aspect-square rounded-lg bg-secondary" />
              </div>
              <div className="h-2 w-2/3 rounded bg-muted" />
              <div className="h-2 w-1/2 rounded bg-muted" />
            </div>
          </BrowserMockup>
          <IphoneMockup>
            <div className="flex h-full flex-col gap-2 bg-background p-3 pt-10">
              <div className="h-2 w-1/2 rounded bg-muted" />
              <div className="grid grid-cols-2 gap-2">
                <div className="aspect-square rounded-md bg-secondary" />
                <div className="aspect-square rounded-md bg-secondary" />
                <div className="aspect-square rounded-md bg-secondary" />
                <div className="aspect-square rounded-md bg-secondary" />
              </div>
            </div>
          </IphoneMockup>
          <Terminal
            title="download"
            lines={[
              "$ distrosource pull inter-type-system",
              "Verifying license...",
              "Fetching 4 files (128 MB)...",
              "Unlocked in My Library.",
            ]}
          />
        </div>
      </div>
    </section>
  )
}
