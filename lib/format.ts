export function formatUsd(value: number | string): string {
  const n = typeof value === "string" ? Number.parseFloat(value) : value
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatLocal(usdValue: number | string, rate: number | string, symbol: string): string {
  const n = typeof usdValue === "string" ? Number.parseFloat(usdValue) : usdValue
  const r = typeof rate === "string" ? Number.parseFloat(rate) : rate
  const local = n * r
  const decimals = local >= 1000 ? 0 : 2
  return `${symbol}${local.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

export function generateOrderNumber(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  const ts = Date.now().toString(36).toUpperCase().slice(-4)
  return `DS-${ts}${rand}`
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  distrosource_original: "DistroSource Original",
  verified_creator: "Verified Creator",
  licensed_supplier: "Licensed Supplier",
  external_affiliate: "Affiliate Partner",
}

// The user-facing label for a product's sourceType — keep this the single
// source of truth so the wording stays consistent everywhere it appears
// (product cards, product page, cart, etc).
export function getSourceTypeLabel(sourceType: string): string {
  return SOURCE_TYPE_LABELS[sourceType] ?? "DistroSource Original"
}

export function formatLicenseType(licenseType: string): string {
  return licenseType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(d)
}
