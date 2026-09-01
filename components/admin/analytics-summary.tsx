import { count, desc, eq, sql } from "drizzle-orm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { operationEvents, orders } from "@/lib/db/schema"

export async function AnalyticsSummary() {
  const [orderStats, openEvents] = await Promise.all([
    db.select({ count: count(), revenue: sql<string>`coalesce(sum(${orders.totalUsd}), 0)` }).from(orders),
    db.select({ count: count() }).from(operationEvents).where(eq(operationEvents.status, "open")),
  ])
  const stats = orderStats[0]
  return (
    <section aria-labelledby="analytics-title" className="grid gap-4 sm:grid-cols-3">
      <h2 id="analytics-title" className="sr-only">Store analytics</h2>
      <Card><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{stats?.count ?? 0}</p></CardContent></Card>
      <Card><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Gross revenue</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">${Number(stats?.revenue ?? 0).toFixed(2)}</p></CardContent></Card>
      <Card><CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Open events</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{openEvents[0]?.count ?? 0}</p></CardContent></Card>
    </section>
  )
}
