import Link from "next/link"
import { getFraudQueue } from "@/lib/actions/order-management"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export async function FraudQueuePanel() {
  const events = await getFraudQueue()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fraud review queue</CardTitle>
        <CardDescription>Orders manually flagged for review. Clear a flag from the order detail page.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders are currently flagged.</p>
        ) : (
          events.map((event) => {
            const payload = event.payload as { orderNumber?: string; note?: string } | null
            return (
              <div key={event.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">Order {payload?.orderNumber ?? event.entityId}</p>
                  {payload?.note ? <p className="truncate text-xs text-muted-foreground">{payload.note}</p> : null}
                  <p className="text-xs text-muted-foreground">Flagged {event.createdAt.toLocaleString()}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="destructive">Flagged</Badge>
                  {payload?.orderNumber ? (
                    <Button size="sm" variant="outline" render={<Link href={`/admin/orders/${payload.orderNumber}`} />}>
                      Review
                    </Button>
                  ) : null}
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
