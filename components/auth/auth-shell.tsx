import Link from "next/link"
import { ArrowLeft } from "lucide-react"
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
        <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-sm">
            <h1 className="font-display text-2xl font-bold tracking-tight text-balance">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
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
