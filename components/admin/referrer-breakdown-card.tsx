import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ReferrerBreakdownCard({ referrers }: { referrers: { source: string; count: number }[] }) {
  const total = referrers.reduce((sum, r) => sum + r.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Traffic sources</CardTitle>
      </CardHeader>
      <CardContent>
        {referrers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {referrers.map((r) => {
              const pct = total > 0 ? Math.round((r.count / total) * 100) : 0
              return (
                <li key={r.source} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate text-foreground">{r.source}</span>
                    <span className="text-muted-foreground">
                      {r.count} <span className="text-xs">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
