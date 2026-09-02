import Link from "next/link"
import { redirect } from "next/navigation"
import { headers as nextHeaders } from "next/headers"
import { auth } from "@/lib/auth"
import { searchCustomers } from "@/lib/actions/admin-customers"
import { isAdminEmail } from "@/lib/admin-emails"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search } from "lucide-react"

export const metadata = {
  title: "Customers | DistroSource Admin",
  description: "Look up customer accounts, order history, and support tickets.",
}

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await auth.api.getSession({ headers: await nextHeaders() })
  if (!session?.user || !isAdminEmail(session.user.email)) redirect("/sign-in")

  const { q } = await searchParams
  const customers = await searchCustomers(q ?? "")

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header>
        <Button variant="outline" size="sm" render={<Link href="/admin" />} nativeButton={false}>
          <ArrowLeft className="h-4 w-4" />
          Admin
        </Button>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">Search by name or email to view an account&apos;s history.</p>
      </header>

      <form method="GET" className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q ?? ""} placeholder="Search name or email…" className="pl-9" />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 font-medium">Customer</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Orders</th>
              <th className="px-4 py-2 font-medium">Lifetime spend</th>
              <th className="px-4 py-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${c.id}`} className="font-medium text-foreground hover:text-primary">
                      {c.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.role === "admin" ? "default" : "secondary"} className="capitalize">
                      {c.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.orderCount}</td>
                  <td className="px-4 py-3 text-muted-foreground">${Number.parseFloat(c.lifetimeUsd).toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.createdAt.toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
