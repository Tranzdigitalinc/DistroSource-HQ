import { formatUsd } from "@/lib/format"
import { cn } from "@/lib/utils"

export function PriceDisplay({
  usdAmount,
  className,
}: {
  usdAmount: number | string
  className?: string
}) {
  return <span className={cn("inline-flex items-baseline gap-1", className)}>{formatUsd(usdAmount)}</span>
}
