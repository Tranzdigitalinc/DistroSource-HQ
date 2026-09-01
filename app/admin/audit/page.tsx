import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { getOperationEventsFiltered } from "@/lib/actions/operations"
import { isRetryableEvent } from "@/lib/retryable-events"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RetryEventButton } from "@/components/admin/retry-event-button"

export const metadata = {
  title: "Audit log | RedeemCove Admin",
  description: "Full operations and audit event history for RedeemCove.",
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; eventType?: string; page?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  const userEmail = session?.user?.email?.trim().toLowerCase()
  if (!session?.user) redirect("/sign-in?next=/admin/audit")
  if (userEmail !== "info@corevalleyjo.com") redirect("/")

  const params = await searchParams
  const page = params.page ? Number.parseInt(params.page, 10) : 1
  const { rows, eventTypes, pageSize } = await getOperationEventsFiltered({
    status: params.status,
    eventType: params.eventType,
    page,
  })

  function buildHref(key: string, value: string | null) {
    const next = new URLSearchParams()
    if (params.status && key !== "status") next.set("status", params.status)
    if (params.eventType && key !== "eventType") next.set("eventType", params.eventType)
    if (value) next.set(key, value)
    const qs = next.toString()
    return `/admin/audit${qs ? `?${qs}` : ""}`
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Administration</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">Audit log</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Full history of order, fulfillment, fraud, sync, and checkout events.
          </p>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/admin" />}>
          Back to control center
        </Button>
      </header>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Status:</span>
          <Link href={buildHref("status", null)} className={`rounded-full border px-3 py-1 text-xs ${!params.status ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
            All
          </Link>
          <Link href={buildHref("status", "open")} className={`rounded-full border px-3 py-1 text-xs ${params.status === "open" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
            Open
          </Link>
          <Link href={buildHref("status", "resolved")} className={`rounded-full border px-3 py-1 text-xs ${params.status === "resolved" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
            Resolved
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Type:</span>
          <Link href={buildHref("eventType", null)} className={`rounded-full border px-3 py-1 text-xs ${!params.eventType ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
            All
          </Link>
          {eventTypes.map((type) => (
            <Link key={type} href={buildHref("eventType", type)} className={`rounded-full border px-3 py-1 text-xs ${params.eventType === type ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
              {type}
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events match these filters.</p>
          ) : (
            rows.map((event) => (
              <div key={event.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {event.eventType} · {event.entityType}
                    {event.entityId ? ` #${event.entityId}` : ""}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant={event.status === "open" ? "destructive" : "secondary"}>{event.status}</Badge>
                    {event.status === "open" && isRetryableEvent(event.eventType) ? <RetryEventButton eventId={event.id} /> : null}
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Created {event.createdAt.toLocaleString()}
                  {event.resolvedAt ? ` · Resolved ${event.resolvedAt.toLocaleString()}` : ""}
                  {event.createdBy ? ` · By ${event.createdBy}` : ""}
                </p>
                {event.payload ? (
                  <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-secondary/40 p-2 text-xs text-muted-foreground">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          render={<Link href={buildHref("page", String(Math.max(1, page - 1)))} />}
        >
          Previous
        </Button>
        <p className="text-xs text-muted-foreground">Page {page}</p>
        <Button
          variant="outline"
          size="sm"
          disabled={rows.length < pageSize}
          render={<Link href={buildHref("page", String(page + 1))} />}
        >
          Next
        </Button>
      </div>
    </main>
  )
}
