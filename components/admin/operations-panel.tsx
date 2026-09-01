import { getOperationEvents, resolveOperationEvent } from "@/lib/actions/operations"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export async function OperationsPanel() {
  const events = await getOperationEvents()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Operations queue</CardTitle>
        <CardDescription>Recent order, fulfillment, fraud, and sync events.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {events.length === 0 ? <p className="text-sm text-muted-foreground">No operation events yet.</p> : events.map((event) => (
          <div key={event.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{event.eventType} · {event.entityType}{event.entityId ? ` #${event.entityId}` : ""}</p>
              <p className="text-xs text-muted-foreground">{event.createdAt.toLocaleString()}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={event.status === "open" ? "destructive" : "secondary"}>{event.status}</Badge>
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
