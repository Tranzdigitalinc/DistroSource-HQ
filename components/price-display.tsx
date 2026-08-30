"use client"

import { useCurrency } from "@/lib/currency-context"
import { formatLocal, formatUsd } from "@/lib/format"
import { cn } from "@/lib/utils"

export function PriceDisplay({
  usdAmount,
  className,
  showUsdSuffix = false,
}: {
  usdAmount: number | string
  className?: string
  showUsdSuffix?: boolean
}) {
  const { selected } = useCurrency()

  if (!selected || selected.currencyCode === "USD") {
    return <span className={className}>{formatUsd(usdAmount)}</span>
  }

  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      {formatLocal(usdAmount, selected.usdToLocalRate, selected.currencySymbol)}
      {showUsdSuffix && <span className="text-xs text-muted-foreground">({formatUsd(usdAmount)})</span>}
    </span>
  )
}
