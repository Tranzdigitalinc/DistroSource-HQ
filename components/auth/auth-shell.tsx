import Link from "next/link"
import { Sparkles } from "lucide-react"

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
    <div className="grid min-h-[calc(100vh-1px)] lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-10 flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">RedeemCove</span>
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight text-balance">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, oklch(0.72 0.14 220 / 0.5), transparent 40%), radial-gradient(circle at 80% 70%, oklch(0.6 0.15 240 / 0.4), transparent 45%)",
          }}
        />
        <div className="relative flex h-full flex-col items-start justify-end p-16">
          <p className="max-w-md text-2xl font-medium leading-snug text-primary-foreground text-balance">
            Instant codes for the games, streaming, and brands you already love — delivered in seconds.
          </p>
          <div className="mt-8 flex items-center gap-6 text-sm text-primary-foreground/70">
            <span>500+ brands</span>
            <span className="h-1 w-1 rounded-full bg-primary-foreground/40" />
            <span>190+ countries</span>
            <span className="h-1 w-1 rounded-full bg-primary-foreground/40" />
            <span>Instant delivery</span>
          </div>
        </div>
      </div>
    </div>
  )
}
