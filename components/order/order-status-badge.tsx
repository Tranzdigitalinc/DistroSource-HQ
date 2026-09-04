import { cn } from "@/lib/utils"

/**
 * One source of truth for order status presentation. Colours are restrained
 * on purpose: only a completed order reads as "good", only a refund reads as
 * "reversed"; everything in between stays neutral so a pending state never
 * looks like an error.
 */
const STATUS: Record<string, { label: string; className: string }> = {
  completed: { label: "Completed", className: "border-success/30 bg-success/10 text-success" },
  pending_payment: { label: "Pending payment", className: "border-border bg-secondary text-muted-foreground" },
  processing: { label: "Processing", className: "border-border bg-secondary text-muted-foreground" },
  refunded: { label: "Refunded", className: "border-border bg-secondary text-foreground" },
  partially_refunded: { label: "Partially refunded", className: "border-border bg-secondary text-foreground" },
  expired: { label: "Expired", className: "border-border bg-secondary text-muted-foreground" },
  canceled: { label: "Canceled", className: "border-border bg-secondary text-muted-foreground" },
  cancelled: { label: "Canceled", className: "border-border bg-secondary text-muted-foreground" },
  failed: { label: "Failed", className: "border-destructive/30 bg-destructive/10 text-destructive" },
}

export function OrderStatusBadge({ status, className }: { status: string; className?: string }) {
  const meta = STATUS[status] ?? { label: status.replace(/_/g, " "), className: "border-border bg-secondary text-muted-foreground" }
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em]",
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  )
}
