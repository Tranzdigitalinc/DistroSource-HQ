import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { AccountNav } from "@/components/account/account-nav"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session?.user) {
    redirect("/sign-in?redirect=/account")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account</p>
            <h1 className="font-display text-2xl font-bold text-balance md:text-3xl">
              Welcome back, {session.user.name?.split(" ")[0] ?? "there"}
            </h1>
          </div>
          <div className="flex flex-col gap-8 md:flex-row md:gap-10">
            <aside className="md:w-56 md:shrink-0">
              <AccountNav />
            </aside>
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
