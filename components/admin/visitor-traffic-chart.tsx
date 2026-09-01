"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig: ChartConfig = {
  count: {
    label: "Page views",
    color: "var(--chart-1)",
  },
  uniqueVisitors: {
    label: "Unique visitors",
    color: "var(--chart-2)",
  },
}

export function VisitorTrafficChart({
  series,
}: {
  series: { day: string; count: number; uniqueVisitors: number }[]
}) {
  const data = series.map((s) => ({
    ...s,
    label: new Date(`${s.day}T00:00:00.000Z`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Traffic · last 14 days</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
          <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillUnique" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-uniqueVisitors)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-uniqueVisitors)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={32} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="count"
              type="monotone"
              fill="url(#fillCount)"
              stroke="var(--color-count)"
              strokeWidth={2}
            />
            <Area
              dataKey="uniqueVisitors"
              type="monotone"
              fill="url(#fillUnique)"
              stroke="var(--color-uniqueVisitors)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
