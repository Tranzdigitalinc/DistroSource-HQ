import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-emails"
import { getSupportConversations } from "@/lib/actions/support-inbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Support inbox | DistroSource Admin",
  description: "Reply to support@distrosource.com from one threaded inbox.",
}

export default async function AdminSupportInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in?next=/admin/support")
  if (!isAdminEmail(session.user.email)) redirect("/")

  const params = await searchParams
  const status = params.status === "closed" ? "closed" : params.status === "open" ? "open" : undefined
  const { rows } = await getSupportConversations({ status })

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Administration</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">Support inbox</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Every message sent to support@distrosource.com, plus contact-form submissions, threaded in one place.
          </p>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/admin" />} nativeButton={false}>
          Back to control center
        </Button>
      </header>

      <div className="flex gap-2">
        <Button variant={!status ? "default" : "outline"} size="sm" render={<Link href="/admin/support" />} nativeButton={false}>
          All
        </Button>
        <Button variant={status === "open" ? "default" : "outline"} size="sm" render={<Link href="/admin/support?status=open" />} nativeButton={false}>
          Open
        </Button>
        <Button variant={status === "closed" ? "default" : "outline"} size="sm" render={<Link href="/admin/support?status=closed" />} nativeButton={false}>
          Closed
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{status ? `${status[0].toUpperCase()}${status.slice(1)} conversations` : "All conversations"}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No conversations found.</p>
          ) : (
            rows.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/admin/support/${conversation.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary/30"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{conversation.subject}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {conversation.customerName ? `${conversation.customerName} · ` : ""}
                    {conversation.customerEmail} · {conversation.lastMessageAt.toLocaleString()}
                  </p>
                </div>
                <Badge variant={conversation.status === "closed" ? "secondary" : "default"}>{conversation.status}</Badge>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  )
}
