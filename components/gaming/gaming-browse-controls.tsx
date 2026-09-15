"use client"

import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ChevronDown, Filter } from "@/lib/storefront-icons"

/** Sort control. Hrefs are computed on the server so the client holds no filter logic. */
export function GamingSortSelect({ value, options }: { value: string; options: { id: string; label: string; href: string }[] }) {
  const router = useRouter()
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Sort products</span>
      <select
        value={value}
        onChange={(e) => {
          const next = options.find((o) => o.id === e.target.value)
          if (next) router.push(next.href, { scroll: false })
        }}
        className="h-10 appearance-none rounded-lg border border-border bg-card pl-3 pr-9 text-sm font-medium text-foreground outline-none transition-colors hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 text-muted-foreground" aria-hidden="true" />
    </label>
  )
}

/** Filter drawer for phones and tablets; the panel itself is server-rendered and passed in. */
export function GamingFilterSheet({ activeCount, children }: { activeCount: number; children: ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" className="h-10 gap-2 bg-card font-semibold lg:hidden" />}>
        <Filter size={16} aria-hidden="true" />
        Filters
        {activeCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary font-mono text-[11px] font-bold text-primary-foreground">{activeCount}</span>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="font-display text-lg font-bold">Filters</SheetTitle>
          <SheetDescription>Every option shows how many products it leads to.</SheetDescription>
        </SheetHeader>
        <div className="px-3 pb-8">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
