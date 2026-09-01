import { Check, LockKeyhole, Zap } from "lucide-react"
import { SiteHeaderClient } from "@/components/header/site-header-client"
import { SiteFooter } from "@/components/footer/site-footer"

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeaderClient />
      <div className="grid flex-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center px-5 py-8 sm:px-10 sm:py-16 lg:px-16">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20"><LockKeyhole className="size-5" /></span>
              <div><p className="text-sm font-semibold">RedeemCove account</p><p className="text-xs text-muted-foreground">Secure digital gifting</p></div>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-balance">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
            <div className="mt-7 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm sm:p-6">{children}</div>
            <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground">
              <div className="rounded-xl bg-secondary/60 px-2 py-3"><Zap className="mx-auto mb-1 size-4 text-primary" />Fast delivery</div>
              <div className="rounded-xl bg-secondary/60 px-2 py-3"><LockKeyhole className="mx-auto mb-1 size-4 text-primary" />Protected</div>
              <div className="rounded-xl bg-secondary/60 px-2 py-3"><Check className="mx-auto mb-1 size-4 text-primary" />Trusted</div>
            </div>
          </div>
        </div>
        <div className="relative hidden overflow-hidden bg-hero lg:block">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, oklch(0.68 0.19 262 / 0.35), transparent 40%), radial-gradient(circle at 80% 70%, oklch(0.64 0.21 262 / 0.28), transparent 45%)",
            }}
          />
          <div className="relative flex h-full flex-col justify-center p-12 xl:p-16">
            <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
              <div className="flex items-center gap-3 text-sm font-semibold tracking-wide text-hero-foreground/70">
                <span className="h-px w-10 bg-primary" />
                THE DIGITAL VALUE PLATFORM
              </div>
              <div className="flex flex-col gap-5">
                <h2 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-hero-foreground xl:text-5xl text-balance">
                  Everything you love, delivered instantly.
                </h2>
                <p className="max-w-md text-base leading-relaxed text-hero-foreground/70">
                  Buy gift cards, game top-ups, and streaming codes from trusted brands around the world.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-hero-foreground/10 bg-hero-foreground/[0.04] p-4">
                  <p className="text-2xl font-semibold text-hero-foreground">500+</p>
                  <p className="mt-1 text-xs text-hero-foreground/60">Trusted brands</p>
                </div>
                <div className="rounded-2xl border border-hero-foreground/10 bg-hero-foreground/[0.04] p-4">
                  <p className="text-2xl font-semibold text-hero-foreground">190+</p>
                  <p className="mt-1 text-xs text-hero-foreground/60">Countries supported</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-hero-foreground/70">
                {['Gaming', 'Streaming', 'Shopping', 'Mobile top-up'].map((category) => (
                  <span key={category} className="rounded-full border border-hero-foreground/10 px-3 py-2">{category}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
