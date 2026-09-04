import Link from "next/link"
import { ArrowLeft, ICON_SIZE } from "@/lib/storefront-icons"
import { BrandLogo } from "@/components/brand-logo"

/**
 * Focused layout for sign-in / sign-up: brand bar, one centred card, slim
 * legal footer. No storefront navigation, no marketing panel, no statistics —
 * the only job of these pages is the form.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  aside,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  /** Optional short line under the card (e.g. "Already registered?"). */
  aside?: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandLogo heightClassName="h-7" />
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft size={ICON_SIZE.sm} aria-hidden="true" />
            Back to store
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:px-6 sm:py-16">
        <div className="w-full max-w-[26rem]">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight text-balance sm:text-[1.75rem]">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{subtitle}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-e1)] sm:p-7">{children}</div>
          {aside && <div className="mt-5 text-center text-sm text-muted-foreground">{aside}</div>}
        </div>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:px-6">
          <span>© {new Date().getFullYear()} DistroSource</span>
          <nav aria-label="Legal" className="flex gap-4">
            <Link href="/legal/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/help" className="hover:text-foreground">Help</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
