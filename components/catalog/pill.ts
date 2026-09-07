import { cn } from "@/lib/utils"

/** The one pill style for category filters and sibling navigation. Server-safe. */
export const pillClass = (active: boolean) =>
  cn(
    "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground",
  )
