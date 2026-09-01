import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { getVisitorLogsFiltered, getVisitorStats, getVisitorTrafficSeries } from "@/lib/actions/visitor-logs"
import { countryCodeToName } from "@/lib/user-agent"
import { IpReputationBadge } from "@/components/admin/ip-reputation-badge"
import { CountryFlag } from "@/components/admin/country-flag"
import { VisitorTrafficChart } from "@/components/admin/visitor-traffic-chart"
import { ReferrerBreakdownCard } from "@/components/admin/referrer-breakdown-card"
import { isAdminEmail } from "@/lib/admin-emails"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const metadata = {
  title: "Visitors | RedeemCove Admin",
  description: "Live log of website visitor activity, devices, and locations.",
}

type VisitorsSearchParams = {
  country?: string
  deviceType?: string
  page?: string
  search?: string
  from?: string
  to?: string
}

export default async function AdminVisitorsPage({
  searchParams,
}: {
  searchParams: Promise<VisitorsSearchParams>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in?next=/admin/visitors")
  if (!isAdminEmail(session.user.email)) redirect("/")

  const params = await searchParams
  const page = params.page ? Number.parseInt(params.page, 10) : 1
  const [{ rows, countries, deviceTypes, pageSize }, stats, traffic] = await Promise.all([
    getVisitorLogsFiltered({
      country: params.country,
      deviceType: params.deviceType,
      page,
      search: params.search,
      from: params.from,
      to: params.to,
    }),
    getVisitorStats(),
    getVisitorTrafficSeries(14),
  ])

  function buildHref(key: string, value: string | null) {
    const next = new URLSearchParams()
    if (params.country && key !== "country") next.set("country", params.country)
    if (params.deviceType && key !== "deviceType") next.set("deviceType", params.deviceType)
    if (params.search && key !== "search") next.set("search", params.search)
    if (params.from && key !== "from") next.set("from", params.from)
    if (params.to && key !== "to") next.set("to", params.to)
    if (value) next.set(key, value)
    const qs = next.toString()
    return `/admin/visitors${qs ? `?${qs}` : ""}`
  }

  const hasActiveFilters = Boolean(params.country || params.deviceType || params.search || params.from || params.to)

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

      <section aria-labelledby="visitor-trends-title" className="grid gap-4 lg:grid-cols-3">
        <h2 id="visitor-trends-title" className="sr-only">
          Traffic trends
        </h2>
        <div className="lg:col-span-2">
          <VisitorTrafficChart series={traffic.series} />
        </div>
        <ReferrerBreakdownCard referrers={traffic.referrers} />
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

      <form action="/admin/visitors" method="get" className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="search" className="text-xs font-medium text-muted-foreground">
            Search
          </label>
          <Input
            id="search"
            name="search"
            defaultValue={params.search ?? ""}
            placeholder="IP, path, or visitor ID"
            className="w-56"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="from" className="text-xs font-medium text-muted-foreground">
            From
          </label>
          <Input id="from" name="from" type="date" defaultValue={params.from ?? ""} className="w-36" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="to" className="text-xs font-medium text-muted-foreground">
            To
          </label>
          <Input id="to" name="to" type="date" defaultValue={params.to ?? ""} className="w-36" />
        </div>
        {params.country ? <input type="hidden" name="country" value={params.country} /> : null}
        {params.deviceType ? <input type="hidden" name="deviceType" value={params.deviceType} /> : null}
        <Button type="submit" size="sm">
          Apply
        </Button>
        {hasActiveFilters ? (
          <Button variant="outline" size="sm" render={<Link href="/admin/visitors" />} nativeButton={false}>
            Clear all filters
          </Button>
        ) : null}
      </form>

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
              <table className="w-full min-w-[1180px] border-collapse text-sm">
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
                    <th className="px-2 py-2 font-medium">Session</th>
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
                      <td className="px-2 py-2">
                        <Link
                          href={`/admin/visitors/${row.visitorId}`}
                          className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                        >
                          View session
                        </Link>
                      </td>
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
