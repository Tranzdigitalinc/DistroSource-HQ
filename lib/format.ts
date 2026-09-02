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
