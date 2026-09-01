import Link from "next/link"
import { getOperationEvents, resolveOperationEvent } from "@/lib/actions/operations"
import { isRetryableEvent } from "@/lib/retryable-events"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RetryEventButton } from "@/components/admin/retry-event-button"

export async function OperationsPanel() {
  const events = await getOperationEvents()
  const openCount = events.filter((event) => event.status === "open").length
  const resolvedCount = events.filter((event) => event.status === "resolved").length
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Operations queue</CardTitle>
          <CardDescription>Recent order, fulfillment, fraud, and sync events.</CardDescription>
        </div>
        <Button variant="ghost" size="sm" render={<Link href="/admin/audit" />} nativeButton={false}>
          View full audit log
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3" aria-label="Operations summary">
          <div className="rounded-lg border border-border bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Open</p><p className="mt-1 font-display text-2xl font-semibold text-destructive">{openCount}</p></div>
          <div className="rounded-lg border border-border bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Resolved</p><p className="mt-1 font-display text-2xl font-semibold text-primary">{resolvedCount}</p></div>
        </div>
        {events.length === 0 ? <p className="text-sm text-muted-foreground">No operation events yet.</p> : events.map((event) => (
          <div key={event.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{event.eventType} · {event.entityType}{event.entityId ? ` #${event.entityId}` : ""}</p>
              <p className="text-xs text-muted-foreground">{event.createdAt.toLocaleString()}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={event.status === "open" ? "destructive" : "secondary"}>{event.status}</Badge>
              {event.status === "open" && isRetryableEvent(event.eventType) ? <RetryEventButton eventId={event.id} /> : null}
              {event.status === "open" ? (
                <form action={resolveOperationEvent.bind(null, event.id)}>
                  <Button type="submit" size="sm" variant="outline">Resolve</Button>
                </form>
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
