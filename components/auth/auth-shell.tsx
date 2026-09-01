import Link from "next/link"
import { ArrowLeft, Check, LockKeyhole, Zap } from "lucide-react"
import { ThemeToggle } from "@/components/header/theme-toggle"
import { BrandLogo } from "@/components/brand-logo"

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
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 px-6 sm:px-10 lg:px-16">
        <Link href="/" className="flex items-center">
          <BrandLogo href={null} height={40} />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground sm:flex"
          >
            <ArrowLeft className="size-3.5" />
            Back to store
          </Link>
          <ThemeToggle />
        </div>
      </header>
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
          <div className="relative flex h-full flex-col items-start justify-end p-16">
            <p className="max-w-md text-2xl font-medium leading-snug text-hero-foreground text-balance">
              Instant codes for the games, streaming, and brands you already love — delivered in seconds.
            </p>
            <div className="mt-8 flex items-center gap-6 text-sm text-hero-foreground/70">
              <span>500+ brands</span>
              <span className="h-1 w-1 rounded-full bg-hero-foreground/40" />
              <span>190+ countries</span>
              <span className="h-1 w-1 rounded-full bg-hero-foreground/40" />
              <span>Instant delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
