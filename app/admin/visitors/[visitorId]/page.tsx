import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { getVisitorSession } from "@/lib/actions/visitor-logs"
import { countryCodeToName, parseBrowser, parseOs } from "@/lib/user-agent"
import { IpReputationBadge } from "@/components/admin/ip-reputation-badge"
import { CountryFlag } from "@/components/admin/country-flag"
import { isAdminEmail } from "@/lib/admin-emails"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Visitor session | DistroSource Admin",
  description: "Full activity timeline for a single visitor.",
}

export default async function VisitorSessionPage({
  params,
}: {
  params: Promise<{ visitorId: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in?next=/admin/visitors")
  if (!isAdminEmail(session.user.email)) redirect("/")

  const { visitorId } = await params
  const events = await getVisitorSession(visitorId)

  if (events.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
        <Button variant="outline" size="sm" render={<Link href="/admin/visitors" />} nativeButton={false}>
          Back to visitors
        </Button>
        <p className="text-sm text-muted-foreground">No activity found for this visitor.</p>
      </main>
    )
  }

  const first = events[events.length - 1]
  const latest = events[0]
  const durationMs = latest.createdAt.getTime() - first.createdAt.getTime()
  const durationMinutes = Math.max(0, Math.round(durationMs / 60000))
  const ipsUsed = Array.from(new Set(events.map((e) => e.ipAddress).filter(Boolean))) as string[]

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Visitor session</p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">Visitor activity</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{visitorId}</p>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/admin/visitors" />} nativeButton={false}>
          Back to visitors
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{events.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Session span</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{durationMinutes}m</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {first.createdAt.toLocaleString()} &rarr; {latest.createdAt.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Device</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold capitalize">{latest.deviceType ?? "Unknown"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {latest.userAgent ? parseBrowser(latest.userAgent) : "Unknown"} ·{" "}
              {latest.userAgent ? parseOs(latest.userAgent) : "Unknown"}
            </p>
          </CardContent>
        </Card>
      </section>

      {ipsUsed.length > 0 ? (
        <section className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">IP addresses seen:</span>
          {ipsUsed.map((ip) => {
            const rep = events.find((e) => e.ipAddress === ip)?.reputation ?? null
            return (
              <span key={ip} className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs">
                <span className="font-mono text-muted-foreground">{ip}</span>
                <IpReputationBadge reputation={rep} />
              </span>
            )
          })}
        </section>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Page-by-page timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col gap-4">
            {events.map((event, i) => (
              <li key={event.id} className="flex gap-3 border-l border-border pl-4">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {event.createdAt.toLocaleString()}
                    </span>
                    {i === 0 ? (
                      <Badge variant="secondary" className="text-[10px]">
                        Most recent
                      </Badge>
                    ) : null}
                  </div>
                  <p className="font-medium text-foreground">{event.path}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CountryFlag code={event.country} />
                    {countryCodeToName(event.country)} · {event.ipAddress ?? "Unknown IP"}
                    {event.referrer ? ` · from ${event.referrer}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </main>
  )
}
