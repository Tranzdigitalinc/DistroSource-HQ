import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { getVisitorLogsFiltered, getVisitorStats } from "@/lib/actions/visitor-logs"
import { countryCodeToName } from "@/lib/user-agent"
import { IpReputationBadge } from "@/components/admin/ip-reputation-badge"
import { CountryFlag } from "@/components/admin/country-flag"
import { isAdminEmail } from "@/lib/admin-emails"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Visitors | RedeemCove Admin",
  description: "Live log of website visitor activity, devices, and locations.",
}

export default async function AdminVisitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; deviceType?: string; page?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in?next=/admin/visitors")
  if (!isAdminEmail(session.user.email)) redirect("/")

  const params = await searchParams
  const page = params.page ? Number.parseInt(params.page, 10) : 1
  const [{ rows, countries, deviceTypes, pageSize }, stats] = await Promise.all([
    getVisitorLogsFiltered({ country: params.country, deviceType: params.deviceType, page }),
    getVisitorStats(),
  ])

  function buildHref(key: string, value: string | null) {
    const next = new URLSearchParams()
    if (params.country && key !== "country") next.set("country", params.country)
    if (params.deviceType && key !== "deviceType") next.set("deviceType", params.deviceType)
    if (value) next.set(key, value)
    const qs = next.toString()
    return `/admin/visitors${qs ? `?${qs}` : ""}`
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Administration</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">Visitors</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Live activity log of pages visited, devices, locations, and IP addresses.
          </p>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/admin" />} nativeButton={false}>
          Back to control center
        </Button>
      </header>

      <section aria-labelledby="visitor-stats-title" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <h2 id="visitor-stats-title" className="sr-only">
          Visitor statistics
        </h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total page views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.totalVisits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.uniqueVisitors}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Views · last 24h</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.visits24h}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stats.uniqueVisitors24h} unique visitors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Top countries</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topCountries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {stats.topCountries.map((c) => (
                  <li key={c.country} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <CountryFlag code={c.country} /> {countryCodeToName(c.country)}
                    </span>
                    <span className="text-muted-foreground">{c.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {stats.deviceBreakdown.length > 0 ? (
        <section className="flex flex-wrap gap-3">
          {stats.deviceBreakdown.map((d) => (
            <Badge key={d.deviceType} variant="secondary" className="capitalize">
              {d.deviceType}: {d.count}
            </Badge>
          ))}
        </section>
      ) : null}

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Country:</span>
          <Link
            href={buildHref("country", null)}
            className={`rounded-full border px-3 py-1 text-xs ${!params.country ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
          >
            All
          </Link>
          {countries.map((c) => (
            <Link
              key={c}
              href={buildHref("country", c)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${params.country === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
            >
              <CountryFlag code={c} /> {c}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Device:</span>
          <Link
            href={buildHref("deviceType", null)}
            className={`rounded-full border px-3 py-1 text-xs ${!params.deviceType ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
          >
            All
          </Link>
          {deviceTypes.map((d) => (
            <Link
              key={d}
              href={buildHref("deviceType", d)}
              className={`rounded-full border px-3 py-1 text-xs capitalize ${params.deviceType === d ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
            >
              {d}
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity log</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No visitor activity matches these filters yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-2 py-2 font-medium">Time</th>
                    <th className="px-2 py-2 font-medium">Activity</th>
                    <th className="px-2 py-2 font-medium">Device</th>
                    <th className="px-2 py-2 font-medium">Browser / OS</th>
                    <th className="px-2 py-2 font-medium">Location</th>
                    <th className="px-2 py-2 font-medium">IP address</th>
                    <th className="px-2 py-2 font-medium">IP reputation</th>
                    <th className="px-2 py-2 font-medium">Referrer</th>
                    <th className="px-2 py-2 font-medium">User</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-border/60 align-top">
                      <td className="whitespace-nowrap px-2 py-2 text-xs text-muted-foreground">
                        {row.createdAt.toLocaleString()}
                      </td>
                      <td className="px-2 py-2">
                        <p className="font-medium text-foreground">{row.action}</p>
                        <p className="max-w-[220px] truncate text-xs text-muted-foreground" title={row.path}>
                          {row.path}
                        </p>
                      </td>
                      <td className="px-2 py-2">
                        <Badge variant="outline" className="capitalize">
                          {row.deviceType ?? "unknown"}
                        </Badge>
                      </td>
                      <td className="px-2 py-2 text-xs text-muted-foreground">
                        {row.browser ?? "Unknown"} · {row.os ?? "Unknown"}
                      </td>
                      <td className="px-2 py-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <CountryFlag code={row.country} />
                          <span>
                            {countryCodeToName(row.country)}
                            {row.city ? ` · ${row.city}` : ""}
                            {row.region && !row.city ? ` · ${row.region}` : ""}
                          </span>
                        </span>
                      </td>
                      <td className="px-2 py-2 font-mono text-xs text-muted-foreground">{row.ipAddress ?? "—"}</td>
                      <td className="px-2 py-2">
                        {row.ipAddress ? <IpReputationBadge reputation={row.reputation} /> : "—"}
                      </td>
                      <td className="max-w-[160px] truncate px-2 py-2 text-xs text-muted-foreground" title={row.referrer ?? undefined}>
                        {row.referrer ?? "Direct"}
                      </td>
                      <td className="px-2 py-2 text-xs text-muted-foreground">{row.userId ? "Signed in" : "Guest"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          render={<Link href={buildHref("page", String(Math.max(1, page - 1)))} />}
          nativeButton={false}
        >
          Previous
        </Button>
        <p className="text-xs text-muted-foreground">Page {page}</p>
        <Button
          variant="outline"
          size="sm"
          disabled={rows.length < pageSize}
          render={<Link href={buildHref("page", String(page + 1))} />}
          nativeButton={false}
        >
          Next
        </Button>
      </div>
    </main>
  )
}
