import { Check, LockKeyhole, Zap } from "@/lib/storefront-icons"
import { SiteHeaderClient } from "@/components/header/site-header-client"
import { SiteFooter } from "@/components/footer/site-footer"
import { getCatalogStats } from "@/lib/queries/catalog"

export async function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  const stats = await getCatalogStats()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeaderClient />
      <div className="grid flex-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center px-5 py-8 sm:px-10 sm:py-16 lg:px-16">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20"><LockKeyhole className="size-5" /></span>
              <div><p className="text-sm font-semibold">DistroSource account</p><p className="text-xs text-muted-foreground">Your digital asset library</p></div>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-balance">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
            <div className="mt-7 border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur-sm sm:p-6">{children}</div>
            <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground">
              <div className="rounded-xl bg-secondary/60 px-2 py-3"><Zap className="mx-auto mb-1 size-4 text-primary" />Fast delivery</div>
              <div className="rounded-xl bg-secondary/60 px-2 py-3"><LockKeyhole className="mx-auto mb-1 size-4 text-primary" />Protected</div>
              <div className="rounded-xl bg-secondary/60 px-2 py-3"><Check className="mx-auto mb-1 size-4 text-primary" />Trusted</div>
            </div>
          </div>
        </div>
        <div className="relative hidden overflow-hidden border-l border-border bg-hero lg:block">
          <div className="relative flex h-full flex-col justify-center p-12 xl:p-16">
            <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
              <div className="flex items-center gap-3 text-sm font-semibold tracking-wide text-hero-foreground/70">
                <span className="h-px w-10 bg-primary" />
                THE DIGITAL VALUE PLATFORM
              </div>
              <div className="flex flex-col gap-5">
                <h2 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-hero-foreground xl:text-5xl text-balance">
                  Every asset you need, unlocked instantly.
                </h2>
                <p className="max-w-md text-base leading-relaxed text-hero-foreground/70">
                  Templates, fonts, UI kits, and Notion systems from independent creators — yours the moment you buy.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-hero-foreground/10 bg-hero-foreground/[0.04] p-4">
                  <p className="text-2xl font-semibold text-hero-foreground">{stats.productCount}+</p>
                  <p className="mt-1 text-xs text-hero-foreground/60">Digital products</p>
                </div>
                <div className="rounded-2xl border border-hero-foreground/10 bg-hero-foreground/[0.04] p-4">
                  <p className="text-2xl font-semibold text-hero-foreground">{stats.categoryCount}+</p>
                  <p className="mt-1 text-xs text-hero-foreground/60">Categories</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-hero-foreground/70">
                {['Templates', 'Fonts', 'UI kits', 'Notion systems'].map((category) => (
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
