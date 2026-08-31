import { redirect } from "next/navigation"
import { ReloadlySyncPanel } from "@/components/admin/reloadly-sync-panel"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const metadata = {
  title: "Admin | RedeemCove",
  description: "RedeemCove administration.",
}

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const adminEmail = (process.env.RELOADLY_ADMIN_EMAIL || "Info@CoreValleyJo.com").trim().toLowerCase()
  const userEmail = session?.user?.email?.trim().toLowerCase()

  if (!session?.user) redirect("/sign-in?next=/admin")
  if (userEmail !== adminEmail) redirect("/")

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Administration</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground">Catalog control center</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Signed in as {session.user.email}</p>
      </header>
      <ReloadlySyncPanel />
    </main>
  )
}
