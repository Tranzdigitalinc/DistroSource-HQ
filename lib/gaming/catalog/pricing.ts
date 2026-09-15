import type { GamingPricing, GamingProduct } from "@/lib/gaming/catalog/types"

/**
 * Pricing helpers. Pure functions, safe in client components.
 *
 * Savings are always derived from the two prices and rounded down, so the
 * storefront can never show a saving larger than the real one.
 */

export function isRecurring(product: Pick<GamingProduct, "pricing">): boolean {
  return product.pricing.kind === "subscription"
}

/** The headline number: the one-time price, or the monthly price. */
export function listPrice(pricing: GamingPricing): number {
  return pricing.kind === "one-time" ? pricing.price : pricing.monthly
}

export interface AnnualSaving {
  /** Twelve monthly payments. */
  full: number
  /** The annual price. */
  annual: number
  /** Annual price spread per month, for comparison only. */
  perMonth: number
  /** Whole-percent saving, rounded down. */
  percent: number
  /** Money saved against twelve monthly payments. */
  amount: number
}

export function annualSaving(pricing: GamingPricing): AnnualSaving | null {
  if (pricing.kind !== "subscription" || !pricing.annual) return null
  const full = Math.round(pricing.monthly * 12 * 100) / 100
  if (pricing.annual >= full) return null
  const amount = Math.round((full - pricing.annual) * 100) / 100
  return {
    full,
    annual: pricing.annual,
    perMonth: Math.round((pricing.annual / 12) * 100) / 100,
    percent: Math.floor((amount / full) * 100),
    amount,
  }
}

/** "$19" for whole dollars, "$19.50" otherwise. */
export function formatGamingPrice(value: number): string {
  const whole = Number.isInteger(value)
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 })}`
}

/** Card/listing price label: "$19/mo" or "$29". */
export function priceLabel(pricing: GamingPricing): string {
  return pricing.kind === "subscription" ? `${formatGamingPrice(pricing.monthly)}/mo` : formatGamingPrice(pricing.price)
}
