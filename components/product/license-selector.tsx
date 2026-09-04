"use client"

import Link from "next/link"
import { Check } from "@/lib/storefront-icons"
import { PriceDisplay } from "@/components/price-display"
import { licenseLabel, licenseSummary, sortLicenses } from "@/lib/licenses"
import { cn } from "@/lib/utils"

export interface LicenseOption {
  id: number
  licenseType: string
  price: string
  description?: string | null
}

/**
 * The one licence picker used everywhere a customer chooses a tier: product
 * page, quick preview and the cart's "Change licence" popover. Controlled,
 * keyboard-navigable radio group; prices are display-only (the server
 * re-prices every line at checkout).
 */
export function LicenseSelector({
  licenses,
  value,
  onChange,
  compact = false,
  showCompareLink = true,
  className,
}: {
  licenses: LicenseOption[]
  value: number | undefined
  onChange: (id: number) => void
  /** Tighter rows for popovers and drawers. */
  compact?: boolean
  showCompareLink?: boolean
  className?: string
}) {
  const options = sortLicenses(licenses)

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key)) return
    e.preventDefault()
    const idx = Math.max(0, options.findIndex((o) => o.id === value))
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1
    const next = options[(idx + dir + options.length) % options.length]
    onChange(next.id)
    const el = (e.currentTarget as HTMLElement).querySelector<HTMLElement>(`[data-license-id="${next.id}"]`)
    el?.focus()
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {showCompareLink && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Licence</span>
          <Link href="/licenses" className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Compare licences
          </Link>
        </div>
      )}
      <div role="radiogroup" aria-label="Licence tier" onKeyDown={onKeyDown} className={cn("flex flex-col", compact ? "gap-1.5" : "gap-2")}>
        {options.map((license) => {
          const selected = license.id === value
          return (
            <button
              key={license.id}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected || (value === undefined && license === options[0]) ? 0 : -1}
              data-license-id={license.id}
              onClick={() => onChange(license.id)}
              className={cn(
                "group flex w-full items-start gap-3 rounded-md border text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                compact ? "px-2.5 py-2" : "px-3 py-2.5",
                selected ? "border-primary bg-primary/5" : "border-border hover:border-border-strong",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                  selected ? "border-primary bg-primary text-primary-foreground" : "border-border-strong",
                )}
              >
                {selected && <Check size={10} strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">{licenseLabel(license.licenseType)}</span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                    <PriceDisplay usdAmount={Number.parseFloat(license.price)} />
                  </span>
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                  {licenseSummary(license.licenseType, license.description)}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
