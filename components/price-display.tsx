"use client"

import { useCurrency } from "@/lib/currency-context"
import { formatLocal, formatUsd } from "@/lib/format"
import { cn } from "@/lib/utils"

export function PriceDisplay({
  usdValue,
  className,
  showUsdSuffix = false,
}: {
  usdValue: number | string
  className?: string
  showUsdSuffix?: boolean
}) {
  const { selected } = useCurrency()

  if (!selected || selected.currencyCode === "USD") {
    return <span className={className}>{formatUsd(usdValue)}</span>
  }

  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      {formatLocal(usdValue, selected.usdToLocalRate, selected.currencySymbol)}
      {showUsdSuffix && <span className="text-xs text-muted-foreground">({formatUsd(usdValue)})</span>}
    </span>
  )
}
