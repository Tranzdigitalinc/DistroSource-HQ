import type { Metadata } from "next"
import { Mail, ShieldCheck, Sparkles, Wrench } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"

export const metadata: Metadata = {
  title: "Scheduled Maintenance — RedeemCove",
  description: "RedeemCove is temporarily undergoing scheduled maintenance. We'll be back online shortly.",
}

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklch,var(--accent)_18%,transparent),transparent_60%)]"
      />

      <div className="relative flex w-full max-w-md flex-col items-center gap-8 text-center">
        <BrandLogo href={null} heightClassName="h-9" />

        <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-card">
          <Wrench className="size-7 text-accent" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="font-display text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            We&apos;ll be right back
          </h1>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            RedeemCove is currently undergoing scheduled maintenance to make things faster and better for you. We
            expect to be back online shortly — thank you for your patience.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 rounded-xl border border-border bg-card p-5 text-left">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Your account, orders, and wallet balances are safe and unaffected.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="size-4 shrink-0 text-accent" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              We&apos;re rolling out improvements to give you a better shopping experience.
            </p>
          </div>
        </div>

        <a
          href="mailto:support@redeemcove.com"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
        >
          <Mail className="size-4" aria-hidden="true" />
          support@redeemcove.com
        </a>
      </div>
    </main>
  )
}
